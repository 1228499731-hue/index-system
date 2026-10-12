import { caseRegistry, getImplementedCase } from "./cases/registry.js";
import { mapPointsToScreen } from "./geometry/transform.js";
import { validateCaseDefinition, validateSelection } from "./geometry/validation.js";
import { getPlanarFrame } from "./motion/planar-chain.js";
import { SvgRenderer } from "./rendering/svg-renderer.js";
import { UiRenderer } from "./rendering/ui-renderer.js";
import { createInitialState } from "./state/initial-state.js";
import { reduceState } from "./state/reducer.js";
import { AnimationController } from "./interaction/animation-controller.js";

const DEFAULT_CASE_ID = "dudeney-triangle-square";
const svgRenderer = new SvgRenderer(document.getElementById("geometry"));
const ui = new UiRenderer();
const animation = new AnimationController();
let idleTimer = null;
let state = createInitialState(DEFAULT_CASE_ID);
let activeCase = null;
let screenPoints = null;

function dispatch(action) {
  state = reduceState(state, action);
  ui.renderState(state, activeCase);
  svgRenderer.renderSelections(state.selectedCutIds, state.selectedHingeIds);
}

function frameAt(progress) {
  return getPlanarFrame(activeCase, screenPoints, progress);
}

function buildCaseSelector() {
  const select = document.getElementById("caseSelect");
  select.replaceChildren();
  caseRegistry.forEach(caseSpec => {
    const option = document.createElement("option");
    option.value = caseSpec.id;
    option.textContent = caseSpec.status === "implemented" ? caseSpec.name : `${caseSpec.name}（待验证）`;
    option.disabled = caseSpec.status !== "implemented";
    select.append(option);
  });
  select.value = DEFAULT_CASE_ID;
}

function resetIdleTimer() {
  if (idleTimer !== null) clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    if (state.animation.status === "running") {
      resetIdleTimer();
      return;
    }
    resetCase("等待下一位挑战者：请选择三条候选割线。");
  }, 120000);
}

function loadCase(caseId) {
  const nextCase = getImplementedCase(caseId);
  if (!nextCase) return;
  const validation = validateCaseDefinition(nextCase);
  if (!validation.valid) throw new Error(validation.errors.join("；"));
  animation.cancelAll();
  activeCase = nextCase;
  screenPoints = mapPointsToScreen(activeCase.geometry.points, activeCase.viewport);
  state = createInitialState(activeCase.id);
  document.getElementById("board").className = "board";
  ui.applyCase(activeCase);
  svgRenderer.build(activeCase, screenPoints, { onCutToggle: toggleCut });
  svgRenderer.renderGeometry(frameAt(0));
  ui.renderState(state, activeCase);
  ui.byId("boardTip").innerHTML = activeCase.teaching.phase1.boardTip;
  ui.byId("transformButton").disabled = false;
  ui.byId("transformButton").textContent = "▶ 开始变形";
  ui.byId("finalMessage").classList.remove("show");
  ui.showMessage(activeCase.teaching.phase1.initialMessage);
  resetIdleTimer();
}

function resetCase(message = null) {
  const caseId = state.caseId;
  animation.cancelAll();
  dispatch({ type: "RESET" });
  loadCase(caseId);
  if (message) ui.showMessage(message);
}

function toggleCut(id) {
  if (state.phase !== 1) return;
  const limit = activeCase.challenges.cuts.requiredCount;
  if (!state.selectedCutIds.has(id) && state.selectedCutIds.size >= limit) {
    ui.showMessage(`一次只能选择 ${limit} 条割线，请先取消一条。`, "hint");
    return;
  }
  dispatch({ type: "CUT_TOGGLED", id, limit });
}

function toggleHinge(id) {
  if (state.phase !== 2) return;
  const limit = activeCase.challenges.hinges.requiredCount;
  if (!state.selectedHingeIds.has(id) && state.selectedHingeIds.size >= limit) {
    ui.showMessage(`一次只能选择 ${limit} 个铰点。`, "hint");
    return;
  }
  dispatch({ type: "HINGE_TOGGLED", id, limit });
}

function checkCuts() {
  const result = validateSelection(activeCase, "cuts", state.selectedCutIds);
  if (!result.valid) {
    svgRenderer.flashWrong("cuts", result.wrongIds);
    ui.showMessage(`三条割线中有 ${result.correctCount} 条正确。红色闪烁的是错误选择。`, "error");
    return;
  }
  dispatch({ type: "CUTS_VALIDATED", valid: true });
  document.getElementById("board").classList.add("cut-complete");
  svgRenderer.showCorrectCuts(activeCase.challenges.cuts.answerIds);
  svgRenderer.buildHingeCandidates(activeCase, screenPoints, toggleHinge);
  ui.byId("boardTip").innerHTML = activeCase.teaching.phase2.boardTip;
  ui.showMessage("割线正确！现在请寻找三个铰链位置。", "success");
}

function checkHinges() {
  const result = validateSelection(activeCase, "hinges", state.selectedHingeIds);
  if (!result.valid) {
    svgRenderer.flashWrong("hinges", result.wrongIds);
    ui.showMessage(`三个候选点中，有 ${result.correctCount} 个是正确铰点。`, "error");
    return;
  }
  dispatch({ type: "HINGES_VALIDATED", valid: true });
  svgRenderer.showCorrectHinges(activeCase.challenges.hinges.answerIds);
  animation.delay(() => svgRenderer.setLayerOpacity("hingeCandidates", "0"), 600);
  svgRenderer.buildRealHinges(activeCase.motion.hingeIds);
  svgRenderer.renderGeometry(frameAt(0));
  ui.byId("boardTip").innerHTML = activeCase.teaching.phase3.boardTip;
  ui.showMessage("三个铰点正确！现在四块已经形成连续的铰链运动链。", "success");
}

function requestHint(kind) {
  dispatch({ type: "HINT_REQUESTED", kind });
  const challenge = activeCase.challenges[kind];
  const level = state.hintLevels[kind];
  if (level <= challenge.hints.length) {
    ui.showMessage(challenge.hints[level - 1], "hint");
    return;
  }
  const selected = kind === "cuts" ? state.selectedCutIds : state.selectedHingeIds;
  const available = challenge.answerIds.filter(id => !selected.has(id));
  if (!available.length) return;
  const id = available[Math.floor(Math.random() * available.length)];
  const clearHint = svgRenderer.hint(kind, id);
  animation.delay(clearHint, kind === "cuts" ? 2300 : 2200);
  ui.showMessage(kind === "cuts" ? "有一条正确割线正在闪烁。" : "一个有效铰点正在闪烁。", "hint");
}

function animateTo(target) {
  if (state.animation.status === "running") return;
  const board = ui.byId("board");
  const button = ui.byId("transformButton");
  const from = state.animation.progress;
  board.classList.add("animating");
  board.classList.remove("final-shape");
  ui.byId("finalMessage").classList.remove("show");
  svgRenderer.setLayerOpacity("cuts", "0");
  svgRenderer.setLayerOpacity("hingeCandidates", "0");
  svgRenderer.setLayerOpacity("labels", "0");
  button.disabled = true;
  button.textContent = target === 1 ? "变形中…" : "还原中…";

  const generation = animation.animate({
    from,
    to: target,
    duration: activeCase.motion.durationMs,
    onFrame(progress, frameGeneration) {
      dispatch({ type: "ANIMATION_PROGRESS", progress, generation: frameGeneration });
      svgRenderer.renderGeometry(frameAt(progress));
    },
    onComplete(finalProgress, frameGeneration) {
      dispatch({ type: "ANIMATION_FINISHED", target: finalProgress, generation: frameGeneration });
      svgRenderer.renderGeometry(frameAt(finalProgress));
      button.disabled = false;
      board.classList.remove("animating");
      if (target === 1) {
        board.classList.add("final-shape");
        button.textContent = "↶ 还原三角形";
        ui.byId("finalMessage").classList.add("show");
        ui.byId("boardTip").innerHTML = "✓ 变形完成 · <strong>形状改变，面积不变</strong>";
        ui.showMessage("变形完成！整个动画过程中，展示区域始终保持固定。", "success");
      } else {
        button.textContent = "▶ 开始变形";
        ui.byId("boardTip").innerHTML = "已回到三角形 · 点击 <strong>开始变形</strong> 可以再次观看";
        ui.showMessage("机构已经沿原路径回到初始三角形。");
      }
      resetIdleTimer();
    }
  });
  dispatch({ type: "ANIMATION_STARTED", target, generation });
}

function bindEvents() {
  ui.byId("caseSelect").addEventListener("change", event => loadCase(event.target.value));
  ui.byId("checkLinesButton").addEventListener("click", checkCuts);
  ui.byId("checkHingesButton").addEventListener("click", checkHinges);
  ui.byId("lineHintButton").addEventListener("click", () => requestHint("cuts"));
  ui.byId("hingeHintButton").addEventListener("click", () => requestHint("hinges"));
  ui.byId("transformButton").addEventListener("click", () => animateTo(state.animation.progress < 0.5 ? 1 : 0));
  ui.byId("replayButton").addEventListener("click", () => {
    if (state.animation.status === "running") return;
    if (state.animation.progress > 0.001) {
      animateTo(0);
      const duration = activeCase.motion.durationMs + 300;
      animation.delay(() => animateTo(1), duration);
    } else animation.delay(() => animateTo(1), 300);
  });
  document.querySelectorAll(".reset-button").forEach(button => button.addEventListener("click", () => resetCase()));
  ["pointerdown", "keydown"].forEach(eventName => document.addEventListener(eventName, resetIdleTimer));
}

buildCaseSelector();
bindEvents();
loadCase(DEFAULT_CASE_ID);
