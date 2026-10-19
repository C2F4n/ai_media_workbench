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

轻量工作台不提供项目创建或分类，用户登录后直接选择功能并上传文件。已实现账号、注册邮箱验证、视频上传检测、本人素材及关联资源删除、明确参数MP4转换与目标体积压缩、MP3音频提取、持久化任务与取消、结果播放及下载，当前共28个已实现接口。未配置真实邮件服务时关闭注册，已有账号仍可登录。AI和字幕仍待后续实现。

密码使用带随机盐的Argon2id哈希。登录令牌不是JWT，而是Spring Session JDBC管理的不透明会话ID，通过AMW_SESSION HttpOnly Cookie发送。会话及认证身份存入数据库，服务端检查会话、到期时间和账号状态，不依赖客户端自行判断令牌有效性；页面不读取令牌，也不将其保存到localStorage。退出撤销当前令牌，修改密码、退出全部设备与注销会撤销该用户全部令牌。CSRF令牌单独保护写请求，不是登录凭证，也不是JWT刷新令牌。

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

POST /api/media只接受单个multipart字段file，202返回PROBING及Location，不需要projectId。流式写磁盘并受大小限制，后台真实ffprobe只读取本机文件，限制协议、容器、耗时和输出大小。检测成功展示时长、分辨率、编码和音轨；损坏、超时长等转FAILED，可手动重试。本轮previewUrl为null；上传前的视频预览仅来自浏览器所选的本地文件，不是服务端播放接口。

MediaUploadConfig基于同一个文件上限生成Servlet限制，并额外留1MiB给multipart协议开销，单文件上限不放宽。Nginx默认请求上限1025MiB；调大上传配置时也应调整代理。新接口严格按当前账号隔离，storageKey和userId不会返回给前端。

### 删除素材

素材列表的删除按钮经确认后调用DELETE /api/media/{mediaId}，需要登录及CSRF。事务内删除素材、方案、任务与结果的可访问性，活动任务取消；后台旧执行者不能发布结果或复活素材。本人重复请求幂等200 Result.success()，其他用户或不存在ID返回404。不会删除其他素材或注销账号；已发送到客户端的数据无法追回。

物理文件通过原有AccountCleanupService队列清理，V7增加素材范围与唯一约束，不另建一套调度。原视频、MP4/MP3结果、未发布输出与编码日志均在范围内；等待当前检测/处理租约结束后再处理占用中的文件，默认最长剩余2分钟/7分钟，失败有界重试。200只表示删除及清理任务已提交。清理禁用时资源仍立即不可访问，但磁盘释放会等待重新启用清理。页面取消不删除、失败可重试，迟到轮询不会重新显示已删除记录。

### 视频转换

登录后选择视频转换或视频压缩，上传并检测视频，设置原分辨率或720p。压缩额外指定目标体积，默认约原文件70%，1MB按1048576字节换算。输出固定MP4（H.264/AAC），保留音轨；无音轨不补声音，小视频不放大，旋转尺寸与音画信息在输出后重新检测。FFmpeg必须包含libx264和aac编码器，工具路径由FFMPEG_PATH配置。工具可用时supportedOperations包含transcode和compress；提取音频独立检查libmp3lame，其他操作不伪装可用。

压缩目标至少32KiB、小于原文件且不超过输出上限，必须为整数字节数。CompressionBudget按时长预留容器和音轨空间，使用H.264两遍编码，音轨为AAC 96kbps。两遍共用总超时，编码日志最多32MiB，结束或取消时清理；账号注销清理也包含未发布文件和缓存。实际输出必须完整且不超过目标并小于原文件，否则明确失败COMPRESSION_TARGET_UNREACHABLE，不截断视频凑大小。旧转换快照和结果保持兼容，本轮不新增数据库迁移。

ProcessingController通过ProcessingService处理方案、版本和任务；OutputController通过OutputService处理结果与文件流。明确参数方案在后台创建并执行，不要求用户管理项目或方案。相同版本重复执行返回同一任务，数据库唯一约束和行锁覆盖并发；执行后冻结快照。自然语言暂时返回AI_UNAVAILABLE，不模拟AI。

TranscodeWorker每次串行处理一个任务，数据库队列最多20个活动任务。FFmpeg不经过shell，限制协议、输入格式、线程、结果大小和运行时间。默认超时5分钟、租约7分钟、输出最大1GiB，分别由TranscodeProperties及TRANSCODE_TIMEOUT、TRANSCODE_MAX_OUTPUT_SIZE配置；租约必须比超时多1分钟以上。TRANSCODE_WORKER_ENABLED可关闭调度。排队任务重启可继续，过期运行任务明确失败为TASK_INTERRUPTED，需重新提交，不暗中重复执行。取消排队立即生效；运行中先CANCELLING，再终止进程并清理临时产物。

成功结果通过同源Cookie鉴权播放和下载；播放器支持单段Range及206/416，下载始终完整200。文件路径和执行租约不会返回给前端。仅校验完成并在事务中确认账号、任务和租约后才发布结果；注销、取消或陈旧执行者不能发布半成品。任务运行时进度未知为null，不生成假的百分比，成功后才为100。

### 提取音频

选择提取音频并上传视频，输出第一条音轨为MP3，固定192kbps、44.1kHz、双声道，不保留封面及源元数据。明确参数为operation=extract_audio、outputFormat=mp3，不接受分辨率、压缩体积或自定义命令。没有音轨时页面禁止提交，服务端返回422 SOURCE_HAS_NO_AUDIO；缺少libmp3lame时返回503 AUDIO_EXTRACTION_UNAVAILABLE，不影响已具备编码器的视频功能。

任务复用现有持久化队列、取消、限额及归属检查。输出经ffprobe校验MP3编码、无视频流及真实音轨时长后才发布；第一条音轨比视频短时不补静音。音频metadata的width、height、videoCodec为null，durationMs为音轨实际时长。页面提供原生音频试听、MP3下载与刷新恢复，同样要求本人登录并支持Range。失败、取消、过期租约及账号注销均清理未发布MP3。音频提取不新增数据库表或配置项。

## 启动

### 注册邮箱验证

注册先调用`POST /api/auth/registration-email-code`发送验证码，再携带返回的`challengeId`和邮件收到的六位验证码调用注册接口；注册字段名为`emailChallengeId`和`emailCode`。验证码有效10分钟、最多尝试5次、绑定邮箱且只能成功使用一次。接口和日志不返回验证码，数据库仅保存Argon2id加盐哈希。错误尝试独立提交计数，不能通过注册事务回滚绕过；消费验证码和插入用户则一起提交，防止并发重放。

真实发送使用Spring Mail连接你自己的邮箱服务商，需要开通SMTP及取得服务商要求的授权凭据，不需要公网IP。配置`REGISTRATION_MAIL_ENABLED=true`、`SMTP_HOST`、`SMTP_USERNAME`、`SMTP_PASSWORD`、`SMTP_FROM`。默认465端口并启用TLS；服务商要求587时设置`SMTP_PORT=587`、`SMTP_SSL_ENABLED=false`、`SMTP_STARTTLS_ENABLED=true`。配置仅放IDEA运行环境或本机环境变量，禁止提交授权码。SMTP连接、读写均有5秒超时；发送失败返回503，不创建用户或保留可用申请，不会模拟成功。`emailVerification`能力表示注册前邮箱验证码已配置，不代表规划中的登录后验证/密码找回接口已实现。

邮件健康检查随`REGISTRATION_MAIL_ENABLED`启停：禁用可选邮件功能时不连接空SMTP配置；启用后仍如实报告SMTP连接故障，数据库等核心健康检查不受影响。

V4新增验证码表，并将邮箱归属唯一约束改为只约束已验证邮箱。旧的未验证记录不再占用邮箱归属，实际持有者验证后可创建独立账号；旧账号和项目保留，不会转移给新账号，旧账号不能作为邮箱归属证明。所有新注册账号的`emailVerified`必须为true。注销后的已验证邮箱和用户名仍保留占用。旧未验证账号的邮箱验证/重绑定流程仍需后续实现，不能按未验证邮箱进行找回或账号合并。

1. 安装JDK 21与MySQL 8，创建空库ai_media_workbench，确保开发账号只用于指定项目库。
2. 在IDEA运行配置或当前终端中设置DB_PASSWORD。可选DB_URL、DB_USERNAME、SERVER_PORT等见[.env.example](.env.example)。示例文件只列变量，Spring Boot不会自动读取.env；不要将密码写入受版本管理的配置。
3. 运行AiMediaWorkbenchApplication，或使用工程Wrapper启动。

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
$env:DB_USERNAME = 'your_database_user'
$env:DB_PASSWORD = 'your_database_password'
$env:SERVER_PORT = '8081'
.\gradlew.bat bootRun
```

默认绑定127.0.0.1:8080，健康检查为GET /actuator/health；本机8080被其他程序占用，当前Nginx配置使用后端8081，启动时按示例设置SERVER_PORT。首次启动Flyway在配置的项目库建立表，后续启动只执行新的迁移；已有迁移执行后不得修改，下一次结构变更新增V8。不会清空已有用户和素材，历史项目元数据归档保存。

Cookie默认只适合本机HTTP联调；HTTPS部署设置COOKIE_SECURE=true。页面使用同源请求，先GET /api/auth/csrf，然后发送带X-CSRF-Token的写请求；登录后使用返回的新csrfToken。

## 简易页面与Nginx

页面随Spring Boot提供，不需要前端构建或外部CDN。先启动后端8081，再从项目根目录运行：

```powershell
.\deploy\run-nginx.ps1
```

脚本在项目外层查找Nginx，也可传入-NginxHome指定目录。它复制独立的ai-media-workbench.conf到Nginx的conf目录并验证/启动，保留原nginx.conf。页面使用 [http://127.0.0.1:8088](http://127.0.0.1:8088)，全部请求代理到8081，不修改占用80/8080的其他程序。

注册先获取邮箱验证码，再设置初始密码，不自动登录。登录后可刷新恢复、退出当前/全部设备、修改密码与注销。注销须输入当前密码和用户名；注销后不提供恢复，用户名/已验证邮箱仍保留占用，不能直接重复注册。

## 验证

```powershell
.\gradlew.bat test
```

后端测试使用独立内存H2（MySQL兼容模式）及相同迁移脚本，不需要本机数据库密码，不向开发数据库写测试账号。覆盖账号安全、邮箱验证码、素材隔离、检测重试、迁移归属，也覆盖方案版本、并发执行幂等、队列上限、排队/运行取消、过期租约、注销期间处理、失败输出不发布、文件缺失和Range。安装FFmpeg时执行真实带音轨转码、旋转、720p、带/不带音轨的两遍压缩、目标体积与时长校验、编码缓存清理及进程超时/取消测试；音频提取覆盖首条音轨时长、无音轨拒绝、编码器独立能力、MP3校验与清理。删除覆盖权限、重复请求、关联不可访问、检测/处理期间删除、并发执行与删除、清理范围及事务回滚。邮件测试使用替身，不会向真实邮箱发信。本机MySQL已备份并成功执行V1至V7迁移，V7先在副本校验旧数据保留；回环SMTP及Nginx浏览器测试覆盖验证码注册、账号操作、上传、检测、真实转换、压缩与音频提取、刷新恢复、鉴权播放和下载后的文件检测，以及删除确认、取消、失败重试和旧轮询响应。真实服务商投递仍需配置发信账号后验证，不能把测试收件箱当作对外投递成功。

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

V1：账号和登录会话；V2：原媒体工作区表；V3：account_cleanup_job；V4：注册前邮箱验证；V5：取消项目工作流、直接用户归属及检测租约；V6：转换任务租约、队列准入锁与JSON文本列；V7：复用清理队列支持单个素材删除。旧迁移保持不变，Flyway另维护flyway_schema_history。

业务ID使用UUID，日期保存UTC，媒体时间为毫秒。media、operation_plan、media_task、output_file直接保存user_id，并用复合外键保证关联资源属于同一用户。旧project表改名legacy_project保留历史名称与归属，新业务不创建默认项目。检测元信息使用经ObjectMapper序列化的JSON文本，实体不直接暴露给前端。username和已验证email唯一，任务plan_id仍唯一。

注销事务停用账号、撤销凭证、软删除本人素材与关联记录、取消活动任务，并写持久化清理任务；历史归档元数据也标记删除。后台每5秒清理一批文件，失败最多重试5次，执行租约可恢复。只删除MEDIA_STORAGE_ROOT内的受控文件，拒绝越界或外部父目录链接，不递归删除任意路径。

字幕、校对、索引和片段草稿在相应阶段新增迁移。后续可接单独删除处理结果，或在明确参数处理流程上接AI自然语言方案。
