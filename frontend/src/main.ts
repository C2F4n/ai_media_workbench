export * from './ui';
export { startWorkbench } from './runtime/workbench';
import { startWorkbench } from './runtime/workbench';

// 浏览器唯一启动入口：先创建 Vue 页面，再由协调器恢复登录状态并绑定业务操作。
// 修改前端逻辑应从 frontend/src 阅读；static/assets/ui/components.js 是构建产物。
startWorkbench();
