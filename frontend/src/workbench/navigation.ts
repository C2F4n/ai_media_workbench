import { nextTick, reactive } from 'vue';
import { groups, isPhase, isTool, phases, tools } from './catalog';
import type { NavigationState, PhaseId, ToolGroup, ToolId } from './catalog';

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing workbench element: ${id}`);
  return value as T;
}
function stored(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Navigation still works without browser storage. */ }
}

// One source of truth for tool/phase selection and navigation preferences. No media or credentials are persisted here.
export function createNavigation() {
  const narrow = matchMedia('(max-width: 900px)'), motion = matchMedia('(prefers-reduced-motion: reduce)');
  const saved = stored('amw-navigation'), savedGroups = stored('amw-tool-groups');
  const preference = record(saved) && typeof saved.pinned === 'boolean' && typeof saved.open === 'boolean'
    ? { pinned: saved.pinned, open: saved.open } : { pinned: true, open: true };
  const state = reactive<NavigationState>({
    tool: 'detect', phase: 'import', open: !narrow.matches && preference.open, pinned: preference.pinned,
    narrow: narrow.matches, visible: false, busy: false, groups: { regular: true, ai: true, history: true },
    localTextAI: false, textService: null, indicator: { visible: false, top: 0, height: 0 }
  });
  if (record(savedGroups)) for (const group of groups) {
    const expanded = savedGroups[group.id];
    if (typeof expanded === 'boolean') state.groups[group.id] = expanded;
  }
  const rememberedPhases = new Map<ToolId, PhaseId>();
  let toolAnimation: Animation | null = null, phaseAnimation: Animation | null = null;
  let disposed = false, focusRevision = 0, frame = 0;
  const sidebar = element('tool-sidebar'), layout = element('workbench-layout'), content = element('tool-content');
  const toggle = element<HTMLButtonElement>('toggle-sidebar'), backdrop = element<HTMLButtonElement>('sidebar-backdrop');

  function drawer() { return !state.pinned || state.narrow; }
  function shown() { return state.visible && state.open; }
  function remember() { save('amw-navigation', { pinned: state.pinned, open: preference.open }); }
  function updateIndicator() {
    if (disposed) return;
    const tool = tools.find(tool => tool.id === state.tool)!;
    const button = document.getElementById(`${state.tool}-tool`), navigation = document.getElementById('tool-navigation');
    state.indicator.visible = shown() && state.groups[tool.group] && !!button && !!navigation?.getClientRects().length;
    if (!state.indicator.visible || !button || !navigation) return;
    state.indicator.top = button.getBoundingClientRect().top - navigation.getBoundingClientRect().top + navigation.scrollTop;
    state.indicator.height = button.offsetHeight;
  }
  function scheduleIndicator() {
    void nextTick(() => {
      if (disposed) return;
      cancelAnimationFrame(frame); frame = requestAnimationFrame(updateIndicator);
    });
  }
  function syncLayout() {
    const visible = shown(), modal = visible && drawer();
    layout.dataset.navOpen = String(visible); layout.dataset.navPinned = String(state.pinned);
    sidebar.inert = !visible; content.inert = modal;
    sidebar.setAttribute('role', modal ? 'dialog' : 'complementary');
    if (modal) sidebar.setAttribute('aria-modal', 'true'); else sidebar.removeAttribute('aria-modal');
    backdrop.hidden = !modal; backdrop.disabled = state.busy;
    document.body.classList.toggle('nav-drawer-open', modal);
    toggle.setAttribute('aria-expanded', String(visible)); toggle.disabled = state.busy;
    toggle.title = visible ? '收起功能栏' : '展开功能栏'; toggle.setAttribute('aria-label', toggle.title);
    scheduleIndicator();
  }
  function focusSelected() {
    const group = tools.find(tool => tool.id === state.tool)!.group;
    element(state.groups[group] ? `${state.tool}-tool` : `${group}-group-toggle`).focus({ preventScroll: true });
  }
  function setOpen(value: boolean, focus = true) {
    const revision = ++focusRevision;
    state.open = value;
    if (!state.narrow) { preference.open = value; remember(); }
    syncLayout();
    if (focus && !value) toggle.focus({ preventScroll: true });
    else if (focus && drawer()) void nextTick(() => {
      if (!disposed && revision === focusRevision && shown()) focusSelected();
    });
  }
  function setGroup(name: ToolGroup, expanded: boolean) {
    if (!expanded && element(`${name}-group-body`).contains(document.activeElement)) element(`${name}-group-toggle`).focus({ preventScroll: true });
    state.groups[name] = expanded; save('amw-tool-groups', state.groups); scheduleIndicator();
  }
  function togglePin() {
    if (state.busy) return;
    state.pinned = !state.pinned; preference.open = true; state.open = true;
    remember(); syncLayout();
  }
  function cancelAnimation(kind: 'tool' | 'phase') {
    if (kind === 'tool') { toolAnimation?.cancel(); toolAnimation = null; }
    else { phaseAnimation?.cancel(); phaseAnimation = null; }
  }
  function animate(kind: 'tool' | 'phase', target: HTMLElement, frames: Keyframe[], duration: number) {
    cancelAnimation(kind);
    const current = target.animate(frames, { duration, easing: 'cubic-bezier(.2,.7,.3,1)' });
    if (kind === 'tool') toolAnimation = current; else phaseAnimation = current;
    void current.finished.then(() => {
      if (kind === 'tool' ? toolAnimation === current : phaseAnimation === current) cancelAnimation(kind);
    }).catch(() => {});
  }
  function applyPhase() {
    for (const phase of phases) {
      const panel = element(`phase-${phase}`);
      panel.hidden = state.tool === 'history' || phase !== state.phase;
      panel.inert = panel.hidden;
    }
    element('workspace-phases').style.setProperty('--phase-index', String(phases.indexOf(state.phase)));
    element('tool-stage').dataset.phase = state.phase;
    for (const player of Array.from(document.querySelectorAll<HTMLMediaElement>('#tool-stage video, #tool-stage audio'))) {
      if (state.tool === 'history' || !player.closest(`#phase-${state.phase}`)) player.pause();
    }
  }
  function selectPhase(value: string, withAnimation = true): boolean {
    if (!isPhase(value) || state.tool === 'history') return false;
    const previous = state.phase;
    state.phase = value; rememberedPhases.set(state.tool, value);
    applyPhase(); cancelAnimation('phase');
    if (withAnimation && previous !== value && !motion.matches && state.visible) {
      const direction = phases.indexOf(value) > phases.indexOf(previous) ? 1 : -1;
      animate('phase', element(`phase-${value}`), [{ opacity: .35, transform: `translateX(${direction * 12}px)` }, { opacity: 1, transform: 'translateX(0)' }], 200);
    }
    return true;
  }
  function selectTool(value: string, revealGroup = true): boolean {
    if (!isTool(value)) return false;
    const previous = state.tool;
    rememberedPhases.set(previous, state.phase); state.tool = value;
    const group = tools.find(tool => tool.id === value)!.group;
    if (revealGroup && !state.groups[group]) setGroup(group, true);
    state.phase = rememberedPhases.get(value) ?? (value === 'detect' ? 'import' : 'edit');
    applyPhase(); cancelAnimation('phase'); cancelAnimation('tool'); scheduleIndicator();
    if (previous !== value && !motion.matches && state.visible) {
      const direction = tools.findIndex(tool => tool.id === value) > tools.findIndex(tool => tool.id === previous) ? 1 : -1;
      animate('tool', element('tool-stage'), [{ opacity: .45, transform: `translateY(${direction * 18}px)` }, { opacity: 1, transform: 'translateY(0)' }], 220);
    }
    if (state.open && drawer()) setOpen(false);
    return true;
  }
  function reset() {
    rememberedPhases.clear(); state.tool = 'detect'; state.phase = 'import';
    cancelAnimation('tool'); cancelAnimation('phase'); applyPhase(); scheduleIndicator();
  }
  function update(value: Partial<Pick<NavigationState, 'visible' | 'busy' | 'localTextAI' | 'textService'>>) {
    const wasModal = shown() && drawer();
    Object.assign(state, value); syncLayout();
    if (!state.visible) { focusRevision++; cancelAnimation('tool'); cancelAnimation('phase'); }
    if (wasModal && !shown() && sidebar.contains(document.activeElement)) {
      const accountButton = document.getElementById('back-workbench');
      if (accountButton?.getClientRects().length) accountButton.focus({ preventScroll: true });
    }
  }
  function resized() {
    const focused = sidebar.contains(document.activeElement);
    state.narrow = narrow.matches; state.open = !state.narrow && preference.open;
    focusRevision++; syncLayout();
    if (focused && !shown()) toggle.focus({ preventScroll: true });
  }
  function motionChanged() { if (motion.matches) { cancelAnimation('tool'); cancelAnimation('phase'); } }
  function keydown(event: KeyboardEvent) {
    if (!shown() || !drawer()) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    if (event.key !== 'Tab') return;
    const controls = Array.from(sidebar.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).filter(button => button.getClientRects().length && !button.closest('[inert]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  const openClicked = () => { if (!state.busy) setOpen(!state.open); };
  const closeClicked = () => setOpen(false);
  const observer = new ResizeObserver(updateIndicator);
  function connect() {
    for (const group of groups) observer.observe(element(`${group.id}-group-body`));
    toggle.addEventListener('click', openClicked); backdrop.addEventListener('click', closeClicked);
    narrow.addEventListener('change', resized); motion.addEventListener('change', motionChanged);
    document.addEventListener('keydown', keydown); window.addEventListener('resize', updateIndicator);
    syncLayout(); applyPhase();
  }
  function dispose() {
    disposed = true; focusRevision++; cancelAnimationFrame(frame); observer.disconnect();
    cancelAnimation('tool'); cancelAnimation('phase');
    toggle.removeEventListener('click', openClicked); backdrop.removeEventListener('click', closeClicked);
    narrow.removeEventListener('change', resized); motion.removeEventListener('change', motionChanged);
    document.removeEventListener('keydown', keydown); window.removeEventListener('resize', updateIndicator);
    content.inert = false; document.body.classList.remove('nav-drawer-open');
  }
  return { state, get tool() { return state.tool; }, get phase() { return state.phase; },
    selectTool, selectPhase, reset, update, setOpen, setGroup, togglePin, connect, dispose };
}
