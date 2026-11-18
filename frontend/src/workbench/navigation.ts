import { reactive } from 'vue';

import type { NavigationState, PhaseId, ToolId } from './catalog';
import { isPhase, isTool, phases } from './catalog';

function element(id: string): HTMLElement {
  const value = document.getElementById(id);
  if (!value) throw new Error('Missing workbench element: ' + id);
  return value;
}

/** 新工作台的阶段状态；功能导航由 WorkbenchHomeScreen 和 WorkbenchToolTabs 管理。 */
export function createNavigation() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = reactive<NavigationState>({ tool: 'detect', phase: 'import', visible: false, busy: false });
  const rememberedPhases = new Map<ToolId, PhaseId>();
  let animation: Animation | undefined;
  function cancelAnimation() { animation?.cancel(); animation = undefined; }
  function applyPhase() {
    for (const phase of phases) {
      const panel = element('phase-' + phase);
      panel.hidden = state.tool === 'history' || phase !== state.phase;
      panel.inert = panel.hidden;
    }
    element('workspace-phases').style.setProperty('--phase-index', String(phases.indexOf(state.phase)));
    element('tool-stage').dataset.phase = state.phase;
    document.querySelectorAll<HTMLMediaElement>('#tool-stage video, #tool-stage audio').forEach(player => {
      if (state.tool === 'history' || !player.closest('#phase-' + state.phase)) player.pause();
    });
  }
  function selectPhase(value: string, withAnimation = true): boolean {
    if (!isPhase(value) || state.tool === 'history') return false;
    const previous = state.phase;
    state.phase = value;
    rememberedPhases.set(state.tool, value);
    applyPhase();
    cancelAnimation();
    if (withAnimation && previous !== value && !motion.matches && state.visible) {
      const direction = phases.indexOf(value) > phases.indexOf(previous) ? 1 : -1;
      const current = element('phase-' + value).animate(
        [{ opacity: .35, transform: 'translateX(' + direction * 12 + 'px)' }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: 200, easing: 'cubic-bezier(.2,.7,.3,1)' }
      );
      animation = current;
      void current.finished.then(() => { if (animation === current) cancelAnimation(); }).catch(() => {});
    }
    return true;
  }
  function selectTool(value: string): boolean {
    if (!isTool(value)) return false;
    rememberedPhases.set(state.tool, state.phase);
    state.tool = value;
    state.phase = rememberedPhases.get(value) ?? (value === 'detect' ? 'import' : 'edit');
    cancelAnimation();
    applyPhase();
    return true;
  }
  function reset() {
    rememberedPhases.clear();
    state.tool = 'detect'; state.phase = 'import';
    cancelAnimation(); applyPhase();
  }
  function update(value: Partial<Pick<NavigationState, 'visible' | 'busy'>>) {
    Object.assign(state, value);
    if (!state.visible) cancelAnimation();
  }
  function motionChanged() { if (motion.matches) cancelAnimation(); }
  motion.addEventListener('change', motionChanged);
  return {
    state, get tool() { return state.tool; }, get phase() { return state.phase; },
    selectTool, selectPhase, reset, update, connect: applyPhase,
    dispose() { cancelAnimation(); motion.removeEventListener('change', motionChanged); }
  };
}
