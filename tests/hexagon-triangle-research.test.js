import test from "node:test";
import assert from "node:assert/strict";
import { area } from "../src/geometry/polygon.js";
import { validatePolygonCoverage } from "../src/geometry/coverage.js";
import { validateRigidFrame } from "../src/geometry/validation.js";
import { hexagonTriangleResearch, sampleHexagonTriangle } from "../src/cases/research/hexagon-triangle.js";

const TOLERANCE = 2e-7;
const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

test("hexagon-triangle: area conservation", () => {
  const expected = 3 * Math.sqrt(3) / 2;
  const piecesArea = Object.values(hexagonTriangleResearch.initialGeometry).reduce((sum, polygon) => sum + area(polygon), 0);
  assert.ok(Math.abs(area(hexagonTriangleResearch.sourceOutline) - expected) < TOLERANCE);
  assert.ok(Math.abs(area(hexagonTriangleResearch.targetOutline) - expected) < TOLERANCE);
  assert.ok(Math.abs(piecesArea - expected) < TOLERANCE);
});

test("hexagon-triangle: initial pieces cover the regular hexagon", () => {
  const result = validatePolygonCoverage(sampleHexagonTriangle(0).geometry, hexagonTriangleResearch.sourceOutline, TOLERANCE);
  assert.equal(result.valid, true, JSON.stringify(result));
});

test("hexagon-triangle: final pieces cover the equilateral triangle", () => {
  const result = validatePolygonCoverage(sampleHexagonTriangle(1).geometry, hexagonTriangleResearch.targetOutline, TOLERANCE);
  assert.equal(result.valid, true, JSON.stringify(result));
});

test("hexagon-triangle: path preserves all nine rigid pieces", () => {
  for (let step = 0; step <= 100; step += 1) {
    const result = validateRigidFrame(hexagonTriangleResearch.initialGeometry, sampleHexagonTriangle(step / 100).geometry, TOLERANCE);
    assert.equal(result.valid, true, `t=${step / 100}: ${result.errors.join("; ")}`);
  }
});

test("hexagon-triangle: all eight hinges remain coincident", () => {
  for (let step = 0; step <= 100; step += 1) {
    for (const [id, [first, second]] of Object.entries(sampleHexagonTriangle(step / 100).hinges)) {
      assert.ok(distance(first, second) < TOLERANCE, `${id} breaks at t=${step / 100}`);
    }
  }
});

test("hexagon-triangle: sampled motion is continuous", () => {
  let previous = sampleHexagonTriangle(0).geometry;
  for (let step = 1; step <= 1000; step += 1) {
    const current = sampleHexagonTriangle(step / 1000).geometry;
    let jump = 0;
    for (const id of Object.keys(current)) current[id].forEach((value, index) => { jump = Math.max(jump, distance(value, previous[id][index])); });
    assert.ok(jump < 0.05, `t=${step / 1000}: jump=${jump}`);
    previous = current;
  }
});
