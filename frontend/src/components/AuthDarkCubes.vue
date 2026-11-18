<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { createDarkCubesScene } from '../auth/dark-cubes-scene';

const container = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const rendererState = ref('idle');
const running = ref(false);
let dispose: (() => void) | undefined;

onMounted(() => {
  const surface = canvas.value;
  const area = container.value;
  const auth = area?.closest<HTMLElement>('#auth-view');
  if (!surface || !area || !auth) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canSplit = CSS.supports('backdrop-filter', 'invert(1)') || CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  let scene: ReturnType<typeof createDarkCubesScene> | undefined;
  let inView = false;
  let active = false;
  let frame = 0;
  let lastRender = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = lastRender = 0;
    running.value = false;
  }

  function animate(now: number) {
    frame = 0;
    if (!active || !scene) return;
    if (!lastRender || now - lastRender >= 1000 / 30) {
      const delta = lastRender ? Math.min((now - lastRender) / 1000, .1) : 1 / 30;
      lastRender = now;
      scene.update(delta);
    }
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    const split = Number.parseFloat(auth!.style.getPropertyValue('--auth-theme-split'));
    const darkVisible = canSplit ? Number.isFinite(split) && split < 100 : auth!.dataset.theme === 'dark';
    active = inView && darkVisible && !auth!.hidden && !auth!.inert && !document.hidden;
    if (!active || rendererState.value === 'fallback') {
      stop();
      return;
    }
    if (!scene) {
      try {
        scene = createDarkCubesScene(surface!, area!);
        rendererState.value = 'ready';
      } catch {
        // 无 WebGL 的浏览器仍可使用表单，并显示静态的深色方块背景。
        rendererState.value = 'fallback';
        stop();
        return;
      }
    }
    if (motion.matches) {
      stop();
      scene.update(0);
    } else if (!frame) {
      running.value = true;
      frame = requestAnimationFrame(animate);
    }
  }

  function move(event: PointerEvent) {
    if (!active || motion.matches || event.pointerType !== 'mouse') return;
    const split = Number.parseFloat(auth!.style.getPropertyValue('--auth-theme-split'));
    if (canSplit && event.clientX < auth!.clientWidth * split / 100) return;
    scene?.pointerMove(event);
  }

  function contextLost(event: Event) {
    event.preventDefault();
    stop();
    rendererState.value = 'fallback';
  }

  function contextRestored() {
    scene?.dispose();
    scene = undefined;
    rendererState.value = 'idle';
    sync();
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  visibility.observe(area);
  const theme = new MutationObserver(sync);
  theme.observe(auth, { attributes: true, attributeFilter: ['hidden', 'inert', 'style', 'data-theme'] });
  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  surface.addEventListener('webglcontextlost', contextLost);
  surface.addEventListener('webglcontextrestored', contextRestored);
  sync();

  dispose = () => {
    active = false;
    stop();
    visibility.disconnect();
    theme.disconnect();
    window.removeEventListener('pointermove', move);
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    surface.removeEventListener('webglcontextlost', contextLost);
    surface.removeEventListener('webglcontextrestored', contextRestored);
    scene?.dispose();
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <div ref="container" class="auth-dark-cubes" :data-renderer="rendererState" :data-running="running" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>
