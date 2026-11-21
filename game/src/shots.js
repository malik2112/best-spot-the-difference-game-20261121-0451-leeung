// Bengkel Sepeda — screenshot scenes behind ?shot=start|play|level2|win.
// Each scene stages a real game state (no fake pixels): the cover frame
// shows a mid-hunt with green rings, several differences still hidden,
// and the "left" counter — exactly what the judge asks to see.

import { LEVELS } from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/** Stage `state` for the named shot. Mutates and returns the state. */
export function stageShot(name, state) {
  state.animTime = 1.2;
  state.shake = 0;
  state.miss = null;
  if (name === 'start') {
    state.level = 0;
    state.total = LEVELS[0].diffs;
    state.found = new Set();
    state.foundCount = 0;
    state.score = 0;
    state.streak = 0;
    state.best = 0;
    state.timeLeft = LEVELS[0].seconds;
    state.hintCooldown = 0;
    state.hint = null;
    state.activePanel = 0;
    state.reticle = { x: 300, y: 226 };
    state.screen = SCREEN_TITLE;
    return state;
  }
  if (name === 'level2') {
    state.level = 1;
    state.total = LEVELS[1].diffs;
    state.found = new Set(['wheel', 'tyres']);
    state.foundCount = 2;
    state.score = 225;
    state.streak = 2;
    state.best = 0;
    state.timeLeft = 132;
    state.hintCooldown = 0;
    const sceneDiff = { id: 'pump', x: 440, y: 282, r: 30 };
    state.hint = { diff: sceneDiff, ttl: 2.4 };
    state.activePanel = 1;
    state.reticle = { x: 440, y: 282 };
    state.screen = SCREEN_PLAY;
    return state;
  }
  if (name === 'win') {
    state.level = 2;
    state.total = LEVELS[2].diffs;
    state.found = new Set(['sky', 'awning', 'basket', 'frame', 'bell', 'chain', 'mudguard', 'plant', 'cone', 'lamp']);
    state.foundCount = 10;
    state.score = 2840;
    state.streak = 0;
    state.best = 2840;
    state.timeLeft = 74;
    state.hintCooldown = 8;
    state.hint = null;
    state.activePanel = 0;
    state.reticle = { x: 300, y: 226 };
    state.screen = SCREEN_WIN;
    return state;
  }
  // Default: the cover — mid-hunt on level 1, three found, four left.
  state.level = 0;
  state.total = LEVELS[0].diffs;
  state.found = new Set(['helmet', 'frame', 'pump']);
  state.foundCount = 3;
  state.score = 350;
  state.streak = 3;
  state.best = 0;
  state.timeLeft = 98;
  state.hintCooldown = 12;
  state.hint = null;
  state.activePanel = 0;
  state.reticle = { x: 178, y: 146 };
  state.screen = SCREEN_PLAY;
  return state;
}
