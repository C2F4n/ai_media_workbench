<script setup lang="ts">
import ProcessingEditor from './ProcessingEditor.vue';
import SubtitleEditor from './SubtitleEditor.vue';
import JoinEditor from './JoinEditor.vue';
import AIEditor from './AIEditor.vue';
import FindEditor from './FindEditor.vue';
</script>

<template>
<section id="phase-edit" class="phase-panel" role="tabpanel" aria-labelledby="phase-edit-tab" hidden>
        <div class="editor-source-bar"><i data-lucide="file-video" aria-hidden="true"></i><div><strong id="editor-filename">未选择素材</strong><span id="editor-file-info">等待导入</span></div><button id="replace-source" class="icon-button" type="button" title="更换素材" aria-label="更换素材"><i data-lucide="folder-open" aria-hidden="true"></i></button></div>
        <div class="editor-layout">
          <aside class="editor-inspector" aria-label="素材预览">
            <div id="editor-preview-slot" class="editor-preview-frame"><div id="editor-preview-empty" class="preview-empty"><i data-lucide="clapperboard" aria-hidden="true"></i><span>暂无可预览素材</span></div></div>
            <div id="editor-preview-messages"></div>
            <details id="editor-info-details" class="editor-info-details"><summary>素材信息<i data-lucide="chevron-down" aria-hidden="true"></i></summary><dl id="editor-metadata" class="metadata-list"></dl></details>
          </aside>
          <div class="editor-controls">
        <section id="detect-editor" class="detect-editor" aria-labelledby="detect-editor-title"><h2 id="detect-editor-title">处理素材</h2><div class="quick-tools"><button type="button" data-tool-target="convert"><i data-lucide="file-video" aria-hidden="true"></i><span>转换格式</span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button type="button" data-tool-target="trim"><i data-lucide="scissors" aria-hidden="true"></i><span>裁切片段</span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button type="button" data-tool-target="subtitle"><i data-lucide="captions" aria-hidden="true"></i><span>处理字幕</span><i data-lucide="chevron-right" aria-hidden="true"></i></button><button type="button" data-tool-target="ai"><i data-lucide="sparkles" aria-hidden="true"></i><span>AI 处理</span><i data-lucide="chevron-right" aria-hidden="true"></i></button></div></section>
        <JoinEditor />
        <FindEditor />
        <AIEditor />
        <SubtitleEditor />
        <ProcessingEditor />
          </div>
        </div>
        </section>
</template>
