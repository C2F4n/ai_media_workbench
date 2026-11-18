<script setup lang="ts">
import type { WorkbenchHome } from '../types';
import EditorPanel from './EditorPanel.vue';
import ExportPanel from './ExportPanel.vue';
import HistoryScreen from './HistoryScreen.vue';
import ImportPanel from './ImportPanel.vue';
import MediaLibrarySection from './MediaLibrarySection.vue';
import TaskHistorySection from './TaskHistorySection.vue';

defineProps<{ home: WorkbenchHome }>();
</script>

<template>
  <Teleport :to="`#workspace-tool-surface-${home.tool}`" defer>
    <div id="workbench-panel" class="workspace-embedded">
      <div id="workbench-layout" class="workbench-layout">
        <div id="tool-content" class="tool-content">
          <div id="workspace-toolbar" class="workspace-toolbar">
            <div id="workspace-phases" class="workspace-phases" role="tablist" aria-label="处理流程"></div>
            <span id="workspace-file-state" class="workspace-file-state">未选择素材</span>
          </div>
          <details id="tool-dependencies" class="tool-dependencies" aria-label="处理方式与API依赖">
            <summary>
              <i data-lucide="network" aria-hidden="true"></i>
              <span id="dependency-kind" class="dependency-kind">服务端处理</span>
              <span id="dependency-summary" class="dependency-summary">站点处理环境</span>
              <i data-lucide="chevron-down" class="disclosure-chevron" aria-hidden="true"></i>
            </summary>
            <div class="dependency-heading">
              <strong id="dependency-title">视频检测</strong>
              <button id="dependency-settings" class="button secondary compact" type="button" hidden>
                <i data-lucide="settings-2" aria-hidden="true"></i>AI 配置
              </button>
            </div>
            <dl id="dependency-services" class="dependency-services"></dl>
            <p id="dependency-detail" class="dependency-detail"></p>
          </details>
          <div id="tool-stage" class="tool-stage">
            <ImportPanel :home="home" />
            <EditorPanel />
            <ExportPanel />
            <HistoryScreen />
            <MediaLibrarySection />
            <TaskHistorySection />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
