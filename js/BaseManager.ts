import Game from 'Game';

class BaseManager {
  public game: Game;

  constructor(game: Game) {
    this.game = game;
  }
}

export default BaseManager;