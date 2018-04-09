import BaseManager from './BaseManager';

class EventManager extends BaseManager {
  public emit(eventName: string) {
    console.log(`[emit] ${eventName}`);

    if(eventName === 'visit_website') {
      const result: any = this.game.trafficManager.generateHit();

      const div: HTMLDivElement = document.createElement('div');
      div.className = 'pre';
      div.innerHTML = `<span class="status-${result.statusCode === 200 ? 'good' : 'bad'}">${result.statusCode}</span> <span class="handled-by">${result.handledBy}</span> ${result.method} <span class="path">${result.path}</span>`;
      document.querySelector('.traffic .access-logs .container').appendChild(div);

      if (result.statusCode === 200) {
        this.game.increaseHitCounter();
        this.game.giveMoneyForHit();
      }

      this.game.infraManager.renderInfrastructureView();
    }
  }
}

export default EventManager;