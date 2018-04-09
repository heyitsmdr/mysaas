import BaseManager from './BaseManager';

class EventManager extends BaseManager {
  public emit(eventName: string) {
    console.log(`[emit] ${eventName}`);

    if(eventName === 'visit_website') {
      const result: any = this.game.trafficManager.generateHit();
      const div: HTMLDivElement = document.createElement('div');
      div.className = 'pre';
      div.innerHTML = `<span class="status-good">${result.statusCode}</span> ${result.method} <span class="path">${result.path}</span>`;
      document.querySelector('.traffic .access-logs .container').appendChild(div);
    }
  }
}

export default EventManager;