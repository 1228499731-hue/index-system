import { add, midpoint, multiply, projectPointToLine, subtract } from "../geometry/vector.js";

function createPoints() {
  const height = Math.sqrt(3) / 2;
  const points = {
    A: { x: 0, y: height },
    B: { x: -0.5, y: 0 },
    C: { x: 0.5, y: 0 }
  };
  points.D = midpoint(points.A, points.B);
  points.E = midpoint(points.B, points.C);
  const tJ = 0.254507616716242;
  points.J = add(points.A, multiply(subtract(points.C, points.A), tJ));
  points.K = add(points.A, multiply(subtract(points.C, points.A), tJ + 0.5));
  points.L = projectPointToLine(points.D, points.J, points.E);
  points.M = projectPointToLine(points.K, points.J, points.E);
  return points;
}

export const dudeneyTriangleSquare = {
  id: "dudeney-triangle-square",
  status: "implemented",
  name: "等边三角形 → 正方形",
  shortName: "三角形 → 正方形",
  motionType: "planar-swing",
  viewport: { width: 1000, height: 650, centerX: 500, baseY: 320, scale: 320 },
  geometry: {
    points: createPoints(),
    sourceOutline: ["A", "B", "C"],
    targetShape: "square",
    pieces: [
      { id: "piece1", pointIds: ["A", "D", "L", "J"], color: "#f15b6c" },
      { id: "piece2", pointIds: ["D", "B", "E", "L"], color: "#4d9dea" },
      { id: "piece3", pointIds: ["J", "K", "M"], color: "#ffc345" },
      { id: "piece4", pointIds: ["K", "C", "E", "M"], color: "#42c791" }
    ],
    labels: [
      { pointId: "A", text: "A", dx: -6, dy: -13 },
      { pointId: "B", text: "B", dx: -19, dy: 19 },
      { pointId: "C", text: "C", dx: 11, dy: 19 }
    ]
  },
  challenges: {
    cuts: {
      requiredCount: 3,
      answerIds: ["JE", "DL", "KM"],
      candidates: [
        { id: "JE", start: "J", end: "E" },
        { id: "DL", start: "D", end: "L" },
        { id: "KM", start: "K", end: "M" },
        { id: "DE", start: "D", end: "E" },
        { id: "DJ", start: "D", end: "J" },
        { id: "AE", start: "A", end: "E" },
        { id: "BK", start: "B", end: "K" }
      ],
      hints: [
        "提示 1：正确方案中有一条明显较长的主割线。",
        "提示 2：另外两条短割线都与主割线垂直。"
      ]
    },
    hinges: {
      requiredCount: 3,
      answerIds: ["D", "E", "K"],
      candidates: ["D", "E", "K", "J", "L", "M"].map(pointId => ({ id: pointId, pointId })),
      chain: [
        { id: "D", pieces: ["piece1", "piece2"] },
        { id: "E", pieces: ["piece2", "piece4"] },
        { id: "K", pieces: ["piece4", "piece3"] }
      ],
      hints: ["提示：正确铰点必须把四块依次连接成一条运动链。"]
    }
  },
  motion: {
    solver: "dudeney-triangle-square",
    durationMs: 4000,
    hingeIds: ["D", "E", "K"]
  },
  teaching: {
    subtitle: "杜德尼三角形 → 正方形铰链剖分",
    stages: ["① 找割线", "② 找铰链", "③ 变形"],
    phase1: {
      number: "CHALLENGE 01",
      title: "只切三刀，<br>如何变成正方形？",
      description: "请从图中选择 <strong>3 条候选割线</strong>。<br><br>正确后，三角形将被分成 <strong>4 个刚性几何块</strong>。",
      countLabel: "已选择割线",
      checkLabel: "验证我的割法",
      initialMessage: "请选择三条候选割线。",
      boardTip: "👆 点击虚线，选择 <strong>3 条割线</strong>"
    },
    phase2: {
      number: "CHALLENGE 02",
      title: "哪三个点，<br>才是真正的铰链？",
      description: "四块已经切开。<br><br>请从图中的候选圆点里，选择 <strong>3 个铰接位置</strong>，让四块形成连续运动链。",
      countLabel: "已选择铰点",
      checkLabel: "验证铰点",
      boardTip: "四块已经产生 · 请选择 <strong>3 个铰接点</strong>"
    },
    phase3: {
      number: "CHALLENGE 03",
      title: "铰链安装完成，<br>让它动起来！",
      description: "四块现在由三个转动铰链连接。<br><br>点击按钮，观察它们如何连续变形成正方形。",
      motionInfo: "观察三个现象：<br>• 每个色块自身形状始终不变<br>• 相邻色块始终通过铰点连接<br>• 整个运动画面保持固定",
      boardTip: "铰链安装完成 · 点击右侧 <strong>开始变形</strong>",
      finalMessage: "✓ 变形完成！<br><br>没有增加任何拼块，也没有改变任何一块的面积。<br><br>只是改变各块之间的相对角度，三角形就变成了正方形。"
    }
  }
};
