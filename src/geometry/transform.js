export function toScreen(point, viewport) {
  return {
    x: viewport.centerX + point.x * viewport.scale,
    y: viewport.baseY - point.y * viewport.scale
  };
}

export function mapPointsToScreen(points, viewport) {
  return Object.fromEntries(
    Object.entries(points).map(([name, point]) => [name, toScreen(point, viewport)])
  );
}
