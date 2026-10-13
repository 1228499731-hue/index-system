import { area, signedArea } from "./polygon.js";

const DEFAULT_TOLERANCE = 1e-9;

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function pointInTriangle(value, a, b, c, tolerance) {
  return cross(a, b, value) >= -tolerance
    && cross(b, c, value) >= -tolerance
    && cross(c, a, value) >= -tolerance;
}

export function triangulate(points, tolerance = DEFAULT_TOLERANCE) {
  const vertices = signedArea(points) >= 0 ? [...points] : [...points].reverse();
  const triangles = [];
  const remaining = vertices.map((_, index) => index);
  let attempts = 0;

  while (remaining.length > 3) {
    let clipped = false;
    for (let index = 0; index < remaining.length; index += 1) {
      const previous = remaining[(index - 1 + remaining.length) % remaining.length];
      const current = remaining[index];
      const next = remaining[(index + 1) % remaining.length];
      const triangle = [vertices[previous], vertices[current], vertices[next]];
      if (cross(...triangle) <= tolerance) continue;

      const containsVertex = remaining.some(candidate => (
        candidate !== previous
        && candidate !== current
        && candidate !== next
        && pointInTriangle(vertices[candidate], ...triangle, tolerance)
      ));
      if (containsVertex) continue;

      triangles.push(triangle);
      remaining.splice(index, 1);
      clipped = true;
      break;
    }

    attempts += 1;
    if (!clipped || attempts > points.length * points.length) {
      throw new Error("Polygon could not be triangulated");
    }
  }

  triangles.push(remaining.map(index => vertices[index]));
  return triangles;
}

function lineIntersection(start, end, clipStart, clipEnd) {
  const segment = point => ({ x: point.x - start.x, y: point.y - start.y });
  const edge = {
    x: clipEnd.x - clipStart.x,
    y: clipEnd.y - clipStart.y
  };
  const direction = segment(end);
  const denominator = direction.x * edge.y - direction.y * edge.x;
  if (Math.abs(denominator) < DEFAULT_TOLERANCE) return end;
  const offset = segment(clipStart);
  const parameter = (offset.x * edge.y - offset.y * edge.x) / denominator;
  return {
    x: start.x + parameter * direction.x,
    y: start.y + parameter * direction.y
  };
}

function clipConvex(subject, clipPolygon, tolerance) {
  let output = [...subject];
  for (let edgeIndex = 0; edgeIndex < clipPolygon.length; edgeIndex += 1) {
    const clipStart = clipPolygon[edgeIndex];
    const clipEnd = clipPolygon[(edgeIndex + 1) % clipPolygon.length];
    const input = output;
    output = [];
    if (input.length === 0) break;

    let start = input[input.length - 1];
    for (const end of input) {
      const endInside = cross(clipStart, clipEnd, end) >= -tolerance;
      const startInside = cross(clipStart, clipEnd, start) >= -tolerance;
      if (endInside) {
        if (!startInside) output.push(lineIntersection(start, end, clipStart, clipEnd));
        output.push(end);
      } else if (startInside) {
        output.push(lineIntersection(start, end, clipStart, clipEnd));
      }
      start = end;
    }
  }
  return output;
}

export function polygonIntersectionArea(first, second, tolerance = DEFAULT_TOLERANCE) {
  const firstTriangles = triangulate(first, tolerance);
  const secondTriangles = triangulate(second, tolerance);
  let result = 0;
  for (const firstTriangle of firstTriangles) {
    for (const secondTriangle of secondTriangles) {
      const clipped = clipConvex(firstTriangle, secondTriangle, tolerance);
      if (clipped.length >= 3) result += area(clipped);
    }
  }
  return result;
}

export function validatePolygonCoverage(pieces, target, tolerance = 1e-7) {
  const polygons = Object.values(pieces);
  const targetArea = area(target);
  const piecesArea = polygons.reduce((sum, polygon) => sum + area(polygon), 0);
  const insideArea = polygons.reduce(
    (sum, polygon) => sum + polygonIntersectionArea(polygon, target, tolerance),
    0
  );
  let overlapArea = 0;
  for (let first = 0; first < polygons.length; first += 1) {
    for (let second = first + 1; second < polygons.length; second += 1) {
      overlapArea += polygonIntersectionArea(polygons[first], polygons[second], tolerance);
    }
  }

  const areaError = Math.abs(piecesArea - targetArea);
  const outsideArea = Math.max(0, piecesArea - insideArea);
  return {
    valid: areaError <= tolerance && outsideArea <= tolerance && overlapArea <= tolerance,
    targetArea,
    piecesArea,
    insideArea,
    outsideArea,
    overlapArea,
    areaError
  };
}

