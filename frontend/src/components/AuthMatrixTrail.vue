<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const surface = ref<HTMLCanvasElement | null>(null);
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-<>=$#*';
const cellWidth = 15;
const cellHeight = 19;
const fadeMs = 900;
const pointerRadius = 49;
const rainTailRows = 6;
const maxRainColumns = 3;
const glyphFont = '15px ui-monospace, Consolas, monospace';

type Glow = { strength: number; start: number };
type Point = { x: number; y: number; time: number };
type RainColumn = { column: number; start: number; stepMs: number };
let dispose: (() => void) | undefined;

onMounted(() => {
  const element = surface.value;
  const drawing = element?.getContext('2d');
  const pattern = document.createElement('canvas');
  const base = pattern.getContext('2d');
  if (!element || !drawing || !base) return;
  const canvas = element;
  const screen = canvas.parentElement ?? canvas;
  const context = drawing;
  const background = base;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const glows = new Map<number, Glow>();
  const rain: RainColumn[] = [];
  const characters: string[] = [];
  let width = 0;
  let height = 0;
  let columns = 0;
  let rows = 0;
  let inView = false;
  let frame = 0;
  let lastFrame = -Infinity;
  let nextRainAt = 0;
  let previous: Point | undefined;

  function drawCharacter(index: number, color: string) {
    context.fillStyle = color;
    const x = (index % columns + .5) * cellWidth;
    const y = (Math.floor(index / columns) + .5) * cellHeight;
    context.fillText(characters[index], x, y);
  }

  function drawRain(now: number) {
    for (let i = rain.length - 1; i >= 0; i--) {
      if (now - rain[i].start >= (rows + rainTailRows) * rain[i].stepMs) rain.splice(i, 1);
    }

    if (now >= nextRainAt && rain.length < maxRainColumns) {
      const freeColumns: number[] = [];
      for (let column = 1; column < columns - 1; column++) {
        if (!rain.some(stream => stream.column === column)) freeColumns.push(column);
      }
      if (freeColumns.length) {
        const column = freeColumns[Math.floor(Math.random() * freeColumns.length)];
        rain.push({ column, start: now, stepMs: 78 + Math.random() * 15 });
      }
      // 每次只开启一列，并随机等待下一列，避免它们整齐地一起落下。
      nextRainAt = now + 1100 + Math.random() * 490;
    }

    for (const stream of rain) {
      const progress = (now - stream.start) / stream.stepMs;
      const head = Math.floor(progress);
      for (let row = Math.max(0, head - rainTailRows); row <= Math.min(rows - 1, head); row++) {
        const age = progress - row;
        const tail = Math.max(0, 1 - age / rainTailRows) ** 1.4;
        const opacity = Math.min(1, .38 + age * 3) * tail * .88;
        drawCharacter(row * columns + stream.column, `rgba(31, 102, 232, ${opacity})`);
      }
    }
  }

  function render(now: number, animated: boolean) {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    context.drawImage(pattern, 0, 0, width, height);
    if (!animated) return;

    drawRain(now);
    for (const [index, glow] of glows) {
      const age = (now - glow.start) / fadeMs;
      if (age >= 1) {
        glows.delete(index);
        continue;
      }
      const opacity = glow.strength * (1 - Math.max(0, age)) ** 1.5;
      drawCharacter(index, `rgba(104, 161, 225, ${opacity * .86})`);
    }
  }

  function resize() {
    if (!inView) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    columns = Math.ceil(width / cellWidth);
    rows = Math.ceil(height / cellHeight);
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = pattern.width = Math.round(width * scale);
    canvas.height = pattern.height = Math.round(height * scale);
    for (const painter of [context, background]) {
      painter.setTransform(scale, 0, 0, scale, 0, 0);
      painter.font = glyphFont;
      painter.textAlign = 'center';
      painter.textBaseline = 'middle';
    }
    resetEffects();
    characters.length = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        characters.push(letter);
        if (Math.random() < .48) {
          background.fillStyle = `rgba(71, 86, 105, ${.085 + Math.random() * .06})`;
          background.fillText(letter, (col + .5) * cellWidth, (row + .5) * cellHeight);
        }
      }
    }
    render(performance.now(), false);
  }

  function resetEffects() {
    glows.clear();
    rain.length = 0;
    nextRainAt = 0;
    leave();
  }

  function lightNear(x: number, y: number, now: number) {
    const firstCol = Math.max(0, Math.floor((x - pointerRadius) / cellWidth));
    const lastCol = Math.min(columns - 1, Math.floor((x + pointerRadius) / cellWidth));
    const firstRow = Math.max(0, Math.floor((y - pointerRadius) / cellHeight));
    const lastRow = Math.min(rows - 1, Math.floor((y + pointerRadius) / cellHeight));
    for (let row = firstRow; row <= lastRow; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const distance = Math.hypot((col + .5) * cellWidth - x, (row + .5) * cellHeight - y);
        if (distance >= pointerRadius) continue;
        const index = row * columns + col;
        const strength = (1 - distance / pointerRadius) ** .9;
        const old = glows.get(index);
        const remaining = old ? old.strength * Math.max(0, 1 - (now - old.start) / fadeMs) ** 1.5 : 0;
        if (strength >= remaining) glows.set(index, { strength, start: now });
      }
    }
  }

  function move(event: PointerEvent) {
    if (!inView || document.hidden || motion.matches || (event.pointerType === 'touch' && !event.isPrimary)) return;
    const bounds = canvas.getBoundingClientRect();
    const now = performance.now();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const last = previous;
    if (last && now - last.time < 100) {
      const steps = Math.min(12, Math.ceil(Math.hypot(x - last.x, y - last.y) / 13));
      for (let step = 1; step < steps; step++) {
        lightNear(last.x + (x - last.x) * step / steps, last.y + (y - last.y) * step / steps, now);
      }
    }
    lightNear(x, y, now);
    previous = { x, y, time: now };
  }

  function leave() { previous = undefined; }

  function tick(now: number) {
    if (now - lastFrame >= 32) {
      render(now, true);
      lastFrame = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    if (!inView || document.hidden || motion.matches) {
      resetEffects();
      if (inView && !document.hidden) render(performance.now(), false);
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && (width !== canvas.clientWidth || height !== canvas.clientHeight)) resize();
    sync();
  });
  const sizing = new ResizeObserver(() => {
    if (width !== canvas.clientWidth || height !== canvas.clientHeight) resize();
  });
  visibility.observe(canvas);
  sizing.observe(canvas);
  screen.addEventListener('pointermove', move, { passive: true });
  screen.addEventListener('pointerdown', move, { passive: true });
  screen.addEventListener('pointerleave', leave);
  screen.addEventListener('pointercancel', leave);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);

  dispose = () => {
    cancelAnimationFrame(frame);
    visibility.disconnect();
    sizing.disconnect();
    screen.removeEventListener('pointermove', move);
    screen.removeEventListener('pointerdown', move);
    screen.removeEventListener('pointerleave', leave);
    screen.removeEventListener('pointercancel', leave);
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <canvas ref="surface" class="auth-matrix-trail" aria-hidden="true"></canvas>
</template>
