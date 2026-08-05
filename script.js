document.addEventListener('DOMContentLoaded', () => {

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let persona = 'da';

  /* ==========================================================
     THEME
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
     TOAST + COPY
  ========================================================== */
  const toastWrap = document.getElementById('toastWrap');
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${msg}</span>`;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2400);
  }
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
    progressBar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
    backToTop.classList.toggle('visible', scrolled > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ==========================================================
     CASE DATA — now sourced from the real repos:
     github.com/Nothing0g/Uber_ride_demand_analysis
     github.com/Nothing0g/hr_employee_attrition_analysis
  ========================================================== */
  const CASES = [
    {
      id: '001',
      date: "Jun — Jul '26",
      da: {
        title: 'Uber Ride Demand & Supply-Failure Analysis',
        summary: 'Time-based EDA across 150,000 NCR ride bookings over a full year — hour-of-day, day-of-week, geography, and fare patterns, not a classification task.',
        finding: 'Demand swings ~9× across the day, but day-of-week barely matters (under 2% spread). The real finding: supply failure holds flat at ~25% regardless of hour — a structural problem, not a peak-hour one.',
        stat: '9×', statLabel: 'demand swing, hour to hour',
        tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
        modalDesc: "150,000 NCR ride bookings across 365 days. The question wasn't whether demand spikes — it does — it was whether driver supply keeps up, and what ops should do differently because of it."
      },
      ba: {
        title: "Why Ride Failures Aren't a Peak-Hour Problem",
        summary: "A year of NCR ride bookings, examined for one question: is Uber's failure rate driven by demand timing, or something structural?",
        finding: 'Demand swings ~9× by hour, but the booking failure rate stays flat at ~25% all day. That reframes the fix — this isn\'t a capacity problem at peak times, it\'s a constant matching failure.',
        stat: '9×', statLabel: 'demand swing leadership might assume drives failures',
        tags: ['Root-Cause Analysis', 'Operations', 'Data Storytelling'],
        modalDesc: "150,000 NCR ride bookings across a full year. Leadership's instinct might be that failures track with rush-hour demand — the data says the failure rate is constant, hour to hour."
      },
      status: 'Resolved',
      report: {
        legend: [{ label: 'Ride demand, by hour', color: 'var(--fg)' }],
        chartType: 'line',
        chartPoints: [2200, 1800, 1600, 1400, 1320, 1800, 3200, 5400, 7600, 9000, 8200, 7100, 7400, 6900, 6600, 7000, 7900, 10200, 12400, 11500, 9800, 7600, 5200, 3200],
        stats: [
          { label: 'Peak-hour demand (6 PM)', value: '12,400', pill: '• +9× vs. trough', tone: 'flat', caption: 'vs. ~1,320 bookings at 4 AM' },
          { label: 'Supply failure rate', value: '~25%', pill: '✓ flat, all hours', tone: 'good', caption: '24.9% quietest hour → 25.4% busiest hour' }
        ],
        rows: [
          { label: 'Day-of-week booking range', value: '21,215–21,644 / day', toneLabel: '✓ <2% spread', tone: 'good' },
          { label: 'Top 15 pickup zones (of 176)', value: '9.2% of bookings', toneLabel: '✓ not concentrated', tone: 'good' },
          { label: 'Fare band, all 24 hours', value: '₹499–₹519', toneLabel: '• stable', tone: 'flat' },
          { label: 'Trip distance band', value: '25.5–26.5 km', toneLabel: '• stable', tone: 'flat' }
        ],
        note: 'Note from the write-up: the flat day-of-week pattern, even geographic spread, and tight fare/distance bands suggest this is likely a synthetic dataset rather than organic ride-hailing data — flagged rather than overstated.'
      }
    },
    {
      id: '002',
      date: "Jun '26",
      da: {
        title: 'HR Attrition Prediction Model',
        summary: 'EDA and two classifiers on the IBM HR Analytics dataset (1,470 employees, 35 features) to find what actually predicts attrition — not just what correlates with it.',
        finding: 'Overtime is the strongest driver: 31% attrition vs. 10% for everyone else. Logistic Regression, despite lower accuracy, caught far more actual leavers than Random Forest.',
        stat: '3.1×', statLabel: 'attrition rate, overtime vs. not',
        tags: ['Python', 'scikit-learn', 'Seaborn'],
        modalDesc: '1,470 employees, 35 features — demographics, compensation, satisfaction scores, tenure. The goal was a model that actually flags at-risk employees, not just one that scores well.'
      },
      ba: {
        title: 'Finding a Retention Lever HR Could Actually Use',
        summary: 'Rather than a wall of correlations, the goal was one clear, defensible lever HR leadership could act on.',
        finding: 'Overtime workers leave at roughly 3× the rate of everyone else — the single clearest, most actionable signal in the dataset, ranking above income and tenure.',
        stat: '3.1×', statLabel: 'attrition rate, overtime vs. not',
        tags: ['Decision Framing', 'People Strategy', 'Retention'],
        modalDesc: '1,470 employees, 35 features. Rather than a broad attrition dashboard nobody acts on, the goal was one specific, implementable recommendation.'
      },
      status: 'Resolved',
      report: {
        legend: [{ label: 'Logistic Regression', color: 'var(--fg)' }, { label: 'Random Forest', color: 'var(--border-strong)' }],
        chartType: 'bars',
        chartBars: [
          { label: 'Recall — Logistic Regression', value: 56, color: 'var(--fg)' },
          { label: 'Recall — Random Forest', value: 21, color: 'var(--fg-faint)' }
        ],
        stats: [
          { label: 'Attrition rate, overtime', value: '31%', pill: '! 3.1× baseline', tone: 'bad', caption: 'vs. 10% for non-overtime employees' },
          { label: 'Recall — Logistic Regression', value: '56%', pill: '✓ vs. 21% (Random Forest)', tone: 'good', caption: '72% accuracy — lower, but catches more real leavers' }
        ],
        rows: [
          { label: 'Random Forest accuracy', value: '86%', toneLabel: '! only 21% recall', tone: 'bad' },
          { label: 'Median income, leavers vs. stayers', value: '₹3,100 vs ₹5,200', toneLabel: '• 2nd strongest factor', tone: 'flat' },
          { label: 'Median tenure, leavers vs. stayers', value: '~3 yrs vs ~6 yrs', toneLabel: '• early-career gap', tone: 'flat' },
          { label: 'Class imbalance handling', value: "class_weight='balanced'", toneLabel: '• 84 / 16 split', tone: 'flat' }
        ],
        note: 'Dataset: IBM HR Analytics Employee Attrition (Kaggle) — 1,470 employees, 35 features covering demographics, compensation, satisfaction, and tenure.'
      }
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
        modalDesc: 'Surveyed ~200 college students to find the real driver behind Gen Z fitness app drop-off — not price, not access, but motivation.'
      },
      ba: {
        title: 'The One Insight Behind a Fitness App MVP',
        summary: 'Instead of guessing at feature requests, ~200 student surveys isolated the single behavioral lever worth building a product around.',
        finding: 'Built and shipped an MVP scoped entirely around one insight — competition — resisting the urge to add unrelated features.',
        stat: '1 of 1', statLabel: 'insight the MVP was built around',
        tags: ['Product Framing', 'Research', 'Prioritization'],
        modalDesc: 'Rather than building a broad feature set, the goal was to find and validate one behavioral driver worth designing an entire MVP around.'
      },
      status: 'Resolved',
      report: null,
      highlightOverride: {
        da: 'Presented at a Dell Aspire event; recognized for solving one problem well over spreading thin across many.',
        ba: 'Lesson reinforced by industry feedback at a Dell Aspire event: solve one problem exceptionally well, not several adequately.'
      }
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
    card.style.transitionDelay = (i * 60) + 'ms'; // stagger: 3 cards enter 60ms apart
    card.style.setProperty('--stack-i', i); // sticky-stack offset — see CSS

    let visual = '';
    if (c.report && c.report.chartType === 'line') {
      const pts = c.report.chartPoints;
      const min = Math.min(...pts), max = Math.max(...pts);
      const poly = pts.map((v, idx) => {
        const x = (idx / (pts.length - 1)) * 200;
        const y = 70 - ((v - min) / (max - min)) * 60;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      visual = `<svg class="case-line" viewBox="0 0 200 90" preserveAspectRatio="none"><polyline points="${poly}" fill="none" stroke="var(--fg)" stroke-width="2"/></svg>`;
    } else if (c.report && c.report.chartType === 'bars') {
      const bars = c.report.chartBars;
      const maxV = Math.max(...bars.map(b => b.value));
      visual = `<div class="case-bars">${bars.map(b => `<span style="height:${(b.value / maxV) * 100}%" class="${b === bars[0] ? 'hi' : ''}"></span>`).join('')}<span></span><span></span><span></span><span></span></div>`;
    } else {
      visual = `<div class="case-bars"><span style="height:50%"></span><span style="height:80%" class="hi"></span><span style="height:35%"></span><span style="height:65%"></span><span style="height:90%" class="hi"></span><span style="height:45%"></span></div>`;
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
          <span class="case-view-link">View full report
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
     MODAL — dark report card
  ========================================================== */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalId = document.getElementById('modalId');
  const modalStatus = document.getElementById('modalStatus');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalChartCard = document.getElementById('modalChartCard');
  const modalLegend = document.getElementById('modalLegend');
  const modalChartSvg = document.getElementById('modalChartSvg');
  const modalStats = document.getElementById('modalStats');
  const modalRows = document.getElementById('modalRows');
  const modalNote = document.getElementById('modalNote');
  const modalHighlight = document.getElementById('modalHighlight');
  const modalTags = document.getElementById('modalTags');

  function renderChart(report) {
    modalChartSvg.innerHTML = '';
    modalLegend.innerHTML = report.legend.map(l =>
      `<div class="report-legend-item"><span class="report-legend-swatch" style="background:${l.color}"></span>${l.label}</div>`
    ).join('');

    const NS = 'http://www.w3.org/2000/svg';
    if (report.chartType === 'line') {
      const pts = report.chartPoints;
      const min = Math.min(...pts), max = Math.max(...pts);
      const coords = pts.map((v, i) => {
        const x = (i / (pts.length - 1)) * 640;
        const y = 170 - ((v - min) / (max - min)) * 140;
        return [x, y];
      });
      const lineStr = coords.map(p => p.join(',')).join(' ');
      const areaStr = `0,190 ${lineStr} 640,190`;

      const defs = document.createElementNS(NS, 'defs');
      defs.innerHTML = `<linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--fg)" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="var(--fg)" stop-opacity="0"/>
      </linearGradient>`;
      modalChartSvg.appendChild(defs);

      for (let gy = 10; gy <= 190; gy += 45) {
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', '0'); line.setAttribute('x2', '640');
        line.setAttribute('y1', gy); line.setAttribute('y2', gy);
        line.setAttribute('stroke', 'var(--border)');
        modalChartSvg.appendChild(line);
      }

      const area = document.createElementNS(NS, 'polygon');
      area.setAttribute('points', areaStr);
      area.setAttribute('fill', 'url(#reportGrad)');
      modalChartSvg.appendChild(area);

      const poly = document.createElementNS(NS, 'polyline');
      poly.setAttribute('points', lineStr);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', 'var(--fg)');
      poly.setAttribute('stroke-width', '2.5');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      modalChartSvg.appendChild(poly);
    } else if (report.chartType === 'bars') {
      const bars = report.chartBars;
      const maxV = 100;
      const barWidth = 140;
      const gap = (640 - barWidth * bars.length) / (bars.length + 1);
      bars.forEach((b, i) => {
        const x = gap + i * (barWidth + gap);
        const h = (b.value / maxV) * 150;
        const y = 185 - h;
        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', x); rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth); rect.setAttribute('height', h);
        rect.setAttribute('rx', 6);
        rect.setAttribute('fill', b.color);
        rect.setAttribute('opacity', i === 0 ? '1' : '0.55');
        modalChartSvg.appendChild(rect);

        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', x + barWidth / 2); label.setAttribute('y', y - 10);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'var(--fg)');
        label.setAttribute('font-family', 'var(--font-mono)');
        label.setAttribute('font-size', '16');
        label.setAttribute('font-weight', '700');
        label.textContent = b.value + '%';
        modalChartSvg.appendChild(label);
      });
    }
  }

  function openModal(i) {
    const c = CASES[i];
    const p = c[persona];
    modalId.textContent = `CASE NO. ${c.id} · ${c.date}`;
    modalStatus.textContent = c.status;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.modalDesc;

    if (c.report) {
      modalChartCard.style.display = '';
      modalStats.style.display = '';
      renderChart(c.report);
      modalStats.innerHTML = c.report.stats.map(s => `
        <div class="report-stat">
          <div class="report-stat-label">${s.label}</div>
          <div class="report-stat-row">
            <span class="report-stat-value">${s.value}</span>
            <span class="report-pill tone-${s.tone}">${s.pill}</span>
          </div>
          <div class="report-stat-caption">${s.caption}</div>
        </div>
      `).join('');
      modalRows.innerHTML = c.report.rows.map(r => `
        <div class="report-row">
          <span class="report-row-label">${r.label}</span>
          <span class="report-row-value">${r.value}</span>
          <span class="report-pill tone-${r.tone}">${r.toneLabel}</span>
        </div>
      `).join('');
      if (c.report.note) {
        modalNote.style.display = '';
        modalNote.textContent = c.report.note;
      } else {
        modalNote.style.display = 'none';
      }
    } else {
      modalChartCard.style.display = 'none';
      modalStats.style.display = 'none';
      modalRows.innerHTML = '';
      modalNote.style.display = 'none';
    }

    modalHighlight.textContent = c.highlightOverride ? c.highlightOverride[persona] : (p.highlight || p.finding);
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
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ==========================================================
     SPOTLIGHT CARDS
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
      { p: '~ $', t: 'who_am_i' }, { p: '→', t: 'Data Analyst · Mechanical Eng. background' },
      { p: '~ $', t: 'stack' }, { p: '→', t: 'Python · SQL · Power BI · Statistics & ML' },
      { p: '~ $', t: 'currently' }, { p: '→', t: 'Open to DA / BA roles' }
    ],
    ba: [
      { p: '~ $', t: 'who_am_i' }, { p: '→', t: 'Business Analyst · Mechanical Eng. background' },
      { p: '~ $', t: 'focus' }, { p: '→', t: 'Case frameworks, stakeholder alignment, decisions' },
      { p: '~ $', t: 'currently' }, { p: '→', t: 'Open to BA / DA roles' }
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
      prompt.className = 'tp'; prompt.textContent = p + ' ';
      const text = document.createElement('span');
      row.appendChild(prompt); row.appendChild(text);
      terminalBody.appendChild(row);
      let ci = 0;
      function typeChar() {
        if (ci < t.length) { text.textContent += t[ci]; ci++; terminalTimeouts.push(setTimeout(typeChar, 16)); }
        else { li++; terminalTimeouts.push(setTimeout(typeLine, 240)); }
      }
      typeChar();
    }
    typeLine();
  }
  const termIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { runTerminal(persona); termIO.unobserve(entry.target); } });
  }, { threshold: 0.4 });
  termIO.observe(terminalBody);

  /* ==========================================================
     SIMPLE EASTER EGG — click the terminal's title bar 5×
  ========================================================== */
  console.log('%cLooking under the hood?', 'font-size:16px;font-weight:700;');
  console.log('%cI\'m Shubham — I built this whole site by hand, no template. If you\'re hiring for data or business analyst roles, my email is in the footer.', 'font-size:12px;color:#888;');

  const terminalBar = document.getElementById('terminalBar');
  let terminalClicks = 0, terminalClickTimer = null;
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
     PERSONA TOGGLE
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

  let personaSwapTimeout = null; // guards against overlapping swaps on rapid clicks

  function switchPersona(target, silent) {
    if (target === persona) return;
    if (reduced) {
      clearTimeout(personaSwapTimeout);
      persona = target;
      applySwapText(persona); updatePersonaControls(); runTerminal(persona);
      if (!silent) showToast(`Switched to ${target === 'da' ? 'Data Analyst' : 'Business Analyst'} view`);
      return;
    }
    clearTimeout(personaSwapTimeout); // cancel any swap still pending from a previous click
    washOverlay.classList.remove('animate');
    void washOverlay.offsetWidth;
    washOverlay.classList.add('animate');
    personaSwapTimeout = setTimeout(() => {
      persona = target;
      applySwapText(persona); updatePersonaControls(); runTerminal(persona);
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
     DRAGGABLE HERO ICONS
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
        icon.style.left = nx + 'px'; icon.style.top = ny + 'px';
        icon.style.right = 'auto'; icon.style.bottom = 'auto';
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

  // "drag me" hint on each floating icon, shown on hover only
  document.querySelectorAll('.hero-float-icon').forEach(icon => {
    const hint = document.createElement('span');
    hint.className = 'hfi-hint';
    hint.textContent = 'drag me';
    icon.appendChild(hint);
  });

  // hero "lamp" — a functional prop, not decoration: click to flip the theme
  const heroThemeProp = document.getElementById('heroThemeProp');
  if (heroThemeProp) heroThemeProp.addEventListener('click', (e) => toggleTheme(e));

  /* ==========================================================
     CURSOR — a simple custom pointer (a solid arrow, monochrome)
     replacing the native OS cursor, spring-following the mouse.
     Position-only via transform (GPU, cheap, no layout writes),
     with a light scale-up on hover for feedback. The button-
     morphing "fill" behavior from earlier rounds is intentionally
     gone — it was the source of two separate visual bugs, and a
     clean consistent shape is the more robust design regardless.
  ========================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  if (!reduced && finePointer) {
    root.classList.add('custom-cursor'); // hides the native OS pointer — see CSS
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let cx = mouseX, cy = mouseY;
    let scale = 1, targetScale = 1;

    window.addEventListener('mousemove', (e) => {
      cursorDot.style.opacity = '1';
      mouseX = e.clientX; mouseY = e.clientY;
    });

    function loop() {
      const k = 0.28;
      cx += (mouseX - cx) * k;
      cy += (mouseY - cy) * k;
      scale += (targetScale - scale) * 0.2;
      cursorDot.style.transform = `translate(${cx}px, ${cy}px) scale(${scale})`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.querySelectorAll('a, button, .case-card, .roadmap-card, .hero-float-icon').forEach(el => {
      el.addEventListener('mouseenter', () => { targetScale = 1.35; });
      el.addEventListener('mouseleave', () => { targetScale = 1; });
    });
  }

  /* ==========================================================
     INTERACTIVE BACKGROUND — monochrome dot grid, reacts to
     cursor/touch, clearly visible in both themes
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
        for (let x = SPACING / 2; x < w; x += SPACING) dots.push({ x, y });
      }
    }
    build();
    window.addEventListener('resize', build);

    let px = -9999, py = -9999;
    window.addEventListener('mousemove', (e) => { px = e.clientX; py = e.clientY; });
    window.addEventListener('touchmove', (e) => { if (e.touches && e.touches[0]) { px = e.touches[0].clientX; py = e.touches[0].clientY; } }, { passive: true });
    window.addEventListener('mouseleave', () => { px = -9999; py = -9999; });

    function isDarkMode() { return root.getAttribute('data-theme') === 'dark'; }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const dark = isDarkMode();
      const burst = performance.now() < bgBurstUntil;
      const rgb = dark ? '237,237,237' : '10,10,10';

      dots.forEach(d => {
        const dx = d.x - px, dy = d.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / RADIUS);
        const baseAlpha = dark ? 0.22 : 0.16;
        let alpha = baseAlpha + proximity * 0.6;
        const size = 1 + proximity * 2.2;
        if (burst) alpha = Math.min(1, alpha + 0.3);
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
      });

      if (!reduced) requestAnimationFrame(draw);
    }

    if (reduced) draw(); else requestAnimationFrame(draw);
  })();

  /* ==========================================================
     COMMAND PALETTE
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
    let html = '', lastGroup = '';
    cmdkFiltered.forEach((c, i) => {
      if (c.group !== lastGroup) { html += `<div class="cmdk-group-label">${c.group}</div>`; lastGroup = c.group; }
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
    cmdkList.querySelectorAll('.cmdk-item').forEach(el => el.classList.toggle('active', parseInt(el.dataset.idx, 10) === idx));
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
