import BaseManager from './BaseManager';
import { VM } from '../VM';

class TrafficManager extends BaseManager {
  public generateHit(): Object {
    const method = this.getRandomMethodType();
    const path = this.getRandomPath(method);

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
    const vm: VM = capableVMs[Math.floor(Math.random() * capableVMs.length)];
    const success = vm.handleRequest(method, path);

    return {
      method: method,
      path: path,
      handledBy: vm.getName(),
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
          '/contact-us'
        ];
        break;
      case 'POST':
        paths = [
          '/login',
          '/signup',
          '/help-request'
        ];
        break;
    }

    return paths[Math.floor(Math.random() * paths.length)];
  }
}

export default TrafficManager;