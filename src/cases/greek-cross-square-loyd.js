/*
 * Adapted from the mathematical construction in:
 * Izidor Hafner and Greg N. Frederickson (2011),
 * "Two Hinged Dissections of a Greek Cross to a Square".
 * Licensed CC BY-NC-SA 3.0 Unported. This JavaScript implementation is modified
 * from the published Wolfram Language model and does not embed its animation.
 */

function createPoints() {
  return {
    A: { x: -0.5, y: 1.5 }, B: { x: 0.5, y: 1.5 },
    C: { x: 0.5, y: 0.5 }, D: { x: 1.5, y: 0.5 },
    E: { x: 1.5, y: -0.5 }, F: { x: 0.5, y: -0.5 },
    G: { x: 0.5, y: -1.5 }, H: { x: -0.5, y: -1.5 },
    I: { x: -0.5, y: -0.5 }, J: { x: -1.5, y: -0.5 },
    K: { x: -1.5, y: 0.5 }, L: { x: -0.5, y: 0.5 },
    O: { x: 0, y: 0 },
    H1: { x: 1, y: -0.5 },
    H2: { x: -0.5, y: -1 },
    H3: { x: -1, y: 0.5 },
    H4: { x: 0.5, y: 1 }
  };
}

export const greekCrossSquareLoyd = {
  id: "greek-cross-square-loyd",
  status: "implemented",
  name: "希腊十字形 → 正方形（Loyd）",
  shortName: "十字形 → 正方形",
  motionType: "planar-swing",
  viewport: { width: 1000, height: 650, centerX: 500, baseY: 220, scale: 125 },
  attribution: {
    text: "构造：Izidor Hafner、Greg N. Frederickson（2011）· CC BY-NC-SA 3.0",
    url: "https://demonstrations.wolfram.com/TwoHingedDissectionsOfAGreekCrossToASquare/"
  },
  geometry: {
    points: createPoints(),
    sourceOutline: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
    targetShape: "square",
    pieces: [
      { id: "pieceA", pointIds: ["O", "H2", "H", "G", "F", "H1"], color: "#f15b6c" },
      { id: "pieceB", pointIds: ["O", "H1", "E", "D", "C", "H4"], color: "#4d9dea" },
      { id: "pieceC", pointIds: ["O", "H4", "B", "A", "L", "H3"], color: "#ffc345" },
      { id: "pieceD", pointIds: ["O", "H3", "K", "J", "I", "H2"], color: "#42c791" }
    ],
    labels: []
  },
  challenges: {
    cuts: {
      requiredCount: 2,
      answerIds: ["H3-H1", "H2-H4"],
      candidates: [
        { id: "H3-H1", start: "H3", end: "H1", labelT: 0.2 },
        { id: "H2-H4", start: "H2", end: "H4", labelT: 0.25 },
        { id: "C-I", start: "C", end: "I", labelT: 0.2 },
        { id: "L-F", start: "L", end: "F", labelT: 0.8 },
        { id: "C-L", start: "C", end: "L" },
        { id: "I-F", start: "I", end: "F" },
        { id: "B-H", start: "B", end: "H", labelT: 0.25 }
      ],
      hints: [
        "提示 1：两条正确割线都穿过十字形中心。",
        "提示 2：正确割线互相垂直，并把图形分成四块全等拼块。"
      ]
    },
    hinges: {
      requiredCount: 3,
      answerIds: ["H1", "H2", "H3"],
      candidates: ["H1", "H2", "H3", "H4", "O", "C", "I"].map(pointId => ({ id: pointId, pointId })),
      chain: [
        { id: "H1", pieces: ["pieceA", "pieceB"] },
        { id: "H2", pieces: ["pieceA", "pieceD"] },
        { id: "H3", pieces: ["pieceD", "pieceC"] }
      ],
      hints: ["提示：中心点不是铰链；三个铰点把四块连接成一条开链。"]
    }
  },
  motion: {
    solver: "greek-cross-square-loyd",
    durationMs: 4200,
    hingeIds: ["H1", "H2", "H3"],
    hingeMap: { "loyd-h1": "H1", "loyd-h2": "H2", "loyd-h3": "H3" }
  },
  teaching: {
    sourceName: "希腊十字形",
    targetName: "正方形",
    preview: { source: "cross", target: "square" },
    subtitle: "Loyd 希腊十字形 → 正方形铰链剖分",
    stages: ["① 找割线", "② 找铰链", "③ 变形"],
    phase1: {
      number: "CHALLENGE 01",
      title: "只切两刀，<br>如何得到四块全等拼块？",
      description: "请从图中选择 <strong>2 条候选割线</strong>。<br><br>正确的两条直线会把希腊十字形分成 <strong>4 个全等刚体</strong>。",
      countLabel: "已选择割线",
      checkLabel: "验证我的割法",
      initialMessage: "请选择两条候选割线。",
      boardTip: "👆 点击虚线，选择 <strong>2 条割线</strong>"
    },
    phase2: {
      number: "CHALLENGE 02",
      title: "哪三个顶点，<br>能把四块连成开链？",
      description: "四块已经切开。<br><br>请选择 <strong>3 个铰接位置</strong>，使相邻刚体在运动中始终共享同一铰点。",
      countLabel: "已选择铰点",
      checkLabel: "验证铰点",
      boardTip: "四块已经产生 · 请选择 <strong>3 个铰接点</strong>"
    },
    phase3: {
      number: "CHALLENGE 03",
      title: "保持刚体不变，<br>把十字形摆成正方形！",
      description: "四块由三个平面转动铰链连接。<br><br>运动分为两段，每段只改变链上的相对转角。",
      motionInfo: "观察三个现象：<br>• 四块始终保持全等且不变形<br>• 三个铰链在全程保持重合<br>• 两阶段摆动中拼块不发生正面积重叠",
      boardTip: "铰链安装完成 · 点击右侧 <strong>开始变形</strong>",
      finalMessage: "✓ 变形完成！<br><br>四块的形状和面积完全不变，三个铰链也始终连接。<br><br>希腊十字形已重新组合成面积相同的正方形。"
    }
  }
};

