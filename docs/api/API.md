# AI音视频工作台：轻量版接口契约

版本：2.4.0。日期：2026-10-19。

Apifox选择OpenAPI/Swagger，导入同目录[openapi.json](./openapi.json)。本文与OpenAPI是一套契约，共52个接口；是否可用以x-implementation-status为准。2.0移除项目、分类和projectId：登录后直接选择功能、上传素材、处理并下载，不创建隐式默认项目。

## 1. 当前范围

账号、注册前邮箱验证、上传与检测保留，已实现素材及关联资源删除、明确参数MP4转换、目标体积压缩与MP3音频提取、方案版本控制、持久化任务、取消、结果预览及下载，当前共28个已实现接口。后台使用真实FFmpeg和ffprobe，不模拟成功。其他处理操作、单独删除结果、AI、字幕、检索与剪辑仍为计划，文档中的路径不等于功能已实现。上传区预览读取本地所选文件；处理结果播放器读取鉴权后的服务端MP4或MP3。

本地入口http://127.0.0.1:8088，Nginx转发8081。未配置SMTP时关闭注册，已有账号仍可登录；未安装或配置ffprobe时上传返回MEDIA_TOOL_UNAVAILABLE，不伪造素材就绪。

## 2. 返回和权限

业务JSON成功和异常统一Result<T>，字段code/message/data/requestId/details。成功code=SUCCESS，业务对象放data；无数据返回200及data:null。失败data为null，details始终数组，可含field/message。requestId只在外层，与X-Request-Id一致。创建/受理保留201/202，不使用204。文件流成功不套JSON，发送首字节前的应用错误仍返回Result。

ID为UUID，时间为UTC ISO 8601，媒体时长/位置为整数毫秒，大小为字节。分页page从1开始，pageSize默认20、最大100；data为items/page/pageSize/total，默认createdAt降序、id稳定次排序。

素材直接归属当前用户，方案关联素材，任务关联素材与方案，结果关联任务。归属从登录身份取得，客户端不得指定userId、ownerId、projectId或磁盘路径。列表只查本人记录，其他用户的资源ID和不存在的ID统一404，后续执行也检查整条归属链。

错误状态保留：请求格式/缺字段400，未登录401，CSRF403，资源不存在404，冲突409，过大413，不支持内容类型415，字段值不合法422，限流429并带Retry-After，依赖不可用503，内部故障500。不能所有失败都返回HTTP 200。

## 3. 账号与会话

登录不是JWT，是Spring Session JDBC保存的服务端会话。浏览器以HttpOnly AMW_SESSION Cookie携带不透明会话ID，服务端检查存在性、有效期与账号状态。不要放URL、localStorage或日志。生产HTTPS启用Secure，SameSite=Lax；仅本机HTTP可关闭Secure。

先GET /api/auth/csrf读取data.token/headerName，并保持匿名Cookie；写请求携带X-CSRF-Token。登录成功后采用data.csrfToken中的新值，Cookie也轮换。刷新后GET /api/users/me恢复身份。默认空闲30分钟、绝对12小时；rememberMe=true时空闲7天、绝对30天，以较早者为准。CSRF令牌不是登录令牌。

| 方法 | 路径 | 成功 | 含义 |
| --- | --- | --- | --- |
| GET | /api/auth/csrf | 200 | 获取CSRF |
| POST | /api/auth/registration-email-code | 200 | 发送注册验证码 |
| POST | /api/auth/register | 201 | 验证邮箱后创建账号 |
| POST | /api/auth/login | 200 | 登录 |
| POST | /api/auth/logout | 200 | 退出当前设备 |
| POST | /api/auth/logout-all | 200 | 退出所有设备 |
| GET / PATCH / DELETE | /api/users/me | 200 | 资料、改昵称、注销 |
| PUT | /api/users/me/password | 200 | 修改密码并退出 |
| GET | /api/system/capabilities | 200 | 真实能力与限制 |
| POST | /api/auth/password/forgot | 202 | 计划：找回邮件 |
| POST | /api/auth/password/reset | 200 | 计划：重置密码 |
| POST | /api/auth/email/verification | 202 | 计划：验证邮件 |
| POST | /api/auth/email/verify | 200 | 计划：验证邮件令牌 |
| GET | /api/users/me/sessions | 200 | 计划：设备列表 |
| DELETE | /api/users/me/sessions/{sessionId} | 200 | 计划：撤销某个会话 |

注册前先请求验证码，注册提交username/email/password/emailChallengeId/emailCode及可选displayName。验证码绑定邮箱、限时限次、单次使用；更换邮箱必须重新取码。验证码不出现在接口响应或日志。SMTP不可用时关闭注册；本地测试收件箱仅用于测试，不部署到生产。

username为4-32位字母/数字/下划线并规范化为小写；email去除首尾空白、按小写去重；displayName为1-50字符。新密码6-16个Unicode码点，允许字母、数字、符号，不强制字符类型组合；至少3种不同字符，不能全为空白或命中弱密码列表。不trim或截断，只保存随机盐Argon2id哈希。登录及旧密码核验仍接受1-128字符，兼容已有长密码，不能截断旧密码。账号重复统一ACCOUNT_ALREADY_EXISTS，不提供公开存在性查询。

登录时不存在、停用、密码错误统一INVALID_CREDENTIALS，认证内部故障500。注册不自动登录。退出当前设备撤销当前会话；改密、退出全部设备和注销撤销所有会话。已登录退出需CSRF，匿名退出幂等成功。

注销须currentPassword和confirmUsername。成功停用账号、撤销凭证、取消活动任务并软删除本人资源，持久化清理任务随后删除受控文件。账号不可恢复，用户名/邮箱保留占用；200不表示磁盘文件已经全部同步删除。

## 4. 视频上传与素材

| 方法 | 路径 | 成功 | 含义 |
| --- | --- | --- | --- |
| POST | /api/media | 202 | 无须项目，上传并异步检测 |
| GET | /api/media | 200 | 本人素材分页 |
| GET | /api/media/{mediaId} | 200 | 状态、元信息、错误 |
| POST | /api/media/{mediaId}/probe | 202 | 重试失败检测 |
| GET | /api/media/{mediaId}/preview | 200/206 | 计划：预览 |
| DELETE | /api/media/{mediaId} | 200 | 删除及关联清理 |

上传只允许一个multipart字段file，不接受额外归属或路径字段。浏览器自行生成boundary。默认单文件1GiB、15分钟；限制来自MediaProperties，可通过MEDIA_MAX_UPLOAD_SIZE、MEDIA_MAX_DURATION调整，capabilities返回当前值，部署时也要核对代理上限。

服务端生成受控文件名、流式保存，originalFilename仅展示。上传202返回PROBING及Location，后台ffprobe检测后变READY或FAILED。不靠扩展名或浏览器Content-Type判断。当前仅视频，支持目标MP4/MOV/MKV/WebM；不接受远程URL、播放列表或用户自定义命令。

metadata包含container/durationMs/width/height/videoCodec/hasAudio/audioCodec，尺寸应用旋转信息；无音轨audioCodec=null。无视频、损坏、超时长会FAILED，文件超大小413。检测进程限制耗时和输出大小，工作持久化并支持租约恢复，不启动无限线程。

查询FAILED素材仍返回200，错误位于data.error；前端按状态轮询。FAILED可重试，PROBING幂等202，READY为409。素材不返回storageKey或userId。本轮previewUrl为null，不宣称可预览；账号注销后旧素材ID不可访问。

DELETE /api/media/{mediaId}需要登录及CSRF，不需要密码或请求体。PROBING、READY、FAILED均可删除；事务内逻辑删除素材、关联方案、任务和结果，未完成任务标记CANCELLED，保留执行令牌以便清理半成品。提交后详情、列表、重试检测、方案执行、结果播放与下载都不能再访问这些资源。本人重复删除幂等返回200 Result.success()，不存在或他人素材统一404；账号及其他素材不受影响。

同一事务保存持久化清理任务，事务失败则不删除资源。磁盘文件后台清理，已在检测或处理的文件等待现有租约结束后再清理，默认分别最多剩余2分钟/7分钟；立即不可访问不等于物理文件已经删除。清理覆盖原视频、MP4/MP3结果、未发布产物和两遍编码日志，仅限存储根目录内的受控文件，失败最多重试5次。页面有确认框，取消不发删除请求，网络失败保留确认框供重试；删除后清空相关播放器，忽略删除前已发出轮询的迟到响应。

## 5. 方案、任务与结果

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST / GET | /api/operation-plans | 创建方案 / 本人分页 |
| GET / PATCH | /api/operation-plans/{planId} | 查询 / 按版本修改 |
| POST | /api/operation-plans/{planId}/execute | 确认执行 |
| GET | /api/tasks | 本人任务分页，可选mediaId |
| GET | /api/tasks/{taskId} | 状态、进度及结果 |
| POST | /api/tasks/{taskId}/cancel | 取消 |
| GET | /api/outputs | 本人结果分页，可选mediaId |
| GET | /api/outputs/{outputId} | 查询 |
| DELETE | /api/outputs/{outputId} | 计划：删除 |
| GET | /api/outputs/{outputId}/preview | 预览文件流 |
| GET | /api/outputs/{outputId}/download | 下载文件流 |

创建方案提供mediaId，parameters/instruction恰好一个。本轮实现明确参数transcode、compress与extract_audio。视频处理为outputFormat=mp4、resolutionPreset=source或720p、audioMode=keep；compress额外要求targetSizeBytes。音频提取只接受operation=extract_audio、outputFormat=mp3两个字段。自然语言请求503 AI_UNAVAILABLE，其他操作或额外参数422。状态READY/EXECUTED；NEEDS_INPUT留给后续AI。修改和执行使用expectedVersion原子检查，执行后冻结，重复确认复用同一任务。页面一次点击创建并确认明确参数方案，无需管理方案列表。旧四字段转换快照保持兼容。

压缩目标为整数字节数，至少32768字节、小于原文件且不超过服务端输出上限。按时长预留容器和音轨预算，以H.264两遍编码和AAC 96kbps执行；无音轨不生成声音。预算不足在入队前422 COMPRESSION_TARGET_UNREACHABLE；完成后再次检查时长、尺寸、编码、音轨和实际大小，结果须不超过目标且小于原文件，否则任务FAILED且不发布输出。两遍共享总超时，编码日志受大小限制，并在成功、失败、取消、租约回收及账号清理时删除。不以目标大小截断视频。页面目标体积以MB展示，1MB按1048576字节换算。

720p限制短边最多720、保持比例、不放大小视频，尺寸向下取偶数。输出H.264/yuv420p、AAC，无音轨不生成声音，应用旋转并清理源元数据；实际转码后用ffprobe验证编码、尺寸、音轨与时长。后续裁切、静音、字幕烧录仍未开放。工具参数固定，不经过shell，不接受路径、URL或任意命令。任务保存参数快照，不跟随后续编辑变化。

提取音频固定读取第一条音轨，生成192kbps、44.1kHz双声道MP3，剔除视频、封面及源元数据。缺少音轨在入队前返回422 SOURCE_HAS_NO_AUDIO；缺少libmp3lame编码器返回503 AUDIO_EXTRACTION_UNAVAILABLE。capabilities按编码器独立声明extract_audio，不依赖视频编码器。输出用ffprobe重新验证MP3格式、编码、无视频流及真实音轨时长，失败为AUDIO_EXTRACTION_FAILED且不发布。首条音轨比视频短时不补静音、不按视频时长截断或拼接。音频结果contentType=audio/mpeg、文件名后缀-audio.mp3；metadata中width/height/videoCodec为null，durationMs是实际音轨时长。

任务QUEUED/RUNNING/CANCELLING/CANCELLED/SUCCEEDED/FAILED，数据库队列最多20个活动任务，每个实例串行转换。默认5分钟进程超时、7分钟租约、结果最大1GiB；TRANSCODE_TIMEOUT、TRANSCODE_MAX_OUTPUT_SIZE可覆盖，租约必须大于超时加1分钟。排队工作重启后继续，过期运行任务变FAILED/TASK_INTERRUPTED，不自动重复执行；重试需新建方案。排队取消立即CANCELLED，运行取消CANCELLING，工具每300ms检查并终止；校验中的取消至多等待当前ffprobe超时。运行百分比未知为null，成功后100。仅校验成功且归属、租约仍有效时在事务中发布输出；取消、注销或失败不发布半成品。

MP4与MP3结果预览均需鉴权并支持单段Range/206/Content-Range，含后缀、开放结尾；非法或多段Range忽略返回200，越界416并返回Result。下载忽略Range发送完整文件，Content-Disposition包含UTF-8文件名及ASCII回退。文件丢失或大小异常410 OUTPUT_UNAVAILABLE，其他用户资源404，URL不暴露磁盘路径。失败、取消、过期租约及注销清理同样覆盖MP3半成品。

## 6. 字幕、检索与剪辑（计划）

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST | /api/media/{mediaId}/transcriptions | 创建字幕任务 |
| GET | /api/media/{mediaId}/transcript | 当前字幕 |
| GET / PATCH | /api/transcripts/{transcriptId} | 查询 / 编辑 |
| GET | /api/transcripts/{transcriptId}/srt | SRT文件 |
| POST | /api/transcripts/{transcriptId}/corrections | AI校对 |
| GET | /api/corrections/{correctionId} | 建议详情 |
| POST | /api/corrections/{correctionId}/apply | 按版本应用 |
| POST | /api/media/{mediaId}/search | 字幕语义搜索 |
| POST | /api/media/{mediaId}/clip-recommendations | 片段建议 |
| GET / POST | /api/clip-drafts | 本人草稿 / 创建 |
| GET / PATCH / DELETE | /api/clip-drafts/{draftId} | 查询 / 编辑 / 删除 |
| POST | /api/clip-drafts/{draftId}/exports | 幂等导出 |

字幕保留原稿与编辑版本、稳定segment.id，时间满足0<=startMs<endMs<=素材时长。编辑和应用校对使用expectedVersion。检索证据必须来自真实字幕版本，找不到时空数组，不能编造。AI/ASR未配置不开放。

草稿属于用户并关联一个素材，不是项目。导出使用版本及idempotencyKey：同键同请求复用任务，不同请求409，失败重试换新键。导出快照不受后续编辑影响，字幕按裁切/拼接重映射。多轨、跨素材拼接、团队共享、分类和支付不在本版。

## 7. 迁移与验收

V1-V6保持不变。V5将素材、方案、任务、结果改为直接用户归属；V6新增转换租约与队列准入锁，将方案/任务/结果的JSON列统一为JSON文本，便于MySQL/H2一致读写。V7为现有account_cleanup_job增加media_id和scope_key，复用清理队列，保留旧账号清理任务；账号清理及每份素材清理分别唯一，复合外键约束素材归属。历史项目元数据只归档保存，不参与新业务。不创建默认项目，不保留旧项目接口。

本轮验收：旧能力不回退；删除鉴权与CSRF、本人重复删除、他人/不存在资源、检测中删除不能复活、关联任务与文件不可访问、清理范围、失败回滚、正在提取音频时删除、并发执行与删除、MP4/MP3半成品与编码缓存清理。浏览器覆盖桌面/手机确认框、取消与Esc、网络失败重试、旧轮询不能恢复已删记录、其他素材保留和刷新恢复。迁移先在副本验证，应用到本机项目库前备份；浏览器测试不可指向生产服务。
