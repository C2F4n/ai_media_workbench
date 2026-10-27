<script setup lang="ts">
import { computed } from 'vue';
import { planRows } from '../plan-format';
import type { PlanDetails } from '../types';
const props = defineProps<{ plan: PlanDetails | null }>();
const rows = computed(() => planRows(props.plan?.parameters ?? null));
</script>

<template>
  <dl id="ai-plan-parameters" class="metadata-list">
    <div v-for="[label, text] in rows" :key="label"><dt>{{ label }}</dt><dd>{{ text }}</dd></div>
  </dl>
  <ul id="ai-plan-questions" class="ai-questions"><li v-for="question in plan?.questions ?? []" :key="question.code">{{ question.message }}</li></ul>
</template>
