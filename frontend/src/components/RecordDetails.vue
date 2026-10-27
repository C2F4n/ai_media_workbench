<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown } from '@lucide/vue';
const props = defineProps<{ recordKey: string; title: string; parameters: object | null; instruction?: string | null; error?: string | null; expanded: Set<string>; operation: (value: string) => string }>();
const emit = defineEmits<{ expand: [open: boolean] }>();
const labels: Record<string, string> = { operation: '处理方式', outputFormat: '输出格式', videoCodec: '视频编码', resolutionPreset: '分辨率', width: '最大宽度', height: '最大高度', audioMode: '音轨', startMs: '开始（毫秒）', endMs: '结束（毫秒）', targetSizeBytes: '目标体积（字节）', extractAudio: '另存音轨', clips: '拼接区间', steps: '处理步骤', transcriptId: '字幕', transcriptVersion: '字幕版本', useOriginal: '保留原文' };
const values: Record<string, string> = { source: '原分辨率', keep: '保留音轨', mute: '静音' };
const rows = computed(() => Object.entries(props.parameters ?? {}).filter(([, value]) => value !== null).map(([key, value]) => [labels[key] ?? key,
  key === 'operation' ? props.operation(String(value)) : typeof value === 'boolean' ? value ? '是' : '否' : typeof value === 'object' ? JSON.stringify(value, null, 2) : values[String(value)] ?? String(value)]));
function toggled(event: Event) {
  const open = (event.currentTarget as HTMLDetailsElement).open;
  if (open) props.expanded.add(props.recordKey); else props.expanded.delete(props.recordKey);
  emit('expand', open);
}
</script>
<template>
  <details class="record-details" :open="expanded.has(recordKey)" @toggle="toggled">
    <summary><slot name="summary"><span class="record-title">{{ title }}<slot name="subtitle" /></span><ChevronDown class="disclosure-chevron" aria-hidden="true" /></slot></summary>
    <p v-if="instruction" class="record-instruction">{{ instruction }}</p>
    <dl class="record-parameters"><div v-for="[label, value] in rows" :key="label"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></dl>
    <p v-if="error" class="form-error">{{ error }}</p><slot />
  </details>
</template>
