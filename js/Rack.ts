import BaseObject from './BaseObject';
import Server from './Server';

class Rack extends BaseObject {
  private servers: Array<Server> = [];

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