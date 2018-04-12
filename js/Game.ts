import EventManager from './managers/EventManager';
import InfraManager from './managers/InfraManager';
import TrafficManager from './managers/TrafficManager';
import ISavedGame from './interfaces/ISavedGame';
import ShopManager from './managers/ShopManager';

class Game {
  // Managers
  public eventManager: EventManager;
  public infraManager: InfraManager;
  public trafficManager: TrafficManager;
  public shopManager: ShopManager;

  // Saved
  private visitCount: number = 0;
  private money: number = 0;
  private moneyPerHit: number = 1;

  // Private
  private saveTimer: any = null;

  constructor () {
    this.eventManager = new EventManager(this);
    this.infraManager = new InfraManager(this);
    this.trafficManager = new TrafficManager(this);
    this.shopManager = new ShopManager(this);

    this.loadSavedGame();
    this.saveTimer = setInterval(this.saveGame.bind(this), 1000);
  }

  public saveGame() {
    const savedGame: ISavedGame = {
      lastSaveTime: Date.now(),
      infrastructure: this.infraManager.save(),
      visitCount: this.visitCount,
      money: this.money,
      moneyPerHit: this.moneyPerHit,
      shop: this.shopManager.save()
    };

    localStorage.setItem('savedGame', JSON.stringify(savedGame));
  }

  public loadSavedGame() {
    if (localStorage.getItem('savedGame') !== null) {
      const savedGame: ISavedGame = JSON.parse(localStorage.getItem('savedGame'));
      this.increaseHitCounter(savedGame.visitCount);
      this.giveMoney(savedGame.money);
      this.moneyPerHit = savedGame.moneyPerHit;
      this.infraManager.load(savedGame.infrastructure);
      this.shopManager.load(savedGame.shop);
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

  public increaseHitCounter(amount: number = 1) {
    this.visitCount += amount;
    document.querySelector('#hit-count').innerHTML = this.visitCount.toString();
  }

  public giveMoney(money: number) {
    this.money += money;
    this.updateMoney();
  }

  public takeMoney(money: number) {
    this.money -= money;
    this.updateMoney();
  }

  public updateMoney(): void {
    document.querySelector('#money-count').innerHTML = `$${this.money.toString()}`;
  }

  public giveMoneyForHit() {
    this.giveMoney(this.moneyPerHit);
  }

  public getMoney() {
    return this.money;
  }
}

export default Game;

window['Game'] = new Game();