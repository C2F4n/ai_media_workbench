<script setup lang="ts">
import { RotateCcw, Trash2 } from '@lucide/vue';
import RecordDetails from './RecordDetails.vue';
import type { Plan as OperationPlan } from '../runtime/types';
defineProps<{ items: OperationPlan[]; busy: boolean; expanded: Set<string>; operation: (value: string) => string }>();
const emit = defineEmits<{ restore: [plan: OperationPlan]; remove: [plan: OperationPlan] }>();
</script>
<template>
  <li v-for="plan in items" :key="plan.id" class="history-row">
    <RecordDetails :record-key="`plan:${plan.id}`" :title="plan.summary || '未完成方案'" :parameters="plan.parameters" :instruction="plan.instruction" :expanded="expanded" :operation="operation">
      <template #subtitle><br><small>{{ plan.status === 'EXECUTED' ? '已执行' : plan.status === 'READY' ? '待执行' : '待完善' }} · v{{ plan.version }} · {{ plan.id.slice(0, 8) }} · {{ new Date(plan.createdAt).toLocaleString('zh-CN') }}</small></template>
    </RecordDetails>
    <button class="icon-button" type="button" data-record-action="true" :data-active="plan.parameters?.operation === 'burn_subtitles' ? 'true' : undefined" :disabled="busy || plan.parameters?.operation === 'burn_subtitles'" :title="plan.parameters?.operation === 'burn_subtitles' ? '字幕烧录方案请在字幕处理中重新确认字幕版本' : '恢复这个方案'" aria-label="恢复这个方案" @click="emit('restore', plan)"><RotateCcw aria-hidden="true" /></button>
    <button class="icon-button" type="button" data-record-action="true" title="删除保存的方案" aria-label="删除保存的方案" :disabled="busy" @click="emit('remove', plan)"><Trash2 aria-hidden="true" /></button>
  </li>
</template>
