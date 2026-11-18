<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { galleryPhotos as photos } from '../auth/gallery-photos';
const surface = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
const failed = ref(false);
const dragging = ref(false);
let dispose: (() => void) | undefined;

type Point = { x: number; y: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const wrap = (value: number, length: number) => ((value % length) + length) % length;

function seed(column: number, row: number, image: number) {
  const hash = Math.imul(column + 1, 374761393) ^ Math.imul(row + 1, 668265263) ^ Math.imul(image + 1, 982451653);
  return ((Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 16) & 65535) / 65535;
}

onMounted(() => {
  const element = surface.value;
  const drawing = element?.getContext('2d');
  if (!element || !drawing) { failed.value = true; return; }
  const canvas = element;
  const context = drawing;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const images: HTMLImageElement[] = [];
  const cards: HTMLCanvasElement[] = [];
  const displacedTiles = new Map<HTMLCanvasElement, Map<number, Point>>();
  let alive = true;
  let inView = false;
  let requested = false;
  let width = 0;
  let height = 0;
  let cardWidth = 0;
  let cardHeight = 0;
  let stride = 0;
  let scale = 1;
  let offset = 0;
  let scrollDirection = 1;
  let frame = 0;
  let lastFrame = 0;
  let drag: { id: number; x: number } | null = null;
  let pointer: Point | null = null;

  async function loadImages() {
    requested = true;
    const loaded = await Promise.all(photos.map(async ({ src }) => {
      const photo = new Image();
      photo.src = src;
      try { await photo.decode(); return photo; } catch { return null; }
    }));
    if (!alive) return;
    for (const photo of loaded) if (photo) images.push(photo);
    failed.value = images.length === 0;
    resize();
    sync();
  }

  function resize() {
    if (!inView || !images.length) return;
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    const nextScale = Math.min(devicePixelRatio || 1, 1.5);
    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height && nextScale === scale)) return;

    const previousStride = stride;
    width = nextWidth;
    height = nextHeight;
    scale = nextScale;
    cardHeight = Math.round(height * .8);
    cardWidth = Math.round(cardHeight * .8);
    stride = cardWidth + Math.max(12, Math.round(cardWidth * .085));
    if (previousStride) offset *= stride / previousStride;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    cards.length = 0;
    displacedTiles.clear();
    for (const image of images) {
      const card = document.createElement('canvas');
      card.width = Math.round(cardWidth * scale);
      card.height = Math.round(cardHeight * scale);
      const crop = Math.min(image.naturalWidth / card.width, image.naturalHeight / card.height);
      const sourceWidth = card.width * crop;
      const sourceHeight = card.height * crop;
      card.getContext('2d')!.drawImage(
        image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
        sourceWidth, sourceHeight, 0, 0, card.width, card.height
      );
      cards.push(card);
    }
    draw();
    ready.value = true;
  }

  function displaceTile(
    tiles: Map<number, Point>, key: number, dx: number, dy: number, radius: number,
    pushEase: number, returnEase: number
  ) {
    const distanceSquared = dx * dx + dy * dy;
    const withinReach = distanceSquared < radius * radius;
    const previous = tiles.get(key);
    if (!withinReach && !previous) return;

    const tile = previous ?? { x: 0, y: 0 };
    let targetX = 0;
    let targetY = 0;
    if (withinReach) {
      const distance = Math.sqrt(distanceSquared);
      const push = radius * (.84 + seed(key, 0, 0) * .36) * (1 - distance / radius) ** 1.45;
      const angle = distance > .001 ? Math.atan2(dy, dx) : key * 2.4;
      targetX = Math.cos(angle) * push;
      targetY = Math.sin(angle) * push;
    }
    const ease = withinReach ? pushEase : returnEase;
    tile.x += (targetX - tile.x) * ease;
    tile.y += (targetY - tile.y) * ease;

    if (!withinReach && tile.x * tile.x + tile.y * tile.y < .16) {
      tiles.delete(key);
      return;
    }
    if (!previous) tiles.set(key, tile);
    return tile;
  }

  function drawTiles(
    card: HTMLCanvasElement, imageIndex: number, x: number, y: number, edge: number,
    assembled: boolean, cursor: Point | null, elapsed: number
  ) {
    const cell = Math.max(7, Math.round(cardWidth / 21));
    const columns = Math.ceil(cardWidth / cell);
    const radius = Math.max(34, Math.min(49, cardWidth * .255));
    const pushEase = 1 - Math.exp(-elapsed / 34);
    const returnEase = 1 - Math.exp(-elapsed / 78);
    const tiles = displacedTiles.get(card) ?? (cursor ? new Map<number, Point>() : undefined);
    const cursorX = cursor?.x ?? Infinity;
    const cursorY = cursor?.y ?? Infinity;
    const sourceScaleX = card.width / cardWidth;
    const sourceScaleY = card.height / cardHeight;
    const scatterRange = Math.min(edge * .88, cardWidth * .76);
    for (let top = 0, row = 0; top < cardHeight; top += cell, row++) {
      const h = Math.min(cell, cardHeight - top);
      const tileY = y + top + h / 2;
      const middle = 1 - Math.abs((top + h / 2) / cardHeight * 2 - 1);
      for (let left = 0, col = 0; left < cardWidth; left += cell, col++) {
        const w = Math.min(cell, cardWidth - left);
        const center = x + left + w / 2;
        const proximity = assembled ? 0 : clamp(1 - Math.min(center, width - center) / edge);
        const age = proximity ? Math.max(0, proximity - .05 - seed(col, row, imageIndex) * .31) : 0;
        const key = row * columns + col;
        // 只推动尚未脱落的方块，让鼠标避让和两侧消散各自沿原来的轨迹运动。
        const displacement = tiles && !age
          ? displaceTile(tiles, key, center - cursorX, tileY - cursorY, radius, pushEase, returnEase)
          : undefined;
        if (age) tiles?.delete(key);
        if (!age) {
          if (displacement) continue;
          const overlapX = left + w < cardWidth ? .4 : 0;
          const overlapY = top + h < cardHeight ? .4 : 0;
          context.globalAlpha = 1;
          context.drawImage(
            card, left * sourceScaleX, top * sourceScaleY, w * sourceScaleX, h * sourceScaleY,
            x + left, y + top, w + overlapX, h + overlapY
          );
          continue;
        }
        const spread = seed(col + 13, row + 67, imageIndex);
        // 靠近拼合处移动最快。按位置计算同一条轨迹，反向拖动时自然回到原位。
        const travel = .74 * (1 - Math.exp(-10 * age)) + .26 * clamp(age / .7);
        const direction = center < width / 2 ? -1 : 1;
        const shift = direction * travel * (13 + spread * scatterRange);

        // 上下各行同时开始脱落；中线附近保留稍久，逐渐收成浅三角。
        const lifetime = .26 + seed(col + 59, row + 23, imageIndex) * .39 + middle * .19 - spread * .1;
        const fadeStart = lifetime * (.28 + seed(col + 9, row + 47, imageIndex) * .25);
        const fade = clamp((age - fadeStart) / (lifetime - fadeStart));
        if (fade >= 1) continue;
        const dx = x + left + shift;
        if (dx + w < 0 || dx >= width) continue;
        const dy = y + top + (seed(col + 37, row + 9, imageIndex) - .5) * travel * 84;
        const shrink = 1 - fade * .59;
        const fragmentCenter = dx + w * shrink / 2;
        const edgeDistance = Math.min(fragmentCenter, width - fragmentCenter);
        // 越靠上下两端，飘远的碎块越早淡出。各块的淡出范围也略有差别。
        const edgeInset = edge * (.035 + (1 - middle) * .21) * travel;
        const edgeFade = clamp((edgeDistance - edgeInset) / (9 + spread * edge * .24));
        if (!edgeFade) continue;
        context.globalAlpha = (1 - fade) ** 1.42 * edgeFade;
        context.drawImage(
          card, left * sourceScaleX, top * sourceScaleY, w * sourceScaleX, h * sourceScaleY,
          dx, dy, w * shrink, h * shrink
        );
      }
    }
    context.globalAlpha = 1;
    if (tiles?.size) {
      displacedTiles.set(card, tiles);
      // 推开的方块画在照片上方，让洞口边缘仍看得出独立的方块。
      for (const [key, tile] of tiles) {
        const left = (key % columns) * cell;
        const top = Math.floor(key / columns) * cell;
        const w = Math.min(cell, cardWidth - left);
        const h = Math.min(cell, cardHeight - top);
        context.drawImage(
          card, left * sourceScaleX, top * sourceScaleY, w * sourceScaleX, h * sourceScaleY,
          x + left + tile.x, y + top + tile.y, w, h
        );
      }
    } else displacedTiles.delete(card);
  }

  function draw(elapsed = 0) {
    if (!cards.length) return;
    context.clearRect(0, 0, width, height);
    const hiddenCards = displacedTiles.size ? new Set(displacedTiles.keys()) : null;
    const origin = (width - cardWidth) / 2 - offset;
    const y = (height - cardHeight) / 2;
    const edge = Math.min(width * .235, cardWidth * .98);
    const first = Math.floor((-cardWidth - origin) / stride);
    for (let index = first; origin + index * stride < width; index++) {
      const x = origin + index * stride;
      if (x + cardWidth <= 0) continue;
      const imageIndex = wrap(index + 1, cards.length);
      const card = cards[imageIndex];
      hiddenCards?.delete(card);
      const assembled = x >= edge && x + cardWidth <= width - edge;
      const center = x + cardWidth / 2;
      const central = assembled || (center >= width / 2 - stride && center < width / 2 + stride);
      const cursor = central && pointer && pointer.x >= x && pointer.x <= x + cardWidth &&
        pointer.y >= y && pointer.y <= y + cardHeight ? pointer : null;
      if (motion.matches || (assembled && !cursor && !displacedTiles.has(card))) {
        context.drawImage(card, x, y, cardWidth, cardHeight);
      } else drawTiles(card, imageIndex, x, y, edge, assembled, cursor, elapsed);
    }
    hiddenCards?.forEach(card => displacedTiles.delete(card));
  }

  function moveBy(distance: number, elapsed = 0) {
    if (!stride || !cards.length) return;
    offset = wrap(offset + distance, stride * cards.length);
    draw(elapsed);
  }

  function animate(now: number) {
    frame = requestAnimationFrame(animate);
    const elapsed = lastFrame ? now - lastFrame : 0;
    if (lastFrame && elapsed < (pointer || displacedTiles.size ? 12 : 30)) return;
    lastFrame = now;
    const step = Math.min(elapsed, 45);
    if (!drag) moveBy(step * .027 * scrollDirection, step);
    else if (displacedTiles.size) draw(step);
  }

  function sync() {
    cancelAnimationFrame(frame);
    lastFrame = 0;
    if (!inView || document.hidden || motion.matches) {
      pointer = null;
      displacedTiles.clear();
    }
    if (!inView || document.hidden || !cards.length) return;
    draw();
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }

  function startDrag(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary || !ready.value) return;
    drag = { id: event.pointerId, x: event.clientX };
    pointer = null;
    dragging.value = true;
    canvas.setPointerCapture(event.pointerId);
  }

  function updatePointer(event: PointerEvent) {
    if (!motion.matches && event.pointerType === 'mouse' && event.offsetX >= 0 && event.offsetX < width &&
        event.offsetY >= 0 && event.offsetY < height) {
      pointer = { x: event.offsetX, y: event.offsetY };
    } else pointer = null;
  }

  function pointerMove(event: PointerEvent) {
    if (!drag) updatePointer(event);
    else if (event.pointerId === drag.id) {
      const distance = drag.x - event.clientX;
      if (Math.abs(distance) > .5) scrollDirection = Math.sign(distance);
      moveBy(distance);
      drag.x = event.clientX;
    }
  }

  function pointerLeave() {
    pointer = null;
  }

  function endDrag(event: PointerEvent) {
    if (event.pointerId !== drag?.id) return;
    drag = null;
    dragging.value = false;
    if (event.type === 'pointerup') updatePointer(event);
  }

  function keydown(event: KeyboardEvent) {
    if (!ready.value || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    scrollDirection = event.key === 'ArrowLeft' ? -1 : 1;
    moveBy(stride * scrollDirection);
  }

  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && !requested) void loadImages();
    if (inView) resize();
    sync();
  });
  const sizing = new ResizeObserver(resize);
  visibility.observe(canvas);
  sizing.observe(canvas);
  canvas.addEventListener('pointerdown', startDrag);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('keydown', keydown);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  dispose = () => {
    alive = false;
    cancelAnimationFrame(frame);
    visibility.disconnect();
    sizing.disconnect();
    canvas.removeEventListener('pointerdown', startDrag);
    canvas.removeEventListener('pointermove', pointerMove);
    canvas.removeEventListener('pointerleave', pointerLeave);
    canvas.removeEventListener('pointerup', endDrag);
    canvas.removeEventListener('pointercancel', endDrag);
    canvas.removeEventListener('lostpointercapture', endDrag);
    canvas.removeEventListener('keydown', keydown);
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
  };
});

onUnmounted(() => dispose?.());
</script>

<template>
  <div class="auth-gallery" :data-ready="ready">
    <canvas
      ref="surface" class="auth-gallery-canvas" :class="{ 'is-dragging': dragging }" :hidden="failed"
      :tabindex="ready ? 0 : -1" role="group" aria-label="风景图片画廊，可拖动或用左右方向键浏览"
    ></canvas>
    <div v-if="failed" class="auth-gallery-fallback">
      <img v-for="photo in photos" :key="photo.src" :src="photo.src" :alt="photo.alt" loading="lazy">
    </div>
  </div>
</template>
