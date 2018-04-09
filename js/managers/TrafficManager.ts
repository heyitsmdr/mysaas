import BaseManager from './BaseManager';
import { VM } from '../VM';
import Game from '../Game';

class TrafficManager extends BaseManager {
  private requestsPerSecTimer: any = null;
  private requestsPerSec: number = 0;

  constructor(game: Game) {
    super(game);
    this.requestsPerSecTimer = setInterval(this.resetAndRenderRPS.bind(this), 1000);
  }

  public resetAndRenderRPS(): void {
    this.game.infraManager.updateRps(this.requestsPerSec);
    this.requestsPerSec = 0;
  }

  public getRequestsPerSec(): number {
    return this.requestsPerSec;
  }

  public generateHit(): Object {
    const method: String = this.getRandomMethodType();
    const path: String = this.getRandomPath(method);
    let success: Boolean = true;

    this.requestsPerSec += 1;

    // Compile a list of VMs capable of handling this route
    // We will favor microservices over web monolith where
    // appropriate.
    let capableVMs: Array<VM> = [];
    this.game.infraManager.getDataCenters().forEach(dc => {
      dc.getAllVMs().forEach(vm => {
        if (vm.getPoweredOn() === true) {
          if (vm.canHandle(path) === true) {
            capableVMs.push(vm);
          }
        }
      });
    });

    // Get a random VM and pass the request on to the VM for handling
    let vm: VM = null;
    if (capableVMs.length === 0) {
      success = false;
    } else {
      vm = capableVMs[Math.floor(Math.random() * capableVMs.length)];
      success = vm.handleRequest(method, path);
    }

    return {
      method: method,
      path: path,
      handledBy: success ? vm.getName() : '-',
      statusCode: success ? 200 : 500
    };
  }

  private getRandomMethodType(): String {
    const methods = ['GET', 'POST'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  private getRandomPath(methodName: String): String {
    let paths = [];

    switch (methodName) {
      case 'GET':
        paths = [
          '/',
          '/about',
          '/jobs',
          '/contact-us',
          '/static/background.png',
          '/static/favicon.ico',
          '/static/sitemap.xml'
        ];
        for(let i = 1; i <= 100; i++) {
          paths.push(`/static/img/image${i.toString()}.png`);
        }
        break;
      case 'POST':
        paths = [
          '/api/login',
          '/api/signup',
          '/api/help/request',
        ];
        for(let i = 1; i <= 100; i++) {
          paths.push(`/api/help/${i.toString()}/save`);
          paths.push(`/api/help/${i.toString()}/edit`);
        }
        break;
    }

    return paths[Math.floor(Math.random() * paths.length)];
  }
}

export default TrafficManager;