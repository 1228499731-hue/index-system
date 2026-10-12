import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state/initial-state.js";
import { reduceState } from "../src/state/reducer.js";

test("动态选择上限由动作参数控制", () => {
  let state = createInitialState("one");
  state = reduceState(state, { type: "CUT_TOGGLED", id: "a", limit: 2 });
  state = reduceState(state, { type: "CUT_TOGGLED", id: "b", limit: 2 });
  state = reduceState(state, { type: "CUT_TOGGLED", id: "c", limit: 2 });
  assert.deepEqual([...state.selectedCutIds], ["a", "b"]);
});

test("案例切换生成全新状态", () => {
  let state = createInitialState("one");
  state = reduceState(state, { type: "CUT_TOGGLED", id: "a", limit: 3 });
  state = reduceState(state, { type: "CASE_CHANGED", caseId: "two" });
  assert.equal(state.caseId, "two");
  assert.equal(state.phase, 1);
  assert.equal(state.selectedCutIds.size, 0);
});

test("旧动画 generation 不能覆盖新状态", () => {
  let state = createInitialState("one");
  state = reduceState(state, { type: "ANIMATION_STARTED", target: 1, generation: 4 });
  state = reduceState(state, { type: "ANIMATION_PROGRESS", progress: 0.5, generation: 3 });
  assert.equal(state.animation.progress, 0);
  state = reduceState(state, { type: "ANIMATION_PROGRESS", progress: 0.5, generation: 4 });
  assert.equal(state.animation.progress, 0.5);
});
