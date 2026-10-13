import { hexagonTriangleResearch } from "./research/hexagon-triangle.js";

const points = Object.fromEntries(Object.entries(hexagonTriangleResearch.sourcePoints).map(([id, value]) => [id, { ...value }]));
const colors = ["#f15b6c", "#4d9dea", "#ffc345", "#42c791", "#9b6de3", "#ef7e55", "#55b9c6", "#e4a43a", "#6d83df"];

export const hexagonTriangle = {
  id: "hexagon-triangle",
  status: "implemented",
  name: "正六边形 → 等边三角形（9 块）",
  shortName: "六边形 → 三角形",
  motionType: "planar-swing",
  viewport: { width: 1000, height: 650, centerX: 430, baseY: 325, scale: 185 },
  attribution: {
    text: "构造：Demaine、Demaine、Eppstein、Frederickson、Friedman（Figure 39）",
    url: "https://arxiv.org/abs/cs/9907018"
  },
  geometry: {
    points,
    sourceOutline: ["H0", "H1", "H2", "H3", "H4", "H5"],
    targetShape: "equilateral-triangle",
    pieces: [
      { id: "piece01", pointIds: ["R", "C", "D", "E"] },
      { id: "piece02", pointIds: ["C", "J", "H3", "D"] },
      { id: "piece03", pointIds: ["J", "K", "I", "H4"] },
      { id: "piece04", pointIds: ["I", "Y", "H5"] },
      { id: "piece05", pointIds: ["Y", "G", "H5"] },
      { id: "piece06", pointIds: ["C", "L", "H0", "G", "K"] },
      { id: "piece07", pointIds: ["L", "C", "R", "F", "H1"] },
      { id: "piece08", pointIds: ["F", "X", "H2"] },
      { id: "piece09", pointIds: ["E", "H2", "X"] }
    ].map((piece, index) => ({ ...piece, color: colors[index] })),
    labels: []
  },
  challenges: {
    cuts: {
      requiredCount: 8,
      answerIds: ["J-K", "C-L", "C-R", "C-D", "E-F", "G-I", "H2-X", "H5-Y"],
      candidates: [
        { id: "J-K", start: "J", end: "K", labelT: 0.32 },
        { id: "C-L", start: "C", end: "L", labelT: 0.55 },
        { id: "C-R", start: "C", end: "R", labelT: 0.55 },
        { id: "C-D", start: "C", end: "D", labelT: 0.7 },
        { id: "E-F", start: "E", end: "F", labelT: 0.45 },
        { id: "G-I", start: "G", end: "I", labelT: 0.45 },
        { id: "H2-X", start: "H2", end: "X", labelT: 0.55 },
        { id: "H5-Y", start: "H5", end: "Y", labelT: 0.55 },
        { id: "H0-H3", start: "H0", end: "H3", labelT: 0.2 },
        { id: "H1-H4", start: "H1", end: "H4", labelT: 0.35 },
        { id: "H2-H5", start: "H2", end: "H5", labelT: 0.65 },
        { id: "C-F", start: "C", end: "F", labelT: 0.6 },
        { id: "C-I", start: "C", end: "I", labelT: 0.6 }
      ],
      hints: [
        "提示 1：三条正确割线从内部点 C 向外展开。",
        "提示 2：两条短虚线分别切开右下角和左上角的小三角形。"
      ]
    },
    hinges: {
      requiredCount: 8,
      answerIds: ["C", "J", "I", "Y", "G", "L", "F", "X"],
      candidates: ["C", "J", "I", "Y", "G", "L", "F", "X", "K", "R", "D", "E", "H2"].map(pointId => ({ id: pointId, pointId })),
      chain: [
        { id: "C", pieces: ["piece01", "piece02"] },
        { id: "J", pieces: ["piece02", "piece03"] },
        { id: "I", pieces: ["piece03", "piece04"] },
        { id: "Y", pieces: ["piece04", "piece05"] },
        { id: "G", pieces: ["piece05", "piece06"] },
        { id: "L", pieces: ["piece06", "piece07"] },
        { id: "F", pieces: ["piece07", "piece08"] },
        { id: "X", pieces: ["piece08", "piece09"] }
      ],
      hints: ["提示：八个铰点把九块依次连接成一条开链；不要选择链的两个自由端点。"]
    }
  },
  motion: {
    solver: "hexagon-triangle",
    collisionPolicy: "wobbly-overlap-allowed",
    durationMs: 6200,
    hingeIds: ["C", "J", "I", "Y", "G", "L", "F", "X"],
    hingeMap: { hinge01: "C", hinge02: "J", hinge03: "I", hinge04: "Y", hinge05: "G", hinge06: "L", hinge07: "F", hinge08: "X" }
  },
  teaching: {
    sourceName: "正六边形", targetName: "等边三角形",
    preview: { source: "hexagon", target: "triangle" },
    subtitle: "正六边形 → 等边三角形 · 9 块平面摆动式铰链剖分",
    stages: ["① 找割线", "② 找铰链", "③ 变形"],
    phase1: {
      number: "CHALLENGE 01", title: "怎样把正六边形，<br>精确切成九块？",
      description: "请选择 <strong>8 条正确割线</strong>。<br><br>其中三条是为构成可扩展线性铰链而加入的辅助切口。",
      countLabel: "已选择割线", checkLabel: "验证我的割法",
      initialMessage: "请选择八条构成真实九块剖分的割线。",
      boardTip: "👆 点击虚线，选择 <strong>8 条割线</strong>"
    },
    phase2: {
      number: "CHALLENGE 02", title: "哪八个点，<br>能把九块连成开链？",
      description: "请选择 <strong>8 个真实铰点</strong>。<br><br>相邻拼块在这些点上始终保持连接。",
      countLabel: "已选择铰点", checkLabel: "验证铰点",
      boardTip: "九块已经产生 · 请选择 <strong>8 个铰接点</strong>"
    },
    phase3: {
      number: "CHALLENGE 03", title: "摆动八个铰链，<br>组成等边三角形！",
      description: "这是纯二维 swing-hinged 构造，不需要翻面。<br><br>文献采用允许中途穿越的 <strong>wobbly</strong> 模型，终态没有重叠。",
      motionInfo: "已验证：<br>• 九块全程保持刚性<br>• 八个铰链全程重合<br>• 初末构型分别精确覆盖正六边形与等边三角形",
      boardTip: "铰链安装完成 · 点击右侧 <strong>开始变形</strong>",
      finalMessage: "✓ 变形完成！<br><br>正六边形的九块刚体已组成面积相同的等边三角形；全程没有翻面。"
    }
  }
};
