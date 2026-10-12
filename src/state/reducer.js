import { createInitialState } from "./initial-state.js";

function toggleInSet(source, id, limit) {
  const result = new Set(source);
  if (result.has(id)) result.delete(id);
  else if (result.size < limit) result.add(id);
  return result;
}

export function reduceState(state, action) {
  switch (action.type) {
    case "CASE_CHANGED":
      return createInitialState(action.caseId);
    case "RESET": {
      const next = createInitialState(state.caseId);
      next.animation.generation = state.animation.generation + 1;
      return next;
    }
    case "CUT_TOGGLED":
      if (state.phase !== 1) return state;
      return { ...state, selectedCutIds: toggleInSet(state.selectedCutIds, action.id, action.limit) };
    case "CUTS_VALIDATED":
      return action.valid ? { ...state, phase: 2 } : state;
    case "HINGE_TOGGLED":
      if (state.phase !== 2) return state;
      return { ...state, selectedHingeIds: toggleInSet(state.selectedHingeIds, action.id, action.limit) };
    case "HINGES_VALIDATED":
      return action.valid ? { ...state, phase: 3 } : state;
    case "HINT_REQUESTED":
      return {
        ...state,
        hintLevels: { ...state.hintLevels, [action.kind]: state.hintLevels[action.kind] + 1 }
      };
    case "ANIMATION_STARTED":
      return {
        ...state,
        animation: { ...state.animation, status: "running", target: action.target, generation: action.generation }
      };
    case "ANIMATION_PROGRESS":
      if (action.generation !== state.animation.generation) return state;
      return { ...state, animation: { ...state.animation, progress: action.progress } };
    case "ANIMATION_FINISHED":
      if (action.generation !== state.animation.generation) return state;
      return { ...state, animation: { ...state.animation, status: "idle", progress: action.target, target: action.target } };
    default:
      return state;
  }
}
