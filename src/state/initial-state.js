export function createInitialState(caseId) {
  return {
    caseId,
    phase: 1,
    selectedCutIds: new Set(),
    selectedHingeIds: new Set(),
    hintLevels: { cuts: 0, hinges: 0 },
    animation: { status: "idle", progress: 0, target: 0, generation: 0 }
  };
}
