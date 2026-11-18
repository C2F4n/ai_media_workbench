<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const greeting = '欢迎使用';
const phrases = ['你的高效 AI 剪辑工具', '最佳音视频创作平台'];
const lineColors = ['#1d4ed8', '#2563eb', '#3b82f6', '#0ea5e9', '#45b7d1'];
const heading = ref<HTMLElement | null>(null);
const wordmark = ref<HTMLCanvasElement | null>(null);
const rotation = ref<HTMLElement | null>(null);
const painted = ref(false);
const phraseIndex = ref(0);
let dispose: (() => void) | undefined;

onMounted(() => {
  const title = heading.value;
  const canvas = wordmark.value;
  const label = rotation.value;
  if (!title || !canvas || !label) return;
  const rotatingLabel = label;
  const context = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let frame = 0;
  let lastPaint = -Infinity;
  let timer: ReturnType<typeof setInterval> | undefined;
  let width = 0;
  let height = 0;
  let baseline = 0;

  function draw(now: number) {
    if (!context || !width || !height) return;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = '#5c8dcf';
    context.fillText(greeting, width / 2, baseline);

    // 把流动的曲线限制在已绘制的字形内。
    context.globalCompositeOperation = 'source-atop';
    const time = now / 850;
    const gap = height * .096;
    context.lineWidth = Math.max(1.6, gap * .45);
    for (let row = -3; row < 15; row++) {
      const y = row * gap;
      const phase = time + row * .31;
      context.strokeStyle = lineColors[(row + 5) % lineColors.length];
      context.beginPath();
      context.moveTo(-2, y + Math.sin(phase) * height * .15);
      context.bezierCurveTo(
        width * .27, y + Math.cos(phase) * height * .55,
        width * .66, y - Math.sin(phase + .6) * height * .49,
        width + 2, y + Math.cos(phase + 1.3) * height * .18
      );
      context.stroke();
    }
    painted.value = true;
  }

  function resize() {
    rotatingLabel.style.setProperty('--auth-rotation-screen-width', `${document.documentElement.clientWidth}px`);
    rotatingLabel.style.setProperty('--auth-rotation-start', `${rotatingLabel.getBoundingClientRect().left}px`);
    if (!context || !canvas || !canvas.clientWidth) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const style = getComputedStyle(canvas);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.textAlign = 'center';
    const metrics = context.measureText(greeting);
    baseline = (height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    draw(motion.matches ? 0 : performance.now());
  }

  function animate(now: number) {
    if (now - lastPaint >= 32) {
      draw(now);
      lastPaint = now;
    }
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    cancelAnimationFrame(frame);
    clearInterval(timer);
    if (!inView || document.hidden) return;
    resize();
    if (motion.matches) {
      phraseIndex.value = 0;
      return;
    }
    if (context) frame = requestAnimationFrame(animate);
    timer = setInterval(() => { phraseIndex.value = (phraseIndex.value + 1) % phrases.length; }, 3200);
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  function refreshSize() { if (inView) resize(); }
  const sizing = new ResizeObserver(refreshSize);
  visibility.observe(title);
  sizing.observe(canvas);
  sizing.observe(title);
  window.addEventListener('resize', refreshSize);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  dispose = () => {
    cancelAnimationFrame(frame);
    clearInterval(timer);
    visibility.disconnect();
    sizing.disconnect();
    window.removeEventListener('resize', refreshSize);
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <p ref="heading" class="auth-welcome">
    <span class="sr-only">{{ greeting }}{{ phrases[0] }}</span>
    <span class="auth-welcome-wordmark" :class="{ 'is-painted': painted }" aria-hidden="true">
      <span>{{ greeting }}</span>
      <canvas ref="wordmark"></canvas>
    </span>
    <span ref="rotation" class="auth-welcome-rotation" aria-hidden="true">
      <span v-for="phrase in phrases" :key="phrase" class="auth-welcome-word-size">{{ phrase }}</span>
      <Transition name="auth-word" mode="out-in">
        <span :key="phraseIndex" class="auth-welcome-word">{{ phrases[phraseIndex] }}</span>
      </Transition>
    </span>
  </p>
</template>
