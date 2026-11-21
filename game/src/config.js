// Bengkel Sepeda — every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it
// to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** Two picture panels, side by side, in logical coordinates. */
export const PANEL = {
  width: 600,
  height: 452,
  y: 150,
  leftX: 24,
  rightX: 656,
};

/** HUD strip at the top and the help strip at the bottom. */
export const HUD = { height: 132, footerY: 618 };

export const RULES = {
  wrongPenaltySeconds: 3,
  hintCooldownSeconds: 20,
  hintCost: 50,
  findPoints: 100,
  streakBonus: 25,
  timeBonusPerSecond: 2,
  markRadius: 30,
  hitSlack: 10,
  reticleSpeed: 520,
};

export const LEVELS = [
  { id: 'pagi', name: 'Level 1 · Bengkel Pagi', seconds: 150, diffs: 7 },
  { id: 'rak', name: 'Level 2 · Rak Roda & Ban', seconds: 180, diffs: 8 },
  { id: 'etalase', name: 'Level 3 · Etalase Sepeda', seconds: 210, diffs: 10 },
];

export const PALETTE = {
  backdrop: '#141a1f',
  panelEdge: '#3a4652',
  panelEdgeActive: '#ffb454',
  hudBg: '#1d262e',
  hudLine: '#33414d',
  text: '#f2f5f7',
  muted: '#9db0bd',
  found: '#3ddc84',
  foundGlow: '#b8ffd9',
  hint: '#ffd166',
  miss: '#ff6b6b',
  timerOk: '#3ddc84',
  timerLow: '#ff6b6b',
  button: '#2a3946',
  buttonEdge: '#465a6b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'bengkel-sepeda.best';
