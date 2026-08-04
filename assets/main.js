// ============================================================
// SHARED SCRIPT — single-page site with DA/BA views swapped in-DOM.
// window.LINKS and window.PROJECTS are defined in index.html before
// this file loads.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  let currentPersona = 'da'; // single source of truth for which view is active

  const viewDA = document.getElementById('view-da');
  const viewBA = document.getElementById('view-ba');

  // ---- Wire up real links from LINKS object ----
  const LINKS = window.LINKS || {};
  function applyLinks(scope) {
    scope.querySelectorAll('[data-link]').forEach(el => {
      const key = el.getAttribute('data-link');
      if (LINKS[key]) el.setAttribute('href', LINKS[key]);
    });
  }
  applyLinks(document);

  // ---- Theme toggle (in-memory only) ----
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const sunIcon = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  const moonIcon = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  let isDark = true;
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      isDark = !isDark;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (themeIcon) themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
    });
  }

  // ---- Scroll-triggered reveal, re-armed whenever a view becomes active ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  function armReveals(scope) {
    scope.querySelectorAll('.reveal').forEach(el => {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  }
  armReveals(document);

  // ---- Dock nav: scroll targets resolve to the ACTIVE view's section id ----
  // e.g. data-scroll-target="work" -> #work-da or #work-ba depending on persona
  document.querySelectorAll('[data-scroll-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const base = link.getAttribute('data-scroll-target');
      const activeView = currentPersona === 'da' ? viewDA : viewBA;
      const targetId = base === 'hero' ? null : `${base}-${currentPersona}`;
      const target = targetId ? activeView.querySelector(`#${targetId}`) : activeView.querySelector('.hero');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---- Terminal identity device (typing effect), scoped per view ----
  function setupTerminal(scope) {
    const terminalBody = scope.querySelector('[data-terminal-body]');
    if (!terminalBody || terminalBody.dataset.typed === 'true') return;
    const lines = JSON.parse(terminalBody.getAttribute('data-lines') || '[]');
    terminalBody.innerHTML = '';
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= lines.length) { terminalBody.dataset.typed = 'true'; return; }
      const { prompt, text } = lines[lineIndex];
      const lineEl = document.createElement('div');
      const promptEl = document.createElement('span');
      promptEl.className = 'terminal-prompt';
      promptEl.textContent = prompt + ' ';
      const textEl = document.createElement('span');
      lineEl.appendChild(promptEl);
      lineEl.appendChild(textEl);
      terminalBody.appendChild(lineEl);

      let charIndex = 0;
      const typeChar = () => {
        if (charIndex < text.length) {
          textEl.textContent += text[charIndex];
          charIndex++;
          setTimeout(typeChar, 18);
        } else {
          lineIndex++;
          setTimeout(typeLine, 280);
        }
      };
      typeChar();
    }

    const termIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeLine();
          termIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    termIO.observe(terminalBody);
  }
  setupTerminal(viewDA);
  setupTerminal(viewBA);

  // ---- Project modal: content depends on BOTH the project key AND active persona ----
  const PROJECTS = window.PROJECTS || {};
  const modalOverlay = document.getElementById('projectModal');
  if (modalOverlay) {
    const modalCat = modalOverlay.querySelector('[data-modal-cat]');
    const modalTitle = modalOverlay.querySelector('[data-modal-title]');
    const modalDesc = modalOverlay.querySelector('[data-modal-desc]');
    const modalHighlight = modalOverlay.querySelector('[data-modal-highlight]');
    const modalTags = modalOverlay.querySelector('[data-modal-tags]');
    const modalFoot = modalOverlay.querySelector('[data-modal-foot]');

    function openModal(key) {
      const proj = PROJECTS[key];
      const p = proj ? proj[currentPersona] : null;
      if (!p) return;
      modalCat.textContent = p.category;
      modalTitle.textContent = p.title;
      modalDesc.textContent = p.description;
      modalHighlight.textContent = p.highlight;
      // restart the flag-pulse animation each time the modal opens
      modalHighlight.style.animation = 'none';
      requestAnimationFrame(() => { modalHighlight.style.animation = ''; });
      modalTags.innerHTML = p.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');
      modalFoot.innerHTML = `<a href="${p.link}" target="_blank" rel="noopener" class="btn btn-primary">View on GitHub ↗</a>`;
      modalOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-open-project]').forEach(card => {
      card.addEventListener('click', () => openModal(card.getAttribute('data-open-project')));
    });
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // ---- Spotlight reveal panels: cursor-following circular mask, one per view ----
  function setupSpotlight(scope) {
    const panel = scope.querySelector('.spotlight-panel');
    if (!panel || panel.dataset.wired === 'true') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    panel.dataset.wired = 'true';

    const revealLayer = panel.querySelector('.spotlight-reveal');
    const dot = document.querySelector('.spotlight-cursor-dot');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const RADIUS = 90;

    function resizeCanvas() {
      canvas.width = panel.clientWidth;
      canvas.height = panel.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = -999, mouseY = -999;
    let smoothX = -999, smoothY = -999;
    let inside = false;

    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      inside = true;
      if (dot) {
        dot.style.opacity = '1';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      }
    });
    panel.addEventListener('mouseleave', () => {
      inside = false;
      if (dot) dot.style.opacity = '0';
    });

    function loop() {
      smoothX += (mouseX - smoothX) * 0.12;
      smoothY += (mouseY - smoothY) * 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (inside || Math.abs(smoothX - mouseX) > 1) {
        const grad = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, RADIUS);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,1)');
        grad.addColorStop(0.6, 'rgba(255,255,255,0.75)');
        grad.addColorStop(0.75, 'rgba(255,255,255,0.4)');
        grad.addColorStop(0.88, 'rgba(255,255,255,0.12)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(smoothX, smoothY, RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      const dataUrl = canvas.toDataURL();
      revealLayer.style.maskImage = `url(${dataUrl})`;
      revealLayer.style.webkitMaskImage = `url(${dataUrl})`;
      revealLayer.style.maskSize = '100% 100%';
      revealLayer.style.webkitMaskSize = '100% 100%';

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  setupSpotlight(viewDA);
  setupSpotlight(viewBA);

  // ---- Persona switch: large hero pill shrinks away once scrolled past the active hero ----
  const heroSwitch = document.querySelector('.persona-switch-hero');
  let heroIO = null;
  function watchActiveHero() {
    if (heroIO) heroIO.disconnect();
    const activeView = currentPersona === 'da' ? viewDA : viewBA;
    const heroEl = activeView.querySelector('.hero');
    if (!heroSwitch || !heroEl) return;
    heroIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroSwitch.classList.toggle('is-compact', !entry.isIntersecting);
      });
    }, { threshold: 0.15 });
    heroIO.observe(heroEl);
  }
  watchActiveHero();

  // ---- Persona switch buttons update active/label state ----
  const personaBtnDA = document.getElementById('personaBtnDA');
  const personaBtnBA = document.getElementById('personaBtnBA');
  const personaDockBtn = document.getElementById('personaDockBtn');
  const personaDockLabel = document.getElementById('personaDockLabel');
  const personaDockHint = document.getElementById('personaDockHint');

  function updatePersonaControls() {
    if (personaBtnDA) personaBtnDA.classList.toggle('active', currentPersona === 'da');
    if (personaBtnBA) personaBtnBA.classList.toggle('active', currentPersona === 'ba');
    if (personaDockLabel) personaDockLabel.textContent = currentPersona === 'da' ? 'BA view' : 'DA view';
    if (personaDockHint) personaDockHint.textContent = currentPersona === 'da'
      ? 'Switch to Business Analyst view' : 'Switch to Data Analyst view';
    if (personaDockBtn) personaDockBtn.style.color = currentPersona === 'da' ? 'var(--accent-ba)' : 'var(--accent-da)';
  }
  updatePersonaControls();

  // ---- The switch itself: ripple covers the screen, swaps active view underneath, then reveals ----
  function switchPersona(targetPersona, originX, originY) {
    if (targetPersona === currentPersona) return;

    playRippleTransition(originX, originY, () => {
      // At full coverage: swap which view is active while the screen is covered
      viewDA.classList.toggle('view-active', targetPersona === 'da');
      viewBA.classList.toggle('view-active', targetPersona === 'ba');
      currentPersona = targetPersona;

      // re-wire per-view interactive bits for the newly active view
      const activeView = targetPersona === 'da' ? viewDA : viewBA;
      applyLinks(activeView);
      armReveals(activeView);
      setupTerminal(activeView);
      setupSpotlight(activeView);
      watchActiveHero();
      updatePersonaControls();

      // scroll newly active view to top so the switch always lands on its hero
      window.scrollTo(0, 0);
    });
  }

  if (personaBtnDA) {
    personaBtnDA.addEventListener('click', () => {
      const r = personaBtnDA.getBoundingClientRect();
      switchPersona('da', r.left + r.width / 2, r.top + r.height / 2);
    });
  }
  if (personaBtnBA) {
    personaBtnBA.addEventListener('click', () => {
      const r = personaBtnBA.getBoundingClientRect();
      switchPersona('ba', r.left + r.width / 2, r.top + r.height / 2);
    });
  }
  if (personaDockBtn) {
    personaDockBtn.addEventListener('click', () => {
      const r = personaDockBtn.getBoundingClientRect();
      const target = currentPersona === 'da' ? 'ba' : 'da';
      switchPersona(target, r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  function playRippleTransition(x, y, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'ripple-overlay';
    const circle = document.createElement('div');
    circle.className = 'ripple-circle';

    const maxDist = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) * 2.2;
    circle.style.width = maxDist + 'px';
    circle.style.height = maxDist + 'px';
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    overlay.appendChild(circle);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      circle.classList.add('animate');
    });

    // At full coverage (~420ms into the 700ms grow), swap content while the
    // screen is covered, then fade the whole overlay out shortly after —
    // giving a clean "covered -> swapped -> revealed" beat, no visible cut.
    setTimeout(() => { onComplete(); }, 420);

    setTimeout(() => {
      overlay.style.transition = 'opacity 380ms ease-out';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 400);
    }, 480);
  }

});
