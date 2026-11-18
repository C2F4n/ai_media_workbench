import { createApp, h, shallowReactive } from 'vue';
import App from './App.vue';
import type { AuthEntryServices } from './auth/types';
import FindResults from './components/FindResults.vue';
import PlanDetailsView from './components/PlanDetails.vue';
import type { ClipAction, ClipResult, FindState, PlanDetails, WorkbenchHome } from './types';
import ToolSidebar from './components/ToolSidebar.vue';
import WorkbenchPhases from './components/WorkbenchPhases.vue';
import { createNavigation } from './workbench/navigation';
import type { NavigationServices, PhaseId, ToolGroup, ToolId } from './workbench/catalog';
export { newPasswordIssue, usernameIssue, existingPasswordIssue } from './auth/validation';
export { toolNames } from './workbench/catalog';
export { mountHistory, createRecordState } from './workbench/history-views';
export { mountSequenceEditors } from './workbench/editor-views';
export { mountTranscriptEditors } from './workbench/transcript-views';
export { mountCloudSettings } from './cloud/view';
export { textVendors } from './cloud/catalog';
// 页面骨架必须先挂载，下面各组件才能找到自己的容器；业务请求不在展示组件中重复建立。
export function mountApplication(auth: AuthEntryServices, home: WorkbenchHome | null) {
  return createApp(App, { auth, home }).mount('#app');
}

export function mountWorkspaceNavigation(sidebar: HTMLElement, phases: HTMLElement, services: NavigationServices) {
  const navigation = createNavigation();
  const sidebarApp = createApp({ render: () => h(ToolSidebar, { state: navigation.state,
    onSelect: (tool: ToolId) => { if (!navigation.state.busy) services.selectTool(tool); },
    onGroup: (group: ToolGroup, expanded: boolean) => { if (!navigation.state.busy) navigation.setGroup(group, expanded); },
    onPin: navigation.togglePin, onClose: () => navigation.setOpen(false)
  }) });
  const phaseApp = createApp({ render: () => h(WorkbenchPhases, { state: navigation.state,
    onSelect: (phase: PhaseId) => { if (!navigation.state.busy) services.selectPhase(phase); }
  }) });
  sidebarApp.mount(sidebar); phaseApp.mount(phases); navigation.connect();
  return { ...navigation, get tool() { return navigation.tool; }, get phase() { return navigation.phase; },
    dispose() { navigation.dispose(); sidebarApp.unmount(); phaseApp.unmount(); }
  };
}

// Vue 负责容器内的列表和禁用状态；协调器通过 update 更新数据、接收动作，不直接重写其 DOM。
export function mountFindResults(element: HTMLElement, action: (action: ClipAction, item: ClipResult) => void) {
  const state = shallowReactive<FindState>({ result: null, recommend: false, busy: false, previewAvailable: false, canTrim: false, canJoin: false });
  const app = createApp({ render: () => h(FindResults, { ...state, onAction: action }) });
  app.mount(element);
  return {
    update(value: Partial<FindState>) { Object.assign(state, value); },
    clear() { state.result = null; },
    dispose() { app.unmount(); }
  };
}

export function mountPlanDetails(element: HTMLElement) {
  const state = shallowReactive<{ plan: PlanDetails | null }>({ plan: null });
  const app = createApp({ render: () => h(PlanDetailsView, { plan: state.plan }) });
  app.mount(element);
  return { update(plan: PlanDetails | null) { state.plan = plan; }, dispose() { app.unmount(); } };
}
