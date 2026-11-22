/** Page behaviour: header, sound, reveals, hero, films, gallery, docs table of contents. */
import * as music from './music.js';

const root = document.documentElement;
root.classList.remove('no-js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* Header turns to glass once the page scrolls. */
const top = document.querySelector('.top');
const onScroll = () => top?.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Mobile menu. */
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav?.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }
});

/* Sound: generated music, off until asked for. The choice is remembered for the next visit,
   but browsers still need a click before any sound, so it only re-arms the button. */
const soundBtn = document.querySelector('[data-sound]');
if (soundBtn) {
  const bars = [...soundBtn.querySelectorAll('.eq i')];
  const label = soundBtn.querySelector('.lbl');
  const update = (on) => {
    soundBtn.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? soundBtn.dataset.on : soundBtn.dataset.off;
  };
  soundBtn.addEventListener('click', async () => {
    await music.setOn(!music.isOn());
    try {
      localStorage.setItem('breach-site-sound', music.isOn() ? '1' : '0');
    } catch {}
  });
  music.onChange(update);
  const eq = () => {
    const lv = music.levels(bars.length);
    bars.forEach((b, i) => {
      b.style.height = `${4 + Math.round(lv[i] * 12)}px`;
    });
    requestAnimationFrame(eq);
  };
  if (!reduce.matches) requestAnimationFrame(eq);
}

/* Each section sets the music's tension as it comes into view. */
const tensionObs = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) music.setTension(Number(e.target.dataset.tension));
  },
  { threshold: 0.35 },
);
for (const s of document.querySelectorAll('[data-tension]')) tensionObs.observe(s);

/* Reveal on scroll. */
const revealObs = new IntersectionObserver(
  (entries) => {
    for (const e of entries)
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
);
for (const el of document.querySelectorAll('.reveal')) revealObs.observe(el);

/* Hero network and films load only where they exist. */
const heroCanvas = document.querySelector('.hero canvas');
if (heroCanvas) import('./hero.js').then((m) => m.startHero(heroCanvas));
const cinema = document.querySelector('.cinema');
if (cinema) import('./films.js').then((m) => m.startFilms(cinema));

/* The wordmark glitches once on load and when hovered: an event, never a permanent effect. */
const mark = document.querySelector('.wordmark');
if (mark && !reduce.matches) {
  const fire = () => {
    mark.classList.remove('glitch');
    void mark.offsetWidth;
    mark.classList.add('glitch');
  };
  setTimeout(fire, 900);
  mark.addEventListener('pointerenter', fire);
}

/* The hero's command line types a few real game commands in a loop. */
const term = document.querySelector('.hero-term .c');
if (term) {
  const cmds = JSON.parse(term.dataset.cmds);
  if (reduce.matches) term.textContent = cmds[0];
  else {
    let i = 0;
    const run = async () => {
      const s = cmds[i % cmds.length];
      for (let k = 0; k <= s.length; k++) {
        term.textContent = s.slice(0, k);
        await new Promise((r) => setTimeout(r, 45 + Math.random() * 60));
      }
      await new Promise((r) => setTimeout(r, 2200));
      for (let k = s.length; k >= 0; k--) {
        term.textContent = s.slice(0, k);
        await new Promise((r) => setTimeout(r, 14));
      }
      i++;
      setTimeout(run, 400);
    };
    setTimeout(run, 1200);
  }
}

/* Gallery: arrows scroll the strip, a click opens the picture in a dialog. */
const gallery = document.querySelector('.gallery');
if (gallery) {
  for (const b of document.querySelectorAll('[data-gal]')) {
    b.addEventListener('click', () => {
      const dir = Number(b.dataset.gal);
      gallery.scrollBy({ left: dir * gallery.clientWidth * 0.8, behavior: reduce.matches ? 'auto' : 'smooth' });
    });
  }
  const dlg = document.querySelector('dialog.lightbox');
  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('.cap');
  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-full]');
    if (!btn) return;
    img.src = btn.dataset.full;
    img.alt = btn.querySelector('img').alt;
    cap.textContent = btn.closest('figure').querySelector('figcaption span:last-child').textContent;
    dlg.showModal();
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  });
}

/* Docs: highlight the section being read. */
const toc = document.querySelector('.toc');
if (toc) {
  const links = new Map([...toc.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          for (const a of links.values()) a.classList.remove('active');
          links.get(e.target.id)?.classList.add('active');
        }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );
  for (const id of links.keys()) {
    const s = document.getElementById(id);
    if (s) obs.observe(s);
  }
}
