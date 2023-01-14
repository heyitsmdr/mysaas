import Game from './Game';

class BaseObject {
  public game: Game;

  constructor(game: Game) {
    this.game = game;
  }
}

export default BaseObject;