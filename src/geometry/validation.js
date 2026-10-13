import { area, edgeLengths } from "./polygon.js";

const EPSILON = 1e-7;

export function sameIdSet(actualIds, expectedIds) {
  const actual = new Set(actualIds);
  const expected = new Set(expectedIds);
  return actual.size === expected.size && [...expected].every(id => actual.has(id));
}

export function validateSelection(caseSpec, kind, selectedIds) {
  const challenge = caseSpec.challenges[kind];
  if (!challenge) {
    return { valid: false, correctCount: 0, expectedCount: 0, wrongIds: [...selectedIds] };
  }
  const expected = new Set(challenge.answerIds);
  const selected = [...selectedIds];
  return {
    valid: sameIdSet(selected, challenge.answerIds),
    correctCount: selected.filter(id => expected.has(id)).length,
    expectedCount: expected.size,
    wrongIds: selected.filter(id => !expected.has(id))
  };
}

export function validateCaseDefinition(caseSpec) {
  const errors = [];
  const pointIds = new Set(Object.keys(caseSpec.geometry.points));
  const pieceIds = new Set(caseSpec.geometry.pieces.map(piece => piece.id));
  const piecePointIds = new Map(caseSpec.geometry.pieces.map(piece => [piece.id, new Set(piece.pointIds)]));
  const ensurePoint = (id, context) => {
    if (!pointIds.has(id)) errors.push(`${context} 引用了不存在的点 ${id}`);
  };

  caseSpec.geometry.sourceOutline.forEach(id => ensurePoint(id, "sourceOutline"));
  caseSpec.geometry.pieces.forEach(piece => {
    if (piece.pointIds.length < 3) errors.push(`拼块 ${piece.id} 至少需要三个顶点`);
    piece.pointIds.forEach(id => ensurePoint(id, `拼块 ${piece.id}`));
  });
  caseSpec.challenges.cuts.candidates.forEach(line => {
    ensurePoint(line.start, `割线 ${line.id}`);
    ensurePoint(line.end, `割线 ${line.id}`);
  });
  caseSpec.challenges.hinges.candidates.forEach(hinge => ensurePoint(hinge.pointId, `铰点 ${hinge.id}`));

  const cutIds = new Set(caseSpec.challenges.cuts.candidates.map(item => item.id));
  caseSpec.challenges.cuts.answerIds.forEach(id => {
    if (!cutIds.has(id)) errors.push(`割线答案引用了不存在的候选项 ${id}`);
  });
  const hingeIds = new Set(caseSpec.challenges.hinges.candidates.map(item => item.id));
  caseSpec.challenges.hinges.answerIds.forEach(id => {
    if (!hingeIds.has(id)) errors.push(`铰点答案引用了不存在的候选项 ${id}`);
  });
  caseSpec.challenges.hinges.chain.forEach(hinge => {
    if (!hingeIds.has(hinge.id)) errors.push(`铰链拓扑引用了不存在的候选项 ${hinge.id}`);
    hinge.pieces.forEach(pieceId => {
      if (!pieceIds.has(pieceId)) errors.push(`铰链 ${hinge.id} 引用了不存在的拼块 ${pieceId}`);
      else if (!piecePointIds.get(pieceId).has(hinge.id)) {
        errors.push(`铰链 ${hinge.id} 不在拼块 ${pieceId} 的顶点中`);
      }
    });
  });

  const source = caseSpec.geometry.sourceOutline.map(id => caseSpec.geometry.points[id]);
  const sourceArea = area(source);
  const piecesArea = caseSpec.geometry.pieces.reduce(
    (sum, piece) => sum + area(piece.pointIds.map(id => caseSpec.geometry.points[id])),
    0
  );
  if (Math.abs(sourceArea - piecesArea) > EPSILON) {
    errors.push(`拼块面积和 ${piecesArea} 与源图形面积 ${sourceArea} 不一致`);
  }

  return { valid: errors.length === 0, errors, sourceArea, piecesArea };
}

export function validateRigidFrame(initialGeometry, frameGeometry, tolerance = EPSILON) {
  const errors = [];
  for (const [pieceId, initialPoints] of Object.entries(initialGeometry)) {
    const framePoints = frameGeometry[pieceId];
    if (!framePoints || framePoints.length !== initialPoints.length) {
      errors.push(`拼块 ${pieceId} 的顶点数量发生变化`);
      continue;
    }
    if (Math.abs(area(initialPoints) - area(framePoints)) > tolerance) {
      errors.push(`拼块 ${pieceId} 的面积发生变化`);
    }
    const initialEdges = edgeLengths(initialPoints);
    const frameEdges = edgeLengths(framePoints);
    initialEdges.forEach((length, index) => {
      if (Math.abs(length - frameEdges[index]) > tolerance) {
        errors.push(`拼块 ${pieceId} 的第 ${index + 1} 条边长度发生变化`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
