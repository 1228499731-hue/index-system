import test from "node:test";
import assert from "node:assert/strict";
import { caseRegistry } from "../src/cases/registry.js";
import { dudeneyTriangleSquare } from "../src/cases/dudeney-triangle-square.js";
import { validateCaseDefinition } from "../src/geometry/validation.js";

test("案例注册表包含六个目标案例，且只有已验证案例可用", () => {
  assert.equal(caseRegistry.length, 6);
  assert.deepEqual(
    caseRegistry.filter(item => item.status === "implemented").map(item => item.id),
    ["dudeney-triangle-square"]
  );
  assert.ok(caseRegistry.some(item => item.motionType === "planar-swing"));
  assert.ok(caseRegistry.some(item => item.motionType === "flip-assisted"));
});

test("现有案例通过结构与面积验证", () => {
  const result = validateCaseDefinition(dudeneyTriangleSquare);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.ok(Math.abs(result.sourceArea - result.piecesArea) < 1e-12);
});
