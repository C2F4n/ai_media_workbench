<script setup lang="ts">
import { AudioLines, Captions, ChevronDown, FileVideo, HardDrive, History, ListVideo, Minimize2, PanelLeftClose, Pin, ScanLine, Scissors, Search, Sparkles, VolumeX } from '@lucide/vue';
import { groups, tools } from '../workbench/catalog';
import type { NavigationState, ToolGroup, ToolId } from '../workbench/catalog';
const props = defineProps<{ state: NavigationState }>();
const emit = defineEmits<{ select: [tool: ToolId]; group: [group: ToolGroup, expanded: boolean]; pin: []; close: [] }>();
const icons = { AudioLines, Captions, FileVideo, History, ListVideo, Minimize2, ScanLine, Scissors, Search, Sparkles, VolumeX };
function kind(tool: typeof tools[number]) { return props.state.localTextAI && ['ai', 'find'].includes(tool.id) ? 'local' : tool.kind; }
function title(tool: typeof tools[number]) {
  const service = ['ai', 'find'].includes(tool.id) && props.state.textService ? props.state.textService
    : tool.id === 'ai' ? '文字输入：所选模型 / 分步填写：站点处理'
      : { local: '站点处理，无需第三方 API', cloud: '所选文字模型 API', mixed: '语音识别 API / 所选文字模型' }[tool.kind];
  return `${tool.label} · ${service}`;
}
</script>

<template>
  <div class="sidebar-heading"><strong>处理功能</strong><div>
    <button id="pin-sidebar" class="icon-button" type="button" :title="state.pinned ? '取消固定功能栏' : '固定功能栏'" :aria-label="state.pinned ? '取消固定功能栏' : '固定功能栏'" :aria-pressed="state.pinned" :disabled="state.busy" @click="emit('pin')"><Pin aria-hidden="true" /></button>
    <button id="close-sidebar" class="icon-button" type="button" title="收起功能栏" aria-label="收起功能栏" :disabled="state.busy" @click="emit('close')"><PanelLeftClose aria-hidden="true" /></button>
  </div></div>
  <nav id="tool-navigation" class="tool-list" aria-label="处理功能">
    <span id="tool-indicator" class="tool-indicator" aria-hidden="true" :hidden="!state.indicator.visible" :style="{ transform: `translateY(${state.indicator.top}px)`, height: `${state.indicator.height}px` }"></span>
    <div v-for="group in groups" :key="group.id" class="tool-group" :data-tool-group="group.id" :data-collapsed="String(!state.groups[group.id])" :data-active="String(tools.some(tool => tool.id === state.tool && tool.group === group.id))">
      <button :id="`${group.id}-group-toggle`" class="tool-group-toggle" type="button" :aria-expanded="state.groups[group.id]" :aria-controls="`${group.id}-group-body`" :disabled="state.busy" @click="emit('group', group.id, !state.groups[group.id])">{{ group.label }}<ChevronDown aria-hidden="true" /></button>
      <div :id="`${group.id}-group-body`" class="tool-group-body" :inert="!state.groups[group.id]"><div class="tool-group-items" role="group" :aria-labelledby="`${group.id}-group-toggle`">
        <button v-for="tool in tools.filter(tool => tool.group === group.id)" :id="`${tool.id}-tool`" :key="tool.id" class="tool-choice" :class="{ active: tool.id === state.tool }" type="button" :aria-current="tool.id === state.tool ? 'page' : undefined" :aria-label="tool.label" :title="title(tool)" :disabled="state.busy" @click="emit('select', tool.id)">
          <component :is="icons[tool.icon]" aria-hidden="true" /><span class="tool-name">{{ tool.label }}</span><small class="tool-dependency" :data-kind="kind(tool)" aria-hidden="true">{{ { local: '站点', cloud: 'API', mixed: '混合' }[kind(tool)] }}</small>
        </button>
      </div></div>
    </div>
  </nav>
  <div class="sidebar-footer"><HardDrive aria-hidden="true" /><span>素材与结果归属当前账户</span></div>
</template>
