import test from "node:test";
import assert from "node:assert/strict";
import { area } from "../src/geometry/polygon.js";
import {
  polygonIntersectionArea,
  validatePolygonCoverage
} from "../src/geometry/coverage.js";
import { validateRigidFrame } from "../src/geometry/validation.js";
import {
  greekCrossSquareResearch,
  sampleGreekCrossSquare
} from "../src/cases/research/greek-cross-square.js";

const TOLERANCE = 1e-7;
const MODEL_IDS = ["lemon", "loyd"];

function distance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

for (const modelId of MODEL_IDS) {
  const model = greekCrossSquareResearch.models[modelId];

  test(`${model.name}: 面积守恒`, () => {
    const piecesArea = Object.values(model.initialGeometry)
      .reduce((sum, polygon) => sum + area(polygon), 0);
    assert.ok(Math.abs(area(model.sourceOutline) - 5) < TOLERANCE);
    assert.ok(Math.abs(area(model.targetOutline) - 5) < TOLERANCE);
    assert.ok(Math.abs(piecesArea - 5) < TOLERANCE);
  });

  test(`${model.name}: 初始分块无重叠、无越界并覆盖希腊十字形`, () => {
    const result = validatePolygonCoverage(
      sampleGreekCrossSquare(modelId, 0).geometry,
      model.sourceOutline
    );
    assert.equal(result.valid, true, JSON.stringify(result));
  });

  test(`${model.name}: 终止分块无重叠、无越界并覆盖正方形`, () => {
    const result = validatePolygonCoverage(
      sampleGreekCrossSquare(modelId, 1).geometry,
      model.targetOutline
    );
    assert.equal(result.valid, true, JSON.stringify(result));
  });

  test(`${model.name}: 全路径保持刚体形状与面积`, () => {
    for (let step = 0; step <= 100; step += 1) {
      const frame = sampleGreekCrossSquare(modelId, step / 100).geometry;
      const result = validateRigidFrame(model.initialGeometry, frame, TOLERANCE);
      assert.equal(result.valid, true, `t=${step / 100}: ${result.errors.join("; ")}`);
    }
  });

  test(`${model.name}: 全路径保持三个铰链约束`, () => {
    for (let step = 0; step <= 100; step += 1) {
      const frame = sampleGreekCrossSquare(modelId, step / 100);
      for (const [hingeId, [first, second]] of Object.entries(frame.hinges)) {
        assert.ok(
          distance(first, second) < TOLERANCE,
          `${hingeId} 在 t=${step / 100} 断开`
        );
      }
    }
  });

  test(`${model.name}: 分段运动路径中拼块无正面积重叠`, () => {
    for (let step = 0; step <= 100; step += 1) {
      const polygons = Object.values(sampleGreekCrossSquare(modelId, step / 100).geometry);
      for (let first = 0; first < polygons.length; first += 1) {
        for (let second = first + 1; second < polygons.length; second += 1) {
          assert.ok(
            polygonIntersectionArea(polygons[first], polygons[second]) < TOLERANCE,
            `t=${step / 100}: pieces ${first} and ${second} overlap`
          );
        }
      }
    }
  });

  test(`${model.name}: 分段转角路径位置连续`, () => {
    let previous = sampleGreekCrossSquare(modelId, 0).geometry;
    for (let step = 1; step <= 1000; step += 1) {
      const progress = step / 1000;
      const current = sampleGreekCrossSquare(modelId, progress).geometry;
      let maximumVertexStep = 0;
      for (const pieceId of Object.keys(current)) {
        current[pieceId].forEach((point, index) => {
          maximumVertexStep = Math.max(
            maximumVertexStep,
            distance(point, previous[pieceId][index])
          );
        });
      }
      assert.ok(maximumVertexStep < 0.03, `t=${progress}: jump=${maximumVertexStep}`);
      previous = current;
    }

    const before = sampleGreekCrossSquare(modelId, 0.5 - 1e-8).geometry;
    const after = sampleGreekCrossSquare(modelId, 0.5 + 1e-8).geometry;
    for (const pieceId of Object.keys(before)) {
      before[pieceId].forEach((point, index) => {
        assert.ok(distance(point, after[pieceId][index]) < 1e-6);
      });
    }
  });
}

