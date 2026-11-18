<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

type Tile = { x: number; y: number; depth: number; velocity: number; neighbors: Tile[] };
type Point = { x: number; y: number; time: number };

const surface = ref<HTMLCanvasElement | null>(null);
let dispose: (() => void) | undefined;

onMounted(() => {
  const element = surface.value;
  const drawing = element?.getContext('2d');
  const root = element?.closest<HTMLElement>('#auth-view');
  if (!element || !drawing || !root) return;
  const canvas = element;
  const ctx = drawing;
  const auth = root;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const canSplit = CSS.supports('backdrop-filter', 'invert(1)') || CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  const tiles: Tile[] = [];
  const step = 1 / 120;
  let width = 0;
  let height = 0;
  let cell = 150;
  let frame = 0;
  let lastFrame = 0;
  let accumulated = 0;
  let previous: Point | undefined;
  let inView = false;

  function paint() {
    ctx.fillStyle = '#efedeb';
    ctx.fillRect(0, 0, width, height);
    const halfWidth = cell * .49;
    const halfHeight = cell * .279;
    // A nearer row covers the sides of the rows behind it. All the columns end below the surface.
    for (const tile of tiles) {
      const { x, depth } = tile;
      const y = tile.y + Math.max(-cell * .31, Math.min(cell * 1.12, depth));
      const floor = tile.y + cell * 1.45;
      if (y - halfHeight > height || floor + halfHeight < 0) continue;
      const shade = Math.round(Math.min(23, Math.max(0, depth) * .22));
      const walls = ctx.createLinearGradient(0, y, 0, y + cell * .9);
      walls.addColorStop(0, `rgb(${205 - shade}, ${201 - shade}, ${197 - shade})`);
      walls.addColorStop(1, '#e8e6e3');
      ctx.fillStyle = walls;
      ctx.beginPath();
      ctx.moveTo(x - halfWidth, y);
      ctx.lineTo(x, y + halfHeight);
      ctx.lineTo(x + halfWidth, y);
      ctx.lineTo(x + halfWidth, floor);
      ctx.lineTo(x, floor + halfHeight);
      ctx.lineTo(x - halfWidth, floor);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#574f4617';
      ctx.beginPath();
      ctx.moveTo(x, y + halfHeight);
      ctx.lineTo(x + halfWidth, y);
      ctx.lineTo(x + halfWidth, floor);
      ctx.lineTo(x, floor + halfHeight);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgb(${246 - shade}, ${245 - shade}, ${244 - shade})`;
      ctx.beginPath();
      ctx.moveTo(x, y - halfHeight);
      ctx.lineTo(x + halfWidth, y);
      ctx.lineTo(x, y + halfHeight);
      ctx.lineTo(x - halfWidth, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  function simulate() {
    let moving = false;
    for (const tile of tiles) {
      let slope = 0;
      for (const neighbor of tile.neighbors) slope += neighbor.depth - tile.depth;
      tile.velocity += (slope * 34 - tile.depth * 23 - tile.velocity * 5.1) * step;
    }
    for (const tile of tiles) {
      tile.depth += tile.velocity * step;
      moving ||= Math.abs(tile.depth) > .23 || Math.abs(tile.velocity) > .8;
    }
    return moving;
  }

  function animate(now: number) {
    frame = 0;
    accumulated += lastFrame ? Math.min((now - lastFrame) / 1000, .035) : step;
    lastFrame = now;
    let moving = true;
    while (accumulated >= step) {
      moving = simulate();
      accumulated -= step;
    }
    if (moving) frame = requestAnimationFrame(animate);
    else {
      for (const tile of tiles) tile.depth = tile.velocity = 0;
      lastFrame = accumulated = 0;
    }
    paint();
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = lastFrame = accumulated = 0;
    previous = undefined;
    for (const tile of tiles) tile.depth = tile.velocity = 0;
  }

  function resize() {
    if (!inView) return;
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return;
    stop();
    width = nextWidth;
    height = nextHeight;
    cell = Math.min(164, Math.max(96, width * .106));
    const halfWidth = cell / 2;
    const rowHeight = cell * .285;
    const ratio = Math.min(devicePixelRatio || 1, 1.4, Math.sqrt(2_400_000 / (width * height)));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    const rows: (Tile | undefined)[][] = [];
    const columns = Math.ceil(width / halfWidth) + 5;
    const rowCount = Math.ceil(height / rowHeight) + 12;
    tiles.length = 0;
    for (let row = 0; row < rowCount; row++) {
      const line: (Tile | undefined)[] = [];
      rows.push(line);
      for (let col = row % 2; col < columns; col += 2) {
        const x = (col - 2) * halfWidth;
        const y = (row - 6) * rowHeight;
        const tile: Tile = { x, y, depth: 0, velocity: 0, neighbors: [] };
        // Add each shared edge as soon as both cells exist.
        for (const neighbor of [rows[row - 1]?.[col - 1], rows[row - 1]?.[col + 1]]) {
          if (!neighbor) continue;
          tile.neighbors.push(neighbor);
          neighbor.neighbors.push(tile);
        }
        tiles.push(tile);
        line[col] = tile;
      }
    }
    paint();
  }

  function press(x: number, y: number, strength: number) {
    const radius = cell * .81;
    for (const tile of tiles) {
      const dx = tile.x - x;
      const dy = (tile.y - y) * 1.46;
      const weight = 1 - (dx * dx + dy * dy) / (radius * radius);
      if (weight <= 0) continue;
      const amount = strength * weight ** 2 - tile.depth;
      if (amount <= 0) continue;
      tile.depth += amount * .68;
      tile.velocity = Math.max(tile.velocity, amount * 4.3);
    }
  }

  function move(event: PointerEvent) {
    if (!inView || document.hidden || motion.matches || event.pointerType === 'touch' ||
        auth.hidden || auth.inert || auth.dataset.theme === 'dark') return;
    const split = Number.parseFloat(auth.style.getPropertyValue('--auth-theme-split'));
    const edge = canSplit && Number.isFinite(split) ? width * split / 100 : width;
    const point: Point = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    if (point.x < 0 || point.x >= edge || point.y < 0 || point.y >= height) {
      previous = undefined;
      return;
    }
    const last = previous;
    previous = point;
    const elapsed = last ? point.time - last.time : Infinity;
    if (!last || elapsed > 145) {
      press(point.x, point.y, cell * .12);
    } else {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 1) return;
      const speed = distance / Math.max(5, elapsed);
      const strength = cell * (.1 + .94 * (1 - Math.exp(-speed / 1.28)));
      const marks = Math.min(16, Math.ceil(distance / (cell * .16)));
      for (let index = 1; index <= marks; index++) {
        press(last.x + dx * index / marks, last.y + dy * index / marks, strength);
      }
    }
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function pause() {
    stop();
    if (inView && !document.hidden) paint();
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) stop();
    else if (width === canvas.clientWidth && height === canvas.clientHeight) paint();
    else resize();
  });
  const sizing = new ResizeObserver(resize);
  visibility.observe(canvas);
  sizing.observe(canvas);
  window.addEventListener('pointermove', move, { passive: true });
  motion.addEventListener('change', pause);
  document.addEventListener('visibilitychange', pause);
  dispose = () => {
    stop();
    visibility.disconnect();
    sizing.disconnect();
    window.removeEventListener('pointermove', move);
    motion.removeEventListener('change', pause);
    document.removeEventListener('visibilitychange', pause);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <canvas ref="surface" class="auth-cubes-grid" aria-hidden="true"></canvas>
</template>
