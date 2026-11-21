// Bengkel Sepeda — boot and the one loop. The game moves between title,
// play, paused, level-clear, win and time-up screens. A click on either
// picture (or Enter on the reticle) marks a difference when it lands on
// one; a miss costs 3 seconds and shakes the frame.
//
// ?shot=start|play|level2|win stages that scene, paints it twice and
// sets window.__shotReady so a headless browser can photograph it.

import { BEST_KEY, LEVELS, PANEL, RULES, STEP } from './config.js';
import { SCENES } from './scenes.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, ACTION_RESTART, ACTION_SWAP, createInput } from './input.js';
import { createRenderer, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { playClear, playFound, playHint, playMiss, playOver, playTick } from './audio.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);

function freshState() {
  return {
    screen: SCREEN_TITLE,
    level: 0,
    total: LEVELS[0].diffs,
    found: new Set(),
    foundCount: 0,
    score: 0,
    streak: 0,
    best: 0,
    timeLeft: LEVELS[0].seconds,
    hintCooldown: 0,
    hint: null,
    miss: null,
    shake: 0,
    animTime: 0,
    activePanel: 0,
    reticle: { x: 300, y: 226 },
    lastTickSecond: -1,
  };
}

const state = freshState();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function startLevel(index, keepScore) {
  state.level = index;
  state.total = LEVELS[index].diffs;
  state.found = new Set();
  state.foundCount = 0;
  state.streak = 0;
  state.timeLeft = LEVELS[index].seconds;
  state.hintCooldown = 0;
  state.hint = null;
  state.miss = null;
  state.shake = 0;
  state.activePanel = 0;
  state.reticle = { x: 300, y: 226 };
  state.lastTickSecond = -1;
  if (!keepScore) state.score = 0;
  state.screen = SCREEN_PLAY;
  announce(`${LEVELS[index].name}. ${state.total} differences to find.`);
}

function finishRun() {
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
}

function markAt(panel, lx, ly) {
  const scene = SCENES[state.level];
  for (const diff of scene.diffs) {
    if (state.found.has(diff.id)) continue;
    const dx = lx - diff.x;
    const dy = ly - diff.y;
    const reach = diff.r + RULES.hitSlack;
    if (dx * dx + dy * dy <= reach * reach) {
      state.found.add(diff.id);
      state.foundCount += 1;
      state.streak += 1;
      state.score += RULES.findPoints + (state.streak - 1) * RULES.streakBonus;
      if (state.hint && state.hint.diff.id === diff.id) state.hint = null;
      playFound(state.streak);
      const left = state.total - state.foundCount;
      announce(left === 0 ? 'All found!' : `Found ${diff.label}. ${left} left.`);
      if (left === 0) {
        state.score += Math.ceil(state.timeLeft) * RULES.timeBonusPerSecond;
        playClear();
        if (state.level >= LEVELS.length - 1) {
          state.screen = SCREEN_WIN;
          finishRun();
          announce(`Workshop master! Final score ${state.score}.`);
        } else {
          state.screen = SCREEN_CLEAR;
        }
      }
      return true;
    }
  }
  // A miss: time penalty, shake, streak reset.
  state.streak = 0;
  state.timeLeft = Math.max(0, state.timeLeft - RULES.wrongPenaltySeconds);
  state.shake = 1;
  state.miss = { panel, x: lx, y: ly, ttl: 0.45 };
  playMiss();
  announce(`Not a difference. Minus ${RULES.wrongPenaltySeconds} seconds.`);
  if (state.timeLeft <= 0) {
    state.screen = SCREEN_OVER;
    finishRun();
    playOver();
  }
  return false;
}

function askHint() {
  if (state.screen !== SCREEN_PLAY || state.hintCooldown > 0) return;
  const scene = SCENES[state.level];
  const remaining = scene.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hint = { diff, ttl: 3 };
  state.hintCooldown = RULES.hintCooldownSeconds;
  state.score = Math.max(0, state.score - RULES.hintCost);
  playHint();
  announce(`Hint: look for ${diff.label}.`);
}

function runShot(name) {
  stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, renderer.toLogical);
  state.best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM) {
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) {
        startLevel(0, false);
      } else if (state.screen === SCREEN_CLEAR) {
        startLevel(state.level + 1, true);
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (state.screen === SCREEN_PLAY) {
        markAt(state.activePanel, state.reticle.x, state.reticle.y);
      }
    }
    if (actions & ACTION_PAUSE) {
      if (state.screen === SCREEN_PLAY) {
        state.screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT) askHint();
    if (actions & ACTION_RESTART && state.screen !== SCREEN_TITLE) {
      startLevel(0, false);
    }
    if (actions & ACTION_SWAP && state.screen === SCREEN_PLAY) {
      state.activePanel = state.activePanel === 0 ? 1 : 0;
      announce(state.activePanel === 0 ? 'Picture A.' : 'Picture B.');
    }
  }

  function step() {
    state.animTime += STEP;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - STEP * 2.4);
    if (state.miss) {
      state.miss.ttl -= STEP;
      if (state.miss.ttl <= 0) state.miss = null;
    }
    if (state.hint) {
      state.hint.ttl -= STEP;
      if (state.hint.ttl <= 0) state.hint = null;
    }
    if (state.screen !== SCREEN_PLAY) return;
    if (state.hintCooldown > 0) state.hintCooldown = Math.max(0, state.hintCooldown - STEP);
    // Reticle steering.
    const vel = input.reticleVelocity(RULES.reticleSpeed);
    state.reticle.x = Math.max(8, Math.min(PANEL.width - 8, state.reticle.x + vel.vx * STEP));
    state.reticle.y = Math.max(8, Math.min(PANEL.height - 8, state.reticle.y + vel.vy * STEP));
    // Mouse marks.
    for (const point of input.takeClicks()) {
      const hit = input.panelAt(point);
      if (hit.panel >= 0) {
        state.activePanel = hit.panel;
        state.reticle = { x: hit.x, y: hit.y };
        markAt(hit.panel, hit.x, hit.y);
        if (state.screen !== SCREEN_PLAY) break;
      }
    }
    if (state.screen !== SCREEN_PLAY) return;
    // Countdown.
    state.timeLeft -= STEP;
    const whole = Math.ceil(state.timeLeft);
    if (whole <= 10 && whole >= 1 && whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      finishRun();
      playOver();
      announce(`Time up. ${state.foundCount} of ${state.total} found.`);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    // Title-screen clicks start the game too.
    if (state.screen === SCREEN_TITLE) {
      const clicks = input.takeClicks();
      if (clicks.length > 0) startLevel(0, false);
    }
    while (accumulator >= STEP) {
      step();
      accumulator -= STEP;
    }
    renderer.draw(state);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Bengkel Sepeda. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
