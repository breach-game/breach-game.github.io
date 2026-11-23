/**
 * Builds the static site from src/content.mjs and src/docs.mjs.
 * Run `node src/build.mjs` after changing a text; the generated pages are committed, so GitHub
 * Pages serves the repository as it is, with no build step on its side.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GAME, T } from './content.mjs';
import { DOCS } from './docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://breach-game.github.io';
const VERSION = '1';

// Visit counting with Marco's self-hosted Umami: no cookie, no personal data, Do Not Track honoured.
// Only this presentation site is counted; the game at /breach/ stays free of analytics.
const UMAMI = {
  origin: 'https://umami.mornati.net',
  websiteId: '4da1fc30-0ef6-4e21-9b99-3891034af923',
};

const CSP = [
  "default-src 'self'",
  `script-src 'self' ${UMAMI.origin}`,
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  `connect-src 'self' ${UMAMI.origin}`,
  "media-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "require-trusted-types-for 'script'",
  "trusted-types 'none'",
].join('; ');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICONS = `<svg width="0" height="0" class="sr-only" aria-hidden="true">
  <symbol id="i-play" viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></symbol>
  <symbol id="i-pause" viewBox="0 0 24 24"><path fill="currentColor" d="M6 4h4v16H6zM14 4h4v16h-4z"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M15 6l-6 6 6 6"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M9 6l6 6-6 6"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-gh" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></symbol>
</svg>`;

// Umami counts a click on any element carrying data-umami-event, with its data-umami-event-* properties.
const play = (from) => `data-umami-event="play" data-umami-event-from="${from}"`;

const icon = (id, size = 18) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

function head(t, { title, description, path, alt }) {
  const url = `${SITE}${path}`;
  return `<!doctype html>
<html lang="${t.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#07090F">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${t.lang}" href="${url}">
<link rel="alternate" hreflang="${t.other}" href="${SITE}${alt}">
<link rel="alternate" hreflang="x-default" href="${SITE}${t.lang === 'en' ? path : alt}">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/brand/favicon-180.png">
<link rel="preload" href="/assets/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${VERSION}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BREACH">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/brand/social-preview.png">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta property="og:locale" content="${t.lang === 'en' ? 'en_GB' : 'fr_FR'}">
<meta name="twitter:card" content="summary_large_image">
<script type="module" src="/assets/js/main.js?v=${VERSION}"></script>
<script defer src="${UMAMI.origin}/script.js" data-website-id="${UMAMI.websiteId}" data-domains="breach-game.github.io" data-do-not-track="true"></script>
</head>`;
}

function header(t, { page, alt }) {
  const home = t.base;
  const a = (href, label, cur) => `<a href="${href}"${cur ? ' aria-current="page"' : ''}>${label}</a>`;
  const anchor = (id) => (page === 'home' ? `#${id}` : `${home}#${id}`);
  return `<a class="skip" href="#main">${t.skip}</a>
${ICONS}
<header class="top">
  <a class="brand" href="${home}" aria-label="BREACH">
    <img src="/assets/brand/breach-wordmark-dark-bg.svg" alt="" width="110" height="30">
    <span>cyber thriller</span>
  </a>
  <nav class="nav" id="nav" aria-label="${t.lang === 'en' ? 'Main' : 'Principale'}">
    ${a(anchor('films'), t.nav.films)}
    ${a(anchor('missions'), t.nav.missions)}
    ${a(anchor('community'), t.nav.community)}
    ${a(`${home}docs/`, t.nav.docs, page === 'docs')}
    <a href="${alt}" hreflang="${t.other}" lang="${t.other}" aria-label="${t.otherName}">${t.otherLabel}</a>
  </nav>
  <button class="tool" type="button" data-sound data-on="${t.sound.on}" data-off="${t.sound.off}" aria-pressed="false" title="${esc(t.sound.label)}">
    <span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl hide-sm">${t.sound.off}</span><span class="sr-only">${esc(t.sound.label)}</span>
  </button>
  <a class="tool cta-mini hide-sm" href="${GAME}" ${play('header')}>${t.nav.play} ${icon('arrow', 14)}</a>
  <button class="tool menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="${t.menu}">${icon('menu')}</button>
</header>`;
}

function footer(t) {
  return `<footer class="foot">
  <div class="wrap">
    <div>
      <img src="/assets/brand/breach-wordmark-dark-bg.svg" alt="BREACH" width="120" height="33">
      <p class="legal">${t.foot.legal}</p>
    </div>
    <nav aria-label="${t.lang === 'en' ? 'Footer' : 'Pied de page'}">
      ${t.foot.links.map(([l, h]) => `<a href="${h}"${h === GAME ? ` ${play('footer')}` : ''}>${l}</a>`).join('\n      ')}
    </nav>
  </div>
</footer>`;
}

const shot = (name, w = 1600) => `/assets/img/shots/${name}-${w}.webp`;
const img = (name, alt, cls = '', eager = false) =>
  `<img src="${shot(name)}" srcset="${shot(name, 800)} 800w, ${shot(name)} 1600w" sizes="(max-width: 900px) 92vw, 600px" alt="${esc(alt)}" width="1600" height="1000"${eager ? '' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}>`;

function home(t) {
  const path = t.base;
  const alt = T[t.other].base;
  const d = (i) => `d${Math.min(i, 8)}`;
  const tickerItems = t.ticker.map(([c, k, v]) => `<span><b class="${c}">${k}</b> · ${v}</span>`).join('');
  return `${head(t, { title: t.title, description: t.description, path, alt })}
<body>
${header(t, { page: 'home', alt })}
<main id="main">

<section class="hero" data-tension="0.18" aria-labelledby="hero-title">
  <canvas aria-hidden="true"></canvas>
  <div class="hero-inner">
    <p class="eyebrow">${t.hero.eyebrow}</p>
    <div class="wordmark" aria-hidden="true">
      <img src="/assets/brand/breach-wordmark-dark-bg.svg" alt="" width="1044" height="286">
      <img class="ghost" src="/assets/brand/breach-wordmark-dark-bg.svg" alt="" width="1044" height="286">
      <img class="ghost c" src="/assets/brand/breach-wordmark-dark-bg.svg" alt="" width="1044" height="286">
    </div>
    <h1 id="hero-title">${t.hero.h1}</h1>
    <p class="lede">${t.hero.lede}</p>
    <div class="actions">
      <a class="btn primary" href="${GAME}" ${play('hero')}>${t.hero.play} ${icon('arrow')}<span class="k">${t.hero.playK}</span></a>
      <a class="btn ghost" href="#films">${icon('play', 14)} ${t.hero.watch}</a>
    </div>
    <ul class="facts">${t.hero.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
    <p class="hero-term" aria-hidden="true"><span class="p">kestrel@lignerouge:~$ </span><span class="c" data-cmds="${esc(JSON.stringify(t.hero.cmds))}"></span><span class="caret"></span></p>
  </div>
  <a class="scroll-hint" href="#films">${t.hero.scroll}</a>
</section>

<div class="ticker" aria-hidden="true"><div class="ticker-track">${tickerItems}${tickerItems}</div></div>

<section class="section" id="films" data-tension="0.5" aria-labelledby="films-title">
  <div class="wrap">
    <p class="kicker red reveal" data-n="01">${t.films.kicker}</p>
    <h2 id="films-title" class="reveal">${t.films.h2}</h2>
    <p class="intro reveal">${t.films.intro}</p>
    <div class="cinema reveal">
      <div>
        <div class="screen glass red">
          <div class="win-head"><span class="dot"></span><span class="title">film</span></div>
          <canvas width="1280" height="720" role="img" aria-label="${esc(t.films.h2)}"></canvas>
          <button class="big-play" type="button"><span>${icon('play')} ${t.films.play}</span></button>
          <div class="controls">
            <button class="tool" type="button" data-play data-state="play" aria-label="${t.filmStrings['ui.play']}">${icon('play', 14)}${icon('pause', 14).replace('<svg', '<svg class="pause-i"')}</button>
            <div class="progress red" role="slider" tabindex="0" aria-label="${t.lang === 'en' ? 'Position in the film' : 'Position dans le film'}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar"><div class="fill"></div></div></div>
            <span class="time" aria-hidden="true">0:00 / 0:27</span>
          </div>
        </div>
        <p class="caption" aria-live="polite"></p>
      </div>
      <div>
        <ul class="reels">
          ${t.films.reels
            .map(
              ([id, c, title, sub, len], i) => `<li><button class="reel" type="button" data-c="${c}" data-film="${id}" aria-pressed="${i === 0}">
            <span class="n"><i>${title.split('·')[0].trim()}</i><span>${len}</span></span>
            <b>${title.split('·')[1].trim()}</b>
            <small>${sub}</small>
          </button></li>`,
            )
            .join('\n          ')}
        </ul>
        <p class="sound-note">${t.films.soundNote}</p>
      </div>
    </div>
  </div>
  <script type="application/json" id="film-strings">${JSON.stringify(t.filmStrings).replace(/</g, '\\u003c')}</script>
</section>

<section class="section" id="story" data-tension="0.25" aria-labelledby="story-title">
  <div class="wrap">
    <div class="split">
      <div>
        <p class="kicker violet reveal" data-n="02">${t.story.kicker}</p>
        <h2 id="story-title" class="reveal">${t.story.h2}</h2>
        ${t.story.p.map((p) => `<p class="reveal">${p}</p>`).join('\n        ')}
      </div>
      <div class="shot violet tilt reveal">${img(t.lang === 'en' ? 'nova-chat-en' : 'nova-chat-fr', t.story.shotAlt)}</div>
    </div>
    <h3 class="reveal" id="cast">${t.story.castTitle}</h3>
    <div class="cast">
      ${t.story.cast
        .map(
          ([ini, name, role, line, kind], i) => `<article class="who glass ${kind === 'ai' ? 'ai violet' : kind === 'red' ? 'red' : ''} reveal ${d(i)}">
        <div class="av" aria-hidden="true">${ini}</div>
        <p class="role">${kind === 'ai' ? '<b>◆ AI</b> · ' : ''}${role}</p>
        <h3>${name}</h3>
        <p>${line}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="missions" data-tension="0.45" aria-labelledby="missions-title">
  <div class="wrap">
    <p class="kicker red reveal" data-n="03">${t.missions.kicker}</p>
    <h2 id="missions-title" class="reveal">${t.missions.h2}</h2>
    <p class="intro reveal">${t.missions.intro}</p>
    <ol class="campaign">
      ${t.missions.list
        .map(
          ([n, title, sum, ref, kind, chip], i) => `<li class="mission ${kind} reveal ${d(i)}">
        <span class="num">${n}</span>
        <div><h3>${title}</h3><p>${sum}</p><p class="ref">${ref}</p></div>
        <span class="chip ${kind === 'ai' ? 'violet' : kind === 'def' ? 'cyan' : kind === 'web' ? 'red' : ''}">${kind === 'ai' ? '◆ ' : ''}${chip}</span>
      </li>`,
        )
        .join('\n      ')}
    </ol>
    <h3 class="more-title reveal">${t.missions.moreTitle}</h3>
    <p class="intro reveal">${t.missions.moreIntro}</p>
    <ol class="campaign more">
      ${t.missions.more
        .map(
          ([n, title, sum, ref, kind, chip], i) => `<li class="mission ${kind} reveal ${d(i)}">
        <span class="num">${n}</span>
        <div><h3>${title}</h3><p>${sum}</p><p class="ref">${ref}</p></div>
        <span class="chip ${kind === 'ai' ? 'violet' : kind === 'def' ? 'cyan' : kind === 'web' ? 'red' : ''}">${kind === 'ai' ? '◆ ' : ''}${chip}</span>
      </li>`,
        )
        .join('\n      ')}
    </ol>
  </div>
</section>

<section class="section" id="defend" data-tension="0.12" aria-labelledby="duel-title">
  <div class="wrap">
    <p class="kicker cyan reveal" data-n="04">${t.duel.kicker}</p>
    <h2 id="duel-title" class="reveal">${t.duel.h2}</h2>
    <p class="intro reveal">${t.duel.intro}</p>
    <div class="duel">
      ${[
        ['red', t.duel.red, 'flag', t.duel.redAlt],
        ['cyan', t.duel.cyan, t.lang === 'en' ? 'debrief-en' : 'debrief-fr', t.duel.cyanAlt],
      ]
        .map(
          ([c, [badge, title, items], pic, alt], i) => `<article class="side glass ${c} reveal ${d(i)}">
        <div class="win-head"><span class="dot"></span>${c === 'red' ? 'terminal — kestrel@lignerouge' : 'debrief — blue team'}</div>
        ${img(pic, alt)}
        <div class="body">
          <h3><span class="badge ${c}">${badge}</span> ${title}</h3>
          <ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="screens" data-tension="0.3" aria-labelledby="gallery-title">
  <div class="wrap">
    <p class="kicker violet reveal" data-n="05">${t.gallery.kicker}</p>
    <h2 id="gallery-title" class="reveal">${t.gallery.h2}</h2>
    <div class="gal-nav">
      <button class="tool" type="button" data-gal="-1" aria-label="${t.gallery.prev}">${icon('left')}</button>
      <button class="tool" type="button" data-gal="1" aria-label="${t.gallery.next}">${icon('right')}</button>
    </div>
    <div class="gallery" tabindex="0" aria-label="${t.gallery.kicker}">
      ${t.gallery.items
        .map(
          ([name, tag, cap]) => `<figure>
        <button type="button" data-full="${shot(name)}"><img src="${shot(name, 800)}" srcset="${shot(name, 800)} 800w, ${shot(name)} 1600w" sizes="(max-width: 640px) 88vw, 760px" alt="${esc(cap)}" width="800" height="500" loading="lazy" decoding="async"></button>
        <figcaption><span class="mono">${tag}</span><span>${cap}</span></figcaption>
      </figure>`,
        )
        .join('\n      ')}
    </div>
  </div>
  <dialog class="lightbox" aria-label="${t.gallery.kicker}">
    <div class="bar"><span class="cap"></span><button class="tool" type="button" data-close aria-label="${t.gallery.close}">${icon('close')}</button></div>
    <img src="${shot('title')}" alt="">
  </dialog>
</section>

<section class="section" id="levels" data-tension="0.3" aria-labelledby="levels-title">
  <div class="wrap">
    <p class="kicker green reveal" data-n="06">${t.levels.kicker}</p>
    <h2 id="levels-title" class="reveal">${t.levels.h2}</h2>
    <p class="intro reveal">${t.levels.intro}</p>
    <div class="levels">
      ${t.levels.list
        .map(
          ([mult, name, p, ada], i) => `<article class="level glass ${i === 1 ? 'featured' : ''} reveal ${d(i)}">
        <div class="mult">${mult}<small>score</small></div>
        <h3>${name}</h3>
        <p>${p}</p>
        <p class="ada"><span class="sr-only">Ada : </span>${ada === '—' ? '—' : `ada › ${ada}`}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
    <p class="score-line glass reveal"><b>${t.levels.score.replace('score', '<span class="g">score</span>').replace(/(− 10 × \S+|− 25 × \S+)/g, '<span class="a">$1</span>')}</b></p>
  </div>
</section>

<section class="section" id="safety" data-tension="0.1" aria-labelledby="safety-title">
  <div class="wrap">
    <p class="kicker green reveal" data-n="07">${t.safety.kicker}</p>
    <h2 id="safety-title" class="reveal">${t.safety.h2}</h2>
    <p class="intro reveal">${t.safety.intro}</p>
    <div class="safe-grid">
      ${t.safety.cards
        .map(
          ([big, label, p], i) => `<article class="safe glass reveal ${d(i)}">
        <div class="big">${big}</div>
        <h3>${label}</h3>
        <p>${p}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
    <div class="glass reveal">
      <div class="win-head"><span class="dot"></span>${t.safety.tableTitle}</div>
      <div class="table-scroll">
        <table class="req">
          <thead><tr>${t.safety.th.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
          <tbody>${t.safety.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<section class="section" id="byok" data-tension="0.35" aria-labelledby="byok-title">
  <div class="wrap split">
    <div class="shot violet tilt reveal">${img(`settings-key-${t.lang}`, t.byok.alt)}</div>
    <div>
      <p class="kicker violet reveal" data-n="08">${t.byok.kicker}</p>
      <h2 id="byok-title" class="reveal">${t.byok.h2}</h2>
      <p class="reveal">${t.byok.p}</p>
    </div>
  </div>
</section>

<section class="section" id="community" data-tension="0.3" aria-labelledby="community-title">
  <div class="wrap">
    <p class="kicker green reveal" data-n="09">${t.community.kicker}</p>
    <h2 id="community-title" class="reveal">${t.community.h2}</h2>
    <p class="intro reveal">${t.community.intro}</p>
    <div class="split">
      <ol class="steps">
        ${t.community.steps.map(([b, s], i) => `<li class="reveal ${d(i)}"><div><b>${b}</b><span>${s}</span></div></li>`).join('\n        ')}
      </ol>
      <div class="glass reveal">
        <div class="win-head"><span class="dot"></span>packs/jdoe.lost-backup/pack.yaml</div>
<pre class="code"><span class="k">id</span>: <span class="s">jdoe.lost-backup</span>
<span class="k">version</span>: <span class="s">1.0.0</span>
<span class="k">engine</span>: <span class="s">"&gt;=0.2 &lt;1"</span>
<span class="k">kind</span>: mission
<span class="k">requires</span>: [jdoe.bakery-world]
<span class="k">title</span>:
  <span class="k">en</span>: <span class="s">The lost backup</span>
  <span class="k">fr</span>: <span class="s">La sauvegarde perdue</span>
<span class="k">authors</span>: [Jane Doe]
<span class="c"># data only, never code</span>
<span class="g">✓ schema  ✓ safety  ✓ solution (en, fr)</span></pre>
      </div>
    </div>
    <div class="actions reveal">
      <a class="btn primary" href="https://github.com/breach-game/packs/blob/main/CONTRIBUTING.md">${t.community.guide} ${icon('arrow')}</a>
      <a class="btn ghost" href="https://github.com/breach-game/packs">${icon('gh')} ${t.community.repo}</a>
    </div>
  </div>
</section>

<section class="section" id="open-source" data-tension="0.2" aria-labelledby="oss-title">
  <div class="wrap">
    <p class="kicker cyan reveal" data-n="10">${t.oss.kicker}</p>
    <h2 id="oss-title" class="reveal">${t.oss.h2}</h2>
    <p class="intro reveal">${t.oss.intro}</p>
    <div class="repos">
      ${t.oss.repos
        .map(
          ([name, p, href], i) => `<a class="repo glass reveal ${d(i)}" href="${href}">
        <span class="name">${name}</span>
        <p>${p}</p>
        <span class="go">${t.oss.open} →</span>
      </a>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="final" data-tension="0.6" aria-labelledby="final-title">
  <h2 id="final-title" class="reveal">${t.final.h2}</h2>
  <p class="reveal">${t.final.p}</p>
  <div class="actions reveal">
    <a class="btn primary" href="${GAME}" ${play('final')}>${t.final.play} ${icon('arrow')}</a>
    <a class="btn ghost" href="${t.base}docs/">${t.final.docs}</a>
  </div>
</section>

</main>
${footer(t)}
</body>
</html>
`;
}

function docs(t) {
  const path = `${t.base}docs/`;
  const alt = `${T[t.other].base}docs/`;
  const sections = DOCS[t.lang];
  const cmdTable = `<table class="cmds"><tbody>${t.docs.commands
    .map(([group, rows]) => `<tr class="group"><td colspan="2">${group}</td></tr>${rows.map(([c, d]) => `<tr><td>${esc(c)}</td><td>${d}</td></tr>`).join('')}`)
    .join('')}</tbody></table>`;
  return `${head(t, { title: t.docs.title, description: t.docs.description, path, alt })}
<body>
${header(t, { page: 'docs', alt })}
<main id="main">
<div class="doc-hero">
  <div class="wrap">
    <p class="kicker cyan">BREACH · docs</p>
    <h1>${t.docs.h1}</h1>
    <p>${t.docs.lede}</p>
  </div>
</div>
<div class="doc">
  <nav class="toc" aria-label="${t.docs.toc}">
    <p>${t.docs.toc}</p>
    <ol>${sections.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ol>
  </nav>
  <div class="prose">
    ${sections.map((s) => `<section id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${s.title}</h2>${s.body}${s.commands ? cmdTable : ''}</section>`).join('\n    ')}
  </div>
</div>
</main>
${footer(t)}
</body>
</html>
`;
}

function notFound() {
  const t = T.en;
  return `${head(t, { title: t.notFound.title, description: t.description, path: '/404.html', alt: '/fr/' })}
<body>
${header(t, { page: '404', alt: '/fr/' })}
<main id="main">
<section class="final" aria-labelledby="nf-title">
  <p class="kicker amber" data-n="404">nmap: 0 hosts up</p>
  <h2 id="nf-title">${t.notFound.h1}</h2>
  <p>${t.notFound.p}<br><span lang="fr">${T.fr.notFound.p}</span></p>
  <div class="actions">
    <a class="btn primary" href="/">${t.notFound.back}</a>
    <a class="btn ghost" href="/fr/" lang="fr">${T.fr.notFound.back}</a>
  </div>
</section>
</main>
${footer(t)}
</body>
</html>
`;
}

function out(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log('wrote', rel);
}

for (const lang of ['en', 'fr']) {
  const t = T[lang];
  const base = lang === 'en' ? '' : 'fr/';
  out(`${base}index.html`, home(t));
  out(`${base}docs/index.html`, docs(t));
}
out('404.html', notFound());
out(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/fr/', '/docs/', '/fr/docs/'].map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}
</urlset>
`,
);
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
