<script setup lang="ts">
import { Download, FolderInput, SlidersHorizontal } from '@lucide/vue';
import { phases } from '../workbench/catalog';
import type { NavigationState, PhaseId } from '../workbench/catalog';
const props = defineProps<{ state: NavigationState }>();
const emit = defineEmits<{ select: [phase: PhaseId] }>();
const labels = { import: '导入', edit: '编辑', export: '导出' };
const icons = { import: FolderInput, edit: SlidersHorizontal, export: Download };
function keydown(event: KeyboardEvent) {
  if (props.state.busy || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = phases.indexOf(props.state.phase);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
  emit('select', phases[next]); document.getElementById(`phase-${phases[next]}-tab`)?.focus();
}
</script>

<template>
  <span class="phase-indicator" aria-hidden="true"></span>
  <button v-for="phase in phases" :id="`phase-${phase}-tab`" :key="phase" role="tab" type="button" :aria-selected="state.phase === phase" :aria-controls="`phase-${phase}`" :tabindex="state.phase === phase ? 0 : -1" :disabled="state.busy" @click="emit('select', phase)" @keydown="keydown"><component :is="icons[phase]" aria-hidden="true" /><span>{{ labels[phase] }}</span></button>
</template>
