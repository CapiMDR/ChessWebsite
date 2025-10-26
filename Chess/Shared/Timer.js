export class Timer{
  constructor(time, increment=0) {
    this.initialTime = time*60;
    this.remainingTime = time*60;
    this.intervalID = null;
    this.isPaused = false;
    this.increment=increment;
    this.engineOwner = null;
  }
  
  getTime(){
    return this.convertSeconds(this.remainingTime);
  }
  
  convertSeconds(s){
    const minu = floor(s / 60);
    const sec = s % 60;
    return nf(minu, 2) + ':' + nf(sec, 2);
  }

  start(){
    if(this.intervalID) return;
    this.intervalID = setInterval(() => {
      if(this.isPaused) return;
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.stop();
        this.engineOwner.handleTimeOut();
        return;  
      }
    }, 1000); // Update every second
  }

  pause(){
    this.isPaused = true;
    this.remainingTime+=this.increment;
  }

  play(){
    this.isPaused = false;
  }

  stop(){
    clearInterval(this.intervalID);
    this.intervalID = null;
  }
}
