# AI音视频工作台

Java 21 / Spring Boot 4.0.8 / Gradle Wrapper 9.7.1 / MyBatis / MySQL 8。

## 当前基础

后端采用Controller -> Service接口 -> ServiceImpl -> Mapper。Controller通过构造器注入接口，由Spring注入实现；替换实现或使用测试替身不需要修改Controller，SQL集中在MyBatis XML中。当前仍为单模块应用，不为目录形式拆成多模块。

```text
src/main/java/org/example/ai_media_workbench/
  controller/       请求校验、调用Service接口、VO与Result响应
  service/          业务接口
  service/impl/     业务实现与事务
  mapper/           数据访问接口
  entity/           数据库实体
  entity/enums/     媒体、方案与任务状态
  dto/              请求参数与校验
  vo/               对外响应，不暴露密码哈希或存储路径
  config/           安全等框架组件的组装
  properties/       认证、存储、清理和媒体限制的配置绑定与启动校验
  common/result/    统一 Result<T> 响应
  common/exception/ 业务异常、错误码、全局处理器及安全错误输出
  common/web/       requestId
  common/security/ 会话创建/清除、请求身份校验与限流
  common/validation/ 参数校验
src/main/resources/
  mapper/           MyBatis XML
  db/migration/     Flyway版本化建表脚本
  static/           简易账户页面与本地图标资源
deploy/nginx/       本地Nginx代理配置
frontend/tests/     浏览器端到端测试
```

轻量工作台不提供项目创建或分类，登录后直接使用工具。当前41个已实现接口覆盖账号/邮箱验证、个人云端凭据、素材上传检测/预览/删除、转换/压缩/裁切/静音/MP3提取/字幕烧录/同源多段拼接、明确参数或DeepSeek自然语言生成的版本方案、任务/取消、结果播放/下载/删除、云端字幕识别/编辑/SRT/单句校对，以及按字幕找片段和片段建议。缺少邮件/云端配置时关闭对应调用，不模拟成功；已有账号可登录、已有方案可确认执行、已有字幕可编辑导出和本地烧录。跨素材、拼接字幕重映射和命名草稿管理尚未实现。

密码使用带随机盐的Argon2id哈希。登录令牌不是JWT，而是Spring Session JDBC管理的不透明会话ID，通过AMW_SESSION HttpOnly Cookie发送。会话及认证身份存入数据库，服务端检查会话、到期时间和账号状态，不依赖客户端自行判断令牌有效性；页面不读取令牌，也不将其保存到localStorage。退出撤销当前令牌，修改密码、退出全部设备与注销会撤销该用户全部令牌。CSRF令牌单独保护写请求，不是登录凭证，也不是JWT刷新令牌。

## 功能与API依赖

所有页面操作都使用本站后端接口；下表的“无需API”专指不需要第三方云端API或API Key，并非浏览器离线运行。FFmpeg/ffprobe运行在部署后端的机器上，远程部署时不是访客的电脑。

| 功能 | 实际依赖 | 第三方云端API |
| --- | --- | --- |
| 视频检测 | ffprobe | 无 |
| 格式/编码/分辨率转换、压缩、裁切、同源拼接、静音、音轨提取、组合导出 | FFmpeg / ffprobe | 无 |
| 语音转字幕 | 腾讯云录音极速版（16k_zh）或阿里云百炼Paraformer（paraformer-realtime-v2） | 语音识别ASR API，发送音轨 |
| 字幕文字校对 | DeepSeek Chat Completions | 文本对话API，仅发送选中句子 |
| 字幕编辑、版本、SRT导出 | 本站后端/数据库 | 无 |
| 已有字幕烧录 | FFmpeg / libass | 无，不要求重新识别 |
| AI处理要求生成方案 | DeepSeek Chat Completions；确认后由FFmpeg执行 | 文本对话API，发送要求及受控素材参数，不上传视频 |
| 按字幕内容检索、片段建议 | DeepSeek Chat Completions | 文本对话API，发送已保存的字幕及查找要求 |
| 登录、账号、素材/任务/结果管理 | 本站后端/数据库/磁盘 | 无AI API；注册验证邮件另依赖SMTP |

工作台左侧功能栏标注本地/云端/混合，每页列出服务类型、配置状态和云端配置入口。已配置只表示凭据及本机前置工具满足声明，不代表网络、权限、余额或真实效果已验证；云端调用可能计费。

功能栏桌面默认固定，可用图标收起或取消固定；取消固定后以抽屉显示，选中功能自动收起。窄屏使用抽屉，支持遮罩关闭、Esc、焦点约束与焦点返回。浏览器localStorage只记录导航固定/展开偏好，不存凭据。工具切换及选中指示条支持上下滑动，遵守系统减少动态效果设置。无新接口、表或迁移。

## 统一响应与异常

所有业务JSON成功和失败响应统一使用Result<T>：code/message/data/requestId/details。成功code为SUCCESS，VO位于data；无业务数据时data为null，details为空数组。失败使用ErrorCode，data为null，字段校验错误写入details。requestId只在外层出现，并与X-Request-Id响应头一致。

Result提供三个静态工厂方法：success()、success(data)、error(errorCode, details...)。注册仍返回201；退出、全部设备退出、修改密码和账号注销改为200及Result.success()，不再返回204。错误保留400/401/403/409/422/429/500等真实HTTP状态码，不把失败伪装成200。

注册和改密的新密码长度为6-16个Unicode码点，允许字母、数字、符号，不强制字符类型组合；保留至少3种不同字符、非全空白和弱密码检查。登录和旧密码核验保留1-128字符以兼容历史长密码，不截断密码。Argon2id加盐哈希、CSRF和改密后撤销所有会话的行为不变。

Service返回业务数据或抛出异常，Controller使用Result.success包装。common.exception.GlobalExceptionHandler集中处理业务、校验、认证和数据库异常；ApiErrorWriter为进入Controller前发生的安全错误输出相同的Result.error，ApiExceptionController处理容器/error兜底。AuthServiceImpl不再用try-catch转换注册/登录错误；数据库唯一约束仍保证并发注册安全。后台清理定时任务没有HTTP上下文，保留try-catch记录失败并安排重试，不属于向前端返回异常结果。

页面公共请求入口统一读取Result.data，错误按Result.code处理。后续媒体预览、下载和SRT成功响应仍应保留原始文件流以支持播放器与Range，不包进JSON；这些请求在发送文件前发生的应用错误仍返回Result。静态资源和/actuator/health不属于业务JSON契约。

完整接口契约：[API.md](docs/api/API.md)，Apifox选择OpenAPI/Swagger导入[openapi.json](docs/api/openapi.json)。当前可用接口范围见API文档第一节。

Controller只负责HTTP请求和响应，不直接依赖Mapper或ServiceImpl。LoginSessionManager统一处理会话ID轮换、登录身份保存、绝对/空闲期限、CSRF轮换和当前请求退出；改密、账号注销等数据库业务仍在UserService实现中完成。SystemService负责能力查询，未实现能力继续返回false，不通过配置伪装已可用。

配置值统一放在properties包：AuthProperties、StorageProperties、AccountCleanupProperties、MediaProperties，由启动类集中扫描。空存储根目录、非正的限流次数/清理间隔/媒体限制、无效认证时长会在启动时被拒绝。默认上传1GiB、媒体时长15分钟，可通过MEDIA_MAX_UPLOAD_SIZE（例如512MB）、MEDIA_MAX_DURATION（例如10m）覆盖；capabilities与Servlet上传限制使用同一配置源。ACCOUNT_CLEANUP_ENABLED与ACCOUNT_CLEANUP_INTERVAL_MS控制定时清理；这些环境变量由部署环境提供，不把本机配置写入源码。

### 视频检测

安装FFmpeg并确保ffprobe在PATH中，或设置FFPROBE_PATH为可执行文件路径。该路径只由服务器配置，不来自上传请求。MediaToolProperties控制20秒进程超时、2分钟租约和1秒调度间隔。MEDIA_PROBE_WORKER_ENABLED可关闭调度。每次只执行一个检测，数据库记录PROBING、租约和结果；重启可恢复超时工作，账号注销后的旧执行者不能重新写回READY。

POST /api/media只接受单个multipart字段file，202返回PROBING及Location，不需要projectId。流式写磁盘并受大小限制，后台真实ffprobe只读取本机文件，限制协议、容器、耗时和输出大小。检测成功展示时长、分辨率、编码和音轨；损坏、超时长等转FAILED，可手动重试。上传前预览读取本地所选文件；检测后兼容素材还提供本人登录鉴权的服务端预览地址。

MediaUploadConfig基于同一个文件上限生成Servlet限制，并额外留1MiB给multipart协议开销，单文件上限不放宽。Nginx默认请求上限1025MiB；调大上传配置时也应调整代理。新接口严格按当前账号隔离，storageKey和userId不会返回给前端。

### 原视频在线预览

刷新页面或选择历史素材后可播放兼容的已上传视频。GET /api/media/{mediaId}/preview返回本人READY且检测为MP4/MOV族H.264配AAC/无音轨，或Matroska/WebM的VP8/VP9/AV1配Opus/Vorbis/无音轨的原字节流；previewUrl非null。按实际编码判断，不即时转码；HEVC等需先转换，最终解码能力取决于浏览器。

端点先鉴权、检查归属，再检查状态、受控文件和字节数。非本人/已删除404；未就绪、不兼容、文件丢失或大小变化409 MEDIA_PREVIEW_UNAVAILABLE，发送文件前的错误仍用Result。与结果播放共用MediaStreams，支持单段Range、200/206/416、inline及no-store；输出下载仍完整200。页面刷新列表不重置同一地址的播放位置，播放失败可重新加载，切换、删除或退出时停止并清空播放器。已发送/缓冲的数据不能追回，编码兼容也不保证所有设备支持。无新表、迁移、任务或配置。

### 删除素材

素材列表的删除按钮经确认后调用DELETE /api/media/{mediaId}，需要登录及CSRF。事务内删除素材、方案、任务与结果的可访问性，活动任务取消；后台旧执行者不能发布结果或复活素材。本人重复请求幂等200 Result.success()，其他用户或不存在ID返回404。不会删除其他素材或注销账号；已发送到客户端的数据无法追回。

物理文件通过原有AccountCleanupService队列清理，V7增加素材范围与唯一约束，不另建一套调度。原视频、MP4/MP3结果、未发布输出与编码日志均在范围内；等待当前检测/处理租约结束后再处理占用中的文件，默认最长剩余2分钟/7分钟，失败有界重试。200只表示删除及清理任务已提交。清理禁用时资源仍立即不可访问，但磁盘释放会等待重新启用清理。页面取消不删除、失败可重试，迟到轮询不会重新显示已删除记录。

### 视频转换

登录后选择功能并上传检测。2.15新增输出格式、编码和组合处理：视频MP4/MOV/MKV/WebM，可选H.264、H.265、VP9、AV1（按容器及本机编码器限制）；音频MP3/M4A/WAV/FLAC。分辨率支持source、360p至2160p及自定义最大边界框，保持比例、不放大，长边最多4096和8847360像素。AV1软件编码可能很慢，仍受任务超时限制。

勾选组合处理可将同源裁切、缩放、目标体积压缩、静音统一导出，另存原始音轨生成独立的完整MP3。保存导出方案只保存参数、不启动任务；刷新后选择素材并点恢复最近导出方案可继续调整，最终导出才处理。文件及方案保存在部署服务器，不是第三方云盘；不引入项目/分类/时间线。多结果可按文件选择预览、下载和删除。MKV、HEVC等浏览器兼容性不稳定的输出仅提供下载。

目标体积仍默认约原文件70%，1MB按1048576字节换算。组合压缩只开放H.264/VP9两遍编码，按裁切后的时长和静音设置计算预算；HEVC/AV1采用质量模式。所有文件在同一个任务预算内执行并原子发布，任何一个失败或取消都不保留公开半成品。新格式覆盖取消、过期租约和删除清理。FFMPEG_PATH仍可配置工具路径，capabilities新增exportFormats/exportVideoCodecs。

旧transcode/compress/trim/mute/extract_audio等参数保持兼容：默认输出仍是MP4 H.264/AAC或192kbps MP3，旧接口的source/720p限制不变。新设置使用operation=export，同一套方案、任务与Result，不新增表或接口；2.16起自然语言也能生成组合导出及同源拼接。跨素材拼接及拼接字幕重映射仍暂缓。

压缩目标至少32KiB、小于原文件且不超过输出上限，必须为整数字节数。CompressionBudget按时长预留容器和音轨空间，使用H.264两遍编码，音轨为AAC 96kbps。两遍共用总超时，编码日志最多32MiB，结束或取消时清理；账号注销清理也包含未发布文件和缓存。实际输出必须完整且不超过目标并小于原文件，否则明确失败COMPRESSION_TARGET_UNREACHABLE，不截断视频凑大小。旧转换快照和结果保持兼容，本轮不新增数据库迁移。

ProcessingController通过ProcessingService处理方案、版本和任务；OutputController通过OutputService处理结果与文件流。明确参数页面直接创建并确认执行，不要求用户管理项目或方案。相同版本重复执行返回同一任务，唯一约束和行锁覆盖并发，执行后冻结。自然语言使用DeepSeek生成候选方案，需用户确认才入队；未配置时AI_UNAVAILABLE，明确参数功能不受影响。

TranscodeWorker每次串行处理一个任务，数据库队列最多20个活动任务。FFmpeg不经过shell，限制协议、输入格式、线程、结果大小和运行时间。默认超时5分钟、租约7分钟、输出最大1GiB，分别由TranscodeProperties及TRANSCODE_TIMEOUT、TRANSCODE_MAX_OUTPUT_SIZE配置；租约必须比超时多1分钟以上。TRANSCODE_WORKER_ENABLED可关闭调度。排队任务重启可继续，过期运行任务明确失败为TASK_INTERRUPTED，需重新提交，不暗中重复执行。取消排队立即生效；运行中先CANCELLING，再终止进程并清理临时产物。

成功结果通过同源Cookie鉴权播放和下载；播放器支持单段Range及206/416，下载始终完整200。文件路径和执行租约不会返回给前端。仅校验完成并在事务中确认账号、任务和租约后才发布结果；注销、取消或陈旧执行者不能发布半成品。任务运行时进度未知为null，不生成假的百分比，成功后才为100。

### 提取音频

选择提取音频并上传视频，输出第一条音轨为MP3，固定192kbps、44.1kHz、双声道，不保留封面及源元数据。明确参数为operation=extract_audio、outputFormat=mp3，不接受分辨率、压缩体积或自定义命令。没有音轨时页面禁止提交，服务端返回422 SOURCE_HAS_NO_AUDIO；缺少libmp3lame时返回503 AUDIO_EXTRACTION_UNAVAILABLE，不影响已具备编码器的视频功能。

任务复用现有持久化队列、取消、限额及归属检查。输出经ffprobe校验MP3编码、无视频流及真实音轨时长后才发布；第一条音轨比视频短时不补静音。音频metadata的width、height、videoCodec为null，durationMs为音轨实际时长。页面提供原生音频试听、MP3下载与刷新恢复，同样要求本人登录并支持Range。失败、取消、过期租约及账号注销均清理未发布MP3。音频提取不新增数据库表或配置项。

### 视频静音

选择视频静音，可保留原分辨率或选择720p（不放大小视频）。参数仅operation=mute、outputFormat=mp4、resolutionPreset三个字段，固定移除全部音轨，不接受audioMode；已无声音的素材也可以处理。结果为H.264/yuv420p MP4，应用旋转并清理源元数据，文件名后缀-muted.mp4，原素材不变。

生成后用ffprobe确认无音轨并验证时长、尺寸及编码，失败MUTE_FAILED且不发布半成品。复用已有任务幂等、取消、鉴权播放下载、删除和清理；静音本身无新增迁移。capabilities在ffprobe及H.264/AAC编码器可用时包含mute。

### 视频裁切

选择视频裁切，输入开始/结束秒数，最多三位小数。服务端参数为operation=trim、outputFormat=mp4、startMs、endMs、audioMode=keep五个字段，时间使用整毫秒，区间至少500ms且不得超出素材时长。不接收分辨率或自定义命令，输出固定原展示尺寸并向下取偶数；capabilities在ffprobe及H.264/AAC编码器可用时包含trim。

FFmpeg在解码后按时间裁切并重新编码H.264/AAC，不用关键帧复制替代区间；应用旋转，保留选中区间内可用的首条音轨，无音频不补静音。输出按视频帧对齐，并校验真实时长、尺寸和编码，失败TRIM_FAILED，不发布半成品。原视频保持不变，结果以-trimmed.mp4命名，沿用已有方案版本、任务幂等、取消、预览/下载和删除清理，无需新增配置或迁移。执行响应丢失后相同区间重用原方案重试，避免创建重复任务。

### 单独删除结果

处理结果旁的删除按钮调用DELETE /api/outputs/{outputId}，需要登录、CSRF和二次确认。仅删除选中的MP4/MP3，不删除原素材、参数、处理记录或其他结果。成功返回200 Result.success()，详情/预览/下载立即404，Task.outputs不再包含该文件，但任务仍为SUCCEEDED。本人重复请求幂等，文件已经丢失也能删除。

V8在原清理队列增加单个OUTPUT范围，与账号/素材范围互斥且各自唯一，旧记录保留。事务内撤销访问并入队，失败一起回滚；物理文件后台清理，重复清理幂等、失败有界重试。200不表示已释放磁盘，已发送的数据不能追回。删除后页面停止播放器并保留记录，可用原素材新建方案重新处理；重复执行旧方案只返回旧任务，不隐式再生成文件。

## 启动

### 注册邮箱验证

注册先调用`POST /api/auth/registration-email-code`发送验证码，再携带返回的`challengeId`和邮件收到的六位验证码调用注册接口；注册字段名为`emailChallengeId`和`emailCode`。验证码有效10分钟、最多尝试5次、绑定邮箱且只能成功使用一次。接口和日志不返回验证码，数据库仅保存Argon2id加盐哈希。错误尝试独立提交计数，不能通过注册事务回滚绕过；消费验证码和插入用户则一起提交，防止并发重放。

真实发送使用Spring Mail连接你自己的邮箱服务商，需要开通SMTP及取得服务商要求的授权凭据，不需要公网IP。配置`REGISTRATION_MAIL_ENABLED=true`、`SMTP_HOST`、`SMTP_USERNAME`、`SMTP_PASSWORD`、`SMTP_FROM`。默认465端口并启用TLS；服务商要求587时设置`SMTP_PORT=587`、`SMTP_SSL_ENABLED=false`、`SMTP_STARTTLS_ENABLED=true`。配置仅放IDEA运行环境或本机环境变量，禁止提交授权码。SMTP连接、读写均有5秒超时；发送失败返回503，不创建用户或保留可用申请，不会模拟成功。`emailVerification`能力表示注册前邮箱验证码已配置，不代表规划中的登录后验证/密码找回接口已实现。

邮件健康检查随`REGISTRATION_MAIL_ENABLED`启停：禁用可选邮件功能时不连接空SMTP配置；启用后仍如实报告SMTP连接故障，数据库等核心健康检查不受影响。

V4新增验证码表，并将邮箱归属唯一约束改为只约束已验证邮箱。旧的未验证记录不再占用邮箱归属，实际持有者验证后可创建独立账号；旧账号和项目保留，不会转移给新账号，旧账号不能作为邮箱归属证明。所有新注册账号的`emailVerified`必须为true。注销后的已验证邮箱和用户名仍保留占用。旧未验证账号的邮箱验证/重绑定流程仍需后续实现，不能按未验证邮箱进行找回或账号合并。

1. 安装JDK 21与MySQL 8，创建空库ai_media_workbench，确保开发账号只用于指定项目库。
2. 在IDEA运行配置或当前终端中设置DB_PASSWORD。可选DB_URL、DB_USERNAME、SERVER_PORT等见[.env.example](.env.example)。示例文件只列变量，Spring Boot不会自动读取.env；不要将密码写入受版本管理的配置。应用也会自动读取当前项目工作目录下被Git忽略的`.local/database.properties`，其中可配置`local.database.password`及`local.server.port`；本机已配置，IDEA使用项目子目录作为工作目录即可运行。显式DB_PASSWORD/SERVER_PORT仍优先，其他电脑不携带这份私有文件，应自行设置数据库凭据。
3. 运行AiMediaWorkbenchApplication，或使用工程Wrapper启动。

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
$env:DB_USERNAME = 'your_database_user'
$env:DB_PASSWORD = 'your_database_password'
$env:SERVER_PORT = '8081'
.\gradlew.bat bootRun
```

默认绑定127.0.0.1:8080，健康检查为GET /actuator/health；本机8080被其他程序占用，当前Nginx配置使用后端8081，启动时按示例设置SERVER_PORT。首次启动Flyway在配置的项目库建立表，后续启动只执行新的迁移；已有迁移执行后不得修改，后续结构变更新增迁移文件。不会清空已有用户和素材，历史项目元数据归档保存。

### Windows三目录分发

项目外层可并列放置`ai_media_workbench/`、`nginx-1.30.5/`和`ffmpeg/`。本机已复制完整FFmpeg发行目录到外层`ffmpeg/`，包含bin、doc、presets、LICENSE和README.txt。该副本为Windows可执行程序，不是跨平台发行包。

从项目子目录启动前，用相对位置解析随包工具，不依赖接收方系统PATH：

```powershell
$env:FFMPEG_PATH = (Resolve-Path '..\ffmpeg\bin\ffmpeg.exe').Path
$env:FFPROBE_PATH = (Resolve-Path '..\ffmpeg\bin\ffprobe.exe').Path
```

这两行设置只对当前终端及其后启动的进程生效，不能改变已运行的后端；原有环境变量覆盖方式保持不变。启动工作目录应为项目子目录，以保证storage等相对路径一致。

三个文件夹尚不构成完整的“解压即用”发行版：接收方仍需Java 21、MySQL 8、空数据库及连接配置；Flyway负责建表，不负责安装/启动MySQL或自动创建本机保留测试账号。正式便携包还需独立启动入口、依赖检查及数据库初始化方案，不应要求接收方编译源码。

不要直接压缩当前开发目录分发。发布内容应单独整理可执行JAR、所需配置模板与工具，排除`.git/`、`.idea/`、`.gradle/`、`.local/`、`.env*`私有配置、日志和数据库备份、storage中的真实素材、前端node_modules及测试产物；保留可公开的`.env.example`。邮箱授权码、云端密钥和加密主密钥不得随包发送，接收方应自行配置凭据。

Cookie默认只适合本机HTTP联调；HTTPS部署设置COOKIE_SECURE=true。页面使用同源请求，先GET /api/auth/csrf，然后发送带X-CSRF-Token的写请求；登录后使用返回的新csrfToken。

## 简易页面与Nginx

页面随Spring Boot提供，不需要前端构建或外部CDN。先启动后端8081，再从项目根目录运行：

```powershell
.\deploy\run-nginx.ps1
```

脚本在项目外层查找Nginx，也可传入-NginxHome指定目录。它复制独立的ai-media-workbench.conf到Nginx的conf目录并验证/启动，保留原nginx.conf。页面使用 [http://127.0.0.1:8088](http://127.0.0.1:8088)，全部请求代理到8081，不修改占用80/8080的其他程序。

注册先获取邮箱验证码，再设置初始密码，不自动登录。登录后可刷新恢复、退出当前/全部设备、修改密码与注销。注销须输入当前密码和用户名；注销后不提供恢复，用户名/已验证邮箱仍保留占用，不能直接重复注册。

本机开发库的保留测试账号登录名为`admin`，密码未变，不具有额外管理员权限。它不是代码或迁移自动创建的默认账号，其他环境需单独准备，生产环境不要沿用开发测试账号。

## 验证

```powershell
.\gradlew.bat test
```

后端测试使用独立内存H2（MySQL兼容模式）和相同迁移脚本，不需要本机数据库密码，不向开发数据库写测试账号。覆盖账号/邮箱验证、素材隔离、版本和幂等、队列上限、取消、过期租约、删除/注销期间处理、失败不发布、清理重试及Range。安装FFmpeg时额外验证真实转换、旋转、压缩、裁切、静音、MP3提取与识别专用16kHz单声道音频。

字幕测试覆盖权限、原稿/历史、时间与文本边界、SRT字节、强制识别失败保留旧稿、取消/删除/注销/过期结果拒绝、临时音轨先清理后发布，以及腾讯签名、百炼事件分片、DeepSeek JSON校验、有界外部响应。云端协议使用替身，不能代替真实供应商的准确率、权限、网络或费用验收。`npm test -- subtitles.spec.js`的浏览器API替身不写开发数据库，也不发付费请求。

本机MySQL已备份并迁移至V10；先在与原库字符集/排序规则一致的副本验证升级和旧数据保留。回环SMTP及Nginx回归覆盖验证码注册、账号操作、个人凭据隔离、上传检测、真实处理/鉴权播放/下载、删除重试和刷新恢复。测试邮件不对外发送，真实投递仍需配置发信账号后验证。

裁切测试还覆盖带/不带音轨、旋转及音轨提前结束的真实文件，检查所选区间的首帧颜色而不仅是文件时长；接口覆盖边界/溢出、版本、校验失败、取消与删除期间执行，浏览器覆盖参数校验、响应丢失后的幂等重试、鉴权下载、桌面/手机截图和刷新恢复。

静音测试覆盖多音轨、无音轨及旋转文件、source/720p、画面颜色和源文件不变；接口覆盖三字段快照、参数拒绝、版本、幂等、归属、残留音轨不发布、取消及删除期间执行。浏览器实际播放和下载后检查唯一视频流，并验证匿名访问拒绝、Range、刷新恢复及桌面/手机布局。

原视频预览测试覆盖精确原字节、单段/后缀/开放结尾Range、非法/多段降级、越界Result、权限隔离、格式白名单、丢失/变化/越界路径和撤销会话。浏览器验证刷新恢复、真实播放/拖动、列表刷新不重置位置、网络错误重载、格式切换、删除撤销及桌面/手机截图；共享流响应的原有MP4/MP3播放下载回归一并执行。

后端与Nginx启动后可运行浏览器测试。注册端到端测试只允许对接本地测试收件箱，不绕过验证码：

```powershell
cd frontend
npm ci
$env:LOCAL_SMTP_TEST_ONLY = 'true'
node tests/mailbox-fixture.cjs
```

该进程仅监听127.0.0.1:2526（SMTP）和127.0.0.1:8026（测试邮件API），不会转发真实邮件，不能公开端口或部署到生产。另一个终端启动测试后端：`REGISTRATION_MAIL_ENABLED=true`、`SMTP_HOST=127.0.0.1`、`SMTP_PORT=2526`、`SMTP_FROM=workbench@example.com`、`SMTP_AUTH=false`、`SMTP_SSL_ENABLED=false`、`SMTP_STARTTLS_ENABLED=false`。仅测试时可将`APP_AUTH_REGISTRATION_ATTEMPTS`、`APP_AUTH_LOGIN_ATTEMPTS`设为1000以避免多个回归账号共用本机IP触发默认限额。随后在frontend目录设置`TEST_MAILBOX_URL=http://127.0.0.1:8026`并运行`npm test -- auth.spec.js`。测试结束后关闭测试收件箱，清除这些测试环境变量并恢复真实邮件设置；不要把本地收件箱作为注册验证的生产替代。无邮件配置时运行`npm test -- registration-closed.spec.js`检查注册关闭与登录可用状态。

在相同测试配置下运行`npm test -- workbench.spec.js`可验证视频工作台；该测试需要ffmpeg在PATH中，并会生成临时视频。桌面和手机截图保存在frontend/test-results（不提交）。如未安装浏览器，运行npx playwright install chromium；也可通过PLAYWRIGHT_EXECUTABLE_PATH指定已有浏览器。默认测试地址8088，可用APP_BASE_URL修改。测试会在实际后端创建带随机ui_前缀的账号并注销；注销记录与用户名/邮箱占用保留，密码哈希已清除。不要将端到端测试指向生产服务。

本机若遇到JDK网络证书或Windows管道临时路径错误，可在当前终端设置以下参数；只影响当前进程及子进程，不关闭TLS校验，不修改系统JDK：

```powershell
New-Item -ItemType Directory -Path 'D:\Gradle\tmp' -Force | Out-Null
$env:GRADLE_USER_HOME = 'D:\Gradle'
$env:JAVA_TOOL_OPTIONS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT -Djavax.net.ssl.trustStore=NONE -Djdk.net.unixdomain.tmpdir=D:/Gradle/tmp'
```

## 表结构

V1：账号和登录会话；V2：原媒体工作区表；V3：account_cleanup_job；V4：注册前邮箱验证；V5：取消项目工作流、直接用户归属及检测租约；V6：转换任务租约、队列准入锁与JSON文本列；V7：复用清理队列支持单个素材删除；V8：扩展队列支持单个结果删除；V9：字幕原稿和版本；V10：按用户/供应商保存加密凭据、来源和乐观锁版本，注销时物理删除。旧迁移保持不变，Flyway另维护flyway_schema_history。

业务ID使用UUID，日期保存UTC，媒体时间为毫秒。media、operation_plan、media_task、output_file直接保存user_id，并用复合外键保证关联资源属于同一用户。旧project表改名legacy_project保留历史名称与归属，新业务不创建默认项目。检测元信息使用经ObjectMapper序列化的JSON文本，实体不直接暴露给前端。username和已验证email唯一，任务plan_id仍唯一。

注销事务停用账号、撤销凭证、软删除本人素材与关联记录、取消活动任务，并写持久化清理任务；历史归档元数据也标记删除。后台每5秒清理一批文件，失败最多重试5次，执行租约可恢复。只删除MEDIA_STORAGE_ROOT内的受控文件，拒绝越界或外部父目录链接，不递归删除任意路径。

V9新增transcript/transcript_revision，保存不可变识别稿、编辑版本及来源任务。自然语言方案复用现有operation_plan和media_task，字幕内容检索直接读取已保存字幕，不新增索引表或迁移；同源多段导出复用方案和任务，跨素材与拼接字幕重映射暂不制作。

## 云端服务

账户设置的“云端服务”支持每个用户自行填写腾讯、百炼和DeepSeek凭据，也可明确选择站点公共配置或停用。未保存过时默认站点配置；个人配置不与站点混用，调用失败不回退公共额度。删除个人凭据会清除密文并停用；切换站点配置同样清除个人凭据。三个供应商独立配置，不需要全部购买。不要把密码/密钥发到聊天或写入仓库，`.env.example`仅是字段模板，Spring Boot不会自动读取`.env`。站点公共凭据可在IDEA运行配置的环境变量中设置：

| 用途 | 环境变量 | 接口 |
| --- | --- | --- |
| 腾讯语音识别 | TENCENT_ASR_APP_ID、TENCENT_ASR_SECRET_ID、TENCENT_ASR_SECRET_KEY | 录音极速版16k_zh，带句时间戳 |
| 百炼语音识别 | DASHSCOPE_API_KEY，可选DASHSCOPE_WORKSPACE_ID | 北京地域paraformer-realtime-v2 |
| DeepSeek方案生成、单句校对和找片段 | DEEPSEEK_API_KEY，可选DEEPSEEK_MODEL（默认deepseek-flash） | Chat Completions JSON |

至少配置一家识别服务即可；不是三家都必须购买。腾讯需要开通ASR，百炼Key需匹配北京业务空间；Workspace ID不填时使用仍受支持的dashscope官方域名。域名固定，不支持用户任意接口URL。配置完整只表示本地具备调用条件，不代表权限、网络和余额已验证。`capabilities.asrProviders`列出配置且音频工具可用的服务，`subtitleCorrection`声明校对配置；`aiPlans`需DeepSeek配置完成且至少一种处理工具可用；`semanticSearch`和`clipRecommendations`只需DeepSeek配置，但每次仍检查当前已保存字幕和分析上限。

登录后的capabilities按当前用户计算，匿名只报告站点能力，响应禁止缓存。页面通过带文字的保存按钮提交，输入框回车不保存；个人凭据写入前仍需确认，取消不写入。保存只校验格式，不发起远程验证或付费请求。密钥不回显、不存localStorage；输入框留空时前端省略该字段，保留之前保存的密钥。设置接口以expectedVersion防止多窗口覆盖，写入每用户默认5分钟20次。服务端账号由会话取得，不能指定其他userId；后台识别也显式携带任务用户，不共享可变的个人配置。

V10的cloud_credential只存AES-256-GCM密文，随机nonce、AAD绑定用户和供应商；不是密码哈希，因为调用云端需要解密。主密钥为独立32字节二进制文件，默认`.local/cloud-credentials.key`，可用CLOUD_CREDENTIALS_KEY_FILE指定。首次保存且库内无加密凭据时自动创建，仅运行账号有初始访问权限，`.local/`已忽略。已有密文而主密钥丢失/损坏时拒绝解密和调用，不重新生成或回退站点；须恢复正确主密钥备份。单条损坏可先删除再配置，但不能修复其他账号的丢失主密钥。现阶段不提供自动轮换。

部署时使用HTTPS，妥善控制恢复文件的权限，分别保护并配套备份数据库与主密钥，禁止把主密钥提交Git或放到静态目录。加密不能防止具有服务器/主密钥读取权限的管理员获取凭据；生产可改用受控密钥挂载或KMS。实现依据[AES及密钥分离建议](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)。任务/方案/响应/日志不保存密钥；排队中的识别在真正执行时读取当前配置，切换后已发送的请求可能继续完成并计费，无法撤回。

凭据测试覆盖密文、篡改、跨用户复制拒绝、双用户并发路由、不回退、版本冲突、注销清除和主密钥丢失。`npm test -- cloud-credentials.spec.js`需回环SMTP，只在临时账号保存虚构凭据并清除，不会调用真实云端；不能据此宣称真实供应商鉴权或余额已经验证。

字幕页可识别、编辑时间/文字、保存版本、查看原文/历史、下载SRT和生成字幕视频。重新识别另建字幕，失败保留旧稿；成功任务固定引用识别v1。临时音轨为64kbps/16kHz/单声道MP3，不发布为输出，不覆盖源视频。识别与转换共享有界队列、取消及租约；默认总处理预算5分钟，时间过长应调整服务端预算并同时保证租约足够。云端取消不能撤回已发送数据或保证免扣费，不自动重试付费调用。

单句校对时DeepSeek只收到该句已保存字幕，返回待确认建议；不直接改稿、不改时间轴、不替代ASR。用户确认采用后仍需保存字幕。每用户默认5分钟最多10次新识别/20次校对，公共凭据部署仍需自行设置供应商预算和告警。找片段会发送当前已保存字幕，边界见下文。自动测试使用协议替身，不代表已经完成真实云端识别效果或计费验收。

官方协议：[腾讯录音极速版](https://cloud.tencent.com/document/api/1093/52097)、[百炼Paraformer WebSocket](https://help.aliyun.com/zh/model-studio/websocket-for-paraformer-real-time-service)、[DeepSeek Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)。

## 自然语言处理

2.17起AI处理页提供“文字输入”和“分步填写”两种入口，统一使用operation=workflow、steps有序数组。文字入口由DeepSeek生成候选步骤，手动入口不调用第三方API、不需要云端凭据；可增删、上下移动步骤，AI方案也可切换为手动编辑。支持保留区间、从当前结果选段拼接、缩放、静音和最终导出，可重复、按序组合，不穷举A+B或A+C。旧export/join_clips及单功能契约保持兼容，无新增表或接口。

所有区间基于上一步结果：例如尾5秒与头5秒拼成10秒，再保留第3到7秒，结果4秒；连续裁切不是都针对原视频。多次缩放逐步保持比例、不放大，先360p再720p不会恢复画质。最多12步（含最后且唯一的export）、展开最多20个源区间、最终最多15分钟。最终导出设置容器/编码/目标体积，可另存完整原始音轨MP3；静音后不能再导出纯音频，原始音轨旁路不受影响。360p指分辨率，20MB才是体积目标；“剪切5秒”仍须明确区间/保留或删除。“发回来”只是本站结果下载，不发送邮件/聊天消息。

确认页展示实际分辨率、编码、裁切区间、静音/音轨及附加文件；拼接显示每段按播放顺序排列的区间和总时长。生成不入队，确认后才运行既有FFmpeg任务。修改要求会禁用旧确认，必须重新生成；READY方案的更新携带完整旧参数，未要求更改的合法设置应保留。NEEDS_INPUT补充回答会与原要求合并保存，包含换行“补充：”；如果用户已提交完整原文则不重复拼接，累计最多2000码点，超限在调用云端前拒绝。刷新可恢复上下文和方案，已执行方案不可改；同一方案/版本重复执行返回原任务。

复用DEEPSEEK_API_KEY/DEEPSEEK_MODEL，不新增配置或数据库迁移。仅发送处理要求及上文、视频元信息/字节数、已有参数、当前导出格式/编码和大小限制，不发送视频/音轨/文件名/路径。模型仅返回JSON候选，后端再次验证操作、格式/编码白名单、字段类型和素材边界；非法结果AI_PLAN_FAILED，不创建任务，失败修改不覆盖旧版本。每用户默认5分钟20次生成，文字校对与方案共用最多2个并发云端请求，35秒超时，最多3072输出token，不自动重试付费调用。

执行器把独立步骤编译为源区间和有序滤镜链，复用既有导出逻辑，不调用自己的HTTP接口。单区间融合执行，避免每一步导出；多区间顺序生成FFV1/PCM无损Matroska缓存后一次最终有损编码（目标体积模式包含分析遍），统一30fps，避免反向/重复split积压高清帧。缓存和最终文件分别受输出上限约束，磁盘峰值约两倍加旁路音轨；无损缓存体积可能先触发OUTPUT_TOO_LARGE，缩小分辨率/缩短选段可减少占用。所有阶段共享超时/取消，缓存失败或取消即清理，重启后由既有租约/资源清理覆盖。

capabilities含workflow才开放，除ffprobe及H.264/AAC还需FFV1/PCM编码器。支持白名单步骤的通用顺序组合，不等于开放任意FFmpeg能力；跨素材、字幕识别/烧录/重映射、调速、任意脚本仍不属于流程入口，不能假装完成。手动模式在最近10条方案中恢复最新workflow。完整参数和示例见docs/api/API.md的5.2节。

云端等待不持有数据库事务或账号锁；生成后在短事务内重新检查素材、账号和版本，删除/注销或并发修改后不落库迟到方案。合法参数不保证模型理解正确，因此必须人工确认。协议、权限、事务、并发及浏览器流程使用本地替身测试；真实理解效果、服务权限和费用仍需凭据联调，不能把替身结果当作云端验收。

## 同源多段拼接

片段拼接页可填写同一素材多个时间区间，添加、复制、移除、上下排序、区间预览，并确认导出一个MP4；找片段结果也能加入拼接。最多20段，每段至少0.5秒，总计最多15分钟；允许倒序/重复/重叠，不修改原素材。采用join_clips明确参数方案和既有任务，不新增项目、草稿表或接口。最近10条方案中的最新拼接方案可恢复；未提交编辑仅保留当前页，刷新/切换会提示。执行响应丢失后重试同一方案，不重复任务。

固定原展示尺寸取偶数、30fps、H.264/yuv420p，首条音轨AAC 48kHz双声道。源音轨提前结束时，在缺失区间补静音保证拼接同步；无音轨源仍无音轨。顺序生成临时片段，再以[FFmpeg concat](https://ffmpeg.org/ffmpeg-formats.html#concat)读取受控清单拼接重编码，不将倒序片段在内存积压。所有阶段共享既有5分钟默认超时、7分钟租约；临时分段合计和最终输出各受大小上限约束（默认各1GiB），编码时峰值磁盘约两倍。私有中间文件在发布前清理，失败保留租约以便恢复；取消、删除、注销和过期回收也清理分段及清单。

不提供跨素材拼接、命名草稿管理、同次拼接烧录或字幕重映射/SRT导出，原计划clip-drafts接口仍未实现。输出是用户确认的画面区间，既有硬字幕随画面保留。2.16起自然语言可生成同源有序区间，仍使用相同参数和校验。实际FFmpeg测试检查倒序/重复后的画面颜色、音频时段、全片时长、无音轨素材及原文件不变。

## 字幕烧录

在字幕页保存编辑后，点击生成字幕视频并确认，得到带字幕的H.264/AAC MP4，原素材和SRT不变。按钮只在最新已保存编辑稿可用；有未保存修改或查看原稿/历史稿时禁用。输出复用现有后台任务、取消、鉴权播放/下载和删除，刷新可从处理记录恢复。执行响应不确定时保留方案，重试不会重复入队。

复用burn_subtitles明确参数方案，不增加表或接口，不通过自然语言自动选择字幕。创建/修改/首次执行检查当前字幕ID与版本；入队后引用不可变历史稿，后续编辑或重识别不改变已确认任务。FFmpeg需libx264/aac编码器及libass的ass过滤器，能力列表会按实际工具开放；烧录已有字幕不需要云端密钥。部署需安装覆盖字幕字符的字体，尤其Linux上的中文字体，否则可能显示方框。

固定底部白字黑边、字号随输出高度缩放，支持中文/换行，纯文本转义ASS指令；不接受任意字体路径、样式脚本或外部字幕URL。ASS时间向外取整到10ms，按视频帧呈现。输出后校验尺寸、编码、音轨和全片时长，不合格不发布。私有ASS在清空运行令牌前删除；失败保留租约供回收，删除素材/注销清理也覆盖ASS。超时、大小上限与原转码一致，不覆盖原素材。

渲染使用[FFmpeg ass过滤器](https://ffmpeg.org/ffmpeg-filters.html#ass)；纯文字转义参考了[mpv对libass覆盖标签及反斜线的处理](https://github.com/mpv-player/mpv/blob/master/sub/osd_libass.c)。实际FFmpeg测试检查字幕时段内出现像素、时段外无字幕、音轨保留、特殊存储路径及原文件不变；云端识别质量仍另行联调。

## 按字幕找片段

找片段页可按目标检索或在指定总时长内生成片段建议，查看对应原文和时间，预览兼容的原视频区间，并带入单段裁切或加入同源多段拼接。加入前重新检查字幕ID/版本，仍需用户确认导出才创建任务；不增加草稿表、项目层或自动导出。

复用DeepSeek配置，仅分析当前完整已保存字幕，最多600段且segments序列化UTF-8 JSON不超过128KiB；超出明确返回TRANSCRIPT_ANALYSIS_TOO_LARGE，不截断。模型只选真实段ID，后端重建引文/时间并验证非重叠和推荐总时长；查无内容返回空结果。标题、理由和相关度为模型判断，仍需核对原文。请求绑定transcriptId和版本，重识别即使仍为v1也不能复用旧稿，调用前后均核验权限和版本。

检索/推荐共享每用户默认5分钟20次，与其他文字AI共享最多2个并发请求、35秒超时，不自动重试。调用前确认向云端发送目标与已保存字幕。当前未配置真实密钥，自动测试仅验证协议、权限、版本、时长边界与本地浏览器预览/带入流程，不代表已验收云端检索质量或费用。
