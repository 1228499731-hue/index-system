/*
 * Independent JavaScript reconstruction of the mathematical geometry in:
 * Izidor Hafner and Greg N. Frederickson (2011),
 * "Two Hinged Dissections of a Greek Cross to a Square".
 * https://demonstrations.wolfram.com/TwoHingedDissectionsOfAGreekCrossToASquare/
 *
 * Source material license: CC BY-NC-SA 3.0 Unported.
 * This research module is not registered in the application UI.
 */

const point = (x, y) => ({ x, y });

function rotatePoint(value, angle, pivot = point(0, 0)) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const dx = value.x - pivot.x;
  const dy = value.y - pivot.y;
  return point(
    pivot.x + dx * cosine - dy * sine,
    pivot.y + dx * sine + dy * cosine
  );
}

function identity(value) {
  return point(value.x, value.y);
}

function transformPolygon(points, transform) {
  return points.map(transform);
}

function sequentialControls(progress) {
  const normalized = Math.max(0, Math.min(1, progress));
  return normalized <= 0.5
    ? { move1: normalized * 2, move2: 0 }
    : { move1: 1, move2: (normalized - 0.5) * 2 };
}

const lemonPieces = {
  heptagon: [
    point(0, 0), point(1, -0.5), point(1, 0), point(2, 0),
    point(2, 1), point(1, 1), point(1, 2)
  ],
  hexagon: [
    point(0, 0), point(1, 2), point(0, 2),
    point(0, 1), point(-1, 1), point(-1, 0.5)
  ],
  trapezoid: [point(0, 0), point(0, -1), point(1, -1), point(1, -0.5)],
  triangle: [point(0, 0), point(-1, 0.5), point(-1, 0)]
};

const loydPieces = {
  pieceA: [
    point(0, 0), point(-0.5, -1), point(-0.5, -1.5),
    point(0.5, -1.5), point(0.5, -0.5), point(1, -0.5)
  ],
  pieceB: [
    point(0, 0), point(1, -0.5), point(1.5, -0.5),
    point(1.5, 0.5), point(0.5, 0.5), point(0.5, 1)
  ],
  pieceC: [
    point(0, 0), point(0.5, 1), point(0.5, 1.5),
    point(-0.5, 1.5), point(-0.5, 0.5), point(-1, 0.5)
  ],
  pieceD: [
    point(0, 0), point(-1, 0.5), point(-1.5, 0.5),
    point(-1.5, -0.5), point(-0.5, -0.5), point(-0.5, -1)
  ]
};

const lemonSourceOutline = [
  point(0, 2), point(1, 2), point(1, 1), point(2, 1),
  point(2, 0), point(1, 0), point(1, -1), point(0, -1),
  point(0, 0), point(-1, 0), point(-1, 1), point(0, 1)
];

const loydSourceOutline = [
  point(-0.5, 1.5), point(0.5, 1.5), point(0.5, 0.5), point(1.5, 0.5),
  point(1.5, -0.5), point(0.5, -0.5), point(0.5, -1.5), point(-0.5, -1.5),
  point(-0.5, -0.5), point(-1.5, -0.5), point(-1.5, 0.5), point(-0.5, 0.5)
];

function lemonTransforms(move1, move2) {
  const outerPivot = point(1, -0.5);
  return {
    heptagon: identity,
    hexagon: value => rotatePoint(value, -move1 * 3 * Math.PI / 2, point(1, 2)),
    trapezoid: value => rotatePoint(value, move2 * Math.PI, outerPivot),
    triangle: value => rotatePoint(
      rotatePoint(value, move1 * Math.PI / 2, point(0, 0)),
      move2 * Math.PI,
      outerPivot
    )
  };
}

function loydTransforms(move1, move2) {
  const outerPivot = point(-0.5, -1);
  return {
    pieceA: identity,
    pieceB: value => rotatePoint(value, -move1 * Math.PI, point(1, -0.5)),
    pieceC: value => rotatePoint(
      rotatePoint(value, move1 * Math.PI, point(-1, 0.5)),
      move2 * Math.PI,
      outerPivot
    ),
    pieceD: value => rotatePoint(value, move2 * Math.PI, outerPivot)
  };
}

function buildFrame(model, move1, move2) {
  const transforms = model.transforms(move1, move2);
  return Object.fromEntries(
    Object.entries(model.initialGeometry).map(([pieceId, points]) => [
      pieceId,
      transformPolygon(points, transforms[pieceId])
    ])
  );
}

function buildHingeFrame(model, move1, move2) {
  const transforms = model.transforms(move1, move2);
  return Object.fromEntries(model.hinges.map(hinge => [
    hinge.id,
    hinge.pieces.map(pieceId => transforms[pieceId](hinge.localByPiece[pieceId]))
  ]));
}

export const greekCrossSquareResearch = {
  source: {
    title: "Two Hinged Dissections of a Greek Cross to a Square",
    authors: ["Izidor Hafner", "Greg N. Frederickson"],
    year: 2011,
    url: "https://demonstrations.wolfram.com/TwoHingedDissectionsOfAGreekCrossToASquare/",
    license: "CC BY-NC-SA 3.0 Unported"
  },
  models: {
    lemon: {
      id: "greek-cross-square-lemon",
      name: "Lemon's Greek Cross to Square",
      motionType: "planar-swing",
      initialGeometry: lemonPieces,
      sourceOutline: lemonSourceOutline,
      targetOutline: [point(0, 0), point(2, -1), point(3, 1), point(1, 2)],
      hinges: [
        {
          id: "lemon-h1",
          pieces: ["heptagon", "hexagon"],
          localByPiece: { heptagon: point(1, 2), hexagon: point(1, 2) }
        },
        {
          id: "lemon-h2",
          pieces: ["heptagon", "trapezoid"],
          localByPiece: { heptagon: point(1, -0.5), trapezoid: point(1, -0.5) }
        },
        {
          id: "lemon-h3",
          pieces: ["trapezoid", "triangle"],
          localByPiece: { trapezoid: point(0, 0), triangle: point(0, 0) }
        }
      ],
      transforms: lemonTransforms
    },
    loyd: {
      id: "greek-cross-square-loyd",
      name: "Loyd's Greek Cross to Square",
      motionType: "planar-swing",
      initialGeometry: loydPieces,
      sourceOutline: loydSourceOutline,
      targetOutline: [point(0, 0), point(2, -1), point(1, -3), point(-1, -2)],
      hinges: [
        {
          id: "loyd-h1",
          pieces: ["pieceA", "pieceB"],
          localByPiece: { pieceA: point(1, -0.5), pieceB: point(1, -0.5) }
        },
        {
          id: "loyd-h2",
          pieces: ["pieceA", "pieceD"],
          localByPiece: { pieceA: point(-0.5, -1), pieceD: point(-0.5, -1) }
        },
        {
          id: "loyd-h3",
          pieces: ["pieceD", "pieceC"],
          localByPiece: { pieceD: point(-1, 0.5), pieceC: point(-1, 0.5) }
        }
      ],
      transforms: loydTransforms
    }
  }
};

export function sampleGreekCrossSquare(modelId, progress) {
  const model = greekCrossSquareResearch.models[modelId];
  if (!model) throw new Error(`Unknown Greek-cross-to-square model: ${modelId}`);
  const controls = sequentialControls(progress);
  return {
    controls,
    geometry: buildFrame(model, controls.move1, controls.move2),
    hinges: buildHingeFrame(model, controls.move1, controls.move2)
  };
}

