<script setup lang="ts">
import { ArrowDown, ArrowUp, Copy, Play, Trash2 } from '@lucide/vue';
export interface JoinRow { start: string; end: string }
const props = defineProps<{ rows: JoinRow[]; disabled: boolean; preview: boolean; revision: number }>();
const emit = defineEmits<{ change: []; preview: [index: number] }>();
function move(index: number, direction: number) {
  [props.rows[index], props.rows[index + direction]] = [props.rows[index + direction], props.rows[index]]; emit('change');
}
</script>
<template>
  <li v-for="(row, index) in rows" :key="index" class="join-row">
    <span>{{ index + 1 }}</span>
    <label class="field">开始（秒）<input :value="row.start" type="number" min="0" step="0.001" required :aria-label="`片段${index + 1}开始时间`" :disabled="disabled" @input="row.start = ($event.target as HTMLInputElement).value; emit('change')"></label>
    <label class="field">结束（秒）<input :value="row.end" type="number" min="0" step="0.001" required :aria-label="`片段${index + 1}结束时间`" :disabled="disabled" @input="row.end = ($event.target as HTMLInputElement).value; emit('change')"></label>
    <div class="join-row-actions">
      <button class="icon-button" type="button" title="上移片段" :aria-label="`上移片段 ${index + 1}`" :disabled="disabled || index === 0" @click="move(index, -1)"><ArrowUp aria-hidden="true" /></button>
      <button class="icon-button" type="button" title="下移片段" :aria-label="`下移片段 ${index + 1}`" :disabled="disabled || index === rows.length - 1" @click="move(index, 1)"><ArrowDown aria-hidden="true" /></button>
      <button class="icon-button" type="button" title="复制片段" :aria-label="`复制片段 ${index + 1}`" :disabled="disabled || rows.length >= 20" @click="rows.splice(index + 1, 0, { ...row }); emit('change')"><Copy aria-hidden="true" /></button>
      <button class="icon-button" type="button" title="预览片段" :aria-label="`预览片段 ${index + 1}`" :disabled="disabled || !preview" @click="emit('preview', index)"><Play aria-hidden="true" /></button>
      <button class="icon-button" type="button" title="移除片段" :aria-label="`移除片段 ${index + 1}`" :disabled="disabled || rows.length <= 1" @click="rows.splice(index, 1); emit('change')"><Trash2 aria-hidden="true" /></button>
    </div>
  </li>
</template>
