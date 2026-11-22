/**
 * The site's music, generated on the spot with the Web Audio API, like the game's own soundtrack:
 * no audio file, no library, nothing licensed. A slow dark-synth loop whose filter opens and whose
 * arpeggio thickens with the tension, plus short signatures for the films' events.
 * Nothing plays until the visitor presses the sound button.
 */

const A1 = 55;
const hz = (s) => A1 * 2 ** (s / 12);
/** A minor, F, D minor, E. */
const CHORDS = [
  [0, 12, 15, 19, 24],
  [-4, 8, 12, 15, 20],
  [5, 12, 17, 20, 24],
  [-5, 7, 11, 14, 19],
];
const BPM = 84;
const STEP = 60 / BPM / 4;
const STEPS_PER_BAR = 32;

let ctx = null;
let master;
let musicBus;
let sfxBus;
let filter;
let delay;
let analyser;
let drone = null;
let timer;
let step = 0;
let nextTime = 0;
let tension = 0.15;
let target = 0.15;
let on = false;
const listeners = new Set();

function build() {
  ctx = new AudioContext();
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.ratio.value = 10;
  master = ctx.createGain();
  master.gain.value = 0;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  master.connect(limiter).connect(analyser).connect(ctx.destination);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0.75;
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.6;
  filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  filter.Q.value = 0.9;

  // A dark feedback delay gives the arpeggio some space.
  delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 1800;
  delay.connect(damp).connect(fb).connect(delay);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  delay.connect(wet).connect(musicBus);

  filter.connect(musicBus);
  filter.connect(delay);
  musicBus.connect(master);
  sfxBus.connect(master);

  const g = ctx.createGain();
  g.gain.value = 0.14;
  g.connect(filter);
  drone = {
    gain: g,
    osc: [-7, 7, 0].map((detune, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'sine' : 'sawtooth';
      o.frequency.value = i === 2 ? A1 / 2 : A1;
      o.detune.value = detune;
      o.connect(g);
      o.start();
      return o;
    }),
  };

  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
}

function note(out, type, freq, at, length, level, attack = 0.01, detune = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

function noiseHat(at, level) {
  const len = Math.floor(ctx.sampleRate * 0.05);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.value = level;
  src.connect(hp).connect(g).connect(musicBus);
  src.start(at);
}

function schedule() {
  // Tension glides towards its target, so changes of section never jump.
  tension += (target - tension) * 0.04;
  const open = 260 + tension ** 1.4 * 2600;
  filter.frequency.setTargetAtTime(open, ctx.currentTime, 0.5);

  while (nextTime < ctx.currentTime + 0.25) {
    const bar = Math.floor(step / STEPS_PER_BAR) % CHORDS.length;
    const chord = CHORDS[bar];
    const pos = step % STEPS_PER_BAR;
    const t = nextTime;
    if (pos === 0) {
      for (const o of drone.osc) o.frequency.setTargetAtTime(hz(chord[0]) * (o.type === 'sine' ? 0.5 : 1), t, 0.3);
      for (const n of chord.slice(1, 4)) note(filter, 'triangle', hz(n + 12), t, STEP * STEPS_PER_BAR, 0.04, 1.2, 6);
    }
    const every = tension > 0.7 ? 1 : tension > 0.4 ? 2 : 4;
    if (pos % every === 0) {
      const n = chord[1 + ((pos / every) % 4)];
      note(filter, 'sawtooth', hz(n + 12), t, STEP * 1.8, 0.028 + tension * 0.08, 0.005);
    }
    if (tension > 0.35 && pos % 8 === 4) noiseHat(t, 0.05 + tension * 0.06);
    if (tension > 0.5 && pos % 8 === 0) note(musicBus, 'sine', 50, t, 0.25, 0.2 + (tension - 0.5) * 0.3, 0.004);
    step++;
    nextTime += STEP;
  }
}

export function isOn() {
  return on;
}

/** Start or stop the music. Must be called from a click: browsers refuse sound before that. */
export async function setOn(next) {
  if (next && !ctx) {
    if (!window.AudioContext) return;
    build();
  }
  on = next;
  if (!ctx) return;
  const now = ctx.currentTime;
  if (on) {
    await ctx.resume();
    if (timer === undefined) {
      nextTime = ctx.currentTime + 0.1;
      timer = setInterval(schedule, 80);
    }
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0.85, now, 0.6);
  } else {
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.25);
    setTimeout(() => {
      if (!on && ctx) void ctx.suspend();
    }, 1200);
  }
  for (const fn of listeners) fn(on);
}

export function onChange(fn) {
  listeners.add(fn);
}

/** 0 to 1. The hero is calm, an attack is tense, a debrief is calm again. */
export function setTension(k) {
  target = Math.max(0, Math.min(1, k));
}

/** How loud the output is now, for the little equaliser in the sound button. */
export function levels(n) {
  const out = new Array(n).fill(0);
  if (!ctx || !on) return out;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const per = Math.floor(data.length / 2 / n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < per; j++) s += data[i * per + j];
    out[i] = s / per / 255;
  }
  return out;
}

/** A short signature for an event in a film. */
export function sfx(name) {
  if (!ctx || !on || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.01;
  const out = sfxBus;
  switch (name) {
    case 'key':
      note(out, 'square', 1800 + Math.random() * 400, t, 0.02, 0.012);
      break;
    case 'message':
      note(out, 'sine', 880, t, 0.12, 0.1);
      note(out, 'sine', 1174.7, t + 0.09, 0.18, 0.08);
      break;
    case 'node':
      note(out, 'triangle', 659.3, t, 0.14, 0.06);
      break;
    case 'objective':
      note(out, 'triangle', 783.99, t, 0.5, 0.1);
      note(out, 'sine', 1567.98, t, 0.4, 0.035);
      break;
    case 'flag':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        note(out, 'triangle', f, t + i * 0.08, 0.5, 0.12);
        note(out, 'sine', f * 2, t + i * 0.08, 0.3, 0.035);
      });
      break;
    case 'wrong':
      note(out, 'square', 155.6, t, 0.16, 0.05);
      note(out, 'square', 146.8, t + 0.12, 0.22, 0.05);
      break;
    case 'detect': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.9);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 1.05);
      break;
    }
    case 'whoosh': {
      const len = Math.floor(ctx.sampleRate * 0.6);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 2;
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.exponentialRampToValueAtTime(3000, t + 0.6);
      const g = ctx.createGain();
      g.gain.value = 0.12;
      src.connect(bp).connect(g).connect(out);
      src.start(t);
      break;
    }
  }
}
