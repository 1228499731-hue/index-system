/*
 * Independent JavaScript transcription of the public Wolfram Demonstration
 * "Hinged Dissection of an Equilateral Triangle into Two Hexagons" (2011),
 * by Izidor Hafner and Greg N. Frederickson. The source notebook is licensed
 * CC BY-NC-SA and gives all vertices, pivots, and rotation angles explicitly.
 */

const p = (x, y) => ({ x, y });
const SQRT3 = Math.sqrt(3);
const H = SQRT3 / 2;
const h = SQRT3 / 6;

const initialGeometry = {
  triangle1: [p(-1, 0), p(0, 0), p(-0.5, h)],
  triangle3: [p(-1, 0), p(-0.5, h), p(-0.5, H)],
  delta: [p(-0.5, H), p(0, SQRT3 / 3), p(0.5, H), p(0, SQRT3)],
  hexagon: [p(-0.5, h), p(0, 0), p(0.5, h), p(0.5, H), p(0, SQRT3 / 3), p(-0.5, H)],
  triangle4: [p(1, 0), p(0.5, H), p(0.5, h)],
  triangle2: [p(0, 0), p(1, 0), p(0.5, h)]
};

const sourceOutline = [p(-1, 0), p(1, 0), p(0, SQRT3)];
const targetOutlines = {
  left: [p(-1, 0), p(-1.5, h), p(-1.5, H), p(-1, 2 * SQRT3 / 3), p(-0.5, H), p(-0.5, h)],
  right: [p(0, 0), p(0.5, h), p(0.5, H), p(0, 2 * SQRT3 / 3), p(-0.5, H), p(-0.5, h)]
};

const pivots = {
  ex4: p(-1, 0),
  ex1: p(-0.5, H),
  fixed: p(-0.5, h),
  ex3: p(0.5, H),
  ex2: p(1, 0)
};

const hinges = [
  ["ex4", "triangle1", "triangle3"],
  ["ex1", "triangle3", "delta"],
  ["fixed", "triangle3", "hexagon"],
  ["ex3", "hexagon", "triangle4"],
  ["ex2", "triangle4", "triangle2"]
].map(([id, first, second]) => ({
  id,
  pieces: [first, second],
  localByPiece: { [first]: pivots[id], [second]: pivots[id] }
}));

function rotationAround(pivot, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return {
    angle,
    x: pivot.x - cosine * pivot.x + sine * pivot.y,
    y: pivot.y - sine * pivot.x - cosine * pivot.y
  };
}

function apply(transform, value) {
  const cosine = Math.cos(transform.angle);
  const sine = Math.sin(transform.angle);
  return p(cosine * value.x - sine * value.y + transform.x, sine * value.x + cosine * value.y + transform.y);
}

function compose(outer, inner) {
  const translation = apply(outer, p(inner.x, inner.y));
  return { angle: outer.angle + inner.angle, x: translation.x, y: translation.y };
}

const identity = () => ({ angle: 0, x: 0, y: 0 });
const smoothstep = value => value * value * (3 - 2 * value);

function parameters(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped <= 0.5) return { k: smoothstep(clamped * 2), k2: 0 };
  return { k: 1, k2: smoothstep((clamped - 0.5) * 2) };
}

function frameTransforms(progress) {
  const { k, k2 } = parameters(progress);
  const outerRight = rotationAround(pivots.ex3, k2 * 4 * Math.PI / 3);
  return {
    triangle1: rotationAround(pivots.ex4, -k2 * 4 * Math.PI / 3),
    triangle3: identity(),
    delta: rotationAround(pivots.ex1, k * Math.PI),
    hexagon: identity(),
    triangle4: outerRight,
    triangle2: compose(outerRight, rotationAround(pivots.ex2, k * 5 * Math.PI / 3))
  };
}

function transformGeometry(transforms) {
  return Object.fromEntries(Object.entries(initialGeometry).map(([id, polygon]) => [
    id,
    polygon.map(value => apply(transforms[id], value))
  ]));
}

export const triangleTwoHexagonsResearch = {
  source: {
    title: "Hinged Dissection of an Equilateral Triangle into Two Hexagons",
    authors: ["Izidor Hafner", "Greg N. Frederickson"],
    year: 2011,
    url: "https://demonstrations.wolfram.com/HingedDissectionOfAnEquilateralTriangleIntoTwoHexagons/",
    license: "CC BY-NC-SA"
  },
  motionType: "planar-swing",
  topology: "hinged-tree",
  initialGeometry,
  sourceOutline,
  targetOutlines,
  targetGroups: {
    left: ["triangle1", "triangle3", "delta"],
    right: ["hexagon", "triangle4", "triangle2"]
  },
  pivots,
  hinges,
  angles: { delta: Math.PI, triangle2: 5 * Math.PI / 3, outerLeft: -4 * Math.PI / 3, outerRight: 4 * Math.PI / 3 }
};

export function sampleTriangleTwoHexagons(progress) {
  const transforms = frameTransforms(progress);
  return {
    geometry: transformGeometry(transforms),
    hinges: Object.fromEntries(hinges.map(hinge => [
      hinge.id,
      hinge.pieces.map(id => apply(transforms[id], hinge.localByPiece[id]))
    ]))
  };
}
