import { clonePoint, rotatePoint, smoothstep } from "../geometry/vector.js";
import { toScreen } from "../geometry/transform.js";
import { sampleGreekCrossSquare } from "../cases/research/greek-cross-square.js";
import { sampleHexagonSquare } from "../cases/research/hexagon-square.js";
import { sampleHexagonTriangle } from "../cases/research/hexagon-triangle.js";
import { sampleTriangleTwoHexagons } from "../cases/research/triangle-two-hexagons.js";

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
  if (caseSpec.motion.solver === "greek-cross-square-loyd") {
    const frame = sampleGreekCrossSquare("loyd", progress);
    return {
      geometry: Object.fromEntries(
        Object.entries(frame.geometry).map(([pieceId, points]) => [
          pieceId,
          points.map(point => toScreen(point, caseSpec.viewport))
        ])
      ),
      hinges: Object.fromEntries(
        Object.entries(frame.hinges).map(([hingeId, [point]]) => [
          caseSpec.motion.hingeMap?.[hingeId] ?? hingeId,
          toScreen(point, caseSpec.viewport)
        ])
      )
    };
  }
  if (caseSpec.motion.solver === "hexagon-square") {
    const frame = sampleHexagonSquare(progress);
    return {
      geometry: Object.fromEntries(
        Object.entries(frame.geometry).map(([pieceId, points]) => [
          pieceId,
          points.map(point => toScreen(point, caseSpec.viewport))
        ])
      ),
      hinges: Object.fromEntries(
        Object.entries(frame.hinges).map(([hingeId, [point]]) => [
          caseSpec.motion.hingeMap?.[hingeId] ?? hingeId,
          toScreen(point, caseSpec.viewport)
        ])
      )
    };
  }
  if (caseSpec.motion.solver === "hexagon-triangle") {
    const frame = sampleHexagonTriangle(progress);
    return {
      geometry: Object.fromEntries(Object.entries(frame.geometry).map(([pieceId, points]) => [
        pieceId, points.map(point => toScreen(point, caseSpec.viewport))
      ])),
      hinges: Object.fromEntries(Object.entries(frame.hinges).map(([hingeId, [point]]) => [
        caseSpec.motion.hingeMap?.[hingeId] ?? hingeId, toScreen(point, caseSpec.viewport)
      ]))
    };
  }
  if (caseSpec.motion.solver === "triangle-two-hexagons") {
    const frame = sampleTriangleTwoHexagons(progress);
    return {
      geometry: Object.fromEntries(Object.entries(frame.geometry).map(([pieceId, points]) => [
        pieceId, points.map(point => toScreen(point, caseSpec.viewport))
      ])),
      hinges: Object.fromEntries(Object.entries(frame.hinges).map(([hingeId, [point]]) => [
        caseSpec.motion.hingeMap?.[hingeId] ?? hingeId, toScreen(point, caseSpec.viewport)
      ]))
    };
  }
  throw new Error(`未知的平面运动学求解器：${caseSpec.motion.solver}`);
}
