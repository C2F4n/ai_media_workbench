<script setup lang="ts">
import type { WorkbenchHome } from '../types';
defineProps<{ home: WorkbenchHome }>();
</script>
<template>
  <section id="phase-import" class="phase-panel" role="tabpanel" aria-labelledby="phase-import-tab">
    <div class="phase-heading" :hidden="home.tool === 'detect'">
      <h2>选择素材</h2>
      <div class="phase-export-actions">
        <button class="button secondary compact" type="button" :disabled="home.busy" @click="home.openTool('detect')"><i data-lucide="upload" aria-hidden="true"></i>上传新视频</button>
        <button id="continue-editing" class="button secondary compact" type="button" disabled><span>继续编辑</span><i data-lucide="arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>
    <div id="import-library-slot"></div>
  </section>
</template>
