<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue';
import { ref, watch } from 'vue';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  id: string;
  label: string;
  kind?: string;
  error?: string;
  hint?: string;
  masked?: boolean;
}>(), { kind: 'text' });
const value = defineModel<string>({ required: true });
const revealed = ref(false);
const input = ref<HTMLInputElement>();

watch(() => props.masked, masked => { if (masked) revealed.value = false; });

function togglePassword() {
  const field = input.value;
  const selection = field && [field.selectionStart, field.selectionEnd] as const;
  revealed.value = !revealed.value;
  if (!field || !selection) return;
  field.type = revealed.value ? 'text' : 'password';
  field.setSelectionRange(selection[0], selection[1]);
}
</script>

<template>
  <div class="auth-entry-field">
    <label :for="id">{{ label }}</label>
    <div class="auth-entry-input-wrap">
      <input ref="input" v-model="value" :id="id" class="auth-entry-input"
        v-bind="$attrs" :type="kind === 'password' && revealed ? 'text' : kind"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? id + '-error' : hint ? id + '-hint' : undefined">
      <button v-if="kind === 'password'" type="button" class="auth-entry-reveal"
        :aria-label="revealed ? '隐藏密码' : '显示密码'" :aria-pressed="revealed"
        @mousedown.prevent @click="togglePassword">
        <EyeOff v-if="revealed" aria-hidden="true" /><Eye v-else aria-hidden="true" />
      </button>
    </div>
    <span v-if="error" :id="id + '-error'" class="auth-entry-error">{{ error }}</span>
    <span v-else-if="hint" :id="id + '-hint'" class="auth-entry-hint">{{ hint }}</span>
  </div>
</template>
