import { dudeneyTriangleSquare } from "./dudeney-triangle-square.js";
import { greekCrossSquareLoyd } from "./greek-cross-square-loyd.js";
import { hexagonSquare } from "./hexagon-square.js";
import { hexagonTriangle } from "./hexagon-triangle.js";
import { triangleTwoHexagons } from "./triangle-two-hexagons.js";

export const caseRegistry = [
  dudeneyTriangleSquare,
  greekCrossSquareLoyd,
  { id: "greek-cross-hexagon", name: "希腊十字形 → 正六边形", status: "geometry-pending", motionType: "planar-swing" },
  hexagonSquare,
  hexagonTriangle,
  { id: "pentagon-triangle", name: "正五边形 → 等边三角形", status: "geometry-pending", motionType: "flip-assisted" },
  triangleTwoHexagons
];

export function getCase(caseId) {
  return caseRegistry.find(item => item.id === caseId) ?? null;
}

export function getImplementedCase(caseId) {
  const caseSpec = getCase(caseId);
  return caseSpec?.status === "implemented" ? caseSpec : null;
}
