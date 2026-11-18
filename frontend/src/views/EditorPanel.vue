<script setup lang="ts">
import AIEditor from './AIEditor.vue';
import FindEditor from './FindEditor.vue';
import JoinEditor from './JoinEditor.vue';
import ProcessingEditor from './ProcessingEditor.vue';
import SubtitleEditor from './SubtitleEditor.vue';
</script>

<template>
<section id="phase-edit" class="phase-panel" role="tabpanel" aria-labelledby="phase-edit-tab" hidden>
        <div class="editor-layout">
          <aside class="editor-inspector" aria-label="素材预览" tabindex="0">
            <h2 class="inspector-heading"><i data-lucide="monitor-play" aria-hidden="true"></i>素材预览</h2>
            <div id="editor-preview-slot" class="editor-preview-frame"><video id="source-preview" controls preload="metadata" aria-label="原视频预览" hidden></video><div id="editor-preview-empty" class="preview-empty"><i data-lucide="clapperboard" aria-hidden="true"></i><span>暂无可预览素材</span></div></div>
            <div id="editor-preview-messages"><p id="source-preview-status" class="muted" role="status" hidden></p><button id="retry-source-preview" class="icon-button" type="button" title="重新加载原视频" aria-label="重新加载原视频" hidden><i data-lucide="rotate-cw" aria-hidden="true"></i></button><p id="media-error" class="form-error" hidden></p></div>
            <div class="editor-source-bar"><i data-lucide="file-video" aria-hidden="true"></i><div><strong id="editor-filename">未选择素材</strong><span id="editor-file-info">等待导入</span></div><button id="replace-source" class="icon-button" type="button" title="更换素材" aria-label="更换素材"><i data-lucide="folder-open" aria-hidden="true"></i></button></div>
            <details id="editor-info-details" class="editor-info-details"><summary>素材信息<i data-lucide="chevron-down" aria-hidden="true"></i></summary><dl id="editor-metadata" class="metadata-list"></dl></details>
          </aside>
          <div class="editor-controls" role="region" aria-label="编辑设置" tabindex="0">
        <JoinEditor />
        <FindEditor />
        <AIEditor />
        <SubtitleEditor />
        <ProcessingEditor />
          </div>
        </div>
        </section>
</template>
