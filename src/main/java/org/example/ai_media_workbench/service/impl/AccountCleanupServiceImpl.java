package org.example.ai_media_workbench.service.impl;

import org.example.ai_media_workbench.entity.AccountCleanupJobEntity;
import org.example.ai_media_workbench.mapper.AccountCleanupMapper;
import org.example.ai_media_workbench.service.AccountCleanupService;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountCleanupServiceImpl implements AccountCleanupService {
    private static final Logger log = LoggerFactory.getLogger(AccountCleanupServiceImpl.class);
    private final AccountCleanupMapper mapper;
    private final Clock clock;
    private final Path storageRoot;
    private final boolean enabled;

    public AccountCleanupServiceImpl(AccountCleanupMapper mapper, Clock clock,
            @Value("${app.storage.root:./storage}") String storageRoot,
            @Value("${app.account-cleanup.enabled:true}") boolean enabled) {
        this.mapper = mapper;
        this.clock = clock;
        this.storageRoot = Path.of(storageRoot).toAbsolutePath().normalize();
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void enqueue(String userId) {
        var job = new AccountCleanupJobEntity();
        job.setId(UUID.randomUUID().toString());
        job.setUserId(userId);
        job.setStatus("QUEUED");
        job.setCreatedAt(now());
        job.setUpdatedAt(now());
        job.setNextAttemptAt(now());
        mapper.insertJob(job);
    }

    @Scheduled(fixedDelayString = "${app.account-cleanup.interval-ms:5000}")
    public void scheduledRun() {
        if (enabled) runPending();
    }

    @Override
    public int runPending() {
        mapper.recoverExpired(now().minusMinutes(5), now());
        int completed = 0;
        for (var job : mapper.findPending(now())) {
            if (mapper.claim(job.getId(), now()) != 1) continue;
            try {
                if (mapper.isDeletedAccount(job.getUserId()) != 1) {
                    throw new IOException("Account is not deleted");
                }
                for (String key : mapper.findStorageKeys(job.getUserId())) {
                    deleteControlledFile(key);
                }
                mapper.complete(job.getId(), now());
                completed++;
            } catch (IOException | RuntimeException exception) {
                mapper.fail(job.getId(), now(), now().plusSeconds(60L * (job.getAttempts() + 1)));
                log.warn("Account cleanup job {} failed: {}", job.getId(), exception.getClass().getSimpleName());
            }
        }
        return completed;
    }

    private void deleteControlledFile(String storageKey) throws IOException {
        if (storageKey == null || storageKey.isBlank()) throw new IOException("Invalid storage key");
        Files.createDirectories(storageRoot);
        Path realRoot = storageRoot.toRealPath();
        Path target = realRoot.resolve(storageKey).normalize();
        if (target.equals(realRoot) || !target.startsWith(realRoot)) {
            throw new IOException("Storage key outside root");
        }
        Path parent = target.getParent();
        if (!Files.exists(parent)) return;
        if (!parent.toRealPath().startsWith(realRoot)) throw new IOException("Parent outside root");
        if (!Files.exists(target, LinkOption.NOFOLLOW_LINKS)) return;
        if (!Files.isRegularFile(target, LinkOption.NOFOLLOW_LINKS) && !Files.isSymbolicLink(target)) {
            throw new IOException("Expected a file");
        }
        Files.deleteIfExists(target);
    }

    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }
}
