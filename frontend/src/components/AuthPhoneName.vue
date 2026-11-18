<script setup lang="ts">
const name = 'FrameFlow';
const colors = ['#83b320', '#2fc36a', '#2aa9d2', '#0470ca', '#6b0aff', '#b700da', '#da00ab', '#e6405c', '#e8623f', '#f9812f'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function tilt(event: PointerEvent) {
  const area = event.currentTarget;
  if (!(area instanceof HTMLElement) || event.pointerType === 'touch' || reducedMotion.matches) return;
  const { x, y, width, height } = area.getBoundingClientRect();
  if (!width || !height) return;
  area.style.setProperty('--wordmark-x', `${(0.5 - (event.clientY - y) / height) * 28}deg`);
  area.style.setProperty('--wordmark-y', `${((event.clientX - x) / width - 0.5) * 36}deg`);
  area.style.setProperty('--wordmark-depth', '28px');
}

function reset(event: PointerEvent) {
  const area = event.currentTarget;
  if (!(area instanceof HTMLElement)) return;
  area.style.removeProperty('--wordmark-x');
  area.style.removeProperty('--wordmark-y');
  area.style.removeProperty('--wordmark-depth');
}
</script>

<template>
  <div class="auth-wordmark-stage" @pointermove="tilt" @pointerleave="reset" @pointercancel="reset">
    <h1 class="auth-phone-wordmark" :aria-label="name">
      <span v-for="(letter, index) in name" :key="index" class="auth-wordmark-letter" aria-hidden="true"
        :style="{ '--letter-color': colors[index], '--letter-next-color': colors[(index + 4) % colors.length],
          '--letter-delay': (index * -0.11) + 's' }">{{ letter }}</span>
    </h1>
  </div>
</template>
