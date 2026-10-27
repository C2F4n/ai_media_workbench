<script setup lang="ts">
import { ArrowUpRight, ChevronDown, FileAudio, FileVideo, Trash2 } from '@lucide/vue';
import RecordDetails from './RecordDetails.vue';
import type { Task } from '../runtime/types';
const props = defineProps<{ items: Task[]; busy: boolean; expanded: Set<string>; instructions: Map<string, string>; size: (bytes: number) => string; operation: (value: string) => string; status: (status: string, operation?: string) => string; format: (parameters: Task['parameters']) => string }>();
const emit = defineEmits<{ open: [task: Task]; remove: [task: Task]; inspect: [task: Task] }>();
function active(task: Task) { return ['QUEUED', 'RUNNING', 'CANCELLING'].includes(task.status); }
function title(task: Task) { return task.kind === 'TRANSCRIPTION' ? '语音转字幕' : `${props.operation(task.parameters?.operation ?? '')} ${props.format(task.parameters)}`; }
function status(task: Task) { return props.status(task.status, task.kind === 'TRANSCRIPTION' ? 'transcribe' : task.parameters?.operation); }
function time(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function audio(task: Task) { return task.parameters?.operation === 'extract_audio' || task.parameters?.operation === 'export' && !task.parameters.videoCodec; }
</script>
<template>
  <li v-for="task in items" :key="task.id" class="history-row">
    <RecordDetails :record-key="`task:${task.id}`" :title="`${title(task)} · ${status(task)}`" :parameters="task.parameters" :error="task.error?.message" :expanded="expanded" :operation="operation" @expand="open => open && emit('inspect', task)">
      <template #summary><component :is="audio(task) ? FileAudio : FileVideo" aria-hidden="true" /><span class="file-name"><span>{{ title(task) }}</span><small>{{ task.id.slice(0, 8) }} · {{ time(task.createdAt) }}</small></span><span class="file-size">{{ task.outputs[0] ? size(task.outputs[0].sizeBytes) : '' }}</span><span class="media-status" :class="{ ready: task.status === 'SUCCEEDED', failed: task.status === 'FAILED' }">{{ status(task) }}</span><ChevronDown class="disclosure-chevron" aria-hidden="true" /></template>
      <p class="record-instruction">{{ instructions.get(`${task.planId}:${task.planVersion}`) ?? '' }}</p>
    </RecordDetails>
    <button class="icon-button" type="button" data-record-action="open" title="打开处理结果" aria-label="打开处理结果" :disabled="busy" @click="emit('open', task)"><ArrowUpRight aria-hidden="true" /></button>
    <button class="icon-button" type="button" data-record-action="true" :data-active="String(active(task))" :title="active(task) ? '任务结束后可删除记录' : '删除处理记录'" aria-label="删除处理记录" :disabled="busy || active(task)" @click="emit('remove', task)"><Trash2 aria-hidden="true" /></button>
  </li>
</template>
