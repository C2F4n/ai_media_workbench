# 代码规范与检查

本项目由两人协作维护，使用仓库中的统一规则。Java 主代码和测试由 Checkstyle 检查；Vue、TypeScript、构建脚本和浏览器测试由 ESLint 检查。生成的 API 类型仍由接口契约生成器检查，不手动整理生成文件或第三方静态包。

## import

- Java 使用明确的类导入，测试中的静态导入也写具体成员，不使用 `*`。
- 普通 Java import 按完整包名字典序排列；静态 import 单独放在末尾，中间空一行。
- 正文优先使用已导入的简单类名。同名类产生歧义时可以保留完整包名，例如安全框架的 User 与业务 User。
- TypeScript 的类型使用 `import type`；外部依赖、项目内相对导入分组并排序，由 ESLint 自动整理。
- Three.js、API 类型等有明确命名空间用途的 `import * as THREE`、`import type * as API` 可以保留，它们与 Java 的通配符导入含义不同。
- 不保留未使用、重复或同包的多余导入。

## 结构与实现

- Controller 负责请求校验、调用 Service 接口、用 Result 包装 JSON 响应；不直接调用 Mapper 或实现类。文件预览与下载保留文件流响应。
- ServiceImpl 处理业务和事务；Mapper 和 XML 负责数据库访问。
- 参数使用 DTO，返回业务数据使用 VO。未知异常交给 exception 包的统一处理器；网络、进程、后台任务的恢复和清理需要在调用边界处理。
- 前端组件使用带 TypeScript 的 Vue 单文件组件，禁止显式 `any` 和跳过类型检查的指令。
- 已保存的数据与编辑草稿分开；父级明确提供的响应式草稿可以修改内容，子组件不替换 prop 引用。模板局部函数不要与 prop 重名。
- Canvas/WebGL 的事件、Observer、定时器和动画在卸载时清理；不可见页面暂停持续动画。
- 对密码和云端密钥不输出日志，不把异常堆栈或第三方原始错误直接显示给用户。
- `.editorconfig` 统一 UTF-8、空格缩进和文件末尾换行；Java/Gradle 使用四空格，其余源文件使用两空格。

## 运行检查

在项目根目录执行：

```powershell
.\gradlew.bat check
```

包含 Java 主代码/测试代码的规范检查、后端测试，以及构建所需的前端 lint、契约和类型检查。首次使用先在 frontend 中执行 `npm ci`，Gradle Wrapper 负责下载 Gradle。

只检查前端或自动整理 import：

```powershell
cd frontend
npm run check
npm run lint:fix
```

浏览器回归使用模拟 API，不访问个人账号的数据或调用付费模型：

```powershell
npm run build
npm run test:offline
```

IDEA 支持 `.editorconfig`；仓库将普通/静态 import 的自动合并阈值设为 999，避免常规自动优化把明确导入重新变为星号导入。提交前以 Checkstyle 和 ESLint 的结果为准。

## 前端页面范围

目前只提供新的 FrameFlow 手机式登录页和侧栏工作台。旧版选择入口、独立顶栏、旧侧栏、旧上传页及其专属背景已删除；旧链接中的 `workbench=legacy` 参数不再切换布局。素材播放器直接属于新编辑页，检测与上传由 MediaDetectionPanel 和 createMediaDetection 管理。

检查通过表示已配置规则和回归通过，不等于不存在业务缺陷。`runtime/workbench.ts` 仍承担较多流程协调，后续扩展适合按账号、字幕、处理任务逐步拆分；不应为了本次 import 整理同时重写这些业务流程。
