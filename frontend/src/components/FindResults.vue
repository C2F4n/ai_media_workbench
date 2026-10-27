<script setup lang="ts">
import { computed } from 'vue';
import { Play, Scissors, ListPlus } from '@lucide/vue';
import type { ClipAction, ClipResult, FindState } from '../types';
const props = defineProps<FindState>();
const emit = defineEmits<{ action: [action: ClipAction, item: ClipResult] }>();
const items = computed(() => (props.recommend ? props.result?.clips : props.result?.matches) ?? []);
const time = (ms: number) => `${(ms / 1000).toFixed(3)} 秒`;
</script>

<template>
  <p v-if="result?.retrieval" id="find-retrieval" class="retrieval-state" role="status">
    <span>{{ result.retrieval.method === 'BM25_COVERAGE' ? '均匀抽样候选' : 'BM25 召回' }}</span>
    <span>候选字幕 {{ result.retrieval.retrievedSegments }} / {{ result.retrieval.totalSegments }} 段</span>
  </p>
  <ol id="find-results" class="find-results">
    <li v-for="(item, index) in items" :key="`${result?.transcriptId}:${result?.transcriptVersion}:${index}`" class="find-result">
      <div class="find-result-heading">
        <h3>{{ recommend ? item.title : `片段 ${index + 1}` }}</h3>
        <div class="find-result-actions">
          <button type="button" class="icon-button" :title="previewAvailable ? '预览片段' : '当前原视频不支持直接预览'" :aria-label="`预览片段 ${index + 1}`" :disabled="busy || !previewAvailable" @click="emit('action', 'preview', item)"><Play aria-hidden="true" /></button>
          <button type="button" class="icon-button" title="带入裁切" :aria-label="`裁切片段 ${index + 1}`" :disabled="busy || !canTrim || item.endMs - item.startMs < 500" @click="emit('action', 'trim', item)"><Scissors aria-hidden="true" /></button>
          <button type="button" class="icon-button" title="加入拼接" :aria-label="`加入拼接 ${index + 1}`" :disabled="busy || !canJoin || item.endMs - item.startMs < 500" @click="emit('action', 'join', item)"><ListPlus aria-hidden="true" /></button>
        </div>
      </div>
      <p class="muted">{{ time(item.startMs) }} 至 {{ time(item.endMs) }}</p>
      <p v-if="recommend">{{ item.reason }}</p>
      <details :open="index === 0">
        <summary>原文 · {{ item.evidence.length }} 段</summary>
        <blockquote>{{ item.evidence.map(entry => entry.text).join('\n') }}</blockquote>
        <div class="evidence-links">
          <button v-for="entry in item.evidence" :key="entry.segmentId" type="button" class="button secondary compact" :title="`预览原文 ${time(entry.startMs)}`" :disabled="busy || !previewAvailable" @click="emit('action', 'preview', { ...item, startMs: entry.startMs, endMs: entry.endMs })"><Play aria-hidden="true" />{{ time(entry.startMs) }}</button>
        </div>
      </details>
    </li>
  </ol>
</template>
