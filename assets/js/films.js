/**
 * Four short explainer films, drawn live on a canvas: no video file, no library.
 * Each film is a pure function of time, so seeking is just drawing another instant.
 * Narrative text comes from the page (#film-strings) and is translated; terminal output stays in
 * English and imitates the real tools, as in the game.
 */
import * as music from './music.js';

const W = 1280;
const H = 720;
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const HUM = '"Space Grotesk", system-ui, sans-serif';
const C = {
  red: '255,61,90',
  cyan: '45,226,255',
  violet: '155,92,255',
  green: '61,255,154',
  amber: '255,176,32',
  white: '238,242,255',
  text: '215,224,245',
  dim: '125,139,170',
};
const PROMPT = 'kestrel@lignerouge:~$ ';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (k) => 1 - (1 - k) ** 3;
const rgba = (c, a = 1) => `rgba(${C[c] ?? c},${a})`;

/* ---------------- drawing helpers ---------------- */

function win(g, { x, y, w, h, title, c = 'dim', a = 1, solid = 0.92 }) {
  if (a <= 0) return;
  g.save();
  g.globalAlpha *= a;
  g.shadowColor = rgba(c, 0.35);
  g.shadowBlur = 40;
  g.fillStyle = `rgba(14,19,32,${solid})`;
  round(g, x, y, w, h, 10);
  g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = rgba(c, 0.6);
  g.lineWidth = 1;
  round(g, x + 0.5, y + 0.5, w - 1, h - 1, 10);
  g.stroke();
  g.strokeStyle = 'rgba(215,224,245,0.1)';
  g.beginPath();
  g.moveTo(x, y + 32);
  g.lineTo(x + w, y + 32);
  g.stroke();
  g.fillStyle = rgba(c, 1);
  g.beginPath();
  g.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = rgba('dim');
  g.font = `12px ${MONO}`;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillText(title, x + 30, y + 16.5);
  g.restore();
}

function round(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function text(g, s, x, y, { font = `16px ${HUM}`, c = 'text', a = 1, align = 'left', base = 'alphabetic' } = {}) {
  g.font = font;
  g.fillStyle = rgba(c, a);
  g.textAlign = align;
  g.textBaseline = base;
  g.fillText(s, x, y);
}

/** Wraps s into lines no wider than max. */
function wrap(g, s, max, font) {
  g.font = font;
  const out = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (g.measureText(next).width > max && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

const typed = (s, t, t0, cps = 32) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

/** A terminal: each entry appears at its time; commands are typed after the prompt. */
function terminal(g, x, y, w, h, entries, t, { max = 20, lh = 22 } = {}) {
  const shown = [];
  for (const e of entries) {
    if (t < e.at) break;
    if (e.cmd) {
      const s = typed(e.cmd, t, e.at, e.cps ?? 30);
      shown.push({ prompt: true, s, done: s.length === e.cmd.length, c: 'white' });
    } else shown.push({ s: e.s, c: e.c ?? 'text', hl: e.hl, at: e.at });
  }
  const last = shown.slice(-max);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  last.forEach((l, i) => {
    const ly = y + 14 + i * lh;
    if (l.hl) {
      const k = ease(seg(t, l.at, l.at + 0.4));
      g.fillStyle = rgba(l.hl, 0.16 * k);
      g.fillRect(x - 6, ly - 15, w + 12, lh);
      g.fillStyle = rgba(l.hl, 0.9 * k);
      g.fillRect(x - 6, ly - 15, 3, lh);
    }
    g.font = `16.5px ${MONO}`;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    let cx = x;
    if (l.prompt) {
      g.fillStyle = rgba('red');
      g.fillText(PROMPT, cx, ly);
      cx += g.measureText(PROMPT).width;
    }
    g.fillStyle = rgba(l.c);
    g.fillText(l.s, cx, ly);
    if (l.prompt && i === last.length - 1 && Math.floor(t * 2.2) % 2 === 0) {
      g.fillStyle = rgba('white');
      g.fillRect(cx + g.measureText(l.s).width + 2, ly - 13, 9, 17);
    }
  });
  g.restore();
}

function gauge(g, x, y, w, k, label) {
  text(g, label, x, y - 8, { font: `11px ${MONO}`, c: 'dim' });
  g.fillStyle = 'rgba(215,224,245,0.1)';
  g.fillRect(x, y, w, 6);
  g.fillStyle = rgba('amber', 0.95);
  g.shadowColor = rgba('amber');
  g.shadowBlur = 10;
  g.fillRect(x, y, w * k, 6);
  g.shadowBlur = 0;
  text(g, `${Math.round(k * 100)}%`, x + w, y - 8, { font: `11px ${MONO}`, c: 'amber', align: 'right' });
}

function diamond(g, x, y, r, c, fill = 0.2, glow = 16) {
  g.save();
  g.translate(x, y);
  g.rotate(Math.PI / 4);
  g.shadowColor = rgba(c);
  g.shadowBlur = glow;
  g.fillStyle = rgba(c, fill);
  g.strokeStyle = rgba(c);
  g.lineWidth = 1.6;
  g.fillRect(-r, -r, r * 2, r * 2);
  g.strokeRect(-r, -r, r * 2, r * 2);
  g.restore();
}

function bubble(g, x, y, w, s, { who, c = 'white', a = 1, right = false, name }) {
  const font = `17px ${HUM}`;
  const lines = wrap(g, s, w - 36, font);
  const h = lines.length * 24 + 22 + (name ? 20 : 0);
  const bx = right ? x - w : x;
  g.save();
  g.globalAlpha *= a;
  g.fillStyle = 'rgba(12,16,28,0.97)';
  round(g, bx, y, w, h, 12);
  g.fill();
  g.fillStyle = who === 'ai' ? 'rgba(155,92,255,0.14)' : 'rgba(215,224,245,0.07)';
  g.strokeStyle = who === 'ai' ? rgba('violet', 0.55) : 'rgba(215,224,245,0.2)';
  round(g, bx, y, w, h, 12);
  g.fill();
  g.stroke();
  let ty = y + 30;
  if (name) {
    text(g, name, bx + 18, y + 24, { font: `600 12px ${MONO}`, c: who === 'ai' ? 'violet' : 'dim' });
    ty += 20;
  }
  lines.forEach((l, i) => text(g, l, bx + 18, ty + i * 24, { font, c }));
  g.restore();
  return h;
}

function particles(g, x, y, k, c, n = 40, spread = 260) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + i;
    const d = ease(k) * spread * (0.4 + ((i * 37) % 10) / 14);
    g.fillStyle = rgba(c, 1 - k);
    g.beginPath();
    g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.4 * (1 - k) + 0.5, 0, Math.PI * 2);
    g.fill();
  }
}

function backdrop(g, c, t, k = 1) {
  g.fillStyle = '#05070c';
  g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W * 0.6, H * 0.5, 0, W * 0.6, H * 0.5, W * 0.8);
  r.addColorStop(0, rgba(c, 0.12 * k));
  r.addColorStop(1, 'rgba(5,7,12,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(125,139,170,0.05)';
  g.lineWidth = 1;
  const off = (t * 8) % 40;
  for (let x = -40 + off; x < W; x += 40) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
}

/** Chromatic glitch over the whole frame, for 150 to 400 ms at a strong event. */
function glitch(g, canvas, k) {
  if (k <= 0 || k >= 1) return;
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const y = ((i * 131 + Math.floor(k * 10) * 53) % H) | 0;
    const hgt = 8 + ((i * 29) % 40);
    const dx = (((i * 71) % 30) - 15) * (1 - k);
    g.drawImage(canvas, 0, y * (canvas.width / W), canvas.width, hgt * (canvas.width / W), dx, y, W, hgt);
  }
  g.fillStyle = rgba('red', 0.08 * (1 - k));
  g.fillRect(0, 0, W, H);
}

/* ---------------- the films ---------------- */

function filmAttack(L) {
  const scan = [
    { at: 5.0, cmd: 'nmap -sV 10.13.0.0/24' },
    { at: 6.1, s: 'Starting Nmap 7.95 at 2026-11-23 09:14 CET', c: 'dim' },
    { at: 6.5, s: 'Nmap scan report for gw.novamind.test (10.13.0.1)' },
    { at: 6.7, s: '22/tcp   open  ssh      OpenSSH 9.6', c: 'dim' },
    { at: 7.3, s: 'Nmap scan report for www.novamind.test (10.13.1.10)' },
    { at: 7.5, s: '443/tcp  open  https    nginx 1.26', c: 'dim' },
    { at: 8.1, s: 'Nmap scan report for git.novamind.test (10.13.1.30)' },
    { at: 8.3, s: '443/tcp  open  https    Gitea', c: 'dim' },
    { at: 8.9, s: 'Nmap scan report for staging.novamind.test (10.13.2.5)' },
    { at: 9.1, s: '8080/tcp open  http-proxy', c: 'dim' },
    { at: 9.6, s: 'Nmap done: 256 IP addresses (4 hosts up)', c: 'dim' },
    { at: 12.0, cmd: 'git log --oneline' },
    { at: 12.9, s: 'a3f9c21 Update homepage copy', c: 'amber' },
    { at: 13.1, s: '7be0d44 remove .env (oops)', c: 'amber', hl: 'amber' },
    { at: 13.3, s: '1c2e9aa Initial commit', c: 'amber' },
    { at: 14.6, cmd: 'git show 7be0d44' },
    { at: 15.4, s: 'diff --git a/.env b/.env', c: 'dim' },
    { at: 15.6, s: '-STAGING_URL=https://staging.novamind.test', c: 'red' },
    { at: 15.8, s: '-STAGING_TOKEN=FLAG{h1st0ry-n3v3r-f0rg3ts}', c: 'red', hl: 'red' },
    { at: 19.0, cmd: 'submit FLAG{h1st0ry-n3v3r-f0rg3ts}', cps: 40 },
    { at: 20.0, s: L['flag.ok'], c: 'green', hl: 'green' },
    { at: 23.0, cmd: 'nmap 8.8.8.8' },
    { at: 23.6, s: L['scope.refused'], c: 'amber', hl: 'amber' },
  ];
  const hosts = [
    { at: 6.5, label: 'gw', x: 880, y: 300 },
    { at: 7.3, label: 'www', x: 1040, y: 220 },
    { at: 8.1, label: 'git', x: 1010, y: 410 },
    { at: 8.9, label: 'staging', x: 1170, y: 330 },
  ];
  return {
    id: 'attack',
    color: 'red',
    duration: 27,
    tension: 0.75,
    captions: [
      [0, 'cap.a1'],
      [4.6, 'cap.a2'],
      [12, 'cap.a3', 'OWASP A05'],
      [19, 'cap.a4'],
      [23, 'cap.a5', 'Art. 323-1'],
    ],
    cues: [
      [2.6, 'objective'],
      [6.5, 'node'],
      [7.3, 'node'],
      [8.1, 'node'],
      [8.9, 'node'],
      [13.1, 'message'],
      [15.8, 'message'],
      [20.0, 'flag'],
      [23.6, 'wrong'],
    ],
    draw(g, t, canvas) {
      backdrop(g, 'red', t, 0.6 + seg(t, 19, 21));

      // Mandate.
      const ma = t < 4 ? ease(seg(t, 0, 0.6)) : 1 - seg(t, 4, 4.8);
      if (ma > 0) {
        const y = 110 + (1 - ma) * 30;
        win(g, { x: 340, y, w: 600, h: 440, title: 'mandate.pdf', c: 'white', a: ma });
        g.save();
        g.globalAlpha = ma;
        text(g, L['mandate.title'], 380, y + 92, { font: `700 26px ${HUM}`, c: 'white' });
        text(g, L['mandate.client'], 380, y + 150, { font: `17px ${HUM}` });
        text(g, L['mandate.scope'], 380, y + 190, { font: `15px ${MONO}`, c: 'white' });
        text(g, '*.novamind.test   10.13.0.0/16', 380, y + 222, { font: `15px ${MONO}`, c: 'cyan' });
        text(g, L['mandate.out'], 380, y + 270, { font: `17px ${HUM}`, c: 'dim' });
        for (let i = 0; i < 3; i++) {
          g.fillStyle = 'rgba(215,224,245,0.08)';
          g.fillRect(380, y + 300 + i * 18, 400 - i * 90, 8);
        }
        const sk = ease(seg(t, 2.4, 2.8));
        if (sk > 0) {
          g.save();
          g.translate(800, y + 360);
          g.rotate(-0.18);
          g.scale(2 - sk, 2 - sk);
          g.globalAlpha = ma * sk;
          g.strokeStyle = rgba('red');
          g.lineWidth = 3;
          round(g, -90, -30, 180, 60, 8);
          g.stroke();
          text(g, L['mandate.signed'], 0, 9, { font: `700 26px ${MONO}`, c: 'red', align: 'center' });
          g.restore();
        }
        g.restore();
      }

      if (t < 4.5) return;
      const ta = ease(seg(t, 4.5, 5.1));
      win(g, { x: 40, y: 60, w: 760, h: 600, title: 'terminal — kestrel@lignerouge', c: 'red', a: ta });
      g.save();
      g.globalAlpha = ta;
      terminal(g, 64, 110, 720, 530, scan, t, { max: 23, lh: 23 });
      g.restore();

      // Map of what the scan found.
      win(g, { x: 830, y: 60, w: 410, h: 600, title: 'map — 10.13.0.0/24', c: 'dim', a: ta, solid: 0.6 });
      const noise = clamp(seg(t, 5.5, 10) * 0.32 + seg(t, 14.5, 16) * 0.1 + seg(t, 23.4, 24) * 0.18);
      g.save();
      g.globalAlpha = ta;
      gauge(g, 860, 120, 350, noise, L['gauge.noise']);
      const me = { x: 880, y: 590 };
      diamond(g, me.x, me.y, 8, 'white', 0.3);
      text(g, 'kestrel', me.x, me.y + 30, { font: `12px ${MONO}`, c: 'white', align: 'center' });
      for (const hst of hosts) {
        const k = ease(seg(t, hst.at, hst.at + 0.5));
        if (k <= 0) continue;
        const pwned = hst.label === 'git' && t > 20;
        const c = pwned ? 'red' : 'dim';
        g.strokeStyle = rgba(pwned ? 'red' : 'dim', 0.35 * k);
        g.lineWidth = pwned ? 2 : 1;
        g.beginPath();
        g.moveTo(hst.label === 'gw' ? me.x : 880, hst.label === 'gw' ? me.y : 300);
        g.lineTo(hst.x, hst.y);
        g.stroke();
        diamond(g, hst.x, hst.y, 9 * k, c, pwned ? 0.35 : 0.1, pwned ? 22 : 6);
        if (k < 1) {
          g.strokeStyle = rgba('white', 1 - k);
          g.beginPath();
          g.arc(hst.x, hst.y, 30 * k, 0, Math.PI * 2);
          g.stroke();
        }
        text(g, hst.label, hst.x, hst.y - 20, { font: `12px ${MONO}`, c: pwned ? 'red' : 'text', align: 'center', a: k });
      }
      g.restore();

      // Flag burst.
      const fk = seg(t, 20, 21.6);
      if (fk > 0 && fk < 1) {
        particles(g, 1010, 410, fk, 'green', 50, 220);
        g.save();
        g.globalAlpha = 1 - fk;
        text(g, 'FLAG', 1010, 500, { font: `700 ${40 + fk * 30}px ${MONO}`, c: 'green', align: 'center' });
        g.restore();
      }

      // Ada's reminder about the law.
      const ak = ease(seg(t, 23.9, 24.4));
      if (ak > 0) {
        g.save();
        g.globalAlpha = ak;
        bubble(g, 300, 470 + (1 - ak) * 20, 660, L['ada.scope'], { who: 'human', name: 'ADA', c: 'white' });
        g.restore();
      }
      glitch(g, canvas, seg(t, 23.6, 23.9));
    },
  };
}

function filmAI(L) {
  return {
    id: 'ai',
    color: 'violet',
    duration: 27,
    tension: 0.6,
    captions: [
      [0, 'cap.b1', 'OWASP LLM01 · LLM07'],
      [10, 'cap.b2', 'OWASP LLM01'],
      [18, 'cap.b3', 'OWASP LLM06'],
    ],
    cues: [
      [0.8, 'reply'],
      [2.2, 'message'],
      [4.0, 'reply'],
      [5.8, 'message'],
      [7.6, 'detect'],
      [11.4, 'whoosh'],
      [14.6, 'objective'],
      [19.0, 'reply'],
      [21.0, 'node'],
      [21.8, 'node'],
      [22.6, 'node'],
      [23.6, 'detect'],
    ],
    draw(g, t, canvas) {
      backdrop(g, 'violet', t);

      // 1. Talking to Nova.
      const s1 = t < 9.4 ? ease(seg(t, 0, 0.5)) : 1 - seg(t, 9.4, 10);
      if (s1 > 0) {
        g.save();
        g.globalAlpha = s1;
        win(g, { x: 190, y: 50, w: 900, h: 620, title: 'browser — https://support.novamind.test', c: 'violet' });
        diamond(g, 236, 118, 10, 'violet', 0.3);
        text(g, 'Nova', 262, 113, { font: `600 18px ${HUM}`, c: 'white' });
        text(g, L['nova.role'], 262, 133, { font: `12px ${MONO}`, c: 'violet' });
        let y = 170;
        const msgs = [
          { at: 0.8, who: 'human', s: L['chat.p1'] },
          { at: 2.2, who: 'ai', s: L['chat.n1'] },
          { at: 4.0, who: 'human', s: L['chat.p2'] },
          { at: 5.8, who: 'ai', s: L['chat.n2'], leak: true },
        ];
        for (const m of msgs) {
          if (t < m.at) break;
          const k = ease(seg(t, m.at, m.at + 0.35));
          const s = m.who === 'ai' ? typed(m.s, t, m.at, 60) : m.s;
          const right = m.who === 'human';
          const hgt = bubble(g, right ? 1060 : 220, y + (1 - k) * 16, 600, s || ' ', {
            who: m.who,
            a: k,
            right,
            name: m.who === 'ai' ? 'NOVA' : null,
            c: m.leak && t > 7.6 ? 'white' : 'text',
          });
          if (m.leak && t > 7.6) {
            const lk = seg(t, 7.6, 8.0);
            g.strokeStyle = rgba('red', 0.9 * lk);
            g.lineWidth = 2;
            round(g, 220, y, 600, hgt, 12);
            g.stroke();
            g.fillStyle = rgba('red', lk);
            round(g, 720, y - 14, 100, 26, 6);
            g.fill();
            text(g, L['tag.leak'], 770, y + 4, { font: `700 12px ${MONO}`, c: '7,9,15', align: 'center' });
          }
          y += hgt + 16;
        }
        g.restore();
        glitch(g, canvas, seg(t, 7.6, 7.95));
      }

      // 2. The trapped CV and Iris.
      const s2 = t < 10 ? 0 : t < 17.4 ? ease(seg(t, 10, 10.6)) : 1 - seg(t, 17.4, 18);
      if (s2 > 0) {
        g.save();
        g.globalAlpha = s2;
        win(g, { x: 80, y: 70, w: 520, h: 580, title: 'cv.txt', c: 'white' });
        const cv = L['cv.lines'].split('|');
        cv.forEach((line, i) => text(g, line, 112, 140 + i * 30, { font: `${i === 0 ? '700 22px' : '16px'} ${i === 0 ? HUM : MONO}`, c: i === 0 ? 'white' : 'text' }));
        const ik = ease(seg(t, 11.2, 11.8));
        const lines = wrap(g, L['cv.inject'], 450, `16px ${MONO}`);
        const iy = 140 + cv.length * 30 + 30;
        g.fillStyle = rgba('violet', 0.14 * ik);
        g.fillRect(100, iy - 24, 480, lines.length * 24 + 20);
        lines.forEach((l, i) => text(g, l, 112, iy + i * 24, { font: `16px ${MONO}`, c: 'violet', a: 0.35 + ik * 0.65 }));

        // Arrow to Iris.
        const ak = ease(seg(t, 11.6, 13));
        const ix = 920;
        const iyc = 330;
        if (ak > 0) {
          g.strokeStyle = rgba('violet', 0.8);
          g.setLineDash([6, 6]);
          g.lineDashOffset = -t * 30;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(600, iy);
          g.lineTo(600 + (ix - 90 - 600) * ak, iy + (iyc - iy) * ak);
          g.stroke();
          g.setLineDash([]);
        }
        const pulse = 1 + Math.sin(t * 4) * 0.04;
        g.save();
        g.translate(ix, iyc);
        g.scale(pulse, pulse);
        g.shadowColor = rgba('violet');
        g.shadowBlur = 40;
        g.fillStyle = rgba('violet', 0.18);
        g.strokeStyle = rgba('violet');
        g.lineWidth = 2;
        g.beginPath();
        g.arc(0, 0, 80, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.restore();
        text(g, 'IRIS', ix, iyc + 8, { font: `700 26px ${MONO}`, c: 'white', align: 'center' });
        text(g, L['iris.role'], ix, iyc + 116, { font: `13px ${MONO}`, c: 'violet', align: 'center' });
        const rk = ease(seg(t, 14.6, 15.1));
        if (rk > 0) {
          g.save();
          g.globalAlpha = rk;
          win(g, { x: 760, y: 490 + (1 - rk) * 20, w: 320, h: 110, title: L['iris.answer'], c: 'red' });
          text(g, L['iris.rank'], 790, 565 + (1 - rk) * 20, { font: `700 22px ${MONO}`, c: 'red' });
          g.restore();
        }
        g.restore();
      }

      // 3. Atlas, plugged into everything.
      const s3 = ease(seg(t, 18, 18.6));
      if (s3 > 0) {
        g.save();
        g.globalAlpha = s3;
        const cx = 640;
        const cy = 400;
        const tools = [
          ['mail', -330, -150],
          ['drive', 330, -150],
          ['crm', -380, 90],
          ['deploy', 380, 90],
          ['admin', 0, 230],
        ];
        tools.forEach(([name, dx, dy], i) => {
          const hit = name === 'crm' ? 21 : name === 'drive' ? 21.8 : name === 'mail' ? 22.6 : 99;
          const lit = t > hit;
          g.strokeStyle = lit ? rgba('red', 0.9) : rgba('violet', 0.35);
          g.lineWidth = lit ? 2.5 : 1.2;
          if (lit) {
            g.shadowColor = rgba('red');
            g.shadowBlur = 14;
          }
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + dx, cy + dy);
          g.stroke();
          g.shadowBlur = 0;
          if (lit) {
            const pk = ((t - hit) * 1.6) % 1;
            g.fillStyle = rgba('red');
            g.beginPath();
            g.arc(cx + dx * pk, cy + dy * pk, 4, 0, Math.PI * 2);
            g.fill();
          }
          const bx = cx + dx - 70;
          const by = cy + dy - 30;
          g.fillStyle = 'rgba(14,19,32,0.95)';
          g.strokeStyle = lit ? rgba('red') : 'rgba(215,224,245,0.25)';
          g.lineWidth = 1;
          round(g, bx, by, 140, 60, 10);
          g.fill();
          g.stroke();
          text(g, name, cx + dx, cy + dy - 2, { font: `600 16px ${MONO}`, c: 'white', align: 'center' });
          text(g, 'role: admin', cx + dx, cy + dy + 18, { font: `11px ${MONO}`, c: lit ? 'red' : 'amber', align: 'center' });
        });
        g.save();
        g.shadowColor = rgba('violet');
        g.shadowBlur = 50;
        g.fillStyle = 'rgba(30,20,60,0.95)';
        g.strokeStyle = rgba('violet');
        g.lineWidth = 2;
        g.beginPath();
        g.arc(cx, cy, 70, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.restore();
        text(g, 'ATLAS', cx, cy + 8, { font: `700 24px ${MONO}`, c: 'white', align: 'center' });
        const bk = ease(seg(t, 19, 19.4));
        if (bk > 0) bubble(g, cx - 300, 60, 600, L['atlas.ask'], { who: 'human', a: bk, name: 'kestrel' });
        const nk = ease(seg(t, 23.6, 24.1));
        if (nk > 0) {
          g.globalAlpha = s3 * nk;
          g.fillStyle = rgba('red', 0.92);
          round(g, cx - 220, cy - 26, 440, 52, 10);
          g.fill();
          text(g, L['atlas.no'], cx, cy + 8, { font: `700 20px ${HUM}`, c: '7,9,15', align: 'center' });
        }
        g.restore();
        glitch(g, canvas, seg(t, 23.6, 23.9));
      }
    },
  };
}

function filmDefend(L) {
  const rows = [
    { at: 2.4, time: '09:14:02', act: 'nmap -sV 10.13.0.0/24', n: 12 },
    { at: 3.0, time: '09:15:40', act: 'GET /robots.txt', n: 1 },
    { at: 3.6, time: '09:17:11', act: 'git clone site.git', n: 2 },
    { at: 4.2, time: '09:19:03', act: 'GET staging:8080 (token)', n: 6 },
    { at: 4.8, time: '09:21:55', act: 'POST /api/chat  [translation]', n: 9, alert: true },
    { at: 5.4, time: '09:24:30', act: 'nmap 8.8.8.8  [refused]', n: 0 },
  ];
  return {
    id: 'defend',
    color: 'cyan',
    duration: 24,
    tension: 0.12,
    captions: [
      [0, 'cap.c1'],
      [9, 'cap.c2'],
      [16, 'cap.c3'],
    ],
    cues: [
      [0.3, 'whoosh'],
      [4.8, 'detect'],
      [10, 'objective'],
      [11.2, 'objective'],
      [12.4, 'objective'],
      [13.6, 'objective'],
      [21.5, 'flag'],
    ],
    draw(g, t) {
      backdrop(g, 'cyan', t);
      // Red to cyan wipe.
      const wk = ease(seg(t, 0, 1.2));
      if (wk < 1) {
        g.fillStyle = rgba('red', 0.25 * (1 - wk));
        g.fillRect(0, 0, W * (1 - wk), H);
        g.fillStyle = rgba('cyan', 0.9);
        g.fillRect(W * (1 - wk) - 2, 0, 3, H);
      }
      const tk = t < 2.2 ? ease(seg(t, 0.3, 0.9)) : 1 - seg(t, 2.2, 2.6);
      if (tk > 0) {
        g.save();
        g.globalAlpha = tk;
        text(g, 'BLUE TEAM', W / 2, H / 2 + 10, { font: `700 72px ${MONO}`, c: 'cyan', align: 'center' });
        text(g, L['blue.sub'], W / 2, H / 2 + 56, { font: `18px ${HUM}`, c: 'text', align: 'center' });
        g.restore();
      }

      // SOC log.
      const lk = t < 8.6 ? ease(seg(t, 2, 2.5)) : 1 - seg(t, 8.6, 9.2);
      if (lk > 0) {
        g.save();
        g.globalAlpha = lk;
        win(g, { x: 90, y: 90, w: 1100, h: 520, title: L['soc.title'], c: 'cyan' });
        const cols = [130, 280, 440, 1020];
        ['TIME', 'SOURCE', 'ACTION', 'NOISE'].forEach((h, i) => text(g, h, cols[i], 160, { font: `11px ${MONO}`, c: 'dim' }));
        let total = 0;
        rows.forEach((r, i) => {
          if (t < r.at) return;
          const k = ease(seg(t, r.at, r.at + 0.3));
          total += r.n * k;
          const y = 205 + i * 52;
          if (r.alert) {
            g.fillStyle = rgba('amber', 0.12 * k);
            g.fillRect(110, y - 28, 1060, 44);
          }
          g.globalAlpha = lk * k;
          text(g, r.time, cols[0], y, { font: `15px ${MONO}`, c: 'cyan' });
          text(g, '10.13.9.7', cols[1], y, { font: `15px ${MONO}`, c: 'text' });
          text(g, r.act, cols[2], y, { font: `15px ${MONO}`, c: 'white' });
          text(g, r.n ? `+${r.n}` : '—', cols[3], y, { font: `15px ${MONO}`, c: r.n ? 'amber' : 'dim' });
          if (r.alert) text(g, `⚠ ${L['soc.alert']}`, cols[3] + 50, y, { font: `700 12px ${MONO}`, c: 'amber' });
          g.globalAlpha = lk;
        });
        gauge(g, 130, 560, 1020, clamp(total / 40), L['gauge.noise']);
        g.restore();
      }

      // What should have been done.
      const dk = t < 15.4 ? ease(seg(t, 9, 9.6)) : 1 - seg(t, 15.4, 16);
      if (dk > 0) {
        g.save();
        g.globalAlpha = dk;
        win(g, { x: 190, y: 70, w: 900, h: 580, title: 'debrief — blue team', c: 'cyan' });
        text(g, L['debrief.kicker'], 240, 150, { font: `12px ${MONO}`, c: 'cyan' });
        text(g, L['debrief.title'], 240, 196, { font: `700 34px ${HUM}`, c: 'white' });
        ['d1', 'd2', 'd3', 'd4'].forEach((key, i) => {
          const at = 10 + i * 1.2;
          const k = ease(seg(t, at, at + 0.4));
          const y = 270 + i * 88;
          g.globalAlpha = dk * (0.25 + 0.75 * k);
          g.strokeStyle = rgba('cyan', 0.8);
          g.lineWidth = 1.5;
          round(g, 240, y - 20, 28, 28, 6);
          g.stroke();
          if (k > 0) {
            g.strokeStyle = rgba('cyan');
            g.lineWidth = 3;
            g.beginPath();
            g.moveTo(247, y - 6);
            g.lineTo(247 + 5 * clamp(k * 2), y - 6 + 6 * clamp(k * 2));
            if (k > 0.5) g.lineTo(253 + 9 * clamp((k - 0.5) * 2), y - 0 - 14 * clamp((k - 0.5) * 2));
            g.stroke();
          }
          wrap(g, L[`debrief.${key}`], 740, `19px ${HUM}`).forEach((l, j) => text(g, l, 290, y + j * 26, { font: `19px ${HUM}`, c: 'white' }));
        });
        g.restore();
      }

      // Score.
      const sk = ease(seg(t, 16, 16.6));
      if (sk > 0) {
        g.save();
        g.globalAlpha = sk;
        win(g, { x: 290, y: 90, w: 700, h: 540, title: 'score', c: 'cyan' });
        const lines = [
          [L['score.flags'], '250', 'text', 17],
          [L['score.objectives'], '4 × 50', 'text', 17.6],
          [L['score.level'], '× 1.5', 'white', 18.2],
          [L['score.hint'], '− 10', 'amber', 18.8],
          [L['score.detect'], '− 25', 'amber', 19.4],
        ];
        lines.forEach(([label, val, c, at], i) => {
          const k = ease(seg(t, at, at + 0.3));
          g.globalAlpha = sk * k;
          const y = 180 + i * 56;
          text(g, label, 340, y, { font: `19px ${HUM}`, c: 'text' });
          text(g, val, 940, y, { font: `20px ${MONO}`, c, align: 'right' });
          g.fillStyle = 'rgba(215,224,245,0.08)';
          g.fillRect(340, y + 18, 600, 1);
        });
        g.globalAlpha = sk;
        const ck = ease(seg(t, 20, 21.5));
        text(g, L['score.total'], 340, 520, { font: `600 20px ${HUM}`, c: 'white' });
        g.shadowColor = rgba('green');
        g.shadowBlur = 24 * ck;
        text(g, String(Math.round(640 * ck)), 940, 530, { font: `700 64px ${MONO}`, c: ck > 0 ? 'green' : 'dim', align: 'right' });
        g.shadowBlur = 0;
        particles(g, 860, 510, seg(t, 21.5, 23), 'green', 40, 200);
        g.restore();
      }
    },
  };
}

function filmCommunity(L) {
  const yaml = [
    [['k', 'id'], ['', ': '], ['s', 'jdoe.lost-backup']],
    [['k', 'kind'], ['', ': mission']],
    [['k', 'requires'], ['', ': [jdoe.bakery-world]']],
    [['k', 'objectives'], ['', ':']],
    [['', '  - '], ['k', 'id'], ['', ': '], ['s', 'find-backup']],
    [['', '  - '], ['k', 'id'], ['', ': '], ['s', 'read-backup']],
    [['k', 'flags'], ['', ':']],
    [['', '  - '], ['k', 'sha256'], ['', ': '], ['s', '9f2c…e1']],
    [['k', 'debrief'], ['', ': '], ['s', 'debrief.fix']],
    [['c', '# no code. only data.']],
  ];
  const tint = { k: '143,216,255', s: '255,210,122', c: 'dim', '': 'text' };
  return {
    id: 'community',
    color: 'green',
    duration: 22,
    tension: 0.3,
    captions: [
      [0, 'cap.d1'],
      [7, 'cap.d2'],
      [13, 'cap.d3', 'ECDSA P-256 · SHA-256'],
      [17, 'cap.d4'],
    ],
    cues: [
      [7.6, 'objective'],
      [9.0, 'objective'],
      [10.4, 'objective'],
      [11.8, 'objective'],
      [14.6, 'message'],
      [18.8, 'flag'],
    ],
    draw(g, t) {
      backdrop(g, 'green', t, 0.6);

      const ek = t < 6.4 ? ease(seg(t, 0, 0.5)) : 1 - seg(t, 6.4, 7);
      if (ek > 0) {
        g.save();
        g.globalAlpha = ek;
        win(g, { x: 230, y: 60, w: 820, h: 600, title: 'packs/jdoe.lost-backup/mission.yaml', c: 'white' });
        const chars = Math.floor(t * 70);
        let used = 0;
        yaml.forEach((parts, i) => {
          let x = 290;
          const y = 140 + i * 44;
          text(g, String(i + 1).padStart(2, ' '), 254, y, { font: `14px ${MONO}`, c: 'dim', a: 0.6 });
          for (const [k, s] of parts) {
            const vis = s.slice(0, Math.max(0, chars - used));
            used += s.length;
            g.font = `19px ${MONO}`;
            g.fillStyle = rgba(tint[k]);
            g.textAlign = 'left';
            g.fillText(vis, x, y);
            x += g.measureText(s).width;
          }
          used += 4;
        });
        g.restore();
      }

      const pk = t < 12.6 ? ease(seg(t, 7, 7.5)) : 1 - seg(t, 12.6, 13.2);
      if (pk > 0) {
        g.save();
        g.globalAlpha = pk;
        text(g, 'pull request · CI', W / 2, 170, { font: `14px ${MONO}`, c: 'dim', align: 'center' });
        const steps = ['pipe.schema', 'pipe.safety', 'pipe.replay', 'pipe.review'];
        steps.forEach((key, i) => {
          const at = 7.6 + i * 1.4;
          const ok = t > at;
          const x = 110 + i * 275;
          const y = 280;
          if (i > 0) {
            g.strokeStyle = ok ? rgba('green', 0.8) : 'rgba(215,224,245,0.15)';
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(x - 45, y + 80);
            g.lineTo(x, y + 80);
            g.stroke();
          }
          g.fillStyle = 'rgba(14,19,32,0.95)';
          g.strokeStyle = ok ? rgba('green') : 'rgba(215,224,245,0.2)';
          g.lineWidth = 1.5;
          if (ok) {
            g.shadowColor = rgba('green');
            g.shadowBlur = 24;
          }
          round(g, x, y, 230, 160, 12);
          g.fill();
          g.stroke();
          g.shadowBlur = 0;
          text(g, ok ? '✓' : '…', x + 115, y + 68, { font: `700 40px ${MONO}`, c: ok ? 'green' : 'dim', align: 'center' });
          wrap(g, L[key], 200, `16px ${HUM}`).forEach((l, j) => text(g, l, x + 115, y + 110 + j * 22, { font: `16px ${HUM}`, c: 'white', align: 'center' }));
        });
        g.restore();
      }

      const ck = t < 16.6 ? ease(seg(t, 13, 13.6)) : 1 - seg(t, 16.6, 17.2);
      if (ck > 0) {
        g.save();
        g.globalAlpha = ck;
        win(g, { x: 250, y: 120, w: 520, h: 480, title: 'index.json', c: 'white' });
        const lines = ['{', '  "packs": [', '    { "id": "jdoe.lost-backup",', '      "version": "1.0.0",', '      "sha256": "4be1…a07c" },', '    …', '  ]', '}'];
        lines.forEach((l, i) => text(g, l, 290, 190 + i * 40, { font: `18px ${MONO}`, c: i === 2 ? 'white' : 'text' }));
        const sk = ease(seg(t, 14.4, 15));
        g.save();
        g.translate(930, 360);
        g.scale(0.6 + sk * 0.4, 0.6 + sk * 0.4);
        g.globalAlpha = ck * sk;
        g.shadowColor = rgba('green');
        g.shadowBlur = 40;
        g.strokeStyle = rgba('green');
        g.lineWidth = 3;
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 110, Math.sin(a) * 110);
        }
        g.closePath();
        g.stroke();
        g.shadowBlur = 0;
        text(g, '✓', 0, 12, { font: `700 64px ${MONO}`, c: 'green', align: 'center' });
        text(g, L['sign.label'], 0, 150, { font: `600 16px ${MONO}`, c: 'white', align: 'center' });
        text(g, 'ECDSA P-256', 0, 176, { font: `13px ${MONO}`, c: 'dim', align: 'center' });
        g.restore();
        g.restore();
      }

      const gk = ease(seg(t, 17, 17.6));
      if (gk > 0) {
        g.save();
        g.globalAlpha = gk;
        text(g, L['comm.title'], W / 2, 140, { font: `500 14px ${MONO}`, c: 'dim', align: 'center' });
        const cards = [
          [L['comm.c1'], L['comm.by1']],
          [L['comm.c2'], L['comm.by2']],
          [L['comm.c3'], 'Jane Doe'],
        ];
        cards.forEach(([title, by], i) => {
          const isNew = i === 2;
          const k = isNew ? ease(seg(t, 18.6, 19.3)) : 1;
          const x = 150 + i * 340 + (isNew ? (1 - k) * 200 : 0);
          g.globalAlpha = gk * k;
          g.fillStyle = 'rgba(14,19,32,0.95)';
          g.strokeStyle = isNew ? rgba('green') : 'rgba(215,224,245,0.2)';
          g.lineWidth = isNew ? 2 : 1;
          if (isNew) {
            g.shadowColor = rgba('green');
            g.shadowBlur = 30;
          }
          round(g, x, 220, 300, 260, 12);
          g.fill();
          g.stroke();
          g.shadowBlur = 0;
          wrap(g, title, 250, `700 24px ${HUM}`).forEach((l, j) => text(g, l, x + 26, 290 + j * 30, { font: `700 24px ${HUM}`, c: 'white' }));
          text(g, by, x + 26, 440, { font: `13px ${MONO}`, c: 'dim' });
          if (isNew) {
            g.fillStyle = rgba('green');
            round(g, x + 26, 236, 70, 24, 6);
            g.fill();
            text(g, L['comm.new'], x + 61, 253, { font: `700 11px ${MONO}`, c: '7,9,15', align: 'center' });
          }
        });
        g.restore();
        particles(g, 980, 350, seg(t, 19.2, 20.6), 'green', 40, 260);
      }
    },
  };
}

/* ---------------- the player ---------------- */

export function startFilms(root) {
  const L = JSON.parse(document.getElementById('film-strings').textContent);
  const films = [filmAttack(L), filmAI(L), filmDefend(L), filmCommunity(L)];
  const canvas = root.querySelector('canvas');
  const g = canvas.getContext('2d');
  const screen = root.querySelector('.screen');
  const big = root.querySelector('.big-play');
  const playBtn = root.querySelector('[data-play]');
  const fill = root.querySelector('.progress .fill');
  const progress = root.querySelector('.progress');
  const time = root.querySelector('.time');
  const caption = root.querySelector('.caption');
  const reels = [...root.querySelectorAll('.reel')];
  const head = root.querySelector('.screen .win-head .title');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  let idx = 0;
  let t = 0;
  let playing = false;
  let last = 0;
  let raf = 0;
  let inView = false;
  let userPaused = false;
  let lastCaption = '';
  let dpr = 1;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = canvas.clientWidth || 960;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round((cw * 9) / 16) * dpr;
    render();
  }

  function render() {
    const f = films[idx];
    const s = canvas.width / W;
    g.setTransform(s, 0, 0, s, 0, 0);
    g.globalAlpha = 1;
    f.draw(g, t, canvas);
    // Vignette and scanlines, part of the look.
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.018)';
    for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);

    fill.style.width = `${(t / f.duration) * 100}%`;
    progress.setAttribute('aria-valuenow', String(Math.round((t / f.duration) * 100)));
    time.textContent = `${fmt(t)} / ${fmt(f.duration)}`;
    let cap = f.captions[0];
    for (const c of f.captions) if (t >= c[0]) cap = c;
    const key = `${f.id}:${cap[1]}`;
    if (key !== lastCaption) {
      lastCaption = key;
      caption.replaceChildren(document.createTextNode(L[cap[1]]));
      if (cap[2]) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = cap[2];
        caption.append(tag);
      }
    }
  }

  const fmt = (s) => `0:${String(Math.floor(s)).padStart(2, '0')}`;

  function tick(now) {
    raf = 0;
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const f = films[idx];
    const prev = t;
    t += dt;
    for (const [at, name] of f.cues) if (prev < at && t >= at) music.sfx(name);
    if (t >= f.duration) {
      t = f.duration;
      render();
      // Next film after a breath.
      playing = false;
      setTimeout(() => {
        if (userPaused || !inView) return;
        select((idx + 1) % films.length, true);
      }, 1400);
      return;
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function play() {
    if (playing) return;
    if (t >= films[idx].duration) t = 0;
    playing = true;
    userPaused = false;
    screen.classList.add('playing');
    playBtn.setAttribute('aria-label', L['ui.pause']);
    playBtn.querySelector('use')?.setAttribute('href', '#i-pause');
    playBtn.dataset.state = 'pause';
    music.setTension(films[idx].tension);
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function pause(byUser) {
    playing = false;
    if (byUser) userPaused = true;
    playBtn.setAttribute('aria-label', L['ui.play']);
    playBtn.dataset.state = 'play';
  }

  function select(i, autoplay) {
    idx = i;
    t = 0;
    lastCaption = '';
    reels.forEach((r, j) => r.setAttribute('aria-pressed', String(j === i)));
    progress.className = `progress ${films[i].color}`;
    root.querySelector('.screen').className = `screen glass ${films[i].color === 'green' ? '' : films[i].color}${playing ? ' playing' : ''}`;
    head.textContent = L[`film.${films[i].id}`];
    render();
    if (autoplay) {
      playing = false;
      play();
    }
  }

  reels.forEach((r, i) =>
    r.addEventListener('click', () => {
      select(i, true);
    }),
  );
  const toggle = () => (playing ? pause(true) : play());
  playBtn.addEventListener('click', toggle);
  big.addEventListener('click', play);
  canvas.addEventListener('click', toggle);
  function seekFrom(e) {
    const r = progress.getBoundingClientRect();
    t = clamp((e.clientX - r.left) / r.width) * films[idx].duration;
    lastCaption = '';
    render();
  }
  progress.addEventListener('pointerdown', (e) => {
    seekFrom(e);
    progress.setPointerCapture(e.pointerId);
  });
  progress.addEventListener('pointermove', (e) => {
    if (progress.hasPointerCapture(e.pointerId)) seekFrom(e);
  });
  progress.addEventListener('keydown', (e) => {
    const f = films[idx];
    if (e.key === 'ArrowRight') t = Math.min(f.duration, t + 2);
    else if (e.key === 'ArrowLeft') t = Math.max(0, t - 2);
    else return;
    e.preventDefault();
    lastCaption = '';
    render();
  });

  new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting;
      if (inView && !userPaused && !reduce.matches) play();
      if (!inView && playing) pause(false);
    },
    { threshold: 0.45 },
  ).observe(canvas);

  window.addEventListener('resize', resize);
  document.fonts.ready.then(() => {
    resize();
    // A still that tells the story: the middle of the first film.
    if (!playing) {
      t = reduce.matches ? 20.4 : 0;
      render();
    }
  });
  select(0, false);
  resize();
}
