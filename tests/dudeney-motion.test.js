import test from "node:test";
import assert from "node:assert/strict";
import { dudeneyTriangleSquare as caseSpec } from "../src/cases/dudeney-triangle-square.js";
import { mapPointsToScreen } from "../src/geometry/transform.js";
import { buildInitialGeometry, dudeneyTriangleSquareFrame } from "../src/motion/planar-chain.js";
import { validateRigidFrame } from "../src/geometry/validation.js";

const points = mapPointsToScreen(caseSpec.geometry.points, caseSpec.viewport);
const initial = buildInitialGeometry(caseSpec, points);
const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const samePoint = (a, b) => { close(a.x, b.x); close(a.y, b.y); };

test("数学点投影保持原显示坐标", () => {
  samePoint(points.A, { x: 500, y: 42.87187078897966 });
  samePoint(points.D, { x: 420, y: 181.43593539448983 });
  samePoint(points.K, { x: 620.7212186745987, y: 251.9671550850174 });
  samePoint(points.M, { x: 517.4227639143521, y: 231.606545747718 });
});

test("运动轨迹关键采样点保持兼容", () => {
  const samples = [
    [0, 500, 540.7212186745987, 620.7212186745987],
    [0.25, 425.2350532514842, 709.3032613321286, 638.5370708970884],
    [0.5, 281.43593539448983, 648.0328449149827, 568.0328449149827],
    [0.75, 284.1276509557473, 265.946423564559, 425.6038512827356],
    [1, 340, 299.2787813254012, 379.27878132540127]
  ];
  samples.forEach(([progress, piece1Ax, piece3Jx, movedKx]) => {
    const frame = dudeneyTriangleSquareFrame(caseSpec, points, progress);
    close(frame.geometry.piece1[0].x, piece1Ax);
    close(frame.geometry.piece3[0].x, piece3Jx);
    close(frame.hinges.K.x, movedKx);
  });
});

test("每个采样帧保持刚体与铰点连续", () => {
  for (let progress = 0; progress <= 1; progress += 0.05) {
    const frame = dudeneyTriangleSquareFrame(caseSpec, points, progress);
    assert.equal(validateRigidFrame(initial, frame.geometry).valid, true);
    samePoint(frame.geometry.piece1[1], frame.geometry.piece2[0]);
    samePoint(frame.geometry.piece2[2], frame.geometry.piece4[2]);
    samePoint(frame.geometry.piece4[0], frame.geometry.piece3[1]);
  }
});

test("终点外包框为正方形", () => {
  const frame = dudeneyTriangleSquareFrame(caseSpec, points, 1);
  const allPoints = Object.values(frame.geometry).flat();
  const width = Math.max(...allPoints.map(point => point.x)) - Math.min(...allPoints.map(point => point.x));
  const height = Math.max(...allPoints.map(point => point.y)) - Math.min(...allPoints.map(point => point.y));
  close(width, height);
});
