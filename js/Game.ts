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
  private moneyPerHit: number = 1;

  constructor () {
    this.eventManager = new EventManager(this);
    this.infraManager = new InfraManager(this);
    this.trafficManager = new TrafficManager(this);
    this.loadSavedGame();
  }

  public increaseHitCounter() {
    this.visitCount += 1;
    document.querySelector('#hit-count').innerHTML = this.visitCount.toString();
  }

  public loadSavedGame() {
    if (localStorage.getItem('savedGame') !== null) {
      // Set up a saved game..
      return;
    }

    // Create a new game
    this.giveMoney(1000);
    const dc = this.infraManager.addDataCenter();
    const rack = dc.addRack();
    const server = rack.addServer();
    const vm = server.createVM(1, 1, 10, 0);
    vm.setPoweredOn(true);
  }

  public giveMoney(money: number) {
    this.money += money;
    document.querySelector('#money-count').innerHTML = `$${this.money.toString()}`;
  }

  public giveMoneyForHit() {
    this.giveMoney(this.moneyPerHit);
  }
}

export default Game;

window['Game'] = new Game();