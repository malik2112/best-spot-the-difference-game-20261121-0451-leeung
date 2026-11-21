// Bengkel Sepeda — the three workshop scenes, drawn procedurally on canvas.
// Each scene is a list of props painted the same on both panels; a difference
// swaps one prop for its alternate version on the right panel only. Coordinates
// are panel-local (0..600, 0..452) so both panels share one drawing routine.

function wheel(ctx, x, y, r, tyre, spoke) {
  ctx.strokeStyle = tyre;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = spoke;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6));
    ctx.stroke();
  }
  ctx.fillStyle = spoke;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
}

function bike(ctx, x, y, s, frame, opts) {
  const o = opts || {};
  const wr = 34 * s;
  const rearX = x;
  const frontX = x + 96 * s;
  const wy = y + 58 * s;
  wheel(ctx, rearX, wy, wr, '#2b2b30', '#c9d4dc');
  wheel(ctx, frontX, wy, wr, '#2b2b30', '#c9d4dc');
  ctx.strokeStyle = frame;
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  const seatX = x + 30 * s;
  const seatY = y + 8 * s;
  const headX = x + 84 * s;
  const headY = y + 12 * s;
  const crankX = x + 48 * s;
  const crankY = y + 52 * s;
  ctx.beginPath();
  ctx.moveTo(rearX, wy);
  ctx.lineTo(crankX, crankY);
  ctx.lineTo(headX, headY);
  ctx.lineTo(seatX, seatY);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(crankX, crankY);
  ctx.lineTo(seatX, seatY);
  ctx.moveTo(headX, headY);
  ctx.lineTo(frontX, wy);
  ctx.stroke();
  // saddle
  ctx.fillStyle = '#3a2e26';
  ctx.beginPath();
  ctx.ellipse(seatX, seatY - 4 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  // handlebar
  ctx.strokeStyle = '#d7dee5';
  ctx.lineWidth = 4 * s;
  ctx.beginPath();
  ctx.moveTo(headX, headY);
  ctx.lineTo(headX + 4 * s, headY - 12 * s);
  ctx.moveTo(headX - 8 * s, headY - 14 * s);
  ctx.lineTo(headX + 14 * s, headY - 14 * s);
  ctx.stroke();
  if (o.basket) {
    ctx.fillStyle = '#c9a15c';
    ctx.fillRect(headX + 6 * s, headY + 2 * s, 26 * s, 18 * s);
    ctx.strokeStyle = '#8a6a33';
    ctx.lineWidth = 2;
    ctx.strokeRect(headX + 6 * s, headY + 2 * s, 26 * s, 18 * s);
  }
  if (o.bell) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(headX + 10 * s, headY - 18 * s, 6 * s, Math.PI, 0);
    ctx.fill();
  }
  if (o.mudguard) {
    ctx.strokeStyle = frame;
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.arc(rearX, wy, wr + 6 * s, Math.PI * 1.15, Math.PI * 1.95);
    ctx.stroke();
  }
  if (o.chainGuard) {
    ctx.fillStyle = frame;
    ctx.beginPath();
    ctx.ellipse(crankX + 6 * s, crankY, 24 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return { seatX, seatY, headX, headY, rearX, frontX, wy, wr, crankX, crankY };
}

function pegboard(ctx, w) {
  ctx.fillStyle = '#e8dcc3';
  ctx.fillRect(0, 0, w, 452);
  ctx.fillStyle = '#d9c9a6';
  for (let x = 14; x < w; x += 28) {
    for (let y = 14; y < 452; y += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function wrench(ctx, x, y, s, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 7 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 34 * s);
  ctx.lineTo(x, y + 6 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 9 * s, Math.PI * 0.4, Math.PI * 1.9);
  ctx.stroke();
}

function pump(ctx, x, y, body) {
  ctx.fillStyle = body;
  ctx.fillRect(x, y, 16, 74);
  ctx.fillStyle = '#2b2b30';
  ctx.fillRect(x - 14, y + 74, 44, 8);
  ctx.fillRect(x + 3, y - 16, 10, 18);
  ctx.fillStyle = '#d7dee5';
  ctx.fillRect(x - 10, y - 24, 36, 8);
  ctx.strokeStyle = '#2b2b30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 30);
  ctx.quadraticCurveTo(x + 44, y + 44, x + 40, y + 76);
  ctx.stroke();
}

function helmet(ctx, x, y, shell, strap) {
  ctx.fillStyle = shell;
  ctx.beginPath();
  ctx.ellipse(x, y, 30, 20, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - 30, y - 2, 60, 6);
  ctx.strokeStyle = strap;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 4);
  ctx.lineTo(x - 8, y + 20);
  ctx.lineTo(x + 10, y + 20);
  ctx.lineTo(x + 18, y + 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(x - 10, y - 12, 10, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function cone(ctx, x, y, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - 34);
  ctx.lineTo(x + 18, y + 10);
  ctx.lineTo(x - 18, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(x - 10, y - 10, 20, 8);
  ctx.fillStyle = colour;
  ctx.fillRect(x - 24, y + 10, 48, 7);
}

function plant(ctx, x, y, pot, leaves) {
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.moveTo(x - 16, y);
  ctx.lineTo(x + 16, y);
  ctx.lineTo(x + 11, y + 24);
  ctx.lineTo(x - 11, y + 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f7d4e';
  ctx.lineWidth = 3;
  for (let i = 0; i < leaves; i += 1) {
    const dx = (i - (leaves - 1) / 2) * 9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + dx, y - 18, x + dx * 1.4, y - 30 - (i % 2) * 6);
    ctx.stroke();
    ctx.fillStyle = '#57a86b';
    ctx.beginPath();
    ctx.ellipse(x + dx * 1.4, y - 32 - (i % 2) * 6, 7, 4, dx * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

function clockFace(ctx, x, y, hour, minute) {
  ctx.fillStyle = '#fbf7ea';
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#39424c';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#39424c';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const ha = ((hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ha) * 13, y + Math.sin(ha) * 13);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ma) * 19, y + Math.sin(ma) * 19);
  ctx.stroke();
  ctx.fillStyle = '#e5534b';
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function toolbox(ctx, x, y, colour, open) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, 92, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x, y, 92, 8);
  if (open) {
    ctx.fillStyle = colour;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.55);
    ctx.fillRect(0, -14, 92, 14);
    ctx.restore();
    wrench(ctx, x + 22, y - 6, 0.7, '#9fb3c2');
    wrench(ctx, x + 52, y - 4, 0.7, '#9fb3c2');
  } else {
    ctx.strokeStyle = '#2b2b30';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 28, y);
    ctx.quadraticCurveTo(x + 46, y - 18, x + 64, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(x + 40, y + 14, 12, 10);
}

/** Level 1 — Bengkel Pagi: a workbench wall with one bike on a stand. */
function drawPagi(ctx, alt) {
  pegboard(ctx, 600);
  // window light
  ctx.fillStyle = '#bfe3f2';
  ctx.fillRect(404, 26, 150, 104);
  ctx.strokeStyle = '#7a6a4d';
  ctx.lineWidth = 6;
  ctx.strokeRect(404, 26, 150, 104);
  ctx.beginPath();
  ctx.moveTo(479, 26);
  ctx.lineTo(479, 130);
  ctx.moveTo(404, 78);
  ctx.lineTo(554, 78);
  ctx.stroke();
  if (!alt.sun) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(524, 52, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  // wall clock
  clockFace(ctx, 62, 58, alt.clock ? 9 : 8, alt.clock ? 25 : 5);
  // hanging tools
  wrench(ctx, 120, 40, 1, alt.wrench ? '#e5534b' : '#5b6b7a');
  wrench(ctx, 168, 44, 0.85, '#5b6b7a');
  ctx.fillStyle = '#39424c';
  ctx.fillRect(210, 30, 10, 62);
  ctx.fillStyle = '#e5534b';
  ctx.fillRect(204, 86, 22, 26);
  // shelf with helmets
  ctx.fillStyle = '#8a6a4d';
  ctx.fillRect(36, 168, 300, 12);
  helmet(ctx, 92, 146, '#2f7fc1', '#1c2a36');
  helmet(ctx, 178, 146, alt.helmet ? '#3ddc84' : '#ffb454', '#1c2a36');
  helmet(ctx, 262, 146, '#e5534b', '#1c2a36');
  // workbench
  ctx.fillStyle = '#9c7a55';
  ctx.fillRect(24, 330, 552, 18);
  ctx.fillStyle = '#7a5f42';
  ctx.fillRect(44, 348, 20, 78);
  ctx.fillRect(536, 348, 20, 78);
  // bike on stand (centre)
  ctx.strokeStyle = '#39424c';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(300, 330);
  ctx.lineTo(300, 262);
  ctx.moveTo(262, 330);
  ctx.lineTo(338, 330);
  ctx.stroke();
  bike(ctx, 232, 196, 1.15, alt.frame ? '#7c4dff' : '#e5534b', {
    basket: !alt.basket,
    bell: !alt.bell,
    mudguard: true,
    chainGuard: false,
  });
  // pump + toolbox on the floor
  pump(ctx, 66, 252, alt.pump ? '#2f7fc1' : '#e5534b');
  toolbox(ctx, 424, 366, '#2f7fc1', alt.toolbox);
  plant(ctx, 520, 300, '#c65b39', alt.plant ? 3 : 5);
  if (!alt.cone) cone(ctx, 150, 392, '#ff7a3c');
  ctx.fillStyle = '#6b7c8c';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillText('BENGKEL SEPEDA', 226, 44);
}

/** Level 2 — Rak Roda & Ban: racks of wheels, tyres and pumps. */
function drawRak(ctx, alt) {
  ctx.fillStyle = '#dfe9e4';
  ctx.fillRect(0, 0, 600, 452);
  ctx.fillStyle = '#c8d8cf';
  ctx.fillRect(0, 352, 600, 100);
  // top sign
  ctx.fillStyle = '#1f6f5b';
  ctx.fillRect(170, 16, 260, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RODA · BAN · POMPA', 300, 40);
  ctx.textAlign = 'left';
  // rack uprights
  ctx.fillStyle = '#5b6b7a';
  ctx.fillRect(36, 86, 12, 252);
  ctx.fillRect(552, 86, 12, 252);
  ctx.fillRect(36, 86, 528, 10);
  ctx.fillRect(36, 330, 528, 10);
  // hanging wheels row
  wheel(ctx, 118, 160, 46, '#2b2b30', '#8fa5b5');
  wheel(ctx, 252, 160, 46, alt.wheel ? '#e5534b' : '#2b2b30', '#8fa5b5');
  wheel(ctx, 386, 160, 46, '#2b2b30', '#8fa5b5');
  wheel(ctx, 500, 160, 38, '#2b2b30', '#8fa5b5');
  // tyre stacks
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = '#2b2b30';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(118, 296 - i * 16, 40, 0, Math.PI * 2);
    ctx.stroke();
  }
  const stack2 = alt.tyres ? 2 : 4;
  for (let i = 0; i < stack2; i += 1) {
    ctx.strokeStyle = '#2b2b30';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(258, 312 - i * 15, 34, 0, Math.PI * 2);
    ctx.stroke();
  }
  // pumps row
  pump(ctx, 368, 244, '#ffb454');
  pump(ctx, 432, 244, alt.pump ? '#3ddc84' : '#2f7fc1');
  if (!alt.pumpMissing) pump(ctx, 496, 244, '#e5534b');
  // small bike leaning
  bike(ctx, 386, 318, 0.8, '#2f7fc1', { basket: false, bell: alt.bell, mudguard: alt.mudguard, chainGuard: true });
  // price tags
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(88, 216, 60, 24);
  ctx.fillRect(222, 216, 60, 24);
  ctx.fillStyle = '#39424c';
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.fillText(alt.tag ? 'Rp45rb' : 'Rp35rb', 94, 233);
  ctx.fillText('Rp50rb', 228, 233);
  // helmet shelf
  ctx.fillStyle = '#8a6a4d';
  ctx.fillRect(36, 96, 0, 0);
  helmet(ctx, 70, 66, '#7c4dff', '#1c2a36');
  if (!alt.helmetMissing) helmet(ctx, 140, 66, '#ffb454', '#1c2a36');
  clockFace(ctx, 540, 62, alt.clock ? 4 : 3, alt.clock ? 40 : 15);
}

/** Level 3 — Etalase Sepeda: a shopfront window with three bikes. */
function drawEtalase(ctx, alt) {
  // sky + building
  ctx.fillStyle = alt.sky ? '#2b3a67' : '#a8d8f0';
  ctx.fillRect(0, 0, 600, 300);
  ctx.fillStyle = '#f3e9d2';
  ctx.fillRect(30, 84, 540, 268);
  ctx.fillStyle = '#c65b39';
  ctx.fillRect(18, 62, 564, 26);
  // awning stripes
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? (alt.awning ? '#2f7fc1' : '#e5534b') : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(44 + i * 58, 88);
    ctx.lineTo(44 + (i + 1) * 58, 88);
    ctx.lineTo(38 + (i + 1) * 58, 122);
    ctx.lineTo(38 + i * 58, 122);
    ctx.closePath();
    ctx.fill();
  }
  // shop sign
  ctx.fillStyle = '#39424c';
  ctx.fillRect(196, 30, 208, 30);
  ctx.fillStyle = '#ffd166';
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOKO SEPEDA JAYA', 300, 52);
  ctx.textAlign = 'left';
  // window frames
  ctx.strokeStyle = '#39424c';
  ctx.lineWidth = 5;
  ctx.strokeRect(48, 132, 504, 190);
  ctx.beginPath();
  ctx.moveTo(216, 132);
  ctx.lineTo(216, 322);
  ctx.moveTo(384, 132);
  ctx.lineTo(384, 322);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(48, 132, 504, 190);
  // three bikes in the window
  bike(ctx, 66, 208, 0.92, '#e5534b', { basket: !alt.basket, bell: true, mudguard: true, chainGuard: false });
  bike(ctx, 234, 208, 0.92, alt.frame ? '#ffb454' : '#2f7fc1', { basket: false, bell: !alt.bell, mudguard: false, chainGuard: alt.chain });
  bike(ctx, 402, 208, 0.92, '#3ddc84', { basket: false, bell: true, mudguard: !alt.mudguard, chainGuard: false });
  // pavement
  ctx.fillStyle = '#b9c4cc';
  ctx.fillRect(0, 352, 600, 100);
  ctx.strokeStyle = '#9db0bd';
  ctx.lineWidth = 2;
  for (let x = 0; x < 600; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 352);
    ctx.lineTo(x - 12, 452);
    ctx.stroke();
  }
  // pavement props
  plant(ctx, 66, 372, '#2f7fc1', alt.plant ? 6 : 4);
  plant(ctx, 534, 372, '#c65b39', 4);
  if (!alt.cone) cone(ctx, 300, 396, '#ff7a3c');
  // lamp posts
  for (const lx of [96, 504]) {
    ctx.fillStyle = '#39424c';
    ctx.fillRect(lx - 3, 150, 6, 202);
    ctx.fillStyle = alt.lamp ? '#39424c' : '#ffd166';
    ctx.beginPath();
    ctx.arc(lx, 140, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  // hanging sign
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(452, 96, 92, 30);
  ctx.fillStyle = '#39424c';
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.fillText(alt.sign ? 'SERVIS' : 'BUKA', alt.sign ? 470 : 478, 116);
  clockFace(ctx, 132, 52, alt.clock ? 7 : 6, alt.clock ? 50 : 20);
}

/** The three levels: painter + difference list (panel-local hit centres). */
export const SCENES = [
  {
    draw: drawPagi,
    diffs: [
      { id: 'sun', x: 524, y: 52, r: 24, label: 'the sun in the window' },
      { id: 'clock', x: 62, y: 58, r: 32, label: 'the wall clock time' },
      { id: 'wrench', x: 120, y: 56, r: 26, label: 'the red wrench' },
      { id: 'helmet', x: 178, y: 146, r: 34, label: 'the middle helmet colour' },
      { id: 'frame', x: 288, y: 248, r: 42, label: 'the bike frame colour' },
      { id: 'basket', x: 350, y: 222, r: 30, label: 'the front basket' },
      { id: 'bell', x: 338, y: 196, r: 24, label: 'the little bell' },
      { id: 'pump', x: 74, y: 290, r: 30, label: 'the floor pump colour' },
      { id: 'toolbox', x: 470, y: 386, r: 40, label: 'the open toolbox' },
      { id: 'plant', x: 520, y: 286, r: 30, label: 'the plant leaves' },
      { id: 'cone', x: 150, y: 380, r: 28, label: 'the traffic cone' },
    ].slice(0, 7),
  },
  {
    draw: drawRak,
    diffs: [
      { id: 'wheel', x: 252, y: 160, r: 52, label: 'the red-rimmed wheel' },
      { id: 'tyres', x: 258, y: 280, r: 44, label: 'the shorter tyre stack' },
      { id: 'pump', x: 440, y: 282, r: 30, label: 'the green pump' },
      { id: 'pumpMissing', x: 504, y: 282, r: 30, label: 'the missing pump' },
      { id: 'bell', x: 462, y: 318, r: 26, label: 'the bell on the small bike' },
      { id: 'mudguard', x: 386, y: 380, r: 34, label: 'the rear mudguard' },
      { id: 'tag', x: 118, y: 228, r: 34, label: 'the price tag' },
      { id: 'helmetMissing', x: 140, y: 66, r: 34, label: 'the missing helmet' },
      { id: 'clock', x: 540, y: 62, r: 32, label: 'the clock time' },
    ].slice(0, 8),
  },
  {
    draw: drawEtalase,
    diffs: [
      { id: 'sky', x: 540, y: 40, r: 36, label: 'the evening sky' },
      { id: 'awning', x: 300, y: 104, r: 46, label: 'the blue awning stripes' },
      { id: 'basket', x: 160, y: 232, r: 30, label: 'the left bike basket' },
      { id: 'frame', x: 288, y: 262, r: 42, label: 'the middle bike colour' },
      { id: 'bell', x: 330, y: 220, r: 24, label: 'the middle bike bell' },
      { id: 'chain', x: 288, y: 292, r: 32, label: 'the chain guard' },
      { id: 'mudguard', x: 402, y: 282, r: 36, label: 'the right bike mudguard' },
      { id: 'plant', x: 66, y: 360, r: 30, label: 'the fuller plant' },
      { id: 'cone', x: 300, y: 384, r: 28, label: 'the cone on the pavement' },
      { id: 'lamp', x: 504, y: 140, r: 26, label: 'the dark lamp' },
      { id: 'sign', x: 498, y: 111, r: 38, label: 'the hanging sign word' },
      { id: 'clock', x: 132, y: 52, r: 32, label: 'the clock time' },
    ].slice(0, 10),
  },
];

/** Alternate-flag map for a level: every difference id set to true. */
export function altFlags(levelIndex) {
  const flags = {};
  for (const diff of SCENES[levelIndex].diffs) flags[diff.id] = true;
  return flags;
}
