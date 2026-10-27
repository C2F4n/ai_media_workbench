<template>
<section id="phase-import" class="phase-panel" role="tabpanel" aria-labelledby="phase-import-tab">
        <div class="phase-heading"><div><p class="eyebrow">素材</p><h2>导入视频</h2></div><button id="continue-editing" class="button secondary compact" type="button" disabled><span>继续编辑</span><i data-lucide="arrow-right" aria-hidden="true"></i></button></div>
        <div class="processing-layout">
          <section class="upload-section" aria-labelledby="upload-title">
            <h2 id="upload-title">上传视频</h2>
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
            <p id="media-result-empty" class="empty-state">暂无检测结果</p>
            <div id="media-result" hidden aria-live="polite"><p id="media-result-name" class="result-filename"></p><dl id="media-metadata" class="metadata-list"></dl><video id="source-preview" controls preload="metadata" aria-label="原视频预览" hidden></video><p id="source-preview-status" class="muted" role="status" hidden></p><button id="retry-source-preview" class="icon-button" type="button" title="重新加载原视频" aria-label="重新加载原视频" hidden><i data-lucide="rotate-cw" aria-hidden="true"></i></button><p id="media-error" class="form-error" hidden></p><button id="retry-probe" class="button secondary compact" type="button" hidden><i data-lucide="rotate-cw" aria-hidden="true"></i>重新检测</button></div>
          </section>
        </div>
        <div id="import-library-slot"></div>
        </section>
</template>
