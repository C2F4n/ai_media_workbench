# AI音视频工作台：完整第一版接口文档

版本：1.0.0（完整接口契约，部分账号基础已实现）

日期：2026-10-14

配套OpenAPI / Apifox导入文件：[openapi.json](./openapi.json)

## 1. 范围与文档约定

本文件覆盖交接文档中的完整第一版，不只覆盖阶段A。当前已完成后端三层基础、账号与会话接口、简易账户页面，以及项目/素材/方案/任务/结果的表和实体。阶段A/B/C标签表示后续开发顺序，完整56个接口不代表都已实现。

已实现并通过集成测试的10个接口：GET /api/auth/csrf、POST /api/auth/register、POST /api/auth/login、POST /api/auth/logout、POST /api/auth/logout-all、GET /api/users/me、PATCH /api/users/me、PUT /api/users/me/password、DELETE /api/users/me、GET /api/system/capabilities。注册、登录、刷新恢复、退出、修改密码和账号注销经过Nginx及真实MySQL的浏览器验证。

其余接口仍待实现；项目管理、媒体处理、邮件、字幕和语义搜索不能据此宣称可用。简易页面位于src/main/resources/static，本机通过Nginx访问http://127.0.0.1:8088；其代理后端8081。OpenAPI的x-implementation-status区分IMPLEMENTED与PLANNED。

本文与openapi.json构成唯一一套接口契约，共56个接口。OpenAPI定义字段、必填、枚举与请求响应，本文解释业务行为、处理参数、开发顺序和验收。修改接口时同时更新两份文件；阶段A的必要细节已合并到第13节。

| 阶段 | 功能 |
| --- | --- |
| 账号基础（与A一起开发） | 注册、登录、初始密码、修改密码、退出登录、账号注销、本人资料与会话 |
| 邮件依赖能力 | 邮箱验证、忘记密码、令牌重置；配置真实邮件服务后开放 |
| A | 项目、视频上传检测、MP4/source或720p方案、真实异步任务、播放下载 |
| B | 中文时间戳字幕、编辑/原稿对照、SRT、单片段裁切 |
| C | AI校对、语义搜索、片段推荐、草稿与拼接、MP3、压缩、静音、字幕烧录 |

第一版不设计支付、管理员后台、团队共享、第三方登录、手机验证码、多轨编辑、跨素材拼接和视频画面理解。注册方式先采用用户名+邮箱+密码；这是根据现有Web应用方向选定的开发默认方案，可在实现前调整。

## 2. 通用约定

- 建议本地地址 `http://localhost:8080`，路径前缀 `/api`；尚未验证实际监听地址。
- JSON直接返回资源，无额外data包装；成功JSON与错误JSON包含requestId。
- ID为UUID字符串；时间戳使用UTC ISO 8601，媒体位置是整数毫秒，大小是字节。
- 非空与空值按OpenAPI返回，空列表用[]；204没有响应体，不能尝试解析JSON。
- 列表统一page从1开始、pageSize默认20且最大100，响应为items/page/pageSize/total/requestId。
- 列表默认按createdAt降序、id作稳定次排序；项目按updatedAt降序。分页结果不承诺并发新增时的快照一致性。
- 请求体拒绝未声明字段；非法JSON/缺少字段/互斥字段错误400，合法结构但值不合规422。
- 上传multipart字段为file，每次一个；浏览器自行生成boundary。上传默认上限1 GiB，时长15分钟。
- 全部业务资源由服务端从会话判断归属，客户端不传ownerId/userId，不允许任意本机文件路径或任意命令。
- 未登录401，已登录但资源不存在或属于别人404；CSRF失败403，限流429并带Retry-After。
- 能力不可用503，排队满503；处理失败是任务的FAILED状态，不伪造200成功成品。

### 2.1 能力查询

`GET /api/system/capabilities`无需登录，返回registration、emailVerification、passwordRecovery、aiPlans、asr、semanticSearch、clipRecommendations、mediaTool，以及maxUploadBytes、maxDurationMs、supportedOperations、requestId。

只返回实际可用能力，不暴露凭证或磁盘路径。未开放的按钮可禁用，但后端仍必须校验。注册功能关闭时注册接口返回503 `REGISTRATION_DISABLED`。未配置邮件时验证/找回接口返回503 `EMAIL_UNAVAILABLE`；未配置模型或ASR分别返回503 `AI_UNAVAILABLE`/`ASR_UNAVAILABLE`。列表、历史任务不因模型暂不可用而消失。

## 3. 登录会话与CSRF

采用服务端会话令牌，通过HttpOnly Cookie `AMW_SESSION`携带，不设计JWT/刷新令牌接口。服务端校验会话存在性、绝对/空闲有效期与账号有效状态；令牌伪造、过期或撤销返回401。浏览器请求使用同源或 `credentials: include`，视频标签、预览和下载也通过Cookie鉴权。

生产Cookie：HttpOnly、Secure、SameSite=Lax、Path=/，不设置Domain，关闭跨站任意Origin访问。仅本机HTTP联调可显式关闭Secure；上线必须HTTPS。不能将会话ID放URL、localStorage或日志。登录成功必须旋转匿名会话ID，旧匿名会话不能升级后继续使用。

建议会话默认绝对有效期12小时、空闲30分钟；rememberMe=true时绝对有效期30天、空闲7天并设置持久Cookie。服务端以两者更早到期者判定，会话响应expiresAt返回当前有效截止时间；这些是产品默认值，部署配置与前端文案需一致。

### 3.1 浏览器请求顺序

1. `GET /api/auth/csrf`获取token/headerName，同时建立或使用匿名会话Cookie，响应Cache-Control: no-store。
2. 注册、登录、重置密码等POST请求也通过 `X-CSRF-Token`携带token。
3. 登录200返回新的csrfToken并更新Cookie，后续POST/PATCH/PUT/DELETE使用新token；GET不要求CSRF头。
4. 页面刷新后重新获取CSRF，并用 `GET /api/users/me`恢复登录状态。
5. 修改密码、退出全部设备或注销后会话失效；重新获取匿名CSRF并登录。

所有写请求（包括搜索POST和multipart上传）都要求CSRF头；邮件令牌不是CSRF令牌。过期会话的业务请求先401，当前有效会话的CSRF缺失/不匹配403。`POST /api/auth/logout`在没有有效登录会话时可直接清Cookie并204，有有效会话时仍必须校验CSRF。

前后端优先同源代理。分离部署时只允许明确配置的Origin，允许credentials与X-CSRF-Token/Range，暴露Location、Retry-After、Content-Disposition、Content-Range；不能用通配Origin配合Cookie。

## 4. 账号、密码与注销

| 方法 | 路径 | 登录 | 成功 | 功能 |
| --- | --- | --- | --- | --- |
| GET | `/api/auth/csrf` | 否 | 200 | 获取CSRF令牌 |
| POST | `/api/auth/register` | 否 | 201 | 注册并设置初始密码 |
| POST | `/api/auth/login` | 否 | 200 | 登录 |
| POST | `/api/auth/logout` | 可选 | 204 | 退出当前设备 |
| POST | `/api/auth/logout-all` | 是 | 204 | 退出所有设备 |
| POST | `/api/auth/password/forgot` | 否 | 202 | 申请密码重置邮件 |
| POST | `/api/auth/password/reset` | 否 | 204 | 重置密码 |
| POST | `/api/auth/email/verification` | 是 | 202 | 发送/重发本人邮箱验证邮件 |
| POST | `/api/auth/email/verify` | 否 | 204 | 验证邮箱 |
| GET | `/api/users/me` | 是 | 200 | 查询本人资料 |
| PATCH | `/api/users/me` | 是 | 200 | 修改昵称 |
| PUT | `/api/users/me/password` | 是 | 204 | 校验旧密码后修改密码 |
| GET | `/api/users/me/sessions` | 是 | 200 | 查看登录设备 |
| DELETE | `/api/users/me/sessions/{sessionId}` | 是 | 204 | 撤销本人一个会话 |
| DELETE | `/api/users/me` | 是 | 204 | 注销账号 |

### 4.1 注册与初始密码

`POST /api/auth/register`

```json
{
  "username":"creator_01",
  "email":"creator@example.com",
  "password":"ExamplePassphrase-2026!",
  "displayName":"创作者"
}
```

username为4-32个英文字母、数字、下划线，按小写形式规范化后查重，之后第一版不允许修改。email去除首尾空白并验证格式，查重策略按应用统一小写规范化；只处理普通ASCII邮件地址，国际化地址后续支持。displayName选填，省略时默认用户名，提供时去除首尾空白后1-50字符。

新密码15-128个Unicode码点，可包含空格与中文，不能trim、截断或擅自规范化；不要求固定大小写/符号组合。拒绝明显弱密码，返回422 `WEAK_PASSWORD`。confirmPassword由前端比较，不需要重复传输。

201返回User：id/username/displayName/email/emailVerified/createdAt/updatedAt/requestId，不返回密码或哈希。注册不自动登录，emailVerified初始false。用户名/邮箱不可用统一409 `ACCOUNT_ALREADY_EXISTS`，不能另设公开的邮箱存在性查询。

用户名登录可在邮箱未验证时使用。注册不依赖发送邮件成功；用户登录后通过邮箱验证接口单独发送验证邮件。密码找回必须依赖已验证邮箱，前端在账号设置展示当前验证状态与实际能力。

密码只保存带盐的Argon2id哈希，不存明文或可逆密文，不使用单次SHA-256/MD5。具体成本参数在部署前基准测试，最低配置参考[OWASP密码存储建议](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)。密码、会话Cookie与邮件令牌禁止进入请求日志。

### 4.2 登录

`POST /api/auth/login`

```json
{"username":"creator_01","password":"ExamplePassphrase-2026!","rememberMe":false}
```

200返回User、expiresAt、csrfToken、requestId，Cookie通过Set-Cookie设置。用户名不存在、密码错误或账号已停用统一401 `INVALID_CREDENTIALS`，不透露具体哪项错误。注册/登录/密码/邮件接口需按账号与来源限流，429包含Retry-After；具体阈值后端配置，不在前端硬编码。

### 4.3 登录后修改密码

`PUT /api/users/me/password`

```json
{"currentPassword":"ExamplePassphrase-2026!","newPassword":"AnotherPassphrase-2026!"}
```

当前密码错误403 `CURRENT_PASSWORD_INVALID`，新密码不合规422，密码与旧密码相同422 `PASSWORD_UNCHANGED`。成功204，撤销全部登录会话（含当前设备），清除Cookie，用户重新登录。不提供通过userId修改别人的密码接口。

### 4.4 忘记密码与重置

`POST /api/auth/password/forgot`请求 `{ "email": "creator@example.com" }`。邮件服务可用时，无论邮箱是否存在或是否已验证，始终返回相同202文案：“如果该邮箱可用于找回密码，你将收到重置邮件。”响应时序也应尽量一致。仅向存在且已验证的账号发送。

令牌由后端安全随机生成，数据库保存其哈希与过期时间，有效15分钟、单次使用，绑定账号。邮件发到注册邮箱，前端重置页面从URL片段读取令牌，随后清除地址栏片段，再通过请求体发送；不把令牌放API查询参数或日志。

`POST /api/auth/password/reset`

```json
{"token":"example-reset-token","newPassword":"AnotherPassphrase-2026!"}
```

成功204，原子更新密码、消耗令牌、撤销该账号全部会话及其他重置令牌，不自动登录。无效/过期/已使用统一400 `INVALID_OR_EXPIRED_TOKEN`。邮件未配置时forgot对所有邮箱统一503，不能将密码返回给用户或用固定验证码。设计依据见[OWASP找回密码流程](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)。

### 4.5 邮箱验证

登录后 `POST /api/auth/email/verification`无请求体，只向本人注册邮箱发送。已验证时仍202，不重复发送；服务不可用503。验证令牌30分钟有效、单次使用；重发后旧令牌失效，数据只保存令牌哈希。

`POST /api/auth/email/verify`请求 `{ "token": "example-email-token" }`，成功204，将邮箱设为已验证，不自动登录、不改变密码。无效/过期/已使用令牌统一400；前端随后重新查询User。邮件链接采用与重置一致的片段/请求体传递方式。

### 4.6 退出登录与设备管理

退出当前设备只撤销当前会话；退出所有设备撤销该用户全部会话，两者都清除当前Cookie并204。后台已确认的媒体任务继续执行，重新登录后能查看；退出登录不删除素材。

设备列表返回会话的公开id、current、createdAt、lastSeenAt、expiresAt、deviceLabel，不返回真正的会话令牌。DELETE会话ID必须校验归属；撤销当前会话时也清Cookie。

### 4.7 注销账号

`DELETE /api/users/me`

```json
{"currentPassword":"ExamplePassphrase-2026!","confirmUsername":"creator_01"}
```

界面需要用户主动确认；后端校验当前密码与规范化后的用户名。成功先原子停用账号、撤销会话、撤销邮件令牌并标记所属项目/素材/方案/任务/字幕/草稿/结果不可访问，随后204且清Cookie。后台停止活动任务并清理物理文件，清理失败可恢复重试；不能先删文件再让注销事务失败。

第一版不提供恢复账号。逻辑注销后用户名/邮箱仍保留占用，重新注册返回409，直到后续明确设计身份释放策略。密码哈希在注销时清除。204表示账号已不可用，不表示所有磁盘字节已立即清理；后台通过account_cleanup_job持久化队列删除存储根目录内的所属文件，失败重试并可恢复执行租约。业务行软删除保留，保留策略上线前另行确定。注销后任何旧登录令牌、媒体URL与下载URL都不得继续访问。

## 5. 项目与素材管理

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| POST | `/api/projects` | 201 | 创建项目，name必填 |
| GET | `/api/projects` | 200 | 本人项目分页，可选keyword |
| GET | `/api/projects/{projectId}` | 200 | 项目基础信息 |
| PATCH | `/api/projects/{projectId}` | 200 | 修改name |
| DELETE | `/api/projects/{projectId}` | 204 | 删除项目及关联资源 |
| POST | `/api/projects/{projectId}/media` | 202 | 上传并异步检测 |
| GET | `/api/projects/{projectId}/media` | 200 | 素材分页 |
| GET | `/api/media/{mediaId}` | 200 | 状态、kind、媒体信息、可用预览地址 |
| GET | `/api/media/{mediaId}/preview` | 200/206 | 播放适合浏览器预览的原素材 |
| POST | `/api/media/{mediaId}/probe` | 202 | 重试失败的检测 |
| DELETE | `/api/media/{mediaId}` | 204 | 删除素材与关联资源 |

项目详情只返回基础字段，关联素材/方案/任务/结果/片段使用各自分页接口；不再返回无限增长的ID数组。素材状态仍PROBING/READY/FAILED，完整第一版增加kind=VIDEO/AUDIO。音频metadata的width/height/videoCodec为null，hasAudio=true。

阶段A先接视频，后续开放音频。首批视频验证目标为MP4/MOV/MKV/WebM，音频为MP3/WAV/M4A，最终以真实解码能力为准。原素材可处理不等于可直接播放；不支持浏览器预览时previewUrl=null，不能伪造预览。

重新检测仅允许FAILED；PROBING的重复请求返回同一素材202，不重复入队；READY或原文件丢失409。上传损坏文件/无可用轨道/超时长通过素材FAILED与error展示。超大小在上传时413。

项目/素材删除遇到活动检测或任务时409 `RESOURCE_BUSY`。用户先取消任务后重试；PROBING不能通过转码任务取消接口取消，应等检测终态或服务器超时处理。逻辑删除后关联资源全部不可访问，文件异步清理。账号注销可整体停止工作，不受普通删除的BUSY限制。

## 6. 媒体方案与执行

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| POST | `/api/projects/{projectId}/operation-plans` | 201 | 明确参数或自然语言创建方案 |
| GET | `/api/projects/{projectId}/operation-plans` | 200 | 项目方案分页 |
| GET | `/api/operation-plans/{planId}` | 200 | 查询最新方案 |
| PATCH | `/api/operation-plans/{planId}` | 200 | 修改并增加版本 |
| POST | `/api/operation-plans/{planId}/execute` | 202/200 | 确认版本并幂等执行 |

请求只能提供parameters或instruction其中一个。方案状态为READY（可确认）、NEEDS_INPUT（需补问或修改）、EXECUTED（已创建任务且冻结）。初始version=1，每次成功修改递增1；修改和执行均以expectedVersion原子校验。创建方案的Location指向方案GET接口。前端保存确认时的版本，冲突后重新展示和确认，不能自动执行最新版本。

| operation | 完整parameters字段 | 阶段 |
| --- | --- | --- |
| transcode | operation/outputFormat=mp4/resolutionPreset=source或720p/audioMode=keep | A |
| trim | operation/outputFormat=mp4/startMs/endMs/audioMode=keep | B |
| compress | operation/outputFormat=mp4/targetSizeBytes/resolutionPreset/audioMode=keep | C |
| extract_audio | operation/outputFormat=mp3 | C |
| mute | operation/outputFormat=mp4/resolutionPreset | C |
| burn_subtitles | operation/outputFormat=mp4/transcriptId/transcriptVersion/resolutionPreset/audioMode=keep | C |

字段列表为该操作完整参数，无用户自由命令。capabilities.supportedOperations用于判断开放范围；未开放的明确参数422 `UNSUPPORTED_OPERATION`，自然语言请求未开放功能返回NEEDS_INPUT并解释。转码/裁切/静音/烧录须视频；提取声音须音轨，非法组合422。声音清晰的中文仅限制ASR，不限制普通媒体转换。

裁切满足0<=startMs<endMs<=素材时长，按精确时间重新编码，帧边界误差按真实工具验证。压缩需展示体积与画质取舍：目标必须正数，后端检查可行码率，达不到目标时拒绝或任务FAILED `TARGET_SIZE_UNACHIEVABLE`，最终产物必须sizeBytes<=targetSizeBytes后才能成功。

字幕烧录需同一素材的已确认字幕ID/version；执行保存不可变字幕快照，后续修改不改变已有任务。EXECUTED方案只能查询，不能PATCH；再提要求或重试失败需创建新方案。

## 7. 任务与结果

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| GET | `/api/projects/{projectId}/tasks` | 200 | 项目任务分页 |
| GET | `/api/tasks/{taskId}` | 200 | 状态、阶段、进度与结果 |
| POST | `/api/tasks/{taskId}/cancel` | 202/200 | 取消任务 |
| GET | `/api/projects/{projectId}/outputs` | 200 | 输出分页 |
| GET | `/api/outputs/{outputId}` | 200 | 输出元信息 |
| GET | `/api/outputs/{outputId}/preview` | 200/206 | MP4/MP3预览 |
| GET | `/api/outputs/{outputId}/download` | 200 | MP4/MP3/SRT下载 |
| DELETE | `/api/outputs/{outputId}` | 204 | 删除单个结果 |

任务新增kind=MEDIA_PROCESSING/TRANSCRIPTION/CLIP_EXPORT，sourceId分别对应方案/素材/剪辑草稿，sourceVersion分别为方案版本/null/草稿版本。非媒体方案任务planId/planVersion/parameters为null；媒体任务parameters保留完整快照。

状态：QUEUED -> RUNNING -> SUCCEEDED/FAILED；取消运行中先CANCELLING后CANCELLED，取消队列中可直接CANCELLED。已CANCELLED重复取消200；SUCCEEDED/FAILED不能取消，返回409 `TASK_NOT_CANCELLABLE`。取消与完成竞争时由原子终态决定，不能把已成功文件重新标记取消。

stage为WAITING/TRANSCODING/TRANSCRIBING/EXPORTING/VERIFYING/DONE/FAILED/CANCELLED。取消处理中stage保留实际阶段。progressPercent未知null，完成前最多99，成功100；终态finishedAt非空，失败error可读。2秒轮询，终态停止。

转写成功outputs=[]，transcript={transcriptId,version}；媒体/片段导出成功outputs含一个结果，transcript=null。结果类型为video/mp4、audio/mpeg、application/x-subrip；SRT metadata=null、previewUrl=null，播放器请求409 `OUTPUT_PREVIEW_UNAVAILABLE`。支持Range的预览遵守第13节规则，Content-Type按实际类型返回。

任务只在验证真实产物后SUCCEEDED。结果文件意外丢失410 `OUTPUT_UNAVAILABLE`；显式删除结果则404，并从Task.outputs移除该条，保留成功历史。输出删除不删除原素材。后台启动应恢复队列或将中断任务FAILED，不允许永远卡住。

## 8. 字幕、校对与SRT

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| POST | `/api/media/{mediaId}/transcriptions` | 202 | 创建ASR任务 |
| GET | `/api/media/{mediaId}/transcript` | 200 | 当前字幕 |
| GET | `/api/transcripts/{transcriptId}` | 200 | 字幕详情/历史版本 |
| PATCH | `/api/transcripts/{transcriptId}` | 200 | 人工编辑 |
| GET | `/api/transcripts/{transcriptId}/srt` | 200 | SRT下载 |
| POST | `/api/transcripts/{transcriptId}/corrections` | 201 | AI校对建议 |
| GET | `/api/corrections/{correctionId}` | 200 | 查询校对建议 |
| POST | `/api/corrections/{correctionId}/apply` | 200 | 采纳选中建议 |

转写请求 `{ "language": "zh-CN", "force": false }`，需READY且有音轨。同素材已有活动转写时返回同一任务，避免重复计费；已有字幕且force=false时409 `TRANSCRIPT_ALREADY_EXISTS`。force=true允许重新识别，成功创建新的Transcript并切换素材最新指针；失败保留旧稿，旧稿与已执行快照仍可读。

Transcript包含id/projectId/mediaId/version/language/segments/originalSegments/createdAt/updatedAt/requestId。segments用于当前编辑，originalSegments保留该轮ASR原稿。每段id/startMs/endMs/text，ID在编辑中稳定，新插入段由客户端生成UUID，后端验证同稿内唯一。

字幕GET与SRT GET可选query version，不传取当前版本，传入取不可变历史快照，不存在404。PATCH请求expectedVersion与全量segments：必须有序、不重叠、0<=start<end<=素材时长，text非空，成功版本+1；冲突409 `TRANSCRIPT_VERSION_CONFLICT`，不能覆盖他人的后续编辑。

前端根据播放器currentTime高亮对应时间段，点击段按startMs跳转，不需要额外“点击字幕”接口。编辑成功使旧语义索引失效，并为新版本安排索引构建；索引未就绪时搜索409 `SEARCH_INDEX_NOT_READY`，不能返回旧稿的结果。

AI校对请求expectedVersion，可选instruction。201返回Correction的id/transcriptId/baseVersion/suggestions/createdAt/requestId，建议包含segmentId/originalText/suggestedText/reason。创建建议不修改字幕。

采纳请求 `{ "expectedVersion": 1, "segmentIds": ["77777777-7777-4777-8777-777777777777"] }`，当前版本须与baseVersion一致，只改选中段，成功字幕版本+1。重复采纳或过期建议409；拒绝建议无需写接口，保留原稿即可。

SRT使用UTF-8、顺序编号和HH:MM:SS,mmm时间，attachment下载，不把JSON当SRT。生成与烧录必须正确处理换行、特殊字符和字体，字体/ASR依赖需写入运行说明。

## 9. 语义搜索与推荐

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| POST | `/api/media/{mediaId}/search` | 200 | 按意思查询字幕片段 |
| POST | `/api/media/{mediaId}/clip-recommendations` | 200 | 推荐带证据的片段 |

搜索请求query（1-500字符）/transcriptVersion/limit（默认10、最多20）；推荐另需maxTotalDurationMs（1,000-900,000毫秒），limit默认3、最多10。请求必须基于最新可用稿版本，版本冲突409，不跨素材检索。

结果包含mediaId/transcriptId/transcriptVersion、matches或clips、message、requestId。搜索返回时间范围、score（0-1相关度，非事实置信度）、evidence；推荐返回title/reason/startMs/endMs/evidence。evidence包含segmentId/startMs/endMs/text，必须由后端验证确实来自该版本真实字幕。

没有相关内容200返回空数组和“未找到相关内容”，不编造字幕或替代片段。推荐总时长不能超过用户限制，生成结果仅是待确认候选，不能自动导出。前端点击证据跳转原素材，并允许用户调整边界、标题和顺序后保存草稿。

## 10. 片段库、拼接与导出

| 方法 | 路径 | 成功 | 功能 |
| --- | --- | --- | --- |
| POST | `/api/projects/{projectId}/clip-drafts` | 201 | 保存片段草稿 |
| GET | `/api/projects/{projectId}/clip-drafts` | 200 | 草稿分页 |
| GET | `/api/clip-drafts/{draftId}` | 200 | 草稿详情 |
| PATCH | `/api/clip-drafts/{draftId}` | 200 | 修改与排序 |
| DELETE | `/api/clip-drafts/{draftId}` | 204 | 删除草稿 |
| POST | `/api/clip-drafts/{draftId}/exports` | 202/200 | 导出已确认版本 |

草稿创建含mediaId/name/transcriptVersion/clips；手动按时间选片段可以transcriptVersion=null。clips每项id/title/startMs/endMs，数组顺序就是拼接顺序，1-50段，允许主动重复区间，每段范围须有效，总时长最多15分钟。首版只支持同素材多个片段。

草稿包含version和totalDurationMs，后端计算总时长，不能信任前端传入的总时长。PATCH完整替换name/transcriptVersion/clips并要求expectedVersion，成功版本+1，冲突409 `CLIP_VERSION_CONFLICT`。

导出示例：

```json
{
  "expectedVersion":1,
  "format":"mp4",
  "burnSubtitles":true,
  "transcriptVersion":2,
  "idempotencyKey":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
}
```

format为mp4/mp3/srt；只有MP4允许burnSubtitles=true。MP3需要源音轨。SRT和字幕烧录必须提供同素材可读取的字幕版本；普通MP4/MP3导出时transcriptVersion必须null，避免误以为采用了字幕。请求指定版本在导出时验证存在性并保存不可变快照，任务不跟随之后的草稿或字幕修改。

按用户+草稿+idempotencyKey唯一去重；同键同完整请求返回同任务，活动时202、终态200；同键参数不同409 `IDEMPOTENCY_CONFLICT`。队列拒绝或校验失败不消耗键；重试失败导出必须使用新键。首次执行须当前草稿版本匹配expectedVersion，已有同键请求的重放先验证请求相同后返回原任务，不因草稿之后变化而误建任务。

片段字幕按每段与源字幕的时间交集裁切，将时间减去片段起点并加上前面片段总时长，输出时间轴从0开始。若片段顺序改变或重复，字幕按同样顺序复制，不能保留原视频的绝对时间。纯SRT不做媒体转换，但仍作为短后台导出任务生成真实文件。MP4裁切/拼接时统一编码与音轨参数并验证结果。

草稿有活动导出任务时删除409。创建新草稿或编辑草稿不修改已执行任务快照。

## 11. 错误、权限与未实现行为

统一错误结构与阶段A一致：code/message/requestId/details，details始终数组。403可能为CSRF_INVALID或CURRENT_PASSWORD_INVALID，前端必须依据code而非只看HTTP状态。

| 场景 | HTTP / code |
| --- | --- |
| 会话失效 | 401 UNAUTHENTICATED |
| 登录不正确 | 401 INVALID_CREDENTIALS |
| CSRF失败 | 403 CSRF_INVALID |
| 当前密码错误 | 403 CURRENT_PASSWORD_INVALID |
| 弱密码/相同密码 | 422 WEAK_PASSWORD / PASSWORD_UNCHANGED |
| 注册冲突 | 409 ACCOUNT_ALREADY_EXISTS |
| 邮件令牌失败 | 400 INVALID_OR_EXPIRED_TOKEN |
| 请求限流 | 429 RATE_LIMITED |
| AI/ASR/邮件未接入 | 503 AI_UNAVAILABLE / ASR_UNAVAILABLE / EMAIL_UNAVAILABLE |
| 未开放操作 | 422 UNSUPPORTED_OPERATION，自然语言则NEEDS_INPUT |
| 字幕/草稿版本冲突 | 409 TRANSCRIPT_VERSION_CONFLICT / CLIP_VERSION_CONFLICT |
| 索引未就绪 | 409 SEARCH_INDEX_NOT_READY |
| 无音轨 | 422 AUDIO_TRACK_REQUIRED |
| 资源活动中 | 409 RESOURCE_BUSY |
| 幂等键冲突 | 409 IDEMPOTENCY_CONFLICT |
| 无法压到目标体积 | 422或任务FAILED，TARGET_SIZE_UNACHIEVABLE |

上传、方案、任务和结果每次都校验父项目及当前用户归属；删除父资源后不能从子资源URL绕过。Range鉴权必须在发送首字节前完成。拒绝用户伪造素材时间、字幕证据、所属账号或系统路径。

会话实现细节参考[OWASP会话管理](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)。这些参考用于设计，不表示安全功能已实现或审计通过。

## 12. 联调与验收

Apifox选择OpenAPI/Swagger格式并导入同目录openapi.json，导入后应看到56个接口。文件已通过标准OpenAPI校验。解析时应用需要能连接Apifox服务器；如代理影响连接，关闭代理或调整连接设置后重试。先调用capabilities和csrf，注册后登录，保持Cookie并将最新CSRF放入写请求头，再用真实返回的ID/version推进业务链路。文件预览的Range与Cookie还需在真实浏览器验证，单纯JSON Mock不算通过。

账号验收覆盖：注册与重复注册、登录成功/失败、刷新恢复、过期401、跨账号404、缺失CSRF403、改密码后旧密码不能登录且所有会话失效、退出当前/全部设备、邮箱令牌单次使用与过期、未配置邮件503、注销后旧链接不可访问。示例密码/令牌都是文档样例，不能用于真实账号。

媒体验收先通过真实上传、媒体信息检测、方案确认、转码、播放与下载，再验证取消任务、重试检测、分页和删除。字幕验收验证真实中文时间戳、原稿不被覆盖、版本冲突、播放同步、SRT时间格式；检索验证证据真实、找不到时空结果、新稿索引失效；片段导出验证拼接顺序、总时长、字幕时间重映射与重复提交幂等。

账号基础已实现，其余能力仍需逐模块实现。邮件、模型、ASR、FFmpeg和存储依赖必须真实配置并验证，未配置时按能力查询提示未开放；相应业务接口实现后按契约返回不可用，不返回固定成功数据。

## 13. 媒体闭环细节与示例

### 13.1 上传与媒体检测

上传接收流不得整体加载进内存。后端生成受控存储文件名，originalFilename只用于展示；收完并持久化后202，不等待ffprobe。不能仅凭扩展名或客户端Content-Type判定有效。

超过1 GiB在上传时413 FILE_TOO_LARGE；收完后发现损坏、无有效轨道或超过15分钟，素材FAILED并保留可理解的error。检测队列满503 TASK_QUEUE_FULL，清理未接受的临时文件，不返回虚假的已受理资源。width/height为应用旋转信息后的展示尺寸，无音轨时audioCodec=null。

### 13.2 MP4与720p语义

输出视频H.264、yuv420p，存在音轨时编码AAC，MP4启用faststart。audioMode=keep保留原音轨，无音轨不新增声音；不改变播放速度，不覆盖原文件。

source保持旋转后的展示尺寸与宽高比，必要时向下取偶数。720p将短边限制在720像素，保持宽高比、不放大，尺寸向下取偶数：1920x1080 -> 1280x720，1080x1920 -> 720x1280，640x360 -> 640x360。不拉伸、不裁切，非方形像素须保持展示宽高比并规范化输出像素比例；应用旋转后清除重复旋转标记。

720p不保证小于某个文件大小。目标体积使用compress操作并检查真实结果。输出检测至少验证容器、编码、尺寸、音轨、时长和文件可读性，验证成功才公布结果URL；误差容限需根据工具验证后配置。

### 13.3 方案修改、幂等与恢复

PATCH使用完整parameters替换或基于当前方案的instruction重新生成，两者互斥。用parameters修改后instruction=null，避免展示过时需求；失败不改变方案和版本。模型调用完成后保存时仍需核对版本，不能覆盖期间发生的编辑。

自然语言清楚提出“转MP4”而未提尺寸时可使用source，summary必须明确。含糊或未开放的操作返回NEEDS_INPUT、parameters=null，questions给出具体补问；不静默改成其他操作。模型不可用503，明确参数模式仍可独立验证媒体链路。

执行时同一个planId最多关联一个taskId，数据库唯一约束和事务保证参数快照、任务创建和方案冻结原子完成。第一次202；同一已确认版本重复请求返回同一任务，活动状态202、终态200，不再入队。版本不同409 PLAN_VERSION_CONFLICT；NEEDS_INPUT不能执行。队列满503时方案保持READY，不能留下孤立任务。

EXECUTED方案不再修改，后续新要求或失败重试创建新方案。媒体执行不依赖先生成字幕。进程中断后恢复已受理队列，或将中断任务标记FAILED PROCESSING_INTERRUPTED，不永久卡在运行状态。

### 13.4 预览Range与下载

预览不使用JSON包装。无Range返回200；支持有效单段Range，例如bytes=0-1048575、bytes=1048576-、bytes=-1024，返回206以及正确的Accept-Ranges: bytes、Content-Length、Content-Range: bytes start-end/total。Content-Type按真实MP4/MP3返回，Content-Disposition为inline。

有效范围超出文件边界返回416并带Content-Range: bytes */total。语法错误的Range或合法多段Range忽略并返回完整200，本版不生成multipart多段响应。不能用不匹配的Content-Range返回206。原素材未就绪或不能浏览器播放409 MEDIA_PREVIEW_UNAVAILABLE。

下载返回完整200二进制文件，忽略Range，不承诺断点续传；Content-Disposition为attachment，Content-Length与真实文件一致。中文文件名正确编码UTF-8 filename*并提供ASCII filename回退，不能直接拼入响应头。

鉴权在发送首字节前完成；不存在/已删除/无权限404，已知结果文件意外丢失410。流式传输，不把大文件整体读入内存。用户取消播放或下载不改变已完成任务。

### 13.5 完整转码示例

以下ID仅用于展示字段和资源关系；联调使用真实响应返回的ID。所有写请求携带登录Cookie与X-CSRF-Token。

1. POST /api/projects，请求：

```json
{
  "name": "产品介绍视频"
}
```

201响应：
```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "name": "产品介绍视频",
  "createdAt": "2026-10-14T03:00:00Z",
  "updatedAt": "2026-10-14T03:00:00Z",
  "requestId": "req-project"
}
```

2. POST /api/projects/{projectId}/media，multipart字段file上传视频。

202响应：
```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "originalFilename": "product-intro.mov",
  "sizeBytes": 31457280,
  "status": "PROBING",
  "metadata": null,
  "previewUrl": null,
  "error": null,
  "createdAt": "2026-10-14T03:00:00Z",
  "updatedAt": "2026-10-14T03:00:00Z",
  "requestId": "req-media",
  "kind": "VIDEO"
}
```

3. GET /api/media/{mediaId}，轮询至READY或FAILED。

READY响应：
```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "originalFilename": "product-intro.mov",
  "sizeBytes": 31457280,
  "status": "READY",
  "metadata": {
    "container": "mov",
    "durationMs": 120000,
    "width": 1920,
    "height": 1080,
    "videoCodec": "h264",
    "hasAudio": true,
    "audioCodec": "aac"
  },
  "previewUrl": null,
  "error": null,
  "createdAt": "2026-10-14T03:00:00Z",
  "updatedAt": "2026-10-14T03:00:00Z",
  "requestId": "req-media",
  "kind": "VIDEO"
}
```

4. POST /api/projects/{projectId}/operation-plans，使用明确参数先验证处理流程。

```json
{
  "mediaId": "22222222-2222-4222-8222-222222222222",
  "parameters": {
    "operation": "transcode",
    "outputFormat": "mp4",
    "resolutionPreset": "720p",
    "audioMode": "keep"
  }
}
```

201响应：
```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "mediaId": "22222222-2222-4222-8222-222222222222",
  "version": 1,
  "status": "READY",
  "instruction": "转成MP4，分辨率改成720p",
  "parameters": {
    "operation": "transcode",
    "outputFormat": "mp4",
    "resolutionPreset": "720p",
    "audioMode": "keep"
  },
  "summary": "转为MP4，短边最多720像素，保持宽高比并保留原音轨。",
  "questions": [],
  "warnings": [],
  "taskId": null,
  "createdAt": "2026-10-14T03:00:00Z",
  "updatedAt": "2026-10-14T03:00:00Z",
  "requestId": "req-plan"
}
```

自然语言模式请求同样的mediaId，改为instruction“转成MP4，分辨率改成720p”，不同时提供parameters。

5. POST /api/operation-plans/{planId}/execute，确认当前版本。

```json
{
  "expectedVersion": 1
}
```

返回202及任务对象，Location指向GET /api/tasks/{taskId}。后台真正执行，前端按2秒间隔查询。

6. GET /api/tasks/{taskId}，成功响应：
```json
{
  "id": "44444444-4444-4444-8444-444444444444",
  "projectId": "11111111-1111-4111-8111-111111111111",
  "planId": "33333333-3333-4333-8333-333333333333",
  "planVersion": 1,
  "mediaId": "22222222-2222-4222-8222-222222222222",
  "parameters": {
    "operation": "transcode",
    "outputFormat": "mp4",
    "resolutionPreset": "720p",
    "audioMode": "keep"
  },
  "status": "SUCCEEDED",
  "stage": "DONE",
  "progressPercent": 100,
  "outputs": [
    {
      "id": "55555555-5555-4555-8555-555555555555",
      "taskId": "44444444-4444-4444-8444-444444444444",
      "filename": "product-intro-mp4.mp4",
      "contentType": "video/mp4",
      "sizeBytes": 20971520,
      "metadata": {
        "container": "mp4",
        "durationMs": 120000,
        "width": 1280,
        "height": 720,
        "videoCodec": "h264",
        "hasAudio": true,
        "audioCodec": "aac"
      },
      "previewUrl": "/api/outputs/55555555-5555-4555-8555-555555555555/preview",
      "downloadUrl": "/api/outputs/55555555-5555-4555-8555-555555555555/download",
      "createdAt": "2026-10-14T03:00:00Z"
    }
  ],
  "error": null,
  "createdAt": "2026-10-14T03:00:00Z",
  "startedAt": "2026-10-14T03:00:00Z",
  "finishedAt": "2026-10-14T03:00:00Z",
  "requestId": "req-task",
  "kind": "MEDIA_PROCESSING",
  "sourceId": "33333333-3333-4333-8333-333333333333",
  "sourceVersion": 1,
  "transcript": null
}
```

通过outputs中的previewUrl播放、downloadUrl下载。下载后独立验证格式、宽高、声音、时长与播放跳转，不以示例文件或固定成功响应代替真实处理。

### 13.6 媒体错误示例与验收素材

HTTP错误：
```json
{
  "code": "PLAN_VERSION_CONFLICT",
  "message": "方案已经更新，请刷新后重新确认。",
  "requestId": "req-conflict",
  "details": [
    {
      "field": "expectedVersion",
      "message": "当前版本为2，请求版本为1。"
    }
  ]
}
```

Media/Task中的error只包含code/message，不重复requestId。检测错误包括UNSUPPORTED_MEDIA、MEDIA_PROBE_FAILED、MEDIA_DURATION_EXCEEDED；处理错误包括MEDIA_TOOL_UNAVAILABLE、TRANSCODE_FAILED、OUTPUT_VALIDATION_FAILED、PROCESSING_INTERRUPTED、STORAGE_ERROR。反向代理或网络中断可能没有JSON响应，前端也须显示可理解的网络失败。

至少验证1080p横屏、竖屏、小视频不放大、无音轨、旋转元数据、损坏文件、超时长与超大小、模型不可用、超范围指令、版本冲突、并发重复确认、处理失败、文件丢失与播放器跳转。明确参数流程通过仅表示媒体闭环完成；阶段A完整验收还要求真实自然语言方案生成通过。
