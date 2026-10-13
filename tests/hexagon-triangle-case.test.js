import test from "node:test";
import assert from "node:assert/strict";
import { hexagonTriangle } from "../src/cases/hexagon-triangle.js";
import { mapPointsToScreen } from "../src/geometry/transform.js";
import { validateCaseDefinition, validateRigidFrame } from "../src/geometry/validation.js";
import { getPlanarFrame } from "../src/motion/planar-chain.js";

const points = mapPointsToScreen(hexagonTriangle.geometry.points, hexagonTriangle.viewport);

test("hexagon-triangle formal case is a verified planar 9-piece chain", () => {
  const result = validateCaseDefinition(hexagonTriangle);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(hexagonTriangle.motionType, "planar-swing");
  assert.equal(hexagonTriangle.geometry.pieces.length, 9);
  assert.equal(hexagonTriangle.challenges.hinges.chain.length, 8);
});

test("hexagon-triangle formal solver preserves screen-space rigidity and hinges", () => {
  const initial = getPlanarFrame(hexagonTriangle, points, 0).geometry;
  for (let step = 0; step <= 100; step += 1) {
    const frame = getPlanarFrame(hexagonTriangle, points, step / 100);
    assert.equal(validateRigidFrame(initial, frame.geometry, 1e-5).valid, true);
    assert.equal(Object.keys(frame.hinges).length, 8);
  }
});
