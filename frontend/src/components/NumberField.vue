<script setup lang="ts">
defineProps<{ label: string; modelValue: number | null | undefined; min?: number; step?: string; disabled: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();
</script>
<template><label class="field">{{ label }}<input type="number" :min="min ?? 0" :step="step ?? '0.001'" :aria-label="label" :value="modelValue != null && Number.isFinite(modelValue) ? modelValue : ''" :disabled="disabled" required @input="emit('update:modelValue', ($event.target as HTMLInputElement).value === '' ? NaN : Number(($event.target as HTMLInputElement).value))"></label></template>
