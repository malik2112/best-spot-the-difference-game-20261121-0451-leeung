// Bengkel Sepeda — sound: tiny WebAudio chimes, no audio files.
// A bright two-note chime on a find, a low thud on a miss, a soft tick
// in the last ten seconds. Everything is synthesised, so the game
// needs no network and no assets.

let ctx = null;
let muted = false;

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone(freq, start, dur, type, gain) {
  const ac = ensureContext();
  if (!ac || muted) return;
  if (ac.state === 'suspended') ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A satisfying rising chime when a difference is found. */
export function playFound(streak) {
  const base = 660 + Math.min(streak, 6) * 40;
  tone(base, 0, 0.16, 'sine', 0.18);
  tone(base * 1.5, 0.07, 0.22, 'sine', 0.16);
}

/** A dull thud when the click misses. */
export function playMiss() {
  tone(140, 0, 0.18, 'triangle', 0.16);
}

/** A gentle sparkle when the hint ring appears. */
export function playHint() {
  tone(880, 0, 0.12, 'sine', 0.12);
  tone(1174, 0.08, 0.16, 'sine', 0.1);
}

/** The level-clear fanfare. */
export function playClear() {
  tone(523, 0, 0.18, 'sine', 0.16);
  tone(659, 0.12, 0.18, 'sine', 0.16);
  tone(784, 0.24, 0.3, 'sine', 0.18);
}

/** A low buzz when time runs out. */
export function playOver() {
  tone(220, 0, 0.3, 'triangle', 0.16);
  tone(174, 0.2, 0.4, 'triangle', 0.14);
}

/** One quiet tick per second in the final countdown. */
export function playTick() {
  tone(1046, 0, 0.05, 'square', 0.05);
}

export function setMuted(value) {
  muted = Boolean(value);
}

export function isMuted() {
  return muted;
}
