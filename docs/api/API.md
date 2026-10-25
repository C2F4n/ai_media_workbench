# AI音视频工作台：轻量版接口契约

版本：2.24.0。日期：2026-10-24。

2.24变更：字幕识别请求新增可选model，能力接口新增asrModels目录。百炼适配千问语音3.1流式、Fun-ASR实时和原Paraformer，均直接传私有音频并使用真实句级时间戳；前端独立选择语音模型，确认框标出实际ID。未指定model的旧客户端/旧任务保持原行为。无新接口、表或迁移，不自动回退模型。

2.23变更：云端文字与语音调用按鉴权、权限、余额/额度、模型、限流、请求、网络、超时和服务故障分别提示。统一Result及异步任务error保留稳定错误码，不回传厂商原文，不将云端401误作网站登录失效。无新接口、表或迁移；保存个人配置仍不发起付费验证。

2.22变更：新增分批字幕翻译建议POST /api/transcripts/{id}/translations及能力字段subtitleTranslation。前端支持10种目标语言、逐段编辑译文、仅译文/双语预览，确认后复用PATCH字幕另存新版本，再下载SRT或烧录视频。识别原文和旧版本保留，无新表或迁移。共58个接口，44个已实现。译文生成不等于保存，未完成或停止的批次不发布半成品，不自动重试付费请求。

2.21变更：新增豆包/火山方舟文字供应商textProvider=doubao；千问入口明确为“千问 / 阿里云百炼”，仍使用bailian值并兼容已有配置。豆包使用北京官方Chat接口，必须填写API Key和已开通的Model ID或Endpoint ID，不默认代选模型。无新接口、表或迁移，仍为57个接口、43个已实现。

2.20变更：个人文字模型新增OpenAI、阿里云百炼（北京），与DeepSeek共用JSON意图/校对/检索协议。保留deepseek历史凭据槽位，PERSONAL通过textProvider=deepseek/openai/bailian选择实际供应商；旧密文和省略字段仍按原供应商读取。切换供应商必须重新填写密钥，不跨供应商保留秘密。无新接口、表或迁移；共57个接口，43个已实现。设置页面分文字AI和语音识别两类。

2.19变更：重新生成方案时，instruction完整替换旧要求，不再拼接“补充”或继承旧参数。新增DELETE方案与DELETE任务记录接口，均需登录和CSRF，统一200 Result.success()。处理记录与保存方案独立成页；V11新增media_task.history_hidden_at，仅隐藏终态记录，不删除原素材、方案或结果文件。

2.18变更：SERVER来源由站点公共云端配置改为本地千问，PERSONAL/OFF和已有接口路径保持兼容，无新表/迁移。方案生成、单句校对、字幕检索/片段建议共用来源路由；本地不支持语音识别。所有来源失败均不自动回退或重试，明确参数功能不依赖模型。旧章节提到DeepSeek的文字能力现在也可使用本地千问。

Apifox选择OpenAPI/Swagger，导入同目录[openapi.json](./openapi.json)。本文与OpenAPI是一套契约，共58个接口；是否可用以x-implementation-status为准。2.0移除项目、分类和projectId：登录后直接选择功能、上传素材、处理并下载，不创建隐式默认项目。

## 1. 当前范围

当前共44个已实现接口：账号、注册前邮箱验证、个人云端凭据、素材上传检测/预览/删除、转换/压缩/裁切/静音/MP3提取/字幕烧录/同源多段拼接、明确参数或自然语言生成的版本方案、持久化任务/取消、结果预览/下载/删除、云端字幕识别/编辑/SRT/单句校对/翻译与双语版本，以及按字幕内容检索和片段建议。缺少云端凭据时关闭对应调用，已有方案仍可确认执行，已有字幕仍可编辑、导出和本地烧录。跨素材和拼接字幕重映射仍未实现。实现与本地协议测试通过不代表真实云端效果已经验收。

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

发码独立采用1分钟窗口，默认同一邮箱成功发送3次、同一IP成功发送5次；在途请求先占位防并发，发送失败返还配额，503不进入前端冷却。成功后页面显示20秒重发倒计时；429按Retry-After实际剩余秒数等待。登录及账号注册等其他限流仍保持原有5分钟窗口。SMTP接受不保证最终进入收件箱，超时等失败也无法保证供应商未投递，不自动后台重发。

username为4-32位字母/数字/下划线并规范化为小写；email去除首尾空白、按小写去重；displayName为1-50字符。新密码6-16个Unicode码点，允许字母、数字、符号，不强制字符类型组合；至少3种不同字符，不能全为空白或命中弱密码列表。不trim或截断，只保存随机盐Argon2id哈希。登录及旧密码核验仍接受1-128字符，兼容已有长密码，不能截断旧密码。账号重复统一ACCOUNT_ALREADY_EXISTS，不提供公开存在性查询。

登录时不存在、停用、密码错误统一INVALID_CREDENTIALS，认证内部故障500。注册不自动登录。退出当前设备撤销当前会话；改密、退出全部设备和注销撤销所有会话。已登录退出需CSRF，匿名退出幂等成功。

账号参数校验的details提供具体中文field/message，例如password对应“密码需要6–16个字符。”、emailCode对应“邮箱验证码需要6位数字。”；不返回提交的密码、验证码或其他被拒绝值。字段明细不改变原有Result、错误码和HTTP状态。前端注册、登录及改密表单展示字段规则，失焦/提交时在对应字段下提示，提交失败定位第一项；编辑后重新校验，服务端字段错误在实际修改前保留。多个问题只在表单底部汇总数量，详细原因仍在各字段下。注册和改密按Unicode码点计数并提前提示弱密码，登录/当前密码保留1–128字符旧密码兼容，不增加字符类型组合要求。账号重复及登录失败仍不区分用户名/邮箱存在性或具体凭据错误。

注销须currentPassword和confirmUsername。成功停用账号、撤销凭证、取消活动任务并软删除本人资源，持久化清理任务随后删除受控文件。账号不可恢复，用户名/邮箱保留占用；200不表示磁盘文件已经全部同步删除。

## 4. 视频上传与素材

| 方法 | 路径 | 成功 | 含义 |
| --- | --- | --- | --- |
| POST | /api/media | 202 | 无须项目，上传并异步检测 |
| GET | /api/media | 200 | 本人素材分页 |
| GET | /api/media/{mediaId} | 200 | 状态、元信息、错误 |
| POST | /api/media/{mediaId}/probe | 202 | 重试失败检测 |
| GET | /api/media/{mediaId}/preview | 200/206 | 本人兼容原视频在线预览 |
| DELETE | /api/media/{mediaId} | 200 | 删除及关联清理 |

上传只允许一个multipart字段file，不接受额外归属或路径字段。浏览器自行生成boundary。默认单文件3GiB、15分钟；限制来自MediaProperties，可通过MEDIA_MAX_UPLOAD_SIZE、MEDIA_MAX_DURATION调整，capabilities返回当前值，部署时也要核对代理上限。

服务端生成受控文件名、流式保存，originalFilename仅展示。上传202返回PROBING及Location，后台ffprobe检测后变READY或FAILED。不靠扩展名或浏览器Content-Type判断。当前仅视频，支持目标MP4/MOV/MKV/WebM；不接受远程URL、播放列表或用户自定义命令。

metadata包含container/durationMs/width/height/videoCodec/hasAudio/audioCodec，尺寸应用旋转信息；无音轨audioCodec=null。无视频、损坏、超时长会FAILED，文件超大小413。检测进程限制耗时和输出大小，工作持久化并支持租约恢复，不启动无限线程。

查询FAILED素材仍返回200，错误位于data.error；前端按状态轮询。FAILED可重试，PROBING幂等202，READY为409。素材不返回storageKey或userId。账号注销后旧素材ID不可访问。

原视频预览开放READY视频中MP4/MOV族的H.264配AAC/无音轨，以及Matroska/WebM的VP8/VP9/AV1配Opus/Vorbis/无音轨；按实际容器及编码判断，不信任扩展名或上传MIME。符合条件时previewUrl非null，分别以video/mp4或video/webm发送原字节；最终播放能力取决于浏览器。HEVC等其他编码返回null，不即时转码。端点仍检查归属、状态、受控路径、可读性及大小；他人/已删除404，未就绪、不兼容、文件丢失或大小变化409 MEDIA_PREVIEW_UNAVAILABLE。

预览成功原样返回video/mp4文件流、inline文件名及Cache-Control:no-store，支持单段Range（开放结尾/后缀）、200/206；无效语法或多段Range忽略返回完整200，越界416附Content-Range及Result错误。原素材与输出共用MediaStreams，输出下载仍忽略Range并完整200。页面刷新/选择历史素材可恢复播放，刷新同一素材列表不重置播放位置；失败显示重新加载按钮，切换、删除或退出会清空对应播放器。撤销访问只能阻止后续请求，已发送/缓冲的数据不能追回。

DELETE /api/media/{mediaId}需要登录及CSRF，不需要密码或请求体。PROBING、READY、FAILED均可删除；事务内逻辑删除素材、关联方案、任务和结果，未完成任务标记CANCELLED，保留执行令牌以便清理半成品。提交后详情、列表、重试检测、方案执行、结果播放与下载都不能再访问这些资源。本人重复删除幂等返回200 Result.success()，不存在或他人素材统一404；账号及其他素材不受影响。

同一事务保存持久化清理任务，事务失败则不删除资源。磁盘文件后台清理，已在检测或处理的文件等待现有租约结束后再清理，默认分别最多剩余2分钟/7分钟；立即不可访问不等于物理文件已经删除。清理覆盖原视频、MP4/MP3结果、未发布产物和两遍编码日志，仅限存储根目录内的受控文件，失败最多重试5次。页面有确认框，取消不发删除请求，网络失败保留确认框供重试；删除后清空相关播放器，忽略删除前已发出轮询的迟到响应。

## 5. 方案、任务与结果

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST / GET | /api/operation-plans | 创建方案 / 本人分页 |
| GET / PATCH | /api/operation-plans/{planId} | 查询 / 按版本修改 |
| DELETE | /api/operation-plans/{planId} | 删除保存的方案，不删除已生成任务或文件 |
| POST | /api/operation-plans/{planId}/execute | 确认执行 |
| GET | /api/tasks | 本人任务分页，可选mediaId |
| GET | /api/tasks/{taskId} | 状态、进度及结果 |
| DELETE | /api/tasks/{taskId} | 从记录列表移除终态任务，不删除文件 |
| POST | /api/tasks/{taskId}/cancel | 取消 |
| GET | /api/outputs | 本人结果分页，可选mediaId |
| GET | /api/outputs/{outputId} | 查询 |
| DELETE | /api/outputs/{outputId} | 单独删除一个结果 |
| GET | /api/outputs/{outputId}/preview | 预览文件流 |
| GET | /api/outputs/{outputId}/download | 下载文件流 |

创建方案提供mediaId，parameters/instruction恰好一个。明确参数支持transcode、compress、trim、mute、extract_audio、burn_subtitles、join_clips、export和workflow；自然语言支持除burn_subtitles以外的操作，2.17优先用workflow表示连续处理，不自动挑选字幕。旧转换/压缩为outputFormat=mp4、resolutionPreset=source或720p、audioMode=keep；compress额外要求targetSizeBytes。旧裁切只接受operation=trim、outputFormat=mp4、startMs、endMs、audioMode=keep五字段。静音三字段，音频提取只接受operation=extract_audio、outputFormat=mp3两字段。拼接四字段、烧录六字段和组合导出见下文。未开放操作或额外参数422。状态NEEDS_INPUT/READY/EXECUTED，修改和执行使用expectedVersion，执行后冻结，重复确认复用同一任务。旧调用契约保持兼容。

自然语言示例：`{"mediaId":"素材UUID","instruction":"保留前5秒，转成360p，静音后导出"}`，仍使用POST /api/operation-plans并返回201 Result，不新增接口。2.17模型优先生成workflow的trim→resize→mute→export步骤；“取前5秒和最后5秒，顺序拼接再缩放”生成join_clips→resize→export步骤。360p表示分辨率，不索要目标体积；“发回来”表示生成本站结果下载链接。仅向所选模型发送当前完整要求、受控元信息、字节数、工具支持列表、导出格式/编码与输出大小限制；修改时不发送旧要求或旧参数。不会发送原视频、音轨、文件名、存储路径或凭据。单次35秒、最多3072输出token，默认每用户5分钟20次；文字调用共用最多2个并发请求，不自动付费重试。

只接受一份完整参数对象或固定问题代码；有序数组仅允许出现在workflow.steps中，不接受任意命令、路径、URL。参数经过操作及导出格式/编码白名单、类型、每步当前时长/体积、音轨与工具校验；非法模型返回422 AI_PLAN_FAILED，不创建方案或任务。要求不足返回NEEDS_INPUT、parameters=null及固定questions：OPERATION_REQUIRED、TARGET_SIZE_REQUIRED、TRIM_RANGE_REQUIRED、CLIP_RANGES_REQUIRED、UNSUPPORTED_REQUEST、CONFLICTING_REQUIREMENTS。“剪切5秒”未明确保留/删除或片段顺序应追问。READY与NEEDS_INPUT的PATCH instruction均为完整新要求，不合并旧提示词、不向模型传旧参数；单份最多2000码点，超限在模型调用前422 INVALID_PARAMETERS。成功版本+1，失败保留原版，NEEDS_INPUT不可执行。

生成方案不会入队，必须用户检查参数后显式POST execute。AI 处理页可重写完整要求、查看方案、确认执行及恢复最近10条方案中的最新自然语言方案；修改输入后旧确认失效。执行响应丢失可重试同一方案/版本，不重复任务。生成/修改的云端等待不持有数据库事务或账号锁，落库前重新核验账号、素材和方案版本；等待期间删除/注销或版本变更会拒绝迟到结果。模型理解仍可能有误，参数合法不代表意图必然正确。

以下为旧单功能参数的执行规则；新增格式与组合参数见5.1，旧调用不受影响。压缩目标为整数字节数，至少32768字节、小于原文件且不超过服务端输出上限。按时长预留容器和音轨预算，以H.264两遍编码和AAC 96kbps执行；无音轨不生成声音。预算不足在入队前422 COMPRESSION_TARGET_UNREACHABLE；完成后再次检查时长、尺寸、编码、音轨和实际大小，结果须不超过目标且小于原文件，否则任务FAILED且不发布输出。两遍共享总超时，编码日志受大小限制，并在成功、失败、取消、租约回收及账号清理时删除。不以目标大小截断视频。页面目标体积以MB展示，1MB按1048576字节换算。

720p限制短边最多720、保持比例、不放大小视频，尺寸向下取偶数。转换/压缩输出H.264/yuv420p、AAC，无音轨不生成声音，应用旋转并清理源元数据；实际转码后用ffprobe验证编码、尺寸、音轨与时长。工具参数固定，不经过shell，不接受路径、URL或任意命令。任务保存参数快照，不跟随后续编辑变化。

静音固定移除全部音轨，不仅关闭播放器声音。resolutionPreset为source或720p，不接受audioMode等额外字段；已无音轨素材也允许处理。结果为H.264/yuv420p MP4，文件名后缀-muted.mp4，metadata.hasAudio=false、audioCodec=null；校验时要求无音轨、尺寸/编码匹配，实际时长差不超过max(250ms, 源时长/1000)。失败MUTE_FAILED且不发布结果。原素材不变，复用版本、任务幂等、取消、鉴权播放/下载和删除清理；静音本身不新增表或迁移。capabilities在ffprobe及H.264/AAC编码器可用时声明mute。

裁切startMs/endMs必须是可用long表示的整毫秒，满足0<=startMs<endMs<=素材时长，区间至少500ms；不接受字符串、小数、负值或越界，创建/修改/执行都会校验，失败422 INVALID_PARAMETERS且不入队。输出固定原展示分辨率（向下取偶数）、H.264/AAC MP4、文件名后缀-trimmed.mp4；使用输出侧seek和重新编码，不用关键帧复制替代所选区间。保留区间内可用的第一条音轨，若音轨早已结束允许无音轨结果，不补静音。输出按视频帧对齐，验收实际时长与区间长度的差不超过max(250ms, 区间长度/1000)，并检查尺寸/编码；校验失败TRIM_FAILED且不发布半成品。复用现有任务、取消、删除、鉴权播放下载与清理，不修改原素材，不新增表或迁移。capabilities在H.264/AAC及ffprobe可用时声明trim。页面以秒输入，精度到毫秒；执行响应丢失后沿用同参数方案重试，不重复入队。

提取音频固定读取第一条音轨，生成192kbps、44.1kHz双声道MP3，剔除视频、封面及源元数据。缺少音轨在入队前返回422 SOURCE_HAS_NO_AUDIO；缺少libmp3lame编码器返回503 AUDIO_EXTRACTION_UNAVAILABLE。capabilities按编码器独立声明extract_audio，不依赖视频编码器。输出用ffprobe重新验证MP3格式、编码、无视频流及真实音轨时长，失败为AUDIO_EXTRACTION_FAILED且不发布。首条音轨比视频短时不补静音、不按视频时长截断或拼接。音频结果contentType=audio/mpeg、文件名后缀-audio.mp3；metadata中width/height/videoCodec为null，durationMs是实际音轨时长。

任务QUEUED/RUNNING/CANCELLING/CANCELLED/SUCCEEDED/FAILED，数据库队列最多20个活动任务，每个实例按CPU和可用内存自适应有界并发处理，视频与识别共享队列。默认从1个并发逐步增加，按逻辑CPU计算上限1至4；CPU达到85%或可用内存不足3GiB时暂停启动新任务，不强停运行中的任务。新任务默认至少间隔3秒；指标不可用退回单并发。TASK_MAX_PARALLEL可指定上限，其他参数见README“自适应任务并发”；这是准入保护而非硬资源配额，不包含GPU显存监控。此调度调整不新增接口、状态或数据表。默认5分钟进程超时、7分钟租约、结果最大3GiB；TRANSCODE_TIMEOUT、TRANSCODE_MAX_OUTPUT_SIZE可覆盖，租约必须大于超时加1分钟。排队工作重启后继续，过期运行任务变FAILED/TASK_INTERRUPTED，不自动重复执行；重试需新建方案。排队取消立即CANCELLED，运行取消CANCELLING，工具每300ms检查并终止；校验中的取消至多等待当前ffprobe超时。运行百分比未知为null，成功后100。仅校验成功且归属、租约仍有效时在事务中发布输出；取消、注销或失败不发布半成品。

MP4与MP3结果预览均需鉴权并支持单段Range/206/Content-Range，含后缀、开放结尾；非法或多段Range忽略返回200，越界416并返回Result。下载忽略Range发送完整文件，Content-Disposition包含UTF-8文件名及ASCII回退。文件丢失或大小异常410 OUTPUT_UNAVAILABLE，其他用户资源404，URL不暴露磁盘路径。失败、取消、过期租约及注销清理同样覆盖MP3半成品。

DELETE /api/outputs/{outputId}需要登录及CSRF，无请求体。事务内逻辑删除结果并保存持久化清理任务，返回200 Result.success()；本人重复请求仍200，包含此前随原素材删除的结果。他人或不存在ID统一404，磁盘文件已经丢失也可以删除。提交后结果详情、预览、下载404，结果列表及Task.outputs不再包含该文件；任务仍为SUCCEEDED，原素材、方案、参数和其他结果保留。不会隐式重新运行任务，执行旧方案仍复用原任务；重新生成需创建新方案，页面正常点击开始处理会新建方案。

结果物理文件在后台清理，使用同一队列的独立OUTPUT范围，可与素材/账号清理安全重叠，重复删文件幂等。失败有界重试且可回收过期清理租约；清理禁用时等待重新启用。200不表示文件已物理删除，已下载或已发送到浏览器的数据无法追回。页面提供确认、取消和失败重试；删除后停止对应播放器，保留处理记录，并拒绝删除前轮询返回的旧文件链接。

### 5.1 组合导出（2.15）

保存方案用于持久化当前处理参数，不会运行FFmpeg或生成文件。同一素材当前未执行的导出方案重复保存会更新版本；执行后再次保存可生成新的方案，服务端未设置方案总数硬上限。处理记录页的“保存的方案”提供本人分页列表、展开参数/处理要求、恢复及删除；导出、文字/有序步骤、拼接和旧单功能参数可恢复，字幕烧录须在字幕页重新确认当前版本。删除方案后列表、详情、修改和执行均404，已有任务及文件不受影响。

DELETE任务记录只允许SUCCEEDED/FAILED/CANCELLED，活动状态返回409 RESOURCE_CONFLICT；本人重复删除幂等200。他人或不存在、已随素材删除的任务404。记录隐藏后，任务按ID查询和原方案重复execute仍返回原任务，文件与结果权限不变；需要释放磁盘时使用单独的结果删除接口。

沿用方案创建、PATCH、查询及execute，不新增表或项目。`operation=export`在2.15开放明确参数、2.16开放自然语言，原有参数契约不变。页面保留功能栏，输出格式/编码和分辨率可选，勾选组合处理后可同时裁切、目标体积压缩、静音、另存原始音轨。保存方案不执行，不产生输出；恢复时可继续编辑，最终导出才生成任务。AI确认页展示全部裁切/分辨率/编码/体积/音轨设置；拼接按播放顺序列出每段区间与总时长。素材和结果保存在部署服务器的受控磁盘，不是第三方云盘或任意滤镜时间线。

```json
{"mediaId":"素材UUID","parameters":{"operation":"export","outputFormat":"webm","videoCodec":"vp9","resolutionPreset":"custom","width":1280,"height":720,"audioMode":"mute","startMs":1000,"endMs":11000,"targetSizeBytes":1048576,"extractAudio":true}}
```

| 字段 | 规则 |
| --- | --- |
| outputFormat | mp4、mov、mkv、webm、mp3、m4a、wav、flac，必填 |
| videoCodec | MP4支持h264/hevc/av1；MOV支持h264/hevc；MKV支持四种；WebM支持vp9/av1。视频默认h264，WebM需显式指定；音频为null |
| resolutionPreset | source（默认）、360p、480p、720p、1080p、1440p、2160p、custom；音频为null |
| width / height | 仅custom必填，2至4096整数，定义最大边界框；保持比例、不放大、向下取偶数，全部视频限制长边4096、总像素8847360 |
| audioMode | keep（默认）或mute；静音移除全部音轨，不仅播放器关闭声音 |
| startMs / endMs | 同时省略/null表示全长，或成对整数，至少100ms且不超源时长；音频导出按第一条音轨的实际时长再校验。页面最短0.5秒 |
| targetSizeBytes | 可选，至少32768、小于源文件且不超输出限制；只开放h264/vp9两遍模式，按裁切时长和静音预算验收。HEVC/AV1仅质量模式 |
| extractAudio | 默认false，仅视频。另存完整原始第一条音轨为192kbps MP3，不受本次裁切/静音影响；无音轨拒绝 |

音频导出不允许视频字段、静音、目标大小或extractAudio；MP3为libmp3lame、M4A为AAC（均192kbps），WAV为PCM s16le、FLAC为flac，44.1kHz双声道。这里的无损格式不会恢复源素材已损失的音质。

响应将省略字段规范化为默认值或null。capabilities新增exportFormats/exportVideoCodecs，按本机编码器报告；supportedOperations有export时可使用。所有命令来自白名单，不接收用户命令、路径或URL。多个输出共享原任务时间预算，每文件受3GiB上限约束，逐个探测验收后原子发布；任一失败/取消不发布任何结果。Task.outputs可能含视频和原始MP3，不保证顺序，使用id/contentType/filename选择；可以分别下载或删除。所有格式均纳入失败、租约回收、素材删除和账号清理。

Output.previewUrl可为null。MP4/MOV的H.264/AAC、WebM的VP8/VP9/AV1加Opus/Vorbis以及MP3/M4A/WAV/FLAC提供预览；MKV和HEVC输出只下载。不支持预览时直接请求preview返回409 MEDIA_PREVIEW_UNAVAILABLE，下载仍可用；支持的预览沿用鉴权和Range。浏览器无解码器时提示下载，不声称所有设备支持。

### 5.2 有序步骤（2.17）

AI文字输入与“分步填写”共用workflow参数，手动生成不调用任何第三方API，不需配置DeepSeek。表单可增删、上下移动步骤，填写选段区间、分辨率与最终导出设置；AI生成的workflow也可切到步骤编辑。保存后显示步骤和参数，必须确认才入队；修改禁用旧确认，刷新可恢复最近10条方案中的最新workflow。沿用已有版本、幂等、鉴权和清理机制，无新增接口/表。

```json
{"mediaId":"素材UUID","parameters":{"operation":"workflow","outputFormat":"mp4","steps":[
  {"operation":"join_clips","clips":[{"startMs":15000,"endMs":20000},{"startMs":0,"endMs":5000}]},
  {"operation":"trim","startMs":3000,"endMs":7000},
  {"operation":"resize","resolutionPreset":"360p"},
  {"operation":"mute"},
  {"operation":"export","outputFormat":"mp4","videoCodec":"h264","targetSizeBytes":1048576,"extractAudio":true}
]}}
```

该例要求源素材至少20秒：先尾段再头段拼接成10秒，再保留当前结果第3到7秒，最终4秒。每个步骤消费上一步的结果，所有时间以当前时间轴为准；重复裁切会映射回源区间，不能把两个startMs当成同一源坐标。缩放逐步保持比例、不放大，先360p再720p不会恢复成720p。

| 步骤 | 字段和限制 |
| --- | --- |
| trim | operation/startMs/endMs，至少100ms，范围不超当前结果 |
| join_clips | operation/clips；每段至少500ms，顺序、重复、倒序保留；最多20段且映射回原文件后也最多20段 |
| resize | operation/resolutionPreset，可选width/height仅用于custom；规则同5.1，基于当前尺寸 |
| mute | 仅operation，移除音轨；后续不能恢复声音或导出纯音频，但可另存原始音轨旁路 |
| export | 最后且只能一次；operation/outputFormat，可选videoCodec/targetSizeBytes/extractAudio；不可含裁切、分辨率或audioMode。视频默认h264，WebM默认vp9，音频为null；格式编码矩阵同5.1 |

最多12步（含导出），允许重复操作，最终时长最多15分钟。顶层outputFormat必须与最后一步一致。无改动可只含export。纯音频输出使用最终mp3/m4a/wav/flac格式，不需要额外extract_audio步骤；流程以视频时间轴为准，已有首条音轨提前结束时补静音保持同步，源无音轨不凭空创建声音。目标体积按最终时长、静音状态计算，仍须小于原文件。另存MP3始终读取完整原始首条音轨，不受前面裁切或静音影响、不补成视频时长，两个文件原子发布。

执行器将步骤编译成源区间和有序滤镜链，不穷举组合，不通过HTTP调用自己的Controller。单区间的裁切/多次缩放/静音融合到一次最终导出。多区间依次解码为受预算限制的FFV1/PCM Matroska无损缓存，再最终编码一次（目标体积模式仍有分析遍）；避免split分支倒序选段时积压整段高清帧，也避免每一步反复有损转码。多区间统一30fps；缓存总大小和最终文件分别不超输出上限，磁盘峰值约两倍，加原始音轨输出；无损缓存可能比源文件大而提前触发OUTPUT_TOO_LARGE，缩小分辨率/缩短区间可降低用量。全部进程共享任务超时、取消检查和资源限制，缓存不对外发布，失败/取消/租约/删除均清理。

capabilities.supportedOperations包含workflow才开放，要求ffprobe和本机H.264/AAC、FFV1、PCM编码器可用，最终编码仍按exportFormats/exportVideoCodecs检查。暂不包含跨素材、调速、任意滤镜、字幕识别/烧录/重映射等步骤；不支持的请求明确拒绝，不执行部分动作。

## 6. 字幕与文字校对

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST | /api/media/{mediaId}/transcriptions | 创建字幕任务 |
| GET | /api/media/{mediaId}/transcript | 当前字幕 |
| GET / PATCH | /api/transcripts/{transcriptId} | 查询 / 编辑 |
| GET | /api/transcripts/{transcriptId}/srt | SRT文件 |
| POST | /api/transcripts/{transcriptId}/corrections | DeepSeek单句校对建议，200 |
| POST | /api/transcripts/{id}/translations | 所选文字模型分批翻译建议，200 Result，尚不写入版本 |

识别请求示例：`{"language":"zh-CN","provider":"aliyun","model":"qwen-audio-3.1-asr-flash-streaming","force":false}`。provider只支持tencent/aliyun，省略默认tencent；force省略默认false。可选model必须与provider匹配：腾讯仅16k_zh；百炼支持qwen-audio-3.1-asr-flash-streaming、fun-asr-realtime、paraformer-realtime-v2。不指定/null model时腾讯沿用16k_zh、百炼沿用paraformer-realtime-v2；空串、未知型号、文字模型或跨供应商型号422 INVALID_PARAMETERS，在排队及云端调用前拒绝。要求本人READY且有音轨。活动识别复用同一任务；已有字幕且未确认重识别409 TRANSCRIPT_ALREADY_EXISTS。强制重识别成功创建新字幕并切换最新稿，失败不覆盖旧稿。新提交每用户默认5分钟10次，共享最多20个活动任务的队列；复用活动任务不扣次数。QUEUED/RUNNING的parameters=null，kind=TRANSCRIPTION；成功后outputs=[]，transcript为不可变识别稿的transcriptId/version=1引用。未知进度null，成功100。内部任务参数保存解析后的模型ID，工作线程按此调用，不随之后的页面选择变化，也不保存密钥。

腾讯使用录音极速版16k_zh，word_info=3；百炼三种模型均使用北京官方WebSocket识别协议和真实时间戳。千问3.1与Fun-ASR发送单个zh语言提示，旧Paraformer保持zh/en参数。capabilities.asrModels为已适配目录，每项含provider/id/name/recommended，不代表个人密钥具备模型权限或余额；是否可用仍检查asrProviders。页面在字幕识别区按供应商切换模型，百炼首次推荐千问语音3.1，本次登录记住各供应商选择；刷新页面重新选择，不把模型选择存入凭据，不影响文字AI配置。旧后端缺少目录时页面仅展示原有模型。目录不包含需额外接口适配的Filetrans、无时间戳的Qwen3实时接口或任意自定义型号。文言文准确率仍需真实音频对比，推荐不代表效果保证；本次没有增加上下文、热词或原文对齐功能。

后端固定官方域名，不支持任意URL代理，不把私有视频改成公网地址。FFmpeg只提取第一条音轨为64kbps、16kHz单声道临时MP3，校验后传给选定供应商；不修改原素材，不作为输出发布。单任务总预算默认5分钟、租约7分钟；取消、失败、删除、注销或过期令牌均不能发布迟到字幕。临时音频完成后删除，崩溃遗留由现有任务租约/资源清理覆盖。无有效语音ASR_NO_SPEECH，协议/识别失败ASR_FAILED，不伪造字幕。不自动重试或切换付费服务；取消不能保证供应商不收费，已发送的数据也无法追回。协议依据：[千问流式客户端事件](https://help.aliyun.com/zh/model-studio/qwen-audio-asr-streaming-client-events)、[Fun-ASR客户端事件](https://help.aliyun.com/zh/model-studio/fun-asr-client-events)。

保留不可变originalSegments和所有版本，GET可选正整数version，省略为当前版本，历史不存在404。PATCH全量替换segments并传expectedVersion；版本冲突409 TRANSCRIPT_VERSION_CONFLICT，成功版本+1。1至3000段、ID唯一、整毫秒0<=startMs<endMs<=素材时长，按时间排序、不重叠。文字1至2000个码点，换行归一化、去首尾空白，禁止空白段、空行和控制字符（LF/tab除外），整个segments序列化JSON最多2MiB。SRT为UTF-8/CRLF原始字节流、attachment、no-store；version=1导出原始识别稿。删除素材或注销后，当前和历史字幕立即不可访问。

校对请求：`{"expectedVersion":1,"segmentId":"字幕段UUID"}`。只把已保存的该段文字发送DeepSeek，不发送音频或时间轴，不接收任意指令。35秒超时，JSON和文本边界校验，每用户默认5分钟20次。响应data为transcriptId/version/segmentId/originalText/correctedText；仅瞬时建议，不落库、不产生correctionId，不改变时间轴或字幕版本。用户确认后通过既有PATCH保存，调用前后重新检查版本和归属。DeepSeek不代替语音识别；aiPlans按DeepSeek配置及处理工具可用性声明。

凭据配置见README云端服务及下节；capabilities按当前登录用户计算，匿名仅报告站点能力，Cache-Control:no-store。配置状态不代表网络、权限或余额已经验证；未实现供应商余额查询、额度分配或自动付费重试。

### 云端失败提示（2.23）

方案生成、字幕校对、翻译、检索/片段建议共用错误分类；语音识别失败将同样的code/message写入任务error，不发布半成品字幕或覆盖旧字幕。所有JSON错误仍使用Result，data=null、details=[]；云端鉴权失败不是本站登录失败，不返回本站401，不触发退出登录。不能仅凭密钥格式判断供应商是否正确，提示用户核对供应商、接口地域及密钥，不声称已确定错配。

| 错误码 | HTTP | 提示与处理 |
| --- | --- | --- |
| CLOUD_AUTH_FAILED | 422 | 云端鉴权失败；核对密钥、供应商和接口地域 |
| CLOUD_PERMISSION_DENIED | 422 | 核对账号状态、开通服务、密钥和工作空间权限 |
| CLOUD_QUOTA_EXCEEDED | 422 | 核对余额、资源包及可用额度/用量上限，不反复重试 |
| CLOUD_MODEL_UNAVAILABLE | 422 | 模型/接入点不存在或无权限，检查ID、地域及开通状态 |
| CLOUD_REQUEST_REJECTED | 422 | 模型不支持当前参数或输入被拒绝，检查模型功能和输入 |
| CLOUD_RATE_LIMITED | 503 | 厂商频率/并发限制，稍后手动重试；区别于本站429 RATE_LIMITED |
| CLOUD_NETWORK_ERROR | 502 | 检查服务器网络、代理及TLS连接 |
| CLOUD_TIMEOUT | 504 | 云端连接/响应或识别等待超时；取消仍使用TASK_CANCELLED |
| CLOUD_SERVICE_UNAVAILABLE | 502 | 厂商服务故障、重定向或其他异常响应，稍后手动重试 |

解释HTTP状态及允许列表中的厂商机器错误码，例如DeepSeek 402、OpenAI insufficient_quota/credit_balance_exhausted、百炼Arrearage、豆包AccountOverdueError和腾讯极速版4002至4006。不扫描或显示原始message，不把所有429误判成余额问题。百炼WebSocket握手及task-failed均参与分类，未知任务错误仍为ASR_FAILED。模型返回的无效、拒答、截断或越界内容仍按原有AI_*失败码拒绝，与密钥/网络错误分开。服务端部署模型使用独立LOCAL_AI_UNAVAILABLE提示，不套用个人云端错误。保持响应大小上限、取消、并发限制、不重试、不回退。

前端保存前检查AppId、SecretId、SecretKey和API Key的基础格式，提示不要填写URL或Bearer前缀；保存只表示格式通过并已加密存储，configured/available不会因为保存而表示远程鉴权成功。识别失败后的task.error.message来自固定错误码，不保存密钥或供应商原始响应。

分类依据：[DeepSeek错误码](https://api-docs.deepseek.com/zh-cn/quick_start/error_codes/)、[OpenAI错误码](https://developers.openai.com/api/docs/guides/error-codes)、[百炼错误码](https://help.aliyun.com/zh/model-studio/error-code)、[豆包错误码](https://docs.volcengine.com/docs/ark/error-codes?lang=zh)、[腾讯极速识别错误码](https://cloud.tencent.com/document/product/1093/52097)。供应商未明确给出原因时只显示安全的通用类别，不能保证每种厂商异常都能进一步细分。

### 个人云端凭据（2.14）

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| GET | /api/users/me/cloud-credentials | 200 Result，data为三个凭据槽位的状态列表 |
| PUT | /api/users/me/cloud-credentials/{provider} | 200 Result，data为保存后的状态 |
| DELETE | /api/users/me/cloud-credentials/{provider} | 200 Result，清除密文并设为OFF，data为新状态 |

provider仅tencent/aliyun/deepseek，不支持自定义URL。全部需登录；PUT/DELETE需CSRF和JSON，响应no-store。无记录version=0、mode=SERVER，保存后版本递增。原状态字段保留，新增available和可空unavailableReason；configured表示配置完整，不能代替available。本地deepseek项的model为部署者配置的千问模型名，available取决于真实健康检查。SERVER下tencent/aliyun的configured/available均为false，原因是本地不支持语音识别。个人云端available仍仅表示凭据可读取且完整，不保证网络、权限或余额。不返回秘密、密文、回环端口或userId。

PUT必填expectedVersion和mode（SERVER/PERSONAL/OFF）。SERVER表示服务端模型，不使用站点云端凭据。语音识别槽位维持腾讯appId/secretId/secretKey、百炼apiKey/workspaceId。文字槽位路径仍是deepseek，PERSONAL接收textProvider（deepseek/openai/bailian/doubao）、apiKey、model；仅bailian接受可选workspaceId。省略textProvider保留旧供应商，没有旧值时按deepseek。相同供应商省略/null字段可保留旧值，切换供应商必须提供新apiKey；OpenAI模型ID必填，豆包Model ID或Endpoint ID必填（均通过model字段传递），千问/百炼默认qwen-plus，DeepSeek默认deepseek-flash。显式空密钥失败。SERVER/OFF不得携带个人字段，切换时清除旧密文。DELETE请求体为`{"expectedVersion":1}`，删除后停用，不自动回退。

前端model支持供应商联动的预设下拉和“自定义模型”输入框；OpenAI和豆包未选模型、自定义留空或不符合原model格式时禁止保存。OpenAI预设更新为gpt-6-sol/gpt-6-astra/gpt-5.6-sol/gpt-5.6-luna；已保存的非预设型号仍保留且可编辑。输入首尾空白在保存时去除，仅向API发送实际model值，不发送界面占位值或customModel草稿字段。API的model仍为原字符串格式而非预设enum，兼容已有客户端与Endpoint ID，模型选择本身不新增接口或迁移。选择模型本身不保存、不发起云端请求，仍需点击保存并确认。

OpenAI已核对的gpt-6-sol、gpt-5.6-sol、gpt-5.6-luna及gpt-5.6别名使用reasoning_effort=none；gpt-6-astra使用low（不支持none）。保留原max_completion_tokens预算、store=false、35秒超时及JSON输出验证。其他自定义型号不强加思考参数；自定义只改变模型ID，不改变供应商固定官方地址或自动适配其他协议。

三种来源互斥，任何来源失败都不回退。写入默认每用户5分钟20次，429含Retry-After；版本冲突409 CLOUD_CREDENTIALS_CONFLICT；密文不可读503 CLOUD_CREDENTIALS_UNAVAILABLE。列表在不可解密时仍返回personalStored=true、configured=false、available=false，可删除或恢复主密钥。账号注销在同一事务删除凭据。

`capabilities.textAi={source,provider,model,available,unavailableReason}`声明当前用户文字来源；provider为local/deepseek/openai/bailian/doubao，匿名使用SERVER和local。服务端固定回环地址，健康检查最多700ms/缓存2秒，不产生云端费用；推理单并发，超时由LOCAL_AI_TIMEOUT_SECONDS配置。个人文字调用共用2个并发槽、35秒单次超时和4MiB响应上限，不回退、不自动重试。页面每10秒刷新能力，失败显示当前供应商；个人available只表示配置可读取且完整，不代表真实网络、模型权限或余额已验证。非法、拒答或截断结果按AI_PLAN_FAILED/AI_FAILED/AI_ANALYSIS_FAILED拒绝。

OpenAI固定POST https://api.openai.com/v1/chat/completions，使用max_completion_tokens、store=false和JSON mode；百炼固定北京域名https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions，或由合法workspaceId生成https://{workspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions，使用max_tokens、enable_thinking=false和JSON mode。Workspace ID是标识符，不是URL，不接受任意主机、端口、路径或第三方中转。百炼文字配置与百炼语音配置独立，不共享密钥。参考[OpenAI官方接口](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)、[百炼官方兼容接口](https://help.aliyun.com/zh/model-studio/qwen-api-via-openai-chat-completions/)。

豆包固定POST https://ark.cn-beijing.volces.com/api/v3/chat/completions，Bearer API Key鉴权，使用max_tokens、thinking.type=disabled及response_format.type=json_object。必须选用支持非思考JSON输出的已开通模型，不支持应用Bot ID、Coding Plan专用接口或任意中转地址。豆包仅增加文字适配，不提供豆包语音识别、图片/视频生成。参考[火山方舟结构化输出](https://docs.volcengine.com/docs/ark/structured-output-beta?lang=zh)。

示例（仅虚构值）：`{"expectedVersion":0,"mode":"PERSONAL","textProvider":"doubao","apiKey":"ark-example-not-real","model":"ep-example-not-real"}`。保存不会发起付费校验。调用服务时按会话/任务用户解密当前配置，秘密不写任务或方案；排队识别使用执行时的配置，切换或删除不能撤回已发出的请求及费用。登录和保存后应重新查询capabilities，不能跨用户缓存。

### 字幕翻译与双语版本

POST /api/transcripts/{id}/translations需登录、CSRF和JSON，响应200 Result<TranscriptTranslation>及no-store。请求expectedVersion必须为该素材最新字幕的当前版本；targetLanguage为zh-CN/zh-TW/en/ja/ko/fr/de/es/ru/pt；segmentIds为1至20个现存UUID，按源字幕顺序且不重复；useOriginal默认false，为true时使用不可变识别原文而非当前修订。只接收ID，不接受伪造原文、时间或提示词。

每批原文最多2000 Unicode字符、所选segments的UTF-8 JSON最多16KiB。超限422 TRANSCRIPT_TRANSLATION_TOO_LARGE；非法字段或ID顺序422 INVALID_PARAMETERS；非本人或删除404；版本变化或重新识别409 TRANSCRIPT_VERSION_CONFLICT；模型不可用503 AI_UNAVAILABLE/LOCAL_AI_UNAVAILABLE，繁忙503 AI_BUSY。每用户默认5分钟60批，限流429含Retry-After。复用服务端或本人云端文字路由、并发和超时，不自动重试、不回退；调用前后重新检查账号、素材、最新字幕ID和版本，不持数据库事务等模型。

响应data={transcriptId,transcriptVersion,targetLanguage,segments}。segments只含本批译文及服务器绑定的id/startMs/endMs；模型返回数量、顺序、ID、字段、文本不合法或被截断时422 AI_TRANSLATION_FAILED，不截断假装成功。每段译文复用最多2000字符、无空行或控制字符的字幕边界；不返回秘密、不创建任务/翻译资源或磁盘文件，也不更新字幕版本。

前端按20段/2000字符顺序分批，一次最多60批，超过上限在调用前拒绝；展示总进度，所有批次完成且最新版本仍匹配才展示可编辑译文。停止只阻止后续调用并丢弃建议，已发出的请求不可撤回且仍可能计费。失败、刷新或关闭前未保存的预览不持久化；重试需用户主动操作并可能重新计费。当前预览支持仅译文或原文在上的双语文本，不是视频画面字幕叠加。

用户确认后将译文或“所选原文+换行+译文”作为普通segments提交既有PATCH /api/transcripts/{id}，expectedVersion防止覆盖并生成新版本，旧版本和识别原文保持不变。保存前再次读取最新字幕，时间轴沿用源段；每段合计最多2000字符、总JSON最多2MiB，不满足时可改选仅译文或精简。原有Transcript.language仍表示识别语言，不将其误当作修订目标语言。保存成功后可下载该版本SRT，或复用burn_subtitles生成MP4；导出、烧录不再次调用翻译模型。后续可勾选识别原文翻译为另一语言。未新增表或迁移，API不存储翻译目标或输出布局元数据。

### 同源多段拼接

复用POST /api/operation-plans及execute，不新增草稿表、管理页或接口。旧parameters仅四字段：`{"operation":"join_clips","outputFormat":"mp4","clips":[{"startMs":2000,"endMs":3000},{"startMs":0,"endMs":1000}],"audioMode":"keep"}`。1至20段，每段为整数long毫秒、至少500ms，范围在本人就绪素材内，所有段时长之和最多900000ms。数组顺序就是输出顺序，允许倒序、重复和重叠；非法类型/额外字段/超时长422 INVALID_PARAMETERS。2.16允许自然语言生成同源有序区间；2.17拼接后附加缩放/静音/体积设置请使用5.2的workflow，不向旧join_clips对象追加字段。不接受路径、URL、跨素材ID或字幕参数；未定义操作应返回UNSUPPORTED_REQUEST，不得只做部分动作。

输出原展示尺寸取偶数、30fps、H.264/yuv420p MP4，首条音轨AAC 48kHz双声道；有音轨素材在缺失音频的区间补静音，避免拼接后声音错位；原素材无音轨时结果也无音轨。不覆盖源视频，结果名-joined.mp4。先顺序生成临时片段，再按受控ffconcat清单拼接重编码，避免倒序/重复取段时大量高清帧滞留内存。所有阶段共享默认5分钟超时、7分钟租约；临时分段合计和最终结果分别不超过输出上限（默认各3GiB，编码期间峰值磁盘约两倍）。按帧对齐，最终时长与所选总时长差不超过max(250ms,总时长/1000)；不合格FAILED/CLIP_JOIN_FAILED且无结果。

方案版本、执行去重、队列、取消、权限、预览/下载和删除沿用现有处理。入队参数冻结；后续编辑不修改运行任务。临时分段和清单在终态发布前清除；失败保留运行令牌，过期租约/删除/注销清理也覆盖所有受控文件。未开放的clip-drafts接口仍为PLANNED，不能拿来调用这个轻量方案。这里不提供跨素材拼接、命名草稿管理、拼接字幕重映射/SRT导出或同次拼接烧录；源画面已有的硬字幕会随画面保留。

拼接页支持添加/复制/移除/排序/预览，并在导出前确认。未提交编辑仅保留在当前页，离开时提示；服务端方案可恢复最近10条中的最新拼接方案，历史任务可恢复原有片段顺序。执行响应不确定时保留同一方案重试，编辑后更新未执行方案的版本。找片段结果加入拼接前核验当前字幕ID/版本，但拼接保存的是用户确认的源视频时间范围，不自动跟随字幕修改。

### 字幕烧录

复用POST /api/operation-plans及execute，不新增接口或表。parameters示例：`{"operation":"burn_subtitles","outputFormat":"mp4","transcriptId":"当前字幕UUID","transcriptVersion":2,"resolutionPreset":"source","audioMode":"keep"}`。仅接受这六个字段；字幕版本为正整数，resolutionPreset可为source或720p，其他枚举固定。素材须就绪；非本人/跨素材字幕404。创建、修改、首次执行要求最新字幕ID和版本同时匹配，否则409 TRANSCRIPT_VERSION_CONFLICT；重识别即使仍为v1也不能使用旧ID。任务入队后固定引用不可变历史版本，后续编辑或重识别不改变已确认内容。重复execute先复用原任务，不会因改稿再生成一个任务。

输出为H.264/yuv420p MP4、首条音轨AAC，无音轨不补音，不覆盖原素材，文件名-subtitled.mp4。固定底部居中、白字黑边、字号随输出高度缩放；支持中文、换行和自动换行，不开放自定义字体/样式命令。服务端生成纯文字ASS并用FFmpeg/libass渲染，转义用户覆盖标签及反斜线，不读取上传字幕文件、任意路径或URL。ASS时间向外取整到10ms，最终呈现按视频帧对齐，极短相邻段可能在同一帧出现。部署需提供覆盖字幕文字的系统字体；缺少中文字形可能显示方框。

capabilities.supportedOperations在ffprobe、H.264/AAC编码器和ass过滤器可用时包含burn_subtitles；已有字幕烧录不需要云端凭据。工具缺失503 SUBTITLE_BURN_UNAVAILABLE；烧录或输出验收失败任务FAILED/SUBTITLE_BURN_FAILED，无可用结果。沿用单任务默认5分钟超时、7分钟租约、3GiB输出上限和取消/资源权限；取消、删除或过期运行不能发布迟到文件。输出校验尺寸、编码、音轨和完整时长，误差不超过max(250ms, 源时长/1000)。私有ASS在发布终态前删除；清理失败保留运行令牌，租约回收重试，不让敏感字幕文件失去清理线索。

字幕页仅在查看最新已保存编辑稿、没有未保存修改时允许生成；确认后创建方案并执行。原稿/历史版本可下载SRT，但不能直接烧录；需要将修改保存为最新稿。结果复用鉴权播放、下载、取消与删除，刷新后可从处理记录恢复；执行响应丢失时重试同一方案，避免重复入队。

### 按字幕找片段

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST | /api/media/{mediaId}/search | 按内容查找，200 Result<SearchResponse> |
| POST | /api/media/{mediaId}/clip-recommendations | 按目标和总时长推荐，200 Result<RecommendationResponse> |

检索请求：`{"query":"哪里提到使用限制","transcriptId":"当前字幕UUID","transcriptVersion":1,"limit":10}`。query为1至500个Unicode码点，去首尾空白后不得为空；limit可省略，默认10，范围1至20。推荐另加必填maxTotalDurationMs，范围1000至900000整毫秒；limit默认3，范围1至10。必须登录、提供CSRF且拥有素材及当前已保存字幕。

transcriptId与transcriptVersion必须同时匹配最新字幕；重识别另建ID，即使版本仍为1也拒绝旧ID。云端调用前后检查归属和版本，修改/替换后409 TRANSCRIPT_VERSION_CONFLICT，删除/非本人404。分析仅使用完整已保存字幕，不使用未保存编辑；单次最多600段、segments序列化UTF-8 JSON最多128KiB，超出422 TRANSCRIPT_ANALYSIS_TOO_LARGE，不悄悄截断。不建立向量索引、不新增表、不缓存旧结果。

模型只选择连续字幕段的首尾ID；后端重建区间内每一段真实evidence和首尾时间，拒绝未知ID、倒序、重叠、非法分数/文字或超预算输出，返回422 AI_ANALYSIS_FAILED。检索按score降序，score只用于AI相关度排序，不代表准确率。推荐每段至少500ms，所有endMs-startMs的和不超过预算，区间中的静音/字幕间隙也计时；title最多80码点、reason最多300码点，均为模型判断，需要用户复核。无匹配时200空matches/clips并给出提示，不编造。

两种模式共享每用户默认5分钟20次，与校对和方案生成共享最多2个云端文字请求、35秒超时，不自动重试或切换付费服务。限流429，未配置503 AI_UNAVAILABLE，繁忙503 AI_BUSY。capabilities.semanticSearch/clipRecommendations按DeepSeek配置声明，不依赖FFmpeg，也不代表网络、余额或真实效果已验收。前端默认以页面内弹窗确认服务商、发送目标及已保存字幕和可能产生的费用；用户可在弹窗或账户AI服务设置中选择本次登录不再提示，重新登录后恢复，服务端鉴权和限流不变。不能撤回已发送数据或保证免扣费。

“找片段”页展示原文、时间与建议，可在原视频编码兼容时预览该区间；其他编码仍可查看证据和带入裁切。带入前再次核验字幕ID/版本，再填写现有裁切页的起止时间，用户点击开始裁切才生成方案/任务。该流程是单段手动确认裁切，不是clip-draft、多段拼接或自动导出；修改查询/模式/限制或切换素材会清除旧结果。

尚未实现：GET /api/corrections/{correctionId}及POST apply（不能用于上述瞬时建议）、clip-drafts及多段导出。

草稿属于用户并关联一个素材，不是项目。导出使用版本及idempotencyKey：同键同请求复用任务，不同请求409，失败重试换新键。导出快照不受后续编辑影响，字幕按裁切/拼接重映射。多轨、跨素材拼接、团队共享、分类和支付不在本版。

## 7. 迁移与验收

V1-V9保持不变；V9的transcript和transcript_revision以复合外键约束用户归属，source_task_id唯一防重复发布。V10仅新增cloud_credential，用户/供应商联合主键、来源约束及密文，明文和主密钥不入库。字幕访问沿素材和账号检查逻辑删除，不创建磁盘SRT文件。自然语言方案、找片段和字幕烧录均不新增迁移，烧录复用不可变字幕历史。V5至V8的直接用户归属、租约、有界队列及三种清理范围保持。历史项目元数据只归档，不创建默认项目。

验收区分本地协议替身与真实云端：自动测试覆盖字幕版本/权限/SRT、幂等、取消/删除/租约、失败不覆盖、腾讯签名及句时间戳、百炼事件和分片、DeepSeek输出校验、有界外部响应；真实FFmpeg验证识别音频为16kHz单声道MP3。真实供应商可达性、授权/余额、识别准确率及实际费用须配置凭据后联调。浏览器测试不可指向生产服务。
