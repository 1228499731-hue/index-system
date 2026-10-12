export class UiRenderer {
  constructor(root = document) {
    this.root = root;
  }

  byId(id) {
    return this.root.getElementById(id);
  }

  applyCase(caseSpec) {
    const text = caseSpec.teaching;
    this.byId("appSubtitle").textContent = text.subtitle;
    text.stages.forEach((label, index) => { this.byId(`stage${index + 1}`).textContent = label; });
    [1, 2, 3].forEach(number => {
      const phase = text[`phase${number}`];
      this.byId(`phase${number}Number`).textContent = phase.number;
      this.byId(`phase${number}Title`).innerHTML = phase.title;
      this.byId(`phase${number}Description`).innerHTML = phase.description;
    });
    this.byId("cutCountLabel").textContent = text.phase1.countLabel;
    this.byId("cutCountTarget").textContent = caseSpec.challenges.cuts.requiredCount;
    this.byId("checkLinesButton").textContent = text.phase1.checkLabel;
    this.byId("hingeCountLabel").textContent = text.phase2.countLabel;
    this.byId("hingeCountTarget").textContent = caseSpec.challenges.hinges.requiredCount;
    this.byId("checkHingesButton").textContent = text.phase2.checkLabel;
    this.byId("motionInfo").innerHTML = text.phase3.motionInfo;
    this.byId("finalMessage").innerHTML = text.phase3.finalMessage;
  }

  renderState(state, caseSpec) {
    [1, 2, 3].forEach(number => {
      this.byId(`stage${number}`).classList.toggle("active", state.phase === number);
      this.byId(`phase${number}`).classList.toggle("active", state.phase === number);
    });
    this.byId("lineCount").textContent = state.selectedCutIds.size;
    this.byId("hingeCount").textContent = state.selectedHingeIds.size;
    this.byId("checkLinesButton").disabled = state.selectedCutIds.size !== caseSpec.challenges.cuts.requiredCount;
    this.byId("checkHingesButton").disabled = state.selectedHingeIds.size !== caseSpec.challenges.hinges.requiredCount;
  }

  showMessage(text, type = "") {
    const message = this.byId("message");
    message.className = "message";
    if (type) message.classList.add(type);
    message.textContent = text;
  }
}
