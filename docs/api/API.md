# AI音视频工作台：轻量版接口契约

版本：2.14.0。日期：2026-10-20。

Apifox选择OpenAPI/Swagger，导入同目录[openapi.json](./openapi.json)。本文与OpenAPI是一套契约，共55个接口；是否可用以x-implementation-status为准。2.0移除项目、分类和projectId：登录后直接选择功能、上传素材、处理并下载，不创建隐式默认项目。

## 1. 当前范围

当前共41个已实现接口：账号、注册前邮箱验证、个人云端凭据、素材上传检测/预览/删除、转换/压缩/裁切/静音/MP3提取/字幕烧录/同源多段拼接、明确参数或自然语言生成的版本方案、持久化任务/取消、结果预览/下载/删除、云端字幕识别/编辑/SRT/单句校对，以及按字幕内容检索和片段建议。缺少云端凭据时关闭对应调用，已有方案仍可确认执行，已有字幕仍可编辑、导出和本地烧录。跨素材和拼接字幕重映射仍未实现。实现与本地协议测试通过不代表真实云端效果已经验收。

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
| GET | /api/media/{mediaId}/preview | 200/206 | 本人兼容原视频在线预览 |
| DELETE | /api/media/{mediaId} | 200 | 删除及关联清理 |

上传只允许一个multipart字段file，不接受额外归属或路径字段。浏览器自行生成boundary。默认单文件1GiB、15分钟；限制来自MediaProperties，可通过MEDIA_MAX_UPLOAD_SIZE、MEDIA_MAX_DURATION调整，capabilities返回当前值，部署时也要核对代理上限。

服务端生成受控文件名、流式保存，originalFilename仅展示。上传202返回PROBING及Location，后台ffprobe检测后变READY或FAILED。不靠扩展名或浏览器Content-Type判断。当前仅视频，支持目标MP4/MOV/MKV/WebM；不接受远程URL、播放列表或用户自定义命令。

metadata包含container/durationMs/width/height/videoCodec/hasAudio/audioCodec，尺寸应用旋转信息；无音轨audioCodec=null。无视频、损坏、超时长会FAILED，文件超大小413。检测进程限制耗时和输出大小，工作持久化并支持租约恢复，不启动无限线程。

查询FAILED素材仍返回200，错误位于data.error；前端按状态轮询。FAILED可重试，PROBING幂等202，READY为409。素材不返回storageKey或userId。账号注销后旧素材ID不可访问。

原视频预览只开放检测为READY且kind=VIDEO、容器属于MP4/MOV族、视频H.264、音轨AAC或无音轨的素材；依据实际检测结果，不依赖扩展名或上传MIME。符合条件的详情/列表previewUrl为/api/media/{mediaId}/preview，其他情况为null。该地址仅声明编码兼容，端点仍核验归属、状态、受控路径、可读性和磁盘大小；非本人/已删除404，未就绪、不兼容、文件丢失或大小变化409 MEDIA_PREVIEW_UNAVAILABLE。不会即时转码，不新增任务、文件或迁移，不承诺所有设备均支持原编码。当前不开放MKV/WebM、其他视频编码或音频原素材的直接预览。

预览成功原样返回video/mp4文件流、inline文件名及Cache-Control:no-store，支持单段Range（开放结尾/后缀）、200/206；无效语法或多段Range忽略返回完整200，越界416附Content-Range及Result错误。原素材与输出共用MediaStreams，输出下载仍忽略Range并完整200。页面刷新/选择历史素材可恢复播放，刷新同一素材列表不重置播放位置；失败显示重新加载按钮，切换、删除或退出会清空对应播放器。撤销访问只能阻止后续请求，已发送/缓冲的数据不能追回。

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
| DELETE | /api/outputs/{outputId} | 单独删除一个结果 |
| GET | /api/outputs/{outputId}/preview | 预览文件流 |
| GET | /api/outputs/{outputId}/download | 下载文件流 |

创建方案提供mediaId，parameters/instruction恰好一个。明确参数支持transcode、compress、trim、mute、extract_audio、burn_subtitles、join_clips；自然语言目前只支持前五种，不自动挑选字幕或片段顺序。转换/压缩为outputFormat=mp4、resolutionPreset=source或720p、audioMode=keep；compress额外要求targetSizeBytes。裁切只接受operation=trim、outputFormat=mp4、startMs、endMs、audioMode=keep五字段。静音只接受operation=mute、outputFormat=mp4、resolutionPreset三字段。音频提取只接受operation=extract_audio、outputFormat=mp3两字段。拼接四字段、烧录六字段见下文。未开放操作或额外参数422。状态NEEDS_INPUT/READY/EXECUTED，修改和执行使用expectedVersion，执行后冻结，重复确认复用同一任务。明确参数页面直接创建并确认，无须管理方案列表；旧四字段快照保持兼容。

自然语言示例：`{"mediaId":"素材UUID","instruction":"截取前10秒"}`，仍使用POST /api/operation-plans并返回201 Result，不新增接口。仅向DeepSeek发送要求、受控元信息、字节数、当前工具支持列表；修改时额外发送当前参数。不会发送原视频、音轨、文件名、存储路径或凭据。单次35秒，默认每用户5分钟20次；校对和方案共用单实例最多2个云端文字请求，繁忙503 AI_BUSY，未配置503 AI_UNAVAILABLE，不自动重试付费调用。

只接受模型单步参数或固定问题代码。参数经过同一白名单、字段类型、时长/体积、音轨与工具校验；不允许命令/路径/URL/未开放操作。非法模型返回422 AI_PLAN_FAILED，不创建方案或任务。要求不足返回NEEDS_INPUT、parameters=null及questions的code/message固定服务端文案；代码仅OPERATION_REQUIRED、TARGET_SIZE_REQUIRED、TRIM_RANGE_REQUIRED、UNSUPPORTED_REQUEST、CONFLICTING_REQUIREMENTS。用户可补充instruction或直接PATCH明确参数，成功版本+1；失败不改旧方案。NEEDS_INPUT不可执行。

生成方案不会入队，必须用户检查参数后显式POST execute。AI 处理页可补充要求、查看方案、确认执行及恢复最近10条方案中的最新自然语言方案；修改输入后旧确认失效。执行响应丢失可重试同一方案/版本，不重复任务。生成/修改的云端等待不持有数据库事务或账号锁，落库前重新核验账号、素材和方案版本；等待期间删除/注销或版本变更会拒绝迟到结果。模型理解仍可能有误，参数合法不代表意图必然正确。

压缩目标为整数字节数，至少32768字节、小于原文件且不超过服务端输出上限。按时长预留容器和音轨预算，以H.264两遍编码和AAC 96kbps执行；无音轨不生成声音。预算不足在入队前422 COMPRESSION_TARGET_UNREACHABLE；完成后再次检查时长、尺寸、编码、音轨和实际大小，结果须不超过目标且小于原文件，否则任务FAILED且不发布输出。两遍共享总超时，编码日志受大小限制，并在成功、失败、取消、租约回收及账号清理时删除。不以目标大小截断视频。页面目标体积以MB展示，1MB按1048576字节换算。

720p限制短边最多720、保持比例、不放大小视频，尺寸向下取偶数。转换/压缩输出H.264/yuv420p、AAC，无音轨不生成声音，应用旋转并清理源元数据；实际转码后用ffprobe验证编码、尺寸、音轨与时长。工具参数固定，不经过shell，不接受路径、URL或任意命令。任务保存参数快照，不跟随后续编辑变化。

静音固定移除全部音轨，不仅关闭播放器声音。resolutionPreset为source或720p，不接受audioMode等额外字段；已无音轨素材也允许处理。结果为H.264/yuv420p MP4，文件名后缀-muted.mp4，metadata.hasAudio=false、audioCodec=null；校验时要求无音轨、尺寸/编码匹配，实际时长差不超过max(250ms, 源时长/1000)。失败MUTE_FAILED且不发布结果。原素材不变，复用版本、任务幂等、取消、鉴权播放/下载和删除清理；静音本身不新增表或迁移。capabilities在ffprobe及H.264/AAC编码器可用时声明mute。

裁切startMs/endMs必须是可用long表示的整毫秒，满足0<=startMs<endMs<=素材时长，区间至少500ms；不接受字符串、小数、负值或越界，创建/修改/执行都会校验，失败422 INVALID_PARAMETERS且不入队。输出固定原展示分辨率（向下取偶数）、H.264/AAC MP4、文件名后缀-trimmed.mp4；使用输出侧seek和重新编码，不用关键帧复制替代所选区间。保留区间内可用的第一条音轨，若音轨早已结束允许无音轨结果，不补静音。输出按视频帧对齐，验收实际时长与区间长度的差不超过max(250ms, 区间长度/1000)，并检查尺寸/编码；校验失败TRIM_FAILED且不发布半成品。复用现有任务、取消、删除、鉴权播放下载与清理，不修改原素材，不新增表或迁移。capabilities在H.264/AAC及ffprobe可用时声明trim。页面以秒输入，精度到毫秒；执行响应丢失后沿用同参数方案重试，不重复入队。

提取音频固定读取第一条音轨，生成192kbps、44.1kHz双声道MP3，剔除视频、封面及源元数据。缺少音轨在入队前返回422 SOURCE_HAS_NO_AUDIO；缺少libmp3lame编码器返回503 AUDIO_EXTRACTION_UNAVAILABLE。capabilities按编码器独立声明extract_audio，不依赖视频编码器。输出用ffprobe重新验证MP3格式、编码、无视频流及真实音轨时长，失败为AUDIO_EXTRACTION_FAILED且不发布。首条音轨比视频短时不补静音、不按视频时长截断或拼接。音频结果contentType=audio/mpeg、文件名后缀-audio.mp3；metadata中width/height/videoCodec为null，durationMs是实际音轨时长。

任务QUEUED/RUNNING/CANCELLING/CANCELLED/SUCCEEDED/FAILED，数据库队列最多20个活动任务，每个实例串行转换。默认5分钟进程超时、7分钟租约、结果最大1GiB；TRANSCODE_TIMEOUT、TRANSCODE_MAX_OUTPUT_SIZE可覆盖，租约必须大于超时加1分钟。排队工作重启后继续，过期运行任务变FAILED/TASK_INTERRUPTED，不自动重复执行；重试需新建方案。排队取消立即CANCELLED，运行取消CANCELLING，工具每300ms检查并终止；校验中的取消至多等待当前ffprobe超时。运行百分比未知为null，成功后100。仅校验成功且归属、租约仍有效时在事务中发布输出；取消、注销或失败不发布半成品。

MP4与MP3结果预览均需鉴权并支持单段Range/206/Content-Range，含后缀、开放结尾；非法或多段Range忽略返回200，越界416并返回Result。下载忽略Range发送完整文件，Content-Disposition包含UTF-8文件名及ASCII回退。文件丢失或大小异常410 OUTPUT_UNAVAILABLE，其他用户资源404，URL不暴露磁盘路径。失败、取消、过期租约及注销清理同样覆盖MP3半成品。

DELETE /api/outputs/{outputId}需要登录及CSRF，无请求体。事务内逻辑删除结果并保存持久化清理任务，返回200 Result.success()；本人重复请求仍200，包含此前随原素材删除的结果。他人或不存在ID统一404，磁盘文件已经丢失也可以删除。提交后结果详情、预览、下载404，结果列表及Task.outputs不再包含该文件；任务仍为SUCCEEDED，原素材、方案、参数和其他结果保留。不会隐式重新运行任务，执行旧方案仍复用原任务；重新生成需创建新方案，页面正常点击开始处理会新建方案。

结果物理文件在后台清理，使用同一队列的独立OUTPUT范围，可与素材/账号清理安全重叠，重复删文件幂等。失败有界重试且可回收过期清理租约；清理禁用时等待重新启用。200不表示文件已物理删除，已下载或已发送到浏览器的数据无法追回。页面提供确认、取消和失败重试；删除后停止对应播放器，保留处理记录，并拒绝删除前轮询返回的旧文件链接。

## 6. 字幕与文字校对

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST | /api/media/{mediaId}/transcriptions | 创建字幕任务 |
| GET | /api/media/{mediaId}/transcript | 当前字幕 |
| GET / PATCH | /api/transcripts/{transcriptId} | 查询 / 编辑 |
| GET | /api/transcripts/{transcriptId}/srt | SRT文件 |
| POST | /api/transcripts/{transcriptId}/corrections | DeepSeek单句校对建议，200 |

识别请求示例：`{"language":"zh-CN","provider":"tencent","force":false}`。provider只支持tencent/aliyun，省略默认tencent；force省略默认false。要求本人READY且有音轨。活动识别复用同一任务；已有字幕且未确认重识别409 TRANSCRIPT_ALREADY_EXISTS。强制重识别成功创建新字幕并切换最新稿，失败不覆盖旧稿。新提交每用户默认5分钟10次，共享最多20个活动任务的队列；复用活动任务不扣次数。QUEUED/RUNNING的parameters=null，kind=TRANSCRIPTION；成功后outputs=[]，transcript为不可变识别稿的transcriptId/version=1引用。未知进度null，成功100。

腾讯使用录音极速版16k_zh，word_info=3；百炼使用北京地域Paraformer实时接口paraformer-realtime-v2。后端固定官方域名，不支持任意URL代理，不把私有视频改成公网地址。FFmpeg只提取第一条音轨为64kbps、16kHz单声道临时MP3，校验后传给选定供应商；不修改原素材，不作为输出发布。单任务总预算默认5分钟、租约7分钟；取消、失败、删除、注销或过期令牌均不能发布迟到字幕。临时音频完成后删除，崩溃遗留由现有任务租约/资源清理覆盖。无有效语音ASR_NO_SPEECH，协议/识别失败ASR_FAILED，不伪造字幕。不自动重试或切换付费服务；取消不能保证供应商不收费，已发送的数据也无法追回。

保留不可变originalSegments和所有版本，GET可选正整数version，省略为当前版本，历史不存在404。PATCH全量替换segments并传expectedVersion；版本冲突409 TRANSCRIPT_VERSION_CONFLICT，成功版本+1。1至3000段、ID唯一、整毫秒0<=startMs<endMs<=素材时长，按时间排序、不重叠。文字1至2000个码点，换行归一化、去首尾空白，禁止空白段、空行和控制字符（LF/tab除外），整个segments序列化JSON最多2MiB。SRT为UTF-8/CRLF原始字节流、attachment、no-store；version=1导出原始识别稿。删除素材或注销后，当前和历史字幕立即不可访问。

校对请求：`{"expectedVersion":1,"segmentId":"字幕段UUID"}`。只把已保存的该段文字发送DeepSeek，不发送音频或时间轴，不接收任意指令。35秒超时，JSON和文本边界校验，每用户默认5分钟20次。响应data为transcriptId/version/segmentId/originalText/correctedText；仅瞬时建议，不落库、不产生correctionId，不改变时间轴或字幕版本。用户确认后通过既有PATCH保存，调用前后重新检查版本和归属。DeepSeek不代替语音识别；aiPlans按DeepSeek配置及处理工具可用性声明。

凭据配置见README云端服务及下节；capabilities按当前登录用户计算，匿名仅报告站点能力，Cache-Control:no-store。配置状态不代表网络、权限或余额已经验证；未实现供应商余额查询、额度分配或自动付费重试。

### 个人云端凭据（2.14）

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| GET | /api/users/me/cloud-credentials | 200 Result，data为三个供应商的状态列表 |
| PUT | /api/users/me/cloud-credentials/{provider} | 200 Result，data为保存后的状态 |
| DELETE | /api/users/me/cloud-credentials/{provider} | 200 Result，清除密文并设为OFF，data为新状态 |

provider仅tencent/aliyun/deepseek，不支持自定义URL。全部需登录；PUT/DELETE需CSRF和JSON。响应no-store。无记录时version=0、mode=SERVER；保存后版本递增。状态字段provider/mode/version/configured/personalStored/appId/workspaceId/model/updatedAt，不含SecretId/SecretKey/API Key、密文或userId。configured只表示本地配置完整，不代表远程已验证。

PUT必填expectedVersion（非负整数）和mode（SERVER/PERSONAL/OFF）。PERSONAL：腾讯用appId/secretId/secretKey，百炼用apiKey和可选workspaceId，DeepSeek用apiKey和可选model（默认deepseek-flash）。字段格式及上限见OpenAPI；禁止跨供应商字段、控制字符与未知字段。省略或null的个人字段保留之前值，未保存过时密钥必须提供；显式空密钥校验失败。前端空密码框不提交字段。SERVER/OFF不得携带个人字段，保存后清除旧密文。DELETE请求体为`{"expectedVersion":1}`，删除后停用，不隐式使用站点额度；重新启用站点需显式PUT SERVER。

三种来源互斥，PERSONAL失败不回退站点。写入默认每用户5分钟20次，429含Retry-After；版本冲突409 CLOUD_CREDENTIALS_CONFLICT；主密钥/密文不可读503 CLOUD_CREDENTIALS_UNAVAILABLE，禁止回显敏感值。列表在单条不可解密时仍返回personalStored=true、configured=false，可删除或恢复主密钥。账号注销在同一事务物理删除凭据。主密钥、备份与HTTPS部署要求见README。

示例（仅虚构值）：`{"expectedVersion":0,"mode":"PERSONAL","apiKey":"sk-example-not-real","model":"deepseek-flash"}`。保存不会发起付费校验。调用服务时按会话/任务用户解密当前配置，秘密不写任务或方案；排队识别使用执行时的配置，切换或删除不能撤回已发出的请求及费用。登录和保存后应重新查询capabilities，不能跨用户缓存。

### 同源多段拼接

复用POST /api/operation-plans及execute，不新增草稿表、管理页或接口。parameters仅四字段：`{"operation":"join_clips","outputFormat":"mp4","clips":[{"startMs":2000,"endMs":3000},{"startMs":0,"endMs":1000}],"audioMode":"keep"}`。1至20段，每段为整数long毫秒、至少500ms，范围在本人就绪素材内，所有段时长之和最多900000ms。数组顺序就是输出顺序，允许倒序、重复和重叠；非法类型/额外字段/超时长422 INVALID_PARAMETERS。不接受路径、URL、跨素材ID或字幕参数；自然语言目前不生成拼接方案。

输出原展示尺寸取偶数、30fps、H.264/yuv420p MP4，首条音轨AAC 48kHz双声道；有音轨素材在缺失音频的区间补静音，避免拼接后声音错位；原素材无音轨时结果也无音轨。不覆盖源视频，结果名-joined.mp4。先顺序生成临时片段，再按受控ffconcat清单拼接重编码，避免倒序/重复取段时大量高清帧滞留内存。所有阶段共享默认5分钟超时、7分钟租约；临时分段合计和最终结果分别不超过输出上限（默认各1GiB，编码期间峰值磁盘约两倍）。按帧对齐，最终时长与所选总时长差不超过max(250ms,总时长/1000)；不合格FAILED/CLIP_JOIN_FAILED且无结果。

方案版本、执行去重、队列、取消、权限、预览/下载和删除沿用现有处理。入队参数冻结；后续编辑不修改运行任务。临时分段和清单在终态发布前清除；失败保留运行令牌，过期租约/删除/注销清理也覆盖所有受控文件。未开放的clip-drafts接口仍为PLANNED，不能拿来调用这个轻量方案。这里不提供跨素材拼接、命名草稿管理、拼接字幕重映射/SRT导出或同次拼接烧录；源画面已有的硬字幕会随画面保留。

拼接页支持添加/复制/移除/排序/预览，并在导出前确认。未提交编辑仅保留在当前页，离开时提示；服务端方案可恢复最近10条中的最新拼接方案，历史任务可恢复原有片段顺序。执行响应不确定时保留同一方案重试，编辑后更新未执行方案的版本。找片段结果加入拼接前核验当前字幕ID/版本，但拼接保存的是用户确认的源视频时间范围，不自动跟随字幕修改。

### 字幕烧录

复用POST /api/operation-plans及execute，不新增接口或表。parameters示例：`{"operation":"burn_subtitles","outputFormat":"mp4","transcriptId":"当前字幕UUID","transcriptVersion":2,"resolutionPreset":"source","audioMode":"keep"}`。仅接受这六个字段；字幕版本为正整数，resolutionPreset可为source或720p，其他枚举固定。素材须就绪；非本人/跨素材字幕404。创建、修改、首次执行要求最新字幕ID和版本同时匹配，否则409 TRANSCRIPT_VERSION_CONFLICT；重识别即使仍为v1也不能使用旧ID。任务入队后固定引用不可变历史版本，后续编辑或重识别不改变已确认内容。重复execute先复用原任务，不会因改稿再生成一个任务。

输出为H.264/yuv420p MP4、首条音轨AAC，无音轨不补音，不覆盖原素材，文件名-subtitled.mp4。固定底部居中、白字黑边、字号随输出高度缩放；支持中文、换行和自动换行，不开放自定义字体/样式命令。服务端生成纯文字ASS并用FFmpeg/libass渲染，转义用户覆盖标签及反斜线，不读取上传字幕文件、任意路径或URL。ASS时间向外取整到10ms，最终呈现按视频帧对齐，极短相邻段可能在同一帧出现。部署需提供覆盖字幕文字的系统字体；缺少中文字形可能显示方框。

capabilities.supportedOperations在ffprobe、H.264/AAC编码器和ass过滤器可用时包含burn_subtitles；已有字幕烧录不需要云端凭据。工具缺失503 SUBTITLE_BURN_UNAVAILABLE；烧录或输出验收失败任务FAILED/SUBTITLE_BURN_FAILED，无可用结果。沿用单任务默认5分钟超时、7分钟租约、1GiB输出上限和取消/资源权限；取消、删除或过期运行不能发布迟到文件。输出校验尺寸、编码、音轨和完整时长，误差不超过max(250ms, 源时长/1000)。私有ASS在发布终态前删除；清理失败保留运行令牌，租约回收重试，不让敏感字幕文件失去清理线索。

字幕页仅在查看最新已保存编辑稿、没有未保存修改时允许生成；确认后创建方案并执行。原稿/历史版本可下载SRT，但不能直接烧录；需要将修改保存为最新稿。结果复用鉴权播放、下载、取消与删除，刷新后可从处理记录恢复；执行响应丢失时重试同一方案，避免重复入队。

### 按字幕找片段

| 方法 | 路径 | 含义 |
| --- | --- | --- |
| POST | /api/media/{mediaId}/search | 按内容查找，200 Result<SearchResponse> |
| POST | /api/media/{mediaId}/clip-recommendations | 按目标和总时长推荐，200 Result<RecommendationResponse> |

检索请求：`{"query":"哪里提到使用限制","transcriptId":"当前字幕UUID","transcriptVersion":1,"limit":10}`。query为1至500个Unicode码点，去首尾空白后不得为空；limit可省略，默认10，范围1至20。推荐另加必填maxTotalDurationMs，范围1000至900000整毫秒；limit默认3，范围1至10。必须登录、提供CSRF且拥有素材及当前已保存字幕。

transcriptId与transcriptVersion必须同时匹配最新字幕；重识别另建ID，即使版本仍为1也拒绝旧ID。云端调用前后检查归属和版本，修改/替换后409 TRANSCRIPT_VERSION_CONFLICT，删除/非本人404。分析仅使用完整已保存字幕，不使用未保存编辑；单次最多600段、segments序列化UTF-8 JSON最多128KiB，超出422 TRANSCRIPT_ANALYSIS_TOO_LARGE，不悄悄截断。不建立向量索引、不新增表、不缓存旧结果。

模型只选择连续字幕段的首尾ID；后端重建区间内每一段真实evidence和首尾时间，拒绝未知ID、倒序、重叠、非法分数/文字或超预算输出，返回422 AI_ANALYSIS_FAILED。检索按score降序，score只用于AI相关度排序，不代表准确率。推荐每段至少500ms，所有endMs-startMs的和不超过预算，区间中的静音/字幕间隙也计时；title最多80码点、reason最多300码点，均为模型判断，需要用户复核。无匹配时200空matches/clips并给出提示，不编造。

两种模式共享每用户默认5分钟20次，与校对和方案生成共享最多2个云端文字请求、35秒超时，不自动重试或切换付费服务。限流429，未配置503 AI_UNAVAILABLE，繁忙503 AI_BUSY。capabilities.semanticSearch/clipRecommendations按DeepSeek配置声明，不依赖FFmpeg，也不代表网络、余额或真实效果已验收。前端调用前确认会向云端发送目标及已保存字幕，不能撤回已发送数据或保证免扣费。

“找片段”页展示原文、时间与建议，可在原视频编码兼容时预览该区间；其他编码仍可查看证据和带入裁切。带入前再次核验字幕ID/版本，再填写现有裁切页的起止时间，用户点击开始裁切才生成方案/任务。该流程是单段手动确认裁切，不是clip-draft、多段拼接或自动导出；修改查询/模式/限制或切换素材会清除旧结果。

尚未实现：GET /api/corrections/{correctionId}及POST apply（不能用于上述瞬时建议）、clip-drafts及多段导出。

草稿属于用户并关联一个素材，不是项目。导出使用版本及idempotencyKey：同键同请求复用任务，不同请求409，失败重试换新键。导出快照不受后续编辑影响，字幕按裁切/拼接重映射。多轨、跨素材拼接、团队共享、分类和支付不在本版。

## 7. 迁移与验收

V1-V9保持不变；V9的transcript和transcript_revision以复合外键约束用户归属，source_task_id唯一防重复发布。V10仅新增cloud_credential，用户/供应商联合主键、来源约束及密文，明文和主密钥不入库。字幕访问沿素材和账号检查逻辑删除，不创建磁盘SRT文件。自然语言方案、找片段和字幕烧录均不新增迁移，烧录复用不可变字幕历史。V5至V8的直接用户归属、租约、有界队列及三种清理范围保持。历史项目元数据只归档，不创建默认项目。

验收区分本地协议替身与真实云端：自动测试覆盖字幕版本/权限/SRT、幂等、取消/删除/租约、失败不覆盖、腾讯签名及句时间戳、百炼事件和分片、DeepSeek输出校验、有界外部响应；真实FFmpeg验证识别音频为16kHz单声道MP3。真实供应商可达性、授权/余额、识别准确率及实际费用须配置凭据后联调。浏览器测试不可指向生产服务。
