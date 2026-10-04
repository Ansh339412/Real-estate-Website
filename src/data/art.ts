/**
 * Procedurally drawn illustrations used for the sample listings, city cards and hero collage.
 * They are generated locally as SVG data URIs: no external image requests, no layout shift,
 * and a strict Content-Security-Policy still works. Sample imagery is illustration, not photography.
 */
export type Scene = 'tower' | 'villa' | 'plot' | 'commercial' | 'interior' | 'skyline';

const PALETTES = [
  ['#0e1a2b', '#2a4d9b', '#f3c98b'],
  ['#14213d', '#23766c', '#f6d8b0'],
  ['#102a43', '#4f6d8f', '#ffd9b3'],
  ['#1a2238', '#c8472f', '#fcd9a8'],
  ['#0b2545', '#2454ff', '#b9d4f5'],
];

function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function windows(x: number, y: number, w: number, h: number, cols: number, rows: number, r: () => number, lit: string) {
  const gw = w / cols;
  const gh = h / rows;
  let out = '';
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      out += `<rect x="${(x + i * gw + gw * 0.18).toFixed(1)}" y="${(y + j * gh + gh * 0.2).toFixed(1)}" width="${(gw * 0.64).toFixed(1)}" height="${(gh * 0.55).toFixed(1)}" rx="2" fill="${r() > 0.38 ? lit : '#ffffff'}" opacity="${r() > 0.38 ? 0.9 : 0.14}"/>`;
  return out;
}

const tree = (x: number, y: number, s: number, c = '#1f5a4d') =>
  `<rect x="${x - 4 * s}" y="${y}" width="${8 * s}" height="${30 * s}" fill="#3a2a22"/><circle cx="${x}" cy="${y - 6 * s}" r="${30 * s}" fill="${c}"/><circle cx="${x - 16 * s}" cy="${y + 6 * s}" r="${20 * s}" fill="${c}" opacity=".9"/>`;

export function art(scene: Scene, seed: number): string {
  const r = rng(seed + scene.length * 31);
  const [top, mid, glow] = PALETTES[Math.abs(seed) % PALETTES.length];
  let g = `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".7" stop-color="${mid}"/><stop offset="1" stop-color="${glow}"/></linearGradient><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ec5ff" stop-opacity=".85"/><stop offset="1" stop-color="#23766c" stop-opacity=".9"/></linearGradient></defs><rect width="800" height="600" fill="url(#s)"/>`;
  if (scene !== 'interior') g += `<circle cx="${540 + r() * 180}" cy="${110 + r() * 60}" r="${38 + r() * 22}" fill="${glow}" opacity=".8"/>`;

  if (scene === 'tower') {
    g += `<rect x="90" y="250" width="150" height="260" fill="#0f1c30" opacity=".85"/>${windows(90, 250, 150, 260, 4, 7, r, glow)}`;
    g += `<rect x="560" y="210" width="170" height="300" fill="#0f1c30" opacity=".85"/>${windows(560, 210, 170, 300, 5, 8, r, glow)}`;
    g += `<rect x="250" y="120" width="290" height="390" fill="#13233b"/><rect x="250" y="120" width="290" height="14" fill="${glow}" opacity=".7"/>${windows(250, 140, 290, 360, 6, 9, r, glow)}`;
    g += `<rect x="0" y="510" width="800" height="90" fill="#0a131f"/><rect x="330" y="462" width="130" height="48" fill="#0a131f"/>${tree(120, 480, 0.8)}${tree(690, 478, 0.9)}`;
  } else if (scene === 'villa') {
    g += `<rect x="0" y="470" width="800" height="130" fill="#14352f"/><path d="M0 470 Q200 440 400 470 T800 460 V600 H0Z" fill="#1c4a40"/>`;
    g += `<rect x="190" y="320" width="420" height="170" fill="#f4ede0"/><polygon points="170,325 400,215 630,325" fill="#26364f"/><rect x="190" y="320" width="420" height="8" fill="#d9ccb4"/>`;
    g += `<rect x="372" y="388" width="56" height="102" rx="3" fill="#5a3b2a"/><rect x="225" y="360" width="90" height="70" fill="${glow}" opacity=".9"/><rect x="485" y="360" width="90" height="70" fill="${glow}" opacity=".9"/><rect x="225" y="360" width="90" height="70" fill="none" stroke="#26364f" stroke-width="5"/><rect x="485" y="360" width="90" height="70" fill="none" stroke="#26364f" stroke-width="5"/>`;
    g += `<path d="M385 490 L330 600 H470 L415 490Z" fill="#c9bfa9" opacity=".8"/>${tree(110, 420, 1.2)}${tree(700, 430, 1)}`;
  } else if (scene === 'plot') {
    g += `<polygon points="0,380 190,290 360,370 560,260 800,380 800,600 0,600" fill="#2f6e5c" opacity=".55"/><rect y="400" width="800" height="200" fill="#2d6a45"/><polygon points="120,470 680,470 780,580 20,580" fill="#3a8157"/>`;
    g += `<polygon points="120,470 680,470 780,580 20,580" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 10" opacity=".85"/>`;
    g += `<rect x="388" y="400" width="8" height="90" fill="#f4ede0"/><rect x="330" y="380" width="124" height="42" rx="4" fill="#f4ede0"/><rect x="342" y="392" width="100" height="6" fill="#c8472f"/><rect x="342" y="404" width="70" height="5" fill="#26364f"/>${tree(80, 410, 1)}${tree(730, 415, 0.9)}`;
  } else if (scene === 'commercial') {
    g += `<rect x="60" y="330" width="170" height="180" fill="#0f1c30" opacity=".85"/>${windows(60, 330, 170, 180, 5, 5, r, glow)}`;
    g += `<polygon points="280,90 520,90 520,510 280,510" fill="url(#gl)"/><polygon points="280,90 520,90 400,510 280,510" fill="#fff" opacity=".12"/>`;
    for (let i = 1; i < 9; i++) g += `<line x1="280" x2="520" y1="${90 + i * 46.7}" y2="${90 + i * 46.7}" stroke="#0e1a2b" stroke-width="2" opacity=".35"/>`;
    for (let i = 1; i < 5; i++) g += `<line x1="${280 + i * 48}" x2="${280 + i * 48}" y1="90" y2="510" stroke="#0e1a2b" stroke-width="2" opacity=".3"/>`;
    g += `<rect x="560" y="280" width="190" height="230" fill="#13233b"/>${windows(560, 280, 190, 230, 5, 6, r, glow)}<rect y="510" width="800" height="90" fill="#0a131f"/>`;
  } else if (scene === 'skyline') {
    for (let layer = 0; layer < 2; layer++) {
      let x = layer ? 20 : -20;
      while (x < 800) {
        const w = 60 + r() * 70, h = 120 + r() * (layer ? 200 : 280);
        g += `<rect x="${x.toFixed(0)}" y="${(510 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${layer ? '#13233b' : '#0b1626'}" opacity="${layer ? 0.75 : 1}"/>`;
        if (!layer) g += windows(x, 510 - h, w, h, 3, Math.round(h / 38), r, glow);
        x += w + 8 + r() * 14;
      }
    }
    g += `<rect y="510" width="800" height="90" fill="#0a131f"/>`;
  } else {
    g = `<rect width="800" height="600" fill="#e9dfcf"/><rect y="440" width="800" height="160" fill="#c9b79a"/><rect x="470" y="70" width="270" height="300" rx="6" fill="url(#s)"/><rect x="470" y="70" width="270" height="300" rx="6" fill="none" stroke="#fff" stroke-width="12"/><line x1="605" x2="605" y1="70" y2="370" stroke="#fff" stroke-width="8"/><circle cx="660" cy="150" r="30" fill="${glow}" opacity=".9"/>`;
    g = g.replace('<rect x="470"', `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${glow}"/></linearGradient></defs><rect x="470"`);
    g += `<ellipse cx="300" cy="520" rx="260" ry="40" fill="${mid}" opacity=".55"/><rect x="90" y="360" width="400" height="110" rx="26" fill="#23366a"/><rect x="70" y="330" width="440" height="60" rx="26" fill="#2c4690"/><rect x="110" y="340" width="150" height="70" rx="16" fill="#3a56a8"/><rect x="300" y="340" width="150" height="70" rx="16" fill="#3a56a8"/><rect x="100" y="470" width="14" height="40" fill="#2a2018"/><rect x="466" y="470" width="14" height="40" fill="#2a2018"/>`;
    g += `<rect x="560" y="400" width="10" height="110" fill="#2a2018"/><polygon points="515,400 615,400 595,330 535,330" fill="${glow}"/><circle cx="760" cy="460" r="26" fill="#2f6e5c"/><rect x="752" y="470" width="16" height="40" fill="#8a5a3c"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">${g}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Stable small number from a string, used to give each city its own colours and skyline. */
export const hashString = (s: string): number => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
