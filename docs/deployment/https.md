# HTTPS 部署与验收

## 两种运行模式

| 模式 | 入口 | 后端设置 |
| --- | --- | --- |
| IDEA/本机开发 | `http://127.0.0.1:8088`，或直连开发端口 | 不启用 public；不信任代理头，Cookie 默认非 Secure |
| 公网演示 | 有效证书的 `https://你的域名` | `SPRING_PROFILES_ACTIVE=public`；默认只监听 `127.0.0.1:8081` |

`public`模式启用Secure/HttpOnly/SameSite=Lax会话Cookie，非安全请求统一返回403 `Result`，错误码`HTTPS_REQUIRED`。它只信任来自精确回环地址的Nginx转发信息，不信任整个内网。HTTP到HTTPS的跳转在Nginx入口完成，后端不按用户提交的Host拼接跳转地址。不要使用`server.forward-headers-strategy=framework`或信任所有IP来绕过校验。

HTTPS保护浏览器到入口的传输，不替代密码哈希、CSRF、账号隔离和云端凭据加密。修复HTTP下拼接报错不表示公网HTTP适合输入密码、验证码、API Key或上传私人视频。HTTP页面的风险提示不是安全防护，页面本身在明文链路中也可能被篡改。

## 本机 Nginx 终止 TLS

1. 准备自己的域名及浏览器信任的证书，域名与证书SAN须匹配。私钥仅保存在本机受限目录，不提交Git、不放在静态资源目录中。
2. 将`deploy/nginx/nginx.https.conf.template`复制为`.local/nginx-public.conf`。替换所有`media.example.com`，将两个证书路径改为本机绝对路径，Windows路径使用`D:/...`形式。默认相对证书路径以Nginx安装目录为基准，不以配置文件目录为基准。
3. Nginx模板默认本机8089跳转、本机8443提供TLS，避免占用系统80/443；后端8081不公开。直接公网部署时按防火墙策略调整Nginx监听地址和80/443端口；不要把MySQL、推理服务或后端端口一起暴露。
4. 使用环境变量或私有外部配置启动后端，启用`SPRING_PROFILES_ACTIVE=public`。端口默认8081；若覆盖`SERVER_PORT`，也须修改Nginx的`proxy_pass`。`.env.example`只是示例，程序不自动读取`.env`。
5. 显式public环境不会加载`application-default.properties`中的`.local/mail.properties`。邮件凭据请使用环境变量，或启动参数`--spring.config.import=optional:file:./.local/database.properties,optional:file:./.local/mail.properties`显式导入；不要把SMTP密码写入公共配置。
6. 在仓库根目录先检查，再由部署者决定启动/重载：

```powershell
.\deploy\run-nginx.ps1 -ConfigPath .\.local\nginx-public.conf -CheckOnly
.\deploy\run-nginx.ps1 -ConfigPath .\.local\nginx-public.conf
```

`-CheckOnly`只校验指定源文件，不覆盖运行配置，也不启动或重载常驻服务。Nginx在Windows上检查时可能短暂检测监听端口，检查结束即释放；如端口被系统保留或其他程序占用，应调整监听端口，不终止其他程序。HTTPS模板不会替换本机HTTP默认配置，证书未准备好时不要直接启用。

## 樱花 FRP / 内网穿透

推荐使用TCP隧道透传TLS到本机Nginx的8443端口，由本机Nginx提供证书。访客访问`https://域名:公网端口`；非443公网端口不可省略。模板8089端口的HTTP跳转也须改成相同的固定公网域名和HTTPS端口，或不公开HTTP入口。域名能解析到节点且证书有效是前提，不能把现有HTTP地址改个前缀就当作已配置HTTPS。

普通TCP隧道可能让Nginx只能看到frpc的本机IP，导致多个访客共享IP限额。当前配置不会为“分辨访客”而信任任意`X-Forwarded-For`。需要真实IP时，确认隧道支持并在两端配套启用PROXY protocol；Nginx须具备realip模块，仅信任实际frpc地址。启用前必须单独验证，不能只改一端。未配置时保留限流，不为了演示取消安全检查。

如果使用服务商HTTPS建站隧道在云节点终止TLS，须另行确认云端到本机这段的加密和请求头清洗策略。当前本机HTTP代理会覆盖协议头为HTTP，不能直接与public环境组合，否则会收到`HTTPS_REQUIRED`。不要盲目透传访客提供的协议/IP头；根据该隧道的可信入口配置专用代理后再验收。

## 超时与大文件

本机和HTTPS代理的`proxy_read_timeout`、`proxy_send_timeout`均为180秒，高于本地模型默认120秒。调整`LOCAL_AI_TIMEOUT_SECONDS`后也要调整代理及穿透平台的上限；外部平台可能仍有更短的超时。代理禁用自动切换上游重试，不重复提交可能计费的AI请求或上传。

3GiB是单文件限制，代理额外留1MiB给multipart封装。大文件可能同时占用Nginx请求缓存、Servlet临时目录和媒体存储，应确保相关磁盘均有余量；当前没有自动磁盘配额、全站容量预警和留存淘汰，公网测试应限制参与人数并人工监控，不声称已具备生产容量保障。

## 上线前验收

- 浏览器证书有效，`window.isSecureContext`为true，无证书警告或混合内容；不要关闭证书验证来验收。
- 普通域名HTTP下，开发模式的拼接加载、复制、排序和导出不因UUID调用报错；公网模式的明文请求被拒绝。
- HTTPS匿名访问可获取CSRF；登录后AMW_SESSION含Secure、HttpOnly、SameSite=Lax；刷新、退出和改密行为正常。
- 公网HTTP入口跳向固定HTTPS域名和正确端口；外部无法直连后端、数据库及模型端口。
- 伪造Forwarded/X-Forwarded-*不能绕过HTTPS要求或伪造来源；不同访客IP的限流分开统计（隧道真实IP需另验）。
- 120秒内的模型请求不会被本机代理提前截断；上传、Range预览、下载和3GiB边界由真实公网链路再验收。

自动测试覆盖浏览器HTTP/HTTPS兼容、Secure Cookie、HTTPS拦截和Tomcat可信代理边界，不代替实际域名、证书和穿透节点验收。

参考：[Spring Boot代理配置](https://docs.spring.io/spring-boot/4.0/how-to/webserver.html#howto.webserver.use-behind-a-proxy-server)、[Nginx HTTPS](https://nginx.org/en/docs/http/configuring_https_servers.html)、[Nginx可信来源IP](https://nginx.org/en/docs/http/ngx_http_realip_module.html)。
