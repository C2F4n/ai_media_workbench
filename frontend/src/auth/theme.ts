import { dockTileTransform } from '../dock-motion';
import { createGravityTrail } from './gravity-trail';

const positionKey = 'amw-auth-theme-split';
export const authPhoneOnlyQuery = '(max-width: 600px), (pointer: coarse) and (max-height: 600px)';

export function mountAuthTheme(auth: HTMLElement) {
  const slider = auth.querySelector<HTMLElement>('.auth-theme-slider')!;
  const tile = slider.querySelector<HTMLElement>('.auth-dock-tile')!;
  const follower = slider.querySelector<HTMLElement>('.auth-theme-follower')!;
  const hint = follower.querySelector<HTMLElement>('#auth-theme-hint')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const phoneOnly = matchMedia(authPhoneOnlyQuery);
  const gravityTrail = createGravityTrail(auth.querySelector<HTMLElement>('.auth-theme-gravity')!, reducedMotion);
  const canSplit = CSS.supports('backdrop-filter', 'invert(1)') || CSS.supports('-webkit-backdrop-filter', 'invert(1)');
  let rememberedPosition = readPosition();
  let position = rememberedPosition;
  let drag: { id: number; startX: number; startPosition: number } | null = null;

  function readPosition() {
    try {
      const stored = localStorage.getItem(positionKey);
      if (stored?.trim()) {
        const value = Number(stored);
        if (Number.isFinite(value) && value >= 0 && value <= 100) return value;
      }
    } catch { /* 使用默认位置。 */ }
    return 100;
  }

  function rememberPosition() {
    rememberedPosition = position;
    try { localStorage.setItem(positionKey, String(position)); } catch { /* 当前页面继续保留位置。 */ }
  }

  function draw(value: number) {
    position = Math.max(0, Math.min(100, Math.round(value * 10) / 10));
    auth.style.setProperty('--auth-theme-split', `${position}%`);
    slider.setAttribute('aria-valuenow', String(Math.round(position)));
    slider.setAttribute('aria-valuetext', position === 0 ? '全暗色' : position === 100 ? '全亮色' : `左侧亮色 ${Math.round(position)}%，右侧暗色`);
    if (slider.matches(':focus-visible') && !drag) centerHint();
    auth.dataset.theme = (!canSplit || phoneOnly.matches) && position < 50 ? 'dark' : 'light';
  }

  function follow(event: PointerEvent) {
    if (event.pointerId !== drag?.id) return;
    const width = auth.clientWidth;
    if (!width) return;
    if (event.clientX <= 4) draw(0);
    else if (event.clientX >= width - 4) draw(100);
    else draw(drag.startPosition + (event.clientX - drag.startX) / width * 100);
  }

  function placeHint(bounds: DOMRect, x: number, y: number) {
    follower.style.transform = `translate(${x - bounds.left}px, ${y - bounds.top}px)`;
    follower.classList.toggle('is-right', x + hint.offsetWidth + 24 > document.documentElement.clientWidth);
    follower.classList.toggle('is-below', y < 64);
  }

  function centerHint() {
    const bounds = slider.getBoundingClientRect();
    placeHint(bounds, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
  }

  function clearHover() {
    slider.classList.remove('is-hovering');
    tile.style.removeProperty('transform');
    if (slider.matches(':focus-visible')) centerHint();
  }

  function hover(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || drag) return;
    const bounds = slider.getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return;
    slider.classList.add('is-hovering');
    if (!reducedMotion.matches) {
      const dx = x - bounds.left - bounds.width / 2;
      const dy = y - bounds.top - bounds.height / 2;
      tile.style.transform = dockTileTransform(dx, dy);
    }
    placeHint(bounds, x, y);
  }

  slider.addEventListener('focus', centerHint);
  slider.addEventListener('pointerenter', hover);
  slider.addEventListener('pointerleave', clearHover);
  reducedMotion.addEventListener('change', () => tile.style.removeProperty('transform'));
  slider.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    // 拖动时保留表单焦点，装饰层本身不接收事件。
    if (event.pointerType === 'mouse') event.preventDefault();
    drag = { id: event.pointerId, startX: event.clientX, startPosition: position };
    slider.setPointerCapture(event.pointerId);
    slider.classList.add('is-dragging');
    clearHover();
    gravityTrail.start(event);
  });
  slider.addEventListener('pointermove', event => {
    if (!drag) hover(event);
    else if (event.pointerId === drag.id) {
      follow(event);
      gravityTrail.move(event);
    }
  });
  slider.addEventListener('pointerup', event => {
    if (event.pointerId !== drag?.id) return;
    follow(event);
    drag = null;
    gravityTrail.end();
    slider.classList.remove('is-dragging');
    rememberPosition();
    hover(event);
  });

  function cancel(event: PointerEvent) {
    if (event.pointerId !== drag?.id) return;
    drag = null;
    gravityTrail.end();
    slider.classList.remove('is-dragging');
    draw(rememberedPosition);
  }
  slider.addEventListener('pointercancel', cancel);
  slider.addEventListener('lostpointercapture', cancel);

  slider.addEventListener('keydown', event => {
    let next: number;
    switch (event.key) {
      case 'ArrowLeft': case 'ArrowDown': next = position - 5; break;
      case 'ArrowRight': case 'ArrowUp': next = position + 5; break;
      case 'Home': next = 0; break;
      case 'End': next = 100; break;
      default: return;
    }
    event.preventDefault();
    draw(next);
    rememberPosition();
  });

  draw(rememberedPosition);
  phoneOnly.addEventListener('change', () => draw(position));
  window.addEventListener('storage', event => {
    if (event.key !== positionKey && event.key !== null) return;
    rememberedPosition = readPosition();
    if (!drag) draw(rememberedPosition);
  });
  return () => {
    const pointerId = drag?.id;
    drag = null;
    if (pointerId !== undefined && slider.hasPointerCapture(pointerId)) slider.releasePointerCapture(pointerId);
    gravityTrail.end();
    slider.classList.remove('is-dragging');
    clearHover();
    draw(rememberedPosition);
  };
}
