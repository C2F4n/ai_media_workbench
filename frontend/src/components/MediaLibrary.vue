<script setup lang="ts">
import { FileVideo, Trash2 } from '@lucide/vue';
import type { Media } from '../api/contracts';
defineProps<{ items: Media[]; busy: boolean; size: (bytes: number) => string; status: (value: string) => string }>();
const emit = defineEmits<{ open: [media: Media]; remove: [media: Media] }>();
</script>
<template>
  <li v-for="item in items" :key="item.id" class="media-row">
    <button type="button" :disabled="busy" @click="emit('open', item)"><FileVideo aria-hidden="true" /><span class="file-name">{{ item.originalFilename }}</span><span class="file-size">{{ size(item.sizeBytes) }}</span><span class="media-status" :class="{ ready: item.status === 'READY', failed: item.status === 'FAILED' }">{{ status(item.status) }}</span></button>
    <button type="button" class="icon-button media-remove" title="删除素材" :aria-label="`删除素材 ${item.originalFilename}`" :disabled="busy" @click="emit('remove', item)"><Trash2 aria-hidden="true" /></button>
  </li>
</template>
