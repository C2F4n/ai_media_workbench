# AI音视频工作台

Java 21 / Spring Boot 4.0.8 / Gradle Wrapper 9.7.1 / MyBatis / MySQL 8。

## 当前基础

后端采用Controller -> ServiceImpl（实现Service接口）-> Mapper。按当前开发约定，Controller通过构造器注入对应实现类；Service层保留业务接口，SQL集中在MyBatis XML中。

```text
src/main/java/org/example/ai_media_workbench/
  controller/       HTTP接口与响应
  service/          业务接口
  service/impl/     业务实现与事务
  mapper/           数据访问接口
  entity/           数据库实体
  entity/enums/     媒体、方案与任务状态
  dto/              请求参数与校验
  vo/               对外响应，不暴露密码哈希或存储路径
  config/           认证、会话与配置
  common/           异常、requestId、校验与认证辅助
src/main/resources/
  mapper/           MyBatis XML
  db/migration/     Flyway版本化建表脚本
  static/           简易账户页面与本地图标资源
deploy/nginx/       本地Nginx代理配置
frontend/tests/     浏览器端到端测试
```

已实现注册、登录、账号注销、CSRF、本人资料、修改昵称、修改密码、当前/全部设备退出、能力查询，共10个接口。简易页面可实际注册、登录、退出、注销，以及修改昵称与密码。媒体相关表和实体已建立，上传、AI、字幕与媒体处理业务尚未实现。

密码使用带随机盐的Argon2id哈希。AMW_SESSION是登录令牌，通过HttpOnly Cookie发送，服务端检查会话、到期时间和账号状态；页面不将登录令牌保存到localStorage。退出撤销当前令牌，修改密码、退出全部设备与注销会撤销该用户全部令牌。写请求另需CSRF令牌。

完整接口契约：[API.md](docs/api/API.md)，Apifox选择OpenAPI/Swagger导入[openapi.json](docs/api/openapi.json)。当前可用接口范围见API文档第一节。

## 启动

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

默认绑定127.0.0.1:8080，健康检查为GET /actuator/health；本机8080被其他程序占用，当前Nginx配置使用后端8081，启动时按示例设置SERVER_PORT。首次启动Flyway在配置的项目库建立表，后续启动只执行新的迁移；已有迁移执行后不得修改，新增变更写新的V4/V5脚本。不对既有非空库自动baseline，也不运行DROP或清空数据。

Cookie默认只适合本机HTTP联调；HTTPS部署设置COOKIE_SECURE=true。页面使用同源请求，先GET /api/auth/csrf，然后发送带X-CSRF-Token的写请求；登录后使用返回的新csrfToken。

## 简易页面与Nginx

页面随Spring Boot提供，不需要前端构建或外部CDN。先启动后端8081，再从项目根目录运行：

```powershell
.\deploy\run-nginx.ps1
```

脚本在项目外层查找Nginx，也可传入-NginxHome指定目录。它复制独立的ai-media-workbench.conf到Nginx的conf目录并验证/启动，保留原nginx.conf。页面使用 [http://127.0.0.1:8088](http://127.0.0.1:8088)，全部请求代理到8081，不修改占用80/8080的其他程序。

注册设置初始密码，不自动登录。登录后可刷新恢复、退出当前/全部设备、修改密码与注销。注销须输入当前密码和用户名；注销后不提供恢复，用户名/邮箱仍保留占用，不能直接重复注册。

## 验证

```powershell
.\gradlew.bat test
```

后端测试使用独立内存H2（MySQL兼容模式）及相同迁移脚本，不需要本机数据库密码，不向开发数据库写测试账号。覆盖令牌旋转、CSRF、密码哈希、重复注册、错误登录、退出、跨设备密码修改、绝对过期、伪造令牌、注销及文件清理边界。本机MySQL已成功执行V1/V2/V3迁移，真实页面经过浏览器注册、登录、退出、注销与修改密码验证。

后端与Nginx启动后，可运行浏览器测试：

```powershell
cd frontend
npm ci
npm test
```

如未安装浏览器，运行npx playwright install chromium；也可通过PLAYWRIGHT_EXECUTABLE_PATH指定已有浏览器。默认测试地址8088，可用APP_BASE_URL修改。测试会在实际后端创建带随机ui_前缀的账号并注销；注销记录与用户名/邮箱占用保留，密码哈希已清除。不要将端到端测试指向生产服务。

本机若遇到JDK网络证书或Windows管道临时路径错误，可在当前终端设置以下参数；只影响当前进程及子进程，不关闭TLS校验，不修改系统JDK：

```powershell
New-Item -ItemType Directory -Path 'D:\Gradle\tmp' -Force | Out-Null
$env:GRADLE_USER_HOME = 'D:\Gradle'
$env:JAVA_TOOL_OPTIONS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT -Djavax.net.ssl.trustStore=NONE -Djdk.net.unixdomain.tmpdir=D:/Gradle/tmp'
```

## 表结构

V1：app_user、auth_token、SPRING_SESSION、SPRING_SESSION_ATTRIBUTES。V2：project、media、operation_plan、media_task、output_file。V3：account_cleanup_job。Flyway另维护flyway_schema_history。

业务ID使用UUID字符串，日期字段保存UTC，媒体时间为毫秒。账号username/email规范化后唯一，媒体资源通过project.user_id检查归属；任务的plan_id唯一，防止同一方案重复执行。project/media/plan/task/output保留deleted_at用于后续逻辑删除。auth_token只存邮件令牌哈希，邮件流程尚待实现。

注销事务先停用账号、撤销全部令牌、软删除所属项目与媒体资源、取消活动任务，并写入持久化清理任务。后台每5秒处理一批文件清理，失败最多重试5次，过期执行租约可恢复。仅删除MEDIA_STORAGE_ROOT配置的存储目录内的文件，拒绝目录穿越和指向外部的父目录；默认目录为项目storage。清理状态与重试次数在account_cleanup_job中，失败记录写后台日志。

字幕、校对、索引及片段草稿表在相应业务阶段新增迁移，不创建空实现控制器或模拟成功接口。下一步推进真实媒体闭环。
