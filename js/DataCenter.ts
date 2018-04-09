import BaseObject from './BaseObject';
import Rack from './Rack';

class DataCenter extends BaseObject {
  private racks: Array<Rack> = [];

  public addRack(): Rack {
    const rack = new Rack(this.game);
    this.racks.push(rack);
    this.game.infraManager.updateRackCount();
    return rack;
  }

  public getRacks(): Array<Rack> {
    return this.racks;
  }
}

export default DataCenter;