// Bengkel Sepeda — rendering: paints the HUD (level, counter, timer bar,
// score, hint state), the two workshop panels with found rings, the hint
// ring, the keyboard reticle, and the title / pause / clear / win screens.

import { FIELD, FONT, HUD, LEVELS, PALETTE, PANEL } from './config.js';
import { SCENES, altFlags } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, FIELD.width, HUD.height);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, HUD.height, FIELD.width, 2);
  ctx.font = `700 26px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText('BENGKEL SEPEDA', 24, 40);
  ctx.font = `500 16px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText('Spot the difference — click either picture', 24, 64);
  // level + counter, centre
  const level = LEVELS[state.level];
  ctx.textAlign = 'center';
  ctx.font = `700 20px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(level.name, FIELD.width / 2, 36);
  const remaining = state.total - state.foundCount;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = remaining === 0 ? PALETTE.found : PALETTE.text;
  ctx.fillText(`${remaining} left`, FIELD.width / 2, 72);
  ctx.font = `500 14px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(`${state.foundCount} of ${state.total} found`, FIELD.width / 2, 94);
  ctx.textAlign = 'left';
  // score + timer, right
  ctx.textAlign = 'right';
  ctx.font = `700 20px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(`Score ${state.score}`, FIELD.width - 24, 36);
  ctx.font = `500 14px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(state.streak > 1 ? `Streak x${state.streak}` : `Best ${state.best}`, FIELD.width - 24, 56);
  ctx.textAlign = 'left';
  // timer bar
  const frac = Math.max(0, Math.min(1, state.timeLeft / level.seconds));
  ctx.fillStyle = '#0f151b';
  roundRect(ctx, 24, 106, FIELD.width - 48, 14, 7);
  ctx.fill();
  ctx.fillStyle = state.timeLeft <= 15 ? PALETTE.timerLow : PALETTE.timerOk;
  if (frac > 0) {
    roundRect(ctx, 24, 106, (FIELD.width - 48) * frac, 14, 7);
    ctx.fill();
  }
  ctx.font = `700 15px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(state.timeLeft), FIELD.width - 24, 100);
  ctx.textAlign = 'left';
  // hint state
  ctx.font = `600 14px ${FONT}`;
  if (state.hintCooldown > 0) {
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText(`Hint in ${Math.ceil(state.hintCooldown)}s (H)`, 24, 100);
  } else {
    ctx.fillStyle = PALETTE.hint;
    ctx.fillText('Hint ready — press H', 24, 100);
  }
}

function drawPanel(ctx, state, panelIndex, panelX, isAlt, shakeX) {
  const scene = SCENES[state.level];
  ctx.save();
  ctx.translate(panelX + shakeX, PANEL.y);
  ctx.beginPath();
  ctx.rect(0, 0, PANEL.width, PANEL.height);
  ctx.clip();
  scene.draw(ctx, isAlt ? altFlags(state.level) : {});
  ctx.restore();
  // frame
  ctx.strokeStyle = state.activePanel === panelIndex && state.screen === SCREEN_PLAY ? PALETTE.panelEdgeActive : PALETTE.panelEdge;
  ctx.lineWidth = state.activePanel === panelIndex && state.screen === SCREEN_PLAY ? 4 : 3;
  ctx.strokeRect(panelX + shakeX, PANEL.y, PANEL.width, PANEL.height);
  ctx.font = `700 13px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(panelIndex === 0 ? 'A' : 'B', panelX + shakeX + 10, PANEL.y - 8);
  // found rings on both panels
  for (const diff of scene.diffs) {
    if (!state.found.has(diff.id)) continue;
    const cx = panelX + shakeX + diff.x;
    const cy = PANEL.y + diff.y;
    const pulse = 1 + 0.06 * Math.sin(state.animTime * 4);
    ctx.strokeStyle = PALETTE.found;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.foundGlow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r * pulse + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.found;
    ctx.beginPath();
    ctx.arc(cx + diff.r * 0.72, cy - diff.r * 0.72, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f2a1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + diff.r * 0.72 - 4, cy - diff.r * 0.72);
    ctx.lineTo(cx + diff.r * 0.72 - 1, cy - diff.r * 0.72 + 3);
    ctx.lineTo(cx + diff.r * 0.72 + 4, cy - diff.r * 0.72 - 3);
    ctx.stroke();
  }
  // hint ring (dashed, fading)
  if (state.hint && state.hint.ttl > 0) {
    const diff = state.hint.diff;
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.hint.ttl / 0.6) * (0.65 + 0.35 * Math.sin(state.animTime * 6));
    ctx.strokeStyle = PALETTE.hint;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(panelX + shakeX + diff.x, PANEL.y + diff.y, diff.r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // miss flash
  if (state.miss && state.miss.panel === panelIndex && state.miss.ttl > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.miss.ttl / 0.3);
    ctx.strokeStyle = PALETTE.miss;
    ctx.lineWidth = 4;
    const mx = panelX + shakeX + state.miss.x;
    const my = PANEL.y + state.miss.y;
    ctx.beginPath();
    ctx.moveTo(mx - 12, my - 12);
    ctx.lineTo(mx + 12, my + 12);
    ctx.moveTo(mx + 12, my - 12);
    ctx.lineTo(mx - 12, my + 12);
    ctx.stroke();
    ctx.restore();
  }
  // keyboard reticle
  if (state.screen === SCREEN_PLAY && state.activePanel === panelIndex) {
    const rx = panelX + shakeX + state.reticle.x;
    const ry = PANEL.y + state.reticle.y;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(rx, ry, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - 24, ry);
    ctx.lineTo(rx - 8, ry);
    ctx.moveTo(rx + 8, ry);
    ctx.lineTo(rx + 24, ry);
    ctx.moveTo(rx, ry - 24);
    ctx.lineTo(rx, ry - 8);
    ctx.moveTo(rx, ry + 8);
    ctx.lineTo(rx, ry + 24);
    ctx.stroke();
  }
}

function drawFooter(ctx, state) {
  ctx.font = `500 14px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  ctx.textAlign = 'center';
  const text = state.screen === SCREEN_TITLE
    ? 'Click or press Enter to start · Arrows + Tab + Enter play without a mouse'
    : 'Click a difference on either picture · Arrows steer · Tab swaps picture · Enter marks · H hint · P pause · R restart · Wrong click −3s';
  ctx.fillText(text, FIELD.width / 2, HUD.footerY + 30);
  ctx.textAlign = 'left';
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10,14,18,0.72)';
  ctx.fillRect(0, HUD.height, FIELD.width, FIELD.height - HUD.height);
  const w = 620;
  const h = 250;
  const x = (FIELD.width - w) / 2;
  const y = 230;
  ctx.fillStyle = PALETTE.hudBg;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = accent || PALETTE.panelEdge;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = `800 36px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(title, FIELD.width / 2, y + 62);
  ctx.font = `500 17px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  lines.forEach((line, i) => {
    ctx.fillText(line, FIELD.width / 2, y + 104 + i * 28);
  });
  ctx.textAlign = 'left';
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    return dpr;
  }
  let dpr = resize();
  window.addEventListener('resize', () => { dpr = resize(); });

  /** Convert CSS pixels from the canvas top-left to logical 1280x720 coords. */
  function toLogical(px, py, cssW, cssH) {
    const scale = Math.min(cssW / FIELD.width, cssH / FIELD.height);
    const ox = (cssW - FIELD.width * scale) / 2;
    const oy = (cssH - FIELD.height * scale) / 2;
    return { x: (px - ox) / scale, y: (py - oy) / scale };
  }

  function draw(state) {
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    const scale = Math.min(cssW / FIELD.width, cssH / FIELD.height);
    const ox = (cssW - FIELD.width * scale) / 2;
    const oy = (cssH - FIELD.height * scale) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawHud(ctx, state);
    const shakeX = state.shake > 0 ? Math.sin(state.animTime * 70) * 5 * state.shake : 0;
    drawPanel(ctx, state, 0, PANEL.leftX, false, shakeX);
    drawPanel(ctx, state, 1, PANEL.rightX, true, shakeX);
    drawFooter(ctx, state);
    if (state.screen === SCREEN_TITLE) {
      drawOverlay(ctx, 'BENGKEL SEPEDA', [
        'Two pictures of the workshop — spot what changed.',
        '3 levels · 7, 8 and 10 differences · beat the clock.',
        'Click or press Enter to start.',
      ], PALETTE.panelEdgeActive);
    } else if (state.screen === SCREEN_PAUSED) {
      drawOverlay(ctx, 'Paused', ['Press P or Enter to keep hunting.'], null);
    } else if (state.screen === SCREEN_CLEAR) {
      drawOverlay(ctx, 'Level clear!', [
        `Score ${state.score} · time bonus added.`,
        'Press Enter for the next level.',
      ], PALETTE.found);
    } else if (state.screen === SCREEN_WIN) {
      drawOverlay(ctx, 'Workshop master!', [
        `All 3 levels cleared · final score ${state.score}.`,
        `Best ${state.best} · press Enter to play again.`,
      ], PALETTE.found);
    } else if (state.screen === SCREEN_OVER) {
      drawOverlay(ctx, 'Time up!', [
        `${state.foundCount} of ${state.total} found · score ${state.score}.`,
        'Press Enter to try again.',
      ], PALETTE.miss);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  return { draw, toLogical };
}
