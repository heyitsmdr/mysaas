import BaseManager from './BaseManager';
import VM from '../VM';
import Game from '../Game';

class TrafficManager extends BaseManager {
  private requestsPerSecTimer: any = null;
  private requestsPerSecSuccess: number = 0;
  private requestsPerSecFailure: number = 0;

  constructor(game: Game) {
    super(game);
    this.requestsPerSecTimer = setInterval(this.resetAndRenderRPS.bind(this), 1000);
  }

  public resetAndRenderRPS(): void {
    this.game.infraManager.updateRps(this.requestsPerSecSuccess, this.requestsPerSecFailure);
    this.requestsPerSecSuccess = 0;
    this.requestsPerSecFailure = 0;
  }

  public generateHit(): void {
    const method: String = this.getRandomMethodType();
    const path: String = this.getRandomPath(method);
    let success: Boolean = true;

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

    if (success) {
      this.requestsPerSecSuccess += 1;
    } else {
      this.requestsPerSecFailure += 1;
    }

    const div: HTMLDivElement = document.createElement('div');
    div.className = 'pre';
    div.innerHTML = `<span class="status-${success ? 'good' : 'bad'}">${success ? '200' : '503'}</span> <span class="handled-by">${success ? vm.getName() : '-'}</span> ${method} <span class="path">${path}</span>`;
    document.querySelector('.traffic .access-logs .container').appendChild(div);

    // Cleanup if needed
    const logsRendered = document.querySelectorAll('.traffic .access-logs .container > div');
    if (logsRendered.length >= 250) {
      for (let i = 0; i < 50; i++) {
        document.querySelector('.traffic .access-logs .container').removeChild(logsRendered[i]);
      }
    }

    if (success) {
      this.game.increaseHitCounter();
      this.game.giveMoneyForHit();
    }

    this.game.infraManager.renderInfrastructureView();
  }

  private getRandomMethodType(): String {
    const methods = ['GET', 'POST'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  private getRandomPath(methodName: String): String {
    let paths: String[] = [];

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