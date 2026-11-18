<script setup lang="ts">
import { ArrowLeft, History, Settings, SlidersHorizontal, Sparkles, UserRound } from '@lucide/vue';
import { computed, ref, watch } from 'vue';

import WorkbenchToolTabs from '../components/WorkbenchToolTabs.vue';
import type { WorkbenchHome, WorkbenchHomeSection } from '../types';
import { groups } from '../workbench/catalog';

const props = defineProps<{ home: WorkbenchHome }>();
const expanded = ref(false);
const toggle = ref<HTMLButtonElement>();
const content = ref<HTMLElement>();
const initial = computed(() => Array.from(props.home.userName.trim())[0]?.toUpperCase() || 'F');
const groupIcons = { regular: SlidersHorizontal, ai: Sparkles, history: History };
const currentGroup = computed(() => groups.find(group => group.id === props.home.section));
const navigatingDisabled = computed(() => props.home.busy || props.home.detection.state.pending === 'upload'
  || props.home.detection.state.pending === 'retry');
watch([() => props.home.section, () => props.home.tool], () => content.value?.scrollTo({ top: 0 }), { flush: 'post' });

function enter(event: PointerEvent) {
  if (event.pointerType === 'mouse') expanded.value = true;
}

function focusIn(event: FocusEvent) {
  if (event.target instanceof HTMLElement && event.target !== toggle.value && event.target.matches(':focus-visible')) {
    expanded.value = true;
  }
}

function focusOut(event: FocusEvent) {
  const sidebar = event.currentTarget;
  if (sidebar instanceof HTMLElement && !sidebar.matches(':hover') &&
      !(event.relatedTarget instanceof Node && sidebar.contains(event.relatedTarget))) {
    expanded.value = false;
  }
}

function collapse() {
  expanded.value = false;
  toggle.value?.focus();
}

function open(section: WorkbenchHomeSection) {
  if (navigatingDisabled.value) return;
  props.home.open(section);
  if (matchMedia('(hover: none)').matches) expanded.value = false;
}
</script>

<template>
  <div class="workspace-home">
    <aside id="workspace-home-sidebar" class="workspace-home-sidebar" :data-expanded="expanded"
      @pointerenter="enter" @pointerleave="expanded = false" @focusin="focusIn" @focusout="focusOut"
      @keydown.esc.prevent="collapse">
      <button ref="toggle" type="button" class="workspace-home-logo workspace-home-link"
        :aria-label="expanded ? '收起侧栏' : '展开侧栏'" :aria-expanded="expanded"
        aria-controls="workspace-home-nav" @click="expanded = !expanded">
        <span class="workspace-home-mark" aria-hidden="true"></span>
        <span class="workspace-home-label" aria-hidden="true">FrameFlow</span>
      </button>
      <nav id="workspace-home-nav" class="workspace-home-nav" aria-label="工作台导航">
        <button v-for="group in groups" :key="group.id" type="button" class="workspace-home-link"
          :aria-label="group.label" aria-controls="workspace-home-overview"
          :aria-current="home.section === group.id ? 'page' : undefined"
          :disabled="navigatingDisabled" @click="open(group.id)">
          <span class="workspace-home-icon"><component :is="groupIcons[group.id]" aria-hidden="true" /></span>
          <span class="workspace-home-label" aria-hidden="true">{{ group.label }}</span>
        </button>
      </nav>
      <div class="workspace-home-account-actions">
        <button type="button" class="workspace-home-link" aria-label="个人资料" aria-controls="account-panel"
          :aria-current="home.section === 'profile' ? 'page' : undefined"
          :disabled="navigatingDisabled" @click="open('profile')">
          <span class="workspace-home-icon"><UserRound aria-hidden="true" /></span>
          <span class="workspace-home-label" aria-hidden="true">个人资料</span>
        </button>
        <button type="button" class="workspace-home-link" aria-label="设置" aria-controls="account-panel"
          :aria-current="home.section === 'settings' ? 'page' : undefined"
          :disabled="navigatingDisabled" @click="open('settings')">
          <span class="workspace-home-icon"><Settings aria-hidden="true" /></span>
          <span class="workspace-home-label" aria-hidden="true">设置</span>
        </button>
        <button type="button" class="workspace-home-link" aria-label="退出登录" :disabled="home.busy" @click="home.logout()">
          <span class="workspace-home-icon"><ArrowLeft aria-hidden="true" /></span>
          <span class="workspace-home-label" aria-hidden="true">退出登录</span>
        </button>
        <div class="workspace-home-identity">
          <span class="workspace-home-avatar" aria-hidden="true">{{ initial }}</span>
          <span class="workspace-home-label">{{ home.userName }}</span>
        </div>
      </div>
    </aside>

    <div ref="content" class="workspace-home-content">
      <slot />
      <section id="workspace-home-overview" class="workspace-home-overview" aria-label="工作台主界面"
        :hidden="!currentGroup">
        <WorkbenchToolTabs v-for="group in groups" :key="group.id" :group="group.id" :label="group.label"
          :visible="currentGroup?.id === group.id" :home="home" :navigation-disabled="navigatingDisabled" />
      </section>
    </div>
  </div>
</template>
