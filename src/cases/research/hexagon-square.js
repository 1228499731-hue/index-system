/*
 * Exact reconstruction of Figure 37 in:
 * Erik D. Demaine, Martin L. Demaine, David Eppstein,
 * Greg N. Frederickson, and Erich Friedman (2003),
 * "Hinged Dissection of Polyominoes and Polyforms".
 * https://arxiv.org/abs/cs/9907018
 *
 * The paper draws a cyclic 10-piece regular-hexagon-to-square dissection.
 * Following the paper, we open the cycle at one hinge to obtain an
 * extendible 10-piece, 9-hinge chain.  Coordinates below are algebraic;
 * the published vector figure was used only to recover the cut topology.
 */

const SQRT3 = Math.sqrt(3);
const Q = 0.5 * Math.sqrt(6 * SQRT3 - 9);
const point = (x, y) => ({ x, y });
const invert = value => point(-value.x, -value.y);

const sourcePoints = {
  LM: point(-SQRT3 / 2, 0),
  LU: point(-SQRT3 / 2, 0.5),
  T: point(0, 1),
  RU: point(SQRT3 / 2, 0.5),
  RM: point(SQRT3 / 2, 0),
  A: point(-SQRT3 / 4, 0.75),
  B: point(SQRT3 / 4, 0.75),
  P2: point(SQRT3 / 4 + Q / 2, 0),
  P4: point(-SQRT3 / 4 + Q / 2, 0),
  P3: point(-SQRT3 / 4 + Q / 2 + 0.75, Q / 2)
};

for (const id of ["LM", "LU", "T", "RU", "RM", "A", "B", "P2", "P4", "P3"]) {
  sourcePoints[`n${id}`] = invert(sourcePoints[id]);
}

const polygon = (...ids) => ids.map(id => sourcePoints[id]);

const initialGeometry = {
  piece01: polygon("B", "RU", "RM", "P2"),
  piece02: polygon("A", "T", "B"),
  piece03: polygon("A", "B", "P3", "P4"),
  piece04: polygon("P4", "P2", "P3"),
  piece05: polygon("LM", "LU", "A", "P4"),
  piece06: polygon("nB", "nRU", "nRM", "nP2"),
  piece07: polygon("nA", "nT", "nB"),
  piece08: polygon("nA", "nB", "nP3", "nP4"),
  piece09: polygon("nP4", "nP2", "nP3"),
  piece10: polygon("nLM", "nLU", "nA", "nP4")
};

const U = point(1.5, Q);
const V = point(Q, -1.5);
const squareCenter = point((U.x + V.x) / 2, (U.y + V.y) / 2);
const targetPoints = {
  O: point(0, 0),
  M1: point(U.x / 2, U.y / 2),
  M2: point(V.x + U.x / 2, V.y + U.y / 2),
  D: V,
  E: point(SQRT3 / 2, 0),
  F: point(SQRT3 / 4 + Q / 2, 0),
  G: point(SQRT3 / 4 + Q / 2, -0.5),
  H: point(V.x / 2, V.y / 2),
  I: point(V.x / 2 + SQRT3 / 2, V.y / 2)
};

const targetSlots = {
  S1: [targetPoints.H, targetPoints.G, targetPoints.I],
  S2: [targetPoints.F, targetPoints.G, targetPoints.H, targetPoints.O],
  S3: [targetPoints.I, targetPoints.G, targetPoints.F, targetPoints.E],
  S4: [targetPoints.O, targetPoints.E, targetPoints.M1],
  S5: [targetPoints.H, targetPoints.I, targetPoints.M2, targetPoints.D]
};

function invertInSquare(value) {
  return point(2 * squareCenter.x - value.x, 2 * squareCenter.y - value.y);
}

function slot(type, inverted) {
  return targetSlots[type].map(value => inverted ? invertInSquare(value) : value);
}

const targetGeometryRaw = {
  piece01: slot("S3", false),
  piece02: slot("S1", false),
  piece03: slot("S5", false),
  piece04: slot("S4", true),
  piece05: slot("S2", true),
  piece06: slot("S3", true),
  piece07: slot("S1", true),
  piece08: slot("S5", true),
  piece09: slot("S4", false),
  piece10: slot("S2", false)
};

function applyTransform(transform, value) {
  const cosine = Math.cos(transform.angle);
  const sine = Math.sin(transform.angle);
  return point(
    cosine * value.x - sine * value.y + transform.x,
    sine * value.x + cosine * value.y + transform.y
  );
}

function compose(outer, inner) {
  const translated = applyTransform(outer, point(inner.x, inner.y));
  return { angle: outer.angle + inner.angle, x: translated.x, y: translated.y };
}

function inverse(transform) {
  const angle = -transform.angle;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: -(cosine * transform.x - sine * transform.y),
    y: -(sine * transform.x + cosine * transform.y)
  };
}

function rigidTransform(source, target) {
  const sourceAngle = Math.atan2(source[1].y - source[0].y, source[1].x - source[0].x);
  const targetAngle = Math.atan2(target[1].y - target[0].y, target[1].x - target[0].x);
  const angle = targetAngle - sourceAngle;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: target[0].x - (cosine * source[0].x - sine * source[0].y),
    y: target[0].y - (sine * source[0].x + cosine * source[0].y)
  };
}

function rotationAround(pivot, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: pivot.x - (cosine * pivot.x - sine * pivot.y),
    y: pivot.y - (sine * pivot.x + cosine * pivot.y)
  };
}

const pieceIds = Object.keys(initialGeometry);
const rawTargetTransforms = Object.fromEntries(pieceIds.map(pieceId => [
  pieceId,
  rigidTransform(initialGeometry[pieceId], targetGeometryRaw[pieceId])
]));
const targetAlignment = inverse(rawTargetTransforms.piece01);
const targetTransforms = Object.fromEntries(pieceIds.map(pieceId => [
  pieceId,
  compose(targetAlignment, rawTargetTransforms[pieceId])
]));

const hingeDefinitions = [
  ["hinge01", "piece01", "piece02", "B"],
  ["hinge02", "piece02", "piece03", "A"],
  ["hinge03", "piece03", "piece04", "P3"],
  ["hinge04", "piece04", "piece05", "P4"],
  ["hinge05", "piece05", "piece06", "LM"],
  ["hinge06", "piece06", "piece07", "nB"],
  ["hinge07", "piece07", "piece08", "nA"],
  ["hinge08", "piece08", "piece09", "nP3"],
  ["hinge09", "piece09", "piece10", "nP4"]
].map(([id, first, second, pointId]) => ({
  id,
  pieces: [first, second],
  pointId,
  localByPiece: {
    [first]: sourcePoints[pointId],
    [second]: sourcePoints[pointId]
  }
}));

function normalizeAngle(value) {
  let result = value;
  while (result <= -Math.PI) result += 2 * Math.PI;
  while (result > Math.PI) result -= 2 * Math.PI;
  return result;
}

const finalJointAngles = pieceIds.slice(1).map((pieceId, index) => (
  normalizeAngle(targetTransforms[pieceId].angle - targetTransforms[pieceIds[index]].angle)
));

function smoothstep(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * (3 - 2 * progress);
}

function frameTransforms(progress) {
  const eased = smoothstep(progress);
  const transforms = { piece01: { angle: 0, x: 0, y: 0 } };
  for (let index = 1; index < pieceIds.length; index += 1) {
    const pieceId = pieceIds[index];
    const previousId = pieceIds[index - 1];
    const hinge = hingeDefinitions[index - 1];
    transforms[pieceId] = compose(
      transforms[previousId],
      rotationAround(sourcePoints[hinge.pointId], finalJointAngles[index - 1] * eased)
    );
  }
  return transforms;
}

function transformGeometry(geometry, transforms) {
  return Object.fromEntries(pieceIds.map(pieceId => [
    pieceId,
    geometry[pieceId].map(value => applyTransform(transforms[pieceId], value))
  ]));
}

const targetGeometry = transformGeometry(targetGeometryRaw, Object.fromEntries(
  pieceIds.map(pieceId => [pieceId, targetAlignment])
));

const sourceOutline = polygon("LM", "LU", "T", "RU", "RM", "nLU", "nT", "nRU");
const targetOutlineRaw = [targetPoints.O, U, point(U.x + V.x, U.y + V.y), V];
const targetOutline = targetOutlineRaw.map(value => applyTransform(targetAlignment, value));

export const hexagonSquareResearch = {
  source: {
    title: "Hinged Dissection of Polyominoes and Polyforms",
    authors: [
      "Erik D. Demaine", "Martin L. Demaine", "David Eppstein",
      "Greg N. Frederickson", "Erich Friedman"
    ],
    year: 2003,
    url: "https://arxiv.org/abs/cs/9907018",
    figure: 37
  },
  constants: { sqrt3: SQRT3, q: Q },
  motionType: "planar-swing",
  topology: "open-chain-from-cyclic-dissection",
  initialGeometry,
  targetGeometry,
  sourceOutline,
  targetOutline,
  sourcePoints,
  hinges: hingeDefinitions,
  splitClosure: {
    pieces: ["piece10", "piece01"],
    localByPiece: { piece10: sourcePoints.RM, piece01: sourcePoints.RM }
  },
  finalJointAngles
};

export function sampleHexagonSquare(progress) {
  const transforms = frameTransforms(progress);
  return {
    geometry: transformGeometry(initialGeometry, transforms),
    hinges: Object.fromEntries(hingeDefinitions.map(hinge => [
      hinge.id,
      hinge.pieces.map(pieceId => applyTransform(
        transforms[pieceId],
        hinge.localByPiece[pieceId]
      ))
    ])),
    splitClosure: hexagonSquareResearch.splitClosure.pieces.map(pieceId => applyTransform(
      transforms[pieceId],
      hexagonSquareResearch.splitClosure.localByPiece[pieceId]
    ))
  };
}
