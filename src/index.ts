import Game from './js/Game';

// Add Game to window object.
declare global {
  interface Window { Game: any; }
}

window['Game'] = new Game();