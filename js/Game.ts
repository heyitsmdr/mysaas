import EventManager from 'EventManager';

class Game {
  // Managers
  public eventManager: EventManager;

  // Stats
  private visitCount: number = 0;

  constructor () {
    this.eventManager = new EventManager(this);
  }

  public increaseVisitCount(increaseBy: number) {
    this.visitCount += increaseBy;
    document.querySelector('#visit-count').innerHTML = this.visitCount.toString();
  }
}

export default Game;

window['Game'] = new Game();