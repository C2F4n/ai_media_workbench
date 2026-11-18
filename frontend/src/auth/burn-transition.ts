type Ember = { x: number; y: number; vx: number; vy: number; born: number; life: number; size: number; ash: boolean };

const duration = 1180;
const className = 'auth-burn-outgoing';

/** Keep the old page in its current viewport position while the new page renders underneath. */
export function burnAuthView(auth: HTMLElement, source: HTMLElement | null, finished: () => void) {
  if (auth.hidden || document.hidden || !CSS.supports('clip-path', 'path(evenodd, "M 0 0 Z")')) return;
  const bounds = auth.getBoundingClientRect();
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  if (!bounds.width || !height || !width) return;

  const fire = document.createElement('canvas');
  const drawing = fire.getContext('2d');
  if (!drawing) return;
  const context = drawing;
  const scale = Math.min(devicePixelRatio || 1, 1.3, Math.sqrt(2_000_000 / (width * height)));
  fire.width = Math.ceil(width * scale);
  fire.height = Math.ceil(height * scale);
  fire.className = 'auth-burn-fire';
  fire.setAttribute('aria-hidden', 'true');
  context.setTransform(fire.width / width, 0, 0, fire.height / height, 0, 0);
  context.lineJoin = context.lineCap = 'round';

  const button = source?.getBoundingClientRect();
  const ignitionX = button?.width ? button.left + button.width / 2 : width * .65;
  const ignitionY = button?.height ? button.top + button.height / 2 : height * .55;
  const x = Math.max(8, Math.min(width - 8, ignitionX));
  const y = Math.max(8, Math.min(height - 8, ignitionY));
  const cornerDistance = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  const endRadius = cornerDistance * 1.16 + 55;
  const pointCount = Math.max(240, Math.min(620, Math.round(cornerDistance * .43)));
  const angles = Array.from({ length: pointCount }, (_, index) => {
    const angle = index * Math.PI * 2 / pointCount;
    return { angle, dx: Math.cos(angle), dy: Math.sin(angle), radius: 0 };
  });
  const embers: Ember[] = [];
  const outer = `M ${-bounds.left} ${-bounds.top} h ${width} v ${height} h ${-width} Z`;
  const previousInert = auth.inert;
  let frame = 0;
  let active = true;
  let lastEmbers = 0;
  let authCovered = true;

  auth.style.setProperty('--burn-top', `${bounds.top}px`);
  auth.style.setProperty('--burn-left', `${bounds.left}px`);
  auth.style.setProperty('--burn-width', `${bounds.width}px`);
  auth.style.setProperty('--burn-height', `${bounds.height}px`);
  auth.classList.add(className);
  auth.inert = true;
  document.body.append(fire);

  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', stop);
    window.removeEventListener('pagehide', stop);
    document.removeEventListener('visibilitychange', stop);
    fire.remove();
    auth.hidden = true;
    auth.inert = previousInert;
    auth.classList.remove(className);
    auth.style.removeProperty('clip-path');
    for (const variable of ['--burn-top', '--burn-left', '--burn-width', '--burn-height']) auth.style.removeProperty(variable);
    finished();
  }

  function trace(outset = 0) {
    context.beginPath();
    for (const [index, point] of angles.entries()) {
      const px = x + point.dx * (point.radius + outset);
      const py = y + point.dy * (point.radius + outset);
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
  }

  function stroke(lineWidth: number, color: string, blur = 0, shadow = color) {
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.shadowBlur = blur;
    context.shadowColor = shadow;
    context.stroke();
    context.shadowBlur = 0;
  }

  function drawFlares(time: number) {
    context.beginPath();
    let connected = false;
    for (const point of angles) {
      const heat = Math.sin(point.angle * 27 + time * 15) + .45 * Math.sin(point.angle * 63 - time * 8);
      if (heat < .3) { connected = false; continue; }
      const px = x + point.dx * (point.radius - .8);
      const py = y + point.dy * (point.radius - .8);
      if (connected) context.lineTo(px, py);
      else context.moveTo(px, py);
      connected = true;
    }
    stroke(3.1, '#fff6ce', 9, '#ffc76e');
  }

  function drawEmbers(elapsed: number) {
    if (elapsed - lastEmbers > 22 && elapsed < duration - 165) {
      lastEmbers = elapsed;
      for (let index = 0; index < 16; index++) {
        const point = angles[Math.floor(Math.random() * angles.length)];
        const px = x + point.dx * point.radius;
        const py = y + point.dy * point.radius;
        if (px < 0 || px > width || py < 0 || py > height) continue;
        const speed = 22 + Math.random() * 95;
        const ash = Math.random() < .44;
        embers.push({
          x: px, y: py, vx: -point.dx * speed + (Math.random() - .5) * 42, vy: -point.dy * speed - 42,
          born: elapsed, life: 150 + Math.random() * 275, size: .7 + Math.random() * (ash ? 3.4 : 2.2), ash
        });
      }
    }
    for (let index = embers.length - 1; index >= 0; index--) {
      const ember = embers[index];
      const age = elapsed - ember.born;
      if (age >= ember.life) { embers.splice(index, 1); continue; }
      const seconds = age / 1000;
      const px = ember.x + ember.vx * seconds;
      const py = ember.y + ember.vy * seconds - 38 * seconds * seconds;
      context.globalAlpha = (1 - age / ember.life) * (ember.ash ? .58 : .92);
      context.fillStyle = ember.ash ? '#3a2a24' : age < 70 ? '#fff0a6' : '#e88633';
      context.fillRect(px, py, ember.size, ember.size * (ember.ash ? .73 : 1));
    }
    context.globalAlpha = 1;
  }

  const start = performance.now();
  function animate(now: number) {
    const elapsed = Math.max(0, now - start);
    if (elapsed >= duration) { stop(); return; }
    context.clearRect(0, 0, width, height);
    const progress = Math.min(1, elapsed / (duration - 85));
    const spread = endRadius * progress ** 1.23;
    const irregularity = Math.min(1, spread / 95);
    const largeWaves = Math.min(68, spread * .12);
    const time = elapsed / 1000;
    let visibleFront = false;

    const points = angles.map(point => {
      const angle = point.angle;
      const waves = Math.sin(angle * 4 + 2.1 + time * .42) * .5 +
        Math.sin(angle * 9 - .9 - time * 1.1) * .3 + Math.sin(angle * 17 + time * 1.8) * .2;
      const tongues = 6.5 * Math.sin(angle * 31 + time * 6) + 3.5 * Math.sin(angle * 59 - time * 5) +
        2 * Math.sin(angle * 91 + time * 4.6) + 1.25 * Math.sin(angle * 115 - time * 7);
      point.radius = Math.max(0, spread + largeWaves * waves + irregularity * tongues);
      const px = x + point.dx * point.radius;
      const py = y + point.dy * point.radius;
      visibleFront ||= px > -70 && px < width + 70 && py > -70 && py < height + 70;
      return `${(px - bounds.left).toFixed(1)} ${(py - bounds.top).toFixed(1)}`;
    });
    if (authCovered) {
      if (spread - largeWaves - 14 > cornerDistance) {
        authCovered = false;
        auth.hidden = true;
      } else {
        auth.style.clipPath = `path(evenodd, "${outer} M ${points.join(' L ')} Z")`;
      }
    }

    if (visibleFront && spread > 2) {
      const strength = Math.min(1, spread / 24);
      context.globalAlpha = strength;
      trace(9);
      stroke(14, '#47312419', 30, '#261b1690');
      trace(5);
      stroke(10, '#321b12a6', 6, '#654023a1');
      trace();
      stroke(9, '#f9772573', 19, '#fa7a29d0');
      stroke(3.7, '#ffa651d6', 7, '#ffb64a');
      stroke(1.5, '#ffe3acd8');
      drawFlares(time);
    }
    drawEmbers(elapsed);
    frame = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', stop);
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', stop);
  frame = requestAnimationFrame(animate);
  return stop;
}
