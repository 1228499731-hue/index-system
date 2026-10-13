/* Research-only nonlinear reconstruction helper for Figure 39. */

const sqrt2 = Math.sqrt(2);
const sqrt3 = Math.sqrt(3);
const sqrt6 = Math.sqrt(6);

const rawSource = {
  A: [581, 1504], T: [941, 881], B: [1301, 1504], R1: [1121, 1192],
  L0: [718, 1504], C: [1016, 1320], R0: [1078, 1504], X: [988, 1388],
  Y: [842, 1407], Z: [1044, 1252], L1: [761, 1192], U: [851, 1308],
  V: [996, 1289], W: [795, 1445], Q: [919.5, 1348]
};
const rawTarget = {
  H0: [1296, 1252], H1: [1476, 1484], H2: [1767, 1445],
  H3: [1878, 1172], H4: [1698, 940], H5: [1407, 980],
  J: [1788, 1056], K: [1428, 1056], C: [1566, 1056],
  L: [1386, 1368], R: [1746, 1368], D: [1850, 1241],
  E: [1823, 1308], F: [1622, 1464], G: [1352, 1116],
  I: [1553, 960], X: [1698, 1405], Y: [1476, 1020]
};

const sourceFaces = [
  ["Y", "Q", "X"], ["V", "Q", "U"], ["Q", "W", "U"],
  ["Z", "X", "Q"], ["B", "R0", "X", "C"], ["R0", "L0", "Y", "X"],
  ["R1", "B", "C", "Z"], ["A", "L1", "U", "W", "L0"],
  ["L1", "T", "R1", "V", "U"]
];
const targetFaces = [
  ["H2", "F", "X"], ["H5", "I", "Y"], ["G", "H5", "Y"],
  ["E", "H2", "X"], ["H3", "D", "C", "J"], ["H4", "J", "K", "I"],
  ["E", "R", "C", "D"], ["L", "H0", "G", "K", "C"],
  ["H1", "L", "C", "R", "F"]
];
const targetForSource = [1, 0, 2, 3, 4, 5, 6, 7, 8];

const source = {};
const sourceScale = sqrt6 / 720;
for (const [id, [x, y]] of Object.entries(rawSource)) {
  source[id] = [(x - 581) * sourceScale, (1504 - y) * sourceScale];
}
source.A = [0, 0];
source.B = [sqrt6, 0];
source.T = [sqrt6 / 2, 3 * sqrt2 / 2];

const target = {};
const midpoint = [(rawTarget.H0[0] + rawTarget.H3[0]) / 2, (rawTarget.H0[1] + rawTarget.H3[1]) / 2];
const vector = [rawTarget.H3[0] - rawTarget.H0[0], rawTarget.H3[1] - rawTarget.H0[1]];
const halfLength = Math.hypot(...vector) / 2;
const ex = [vector[0] / Math.hypot(...vector), vector[1] / Math.hypot(...vector)];
const ey = [ex[1], -ex[0]];
for (const [id, value] of Object.entries(rawTarget)) {
  const relative = [value[0] - midpoint[0], value[1] - midpoint[1]];
  target[id] = [
    (relative[0] * ex[0] + relative[1] * ex[1]) / halfLength,
    (relative[0] * ey[0] + relative[1] * ey[1]) / halfLength
  ];
}
Object.assign(target, {
  H0: [-1, 0], H1: [-0.5, -sqrt3 / 2], H2: [0.5, -sqrt3 / 2],
  H3: [1, 0], H4: [0.5, sqrt3 / 2], H5: [-0.5, sqrt3 / 2]
});

function permutations(values) {
  if (values.length === 1) return [values];
  return values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index))
    .map(rest => [value, ...rest]));
}
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

const correspondences = sourceFaces.map((sourceFace, sourceIndex) => {
  const targetFace = targetFaces[targetForSource[sourceIndex]];
  let best = null;
  for (const permutation of permutations(targetFace.map((_, index) => index))) {
    let error = 0;
    for (let first = 0; first < sourceFace.length; first += 1) {
      for (let second = first + 1; second < sourceFace.length; second += 1) {
        error += (distance(source[sourceFace[first]], source[sourceFace[second]])
          - distance(target[targetFace[permutation[first]]], target[targetFace[permutation[second]]])) ** 2;
      }
    }
    const sameOrientation = cross(source[sourceFace[0]], source[sourceFace[1]], source[sourceFace[2]])
      * cross(target[targetFace[permutation[0]]], target[targetFace[permutation[1]]], target[targetFace[permutation[2]]]) > 0;
    if (sameOrientation && (!best || error < best.error)) best = { error, permutation };
  }
  return sourceFace.map((sourceId, index) => [sourceId, targetFace[best.permutation[index]]]);
});

const fixedSource = new Set(["A", "T", "B"]);
const fixedTarget = new Set(["H0", "H1", "H2", "H3", "H4", "H5"]);
const variables = [];
for (const id of Object.keys(source)) if (!fixedSource.has(id)) variables.push(["source", id]);
for (const id of Object.keys(target)) if (!fixedTarget.has(id)) variables.push(["target", id]);
const initialVector = variables.flatMap(([group, id]) => (group === "source" ? source : target)[id]);

const sourceLines = [
  [["A", "B"], ["L0", "R0"]], [["A", "T"], ["L1"]], [["T", "B"], ["R1"]],
  [["L0", "R1"], ["W", "Y", "Q", "V", "Z"]], [["X", "Z"], ["C"]],
  [["U", "X"], ["Q"]]
];
const targetLines = [
  [["H0", "H1"], ["L"]], [["H1", "H2"], ["F"]], [["H2", "H3"], ["E", "D"]],
  [["H3", "H4"], ["J"]], [["H4", "H5"], ["I"]], [["H5", "H0"], ["G"]],
  [["J", "K"], ["C"]], [["G", "I"], ["K", "Y"]], [["E", "F"], ["R", "X"]]
];

function unpack(vector) {
  const groups = {
    source: Object.fromEntries(Object.entries(source).map(([id, value]) => [id, [...value]])),
    target: Object.fromEntries(Object.entries(target).map(([id, value]) => [id, [...value]]))
  };
  variables.forEach(([group, id], index) => { groups[group][id] = [vector[2 * index], vector[2 * index + 1]]; });
  return groups;
}

function residuals(vector) {
  const groups = unpack(vector);
  const result = [];
  correspondences.forEach((mapping, faceIndex) => {
    for (let first = 0; first < mapping.length; first += 1) {
      for (let second = first + 1; second < mapping.length; second += 1) {
        result.push(4 * (
          distance(groups.source[mapping[first][0]], groups.source[mapping[second][0]])
          - distance(groups.target[mapping[first][1]], groups.target[mapping[second][1]])
        ));
      }
    }
  });
  for (const [groupName, definitions] of [["source", sourceLines], ["target", targetLines]]) {
    const group = groups[groupName];
    for (const [[first, second], pointIds] of definitions) {
      const divisor = distance(group[first], group[second]);
      pointIds.forEach(id => result.push(4 * cross(group[first], group[second], group[id]) / divisor));
    }
  }
  vector.forEach((value, index) => result.push(1e-8 * (value - initialVector[index])));
  return result;
}

function solveLinear(matrix, rhs) {
  const size = rhs.length;
  const augmented = matrix.map((row, index) => [...row, rhs[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const value = augmented[column][column];
    if (Math.abs(value) < 1e-14) continue;
    for (let entry = column; entry <= size; entry += 1) augmented[column][entry] /= value;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let entry = column; entry <= size; entry += 1) augmented[row][entry] -= factor * augmented[column][entry];
    }
  }
  return augmented.map(row => row[size]);
}

let vectorState = [...initialVector];
let lambda = 1e-3;
for (let iteration = 0; iteration < 120; iteration += 1) {
  const base = residuals(vectorState);
  const cost = base.reduce((sum, value) => sum + value * value, 0);
  const epsilon = 1e-6;
  const jacobian = base.map(() => Array(vectorState.length).fill(0));
  for (let column = 0; column < vectorState.length; column += 1) {
    const perturbed = [...vectorState];
    perturbed[column] += epsilon;
    const values = residuals(perturbed);
    values.forEach((value, row) => { jacobian[row][column] = (value - base[row]) / epsilon; });
  }
  const normal = Array.from({ length: vectorState.length }, () => Array(vectorState.length).fill(0));
  const rhs = Array(vectorState.length).fill(0);
  for (let row = 0; row < base.length; row += 1) {
    for (let first = 0; first < vectorState.length; first += 1) {
      rhs[first] -= jacobian[row][first] * base[row];
      for (let second = 0; second < vectorState.length; second += 1) {
        normal[first][second] += jacobian[row][first] * jacobian[row][second];
      }
    }
  }
  normal.forEach((row, index) => { row[index] += lambda; });
  const delta = solveLinear(normal, rhs);
  const candidate = vectorState.map((value, index) => value + delta[index]);
  const candidateCost = residuals(candidate).reduce((sum, value) => sum + value * value, 0);
  if (candidateCost < cost) {
    vectorState = candidate;
    lambda *= 0.3;
  } else lambda *= 10;
  if (iteration % 10 === 0 || iteration === 119) console.log({ iteration, cost, candidateCost, lambda });
}

const solved = unpack(vectorState);
console.log(JSON.stringify({
  maxResidual: Math.max(...residuals(vectorState).map(Math.abs)),
  correspondences,
  source: solved.source,
  target: solved.target
}, null, 2));
