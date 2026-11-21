// Bengkel Sepeda — input: mouse clicks on either panel, plus full
// keyboard play. Arrow keys steer a reticle inside the active panel,
// Tab swaps panels, Enter marks, H asks for a hint, P pauses, R restarts.

import { PANEL } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_SWAP = 16;

export function createInput(canvas, toLogical) {
  const held = new Set();
  let actions = 0;
  const clicks = [];

  function onKeyDown(event) {
    const key = event.key;
    if (key === 'Tab') {
      event.preventDefault();
      actions |= ACTION_SWAP;
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      actions |= ACTION_CONFIRM;
      return;
    }
    const lower = key.toLowerCase();
    if (lower === 'h') actions |= ACTION_HINT;
    else if (lower === 'p' || key === 'Escape') actions |= ACTION_PAUSE;
    else if (lower === 'r') actions |= ACTION_RESTART;
    else if (key.startsWith('Arrow')) {
      event.preventDefault();
      held.add(key);
    }
  }

  function onKeyUp(event) {
    held.delete(event.key);
  }

  function onPointer(event) {
    const rect = canvas.getBoundingClientRect();
    const point = toLogical(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
    clicks.push(point);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointer);

  return {
    /** Reticle velocity in logical px per second, from held arrow keys. */
    reticleVelocity(speed) {
      let vx = 0;
      let vy = 0;
      if (held.has('ArrowLeft')) vx -= speed;
      if (held.has('ArrowRight')) vx += speed;
      if (held.has('ArrowUp')) vy -= speed;
      if (held.has('ArrowDown')) vy += speed;
      return { vx, vy };
    },
    takeActions() {
      const value = actions;
      actions = 0;
      return value;
    },
    takeClicks() {
      const list = clicks.slice();
      clicks.length = 0;
      return list;
    },
    /** Which panel (0 left, 1 right, -1 none) a logical point falls in, plus panel-local coords. */
    panelAt(point) {
      if (point.y < PANEL.y || point.y > PANEL.y + PANEL.height) return { panel: -1, x: 0, y: 0 };
      if (point.x >= PANEL.leftX && point.x <= PANEL.leftX + PANEL.width) {
        return { panel: 0, x: point.x - PANEL.leftX, y: point.y - PANEL.y };
      }
      if (point.x >= PANEL.rightX && point.x <= PANEL.rightX + PANEL.width) {
        return { panel: 1, x: point.x - PANEL.rightX, y: point.y - PANEL.y };
      }
      return { panel: -1, x: 0, y: 0 };
    },
  };
}
