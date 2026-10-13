import test from "node:test";
import assert from "node:assert/strict";
import { area } from "../src/geometry/polygon.js";
import { polygonIntersectionArea, validatePolygonCoverage } from "../src/geometry/coverage.js";
import { validateRigidFrame } from "../src/geometry/validation.js";
import { triangleTwoHexagonsResearch as model, sampleTriangleTwoHexagons as sample } from "../src/cases/research/triangle-two-hexagons.js";

const TOLERANCE = 2e-8;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test("triangle-two-hexagons: exact area conservation", () => {
  const sourceArea = area(model.sourceOutline);
  const pieceArea = Object.values(model.initialGeometry).reduce((sum, polygon) => sum + area(polygon), 0);
  const targetArea = Object.values(model.targetOutlines).reduce((sum, polygon) => sum + area(polygon), 0);
  assert.ok(Math.abs(sourceArea - Math.sqrt(3)) < TOLERANCE);
  assert.ok(Math.abs(pieceArea - sourceArea) < TOLERANCE);
  assert.ok(Math.abs(targetArea - sourceArea) < TOLERANCE);
});

test("triangle-two-hexagons: initial pieces cover the equilateral triangle", () => {
  const result = validatePolygonCoverage(sample(0).geometry, model.sourceOutline, TOLERANCE);
  assert.equal(result.valid, true, JSON.stringify(result));
});

test("triangle-two-hexagons: final pieces cover two regular hexagons", () => {
  const geometry = sample(1).geometry;
  for (const [targetId, pieceIds] of Object.entries(model.targetGroups)) {
    const pieces = Object.fromEntries(pieceIds.map(id => [id, geometry[id]]));
    const result = validatePolygonCoverage(pieces, model.targetOutlines[targetId], TOLERANCE);
    assert.equal(result.valid, true, `${targetId}: ${JSON.stringify(result)}`);
  }
});

test("triangle-two-hexagons: all pieces remain rigid", () => {
  for (let step = 0; step <= 100; step += 1) {
    const result = validateRigidFrame(model.initialGeometry, sample(step / 100).geometry, TOLERANCE);
    assert.equal(result.valid, true, `t=${step / 100}: ${result.errors.join("; ")}`);
  }
});

test("triangle-two-hexagons: all five hinges remain coincident", () => {
  for (let step = 0; step <= 100; step += 1) {
    for (const [id, [first, second]] of Object.entries(sample(step / 100).hinges)) {
      assert.ok(distance(first, second) < TOLERANCE, `${id} breaks at t=${step / 100}`);
    }
  }
});

test("triangle-two-hexagons: sampled two-stage motion is continuous", () => {
  let previous = sample(0).geometry;
  for (let step = 1; step <= 1000; step += 1) {
    const current = sample(step / 1000).geometry;
    let jump = 0;
    for (const id of Object.keys(current)) current[id].forEach((value, index) => { jump = Math.max(jump, distance(value, previous[id][index])); });
    assert.ok(jump < 0.02, `t=${step / 1000}: jump=${jump}`);
    previous = current;
  }
});

test("triangle-two-hexagons: sampled path has no positive-area collisions", () => {
  for (let step = 0; step <= 100; step += 1) {
    const geometry = sample(step / 100).geometry;
    const ids = Object.keys(geometry);
    for (let first = 0; first < ids.length; first += 1) {
      for (let second = first + 1; second < ids.length; second += 1) {
        const overlap = polygonIntersectionArea(geometry[ids[first]], geometry[ids[second]], TOLERANCE);
        assert.ok(overlap < TOLERANCE, `${ids[first]}/${ids[second]} overlap at t=${step / 100}: ${overlap}`);
      }
    }
  }
});
