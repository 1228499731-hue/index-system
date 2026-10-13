import test from "node:test";
import assert from "node:assert/strict";
import { area } from "../src/geometry/polygon.js";
import { validatePolygonCoverage } from "../src/geometry/coverage.js";
import { validateRigidFrame } from "../src/geometry/validation.js";
import {
  hexagonSquareResearch,
  sampleHexagonSquare
} from "../src/cases/research/hexagon-square.js";

const TOLERANCE = 1e-7;
const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

test("hexagon-square: exact area conservation", () => {
  const expected = 3 * Math.sqrt(3) / 2;
  const piecesArea = Object.values(hexagonSquareResearch.initialGeometry)
    .reduce((sum, polygon) => sum + area(polygon), 0);
  assert.ok(Math.abs(area(hexagonSquareResearch.sourceOutline) - expected) < TOLERANCE);
  assert.ok(Math.abs(area(hexagonSquareResearch.targetOutline) - expected) < TOLERANCE);
  assert.ok(Math.abs(piecesArea - expected) < TOLERANCE);
});

test("hexagon-square: initial pieces cover the regular hexagon", () => {
  const result = validatePolygonCoverage(
    sampleHexagonSquare(0).geometry,
    hexagonSquareResearch.sourceOutline
  );
  assert.equal(result.valid, true, JSON.stringify(result));
});

test("hexagon-square: final pieces cover the equal-area square", () => {
  const result = validatePolygonCoverage(
    sampleHexagonSquare(1).geometry,
    hexagonSquareResearch.targetOutline
  );
  assert.equal(result.valid, true, JSON.stringify(result));
});

test("hexagon-square: every sample preserves all rigid pieces", () => {
  for (let step = 0; step <= 100; step += 1) {
    const result = validateRigidFrame(
      hexagonSquareResearch.initialGeometry,
      sampleHexagonSquare(step / 100).geometry,
      TOLERANCE
    );
    assert.equal(result.valid, true, `t=${step / 100}: ${result.errors.join("; ")}`);
  }
});

test("hexagon-square: all nine open-chain hinges remain coincident", () => {
  for (let step = 0; step <= 100; step += 1) {
    for (const [hingeId, [first, second]] of Object.entries(sampleHexagonSquare(step / 100).hinges)) {
      assert.ok(distance(first, second) < TOLERANCE, `${hingeId} breaks at t=${step / 100}`);
    }
  }
});

test("hexagon-square: the removed cycle hinge closes at both endpoints", () => {
  for (const progress of [0, 1]) {
    const [first, second] = sampleHexagonSquare(progress).splitClosure;
    assert.ok(distance(first, second) < TOLERANCE, `split closure does not meet at t=${progress}`);
  }
});

test("hexagon-square: sampled joint-angle motion is continuous", () => {
  let previous = sampleHexagonSquare(0).geometry;
  for (let step = 1; step <= 1000; step += 1) {
    const progress = step / 1000;
    const current = sampleHexagonSquare(progress).geometry;
    let maximumVertexStep = 0;
    for (const pieceId of Object.keys(current)) {
      current[pieceId].forEach((value, index) => {
        maximumVertexStep = Math.max(maximumVertexStep, distance(value, previous[pieceId][index]));
      });
    }
    assert.ok(maximumVertexStep < 0.06, `t=${progress}: jump=${maximumVertexStep}`);
    previous = current;
  }
});
