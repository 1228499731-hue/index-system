export class AnimationController {
  constructor() {
    this.frameId = null;
    this.timerIds = new Set();
    this.generation = 0;
  }

  cancelAll() {
    this.generation += 1;
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.timerIds.forEach(id => clearTimeout(id));
    this.timerIds.clear();
  }

  delay(callback, milliseconds) {
    const generation = this.generation;
    const timerId = window.setTimeout(() => {
      this.timerIds.delete(timerId);
      if (generation === this.generation) callback();
    }, milliseconds);
    this.timerIds.add(timerId);
    return timerId;
  }

  animate({ from, to, duration, onFrame, onComplete }) {
    this.cancelAll();
    const generation = this.generation;
    const startedAt = performance.now();
    const frame = now => {
      if (generation !== this.generation) return;
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      onFrame(from + (to - from) * eased, generation);
      if (raw < 1) this.frameId = requestAnimationFrame(frame);
      else {
        this.frameId = null;
        onComplete(to, generation);
      }
    };
    this.frameId = requestAnimationFrame(frame);
    return generation;
  }
}
