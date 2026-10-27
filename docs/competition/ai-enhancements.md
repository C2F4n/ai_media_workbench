# 比赛增强：组件化、工具调用与字幕 RAG

## 当前完成范围

| 方向 | 已实现 | 不能据此声称 |
| --- | --- | --- |
| 前端工程 | 全站Vue 3单文件组件、严格TypeScript、Vite构建；动态列表、编辑器、云端设置由Vue管理，88个接口数据类型由OpenAPI生成并检查 | 所有DOM操作均已移除、所有状态已迁入Pinia或真实云端已验收 |
| 工具调用 | 个人OpenAI/DeepSeek/百炼/豆包走Chat Completions的tools/tool_calls协议 | 已实现MCP服务器、无限循环Agent或无需确认的自主剪辑 |
| 字幕RAG | 已保存字幕分块、中文全文索引、BM25召回、模型筛选、服务端原文/时间引用校验 | embedding向量检索、视觉理解、同义改写必定召回或模型准确率100% |

本轮无数据库迁移，不引入项目、分类或团队空间。原来的注册、视频处理、字幕编辑、翻译和手动顺序处理保留。

## 前端构建

开发/从源码构建需要Node.js 22.12+或24 LTS，先在frontend执行`npm ci`。Java仍用21；Gradle使用仓库Wrapper，不要求单独安装。源码位于frontend/src，index.html仅保留挂载点；main.ts启动App.vue及runtime/workbench.ts，不再保留或加载旧static/assets/app.js。

```powershell
# 在frontend目录安装依赖、独立构建与校验
npm ci
npm run build
npm run check
npm run test:offline

# 返回仓库根目录，Gradle会先校验并构建Vue资源再打包
Set-Location ..
.\gradlew.bat bootJar
```

Vue使用预编译模板，不需要unsafe-eval，沿用站点CSP。Vite只清理专属输出目录static/assets/ui，不清理原静态资源，并生成THIRD_PARTY_NOTICES.md保留所用依赖的版权和许可。已生成组件包随源码一起保留，IDEA直读资源也能使用；更改组件源码后必须重新构建。Gradle的processResources依赖frontendBuild，避免JAR打进旧组件。运行打包好的JAR不需要Node.js。

views目录负责完整页面及各编辑面板；components目录负责交互组件。MediaLibrary、TaskHistory、PlanHistory负责素材、任务与方案列表，RecordDetails负责按需展开描述。JoinRanges、WorkflowSteps负责范围/顺序草稿和排序，SubtitleSegments、TranslationSegments负责字幕编辑及校对建议，CloudProvider负责厂商、预设/自定义模型、凭据草稿及状态。FindResults负责候选列表和时间引用；PlanDetails负责参数与澄清问题。workbench下的桥接模块接收动作，再调用原有版本检查、预览、执行和删除流程；全局忙碌逻辑不直接覆写这些Vue组件的DOM。

api/contracts.ts由docs/api/openapi.json的88个schema生成，npm run generate:api用于接口变化后更新；npm run check会先检查契约一致性，再执行严格类型检查。runtime/types.ts单独描述可编辑草稿，不修改接口契约以迁就表单。api/client.ts集中处理同源请求、Result解析、安全错误和CSRF刷新；只有明确的CSRF拒绝重试一次，网络错误不自动重发付费或写入操作。不会把会话令牌放进浏览器存储。

AuthForms.vue和AuthField.vue负责登录、注册、密码显隐及字段错误；auth/use-auth.ts集中管理表单草稿、首次错误焦点、验证码绑定、分邮箱倒计时、异步提交锁和切换动画。登录和注册的请求DTO在auth/types.ts中约束，确认密码不发送到后端。auth/validation.ts与原账户修改密码页共享密码校验规则；注册仍受后端最终校验，不以客户端校验替代安全检查。

认证组件通过AuthServices调用已有同源请求入口，不建立第二套Cookie或CSRF状态，不在localStorage/sessionStorage保存密码、验证码或登录令牌。登录成功仍使用服务端轮换后的CSRF，网络失败不自动重发；只有CSRF过滤器拒绝时沿用原来的一次刷新重试。邮件发送失败不进入成功倒计时，429遵循Retry-After；更换邮箱清除旧验证码绑定，迟到的发码响应不能绑定新邮箱。标题/标签栏保持原位，只对下方表单进行可取消动画，并尊重减少动态效果设置。

ToolSidebar.vue负责分组、功能按钮、API来源徽标和选中指示；WorkbenchPhases.vue负责导入/编辑/导出页签和键盘操作。workbench/catalog.ts统一定义功能ID、分组、阶段和名称；workbench/navigation.ts以一份Vue响应式状态管理当前功能、各功能阶段记忆、展开/固定、忙碌状态和动画。类型化协调器只读取当前功能、提交切换请求并执行业务，不再维护另一套activeTool/activePhase或逐个绑定导航按钮。

导航控制器负责外层布局属性、遮罩、焦点边界和阶段面板可见性，不重新挂载视频或编辑器。桌面固定偏好与手机抽屉状态分开，手机临时开关不覆盖桌面偏好；分组折叠保留。浏览器仅持久化布尔型导航/分组偏好，格式损坏或存储禁用时回退到默认值；不保存素材、处理要求、当前账号、令牌或阶段草稿。退出、重新登录或其他标签页切换账号时清空旧工作台和阶段记忆，防止沿用前一账号的状态。

轮播、主题、原生表单/视频、dialog和焦点控制保留在严格类型化协调器及DOM访问层中；这不是“无DOM代码”的重写，也未引入第二套路由、Pinia或新业务接口。页面结构和动态编辑区域各有明确归属，协调器不再创建列表行或替换Vue列表根节点。当前只有一套构建入口，所有浏览器业务源码接受严格TypeScript检查；测试与构建脚本仍可使用Node.js的JavaScript。

## 标准工具调用

云端方案入口只注册两个工具：

- submit_media_plan：提交完整候选参数，沿用现有OperationParameters/WorkflowParameters校验及方案创建。
- request_clarification：返回固定枚举中的1至3个澄清问题，不猜测需求。

请求关闭并行工具调用，不再同时要求response_format=json_object。后端只接受一条完整的function tool_call，拒绝未知工具、截断、多个调用、普通文字代替工具、无效参数或越权字段。原有格式、能力、时长、所有权、限流和并发检查仍生效；生成不执行，用户确认后才由原有有序工作流执行器调用FFmpeg。

不会把模型输出拼接为命令、路径或URL，不把文件名、密钥、磁盘路径传给模型。云端工具调用与其他文字功能共享并发槽，失败不自动重试、不退回另一厂商或普通JSON请求。自定义云端模型须支持Function Calling；保存密钥不代表已验证工具能力或费用。供应商不支持时按原有安全错误分类提示。

服务端本地千问继续使用已验证的JSON约束，不冒充原生Function Calling。它返回的候选同样通过现有安全校验和人工确认，后续可在确认llama.cpp工具模板兼容后再迁移。

## 字幕 RAG 数据流

1. 先按账号、素材、字幕ID与版本读取已保存快照，未保存编辑不进入索引。
2. 将相邻字幕按最多8段/约12KiB原文分块，相邻块保留2段重叠；超长单段仍受原字幕2000码点约束。
3. 在隔离的内存索引中使用SmartChinese中文分词和CJK双字词字段，以Lucene BM25检索候选块。查询只生成受控TermQuery，不解释查询脚本或任意查询语言。
4. 按召回顺序合并、去重，恢复原字幕顺序，最多96段/32KiB候选字幕JSON再发给模型。索引最多双并发，完成后关闭并释放，不落磁盘、不共享跨账号数据。
5. 模型选择首尾段ID；后端要求区间内每一段都在本次候选中，拒绝跨未召回区间、伪造引文、改写时间、重叠或超预算结果。
6. 返回前再次检查归属、字幕ID和版本，防止编辑、重识别或删除过程中发布过期证据。

搜索没有词汇命中时不调用模型，直接空结果。推荐模式没有词汇命中时均匀抽样有限候选，并返回BM25_COVERAGE；它不是全文语义分析。retrieval返回method、totalSegments、indexedChunks、retrievedSegments和contextBytes；最后一个只统计候选字幕JSON，不是完整请求token数。

没有向量数据库或额外embedding费用。代价是每次请求重新索引，以及BM25对同义词、隐含含义和跨很远区间的召回有限；后续需要真实语料评估再决定是否加入混合向量召回，不以算法名称代替效果验证。

## 复现与演示

自动后端测试包括FunctionCallingTests、SubtitleRetrievalTests、CloudAiTests及TranscriptIntegrationTests。检索测试有长字幕中的六组标注目标、中文/英文混合、UTF-8及转义字节边界、无命中、抽样、跨遗漏段引用和旧版本隔离；这只是合成语料回归，不是实际视频的模型准确率报告。

前端测试使用拦截接口和本地生成视频，不产生云端费用；覆盖原文XSS转义、引用时间预览、带入裁切/拼接、忙碌/不兼容禁用、版本失效、桌面/手机布局和方案确认。

认证迁移回归包括auth-components.spec.js、auth-validation.spec.js、auth-gallery.spec.js和registration-retry.spec.js，覆盖连续提交只发一次、登录后CSRF轮换、一次安全刷新重试上限、网络失败解锁、服务端字段错误转义、邮箱切换与迟到响应隔离，以及六种视口的标题定位/动画。接口由测试拦截，不会向真实邮箱发信，也不替代真实邮件交付或公网HTTPS验收。

导航迁移回归包括navigation-components.spec.js、navigation.spec.js和phases.spec.js，覆盖每个功能独立的阶段记忆、保留视频节点、快速切换只产生一次动画、手机焦点循环/返回、响应式布局、存储异常、请求期间禁用、跨账号清理和生产CSP。阶段测试播放本地FFmpeg生成的真实视频并检查像素，确认迁移后预览不是空白；接口仍为拦截替身，不会创建真实云端任务。

前端架构测试同时检查：无遗留JS业务入口、Vue脚本使用TypeScript、无any或类型检查绕过、静态ID不重复、协调器引用的节点存在。完整离线回归还覆盖列表展开/删除、顺序步骤排序、字幕校对与翻译、凭据显式保存及过期确认隔离。

2026-10-27本机验证：后端265项测试中264项通过，1项本地模型烟测按条件跳过；187项离线浏览器回归通过。另19项真实联调测试全部通过：在隔离H2内存数据库、临时存储和仅回环监听的测试SMTP收件箱上验证真实注册/登录/密码修改/注销、个人配置隔离，以及FFmpeg转换/压缩/静音/裁切/拼接/多格式音频/组合导出/删除撤权。没有使用正式数据库、真实发信服务或付费模型；H2联调不替代部署环境的MySQL和真实供应商验收。JAR已检查无旧app.js，内置组件包与当前构建一致。额外修复注销/停用账号登录时解析销毁密码标记产生的异常日志：非有效账号统一走框架未知用户耗时保护，保留通用凭据错误，不泄露账号状态。

正式比赛演示还需两人共同完成：准备有授权的真实视频和人工标注目标；记录实际模型/服务商、召回覆盖率、最终证据正确性、耗时、上下文大小及失败案例；展示一次澄清和一次拒绝不支持操作。涉及付费云端调用由使用者提供配置并确认费用，不能把替身测试当作真实模型验收。前端迁移代码已完成；答辩材料、演示视频、真实评测和公网HTTPS部署验收不包含在此完成声明中。

协议参考：[OpenAI Function Calling](https://developers.openai.com/api/docs/guides/function-calling)、[DeepSeek Chat API](https://api-docs.deepseek.com/api/create-chat-completion/)、[百炼工具调用](https://help.aliyun.com/en/model-studio/qwen-function-calling)、[Vue渐进挂载](https://vuejs.org/guide/essentials/application.html)、[Lucene中文分析器](https://lucene.apache.org/core/10_3_2/analysis/smartcn/org/apache/lucene/analysis/cn/smart/SmartChineseAnalyzer.html)。
