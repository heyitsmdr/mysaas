import BaseObject from './BaseObject';
import Rack from './Rack';
import Server from './Server';
import VM from './VM';
import { ISavedDataCenter } from './interfaces/ISavedGame';

class DataCenter extends BaseObject {
  private racks: Array<Rack> = [];

  public save(): ISavedDataCenter {
    return {
      racks: this.racks.map(rack => rack.save())
    }
  }
  
  public load(savedDc: ISavedDataCenter): void {
    savedDc.racks.forEach(savedRack => {
      const rack = this.addRack();
      rack.load(savedRack);
    });
  }

  public addRack(): Rack {
    const rack = new Rack(this.game);
    this.racks.push(rack);
    this.game.infraManager.updateRackCount();
    return rack;
  }

  public getRacks(): Array<Rack> {
    return this.racks;
  }

  public getAllServers(): Array<Server> {
    let servers: Array<Server> = [];
    this.racks.forEach(rack => {
      rack.getServers().forEach(server => servers.push(server));
    });
    return servers;
  }

  public getAllVMs(): Array<VM> {
    let vms: Array<VM> = [];
    this.racks.forEach(rack => {
      rack.getServers().forEach(server => {
        server.getVMs().forEach(vm => vms.push(vm));
      });
    });

    return vms;
  }
}

export default DataCenter;