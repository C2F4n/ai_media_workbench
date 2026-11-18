<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId } from 'vue';

const greeting = 'Welcome\u202Fto\u202FFrameFlow';
const pathId = useId();
const letteringLength = 130;
const repeatDistance = letteringLength + 5;
// 在起点外预留一段，向终点滚动时首尾都保持有文字。
const offsets = [-1, 0, 1, 2, 3, 4, 5].map(index => index * repeatDistance);
const drawing = ref<SVGSVGElement | null>(null);
const animate = ref(false);
let dispose: (() => void) | undefined;

onMounted(() => {
  const svg = drawing.value;
  if (!svg) return;
  const auth = svg.closest('#auth-view');
  const phone = auth?.querySelector('.auth-phone');
  const path = svg.querySelector('path');
  if (!auth || !phone || !path) return;

  const { width, height } = svg.viewBox.baseVal;
  const glyphMargin = 16;
  const length = path.getTotalLength();
  const guide = Array.from({ length: 121 }, (_, index) => path.getPointAtLength(length * index / 120))
    .filter(point => point.x >= -glyphMargin && point.y <= height + glyphMargin);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;

  function fitCorner() {
    const bounds = auth!.getBoundingClientRect();
    const device = phone!.getBoundingClientRect();
    if (!bounds.width || !device.width) return;
    const rightSpace = Math.max(0, bounds.right - device.right - 10);
    const bottomSpace = Math.max(0, bounds.bottom - device.bottom - 10);
    let scale = bounds.width / width;
    for (const point of guide) {
      // Every glyph can pass to the right of the phone or below it.
      const toRight = Math.max(1, width - point.x + glyphMargin);
      const toBottom = Math.max(1, height - point.y + glyphMargin);
      scale = Math.min(scale, Math.max(rightSpace / toRight, bottomSpace / toBottom));
    }
    svg!.style.setProperty('--auth-corner-width', `${Math.floor(scale * width)}px`);
  }

  function sync() {
    animate.value = visible && !document.hidden && !motion.matches;
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(svg);
  const sizing = new ResizeObserver(fitCorner);
  sizing.observe(auth);
  sizing.observe(phone);
  fitCorner();
  window.addEventListener('resize', fitCorner);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  dispose = () => {
    observer.disconnect();
    sizing.disconnect();
    window.removeEventListener('resize', fitCorner);
    motion.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <svg ref="drawing" class="auth-corner-welcome" viewBox="0 0 296 158" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
    <defs>
      <path :id="pathId" d="M -52 176 H -10 C 27 176 64 155 100 132 C 151 100 184 82 164 53 C 148 30 113 38 112 67 C 111 99 150 121 197 108 C 246 95 286 55 296 18"/>
    </defs>
    <text v-for="offset in offsets" :key="offset" font-size="14" :textLength="letteringLength" lengthAdjust="spacingAndGlyphs">
      <textPath :href="`#${pathId}`" :startOffset="offset">
        {{ greeting }}
        <animate v-if="animate" attributeName="startOffset" :from="offset" :to="offset + repeatDistance" dur="14s" repeatCount="indefinite" />
      </textPath>
    </text>
  </svg>
</template>
