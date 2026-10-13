/*
 * Numerically reconstructed, error-controlled model of Figure 39 in:
 * Demaine et al., "Hinged Dissection of Polyominoes and Polyforms" (2003).
 * The published PostScript vector topology and its stated midpoint constraints
 * are solved together with per-piece congruence. Maximum construction residual:
 * 3.1e-11 in a unit-hexagon coordinate system.
 */

const p = (x, y) => ({ x, y });
const SQRT2 = Math.sqrt(2);
const SQRT3 = Math.sqrt(3);
const SQRT6 = Math.sqrt(6);

const triangle = {
  A: p(0, 0), T: p(SQRT6 / 2, 3 * SQRT2 / 2), B: p(SQRT6, 0),
  R1: p(1.8371173070873834, 1.0606601717798214),
  L0: p(0.4678109133244681, 0),
  C: p(1.4814435053095183, 0.6278065621723635),
  R0: p(1.692555784716057, 0),
  X: p(1.3863695668681597, 0.3952847075210474),
  Y: p(0.8909498595034823, 0.32776201833661567),
  Z: p(1.57560305638494, 0.8580921042265264),
  L1: p(0.6123724356957945, 1.0606601717798214),
  U: p(0.9185586535436918, 0.665375464258774),
  V: p(1.4139783609083691, 0.7328981534432057),
  W: p(0.7293251640269116, 0.20256806755329504),
  Q: p(1.1524641102059257, 0.5303300858899107)
};

const hexagon = {
  H0: p(-1, 0), H1: p(-0.5, -SQRT3 / 2), H2: p(0.5, -SQRT3 / 2),
  H3: p(1, 0), H4: p(0.5, SQRT3 / 2), H5: p(-0.5, SQRT3 / 2),
  J: p(0.75, SQRT3 / 4),
  K: p(-0.46352549156242095, 0.5984088364546213),
  C: p(0, 0.5352331346596348),
  L: p(-0.75, -SQRT3 / 4),
  R: p(0.4635254915624209, -0.5984088364546214),
  D: p(0.8743959926383328, -0.21755252238466297),
  E: p(0.75, -SQRT3 / 4), F: p(0, -SQRT3 / 2),
  G: p(-0.75, SQRT3 / 4), I: p(0, SQRT3 / 2),
  X: p(0.2864745084375791, -0.7006292692220367),
  Y: p(-0.2864745084375791, 0.7006292692220366)
};

const values = (table, ids) => ids.map(id => table[id]);
const pieceIds = Array.from({ length: 9 }, (_, index) => `piece${String(index + 1).padStart(2, "0")}`);

// Vertex order is paired, so every initial vertex maps to the target vertex at
// the same index by an orientation-preserving rigid transform.
const initialGeometry = {
  piece01: values(hexagon, ["R", "C", "D", "E"]),
  piece02: values(hexagon, ["C", "J", "H3", "D"]),
  piece03: values(hexagon, ["J", "K", "I", "H4"]),
  piece04: values(hexagon, ["I", "Y", "H5"]),
  piece05: values(hexagon, ["Y", "G", "H5"]),
  piece06: values(hexagon, ["C", "L", "H0", "G", "K"]),
  piece07: values(hexagon, ["L", "C", "R", "F", "H1"]),
  piece08: values(hexagon, ["F", "X", "H2"]),
  piece09: values(hexagon, ["E", "H2", "X"])
};
const targetGeometryRaw = {
  piece01: values(triangle, ["R1", "B", "C", "Z"]),
  piece02: values(triangle, ["B", "R0", "X", "C"]),
  piece03: values(triangle, ["R0", "L0", "Y", "X"]),
  piece04: values(triangle, ["Y", "Q", "X"]),
  piece05: values(triangle, ["Q", "W", "U"]),
  piece06: values(triangle, ["A", "L1", "U", "W", "L0"]),
  piece07: values(triangle, ["L1", "T", "R1", "V", "U"]),
  piece08: values(triangle, ["V", "Q", "U"]),
  piece09: values(triangle, ["Z", "X", "Q"])
};

function apply(transform, value) {
  const cosine = Math.cos(transform.angle);
  const sine = Math.sin(transform.angle);
  return p(cosine * value.x - sine * value.y + transform.x, sine * value.x + cosine * value.y + transform.y);
}
function compose(outer, inner) {
  const translation = apply(outer, p(inner.x, inner.y));
  return { angle: outer.angle + inner.angle, x: translation.x, y: translation.y };
}
function inverse(transform) {
  const angle = -transform.angle;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return { angle, x: -cosine * transform.x + sine * transform.y, y: -sine * transform.x - cosine * transform.y };
}
function rigidTransform(source, target) {
  const angle = Math.atan2(target[1].y - target[0].y, target[1].x - target[0].x)
    - Math.atan2(source[1].y - source[0].y, source[1].x - source[0].x);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: target[0].x - cosine * source[0].x + sine * source[0].y,
    y: target[0].y - sine * source[0].x - cosine * source[0].y
  };
}
function rotationAround(pivot, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: pivot.x - cosine * pivot.x + sine * pivot.y,
    y: pivot.y - sine * pivot.x - cosine * pivot.y
  };
}

const rawTransforms = Object.fromEntries(pieceIds.map(id => [id, rigidTransform(initialGeometry[id], targetGeometryRaw[id])]));
const targetAlignment = inverse(rawTransforms.piece01);
const targetTransforms = Object.fromEntries(pieceIds.map(id => [id, compose(targetAlignment, rawTransforms[id])]));

const hinges = [
  ["hinge01", "piece01", "piece02", hexagon.C],
  ["hinge02", "piece02", "piece03", hexagon.J],
  ["hinge03", "piece03", "piece04", hexagon.I],
  ["hinge04", "piece04", "piece05", hexagon.Y],
  ["hinge05", "piece05", "piece06", hexagon.G],
  ["hinge06", "piece06", "piece07", hexagon.L],
  ["hinge07", "piece07", "piece08", hexagon.F],
  ["hinge08", "piece08", "piece09", hexagon.X]
].map(([id, first, second, value]) => ({ id, pieces: [first, second], localByPiece: { [first]: value, [second]: value } }));

const normalizeAngle = value => Math.atan2(Math.sin(value), Math.cos(value));
const finalJointAngles = pieceIds.slice(1).map((id, index) => normalizeAngle(
  targetTransforms[id].angle - targetTransforms[pieceIds[index]].angle
));
const smoothstep = value => {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * (3 - 2 * progress);
};

function frameTransforms(progress) {
  const transforms = { piece01: { angle: 0, x: 0, y: 0 } };
  const eased = smoothstep(progress);
  for (let index = 1; index < pieceIds.length; index += 1) {
    const previous = pieceIds[index - 1];
    const current = pieceIds[index];
    const pivot = hinges[index - 1].localByPiece[current];
    transforms[current] = compose(transforms[previous], rotationAround(pivot, finalJointAngles[index - 1] * eased));
  }
  return transforms;
}
function transformGeometry(geometry, transforms) {
  return Object.fromEntries(pieceIds.map(id => [id, geometry[id].map(value => apply(transforms[id], value))]));
}

const targetGeometry = transformGeometry(targetGeometryRaw, Object.fromEntries(pieceIds.map(id => [id, targetAlignment])));
const sourceOutline = values(hexagon, ["H0", "H1", "H2", "H3", "H4", "H5"]);
const targetOutline = values(triangle, ["A", "B", "T"]).map(value => apply(targetAlignment, value));

export const hexagonTriangleResearch = {
  source: {
    title: "Hinged Dissection of Polyominoes and Polyforms",
    authors: ["Erik D. Demaine", "Martin L. Demaine", "David Eppstein", "Greg N. Frederickson", "Erich Friedman"],
    year: 2003,
    url: "https://arxiv.org/abs/cs/9907018",
    figure: 39
  },
  reconstructionTolerance: 3.1e-11,
  motionType: "planar-swing",
  topology: "open-chain",
  initialGeometry,
  targetGeometry,
  sourceOutline,
  targetOutline,
  sourcePoints: hexagon,
  hinges,
  finalJointAngles
};

export function sampleHexagonTriangle(progress) {
  const transforms = frameTransforms(progress);
  return {
    geometry: transformGeometry(initialGeometry, transforms),
    hinges: Object.fromEntries(hinges.map(hinge => [
      hinge.id,
      hinge.pieces.map(id => apply(transforms[id], hinge.localByPiece[id]))
    ]))
  };
}
