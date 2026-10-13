import { hexagonSquareResearch } from "./research/hexagon-square.js";

const points = Object.fromEntries(
  Object.entries(hexagonSquareResearch.sourcePoints).map(([id, value]) => [id, { ...value }])
);

const colors = [
  "#f15b6c", "#4d9dea", "#ffc345", "#42c791", "#9b6de3",
  "#ef7e55", "#55b9c6", "#e4a43a", "#6d83df", "#62ad72"
];

export const hexagonSquare = {
  id: "hexagon-square",
  status: "implemented",
  name: "正六边形 → 正方形（10 块）",
  shortName: "六边形 → 正方形",
  motionType: "planar-swing",
  viewport: { width: 1000, height: 650, centerX: 430, baseY: 325, scale: 190 },
  attribution: {
    text: "构造：Demaine、Demaine、Eppstein、Frederickson、Friedman（Figure 37）",
    url: "https://arxiv.org/abs/cs/9907018"
  },
  geometry: {
    points,
    sourceOutline: ["LM", "LU", "T", "RU", "RM", "nLU", "nT", "nRU"],
    targetShape: "square",
    pieces: [
      { id: "piece01", pointIds: ["B", "RU", "RM", "P2"] },
      { id: "piece02", pointIds: ["A", "T", "B"] },
      { id: "piece03", pointIds: ["A", "B", "P3", "P4"] },
      { id: "piece04", pointIds: ["P4", "P2", "P3"] },
      { id: "piece05", pointIds: ["LM", "LU", "A", "P4"] },
      { id: "piece06", pointIds: ["nB", "nRU", "LM", "nP2"] },
      { id: "piece07", pointIds: ["nA", "nT", "nB"] },
      { id: "piece08", pointIds: ["nA", "nB", "nP3", "nP4"] },
      { id: "piece09", pointIds: ["nP4", "nP2", "nP3"] },
      { id: "piece10", pointIds: ["RM", "nLU", "nA", "nP4"] }
    ].map((piece, index) => ({ ...piece, color: colors[index] })),
    labels: []
  },
  challenges: {
    cuts: {
      requiredCount: 9,
      answerIds: [
        "A-B", "A-P4", "B-P2", "P4-P3", "LM-RM",
        "nA-nB", "nA-nP4", "nB-nP2", "nP4-nP3"
      ],
      candidates: [
        { id: "A-B", start: "A", end: "B", labelT: 0.25 },
        { id: "A-P4", start: "A", end: "P4", labelT: 0.35 },
        { id: "B-P2", start: "B", end: "P2", labelT: 0.3 },
        { id: "P4-P3", start: "P4", end: "P3", labelT: 0.55 },
        { id: "LM-RM", start: "LM", end: "RM", labelT: 0.5 },
        { id: "nA-nB", start: "nA", end: "nB", labelT: 0.25 },
        { id: "nA-nP4", start: "nA", end: "nP4", labelT: 0.35 },
        { id: "nB-nP2", start: "nB", end: "nP2", labelT: 0.3 },
        { id: "nP4-nP3", start: "nP4", end: "nP3", labelT: 0.55 },
        { id: "T-nT", start: "T", end: "nT", labelT: 0.18 },
        { id: "A-nA", start: "A", end: "nA", labelT: 0.28 },
        { id: "B-nB", start: "B", end: "nB", labelT: 0.72 },
        { id: "P3-nP3", start: "P3", end: "nP3", labelT: 0.35 },
        { id: "LU-nRU", start: "LU", end: "nRU", labelT: 0.5 }
      ],
      hints: [
        "提示 1：构造关于六边形中心成二重旋转对称，上下两半的割法相同。",
        "提示 2：中间的水平线是正确割线；每一半还需要四条线段。"
      ]
    },
    hinges: {
      requiredCount: 9,
      answerIds: ["B", "A", "P3", "P4", "LM", "nB", "nA", "nP3", "nP4"],
      candidates: [
        "B", "A", "P3", "P4", "LM", "nB", "nA", "nP3", "nP4",
        "RM", "T", "P2", "nP2", "nT"
      ].map(pointId => ({ id: pointId, pointId })),
      chain: [
        { id: "B", pieces: ["piece01", "piece02"] },
        { id: "A", pieces: ["piece02", "piece03"] },
        { id: "P3", pieces: ["piece03", "piece04"] },
        { id: "P4", pieces: ["piece04", "piece05"] },
        { id: "LM", pieces: ["piece05", "piece06"] },
        { id: "nB", pieces: ["piece06", "piece07"] },
        { id: "nA", pieces: ["piece07", "piece08"] },
        { id: "nP3", pieces: ["piece08", "piece09"] },
        { id: "nP4", pieces: ["piece09", "piece10"] }
      ],
      hints: [
        "提示：十块拼块按顺序连接成开链；中心线左端是链中点附近的一个铰点。"
      ]
    }
  },
  motion: {
    solver: "hexagon-square",
    collisionPolicy: "wobbly-overlap-allowed",
    durationMs: 6500,
    hingeIds: ["B", "A", "P3", "P4", "LM", "nB", "nA", "nP3", "nP4"],
    hingeMap: {
      hinge01: "B", hinge02: "A", hinge03: "P3", hinge04: "P4", hinge05: "LM",
      hinge06: "nB", hinge07: "nA", hinge08: "nP3", hinge09: "nP4"
    }
  },
  teaching: {
    sourceName: "正六边形",
    targetName: "正方形",
    preview: { source: "hexagon", target: "square" },
    subtitle: "正六边形 → 正方形 · 10 块平面摆动式铰链剖分",
    stages: ["① 找割线", "② 找铰链", "③ 变形"],
    phase1: {
      number: "CHALLENGE 01",
      title: "怎样把正六边形，<br>精确切成十块？",
      description: "请选择 <strong>9 条正确割线</strong>。<br><br>构造来自两条交叉条带，并关于中心成二重旋转对称。",
      countLabel: "已选择割线",
      checkLabel: "验证我的割法",
      initialMessage: "请选择九条构成真实十块剖分的割线。",
      boardTip: "👆 点击虚线，选择 <strong>9 条割线</strong>"
    },
    phase2: {
      number: "CHALLENGE 02",
      title: "在哪九个点，<br>把十块连接成开链？",
      description: "论文原图给出十铰链闭环；在一个点断开后，得到更适合连续展示的 <strong>9 铰链开链</strong>。",
      countLabel: "已选择铰点",
      checkLabel: "验证铰点",
      boardTip: "十块已经产生 · 请选择 <strong>9 个铰接点</strong>"
    },
    phase3: {
      number: "CHALLENGE 03",
      title: "转动九个铰链，<br>把六边形摆成正方形！",
      description: "每块只作二维刚体旋转。<br><br>此文献构造属于 <strong>wobbly swing-hinged</strong> 模型，允许拼块在运动途中相互穿越，但终态没有重叠。",
      motionInfo: "已验证：<br>• 十块的边长和面积全程不变<br>• 九个实际铰链全程保持重合<br>• 初态和终态分别精确覆盖正六边形与正方形",
      boardTip: "铰链安装完成 · 点击右侧 <strong>开始变形</strong>",
      finalMessage: "✓ 变形完成！<br><br>十块刚体重新组合成面积相同的正方形。该运动遵循文献采用的、允许中途穿越的平面摆动模型。"
    }
  }
};
