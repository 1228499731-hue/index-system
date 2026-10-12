export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(point, scalar) {
  return { x: point.x * scalar, y: point.y * scalar };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function projectPointToLine(point, start, end) {
  const direction = subtract(end, start);
  const offset = subtract(point, start);
  const t = dot(offset, direction) / dot(direction, direction);
  return add(start, multiply(direction, t));
}

export function rotatePoint(point, center, angle) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    x: center.x + dx * cosine - dy * sine,
    y: center.y + dx * sine + dy * cosine
  };
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clonePoint(point) {
  return { x: point.x, y: point.y };
}

export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function smoothstep(value) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}
