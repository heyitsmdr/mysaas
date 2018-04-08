import EventManager from './managers/EventManager';
import InfraManager from './managers/InfraManager';

class Game {
  // Managers
  public eventManager: EventManager;
  public infraManager: InfraManager;

  // Stats
  private visitCount: number = 0;

  constructor () {
    this.eventManager = new EventManager(this);
    this.infraManager = new InfraManager(this);
  }

  public increaseVisitCount(increaseBy: number) {
    this.visitCount += increaseBy;
    document.querySelector('#visit-count').innerHTML = this.visitCount.toString();
  }
}

export default Game;

window['Game'] = new Game();