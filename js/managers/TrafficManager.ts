import BaseManager from './BaseManager';

class TrafficManager extends BaseManager {
  public generateHit(): Object {
    const method = this.getRandomMethodType();
    const path = this.getRandomPath(method);

    console.log(method, path);

    return {
      method: method,
      path: path,
      statusCode: 200
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