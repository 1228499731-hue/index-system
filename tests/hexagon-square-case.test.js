import test from "node:test";
import assert from "node:assert/strict";
import { hexagonSquare } from "../src/cases/hexagon-square.js";
import { mapPointsToScreen } from "../src/geometry/transform.js";
import { validateCaseDefinition, validateRigidFrame } from "../src/geometry/validation.js";
import { getPlanarFrame } from "../src/motion/planar-chain.js";

const TOLERANCE = 1e-6;
const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);
const screenPoints = mapPointsToScreen(hexagonSquare.geometry.points, hexagonSquare.viewport);

test("hexagon-square formal case exposes the verified 10-piece, 9-hinge chain", () => {
  const result = validateCaseDefinition(hexagonSquare);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(hexagonSquare.geometry.pieces.length, 10);
  assert.equal(hexagonSquare.challenges.cuts.answerIds.length, 9);
  assert.equal(hexagonSquare.challenges.hinges.chain.length, 9);
  assert.equal(hexagonSquare.motion.collisionPolicy, "wobbly-overlap-allowed");
});

test("hexagon-square formal screen solver preserves rigidity and hinges", () => {
  const initial = getPlanarFrame(hexagonSquare, screenPoints, 0).geometry;
  for (let step = 0; step <= 100; step += 1) {
    const frame = getPlanarFrame(hexagonSquare, screenPoints, step / 100);
    const rigid = validateRigidFrame(initial, frame.geometry, TOLERANCE);
    assert.equal(rigid.valid, true, `t=${step / 100}: ${rigid.errors.join("; ")}`);
    assert.equal(Object.keys(frame.hinges).length, 9);
  }
});

test("hexagon-square formal solver ends in a square", () => {
  const points = Object.values(getPlanarFrame(hexagonSquare, screenPoints, 1).geometry).flat();
  const width = Math.max(...points.map(value => value.x)) - Math.min(...points.map(value => value.x));
  const height = Math.max(...points.map(value => value.y)) - Math.min(...points.map(value => value.y));
  assert.ok(Math.abs(width - height) < TOLERANCE);

  for (const value of Object.values(getPlanarFrame(hexagonSquare, screenPoints, 1).hinges)) {
    assert.ok(Number.isFinite(value.x) && Number.isFinite(value.y));
  }
  assert.ok(distance({ x: width, y: 0 }, { x: height, y: 0 }) < TOLERANCE);
});
