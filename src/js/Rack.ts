import BaseObject from './BaseObject';
import Server from './Server';
import { ISavedRack } from './interfaces/ISavedGame';

class Rack extends BaseObject {
  private servers: Array<Server> = [];

  public save(): ISavedRack {
    return {
      servers: this.servers.map(server => server.save())
    }
  }
  
  public load(savedRack: ISavedRack): void {
    savedRack.servers.forEach(savedServer => {
      const server = this.addServer();
      server.load(savedServer);
    });
  }

  public addServer(): Server {
    const server = new Server(this.game);
    this.servers.push(server);
    this.game.infraManager.updateServerCount();
    this.game.infraManager.renderInfrastructureView();
    return server;
  }

  public getServers(): Array<Server> {
    return this.servers;
  }
}

export default Rack;