// The deck: scaling, keys, the footer, icons, the speaker view and the overview. No libraries.
// URL modes: index.html#3 (slide 3) · ?speaker (speaker view) · ?embed (one slide, no keys; used by the speaker view).
(() => {
  const params = new URLSearchParams(location.search);
  const mode = params.has('speaker') ? 'speaker' : params.has('embed') ? 'embed' : 'deck';
  const deck = document.querySelector('.deck');
  const slides = [...document.querySelectorAll('.slide')];
  const total = slides.length;
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('openmoca-deck') : null;

  // Icons and the footer
  for (const el of document.querySelectorAll('[data-i]')) el.insertAdjacentHTML('afterbegin', window.ICONS[el.dataset.i] ?? '');
  slides.forEach((s, i) => {
    if (s.classList.contains('title-slide')) return;
    const dark = s.classList.contains('dark');
    // The footer's openmoca.org goes back to the site's home page (relative, so it works on a local preview too).
    s.insertAdjacentHTML('beforeend', `<div class="footer"><a class="home" href="../../" target="_top">` +
      `<img src="assets/openmoca-icon-${dark ? 'cream' : 'ink'}.svg" alt=""><span>openmoca.org</span></a>` +
      `<span class="num">${i + 1}</span></div>`);
  });

  const fit = () => deck.style.setProperty('--scale', Math.min(innerWidth / 1920, innerHeight / 1080));
  addEventListener('resize', fit);
  fit();

  let current = 0;
  const pageTitle = document.title;
  // A heading's text, or its image's alt text when the heading is a logo (slide 5).
  const headingOf = (s) => { const h = s.querySelector('h1'); return (h?.textContent.trim() || h?.querySelector('img')?.alt || '').replace(/\s+/g, ' '); };
  const fromHash = () => Math.min(Math.max(parseInt(location.hash.slice(1), 10) || 1, 1), total) - 1;
  function show(n, { broadcast = true } = {}) {
    current = Math.min(Math.max(n, 0), total - 1);
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    if (location.hash !== '#' + (current + 1)) history.replaceState(null, '', '#' + (current + 1));
    // Slide 1 keeps the page's own title (search engines read it); later slides show their number and heading in the tab.
    document.title = current === 0 ? pageTitle : `${current + 1}. ${headingOf(slides[current])} · Introduction to OpenMOCA`;
    if (broadcast && channel) channel.postMessage({ slide: current });
    if (mode === 'speaker') speaker.update();
  }
  addEventListener('hashchange', () => show(fromHash(), { broadcast: false }));
  channel?.addEventListener('message', (e) => { if (mode !== 'embed' && e.data.slide !== current) show(e.data.slide, { broadcast: false }); });

  if (mode !== 'embed') {
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n'].includes(k)) show(current + 1);
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p'].includes(k)) show(current - 1);
      else if (k === 'Home') show(0);
      else if (k === 'End') show(total - 1);
      else if (k === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      else if (k === 's') open(location.pathname + '?speaker#' + (current + 1), 'openmoca-speaker', 'width=1400,height=850');
      else if (k === 'o') document.body.classList.toggle('overview');
      else if (k === 'g') { const n = parseInt(prompt(`Go to slide (1–${total})`), 10); if (n) show(n - 1); }
      else return;
      e.preventDefault();
    });
    // Click a slide in the overview to go to it. Otherwise a click or tap moves on: the left third goes back.
    deck.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      if (!document.body.classList.contains('overview')) { show(current + (e.clientX < innerWidth / 3 ? -1 : 1)); return; }
      const s = e.target.closest('.slide');
      if (s) { document.body.classList.remove('overview'); show(slides.indexOf(s)); }
    });
  }

  // ---- Speaker view: this slide, the next one, the notes and a timer ----
  const speaker = { update() {} };
  if (mode === 'speaker') {
    document.body.classList.add('speaker');
    const style = document.createElement('style');
    style.textContent = `
      body.speaker { background: #151210; color: #F3ECE4; font-family: var(--sans); overflow: hidden; }
      body.speaker .deck { display: none; }
      .sv { position: fixed; inset: 0; display: grid; grid-template-columns: 62% 1fr; grid-template-rows: auto 1fr; gap: 20px; padding: 20px; }
      .sv iframe { width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px; background: #000; }
      .sv .next { opacity: 0.85; }
      .sv .label { font-size: 14px; color: #A39A92; margin: 6px 0 14px; letter-spacing: 0.05em; text-transform: uppercase; }
      .sv .notes-text { grid-column: 1 / -1; font-size: 26px; line-height: 1.5; overflow: auto; max-width: 1300px; }
      .sv .clock { font: 600 40px var(--mono); color: #F2C36B; }
      .sv .clock small { display: block; font-size: 16px; color: #A39A92; font-family: var(--sans); font-weight: 400; margin-top: 6px; }
      .sv button { background: #3A332E; color: #F3ECE4; border: 0; border-radius: 6px; padding: 6px 12px; font: inherit; font-size: 14px; cursor: pointer; }`;
    document.head.append(style);
    document.body.insertAdjacentHTML('beforeend', `<div class="sv">
      <div><iframe class="cur" title="This slide"></iframe><p class="label cur-label"></p></div>
      <div><iframe class="next" title="Next slide"></iframe><p class="label">Next</p>
        <div class="clock"><span class="elapsed">0:00</span><small>elapsed · <span class="time"></span> · <button class="reset">Reset</button></small></div></div>
      <div class="notes-text"></div></div>`);
    const $ = (q) => document.querySelector(q);
    let start = Date.now();
    $('.reset').onclick = () => { start = Date.now(); };
    setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      $('.elapsed').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      $('.time').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }, 500);
    const base = location.pathname + '?embed#';
    speaker.update = () => {
      $('.cur').src = base + (current + 1);
      $('.next').src = base + Math.min(current + 2, total);
      $('.next').style.visibility = current + 1 < total ? 'visible' : 'hidden';
      $('.cur-label').textContent = `Slide ${current + 1} of ${total} · ${slides[current].dataset.section ?? ''}`;
      $('.notes-text').textContent = slides[current].querySelector('.notes')?.textContent ?? '';
    };
  }

  show(fromHash(), { broadcast: mode === 'speaker' });
})();
