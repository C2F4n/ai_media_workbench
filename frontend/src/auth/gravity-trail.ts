import { galleryPhotos } from './gallery-photos';

type Sample = { x: number; y: number; time: number };
type Velocity = { x: number; y: number };

const gravity = 1280;
const velocityTransfer = .72;
const maxLaunchSpeed = 1280;
const maxCards = 26;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const sample = (event: PointerEvent): Sample => ({ x: event.clientX, y: event.clientY, time: event.timeStamp });

export function createGravityTrail(layer: HTMLElement, reducedMotion: MediaQueryList) {
  const falling = new Map<HTMLImageElement, Animation>();
  const velocity: Velocity = { x: 0, y: 0 };
  let previous: Sample | undefined;
  let lastDrop: Sample | undefined;
  let photoIndex = 0;

  function clear() {
    for (const [card, animation] of falling) {
      animation.cancel();
      card.remove();
    }
    falling.clear();
  }

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) clear();
  });

  function drop(point: Sample, velocity: Velocity) {
    const { clientWidth, clientHeight } = layer;
    if (!clientWidth || !clientHeight || point.x < 0 || point.x > clientWidth || point.y < 0 || point.y > clientHeight) return;
    if (falling.size >= maxCards) {
      const oldest = falling.keys().next().value!;
      falling.get(oldest)?.cancel();
      falling.delete(oldest);
      oldest.remove();
    }

    const width = clamp(clientWidth * .104, 68, 130);
    const height = width * 1.25;
    // 按合速度限制甩出力度，让横向和纵向分量保持同一个方向比例。
    const speed = Math.hypot(velocity.x, velocity.y) * velocityTransfer;
    const transfer = velocityTransfer / Math.hypot(1, speed / maxLaunchSpeed);
    const vx = velocity.x * transfer;
    const vy = velocity.y * transfer;
    const angle = (Math.random() - .5) * 41;
    const spin = vx * .1 + (Math.random() - .5) * 95;
    const travel = clientHeight - point.y + height;
    const duration = (Math.sqrt(vy * vy + 2 * gravity * travel) - vy) / gravity;

    const card = new Image();
    card.src = galleryPhotos[photoIndex].src;
    photoIndex = (photoIndex + 1) % galleryPhotos.length;
    card.alt = '';
    card.decoding = 'async';
    card.draggable = false;
    card.style.left = `${point.x - width / 2}px`;
    card.style.top = `${point.y - height / 2}px`;
    card.style.width = `${width}px`;
    card.style.height = `${height}px`;
    layer.append(card);

    // 同一套轨迹同时保留指针抛出的速度和不断增加的下落速度。
    const steps = Math.ceil(duration * 24);
    const frames = Array.from({ length: steps + 1 }, (_, index) => {
      const t = duration * index / steps;
      return {
        transform: `translate3d(${vx * t}px, ${vy * t + gravity * t * t / 2}px, 0) rotate(${angle + spin * t}deg)`
      };
    });
    const animation = card.animate(frames, { duration: duration * 1000, fill: 'backwards' });
    falling.set(card, animation);
    animation.onfinish = () => {
      falling.delete(card);
      card.remove();
    };
  }

  return {
    start(event: PointerEvent) {
      previous = sample(event);
      lastDrop = undefined;
      velocity.x = velocity.y = 0;
    },
    move(event: PointerEvent) {
      if (reducedMotion.matches || !previous) return;
      const point = sample(event);
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      if (Math.hypot(dx, dy) < 1) return;
      const elapsed = Math.max(6, point.time - previous.time);
      const weight = 1 - Math.exp(-elapsed / 18);
      velocity.x += (dx * 1000 / elapsed - velocity.x) * weight;
      velocity.y += (dy * 1000 / elapsed - velocity.y) * weight;
      previous = point;
      if (lastDrop) {
        const time = point.time - lastDrop.time;
        const distance = Math.hypot(point.x - lastDrop.x, point.y - lastDrop.y);
        if (time < 44 || (time < 96 && distance < 32)) return;
      }
      drop(point, velocity);
      lastDrop = point;
    },
    end() {
      previous = undefined;
      lastDrop = undefined;
    }
  };
}
