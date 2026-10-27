<script setup lang="ts">
import TaskHistorySection from './TaskHistorySection.vue';
import MediaLibrarySection from './MediaLibrarySection.vue';
import HistoryScreen from './HistoryScreen.vue';
import ExportPanel from './ExportPanel.vue';
import EditorPanel from './EditorPanel.vue';
import ImportPanel from './ImportPanel.vue';
</script>

<template>
<div id="workbench-panel">
        <div id="workbench-layout" class="workbench-layout" data-nav-open="true" data-nav-pinned="true">
        <aside id="tool-sidebar" class="tool-sidebar" aria-label="功能栏"></aside>
        <button id="sidebar-backdrop" class="sidebar-backdrop" type="button" tabindex="-1" aria-label="关闭功能栏" hidden></button>
        <div id="tool-content" class="tool-content">
        <div class="workbench-heading"><div class="workspace-title"><button id="toggle-sidebar" class="icon-button" type="button" title="收起功能栏" aria-label="收起功能栏" aria-controls="tool-sidebar" aria-expanded="true"><i data-lucide="panel-left" aria-hidden="true"></i></button><div><p class="eyebrow">媒体工作台</p><h1 id="workspace-tool-title">视频检测</h1></div></div><span id="workspace-user" class="muted"></span></div>
        <div id="workspace-toolbar" class="workspace-toolbar">
          <div id="workspace-phases" class="workspace-phases" role="tablist" aria-label="处理流程"></div>
          <span id="workspace-file-state" class="workspace-file-state">未选择素材</span>
        </div>
        <details id="tool-dependencies" class="tool-dependencies" aria-label="处理方式与API依赖">
          <summary><i data-lucide="network" aria-hidden="true"></i><span id="dependency-kind" class="dependency-kind">服务端处理</span><span id="dependency-summary" class="dependency-summary">站点处理环境</span><i data-lucide="chevron-down" class="disclosure-chevron" aria-hidden="true"></i></summary>
          <div class="dependency-heading"><strong id="dependency-title">视频检测</strong><button id="dependency-settings" class="button secondary compact" type="button" hidden><i data-lucide="settings-2" aria-hidden="true"></i>AI 配置</button></div>
          <dl id="dependency-services" class="dependency-services"></dl><p id="dependency-detail" class="dependency-detail"></p>
        </details>
        <div id="tool-stage" class="tool-stage">
        <ImportPanel />
        <EditorPanel />
        <ExportPanel />
        <HistoryScreen />
        <MediaLibrarySection />
        <TaskHistorySection />
      </div>
        </div>
        </div>
        </div>
</template>
