export function dockTileTransform(dx: number, dy: number, strength = 1, range = 100) {
  const closeness = Math.max(0, 1 - Math.abs(dx) / range) ** 1.65 * strength;
  const driftX = Math.max(-7, Math.min(7, dx * .23)) * closeness;
  const driftY = Math.max(-5, Math.min(3, dy * .16)) * closeness - 10 * closeness;
  return `translate(${driftX}px, ${driftY}px) scale(${1 + .72 * closeness})`;
}
