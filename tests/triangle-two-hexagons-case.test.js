import test from "node:test";
import assert from "node:assert/strict";
import { triangleTwoHexagons } from "../src/cases/triangle-two-hexagons.js";
import { mapPointsToScreen } from "../src/geometry/transform.js";
import { validateCaseDefinition, validateRigidFrame } from "../src/geometry/validation.js";
import { getPlanarFrame } from "../src/motion/planar-chain.js";

const points = mapPointsToScreen(triangleTwoHexagons.geometry.points, triangleTwoHexagons.viewport);

test("triangle-two-hexagons formal case exposes the verified six-piece hinge tree", () => {
  const result = validateCaseDefinition(triangleTwoHexagons);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(triangleTwoHexagons.motionType, "planar-swing");
  assert.equal(triangleTwoHexagons.geometry.pieces.length, 6);
  assert.equal(triangleTwoHexagons.challenges.hinges.chain.length, 5);
});

test("triangle-two-hexagons formal screen solver preserves rigidity and hinges", () => {
  const initial = getPlanarFrame(triangleTwoHexagons, points, 0).geometry;
  for (let step = 0; step <= 100; step += 1) {
    const frame = getPlanarFrame(triangleTwoHexagons, points, step / 100);
    assert.equal(validateRigidFrame(initial, frame.geometry, 1e-5).valid, true);
    assert.equal(Object.keys(frame.hinges).length, 5);
  }
});
