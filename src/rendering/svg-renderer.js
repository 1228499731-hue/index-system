const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function pointString(points) {
  return points.map(point => `${point.x},${point.y}`).join(" ");
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export class SvgRenderer {
  constructor(svg) {
    this.svg = svg;
    this.layers = Object.fromEntries(
      ["source", "pieces", "cuts", "outline", "hingeCandidates", "hinges", "labels"].map(name => [
        name,
        svg.querySelector(`[data-layer="${name}"]`)
      ])
    );
    this.pieceElements = new Map();
    this.cutElements = new Map();
    this.hingeCandidateElements = new Map();
    this.hingeElements = new Map();
  }

  clear() {
    Object.values(this.layers).forEach(layer => layer.replaceChildren());
    this.pieceElements.clear();
    this.cutElements.clear();
    this.hingeCandidateElements.clear();
    this.hingeElements.clear();
  }

  build(caseSpec, screenPoints, handlers) {
    this.clear();
    this.svg.setAttribute("viewBox", `0 0 ${caseSpec.viewport.width} ${caseSpec.viewport.height}`);

    const outlinePoints = caseSpec.geometry.sourceOutline.map(id => screenPoints[id]);
    this.layers.source.append(svgElement("polygon", { class: "source-fill", points: pointString(outlinePoints) }));
    this.layers.outline.append(svgElement("polygon", { class: "source-outline", points: pointString(outlinePoints) }));

    caseSpec.geometry.pieces.forEach(piece => {
      const polygon = svgElement("polygon", { class: "piece", "data-piece-id": piece.id, fill: piece.color });
      this.layers.pieces.append(polygon);
      this.pieceElements.set(piece.id, polygon);
    });

    shuffle(caseSpec.challenges.cuts.candidates).forEach((definition, index) => {
      const start = screenPoints[definition.start];
      const end = screenPoints[definition.end];
      const group = svgElement("g", { class: "candidate", "data-id": definition.id });
      const lineAttributes = { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
      group.append(svgElement("line", { ...lineAttributes, class: "candidate-hit" }));
      group.append(svgElement("line", { ...lineAttributes, class: "candidate-line" }));
      const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      group.append(svgElement("circle", { cx: midpoint.x, cy: midpoint.y, r: 13, class: "line-number-circle" }));
      const label = svgElement("text", { x: midpoint.x, y: midpoint.y, class: "line-number-text" });
      label.textContent = String(index + 1);
      group.append(label);
      group.addEventListener("pointerdown", event => {
        event.preventDefault();
        handlers.onCutToggle(definition.id);
      });
      this.layers.cuts.append(group);
      this.cutElements.set(definition.id, group);
    });

    caseSpec.geometry.labels.forEach(definition => {
      const point = screenPoints[definition.pointId];
      const label = svgElement("text", {
        x: point.x + definition.dx,
        y: point.y + definition.dy,
        class: "point-label"
      });
      label.textContent = definition.text;
      this.layers.labels.append(label);
    });
  }

  buildHingeCandidates(caseSpec, screenPoints, onToggle) {
    this.layers.hingeCandidates.replaceChildren();
    this.hingeCandidateElements.clear();
    shuffle(caseSpec.challenges.hinges.candidates).forEach((definition, index) => {
      const point = screenPoints[definition.pointId];
      const group = svgElement("g", { class: "hinge-candidate", "data-id": definition.id });
      group.append(svgElement("circle", { cx: point.x, cy: point.y, r: 17, class: "hinge-candidate-hit" }));
      group.append(svgElement("circle", { cx: point.x, cy: point.y, r: 13, class: "hinge-candidate-circle" }));
      const label = svgElement("text", { x: point.x, y: point.y, class: "hinge-candidate-text" });
      label.textContent = String(index + 1);
      group.append(label);
      group.addEventListener("pointerdown", event => {
        event.preventDefault();
        onToggle(definition.id);
      });
      this.layers.hingeCandidates.append(group);
      this.hingeCandidateElements.set(definition.id, group);
    });
  }

  buildRealHinges(hingeIds) {
    this.layers.hinges.replaceChildren();
    this.hingeElements.clear();
    hingeIds.forEach(id => {
      const group = svgElement("g", { class: "real-hinge", "data-id": id });
      group.append(svgElement("circle", { cx: 0, cy: 0, r: 11, class: "real-hinge-glow" }));
      group.append(svgElement("circle", { cx: 0, cy: 0, r: 11, class: "real-hinge-ring" }));
      group.append(svgElement("circle", { cx: 0, cy: 0, r: 5.5, class: "real-hinge-center" }));
      this.layers.hinges.append(group);
      this.hingeElements.set(id, group);
    });
  }

  renderGeometry(frame) {
    Object.entries(frame.geometry).forEach(([id, points]) => {
      this.pieceElements.get(id)?.setAttribute("points", pointString(points));
    });
    Object.entries(frame.hinges ?? {}).forEach(([id, point]) => {
      this.hingeElements.get(id)?.setAttribute("transform", `translate(${point.x} ${point.y})`);
    });
  }

  renderSelections(selectedCuts, selectedHinges) {
    this.cutElements.forEach((element, id) => element.classList.toggle("selected", selectedCuts.has(id)));
    this.hingeCandidateElements.forEach((element, id) => element.classList.toggle("selected", selectedHinges.has(id)));
  }

  showCorrectCuts(answerIds) {
    const answers = new Set(answerIds);
    this.cutElements.forEach((element, id) => {
      if (answers.has(id)) {
        element.classList.add("correct");
        element.querySelectorAll("circle,text").forEach(child => { child.style.opacity = "0"; });
      } else element.style.opacity = "0";
    });
  }

  showCorrectHinges(answerIds) {
    const answers = new Set(answerIds);
    this.hingeCandidateElements.forEach((element, id) => {
      if (answers.has(id)) element.classList.add("correct");
      else element.style.opacity = "0";
    });
  }

  flashWrong(kind, ids) {
    const map = kind === "cuts" ? this.cutElements : this.hingeCandidateElements;
    ids.forEach(id => {
      const element = map.get(id);
      element?.classList.add("wrong");
      window.setTimeout(() => element?.classList.remove("wrong"), 900);
    });
  }

  hint(kind, id) {
    const map = kind === "cuts" ? this.cutElements : this.hingeCandidateElements;
    const element = map.get(id);
    element?.classList.add("hinted");
    return () => element?.classList.remove("hinted");
  }

  setLayerOpacity(layer, value) {
    this.layers[layer].style.opacity = value;
  }

  resetLayerOpacity() {
    Object.values(this.layers).forEach(layer => layer.style.removeProperty("opacity"));
  }
}
