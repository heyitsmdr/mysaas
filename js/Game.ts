import EventManager from './managers/EventManager';
import InfraManager from './managers/InfraManager';
import TrafficManager from './managers/TrafficManager';

class Game {
  // Managers
  public eventManager: EventManager;
  public infraManager: InfraManager;
  public trafficManager: TrafficManager;
  
  // Stats
  private visitCount: number = 0;
  private money: number = 0;

  constructor () {
    this.eventManager = new EventManager(this);
    this.infraManager = new InfraManager(this);
    this.trafficManager = new TrafficManager(this);
    this.loadSavedGame();
  }

  public increaseVisitCount(increaseBy: number) {
    this.visitCount += increaseBy;
    document.querySelector('#visit-count').innerHTML = this.visitCount.toString();
  }

  public loadSavedGame() {
    if (localStorage.getItem('savedGame') !== null) {
      // Set up a saved game..
      return;
    }

    // Create a new game
    this.addMoney(1000);
    const dc = this.infraManager.addDatacenter();
    const rack = dc.addRack();
    const server = rack.addServer();
    const vm = server.createVM(1, 1, 10, 0);
    vm.setPoweredOn(true);
  }

  public addMoney(money: number) {
    this.money += money;
    document.querySelector('#money-count').innerHTML = `$${this.money.toString()}`;
  }
}

export default Game;

window['Game'] = new Game();