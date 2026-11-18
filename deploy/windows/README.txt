FrameFlow Windows 运行包
======================

默认登录账号：admin
默认登录密码：Aa018779
首次启动完成数据库迁移后自动创建，无需先注册或配置 SMTP。
已有同名账号保留原密码和状态；修改密码或注销后，重启不会恢复初始密码或账号状态。

一、首次使用
1. 解压/复制整个文件夹到本机可读写的位置。不要只拿出 JAR，也不要放进 Program Files。
2. 自行安装并启动 MySQL 8.x。在 config/database.properties 填写数据库地址、端口、库名、用户名、密码。
   默认库名 frameflow。程序会自动创建该库，然后用 Flyway 创建表及默认账号，不需要导入开发数据库。
   首次使用的数据库账号必须有创建该库及表的权限；Access denied 代表用户名、密码或授权不正确。
3. 双击 Start.cmd（或“启动.cmd”），等待提示 ready 后浏览器会自动打开。
   默认网址：http://127.0.0.1:8088；后台端口 18081，仅监听本机，不占用 IDEA 的 8081。
4. 停止用 Stop.cmd，状态用 Status.cmd，文件/端口预检查用 Check.cmd。
   停止前等待处理任务完成。停止程序不会关闭你安装的 MySQL。

二、配置文件
config/database.properties：数据库配置。密码不要加引号；字面反斜杠写成两个反斜杠。
config/mail.properties：SMTP 配置。默认关闭发信，未包含任何人的邮箱授权码。
  默认账号可直接登录；开放新账号注册时需要邮件验证码，填好 SMTP 后设 REGISTRATION_MAIL_ENABLED=true，再重启。
  例如 QQ 邮箱使用 smtp.qq.com、465、SSL=true；密码填邮箱提供的 SMTP 授权码。
  SMTP_USERNAME 与 SMTP_FROM 填发信邮箱。默认账号由迁移脚本创建，不包含原开发数据库的用户和素材。
config/launcher.json：网页监听 IP、网页端口、后端端口、浏览器开关及 Java 内存上限。
  端口/IP 在这里改，启动时会生成匹配的 Nginx 配置，不必到 JAR 里改。
  每个字段的中文说明位于 _comments 对象，只修改它下面的实际配置值；JSON 不支持 //、# 注释。
config/application.properties：其他 Spring Boot 配置；可以填写项目已有的配置项。
  高级用法：DB_URL 可用环境变量指定自定义 JDBC URL；自行保证其中包含自动建库选项。

三、访问方式
仅本机：保持 listenAddress 为 127.0.0.1。
局域网：改成 0.0.0.0，允许防火墙入站 httpPort，再访问 http://服务器局域网IP:8088。
樱花/其他内网穿透：本地目标 127.0.0.1:8088；浏览器访问穿透服务分配的地址。
不要把 backendPort 暴露到外网。默认 HTTP 可用于本机/受控测试；公网正式访问请在入口配置 HTTPS。
Nginx 的实际生效配置在 run/nginx.conf，由启动脚本生成，直接修改会被下次启动覆盖。
如果需要 HTTPS，请在独立 TLS 入口终止 HTTPS，或按项目 deploy/nginx 中的模板修改启动脚本。
确保浏览器、TLS 入口和后端的安全 Cookie/受信代理设置一致；只改端口不等于启用 HTTPS。

四、已包含和未包含
包含：最新前端（已打进 JAR）、后端 JAR、Java 21 运行环境、Nginx、FFmpeg/FFprobe、脚本。
运行不需要 IDEA、Node.js、Gradle，也不要求另装 Java；支持 Windows x64。
未包含：MySQL 服务、原有用户/素材、私人配置、云端 API Key、本地 AI 模型。
FFmpeg 常规处理可直接使用。云端 AI 在网站设置中填写自己的厂商凭据。
本地模型默认关闭；如另行运行本地模型服务，可在 application.properties 配置 LOCAL_AI_ENABLED 等对应项。

五、数据、日志和搬迁
data/storage 保存上传素材与处理结果；data/keys 保存云端凭据的本机加密密钥。
备份时要一起保存 MySQL 数据库、data/storage 和 data/keys。丢失密钥后需要重新填写云端凭据。
logs/backend.log 为后端日志；logs/nginx.error.log 为代理日志；启动输出在 *.stdout.log/*.stderr.log。
可整体移动运行文件夹（包括中文/空格路径），但必须先 Stop，再到新位置 Start。
不要在运行期间复制或删除文件；不要把填过密码的 config、data、日志发给别人或提交 GitHub。
Start 失败会清理本次启动的进程；不会自动结束其他软件占用的端口。
环境变量可覆盖配置文件里的 DB_* / SMTP_* 等变量，排查时注意旧环境变量。

六、第三方软件
Java 的 LICENSE/legal 位于 runtime/java，Nginx 许可证在 tools/nginx/docs，
FFmpeg 的 LICENSE/README 位于 tools/ffmpeg（本机现有 FFmpeg 为 GPL 构建）。
这些文件须随运行包保留。FFmpeg 源码及构建信息见其 README 与 ffmpeg.exe -version。
源码与打包脚本仍在原项目；此文件夹是运行产物，不包含开发工具和 Git 历史。
