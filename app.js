/* ============================================================
   shawheen.ai — interactions
   ============================================================ */
(function () {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- nav active state + bg ---------- */
  const nav = $('.nav');
  const navLinks = $$('.nav-links a').filter(a => (a.getAttribute('href') || '').startsWith('#'));
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    nav.style.borderColor = window.scrollY > 20 ? 'rgba(39,224,163,0.18)' : '';
    let cur = sections[0];
    const y = window.scrollY + 120;
    sections.forEach(s => { if (s && s.offsetTop <= y) cur = s; });
    navLinks.forEach(a => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- role typer ---------- */
  const roles = ['Senior Security Engineer', 'Multi-Cloud Architect', 'Detection Engineer', 'AI Security Engineer', 'Incident Commander'];
  const typedEl = $('#typed');
  if (typedEl && !reduce) {
    let ri = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = roles[ri];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) { ci++; setTimeout(tick, 55 + Math.random() * 40); }
      else if (!deleting && ci === word.length) { deleting = true; setTimeout(tick, 1500); }
      else if (deleting && ci > 0) { ci--; setTimeout(tick, 28); }
      else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 320); }
    };
    tick();
  } else if (typedEl) { typedEl.textContent = roles[0]; }

  /* ---------- counters ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.indexOf('.') > -1) ? 1 : 0;
    const dur = 1400; const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (dec ? target.toFixed(dec) : target).toLocaleString();
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => reduce ? (el.textContent = (+el.dataset.count).toLocaleString()) : cio.observe(el));

  /* ---------- interactive terminal ---------- */
  const body = $('#term-body');
  const input = $('#term-input');
  if (!body || !input) return;

  const FILES = ['about.md', 'experience.json', 'skills.txt', 'certifications/', 'resume.pdf', 'blog.url', 'contact.sh'];
  const print = (html, cls) => {
    const d = document.createElement('div');
    d.className = 't-row' + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    body.insertBefore(d, body.querySelector('.t-live'));
    body.scrollTop = body.scrollHeight;
  };
  const echo = (cmd) => print(`<span class="t-prompt">shawheen@ai</span><span class="t-out">:</span><span class="t-path">~</span><span class="t-out">$</span> <span class="t-cmd">${cmd}</span>`);

  const scrollTo = (id) => { const el = $(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };

  const COMMANDS = {
    help: () => print(
      `<span class="t-out">available commands:</span>\n` +
      `  <span class="t-key">about</span>       whoami / background\n` +
      `  <span class="t-key">experience</span>  professional record\n` +
      `  <span class="t-key">skills</span>      technical stack\n` +
      `  <span class="t-key">certs</span>       certifications\n` +
      `  <span class="t-key">resume</span>      download CV (pdf)\n` +
      `  <span class="t-key">blog</span>        open the newsletter\n` +
      `  <span class="t-key">contact</span>     get in touch\n` +
      `  <span class="t-key">clear</span>       reset terminal`),
    ls: () => print(FILES.map(f => `<span class="${f.endsWith('/') ? 't-path' : 't-out'}">${f}</span>`).join('   ')),
    whoami: () => { print(`<span class="t-key">Shawheen Azimi</span> <span class="t-out">— Senior Security Architect, Engineer & Analyst</span>`); scrollTo('#about'); },
    about: () => { print(`<span class="t-out">opening</span> <span class="t-path">about.md</span> <span class="t-out">…</span>`); scrollTo('#about'); },
    experience: () => { print(`<span class="t-out">querying</span> <span class="t-path">experience.json</span> <span class="t-out">…</span>`); scrollTo('#experience'); },
    exp: () => COMMANDS.experience(),
    skills: () => { print(`<span class="t-out">loading</span> <span class="t-path">skills.txt</span> <span class="t-out">…</span>`); scrollTo('#skills'); },
    certs: () => { print(`<span class="t-out">enumerating</span> <span class="t-path">certifications/</span> <span class="t-out">…</span>`); scrollTo('#certs'); },
    certifications: () => COMMANDS.certs(),
    contact: () => { print(`<span class="t-out">init</span> <span class="t-path">contact.sh</span> <span class="t-out">…</span>`); scrollTo('#contact'); },
    resume: () => { print(`<span class="t-key">↓</span> <span class="t-out">downloading</span> Shawheen_Azimi_Resume.pdf`); const a = document.createElement('a'); a.href = 'Shawheen Azimi - Resume.pdf'; a.download = 'Shawheen Azimi - Resume.pdf'; a.click(); },
    blog: () => { print(`<span class="t-out">opening</span> <span class="t-path">shavvheens-newsletter.beehiiv.com</span> <span class="t-out">…</span>`); window.open('https://shavvheens-newsletter.beehiiv.com/', '_blank', 'noopener'); },
    clearance: () => print(`<span class="t-out">Department of War cleared.</span>`),
    sudo: () => print(`<span class="t-warn">shawheen is not in the sudoers file. This incident will be reported.</span> 🛡️`),
    hire: () => { print(`<span class="t-key">smart move.</span> <span class="t-out">routing to contact …</span>`); scrollTo('#contact'); },
    clear: () => { $$('.t-row:not(.boot)', body).forEach(n => { if (!n.classList.contains('t-live')) n.remove(); }); },
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    echo(raw.trim());
    const fn = COMMANDS[cmd] || COMMANDS[cmd.split(' ')[0]];
    if (fn) fn();
    else print(`<span class="t-out">command not found:</span> <span class="t-warn">${raw.trim()}</span> <span class="t-out">— try</span> <span class="t-key">help</span>`);
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
  });
  // focus input when clicking the terminal body
  body.addEventListener('click', () => input.focus());

  /* ---------- boot sequence ---------- */
  const boot = [
    { h: `<span class="t-out">// initializing secure session …</span>`, d: 200 },
    { h: `<span class="t-prompt">shawheen@ai</span><span class="t-out">:</span><span class="t-path">~</span><span class="t-out">$</span> <span class="t-cmd">whoami</span>`, d: 500 },
    { h: `<span class="t-key">Shawheen Azimi</span>`, d: 300 },
    { h: `<span class="t-out">Senior Security Architect · Engineer · Analyst</span>`, d: 250 },
    { h: `<span class="t-out">type</span> <span class="t-key">help</span> <span class="t-out">to explore ↓</span>`, d: 200 },
  ];
  let bi = 0;
  const runBoot = () => {
    if (bi >= boot.length) return;
    const line = boot[bi++];
    const d = document.createElement('div');
    d.className = 't-row boot';
    d.innerHTML = line.h;
    body.insertBefore(d, body.querySelector('.t-live'));
    body.scrollTop = body.scrollHeight;
    setTimeout(runBoot, reduce ? 0 : line.d);
  };
  runBoot();
})();
