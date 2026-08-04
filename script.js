document.addEventListener('DOMContentLoaded', () => {

  let persona = 'da';

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
        <polyline points="0,70 20,60 40,68 60,45 80,50 100,30 120,38 140,20 160,28 180,15 200,22" fill="none" stroke="var(--pine)" stroke-width="2"/>
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
          <p class="case-summary" data-field="finding" style="color:var(--ink)">${c[persona].finding}</p>
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

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
    // re-render case card fields
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
    if (indicator) indicator.style.transform = persona === 'da' ? 'translateX(0)' : 'translateX(38px)';
  }

  function switchPersona(target) {
    if (target === persona) return;
    if (reduced) {
      persona = target;
      applySwapText(persona);
      updatePersonaControls();
      runTerminal(persona);
      return;
    }
    washOverlay.classList.remove('animate');
    void washOverlay.offsetWidth; // restart animation
    washOverlay.classList.add('animate');
    setTimeout(() => {
      persona = target;
      applySwapText(persona);
      updatePersonaControls();
      runTerminal(persona);
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
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.opacity = '1';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .case-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
  }

});
