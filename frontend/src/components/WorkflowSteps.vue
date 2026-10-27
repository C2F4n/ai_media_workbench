<script setup lang="ts">
import { ArrowDown, ArrowUp, Plus, Trash2, X } from '@lucide/vue';
import NumberField from './NumberField.vue';
import type { WorkflowStep } from '../types';
export type EditStep = Exclude<WorkflowStep, { operation: 'export' }>;
const props = defineProps<{ steps: EditStep[]; disabled: boolean; duration: number; revision: number; defaultStep: (operation: string) => EditStep }>();
const emit = defineEmits<{ change: [] }>();
function move(index: number, direction: number) {
  [props.steps[index], props.steps[index + direction]] = [props.steps[index + direction], props.steps[index]]; emit('change');
}
function operation(index: number, event: Event) { props.steps[index] = props.defaultStep((event.target as HTMLSelectElement).value); emit('change'); }
</script>
<template>
  <li v-for="(step, index) in steps" :key="index" class="workflow-step">
    <div class="workflow-step-head"><span>{{ index + 1 }}</span>
      <select :value="step.operation" :aria-label="`步骤 ${index + 1} 操作`" :disabled="disabled" @change="operation(index, $event)"><option value="trim">保留区间</option><option value="join_clips">选段拼接</option><option value="resize">缩放</option><option value="mute">静音</option></select>
      <button class="icon-button" type="button" :title="`上移步骤 ${index + 1}`" :aria-label="`上移步骤 ${index + 1}`" :disabled="disabled || index === 0" @click="move(index, -1)"><ArrowUp aria-hidden="true" /></button>
      <button class="icon-button" type="button" :title="`下移步骤 ${index + 1}`" :aria-label="`下移步骤 ${index + 1}`" :disabled="disabled || index === steps.length - 1" @click="move(index, 1)"><ArrowDown aria-hidden="true" /></button>
      <button class="icon-button" type="button" :title="`删除步骤 ${index + 1}`" :aria-label="`删除步骤 ${index + 1}`" :disabled="disabled" @click="steps.splice(index, 1); emit('change')"><Trash2 aria-hidden="true" /></button>
    </div>
    <div v-if="step.operation === 'trim'" class="conversion-fields">
      <NumberField label="开始（上一步结果，秒）" :model-value="step.startMs / 1000" :disabled="disabled" @update:model-value="step.startMs = Math.round($event * 1000); emit('change')" />
      <NumberField label="结束（秒）" :model-value="step.endMs / 1000" :disabled="disabled" @update:model-value="step.endMs = Math.round($event * 1000); emit('change')" />
    </div>
    <template v-else-if="step.operation === 'resize'">
      <label class="field">分辨率<select v-model="step.resolutionPreset" :disabled="disabled" @change="step.width = step.resolutionPreset === 'custom' ? 1920 : null; step.height = step.resolutionPreset === 'custom' ? 1080 : null; emit('change')"><option v-for="value in ['source', '360p', '480p', '720p', '1080p', '1440p', '2160p', 'custom']" :key="value" :value="value">{{ value === 'source' ? '当前分辨率' : value === 'custom' ? '自定义' : value }}</option></select></label>
      <div v-if="step.resolutionPreset === 'custom'" class="conversion-fields"><NumberField v-model="step.width" label="最大宽度" :min="2" step="1" :disabled="disabled" @update:model-value="emit('change')" /><NumberField v-model="step.height" label="最大高度" :min="2" step="1" :disabled="disabled" @update:model-value="emit('change')" /></div>
    </template>
    <template v-else-if="step.operation === 'join_clips'">
      <div v-for="(clip, clipIndex) in step.clips" :key="clipIndex" class="workflow-range">
        <NumberField :label="`片段 ${clipIndex + 1} 开始（秒）`" :model-value="clip.startMs / 1000" :disabled="disabled" @update:model-value="clip.startMs = Math.round($event * 1000); emit('change')" />
        <NumberField label="结束（秒）" :model-value="clip.endMs / 1000" :disabled="disabled" @update:model-value="clip.endMs = Math.round($event * 1000); emit('change')" />
        <button class="icon-button" type="button" :title="`删除步骤 ${index + 1} 的片段 ${clipIndex + 1}`" :aria-label="`删除步骤 ${index + 1} 的片段 ${clipIndex + 1}`" :disabled="disabled || step.clips.length === 1" @click="step.clips.splice(clipIndex, 1); emit('change')"><X aria-hidden="true" /></button>
      </div>
      <button class="icon-button" type="button" :title="`步骤 ${index + 1} 添加区间`" :aria-label="`步骤 ${index + 1} 添加区间`" :disabled="disabled || step.clips.length >= 20" @click="step.clips.push({ startMs: 0, endMs: Math.min(5000, duration || 5000) }); emit('change')"><Plus aria-hidden="true" /></button>
    </template>
  </li>
</template>
