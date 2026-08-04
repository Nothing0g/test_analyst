document.addEventListener('DOMContentLoaded', () => {

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let persona = 'da';

  /* ==========================================================
     THEME — light/dark, persisted, circular reveal via View
     Transitions API (falls back to instant swap without support)
  ========================================================== */
  const sunIcon = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  const moonIcon = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  let theme = 'light';
  try { theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) {}

  function paintTheme(t) {
    theme = t;
    root.setAttribute('data-theme', t);
    const icon = t === 'dark' ? sunIcon : moonIcon;
    document.getElementById('themeIcon').innerHTML = icon;
    document.getElementById('dockThemeIcon').innerHTML = icon;
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  paintTheme(theme);

  function toggleTheme(e) {
    const next = theme === 'dark' ? 'light' : 'dark';
    const x = e && e.clientX != null ? e.clientX : window.innerWidth / 2;
    const y = e && e.clientY != null ? e.clientY : window.innerHeight / 2;
    root.style.setProperty('--tx', x + 'px');
    root.style.setProperty('--ty', y + 'px');
    if (document.startViewTransition && !reduced) {
      document.startViewTransition(() => paintTheme(next));
    } else {
      paintTheme(next);
    }
  }
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
    }, 2400);
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
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ==========================================================
     CASE FILE DATA — now with metadata + investigation steps
     for the report-style modal. NOTE: real GitHub repo details
     aren't in here yet (GitHub blocked automated access) — this
     is still resume-sourced. Paste repo links/READMEs and I'll
     fill these in with the real specifics.
  ========================================================== */
  const CASES = [
    {
      id: '001',
      date: "Jun — Jul '26",
      meta: {
        Timeframe: "Jun – Jul '26",
        Dataset: "150,000 NCR ride records",
        Method: "Time-series EDA + rate-normalized SQL",
        Tools: "Python, Pandas, SQL",
        Confidence: "High — held across all 24 hours"
      },
      steps: [
        'Ingested and cleaned 150K raw ride booking records',
        'Segmented demand by hour and pickup zone',
        '<strong>Normalized</strong> failure rate instead of using raw counts',
        'Isolated a structural matching gap, not a supply shortage',
        'Recommended zone-level rebalancing over added fleet capacity'
      ],
      da: {
        title: 'Ride Failure Root-Cause Analysis',
        summary: 'Time-series EDA across 150K NCR ride bookings surfaced demand swings from 1,321 to 12,397 rides by hour, while day-of-week and geography showed no meaningful effect.',
        finding: 'Rate-normalized SQL queries — not raw counts — exposed a flat ~25% booking failure rate across every hour. Segmenting by zone isolated a structural matching gap, not a peak-hour supply shortage.',
        stat: '9.4×', statLabel: 'peak-to-trough demand swing',
        tags: ['Python', 'Pandas', 'SQL', 'Segmentation'],
        modalDesc: 'Analyzed 150,000 NCR ride records to understand why failure rates stayed flat throughout the day. Rather than treating this as a peak-hour capacity problem, segmenting by demand zone revealed a structural matching gap invisible in the aggregate metrics.',
        highlight: 'The ~25% failure rate was constant across all hours — the fix isn\'t more supply at peak times, it\'s better zone-level matching logic.'
      },
      ba: {
        title: "Why Ride Failures Weren't a Peak-Hour Problem",
        summary: 'Leadership assumed failed rides tracked with rush-hour demand and were weighing added fleet capacity. The data, across 150K bookings, said otherwise.',
        finding: 'The booking failure rate held flat at ~25% all day, every day — reframing the fix from "add supply at peak" to "fix the structural matching gap between zones."',
        stat: '9.4×', statLabel: 'demand swing leadership assumed drove failures',
        tags: ['Stakeholder Framing', 'Root-Cause Analysis', 'Operations'],
        modalDesc: 'Leadership had assumed failed rides tracked with rush-hour demand and were considering added fleet capacity to fix it. Analysis of 150,000 NCR ride records told a different story: the failure rate stayed flat at ~25% all day.',
        highlight: "Recommendation: don't add peak-hour capacity — rebalance zone-level matching instead. The problem was structural, not a supply shortage."
      },
      chart: 'demand', status: 'Resolved'
    },
    {
      id: '002',
      date: "Jun '26",
      meta: {
        Timeframe: "Jun '26",
        Dataset: "1,470 employee records",
        Method: "EDA + Logistic Regression vs. Random Forest",
        Tools: "Python, scikit-learn",
        Confidence: "High — 56% recall vs. 21%"
      },
      steps: [
        'Cleaned and explored the 1,470-row HR dataset',
        'Engineered an overtime feature from raw attendance data',
        'Trained and compared two classifiers',
        'Selected on <strong>recall</strong>, not accuracy — the costlier error is missing a leaver',
        'Recommended an overtime cap as the retention lever'
      ],
      da: {
        title: 'HR Attrition Prediction Model',
        summary: 'EDA and predictive modeling across 1,470 employee records isolated overtime as the strongest attrition driver — 31% vs. 10% for non-overtime staff.',
        finding: 'Chose logistic regression over random forest for higher recall on at-risk employees (56% vs. 21%) — prioritizing catching real risk over raw accuracy.',
        stat: '3.1×', statLabel: 'attrition rate, overtime vs. not',
        tags: ['Python', 'scikit-learn', 'Logistic Regression'],
        modalDesc: 'Built and compared Logistic Regression and Random Forest classifiers on 1,470 employee records. Prioritized recall over raw accuracy since the cost of missing a departing employee outweighs a false positive.',
        highlight: "Employees working overtime attrite at ~3x the rate of those who don't — a clear, actionable retention lever."
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
      chart: 'attrition', status: 'Resolved'
    },
    {
      id: '003',
      date: "Jun — Jul '24",
      meta: {
        Timeframe: "Jun – Jul '24",
        Dataset: "~200 student survey responses",
        Method: "Survey design + thematic analysis + MVP build",
        Tools: "Google Forms, Thunkable",
        Confidence: "Validated at a Dell Aspire event"
      },
      steps: [
        'Designed and distributed a ~200-respondent student survey',
        'Identified "lack of motivation" as the core drop-off driver',
        'Scoped an MVP around a single behavioral lever',
        'Built competition mechanics — leaderboards, milestones',
        'Presented findings and received industry recognition'
      ],
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
      chart: null, status: 'Resolved'
    }
  ];

  /* ==========================================================
     RENDER CASE CARDS
  ========================================================== */
  const caseList = document.getElementById('caseList');
  CASES.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'case-card spotlight-card reveal';
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
          <span class="case-view-link">View incident report
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
     MODAL — incident-report layout
  ========================================================== */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalId = document.getElementById('modalId');
  const modalStatus = document.getElementById('modalStatus');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalMetaGrid = document.getElementById('modalMetaGrid');
  const modalTimeline = document.getElementById('modalTimeline');
  const modalHighlight = document.getElementById('modalHighlight');
  const modalTags = document.getElementById('modalTags');

  function openModal(i) {
    const c = CASES[i];
    const p = c[persona];
    modalId.textContent = `CASE NO. ${c.id} · ${c.date}`;
    modalStatus.textContent = c.status;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.modalDesc;
    modalMetaGrid.innerHTML = Object.entries(c.meta).map(([k, v]) =>
      `<div class="modal-meta-cell"><div class="modal-meta-k">${k}</div><div class="modal-meta-v">${v}</div></div>`
    ).join('');
    modalTimeline.innerHTML = c.steps.map(s => `<div class="modal-tl-step">${s}</div>`).join('');
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
     SPOTLIGHT CARDS — accent glow that follows the cursor
  ========================================================== */
  if (!reduced) {
    document.addEventListener('mousemove', (e) => {
      const el = e.target.closest && e.target.closest('.spotlight-card');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

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
     SIMPLE EASTER EGG — click the terminal's title bar 5 times
  ========================================================== */
  console.log('%cLooking under the hood?', 'font-size:16px;font-weight:700;');
  console.log('%cI\'m Shubham — I built this whole site by hand, no template. If you\'re hiring for data or business analyst roles, my email is in the footer.', 'font-size:12px;color:#888;');

  const terminalBar = document.getElementById('terminalBar');
  let terminalClicks = 0;
  let terminalClickTimer = null;
  terminalBar.addEventListener('click', () => {
    terminalClicks++;
    clearTimeout(terminalClickTimer);
    terminalClickTimer = setTimeout(() => { terminalClicks = 0; }, 1500);
    if (terminalClicks >= 5) {
      terminalClicks = 0;
      bgBurstUntil = performance.now() + 2200;
      showToast('🔓 You found it — thanks for looking closely');
    }
  });

  /* ==========================================================
     PERSONA TOGGLE — swaps text + hero icons with a wash
     transition (separate from the theme's circular reveal)
  ========================================================== */
  const washOverlay = document.getElementById('washOverlay');
  const swapEls = document.querySelectorAll('.swap-text');
  const roleSwapEl = document.querySelector('.role-swap');
  const heroIconsDA = document.getElementById('heroIconsDA');
  const heroIconsBA = document.getElementById('heroIconsBA');

  function applySwapText(mode) {
    swapEls.forEach(el => {
      const val = el.getAttribute(mode === 'da' ? 'data-da' : 'data-ba');
      if (val !== null) el.textContent = val;
    });
    if (roleSwapEl) roleSwapEl.textContent = mode === 'da' ? 'Data Analyst' : 'Business Analyst';
    heroIconsDA.style.display = mode === 'da' ? 'block' : 'none';
    heroIconsBA.style.display = mode === 'ba' ? 'block' : 'none';
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

  applySwapText('da');
  updatePersonaControls();

  /* ==========================================================
     DRAGGABLE HERO ICONS — drop anywhere, they keep floating
     from that spot indefinitely
  ========================================================== */
  const heroEl = document.getElementById('hero');
  document.querySelectorAll('.hero-float-icon').forEach(icon => {
    icon.addEventListener('pointerdown', (e) => {
      icon.setPointerCapture(e.pointerId);
      icon.classList.add('is-dragging');
      const heroRect = heroEl.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      const offsetX = e.clientX - iconRect.left;
      const offsetY = e.clientY - iconRect.top;

      function onMove(ev) {
        let nx = ev.clientX - heroRect.left - offsetX;
        let ny = ev.clientY - heroRect.top - offsetY;
        nx = Math.max(0, Math.min(nx, heroRect.width - iconRect.width));
        ny = Math.max(0, Math.min(ny, heroRect.height - iconRect.height));
        icon.style.left = nx + 'px';
        icon.style.top = ny + 'px';
        icon.style.right = 'auto';
        icon.style.bottom = 'auto';
      }
      function onUp() {
        icon.classList.remove('is-dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  });

  /* ==========================================================
     CURSOR — spring-follow dot that morphs to fill small
     controls on hover. Rect is re-measured on every mousemove
     while hovering (not just once on enter), so it can't drift
     out of sync if the button itself moves or the page scrolls.
  ========================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const FILL_SELECTOR = '.btn, .dock-item, .p-opt, .icon-btn, .kbd-chip, .clink, .copy-btn, .back-to-top, .cmdk-item, .footer-port';

  if (!reduced && finePointer) {
    let cTx = window.innerWidth / 2, cTy = window.innerHeight / 2, cCx = cTx, cCy = cTy;
    let fillEl = null;

    window.addEventListener('mousemove', (e) => {
      cursorDot.style.opacity = '1';
      cTx = e.clientX; cTy = e.clientY;

      const target = e.target.closest ? e.target.closest(FILL_SELECTOR) : null;
      if (target !== fillEl) {
        fillEl = target;
        if (!fillEl) releaseFill();
      }
      if (fillEl) {
        const r = fillEl.getBoundingClientRect();
        const cs = getComputedStyle(fillEl);
        cursorDot.style.left = r.left + 'px';
        cursorDot.style.top = r.top + 'px';
        cursorDot.style.width = r.width + 'px';
        cursorDot.style.height = r.height + 'px';
        cursorDot.style.borderRadius = cs.borderRadius;
        cursorDot.style.transform = 'none';
      }
    });

    function cursorLoop() {
      cCx += (cTx - cCx) * 0.2;
      cCy += (cTy - cCy) * 0.2;
      if (!fillEl) {
        cursorDot.style.left = cCx + 'px';
        cursorDot.style.top = cCy + 'px';
      }
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    function releaseFill() {
      cursorDot.style.width = '8px';
      cursorDot.style.height = '8px';
      cursorDot.style.borderRadius = '50%';
      cursorDot.style.transform = 'translate(-50%,-50%)';
    }
    cursorDot.style.transition = 'left .18s var(--ease-spring, ease), top .18s var(--ease-spring, ease), width .18s var(--ease-spring, ease), height .18s var(--ease-spring, ease), border-radius .18s ease, opacity .2s ease';

    document.querySelectorAll('a, button, .case-card, .roadmap-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
  }

  /* ==========================================================
     INTERACTIVE BACKGROUND — a dot grid that reacts to the
     cursor (and touch), clearly visible in both themes, and
     brightens briefly for the easter egg
  ========================================================== */
  let bgBurstUntil = 0;
  (function initBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dots = [];
    const SPACING = 34;
    const RADIUS = 150;

    function build() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      dots = [];
      for (let y = SPACING / 2; y < h; y += SPACING) {
        for (let x = SPACING / 2; x < w; x += SPACING) {
          dots.push({ x, y });
        }
      }
    }
    build();
    window.addEventListener('resize', build);

    let px = -9999, py = -9999;
    function setPointer(x, y) { px = x; py = y; }
    window.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('mouseleave', () => setPointer(-9999, -9999));

    function isDarkMode() { return root.getAttribute('data-theme') === 'dark'; }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const dark = isDarkMode();
      const burst = performance.now() < bgBurstUntil;
      const baseRGB = dark ? '237,237,237' : '10,10,10';
      const accentRGB = dark ? '50,145,255' : '0,112,243';

      dots.forEach(d => {
        const dx = d.x - px, dy = d.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / RADIUS); // 0..1, 1 = right under cursor
        const baseAlpha = dark ? 0.22 : 0.16;
        const alpha = baseAlpha + proximity * 0.6;
        const size = 1 + proximity * 2.2;
        const rgb = (burst || proximity > 0.15) ? accentRGB : baseRGB;
        const a = burst ? Math.min(1, alpha + 0.25) : alpha;
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
      });

      if (!reduced) requestAnimationFrame(draw);
    }

    if (reduced) {
      draw(); // one static frame
    } else {
      requestAnimationFrame(draw);
    }
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
    profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>',
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M12 19V5M20 19v-6"/></svg>',
    cases: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    toolkit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94z"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-8"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>'
  };

  function getCommands() {
    return [
      { group: 'Navigate', icon: svgIcons.home, label: 'Go to Home', action: () => scrollToSection('hero') },
      { group: 'Navigate', icon: svgIcons.profile, label: 'Go to Profile', action: () => scrollToSection('about') },
      { group: 'Navigate', icon: svgIcons.log, label: 'Go to Case Log', action: () => scrollToSection('experience') },
      { group: 'Navigate', icon: svgIcons.cases, label: 'Go to Case Files', action: () => scrollToSection('cases') },
      { group: 'Navigate', icon: svgIcons.toolkit, label: 'Go to Toolkit', action: () => scrollToSection('toolkit') },
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
