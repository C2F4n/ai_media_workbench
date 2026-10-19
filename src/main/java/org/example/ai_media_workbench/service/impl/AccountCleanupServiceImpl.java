package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.entity.AccountCleanupJobEntity;
import org.example.ai_media_workbench.mapper.AccountCleanupMapper;
import org.example.ai_media_workbench.service.AccountCleanupService;
import org.example.ai_media_workbench.properties.StorageProperties;
import org.example.ai_media_workbench.properties.AccountCleanupProperties;
import org.example.ai_media_workbench.properties.MediaToolProperties;
import org.example.ai_media_workbench.properties.TranscodeProperties;
import org.example.ai_media_workbench.common.storage.LocalMediaStorage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 复用持久化队列清理已注销账号或单个已删除素材；业务事务只入队，磁盘清理失败可重试。 */
@Service
public class AccountCleanupServiceImpl implements AccountCleanupService {
    private static final Logger log = LoggerFactory.getLogger(AccountCleanupServiceImpl.class);
    private final AccountCleanupMapper mapper;
    private final Clock clock;
    private final Path storageRoot;
    private final AccountCleanupProperties properties;
    private final MediaToolProperties mediaTool;
    private final TranscodeProperties transcode;

    public AccountCleanupServiceImpl(AccountCleanupMapper mapper, Clock clock,
                                     StorageProperties storageProperties, AccountCleanupProperties properties,
                                     MediaToolProperties mediaTool, TranscodeProperties transcode) {
        this.mapper = mapper;
        this.clock = clock;
        this.storageRoot = Path.of(storageProperties.root()).toAbsolutePath().normalize();
        this.properties = properties;
        this.mediaTool = mediaTool;
        this.transcode = transcode;
    }

    /** 将指定用户的文件清理任务保存到数据库。 */
    @Override
    @Transactional
    public void enqueue(String userId) {
        enqueue(userId, null, now());
    }

    @Override
    @Transactional
    public void enqueueMedia(String userId, String mediaId) {
        LocalDateTime ready = now();
        var probing = mapper.mediaProbeStarted(userId, mediaId);
        var running = mapper.latestMediaTaskLease(userId, mediaId);
        // 逻辑删除阻止后续执行/发布；等旧进程的租约结束，避免过早删除后旧工具再写入文件。
        if (probing != null && probing.plus(mediaTool.lease()).isAfter(ready)) ready = probing.plus(mediaTool.lease());
        if (running != null && running.plus(transcode.lease()).isAfter(ready)) ready = running.plus(transcode.lease());
        enqueue(userId, mediaId, ready);
    }

    private void enqueue(String userId, String mediaId, LocalDateTime ready) {
        var job = new AccountCleanupJobEntity();
        job.setId(UUID.randomUUID().toString());
        job.setUserId(userId);
        job.setMediaId(mediaId);
        job.setScopeKey(mediaId == null ? "ACCOUNT" : mediaId);
        job.setStatus("QUEUED");
        job.setCreatedAt(now());
        job.setUpdatedAt(now());
        job.setNextAttemptAt(ready);
        mapper.insertJob(job);
    }

    /** 按配置定时触发文件清理。 */
    @Scheduled(fixedDelayString = "${app.account-cleanup.interval-ms:5000}")
    public void scheduledRun() {
        if (properties.enabled()) runPending();
    }

    /** 处理一批清理任务并安排失败重试，返回完成数。 */
    @Override
    public int runPending() {
        // 回收因进程退出等原因卡在 RUNNING 超过 5 分钟的任务；每批最多 10 个，最多尝试 5 次（见 XML）。
        mapper.recoverExpired(now().minusMinutes(5), now());
        int completed = 0;
        for (var job : mapper.findPending(now())) {
            // 条件更新抢占任务；只有成功把待处理状态改为 RUNNING 的执行者才处理本轮任务。
            if (mapper.claim(job.getId(), now()) != 1) continue;
            try {
                boolean account = job.getMediaId() == null;
                if ((account ? mapper.isDeletedAccount(job.getUserId())
                        : mapper.isDeletedMedia(job.getUserId(), job.getMediaId())) != 1)
                    throw new IOException("Cleanup scope is not deleted");
                var keys = account ? mapper.findStorageKeys(job.getUserId())
                        : mapper.findMediaStorageKeys(job.getUserId(), job.getMediaId());
                for (String key : keys) {
                    deleteControlledFile(key);
                    // 运行中注销或进程中断可能留下未发布的输出和两遍编码缓存。
                    if (key.matches("[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}-[0-9a-fA-F-]{36}\\.mp4"))
                        for (String suffix : LocalMediaStorage.ENCODING_LOG_SUFFIXES) deleteControlledFile(key + suffix);
                }
                mapper.complete(job.getId(), now());
                completed++;
            } catch (IOException | RuntimeException exception) {
                // 定时任务没有 HTTP 请求，不能交给 ControllerAdvice；必须在此记录失败并安排重试。
                // 已删除的文件再次处理不会报错，因此部分成功后也可以重试；重试间隔随次数增加。
                mapper.fail(job.getId(), now(), now().plusSeconds(60L * (job.getAttempts() + 1)));
                log.warn("File cleanup job {} failed: {}", job.getId(), exception.getClass().getSimpleName());
            }
        }
        return completed;
    }

    /** 删除存储根目录内的指定文件，拒绝越界路径和目录。 */
    private void deleteControlledFile(String storageKey) throws IOException {
        if (storageKey == null || storageKey.isBlank()) throw new IOException("Invalid storage key");
        Files.createDirectories(storageRoot);
        Path realRoot = storageRoot.toRealPath();
        Path target = realRoot.resolve(storageKey).normalize();
        // 同时检查规范化路径和父目录真实路径，拒绝 ../ 越界及父目录符号链接指向根目录外。
        if (target.equals(realRoot) || !target.startsWith(realRoot)) {
            throw new IOException("Storage key outside root");
        }
        Path parent = target.getParent();
        if (!Files.exists(parent)) return;
        if (!parent.toRealPath().startsWith(realRoot)) throw new IOException("Parent outside root");
        if (!Files.exists(target, LinkOption.NOFOLLOW_LINKS)) return;
        // 只删单个文件或链接本身，不跟随最终链接，不递归删除目录。
        if (!Files.isRegularFile(target, LinkOption.NOFOLLOW_LINKS) && !Files.isSymbolicLink(target)) {
            throw new IOException("Expected a file");
        }
        Files.deleteIfExists(target);
    }

    /** 获取清理任务使用的当前 UTC 时间。 */
    private LocalDateTime now() {
        // 与 DATETIME(6) 对齐，避免纳秒舍入把“立即执行”写成略晚于当前时间。
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS);
    }
}
