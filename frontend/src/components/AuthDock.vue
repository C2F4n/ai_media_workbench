<script setup lang="ts">
import { House, LogIn, MousePointer2, UserPlus } from '@lucide/vue';
import { onUnmounted, shallowRef } from 'vue';

import type { AuthPanel } from '../auth/types';
import { dockTileTransform } from '../dock-motion';
import AuthKeyboard from './AuthKeyboard.vue';

const props = defineProps<{ active: AuthPanel }>();
const emit = defineEmits<{ select: [panel: AuthPanel] }>();
const items = [
  { id: 'home', label: '主界面', icon: House, controls: 'auth-phone-home-panel' },
  { id: 'login', label: '登录', icon: LogIn, controls: 'login-panel' },
  { id: 'register', label: '注册', icon: UserPlus, controls: 'register-panel' }
] as const;

type Position = { x: number; y: number };
const pointer = shallowRef<(Position & { centers: Position[]; label: string | null; atRightEdge: boolean }) | null>(null);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function clearPointer() { pointer.value = null; }
reducedMotion.addEventListener('change', clearPointer);
onUnmounted(() => reducedMotion.removeEventListener('change', clearPointer));

function move(event: PointerEvent) {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const dock = event.currentTarget;
  if (!(dock instanceof HTMLElement) || !(event.target instanceof Element)) return;
  const bounds = dock.getBoundingClientRect();
  const buttons = [...dock.querySelectorAll<HTMLElement>('.auth-dock-button')];
  const hoveredButton = event.target.closest<HTMLElement>('.auth-dock-button');
  const centers = buttons.map(button => {
    const rect = button.getBoundingClientRect();
    return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2 };
  });
  pointer.value = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    centers,
    label: hoveredButton?.getAttribute('aria-label') ?? null,
    atRightEdge: hoveredButton === buttons.at(-1),
  };
}

function tileStyle(index: number) {
  const point = pointer.value;
  const center = point?.centers[index];
  if (!point || !center) return {};
  return { transform: dockTileTransform(point.x - center.x, point.y - center.y) };
}

function openEntry() {
  if (props.active === 'home') emit('select', 'login');
}

function keydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  clearPointer();
  const index = items.findIndex(item => item.id === props.active);
  const offset = event.key === 'ArrowLeft' ? -1 : 1;
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + offset + items.length) % items.length;
  emit('select', items[next].id);
  document.getElementById(`${items[next].id}-tab`)?.focus();
}
</script>

<template>
  <div class="auth-dock" @pointermove="move" @pointerleave="clearPointer">
    <div class="auth-dock-tabs" role="tablist" aria-label="手机导航" @keydown="keydown">
      <button
        v-for="(item, index) in items"
        :id="`${item.id}-tab`"
        :key="item.id"
        class="auth-dock-button"
        type="button"
        role="tab"
        :aria-label="item.label"
        :aria-controls="item.controls"
        :aria-selected="active === item.id"
        :tabindex="active === item.id ? 0 : -1"
        @click="emit('select', item.id)"
      >
        <span class="auth-dock-tile" aria-hidden="true" :style="tileStyle(index)">
          <component :is="item.icon" />
        </span>
        <span class="auth-dock-tip" aria-hidden="true">{{ item.label }}</span>
      </button>
      <span v-if="active === 'home' && !pointer" class="auth-dock-login-note" aria-hidden="true">
        <svg viewBox="0 0 68 43" fill="none">
          <path d="M64 8C52 1 40 5 32 12s-6 15 0 15c4 0 4-8-3-9C18 16 8 28 3 39m-1-11 1 11 11-3" />
        </svg>
        <span>点击登录</span>
      </span>
    </div>
    <AuthKeyboard :tile-style="tileStyle(items.length)" @open-entry="openEntry" />
    <span
      v-if="pointer?.label"
      class="auth-dock-follower"
      :class="{ 'is-right': pointer.atRightEdge }"
      :style="{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }"
      aria-hidden="true"
    >
      <MousePointer2 />
      <span>{{ pointer.label }}</span>
    </span>
  </div>
</template>
