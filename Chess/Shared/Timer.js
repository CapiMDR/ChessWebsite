export class Timer extends EventTarget {
  constructor(time, increment = 0) {
    super();
    this.initialTime = time * 60;
    this.remainingTime = time * 60;
    this.intervalID = null;
    this.isPaused = false;
    this.increment = increment;
    this.engineOwner = null;
  }

  getTime() {
    return this.convertSeconds(this.remainingTime);
  }

  convertSeconds(s) {
    const minu = Math.floor(s / 60);
    const sec = s % 60;
    return String(minu).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  start() {
    if (this.intervalID) return;
    this.intervalID = setInterval(() => {
      if (this.isPaused) return;
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.stop();

        //Emit event when timer runs out
        this.dispatchEvent(new CustomEvent("timeout"));
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
    this.remainingTime += this.increment;
  }

  play() {
    this.isPaused = false;
  }

  stop() {
    clearInterval(this.intervalID);
    this.intervalID = null;
  }
}
