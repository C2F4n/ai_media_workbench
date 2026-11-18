<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const phrases = [
  ['通向剪辑的道路', '从这里开始'],
  ['注册，登录，', '然后开始使用。']
] as const;
const accessibleTitle = phrases.map(lines => lines.join('')).join('。');
const heading = ref<HTMLElement | null>(null);
const phraseIndex = ref(0);
const count = ref(0);
const phrase = computed(() => phrases[phraseIndex.value]);
const length = computed(() => phrase.value[0].length + phrase.value[1].length);
const typedLines = computed(() => {
  const [first, second] = phrase.value;
  return [first.slice(0, count.value), second.slice(0, Math.max(0, count.value - first.length))];
});
const caretLine = computed(() => count.value > phrase.value[0].length ? 1 : 0);
let dispose: (() => void) | undefined;

onMounted(() => {
  const title = heading.value;
  if (!title) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let deleting = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function sync() {
    clearTimeout(timer);
    if (motion.matches) {
      deleting = false;
      count.value = length.value;
      return;
    }
    if (!visible || document.hidden) return;
    const complete = count.value === length.value;
    const empty = count.value === 0;
    const delay = complete ? 2350 : empty ? 180 : deleting ? 42 : 92;
    timer = setTimeout(() => {
      if (complete) deleting = true;
      if (deleting && empty) {
        phraseIndex.value = (phraseIndex.value + 1) % phrases.length;
        deleting = false;
      }
      count.value += deleting ? -1 : 1;
      sync();
    }, delay);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(title);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  dispose = () => {
    clearTimeout(timer);
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <h1 ref="heading" class="auth-typewriter" :aria-label="accessibleTitle">
    <span v-for="lines in phrases" :key="lines[0]" class="auth-typewriter-phrase auth-typewriter-reserve" aria-hidden="true">
      <span v-for="line in lines" :key="line" class="auth-typewriter-line">{{ line }}</span>
    </span>
    <span class="auth-typewriter-phrase" aria-hidden="true">
      <span v-for="(line, index) in typedLines" :key="index" class="auth-typewriter-line">
        <span v-for="(character, position) in line" :key="position" class="auth-typewriter-character">{{ character }}</span><span
          v-if="index === caretLine" class="auth-typewriter-caret" :class="{ 'typing-complete': count === length }"
        ></span>
      </span>
    </span>
  </h1>
</template>
