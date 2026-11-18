<script setup lang="ts">
import { ArrowBigUp, Delete, Keyboard, Volume2, VolumeX } from '@lucide/vue';
import { type CSSProperties,nextTick, onMounted, onUnmounted, ref } from 'vue';

import { createKeyboardSound } from '../auth/keyboard-sound';

defineProps<{ tileStyle: CSSProperties }>();
const emit = defineEmits<{ openEntry: [] }>();

type CharacterKey = { text: string; shifted: string; scan: number };
type ControlKey = {
  action: 'close' | 'delete' | 'tab' | 'caps' | 'enter' | 'shift' | 'space';
  label: string;
  scan: number;
  units?: number;
};
type Key = CharacterKey | ControlKey;

function characterKeys(keys: string[], firstScan: number): CharacterKey[] {
  return keys.map(([text, shifted], index) => ({ text, shifted: shifted ?? text.toUpperCase(), scan: firstScan + index }));
}

const escapeKey = { action: 'close', label: 'Esc', scan: 1 } as const;
const rows: Key[][] = [
  [
    { text: '`', shifted: '~', scan: 41 },
    ...characterKeys(['1!', '2@', '3#', '4$', '5%', '6^', '7&', '8*', '9(', '0)', '-_', '=+'], 2),
    { action: 'delete', label: '退格', scan: 14, units: 1.6 },
  ],
  [
    { action: 'tab', label: 'Tab', scan: 15, units: 1.6 },
    ...characterKeys([...'qwertyuiop', '[{', ']}'], 16),
    { text: '\\', shifted: '|', scan: 43 },
  ],
  [
    { action: 'caps', label: 'Caps', scan: 58, units: 1.8 },
    ...characterKeys([...'asdfghjkl', ';:', "'\""], 30),
    { action: 'enter', label: 'Enter', scan: 28, units: 2.1 },
  ],
  [
    { action: 'shift', label: 'Shift', scan: 42, units: 2.3 },
    ...characterKeys([...'zxcvbnm', ',<', '.>', '/?'], 44),
    { action: 'shift', label: 'Shift', scan: 54, units: 2.5 },
  ],
  [{ action: 'space', label: '空格', scan: 57 }],
];

const trigger = ref<HTMLButtonElement>();
const panel = ref<HTMLElement>();
const host = ref<HTMLElement>();
const open = ref(false);
const caps = ref(false);
const shift = ref(false);
const muted = ref(false);
const heldDelete = ref<number>();
const sound = createKeyboardSound();
let phone: HTMLElement | null = null;
let lastInput: HTMLInputElement | null = null;
let visibilityObserver: MutationObserver | undefined;
let deleteDelay: number | undefined;
let deleteInterval: number | undefined;

function editableInputs() {
  const inputs = phone?.querySelectorAll<HTMLInputElement>('.auth-phone-content input') ?? [];
  return Array.from(inputs)
    .filter(input => ['text', 'password', 'email', 'search', 'tel', 'url'].includes(input.type))
    .filter(input => !input.matches(':disabled') && !input.readOnly && !input.closest('[hidden], [inert]'));
}

function activeInput(inputs = editableInputs()) {
  const focused = document.activeElement;
  if (focused instanceof HTMLInputElement && inputs.includes(focused)) return focused;
  return lastInput && inputs.includes(lastInput) ? lastInput : inputs[0];
}

function close(restoreFocus = false) {
  stopDelete();
  if (restoreFocus && panel.value?.contains(document.activeElement)) {
    (activeInput() ?? trigger.value)?.focus({ preventScroll: true });
  }
  open.value = false;
  shift.value = false;
  caps.value = false;
}

async function toggle() {
  if (open.value) {
    close();
    return;
  }

  let input = activeInput();
  if (!input) {
    emit('openEntry');
    await nextTick();
    input = activeInput();
  }
  if (matchMedia('(hover: none) and (pointer: coarse)').matches) {
    input?.focus();
    return;
  }

  open.value = true;
  if (!muted.value) sound.prepare();
  input?.focus();
}

function edit(input: HTMLInputElement, value: string, backwards = false) {
  input.focus({ preventScroll: true });
  const previous = input.value;
  // 浏览器原生编辑会保留光标、选区和撤销，也适用于不暴露选区 API 的邮箱输入框。
  const edited = typeof document.execCommand === 'function'
    && document.execCommand(backwards ? 'delete' : 'insertText', false, value);
  if (edited || input.value !== previous) return input.value !== previous;

  let start = input.selectionStart ?? previous.length;
  const end = input.selectionEnd ?? start;
  if (backwards && start === end) {
    start -= Array.from(previous.slice(0, start)).at(-1)?.length ?? 0;
  }
  const next = previous.slice(0, start) + value + previous.slice(end);
  if (next === previous || (input.maxLength >= 0 && next.length > input.maxLength)) return false;
  input.value = next;
  if (input.selectionStart !== null) input.setSelectionRange(start + value.length, start + value.length);
  input.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    inputType: backwards ? 'deleteContentBackward' : 'insertText',
    data: backwards ? null : value,
  }));
  return input.value !== previous;
}

function character(key: CharacterKey) {
  const letter = /^[a-z]$/.test(key.text);
  return (letter ? caps.value !== shift.value : shift.value) ? key.shifted : key.text;
}

function play(key: Key, release = false) {
  if (!muted.value) sound.play(key.scan, release);
}

function toggleSound() {
  muted.value = !muted.value;
  if (!muted.value) sound.prepare();
}

function stopDelete(event?: PointerEvent) {
  if (event && event.pointerId !== heldDelete.value) return;
  window.clearTimeout(deleteDelay);
  window.clearInterval(deleteInterval);
  heldDelete.value = undefined;
}

function beginKey(key: Key, event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0) return;
  play(key);
  if (!('action' in key) || key.action !== 'delete') return;

  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  stopDelete();
  heldDelete.value = event.pointerId;
  target.setPointerCapture(event.pointerId);
  const input = activeInput();
  if (!input || !edit(input, '', true)) return;
  shift.value = false;
  function repeat() {
    if (activeInput() !== input || !edit(input, '', true)) {
      window.clearInterval(deleteInterval);
      return;
    }
    play(key);
  }
  deleteDelay = window.setTimeout(() => {
    deleteInterval = window.setInterval(repeat, 55);
    repeat();
  }, 380);
}

function endKey(key: Key, event: PointerEvent) {
  if (event.isPrimary && event.button === 0) play(key, true);
  stopDelete(event);
}

function clickKey(key: Key, event: MouseEvent) {
  if (event.detail === 0) {
    play(key);
    press(key);
  } else if (!('action' in key) || key.action !== 'delete') {
    // 退格在按下时已经输入，松开后的 click 不再删除。
    press(key);
  }
}

function press(key: Key) {
  if ('action' in key) {
    if (key.action === 'close') {
      close(true);
      return;
    }
    if (key.action === 'shift') {
      shift.value = !shift.value;
      return;
    }
    if (key.action === 'caps') {
      caps.value = !caps.value;
      return;
    }
  }

  const inputs = editableInputs();
  const input = activeInput(inputs);
  if (!input) return;

  if (!('action' in key)) {
    edit(input, character(key));
  } else if (key.action === 'delete') {
    edit(input, '', true);
  } else if (key.action === 'space') {
    edit(input, ' ');
  } else if (key.action === 'tab') {
    const step = shift.value ? -1 : 1;
    inputs[(inputs.indexOf(input) + step + inputs.length) % inputs.length]?.focus();
  } else if (key.action === 'enter') {
    const submit = input.form?.querySelector<HTMLButtonElement>('button[type="submit"]:enabled');
    if (submit) input.form?.requestSubmit(submit);
  }
  shift.value = false;
}

function trackInput(event: FocusEvent) {
  if (event.target instanceof HTMLInputElement && editableInputs().includes(event.target)) {
    lastInput = event.target;
  }
}

function outside(event: PointerEvent) {
  if (!open.value || !(event.target instanceof Node)) return;
  if (!phone?.contains(event.target) && !panel.value?.contains(event.target)) close();
}

function escape(event: KeyboardEvent) {
  if (open.value && event.key === 'Escape') close(true);
}

onMounted(() => {
  phone = trigger.value?.closest<HTMLElement>('.auth-phone') ?? null;
  host.value = phone?.closest<HTMLElement>('#auth-view') ?? undefined;
  phone?.addEventListener('focusin', trackInput);
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', escape);
  window.addEventListener('blur', stopOnBlur);
  if (host.value) {
    visibilityObserver = new MutationObserver(() => {
      if (host.value?.hidden || host.value?.inert) {
        close();
        lastInput = null;
      }
    });
    visibilityObserver.observe(host.value, { attributeFilter: ['hidden', 'inert'] });
  }
});

function stopOnBlur() { stopDelete(); }

onUnmounted(() => {
  stopDelete();
  sound.dispose();
  phone?.removeEventListener('focusin', trackInput);
  document.removeEventListener('pointerdown', outside, true);
  document.removeEventListener('keydown', escape);
  window.removeEventListener('blur', stopOnBlur);
  visibilityObserver?.disconnect();
});
</script>

<template>
  <button ref="trigger" class="auth-dock-button" aria-label="键盘" type="button"
    :aria-expanded="open" :aria-controls="open ? 'auth-keyboard' : undefined"
    @mousedown.prevent @click="toggle">
    <span class="auth-dock-tile" aria-hidden="true" :style="tileStyle"><Keyboard /></span>
    <span class="auth-dock-tip" aria-hidden="true">键盘</span>
  </button>
  <Teleport v-if="host" :to="host">
    <Transition name="auth-keyboard">
      <section v-if="open" id="auth-keyboard" ref="panel" class="auth-virtual-keyboard" aria-label="虚拟键盘">
        <div class="auth-keyboard-controls">
          <button type="button" class="auth-keycap auth-keycap-control" aria-label="关闭键盘"
            @mousedown.prevent @pointerdown="beginKey(escapeKey, $event)" @pointerup="endKey(escapeKey, $event)" @click="clickKey(escapeKey, $event)">
            Esc
          </button>
          <button type="button" class="auth-keycap auth-keycap-control auth-keyboard-mute" aria-label="键盘音效"
            :aria-pressed="!muted" @mousedown.prevent @click="toggleSound">
            <VolumeX v-if="muted" aria-hidden="true" /><Volume2 v-else aria-hidden="true" />
          </button>
        </div>
        <div v-for="(row, index) in rows" :key="index" class="auth-keyboard-row">
          <button v-for="(key, position) in row" :key="position" type="button" class="auth-keycap"
            :class="{
              'auth-keycap-control': 'action' in key,
              'auth-keycap-space': 'action' in key && key.action === 'space',
              'is-held': 'action' in key && key.action === 'delete' && heldDelete !== undefined,
            }"
            :style="'action' in key && key.units ? { '--key-units': key.units } : undefined"
            :aria-label="'action' in key ? key.label : character(key)"
            :aria-pressed="'action' in key && key.action === 'shift' ? shift : 'action' in key && key.action === 'caps' ? caps : undefined"
            @mousedown.prevent @pointerdown="beginKey(key, $event)" @pointerup="endKey(key, $event)"
            @pointercancel="stopDelete" @lostpointercapture="stopDelete" @click="clickKey(key, $event)">
            <template v-if="'action' in key">
              <Delete v-if="key.action === 'delete'" aria-hidden="true" />
              <ArrowBigUp v-else-if="key.action === 'shift'" aria-hidden="true" />
              <span v-else>{{ key.label }}</span>
            </template>
            <template v-else>
              <small v-if="key.shifted && key.shifted !== key.text.toUpperCase()" aria-hidden="true">{{ shift ? key.text : key.shifted }}</small>
              <span>{{ character(key) }}</span>
            </template>
          </button>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
