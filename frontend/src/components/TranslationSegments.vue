<script setup lang="ts">
import type { TranscriptSegment } from '../api/contracts';
defineProps<{ source: TranscriptSegment[]; segments: TranscriptSegment[]; bilingual: boolean; disabled: boolean }>();
</script>
<template>
  <li v-for="(segment, index) in segments" :key="segment.id" class="translation-segment">
    <small class="translation-time muted">{{ index + 1 }} · {{ (segment.startMs / 1000).toFixed(3) }} - {{ (segment.endMs / 1000).toFixed(3) }} 秒</small>
    <p>{{ source[index].text }}</p><label class="field">译文<textarea v-model="segment.text" rows="3" maxlength="4000" :aria-label="`第${index + 1}段译文`" :disabled="disabled"></textarea></label>
    <output :aria-label="`第${index + 1}段字幕预览`">{{ (bilingual ? source[index].text + '\n' : '') + segment.text.replace(/\r\n?/g, '\n').trim() }}</output>
  </li>
</template>
