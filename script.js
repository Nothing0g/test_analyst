document.addEventListener('DOMContentLoaded', () => {

  let persona = 'da';

  /* ==========================================================
     THEME (light/dark, persisted)
  ========================================================== */
  const root = document.documentElement;
  const sunIcon = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  const moonIcon = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  let theme = 'light';
  try { theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) {}

  function applyTheme(t) {
    theme = t;
    root.setAttribute('data-theme', t);
    const icon = t === 'dark' ? sunIcon : moonIcon;
    document.getElementById('themeIcon').innerHTML = icon;
    document.getElementById('dockThemeIcon').innerHTML = icon;
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  applyTheme(theme);
  function toggleTheme() { applyTheme(theme === 'dark' ? 'light' : 'dark'); }
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('dockThemeBtn').addEventListener('click', toggleTheme);

  /* ==========================================================
     TOAST
  ========================================================== */
  const toastWrap = document.getElementById('toastWrap');
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${msg}</span>`;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2200);
  }

  /* ==========================================================
     COPY TO CLIPBOARD
  ========================================================== */
  function copyText(text, label) {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else { fallback(); }
    showToast(label || 'Copied to clipboard');
  }
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', () => copyText(el.getAttribute('data-copy'), 'Copied ' + el.getAttribute('data-copy')));
  });

  /* ==========================================================
     SCROLL PROGRESS + BACK TO TOP
  ========================================================== */
  const progressBar = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  function onScroll() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    progressBar.style.width = pct + '%';
    backToTop.classList.toggle('visible', scrolled > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ==========================================================
     CASE FILE DATA — merged from both resume framings
  ========================================================== */
  const CASES = [
    {
      id: '001',
      date: "Jun — Jul '26",
      da: {
        title: 'Ride Failure Root-Cause Analysis',
        summary: 'Time-series EDA across 150K NCR ride bookings surfaced demand swings from 1,321 to 12,397 rides by hour, while day-of-week and geography showed no meaningful effect.',
        finding: 'Rate-normalized SQL queries — not raw counts — exposed a flat ~25% booking failure rate across every hour. Segmenting by zone isolated a structural matching gap, not a peak-hour supply shortage.',
        stat: '9.4×', statLabel: 'peak-to-trough demand swing',
        tags: ['Python', 'Pandas', 'SQL', 'Segmentation'],
        modalDesc: 'Analyzed 150,000 NCR ride records to understand why failure rates stayed flat throughout the day. Rather than treating this as a peak-hour capacity problem, segmenting by demand zone revealed a structural matching gap invisible in the aggregate metrics.',
        highlight: 'Key finding: the ~25% failure rate was constant across all hours — the fix isn\'t more supply at peak times, it\'s better zone-level matching logic.'
      },
      ba: {
        title: "Why Ride Failures Weren't a Peak-Hour Problem",
        summary: 'Leadership assumed failed rides tracked with rush-hour demand and were weighing added fleet capacity. The data, across 150K bookings, said otherwise.',
        finding: 'The booking failure rate held flat at ~25% all day, every day — reframing the fix from "add supply at peak" to "fix the structural matching gap between zones."',
        stat: '9.4×', statLabel: 'demand swing leadership assumed drove failures',
        tags: ['Stakeholder Framing', 'Root-Cause Analysis', 'Operations'],
        modalDesc: 'Leadership had assumed failed rides tracked with rush-hour demand and were considering added fleet capacity to fix it. Analysis of 150,000 NCR ride records told a different story: the failure rate stayed flat at ~25% all day.',
        highlight: 'Recommendation: don\'t add peak-hour capacity — rebalance zone-level matching instead. The problem was structural, not a supply shortage.'
      },
      chart: 'demand', status: 'Closed'
    },
    {
      id: '002',
      date: "Jun '26",
      da: {
        title: 'HR Attrition Prediction Model',
        summary: 'EDA and predictive modeling across 1,470 employee records isolated overtime as the strongest attrition driver — 31% vs. 10% for non-overtime staff.',
        finding: 'Chose logistic regression over random forest for higher recall on at-risk employees (56% vs. 21%) — prioritizing catching real risk over raw accuracy.',
        stat: '3.1×', statLabel: 'attrition rate, overtime vs. not',
        tags: ['Python', 'scikit-learn', 'Logistic Regression'],
        modalDesc: 'Built and compared Logistic Regression and Random Forest classifiers on 1,470 employee records. Prioritized recall over raw accuracy since the cost of missing a departing employee outweighs a false positive.',
        highlight: 'Key finding: employees working overtime attrite at ~3x the rate of those who don\'t — a clear, actionable retention lever.'
      },
      ba: {
        title: 'Finding a Retention Lever HR Could Actually Use',
        summary: 'Rather than a generic attrition dashboard, the goal was one actionable insight HR could actually implement — not a wall of correlations.',
        finding: 'Overtime workers leave at nearly 3x the rate of others. Recommended capping overtime and redistributing workload over broad, resource-heavy retention programs.',
        stat: '3.1×', statLabel: 'attrition rate, overtime vs. not',
        tags: ['Decision Framing', 'People Strategy', 'Retention'],
        modalDesc: 'Rather than delivering a broad attrition dashboard nobody would act on, the goal was to surface one clear, defensible lever HR leadership could actually implement.',
        highlight: 'Recommendation: review overtime policy before broader retention spend — the lever is specific, not a program.'
      },
      chart: 'attrition', status: 'Closed'
    },
    {
      id: '003',
      date: "Jun — Jul '24",
      da: {
        title: 'User Behavior Analytics — CultFit',
        summary: 'Surveyed ~200 college students and isolated "lack of motivation" as the core driver behind Gen Z fitness drop-off using structured survey analysis.',
        finding: 'Independently designed and shipped an MVP on Thunkable around a single lever — competition — with leaderboards and milestone rewards.',
        stat: '1 of 1', statLabel: 'insight the MVP was built around',
        tags: ['Survey Research', 'Product', 'Thunkable'],
        modalDesc: 'Surveyed ~200 college students to find the real driver behind Gen Z fitness app drop-off — not price, not access, but motivation.',
        highlight: 'Presented at a Dell Aspire event; recognized for solving one problem well over spreading thin across many.'
      },
      ba: {
        title: 'The One Insight Behind a Fitness App MVP',
        summary: 'Instead of guessing at feature requests, ~200 student surveys isolated the single behavioral lever worth building a product around.',
        finding: 'Built and shipped an MVP scoped entirely around one insight — competition — resisting the urge to add unrelated features.',
        stat: '1 of 1', statLabel: 'insight the MVP was built around',
        tags: ['Product Framing', 'Research', 'Prioritization'],
        modalDesc: 'Rather than building a broad feature set, the goal was to find and validate one behavioral driver worth designing an entire MVP around.',
        highlight: 'Lesson reinforced by industry feedback at a Dell Aspire event: solve one problem exceptionally well, not several adequately.'
      },
      chart: null, status: 'Closed'
    }
  ];

  /* ==========================================================
     RENDER CASE CARDS
  ========================================================== */
  const caseList = document.getElementById('caseList');
  CASES.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'case-card reveal';
    card.dataset.caseIndex = i;

    let visual = '';
    if (c.chart === 'demand') {
      visual = `<svg class="case-line" viewBox="0 0 200 90" preserveAspectRatio="none">
        <polyline points="0,70 20,60 40,68 60,45 80,50 100,30 120,38 140,20 160,28 180,15 200,22" fill="none" stroke="var(--fg)" stroke-width="2"/>
      </svg>`;
    } else if (c.chart === 'attrition') {
      visual = `<div class="case-bars">
        <span style="height:32%"></span><span style="height:100%" class="hi"></span>
        <span style="height:40%"></span><span style="height:38%"></span>
        <span style="height:35%"></span><span style="height:95%" class="hi"></span>
      </div>`;
    } else {
      visual = `<div class="case-bars">
        <span style="height:50%"></span><span style="height:80%" class="hi"></span>
        <span style="height:35%"></span><span style="height:65%"></span>
        <span style="height:90%" class="hi"></span><span style="height:45%"></span>
      </div>`;
    }

    card.innerHTML = `
      <div class="case-top">
        <div>
          <div class="case-id mono">CASE NO. ${c.id} · ${c.date}</div>
          <div class="case-title" data-field="title">${c[persona].title}</div>
        </div>
        <div class="case-status"><span class="dt"></span>${c.status}</div>
      </div>
      <div class="case-body">
        <div class="case-text">
          <p class="case-summary" data-field="summary">${c[persona].summary}</p>
          <p class="case-summary" data-field="finding" style="color:var(--fg)">${c[persona].finding}</p>
          <div class="case-tags" data-field="tags">${c[persona].tags.map(t => `<span class="case-tag">${t}</span>`).join('')}</div>
          <span class="case-view-link">View case study
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </div>
        <div>
          <div class="case-stat" data-field="stat">${c[persona].stat}</div>
          <div class="case-stat-label" data-field="statLabel">${c[persona].statLabel}</div>
          <div class="case-visual" style="margin-top:14px;">${visual}</div>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openModal(i));
    caseList.appendChild(card);
  });

  /* ==========================================================
     MODAL
  ========================================================== */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalId = document.getElementById('modalId');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalHighlight = document.getElementById('modalHighlight');
  const modalTags = document.getElementById('modalTags');

  function openModal(i) {
    const c = CASES[i];
    const p = c[persona];
    modalId.textContent = `CASE NO. ${c.id} · ${c.date}`;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.modalDesc;
    modalHighlight.textContent = p.highlight;
    modalTags.innerHTML = p.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  /* ==========================================================
     SCROLL REVEAL
  ========================================================== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ==========================================================
     TERMINAL TYPING
  ========================================================== */
  const TERMINAL_LINES = {
    da: [
      { p: '~ $', t: 'who_am_i' },
      { p: '→', t: 'Data Analyst · Mechanical Eng. background' },
      { p: '~ $', t: 'stack' },
      { p: '→', t: 'Python · SQL · Power BI · Statistics & ML' },
      { p: '~ $', t: 'currently' },
      { p: '→', t: 'Open to DA / BA roles' }
    ],
    ba: [
      { p: '~ $', t: 'who_am_i' },
      { p: '→', t: 'Business Analyst · Mechanical Eng. background' },
      { p: '~ $', t: 'focus' },
      { p: '→', t: 'Case frameworks, stakeholder alignment, decisions' },
      { p: '~ $', t: 'currently' },
      { p: '→', t: 'Open to BA / DA roles' }
    ]
  };
  const terminalBody = document.getElementById('terminalBody');
  let terminalTimeouts = [];
  function runTerminal(mode) {
    terminalTimeouts.forEach(clearTimeout);
    terminalTimeouts = [];
    terminalBody.innerHTML = '';
    const lines = TERMINAL_LINES[mode];
    let li = 0;
    function typeLine() {
      if (li >= lines.length) return;
      const { p, t } = lines[li];
      const row = document.createElement('div');
      const prompt = document.createElement('span');
      prompt.className = 'tp';
      prompt.textContent = p + ' ';
      const text = document.createElement('span');
      row.appendChild(prompt);
      row.appendChild(text);
      terminalBody.appendChild(row);
      let ci = 0;
      function typeChar() {
        if (ci < t.length) {
          text.textContent += t[ci];
          ci++;
          terminalTimeouts.push(setTimeout(typeChar, 16));
        } else {
          li++;
          terminalTimeouts.push(setTimeout(typeLine, 240));
        }
      }
      typeChar();
    }
    typeLine();
  }
  const termIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { runTerminal(persona); termIO.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  termIO.observe(terminalBody);

  /* ==========================================================
     SPOTLIGHT CURSOR-REVEAL MASK
  ========================================================== */
  const spotlightPanel = document.getElementById('spotlightPanel');
  const spotlightReveal = document.getElementById('spotlightReveal');
  const spotlightCursor = document.getElementById('spotlightCursor');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (spotlightPanel && !reduced) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const RADIUS = 95;
    function resize() { canvas.width = spotlightPanel.clientWidth; canvas.height = spotlightPanel.clientHeight; }
    resize();
    window.addEventListener('resize', resize);

    let mx = -999, my = -999, sx = -999, sy = -999, inside = false;
    spotlightPanel.addEventListener('mousemove', (e) => {
      const r = spotlightPanel.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; inside = true;
      spotlightCursor.style.opacity = '1';
      spotlightCursor.style.left = e.clientX + 'px';
      spotlightCursor.style.top = e.clientY + 'px';
    });
    spotlightPanel.addEventListener('mouseleave', () => { inside = false; spotlightCursor.style.opacity = '0'; });

    function loop() {
      sx += (mx - sx) * 0.14;
      sy += (my - sy) * 0.14;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (inside || Math.abs(sx - mx) > 1) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, RADIUS);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.45, 'rgba(255,255,255,1)');
        g.addColorStop(0.68, 'rgba(255,255,255,0.6)');
        g.addColorStop(0.85, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, RADIUS, 0, Math.PI * 2); ctx.fill();
      }
      const url = canvas.toDataURL();
      spotlightReveal.style.maskImage = `url(${url})`;
      spotlightReveal.style.webkitMaskImage = `url(${url})`;
      spotlightReveal.style.maskSize = '100% 100%';
      spotlightReveal.style.webkitMaskSize = '100% 100%';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function setSpotlightMode(mode) {
    document.querySelector('.reveal-da').style.display = mode === 'da' ? 'flex' : 'none';
    document.querySelector('.reveal-ba').style.display = mode === 'ba' ? 'flex' : 'none';
  }

  /* ==========================================================
     PERSONA TOGGLE — swaps text in place with a wash transition
  ========================================================== */
  const washOverlay = document.getElementById('washOverlay');
  const swapEls = document.querySelectorAll('.swap-text');
  const roleSwapEl = document.querySelector('.role-swap');

  function applySwapText(mode) {
    swapEls.forEach(el => {
      const val = el.getAttribute(mode === 'da' ? 'data-da' : 'data-ba');
      if (val !== null) el.textContent = val;
    });
    if (roleSwapEl) roleSwapEl.textContent = mode === 'da' ? 'Data Analyst' : 'Business Analyst';
    setSpotlightMode(mode);
    document.querySelectorAll('.case-card').forEach(card => {
      const i = card.dataset.caseIndex;
      const c = CASES[i][mode];
      card.querySelector('[data-field="title"]').textContent = c.title;
      const summaries = card.querySelectorAll('[data-field="summary"], [data-field="finding"]');
      summaries[0].textContent = c.summary;
      summaries[1].textContent = c.finding;
      card.querySelector('[data-field="tags"]').innerHTML = c.tags.map(t => `<span class="case-tag">${t}</span>`).join('');
      card.querySelector('[data-field="stat"]').textContent = c.stat;
      card.querySelector('[data-field="statLabel"]').textContent = c.statLabel;
    });
  }

  function updatePersonaControls() {
    document.querySelectorAll('[data-persona]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-persona') === persona);
    });
    const dockLabel = document.getElementById('dockPersonaLabel');
    if (dockLabel) dockLabel.textContent = persona === 'da' ? 'Switch to BA view' : 'Switch to DA view';
    const indicator = document.getElementById('pIndicatorTop');
    if (indicator) indicator.style.transform = persona === 'da' ? 'translateX(0)' : 'translateX(34px)';
  }

  function switchPersona(target, silent) {
    if (target === persona) return;
    if (reduced) {
      persona = target;
      applySwapText(persona);
      updatePersonaControls();
      runTerminal(persona);
      if (!silent) showToast(`Switched to ${target === 'da' ? 'Data Analyst' : 'Business Analyst'} view`);
      return;
    }
    washOverlay.classList.remove('animate');
    void washOverlay.offsetWidth;
    washOverlay.classList.add('animate');
    setTimeout(() => {
      persona = target;
      applySwapText(persona);
      updatePersonaControls();
      runTerminal(persona);
      if (!silent) showToast(`Switched to ${target === 'da' ? 'Data Analyst' : 'Business Analyst'} view`);
    }, 330);
  }

  document.querySelectorAll('[data-persona]').forEach(btn => {
    btn.addEventListener('click', () => switchPersona(btn.getAttribute('data-persona')));
  });
  document.getElementById('dockPersonaBtn').addEventListener('click', () => switchPersona(persona === 'da' ? 'ba' : 'da'));

  setSpotlightMode('da');
  updatePersonaControls();

  /* ==========================================================
     PERSONA FLOAT PILL — shrink when hero scrolls out
  ========================================================== */
  const personaFloat = document.getElementById('personaFloat');
  const heroEl = document.getElementById('hero');
  const heroIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => personaFloat.classList.toggle('is-compact', !entry.isIntersecting));
  }, { threshold: 0.2 });
  heroIO.observe(heroEl);

  /* ==========================================================
     CUSTOM CURSOR
  ========================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (!reduced && finePointer) {
    /* smooth spring-follow cursor, instead of snapping straight to the mouse */
    let cTx = window.innerWidth / 2, cTy = window.innerHeight / 2, cCx = cTx, cCy = cTy;
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.opacity = '1';
      cTx = e.clientX; cTy = e.clientY;
    });
    function cursorLoop() {
      cCx += (cTx - cCx) * 0.2;
      cCy += (cTy - cCy) * 0.2;
      cursorDot.style.left = cCx + 'px';
      cursorDot.style.top = cCy + 'px';
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    document.querySelectorAll('a, button, .case-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });

    /* magnetic pull: buttons, dock icons, and chips nudge toward the cursor
       when it's nearby, and spring back on mouseleave */
    const MAGNETIC_STRENGTH = 0.35;
    const MAGNETIC_MAX = 12;
    document.querySelectorAll('.btn, .dock-item, .p-btn, .icon-btn, .kbd-chip, .clink, .p-opt, .copy-btn, .back-to-top').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        const dx = Math.max(-MAGNETIC_MAX, Math.min(MAGNETIC_MAX, relX * MAGNETIC_STRENGTH));
        const dy = Math.max(-MAGNETIC_MAX, Math.min(MAGNETIC_MAX, relY * MAGNETIC_STRENGTH));
        el.style.transition = 'transform 60ms linear';
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(0.34,1.4,0.64,1)';
        el.style.transform = 'translate(0,0) scale(1)';
      });
    });
  }

  /* ==========================================================
     AMBIENT PIXEL-STAR BACKGROUND — always-moving, monochrome,
     twinkling dot field drawn on canvas so it stays lightweight
  ========================================================== */
  (function initPixelStars() {
    const canvas = document.getElementById('pixelStars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const density = w < 700 ? 4500 : 2600; // fewer stars on small screens for performance
      const count = Math.floor((w * h) / density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() < 0.85 ? 1 : 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    function isDarkMode() { return root.getAttribute('data-theme') === 'dark'; }

    if (reduced) {
      // one static frame instead of a perpetual animation
      ctx.clearRect(0, 0, w, h);
      const dark = isDarkMode();
      stars.forEach(s => {
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.22)';
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      return;
    }

    let t = 0;
    function loop() {
      t += 0.02;
      ctx.clearRect(0, 0, w, h);
      const dark = isDarkMode();
      stars.forEach(s => {
        const alpha = 0.12 + 0.32 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.fillStyle = dark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 0.75})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();

  /* ==========================================================
     COMMAND PALETTE (⌘K / Ctrl+K)
  ========================================================== */
  const cmdkOverlay = document.getElementById('cmdkOverlay');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkList = document.getElementById('cmdkList');
  let cmdkActiveIndex = 0;
  let cmdkFiltered = [];

  const svgIcons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    cases: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M12 19V5M20 19v-6"/></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-8"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>'
  };

  function getCommands() {
    return [
      { group: 'Navigate', icon: svgIcons.home, label: 'Go to Home', action: () => scrollToSection('hero') },
      { group: 'Navigate', icon: svgIcons.cases, label: 'Go to Case Files', action: () => scrollToSection('cases') },
      { group: 'Navigate', icon: svgIcons.log, label: 'Go to Case Log', action: () => scrollToSection('experience') },
      { group: 'Navigate', icon: svgIcons.profile, label: 'Go to Profile', action: () => scrollToSection('about') },
      { group: 'Navigate', icon: svgIcons.contact, label: 'Go to Contact', action: () => scrollToSection('contact') },
      { group: 'View', icon: svgIcons.swap, label: persona === 'da' ? 'Switch to Business Analyst view' : 'Switch to Data Analyst view', action: () => switchPersona(persona === 'da' ? 'ba' : 'da') },
      { group: 'View', icon: svgIcons.theme, label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', action: () => toggleTheme() },
      { group: 'Contact', icon: svgIcons.copy, label: 'Copy email address', hint: 'shubham1sure@gmail.com', action: () => copyText('shubham1sure@gmail.com', 'Email copied') },
      { group: 'Contact', icon: svgIcons.copy, label: 'Copy phone number', hint: '+91-7836878701', action: () => copyText('+917836878701', 'Phone copied') },
      { group: 'Contact', icon: svgIcons.external, label: 'Send an email', action: () => window.location.href = 'mailto:shubham1sure@gmail.com' }
    ];
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  function renderCmdk(query) {
    const all = getCommands();
    const q = (query || '').toLowerCase().trim();
    cmdkFiltered = q ? all.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)) : all;
    cmdkActiveIndex = 0;
    if (cmdkFiltered.length === 0) {
      cmdkList.innerHTML = `<div class="cmdk-empty">No commands found for "${query}"</div>`;
      return;
    }
    let html = '';
    let lastGroup = '';
    cmdkFiltered.forEach((c, i) => {
      if (c.group !== lastGroup) {
        html += `<div class="cmdk-group-label">${c.group}</div>`;
        lastGroup = c.group;
      }
      html += `<div class="cmdk-item${i === 0 ? ' active' : ''}" data-idx="${i}">${c.icon}<span>${c.label}</span>${c.hint ? `<span class="cmdk-item-hint">${c.hint}</span>` : ''}</div>`;
    });
    cmdkList.innerHTML = html;
    cmdkList.querySelectorAll('.cmdk-item').forEach(el => {
      el.addEventListener('click', () => runCmdkItem(parseInt(el.dataset.idx, 10)));
      el.addEventListener('mouseenter', () => setCmdkActive(parseInt(el.dataset.idx, 10)));
    });
  }

  function setCmdkActive(idx) {
    cmdkActiveIndex = idx;
    cmdkList.querySelectorAll('.cmdk-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.idx, 10) === idx);
    });
  }

  function runCmdkItem(idx) {
    const cmd = cmdkFiltered[idx];
    if (!cmd) return;
    closeCmdk();
    setTimeout(() => cmd.action(), 120);
  }

  function openCmdk() {
    cmdkOverlay.classList.add('is-open');
    cmdkInput.value = '';
    renderCmdk('');
    document.body.style.overflow = 'hidden';
    setTimeout(() => cmdkInput.focus(), 50);
  }
  function closeCmdk() {
    cmdkOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.getElementById('cmdkTrigger').addEventListener('click', openCmdk);
  cmdkOverlay.addEventListener('click', (e) => { if (e.target === cmdkOverlay) closeCmdk(); });
  cmdkInput.addEventListener('input', () => renderCmdk(cmdkInput.value));

  document.addEventListener('keydown', (e) => {
    const isK = e.key === 'k' || e.key === 'K';
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault();
      cmdkOverlay.classList.contains('is-open') ? closeCmdk() : openCmdk();
      return;
    }
    if (e.key === 'Escape') {
      if (cmdkOverlay.classList.contains('is-open')) { closeCmdk(); return; }
      if (modalOverlay.classList.contains('is-open')) { closeModal(); return; }
    }
    if (cmdkOverlay.classList.contains('is-open')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCmdkActive(Math.min(cmdkActiveIndex + 1, cmdkFiltered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCmdkActive(Math.max(cmdkActiveIndex - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); runCmdkItem(cmdkActiveIndex); }
    }
  });

});
