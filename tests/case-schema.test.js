import test from "node:test";
import assert from "node:assert/strict";
import { caseRegistry } from "../src/cases/registry.js";
import { dudeneyTriangleSquare } from "../src/cases/dudeney-triangle-square.js";
import { greekCrossSquareLoyd } from "../src/cases/greek-cross-square-loyd.js";
import { hexagonSquare } from "../src/cases/hexagon-square.js";
import { hexagonTriangle } from "../src/cases/hexagon-triangle.js";
import { triangleTwoHexagons } from "../src/cases/triangle-two-hexagons.js";
import { validateCaseDefinition } from "../src/geometry/validation.js";

test("案例注册表包含七个目标案例，且只启用五个已验证案例", () => {
  assert.equal(caseRegistry.length, 7);
  assert.deepEqual(
    caseRegistry.filter(item => item.status === "implemented").map(item => item.id),
    ["dudeney-triangle-square", "greek-cross-square-loyd", "hexagon-square", "hexagon-triangle", "triangle-two-hexagons"]
  );
  assert.ok(caseRegistry.some(item => item.motionType === "planar-swing"));
  assert.ok(caseRegistry.some(item => item.motionType === "flip-assisted"));
});

test("五个已实现案例均通过结构与面积验证", () => {
  for (const caseSpec of [dudeneyTriangleSquare, greekCrossSquareLoyd, hexagonSquare, hexagonTriangle, triangleTwoHexagons]) {
    const result = validateCaseDefinition(caseSpec);
    assert.equal(result.valid, true, `${caseSpec.id}: ${result.errors.join("\n")}`);
    assert.ok(Math.abs(result.sourceArea - result.piecesArea) < 1e-12);
  }
});
