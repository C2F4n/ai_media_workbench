/**
 * 轻量音视频工作台阅读入口。登录后直接使用工具，不创建项目；已实现账号、上传检测与删除、MP4转换、目标体积压缩和MP3音频提取。
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
 * 转换从 ProcessingController -> ProcessingService -> ProcessingMapper 阅读；TranscodeWorker负责后台执行与结果校验。
 * FfmpegMediaTranscoder只执行白名单参数；OutputController -> OutputService处理鉴权播放、Range与下载。
 * OperationParameters按operation区分转换、压缩与音频提取，VideoParameters仅定义视频专用字段。
 * CompressionBudget计算码率预算，两遍编码共用超时，输出再按实际字节数验收。
 * 音频提取独立检查MP3编码器，按首条音轨实际时长验收，不用视频时长补静音；结果复用鉴权、取消与清理。
 * 素材删除与方案执行共用账号锁，原子撤销关联资源并入清理队列；V7扩展现有队列的素材范围，不修改旧迁移。
 * Service中的事务不覆盖整个转码过程；后台失败持久化，文件清理用于补偿，不在实现类组装HTTP错误响应。
 * V5 将资源直接归属用户，legacy_project 仅保留历史数据，不参与新的上传或处理业务。
 */
package org.example.ai_media_workbench;
