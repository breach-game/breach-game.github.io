/**
 * The hero's living background: NovaMind's fictional network, seen from the pentester's desk.
 * Hosts float on a tilted plane that slowly turns. Red paths are attacks, cyan rings are the
 * defenders' scans, violet hosts are AIs. Every name lives under .novamind.test, as in the game.
 */

const COLORS = {
  red: '255,61,90',
  cyan: '45,226,255',
  violet: '155,92,255',
  green: '61,255,154',
  white: '238,242,255',
  dim: '125,139,170',
};

const NODES = [
  { id: 'kestrel', label: 'kestrel@lignerouge', x: -7.2, z: 4.5, kind: 'player' },
  { id: 'gw', label: 'gw.novamind.test', x: -3.2, z: 1.4, kind: 'host' },
  { id: 'www', label: 'www.novamind.test', x: -0.4, z: 3.3, kind: 'host' },
  { id: 'support', label: 'support', x: 2.4, z: 4.6, kind: 'host' },
  { id: 'nova', label: 'nova · ai', x: 4.9, z: 3.1, kind: 'ai' },
  { id: 'git', label: 'git.novamind.test', x: -1.2, z: -1.4, kind: 'host' },
  { id: 'staging', label: 'staging', x: 1.7, z: -0.2, kind: 'host' },
  { id: 'careers', label: 'careers', x: 1.2, z: 1.9, kind: 'host' },
  { id: 'iris', label: 'iris · ai', x: 4.0, z: 0.6, kind: 'ai' },
  { id: 'atlas', label: 'atlas · ai', x: 3.4, z: -2.8, kind: 'ai' },
  { id: 'drive', label: 'drive', x: 6.4, z: -1.3, kind: 'host' },
  { id: 'mail', label: 'mail', x: 6.2, z: -4.2, kind: 'host' },
  { id: 'db', label: '10.13.2.20', x: 0.2, z: -4.4, kind: 'host' },
  { id: 'ci', label: 'ci', x: -3.6, z: -3.6, kind: 'host' },
  { id: 'soc', label: 'soc · blue team', x: -5.4, z: -1.0, kind: 'soc' },
];
const EDGES = [
  ['kestrel', 'gw'],
  ['gw', 'www'],
  ['www', 'support'],
  ['support', 'nova'],
  ['gw', 'git'],
  ['git', 'staging'],
  ['www', 'careers'],
  ['careers', 'iris'],
  ['iris', 'staging'],
  ['staging', 'atlas'],
  ['atlas', 'drive'],
  ['atlas', 'mail'],
  ['atlas', 'db'],
  ['git', 'ci'],
  ['ci', 'db'],
  ['soc', 'gw'],
  ['soc', 'ci'],
  ['nova', 'iris'],
];
const ATTACKS = [
  ['kestrel', 'gw', 'git', 'staging'],
  ['kestrel', 'gw', 'www', 'support', 'nova'],
  ['kestrel', 'gw', 'www', 'careers', 'iris'],
  ['kestrel', 'gw', 'git', 'staging', 'atlas', 'drive'],
  ['kestrel', 'gw', 'git', 'ci', 'db'],
];

export function startHero(canvas) {
  const g = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const byId = Object.fromEntries(NODES.map((n) => [n.id, { ...n, hit: 0, pop: 0 }]));
  const packets = [];
  const rings = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let mx = 0;
  let my = 0;
  let pmx = 0;
  let pmy = 0;
  let visible = true;
  let attack = null;
  let lastAttack = -3;
  let lastScan = 0;
  let start = performance.now();
  let raf = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  function project(x, z, y, t) {
    const a = 0.35 + Math.sin(t * 0.05) * 0.32 + pmx * 0.12;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const tilt = 0.5 + pmy * 0.06;
    const depth = 15 + rz * Math.cos(tilt);
    const f = Math.min(w, h * 1.7) * (w > 900 ? 0.72 : 0.9);
    const cx = w * (w > 900 ? 0.7 : 0.5);
    const cy = h * 0.5;
    const s = f / depth;
    return {
      x: cx + rx * s,
      y: cy + (y * -1 + rz * Math.sin(tilt) * 0.55) * s * 0.9,
      s,
      depth,
    };
  }

  function launchAttack(t) {
    const path = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];
    attack = { path, t0: t, hop: 0 };
    lastAttack = t;
  }

  function frame(now) {
    raf = 0;
    const t = (now - start) / 1000;
    pmx += (mx - pmx) * 0.04;
    pmy += (my - pmy) * 0.04;
    draw(t);
    if (visible && !reduce.matches) raf = requestAnimationFrame(frame);
  }

  function draw(t) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    // Ambient light: deep violet with a red breath while an attack runs.
    const breath = attack ? 0.5 + 0.5 * Math.sin((t - attack.t0) * 2) : 0;
    const amb = g.createRadialGradient(w * 0.65, h * 0.55, 0, w * 0.65, h * 0.55, Math.max(w, h) * 0.75);
    amb.addColorStop(0, `rgba(59,42,122,${0.32 + breath * 0.06})`);
    amb.addColorStop(0.5, `rgba(${COLORS.red},${0.03 + breath * 0.05})`);
    amb.addColorStop(1, 'rgba(7,9,15,0)');
    g.fillStyle = amb;
    g.fillRect(0, 0, w, h);

    // Floor grid.
    g.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      for (const dir of [0, 1]) {
        const a = dir ? project(i, -8, -0.6, t) : project(-10, i * 0.8, -0.6, t);
        const b = dir ? project(i, 8, -0.6, t) : project(10, i * 0.8, -0.6, t);
        const grad = g.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, 'rgba(125,139,170,0)');
        grad.addColorStop(0.5, 'rgba(125,139,170,0.07)');
        grad.addColorStop(1, 'rgba(125,139,170,0)');
        g.strokeStyle = grad;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }

    // Attack progress.
    if (!attack && t - lastAttack > 4.5) launchAttack(t);
    const litEdges = new Set();
    if (attack) {
      const hop = Math.floor((t - attack.t0) / 0.75);
      if (hop !== attack.hop && hop < attack.path.length) {
        attack.hop = hop;
        const node = byId[attack.path[hop]];
        node.pop = 1;
        if (hop === attack.path.length - 1) node.hit = 1;
      }
      for (let i = 0; i < Math.min(hop, attack.path.length - 1); i++) litEdges.add(`${attack.path[i]}>${attack.path[i + 1]}`);
      if (t - attack.t0 > attack.path.length * 0.75 + 2.2) attack = null;
    }

    // Defenders' scan from the SOC.
    if (t - lastScan > 6.5) {
      lastScan = t;
      rings.push({ id: 'soc', t0: t });
    }

    // Edges.
    const P = {};
    for (const n of NODES) {
      const node = byId[n.id];
      P[n.id] = project(n.x, n.z, 0.35 + Math.sin(t * 0.7 + n.x) * 0.06, t);
      node.pop *= 0.94;
      node.hit *= 0.995;
    }
    for (const [a, b] of EDGES) {
      const pa = P[a];
      const pb = P[b];
      const lit = litEdges.has(`${a}>${b}`) || litEdges.has(`${b}>${a}`);
      g.strokeStyle = lit ? `rgba(${COLORS.red},0.85)` : 'rgba(125,139,170,0.2)';
      g.lineWidth = lit ? 2 : 1;
      if (lit) {
        g.shadowColor = `rgba(${COLORS.red},0.9)`;
        g.shadowBlur = 12;
      }
      g.beginPath();
      g.moveTo(pa.x, pa.y);
      g.lineTo(pb.x, pb.y);
      g.stroke();
      g.shadowBlur = 0;
      if (Math.random() < 0.006) packets.push({ a, b, t0: t, c: a === 'soc' || b === 'soc' ? 'cyan' : 'dim' });
    }
    if (attack && Math.random() < 0.25) {
      const hop = Math.min(attack.hop, attack.path.length - 1);
      if (hop > 0) packets.push({ a: attack.path[hop - 1], b: attack.path[hop], t0: t, c: 'red', fast: true });
    }

    // Packets.
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      const k = (t - p.t0) / (p.fast ? 0.6 : 1.8);
      if (k >= 1) {
        packets.splice(i, 1);
        continue;
      }
      const pa = P[p.a];
      const pb = P[p.b];
      const x = pa.x + (pb.x - pa.x) * k;
      const y = pa.y + (pb.y - pa.y) * k;
      g.fillStyle = `rgba(${COLORS[p.c]},${p.c === 'dim' ? 0.6 : 0.95})`;
      g.shadowColor = `rgba(${COLORS[p.c]},1)`;
      g.shadowBlur = p.c === 'dim' ? 0 : 10;
      g.beginPath();
      g.arc(x, y, p.c === 'dim' ? 1.4 : 2.2, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;
    }

    // Scan rings.
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const k = (t - r.t0) / 3.2;
      if (k >= 1) {
        rings.splice(i, 1);
        continue;
      }
      const n = byId[r.id];
      const c = project(n.x, n.z, -0.6, t);
      g.strokeStyle = `rgba(${COLORS.cyan},${0.45 * (1 - k)})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(c.x, c.y, k * c.s * 9, k * c.s * 9 * 0.3, 0, 0, Math.PI * 2);
      g.stroke();
    }

    // Nodes, far to near.
    const order = NODES.map((n) => n.id).sort((a, b) => P[b].depth - P[a].depth);
    const small = w < 700;
    for (const id of order) {
      const n = byId[id];
      const p = P[id];
      const base = project(n.x, n.z, -0.6, t);
      let c = n.kind === 'ai' ? COLORS.violet : n.kind === 'soc' ? COLORS.cyan : n.kind === 'player' ? COLORS.white : COLORS.dim;
      if (n.hit > 0.05) c = COLORS.red;
      const r = Math.max(3, p.s * 0.11) * (1 + n.pop * 0.6);

      // Stem and ring on the floor.
      g.strokeStyle = `rgba(${c},0.25)`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(p.x, p.y);
      g.lineTo(base.x, base.y);
      g.stroke();
      g.strokeStyle = `rgba(${c},0.5)`;
      g.beginPath();
      g.ellipse(base.x, base.y, r * 1.9, r * 0.6, 0, 0, Math.PI * 2);
      g.stroke();

      // Diamond.
      g.save();
      g.translate(p.x, p.y);
      g.rotate(Math.PI / 4);
      g.shadowColor = `rgba(${c},0.9)`;
      g.shadowBlur = n.kind === 'host' && n.hit < 0.05 ? 4 : 18;
      g.fillStyle = n.kind === 'host' && n.hit < 0.05 ? 'rgba(14,19,32,0.95)' : `rgba(${c},0.25)`;
      g.strokeStyle = `rgba(${c},0.95)`;
      g.lineWidth = 1.5;
      g.fillRect(-r, -r, r * 2, r * 2);
      g.strokeRect(-r, -r, r * 2, r * 2);
      g.restore();
      if (n.pop > 0.1) {
        g.strokeStyle = `rgba(${c},${n.pop})`;
        g.beginPath();
        g.arc(p.x, p.y, r * (3 - n.pop * 1.5), 0, Math.PI * 2);
        g.stroke();
      }

      // Label.
      if (!small || n.kind !== 'host') {
        g.font = `${Math.max(10, Math.min(12, p.s * 0.3))}px "JetBrains Mono", monospace`;
        g.fillStyle = `rgba(${c},${n.kind === 'host' && n.hit < 0.05 ? 0.75 : 1})`;
        g.textAlign = 'center';
        g.fillText(n.label, p.x, p.y - r - 9);
      }
    }
  }

  function kick() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduce.matches) draw(12);
  });
  window.addEventListener(
    'pointermove',
    (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  }).observe(canvas);
  reduce.addEventListener('change', () => {
    start = performance.now();
    kick();
  });
  if (reduce.matches) draw(12);
  else kick();
}
