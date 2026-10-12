import { dudeneyTriangleSquare } from "./dudeney-triangle-square.js";

export const caseRegistry = [
  dudeneyTriangleSquare,
  { id: "greek-cross-hexagon", name: "希腊十字形 → 正六边形", status: "geometry-pending", motionType: "planar-swing" },
  { id: "hexagon-square", name: "正六边形 → 正方形", status: "geometry-pending", motionType: "planar-swing" },
  { id: "hexagon-triangle", name: "正六边形 → 等边三角形", status: "geometry-pending", motionType: "flip-assisted" },
  { id: "pentagon-triangle", name: "正五边形 → 等边三角形", status: "geometry-pending", motionType: "flip-assisted" },
  { id: "triangle-two-hexagons", name: "等边三角形 → 两个正六边形", status: "geometry-pending", motionType: "planar-swing" }
];

export function getCase(caseId) {
  return caseRegistry.find(item => item.id === caseId) ?? null;
}

export function getImplementedCase(caseId) {
  const caseSpec = getCase(caseId);
  return caseSpec?.status === "implemented" ? caseSpec : null;
}
