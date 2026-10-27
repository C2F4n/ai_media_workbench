<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Check, WandSparkles } from '@lucide/vue';
import type { TranscriptSegment } from '../api/contracts';
const props = defineProps<{ segments: TranscriptSegment[]; revision: number; disabled: boolean; canCorrect: boolean; correctionTitle: string; duration: number; correct: (segmentId: string) => Promise<string | null> }>();
const emit = defineEmits<{ change: [] }>();
const suggestions = reactive<Record<string, string>>({});
watch(() => props.revision, () => { for (const key of Object.keys(suggestions)) delete suggestions[key]; });
async function correct(id: string) {
  const revision = props.revision;
  const text = await props.correct(id);
  if (revision === props.revision && text !== null) suggestions[id] = text;
}
</script>
<template>
  <li v-for="(segment, index) in segments" :key="segment.id" class="subtitle-segment" :data-segment-id="segment.id">
    <span>{{ index + 1 }}</span>
    <label>开始（秒）<input type="number" min="0" step="0.001" :max="duration / 1000" data-field="startMs" :aria-label="`第${index + 1}段开始（秒）`" :value="Number.isFinite(segment.startMs) ? segment.startMs / 1000 : ''" :disabled="disabled" @input="segment.startMs = ($event.target as HTMLInputElement).value === '' ? NaN : Math.round(Number(($event.target as HTMLInputElement).value) * 1000); emit('change')"></label>
    <label>结束（秒）<input type="number" min="0" step="0.001" :max="duration / 1000" data-field="endMs" :aria-label="`第${index + 1}段结束（秒）`" :value="Number.isFinite(segment.endMs) ? segment.endMs / 1000 : ''" :disabled="disabled" @input="segment.endMs = ($event.target as HTMLInputElement).value === '' ? NaN : Math.round(Number(($event.target as HTMLInputElement).value) * 1000); emit('change')"></label>
    <label>字幕<textarea v-model="segment.text" rows="2" maxlength="4000" data-field="text" :aria-label="`第${index + 1}段字幕`" :disabled="disabled" @input="emit('change')"></textarea></label>
    <button class="icon-button" type="button" :data-correct="segment.id" :title="correctionTitle" :aria-label="`校对第${index + 1}段`" :disabled="disabled || !canCorrect" @click="correct(segment.id)"><WandSparkles aria-hidden="true" /></button>
    <div v-if="suggestions[segment.id] != null" class="subtitle-suggestion"><p>{{ suggestions[segment.id] }}</p><button class="button secondary compact" type="button" :disabled="disabled" @click="segment.text = suggestions[segment.id]; delete suggestions[segment.id]; emit('change')"><Check aria-hidden="true" />采用建议</button></div>
  </li>
</template>
