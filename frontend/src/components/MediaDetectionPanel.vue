<script setup lang="ts">
import { ArrowUpRight, CircleAlert, FileVideo, LoaderCircle, RotateCcw, ScanLine, Upload } from '@lucide/vue';
import { computed, ref, watch } from 'vue';

import { mediaMetadataRows } from '../media-metadata';
import { sizeText } from '../plan-format';
import type { MediaDetection } from '../workbench/media-detection';

const props = defineProps<{ detection: MediaDetection; active: boolean; disabled: boolean }>();
const state = computed(() => props.detection.state);
const stageFile = (file: File) => props.detection.stageFile(file);
const upload = () => props.detection.upload();
const retry = () => props.detection.retry();
const refresh = () => props.detection.refresh();
const fileInput = ref<HTMLInputElement>();
const dragging = ref(false);
const previewError = ref(false);
const selected = computed(() => state.value.file ?? state.value.item);
const metadata = computed(() => state.value.item?.metadata);
const previewUrl = computed(() => state.value.item?.status === 'READY' ? state.value.item.previewUrl : null);
const processing = computed(() => state.value.item?.status === 'PROBING');
const canChoose = computed(() => !props.disabled && state.value.limits?.mediaTool === true && state.value.pending !== 'upload');
const canSubmit = computed(() => canChoose.value && !state.value.pending);
const status = computed(() => {
  if (state.value.pending === 'upload') return '上传中';
  if (state.value.detectionError) return '需检查';
  if (processing.value) return '检测中';
  if (state.value.item?.status === 'READY') return '已完成';
  if (state.value.item?.status === 'FAILED') return '检测失败';
  return '等待导入';
});
const resolution = computed(() => metadata.value?.width && metadata.value.height
  ? `${metadata.value.width} × ${metadata.value.height}` : '—');
const details = computed(() => mediaMetadataRows(metadata.value, state.value.item?.sizeBytes)
  .filter(([label]) => label !== '分辨率'));

watch([previewUrl, () => props.active], () => {
  previewError.value = false;
  dragging.value = false;
});

function pick(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (file && canChoose.value) stageFile(file);
  input.value = '';
}

function dragOver(event: DragEvent) {
  if (!event.dataTransfer?.types.includes('Files')) return;
  event.dataTransfer.dropEffect = canChoose.value ? 'copy' : 'none';
  dragging.value = canChoose.value;
}

function dragLeave(event: DragEvent) {
  const stage = event.currentTarget as HTMLElement;
  if (event.relatedTarget instanceof Node && stage.contains(event.relatedTarget)) return;
  dragging.value = false;
}

function drop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file && canChoose.value) stageFile(file);
}
</script>

<template>
  <div class="media-detect">
    <div class="media-detect-grid">
      <section class="media-detect-preview" aria-labelledby="media-detect-preview-title">
        <header class="media-detect-preview-header">
          <h2 id="media-detect-preview-title">素材预览</h2>
          <span class="media-detect-service">站点处理 · 无需第三方 API</span>
        </header>
        <div class="media-detect-stage" :data-dragging="dragging" @dragover.prevent="dragOver"
          @dragleave="dragLeave" @drop.prevent="drop">
          <video v-if="active && previewUrl && !previewError" :src="previewUrl" controls playsinline
            preload="metadata" aria-label="原视频预览" @error="previewError = true"></video>
          <div v-else class="media-detect-empty">
            <div class="media-detect-frame" aria-hidden="true">
              <LoaderCircle v-if="state.pending === 'upload' || processing" class="media-detect-spinner" />
              <ScanLine v-else-if="state.item" />
              <Upload v-else />
            </div>
            <strong v-if="state.pending === 'upload'">正在上传视频</strong>
            <strong v-else-if="processing">{{ state.detectionError ? '等待刷新检测状态' : '正在检测视频' }}</strong>
            <strong v-else-if="previewError">原视频暂时无法播放</strong>
            <strong v-else-if="state.item?.status === 'READY'">当前格式无法直接预览</strong>
            <strong v-else-if="state.item?.status === 'FAILED'">素材检测失败</strong>
            <strong v-else-if="state.file">视频已选好</strong>
            <strong v-else>{{ dragging ? '松开以选择视频' : '拖入一个视频' }}</strong>
            <button v-if="!state.item && !state.file" class="media-detect-pick" type="button"
              :disabled="!canChoose" @click="fileInput?.click()">选择视频 <ArrowUpRight aria-hidden="true" /></button>
            <button v-if="previewError && previewUrl" class="media-detect-pick" type="button"
              @click="previewError = false">重新加载预览</button>
          </div>
        </div>
        <input ref="fileInput" type="file" hidden accept=".mp4,.mov,.mkv,.webm" @change="pick">

        <div class="media-detect-file-bar">
          <div class="media-detect-file">
            <span class="media-detect-file-icon"><FileVideo aria-hidden="true" /></span>
            <div v-if="state.file" class="media-detect-file-text">
              <strong :title="state.file.name">{{ state.file.name }}</strong>
              <small>{{ sizeText(state.file.size) }} · {{ state.pending === 'upload' ? '上传中' : '待上传' }}</small>
            </div>
            <div v-else-if="state.item" class="media-detect-file-text">
              <strong :title="state.item.originalFilename">{{ state.item.originalFilename }}</strong>
              <small>{{ sizeText(state.item.sizeBytes) }}</small>
            </div>
            <div v-else class="media-detect-file-text">
              <strong>MP4 / MOV / MKV / WebM</strong>
              <small v-if="state.limits?.maxUploadBytes">单个文件最大 {{ sizeText(state.limits.maxUploadBytes) }}</small>
            </div>
          </div>
          <div v-if="selected" class="media-detect-actions">
            <button type="button" class="media-detect-secondary" :disabled="!canChoose"
              @click="fileInput?.click()">更换视频</button>
            <button v-if="state.file" type="button" class="media-detect-primary" :disabled="!canSubmit"
              @click="upload">{{ state.pending === 'upload' ? '上传中…' : '上传并检测' }}</button>
          </div>
        </div>
        <p v-if="state.uploadError" class="media-detect-message" role="alert"><CircleAlert aria-hidden="true" />{{ state.uploadError }}</p>
        <p v-else-if="state.limits && !state.limits.mediaTool" class="media-detect-message" role="status">
          <CircleAlert aria-hidden="true" /> 视频检测工具暂不可用。
        </p>
      </section>

      <section class="media-detect-inspector" aria-labelledby="media-detect-inspector-title">
        <div class="media-detect-inspector-header">
          <h2 id="media-detect-inspector-title">检测结果</h2>
          <span class="media-detect-status" role="status" :data-status="state.item?.status"
            :data-busy="state.pending === 'upload' || processing" :data-error="!!state.detectionError">{{ status }}</span>
        </div>
        <dl class="media-detect-specs">
          <div class="media-detect-resolution">
            <dt>分辨率</dt>
            <dd>{{ resolution }}<small v-if="resolution !== '—'">px</small></dd>
          </div>
          <div v-for="[label, value] in details" :key="label" class="media-detect-spec">
            <dt>{{ label }}</dt><dd>{{ value }}</dd>
          </div>
        </dl>
        <p v-if="state.detectionError || state.item?.error" class="media-detect-message" role="alert">
          <CircleAlert aria-hidden="true" />{{ state.detectionError || state.item?.error?.message }}
        </p>
        <button v-if="state.item?.status === 'FAILED'" type="button" class="media-detect-secondary"
          :disabled="!canSubmit" @click="retry"><RotateCcw aria-hidden="true" />重新检测</button>
        <button v-else-if="processing && state.detectionError" type="button" class="media-detect-secondary"
          :disabled="disabled || !!state.pending" @click="refresh"><RotateCcw aria-hidden="true" />刷新检测状态</button>
      </section>
      <div id="detect-library-slot" class="media-detect-library"></div>
    </div>
  </div>
</template>
