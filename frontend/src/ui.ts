import { createApp, h, shallowReactive } from 'vue';
import App from './App.vue';
import FindResults from './components/FindResults.vue';
import PlanDetailsView from './components/PlanDetails.vue';
import AuthForms from './components/AuthForms.vue';
import type { AuthServices, AuthView } from './auth/types';
import type { ClipAction, ClipResult, FindState, PlanDetails } from './types';
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
export function mountApplication() { return createApp(App).mount('#app'); }

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

export function mountAuthForm(element: HTMLElement, services: AuthServices): AuthView {
  return createApp(AuthForms, { services }).mount(element) as unknown as AuthView;
}

// Components own their DOM and state; the typed coordinator handles business commands.
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
