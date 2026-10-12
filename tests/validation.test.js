import test from "node:test";
import assert from "node:assert/strict";
import { dudeneyTriangleSquare as caseSpec } from "../src/cases/dudeney-triangle-square.js";
import { sameIdSet, validateSelection } from "../src/geometry/validation.js";

test("集合验证与选择顺序无关", () => {
  assert.equal(sameIdSet(["KM", "JE", "DL"], ["JE", "DL", "KM"]), true);
});

test("割线答案严格保持 JE、DL、KM", () => {
  assert.equal(validateSelection(caseSpec, "cuts", new Set(["JE", "DL", "KM"])).valid, true);
  const wrong = validateSelection(caseSpec, "cuts", new Set(["JE", "DL", "DE"]));
  assert.equal(wrong.valid, false);
  assert.equal(wrong.correctCount, 2);
  assert.deepEqual(wrong.wrongIds, ["DE"]);
});

test("铰点答案严格保持 D、E、K", () => {
  assert.equal(validateSelection(caseSpec, "hinges", new Set(["K", "D", "E"])).valid, true);
  assert.equal(validateSelection(caseSpec, "hinges", new Set(["D", "E", "J"])).valid, false);
});
