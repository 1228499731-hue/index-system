import test from "node:test";
import assert from "node:assert/strict";
import { greekCrossSquareLoyd as caseSpec } from "../src/cases/greek-cross-square-loyd.js";
import { mapPointsToScreen } from "../src/geometry/transform.js";
import { buildInitialGeometry, getPlanarFrame } from "../src/motion/planar-chain.js";
import { validateRigidFrame } from "../src/geometry/validation.js";
import { distance } from "../src/geometry/vector.js";

const screenPoints = mapPointsToScreen(caseSpec.geometry.points, caseSpec.viewport);
const initial = buildInitialGeometry(caseSpec, screenPoints);
const closePoint = (left, right, tolerance = 1e-7) => {
  assert.ok(distance(left, right) <= tolerance, `${JSON.stringify(left)} != ${JSON.stringify(right)}`);
};

test("Loyd 正式案例保留经验证的割线与三铰链开链", () => {
  assert.deepEqual(caseSpec.challenges.cuts.answerIds, ["H3-H1", "H2-H4"]);
  assert.deepEqual(caseSpec.challenges.hinges.answerIds, ["H1", "H2", "H3"]);
  assert.deepEqual(caseSpec.challenges.hinges.chain.map(item => item.pieces), [
    ["pieceA", "pieceB"],
    ["pieceA", "pieceD"],
    ["pieceD", "pieceC"]
  ]);
});

test("Loyd 正式屏幕求解器全程保持刚体与铰点", () => {
  for (let step = 0; step <= 20; step += 1) {
    const frame = getPlanarFrame(caseSpec, screenPoints, step / 20);
    assert.equal(validateRigidFrame(initial, frame.geometry).valid, true);
    closePoint(frame.geometry.pieceA[5], frame.geometry.pieceB[1]);
    closePoint(frame.geometry.pieceA[1], frame.geometry.pieceD[5]);
    closePoint(frame.geometry.pieceD[1], frame.geometry.pieceC[5]);
    closePoint(frame.hinges.H1, frame.geometry.pieceA[5]);
    closePoint(frame.hinges.H2, frame.geometry.pieceA[1]);
    closePoint(frame.hinges.H3, frame.geometry.pieceD[1]);
  }
});

test("Loyd 正式求解器终态外包框为正方形", () => {
  const allPoints = Object.values(getPlanarFrame(caseSpec, screenPoints, 1).geometry).flat();
  const width = Math.max(...allPoints.map(point => point.x)) - Math.min(...allPoints.map(point => point.x));
  const height = Math.max(...allPoints.map(point => point.y)) - Math.min(...allPoints.map(point => point.y));
  assert.ok(Math.abs(width - height) < 1e-7);
});
