/**
 * 轻量音视频工作台阅读入口。登录后直接使用工具，不创建项目；已实现账号、上传检测与删除、MP4转换、压缩、裁切、静音和MP3音频提取。
 *
 * <p>一次请求的主线：安全过滤器 -> Controller -> Service 接口 -> 实现类 -> Mapper -> 数据库。
 * 返回时由 Controller 将 Entity 转成 VO，再由 Result.success 包装，避免暴露敏感字段。
 * 业务失败向上抛出异常，由 common.exception 中的全局处理器统一返回 Result.error。
 *
 * <p>各目录职责：controller 接收 HTTP 请求；service 定义业务接口，service.impl 实现业务；
 * mapper 定义数据库操作，对应 resources/mapper 中的 SQL；dto 承接请求参数；entity 映射表记录；
 * vo 定义 Result.data 中的响应数据；config 组装框架组件，properties 绑定并校验配置值；
 * common.result 定义统一返回类；
 * common.exception 放异常及处理器；common 还包含安全、校验等公共能力。
 *
 * <p>建议先读 AuthController 的 register/login，再看 AuthServiceImpl、UserMapper.xml；
 * 接着读 LoginSessionManager、SecurityConfig 和 SessionExpirationFilter，理解会话建立、退出和每次请求校验。
 * 登录令牌不是 JWT，而是 Spring Session JDBC 管理的不透明会话 ID，由 AMW_SESSION Cookie 携带。
 * 数据库结构看 resources/db/migration；已执行的迁移不要改，后续结构变更新增版本文件。
 * 素材从 MediaController -> MediaService -> MediaMapper 阅读；后台检测看 MediaProbeWorker 和 FfprobeMediaProbe。
 * 原素材预览仅开放已检测兼容编码，MediaService再次检查归属、状态和受控文件，不按扩展名判断、不创建隐式转码。
 * common.web.MediaStreams共用原视频/结果播放的Range与下载响应；业务错误仍在发送文件前交由全局处理器返回Result。
 * 转换从 ProcessingController -> ProcessingService -> ProcessingMapper 阅读；TranscodeWorker负责后台执行与结果校验。
 * FfmpegMediaTranscoder只执行白名单参数；OutputController -> OutputService处理鉴权播放、Range与下载。
 * OperationParameters按operation区分转换、压缩、裁切、静音与音频提取，VideoParameters仅定义视频专用字段。
 * MuteParameters仅三个字段，固定移除全部音轨；生成后确认无音轨且时长/尺寸正常，失败不发布，不覆盖原素材。
 * TrimParameters对外仅五个字段，内部分辨率固定source；区间校验复用于入队和执行，输出按所选时长验收。
 * CompressionBudget计算码率预算，两遍编码共用超时，输出再按实际字节数验收。
 * 音频提取独立检查MP3编码器，按首条音轨实际时长验收，不用视频时长补静音；结果复用鉴权、取消与清理。
 * 素材删除与方案执行共用账号锁，原子撤销关联资源并入清理队列；V7扩展现有队列的素材范围，不修改旧迁移。
 * 单个结果删除保留原素材、方案和任务终态，仅从可用结果中移除；V8为同一队列增加独立OUTPUT范围。
 * Service中的事务不覆盖整个转码过程；后台失败持久化，文件清理用于补偿，不在实现类组装HTTP错误响应。
 * 字幕从TranscriptController -> TranscriptService -> TranscriptMapper阅读；V9保存识别原稿和不可变历史版本。
 * TranscriptionWorker与转换共享队列，使用临时16kHz单声道MP3调用腾讯/百炼；不持锁等待云端、不伪造字幕。
 * CloudSpeechRecognizer只访问官方域名，缺少凭据时关闭对应能力，取消/删除/过期运行不能发布迟到结果。
 * DeepSeekSubtitleCorrector只校对一段文字并返回瞬时建议，用户确认后仍通过版本PATCH保存；不执行模型指令。
 * OperationPlanner生成单步候选参数或固定补充问题；服务端再次白名单校验，READY方案仍需显式确认执行。
 * ProcessingServiceImpl在云端等待结束后才开启短事务，重新检查账号、素材和版本，拒绝删除后的迟到结果。
 * DeepSeekJsonClient共用固定官方域名、35秒超时及两个并发槽，不自动重试付费调用，不向日志输出正文或凭据。
 * CloudCredentialController -> CloudCredentialService -> CloudCredentialMapper管理个人/站点/停用来源，V10只保存AES-GCM密文。
 * CloudCredentialCipher的独立主密钥不入库；AAD绑定账号/供应商，密钥丢失拒绝解密，不自动重建或回退站点。
 * 云端适配器显式接收用户ID，单次调用取得不可变配置；后台识别按任务用户在执行时读取，秘密不写方案/任务/VO。
 * 个人字段不回显，省略保留旧值，版本防覆盖；删除设为停用、注销物理删除。能力接口登录后按用户计算并禁止缓存。
 * 找片段从TranscriptAnalysisController -> TranscriptAnalysisService -> TranscriptAnalyzer阅读，不新建索引或草稿表。
 * 模型仅选择真实字幕段ID；原文和时间由后端重建，调用前后核验最新字幕ID与版本，拒绝重识别的同版本旧稿。
 * 单次最多600段、128KiB字幕，超过明确拒绝，不截断；前端带入已有裁切页仍需用户确认执行。
 * BurnSubtitleParameters复用明确参数方案与任务；首次执行要求最新字幕ID/版本，入队后只读取不可变历史稿。
 * TranscodeWorker生成受控私有ASS，AssSubtitles只序列化固定样式和转义文字，渲染交给FFmpeg/libass。
 * 字幕辅助文件在发布前清除；清理失败保留租约，过期回收及资源清理覆盖ASS，不新增迁移或外部文件入口。
 * JoinClipsParameters复用方案/任务保存有序时间范围，无草稿表；最多20段、总计15分钟，入队后参数冻结。
 * FfmpegMediaTranscoder顺序处理受控临时片段并拼接，限制合计大小/共享时限；TranscodeWorker发布前清理辅助文件。
 * 有音轨源在选段缺失音频处补静音对齐，无音轨源不补；跨素材及拼接字幕重映射仍不支持。
 * V5 将资源直接归属用户，legacy_project 仅保留历史数据，不参与新的上传或处理业务。
 */
package org.example.ai_media_workbench;
