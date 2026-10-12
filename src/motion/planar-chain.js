import { clonePoint, rotatePoint, smoothstep } from "../geometry/vector.js";

export function buildInitialGeometry(caseSpec, screenPoints) {
  return Object.fromEntries(
    caseSpec.geometry.pieces.map(piece => [
      piece.id,
      piece.pointIds.map(pointId => clonePoint(screenPoints[pointId]))
    ])
  );
}

export function dudeneyTriangleSquareFrame(caseSpec, screenPoints, progress) {
  const initial = buildInitialGeometry(caseSpec, screenPoints);
  const easedProgress = smoothstep(progress);
  const angleD = -Math.PI * easedProgress;
  const angleE = Math.PI * easedProgress;
  const angleK = Math.PI * easedProgress;

  const piece1 = initial.piece1.map(point => rotatePoint(point, screenPoints.D, angleD));
  const piece2 = initial.piece2.map(clonePoint);
  const piece4 = initial.piece4.map(point => rotatePoint(point, screenPoints.E, angleE));
  const movedK = rotatePoint(screenPoints.K, screenPoints.E, angleE);
  const totalAnglePiece3 = angleE + angleK;
  const piece3 = initial.piece3.map(point => {
    const relative = { x: point.x - screenPoints.K.x, y: point.y - screenPoints.K.y };
    const cosine = Math.cos(totalAnglePiece3);
    const sine = Math.sin(totalAnglePiece3);
    return {
      x: movedK.x + relative.x * cosine - relative.y * sine,
      y: movedK.y + relative.x * sine + relative.y * cosine
    };
  });

  return {
    geometry: { piece1, piece2, piece3, piece4 },
    hinges: {
      D: clonePoint(screenPoints.D),
      E: clonePoint(screenPoints.E),
      K: clonePoint(movedK)
    }
  };
}

export function getPlanarFrame(caseSpec, screenPoints, progress) {
  if (caseSpec.motion.solver === "dudeney-triangle-square") {
    return dudeneyTriangleSquareFrame(caseSpec, screenPoints, progress);
  }
  throw new Error(`未知的平面运动学求解器：${caseSpec.motion.solver}`);
}
