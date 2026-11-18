<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';

import { dockTileTransform } from '../dock-motion';
import type { WorkbenchHome } from '../types';
import type { ToolGroup, ToolId } from '../workbench/catalog';
import { toolGroups, tools } from '../workbench/catalog';
import MediaDetectionPanel from './MediaDetectionPanel.vue';

// The workbench mounts a separate tab strip for each category.
const props = defineProps<{ group: ToolGroup; label: string; visible: boolean; home: WorkbenchHome; navigationDisabled: boolean }>();
const tabs = tools.filter(tool => tool.group === props.group);
const stackOrder = shallowRef<ToolId[]>(tabs.map(tool => tool.id));
const active = computed(() => stackOrder.value[0]);
const activeIndex = computed(() => tabs.findIndex(tool => tool.id === active.value));
const tabList = ref<HTMLElement>();
const toolStack = ref<HTMLElement>();
const subnav = ref<HTMLElement>();
const indicator = shallowRef({ left: 0, width: 0 });
const transforms = shallowRef<string[]>([]);
const previewStack = ref(false);
const glowTracking = ref(false);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let glowPointer: PointerEvent | undefined;
let glowFrame = 0;

function buttons() {
  return [...(tabList.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])];
}

function updateIndicator() {
  const button = buttons()[activeIndex.value];
  if (button?.offsetWidth) indicator.value = { left: button.offsetLeft, width: button.offsetWidth };
}

function clearPointer() {
  transforms.value = [];
}

function enterTabs(event: PointerEvent) {
  if (event.pointerType === 'mouse') previewStack.value = true;
}

function leaveTabs() {
  previewStack.value = false;
  clearPointer();
}

function movePointer(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || motionPreference.matches) return;
  transforms.value = buttons().map(button => {
    const { left, top, width, height } = button.getBoundingClientRect();
    return dockTileTransform(event.clientX - left - width / 2, event.clientY - top - height / 2, .44, 144);
  });
}

function scheduleGlow() {
  if (!glowPointer || glowFrame) return;
  glowFrame = requestAnimationFrame(updateGlow);
}

function updateGlow() {
  glowFrame = 0;
  if (!glowPointer || !toolStack.value) return;
  const selector = previewStack.value
    ? '.workspace-tool-panel:is([data-depth="0"], [data-depth="1"], [data-depth="2"])'
    : '.workspace-tool-panel[data-depth="0"]';
  const panels = toolStack.value.querySelectorAll<HTMLElement>(selector);
  for (const panel of panels) {
    const glow = panel.querySelector<HTMLElement>('.workspace-tool-glow');
    if (!glow) continue;
    const { left, top, width, height } = panel.getBoundingClientRect();
    if (!width || !height) continue;
    const x = (glowPointer.clientX - left) / width * 100;
    const y = (glowPointer.clientY - top) / height * 100;
    glow.style.setProperty('--workspace-glow-x', `${x}%`);
    glow.style.setProperty('--workspace-glow-y', `${previewStack.value ? Math.max(0, y) : y}%`);
  }
  glowTracking.value = true;
}

function trackGlow(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || motionPreference.matches) return;
  glowPointer = event;
  scheduleGlow();
}

function clearGlow() {
  glowPointer = undefined;
  glowTracking.value = false;
  cancelAnimationFrame(glowFrame);
  glowFrame = 0;
}

function cardDepth(tool: ToolId) {
  return stackOrder.value.indexOf(tool);
}

function keydown(event: KeyboardEvent) {
  if (props.navigationDisabled || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  clearPointer();
  const step = event.key === 'ArrowLeft' ? -1 : 1;
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (activeIndex.value + step + tabs.length) % tabs.length;
  props.home.openTool(tabs[next].id);
  buttons()[next].focus();
}

const resizeObserver = new ResizeObserver(updateIndicator);
watch(() => props.home.tool, tool => {
  if (toolGroups[tool] === props.group && tool !== active.value) {
    stackOrder.value = [tool, ...stackOrder.value.filter(id => id !== tool)];
  }
}, { immediate: true });
watch([active, () => props.visible], ([, visible]) => {
  if (!visible) {
    leaveTabs();
    clearGlow();
    return;
  }
  updateIndicator();
  if (active.value !== 'detect' && active.value !== 'history' && !motionPreference.matches) {
    for (const animation of subnav.value?.getAnimations() ?? []) animation.cancel();
    subnav.value?.animate([
      { opacity: 0, transform: 'translateY(-8px) scaleY(.85)' },
      { opacity: 1, transform: 'translateY(0) scaleY(1)' }
    ], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  const panel = toolStack.value?.querySelector('.workspace-tool-panel[data-depth="0"]');
  for (const area of panel?.querySelectorAll('.workspace-tool-panel-body, .editor-inspector, .editor-controls') ?? []) {
    area.scrollTo({ top: 0 });
  }
  scheduleGlow();
}, { flush: 'post' });
onMounted(() => {
  for (const button of buttons()) resizeObserver.observe(button);
  updateIndicator();
  motionPreference.addEventListener('change', clearPointer);
  motionPreference.addEventListener('change', clearGlow);
});
onUnmounted(() => {
  resizeObserver.disconnect();
  clearGlow();
  motionPreference.removeEventListener('change', clearPointer);
  motionPreference.removeEventListener('change', clearGlow);
});
</script>

<template>
  <div class="workspace-tool-tabs" :data-preview-stack="previewStack" :data-glow-tracking="glowTracking" :hidden="!visible"
    @pointermove.passive="trackGlow" @pointerleave="clearGlow" @pointercancel="clearGlow" @scroll.capture.passive="scheduleGlow">
    <div class="workspace-tool-header">
      <div class="workspace-tool-nav"
        @pointerenter="enterTabs" @pointerleave="leaveTabs" @pointercancel="leaveTabs">
        <h1 class="workspace-tool-title">{{ label }}</h1>
        <div class="workspace-tool-tab-scroll" @scroll="clearPointer">
          <div ref="tabList" class="workspace-tool-tab-list" role="tablist" :aria-label="`${label}子功能`"
            @keydown="keydown" @pointermove="movePointer">
            <span class="workspace-tool-tab-indicator" aria-hidden="true"
              :style="{ translate: `${indicator.left}px 0`, width: `${indicator.width}px` }">
              <span :style="{ transform: transforms[activeIndex] }"></span>
            </span>
            <button v-for="(tool, index) in tabs" :id="`workspace-tool-tab-${tool.id}`" :key="tool.id" type="button"
              class="workspace-tool-tab" role="tab" :aria-controls="`workspace-tool-panel-${tool.id}`"
              :aria-selected="tool.id === active" :tabindex="tool.id === active ? 0 : -1"
              :disabled="navigationDisabled" @click="home.openTool(tool.id)">
              <span :style="{ transform: transforms[index] }">{{ tool.label }}</span>
            </button>
          </div>
        </div>
      </div>
      <div ref="subnav" :id="`workspace-subnav-${group}`" class="workspace-subnav"
        :hidden="active === 'detect' || active === 'history'"></div>
    </div>
    <div ref="toolStack" class="workspace-tool-stack">
      <section v-for="tool in tabs" :id="`workspace-tool-panel-${tool.id}`" :key="tool.id" class="workspace-tool-panel"
        :class="{ 'workspace-detection-panel': tool.id === 'detect' }"
        role="tabpanel" :aria-labelledby="`workspace-tool-tab-${tool.id}`" :aria-hidden="tool.id !== active"
        :inert="tool.id !== active" :data-depth="cardDepth(tool.id)"
        :style="{ '--workspace-card-depth': cardDepth(tool.id) }">
        <span class="workspace-tool-glow" aria-hidden="true"></span>
        <div class="workspace-tool-panel-body" tabindex="0">
          <MediaDetectionPanel v-if="tool.id === 'detect'" :detection="home.detection" :active="visible && active === tool.id"
            :disabled="home.busy" />
          <div :id="`workspace-tool-surface-${tool.id}`" class="workspace-tool-surface"></div>
        </div>
      </section>
    </div>
  </div>
</template>
