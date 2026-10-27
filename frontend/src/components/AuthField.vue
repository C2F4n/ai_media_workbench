<script setup lang="ts">
import { ref, watch } from 'vue';
import { Eye, EyeOff } from '@lucide/vue';
import type { AuthFieldId } from '../auth/types';

const props = defineProps<{
  id: AuthFieldId; name: string; label: string; modelValue: string; disabled: boolean; error?: string;
  type?: 'text' | 'email' | 'password'; autocomplete?: string; placeholder?: string; help?: string;
  pattern?: string; maxlength?: number; inputmode?: 'numeric'; optional?: boolean; toggle?: boolean; resetKey: number;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string]; changed: [id: AuthFieldId]; blurred: [id: AuthFieldId, event: FocusEvent];
}>();
const revealed = ref(false);
watch(() => props.resetKey, () => { revealed.value = false; });
function changed(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  emit('changed', props.id);
}
</script>

<template>
  <label class="field">{{ label }} <span v-if="optional" class="optional">选填</span>
    <span :class="toggle ? 'password-field' : 'auth-input-shell'">
      <input :id="id" :name="name" :value="modelValue" :type="revealed ? 'text' : type ?? 'text'" :disabled="disabled" :required="!optional"
        :autocomplete="autocomplete" :placeholder="placeholder" :pattern="pattern" :maxlength="maxlength" :inputmode="inputmode"
        :aria-label="label" :aria-invalid="error ? 'true' : undefined" :aria-describedby="[help, `${id}-error`].filter(Boolean).join(' ')"
        @input="changed" @blur="emit('blurred', id, $event)">
      <button v-if="toggle" class="icon-button password-toggle" type="button" :data-password-target="id" :disabled="disabled"
        :aria-label="revealed ? '隐藏密码' : '显示密码'" :title="revealed ? '隐藏密码' : '显示密码'" @click="revealed = !revealed">
        <component :is="revealed ? EyeOff : Eye" aria-hidden="true" />
      </button>
    </span>
    <span :id="`${id}-error`" class="field-error" :hidden="!error">{{ error }}</span>
  </label>
</template>
