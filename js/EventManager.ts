import BaseManager from 'BaseManager';

class EventManager extends BaseManager {
  public emit(eventName: string) {
    console.log(`[emit] ${eventName}`);

    if(eventName === 'visit_website') {
      this.game.increaseVisitCount(1);
    }
  }
}

export default EventManager;