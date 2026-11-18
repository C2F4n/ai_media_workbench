<script setup lang="ts">
import type { WorkbenchHome } from '../types';

defineProps<{ home: WorkbenchHome | null }>();
</script>

<template>
<section id="phase-import" class="phase-panel" :role="home?.tool === 'detect' ? undefined : 'tabpanel'"
  :aria-labelledby="home?.tool === 'detect' ? undefined : 'phase-import-tab'">
        <div class="phase-heading" :hidden="home?.tool === 'detect'">
          <h2>{{ home ? '选择素材' : '导入视频' }}</h2>
          <div class="phase-export-actions">
            <button v-if="home" class="button secondary compact" type="button" :disabled="home.busy"
              @click="home.openTool('detect')"><i data-lucide="upload" aria-hidden="true"></i>上传新视频</button>
            <button id="continue-editing" class="button secondary compact" type="button" disabled><span>继续编辑</span><i data-lucide="arrow-right" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="processing-layout" :hidden="!!home">
          <section class="upload-section" aria-labelledby="upload-title">
            <div class="studio-card-heading"><span class="studio-card-icon" aria-hidden="true"><i data-lucide="folder-up"></i></span><h2 id="upload-title">上传视频</h2></div>
            <form id="upload-form">
              <label class="file-picker" for="media-file"><i data-lucide="upload-cloud" aria-hidden="true"></i><span>选择视频</span><small>MP4 · MOV · MKV · WebM</small><input id="media-file" type="file" name="file" accept=".mp4,.mov,.mkv,.webm" required></label>
              <div class="file-selection"><span id="selected-filename">未选择文件</span><span id="selected-size"></span></div>
              <video id="selected-preview" controls preload="metadata" hidden></video>
              <p id="upload-error" class="form-error" role="alert" hidden></p>
              <div class="upload-actions"><button id="upload-submit" class="button primary" type="submit" disabled><i data-lucide="upload" aria-hidden="true"></i>上传并检测</button><span id="upload-state" class="muted" role="status"></span></div>
            </form>
          </section>
          <section class="result-section" aria-labelledby="media-result-title">
            <div class="section-heading"><h2 id="media-result-title">检测结果</h2><span id="media-status" class="media-status" hidden></span></div>
            <div id="media-result-empty" class="empty-state studio-empty"><span class="studio-empty-art" aria-hidden="true"><i data-lucide="scan-line"></i></span><strong>暂无检测结果</strong><p>上传后，视频的分辨率、时长与编码信息将在这里展示。</p></div>
            <div id="media-result" hidden aria-live="polite"><p id="media-result-name" class="result-filename"></p><dl id="media-metadata" class="metadata-list"></dl><video id="source-preview" controls preload="metadata" aria-label="原视频预览" hidden></video><p id="source-preview-status" class="muted" role="status" hidden></p><button id="retry-source-preview" class="icon-button" type="button" title="重新加载原视频" aria-label="重新加载原视频" hidden><i data-lucide="rotate-cw" aria-hidden="true"></i></button><p id="media-error" class="form-error" hidden></p><button id="retry-probe" class="button secondary compact" type="button" hidden><i data-lucide="rotate-cw" aria-hidden="true"></i>重新检测</button></div>
          </section>
        </div>
        <div id="import-library-slot"></div>
        </section>
</template>
