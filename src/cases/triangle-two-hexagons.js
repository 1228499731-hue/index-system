import { triangleTwoHexagonsResearch } from "./research/triangle-two-hexagons.js";

const S = Math.sqrt(3);
const points = {
  A: { x: -1, y: 0 }, B: { x: 0, y: 0 }, C: { x: -0.5, y: S / 6 },
  D: { x: -0.5, y: S / 2 }, E: { x: 0, y: S / 3 }, F: { x: 0.5, y: S / 2 },
  G: { x: 0, y: S }, H: { x: 0.5, y: S / 6 }, I: { x: 1, y: 0 }
};
const colors = ["#e3a43c", "#4fa0bd", "#d3bd3f", "#98bc5d", "#4fa0bd", "#e3a43c"];

export const triangleTwoHexagons = {
  id: "triangle-two-hexagons",
  status: "implemented",
  name: "等边三角形 → 两个正六边形（6 块）",
  shortName: "三角形 → 双六边形",
  motionType: "planar-swing",
  viewport: { width: 1000, height: 650, centerX: 500, baseY: 505, scale: 220 },
  attribution: {
    text: "构造：Hafner、Frederickson（Wolfram Demonstrations Project，CC BY-NC-SA）",
    url: triangleTwoHexagonsResearch.source.url
  },
  geometry: {
    points,
    sourceOutline: ["A", "I", "G"],
    targetShape: "two-regular-hexagons",
    pieces: [
      { id: "triangle1", pointIds: ["A", "B", "C"] },
      { id: "triangle3", pointIds: ["A", "C", "D"] },
      { id: "delta", pointIds: ["D", "E", "F", "G"] },
      { id: "hexagon", pointIds: ["C", "B", "H", "F", "E", "D"] },
      { id: "triangle4", pointIds: ["I", "F", "H"] },
      { id: "triangle2", pointIds: ["B", "I", "H"] }
    ].map((piece, index) => ({ ...piece, color: colors[index] })),
    labels: []
  },
  challenges: {
    cuts: {
      requiredCount: 8,
      answerIds: ["A-C", "B-C", "B-H", "H-I", "C-D", "D-E", "E-F", "F-H"],
      candidates: [
        ["A-C", "A", "C"], ["B-C", "B", "C"], ["B-H", "B", "H"], ["H-I", "H", "I"],
        ["C-D", "C", "D"], ["D-E", "D", "E"], ["E-F", "E", "F"], ["F-H", "F", "H"],
        ["B-E", "B", "E"], ["C-E", "C", "E"], ["E-H", "E", "H"], ["D-F", "D", "F"],
        ["B-G", "B", "G"]
      ].map(([id, start, end], index) => ({ id, start, end, labelT: index % 2 ? 0.65 : 0.35 })),
      hints: ["提示 1：底部左右两组切线关于竖直中线对称。", "提示 2：中央绿色块的六条边全部来自真实分块边界。"]
    },
    hinges: {
      requiredCount: 5,
      answerIds: ["A", "D", "C", "F", "I"],
      candidates: ["A", "D", "C", "F", "I", "B", "E", "H", "G"].map(pointId => ({ id: pointId, pointId })),
      chain: [
        { id: "A", pieces: ["triangle1", "triangle3"] },
        { id: "D", pieces: ["triangle3", "delta"] },
        { id: "C", pieces: ["triangle3", "hexagon"] },
        { id: "F", pieces: ["hexagon", "triangle4"] },
        { id: "I", pieces: ["triangle4", "triangle2"] }
      ],
      hints: ["提示：五个铰点构成一棵分叉铰链树；左右两端的底角都是铰点。"]
    }
  },
  motion: {
    solver: "triangle-two-hexagons",
    collisionPolicy: "collision-free-verified",
    durationMs: 6200,
    hingeIds: ["A", "D", "C", "F", "I"],
    hingeMap: { ex4: "A", ex1: "D", fixed: "C", ex3: "F", ex2: "I" }
  },
  teaching: {
    sourceName: "等边三角形", targetName: "两个正六边形",
    preview: { source: "triangle", target: "two-hexagons" },
    subtitle: "等边三角形 → 两个正六边形 · 6 块平面摆动式铰链剖分",
    stages: ["① 找割线", "② 找铰链", "③ 变形"],
    phase1: {
      number: "CHALLENGE 01", title: "怎样把等边三角形，<br>精确切成六块？",
      description: "请选择 <strong>8 条正确分块边</strong>。<br><br>这些边界组成四个三角形、一个四边形和一个凹六边形。",
      countLabel: "已选择割线", checkLabel: "验证我的割法", initialMessage: "请选择八条来自真实六块构造的分块边。",
      boardTip: "👆 点击虚线，选择 <strong>8 条割线</strong>"
    },
    phase2: {
      number: "CHALLENGE 02", title: "哪五个点，<br>组成真实铰链树？",
      description: "请选择 <strong>5 个真实铰点</strong>。<br><br>六块刚体通过分叉拓扑保持连接。",
      countLabel: "已选择铰点", checkLabel: "验证铰点", boardTip: "六块已经产生 · 请选择 <strong>5 个铰接点</strong>"
    },
    phase3: {
      number: "CHALLENGE 03", title: "分两步摆动，<br>组成两个正六边形！",
      description: "第一阶段旋转中央上块和右下块；第二阶段再摆动左右支链。<br><br>全程只使用二维旋转，不需要翻面，也没有正面积重叠。",
      motionInfo: "已验证：<br>• 六块全程保持刚性<br>• 五个铰链全程重合<br>• 初末构型精确覆盖三角形与两个正六边形",
      boardTip: "铰链安装完成 · 点击右侧 <strong>开始变形</strong>",
      finalMessage: "✓ 变形完成！<br><br>六块刚体已组成两个全等正六边形；面积守恒且全程无翻面。"
    }
  }
};
