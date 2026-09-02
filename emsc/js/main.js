// Keep --header-height in sync with the sticky header's real rendered
// height, so anchor-link scroll clearance always matches it exactly.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function updateHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }

  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeaderHeight).observe(header);
  }
})();

// Mobile hamburger menu toggle.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  var desktopQuery = window.matchMedia('(min-width: 760px)');

  // Below the mobile breakpoint, the nav is visually collapsed via CSS
  // (grid-template-rows: 0fr) but its links stay in the DOM, so without
  // this they'd still be reachable by keyboard while invisible. `inert`
  // pulls them out of the tab order (and off screen readers) until the
  // menu is actually open. On desktop the nav is always visible, so it
  // must never be inert there regardless of the open/closed state.
  function syncInert() {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    nav.inert = !desktopQuery.matches && !isOpen;
  }

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    syncInert();
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    syncInert();
  }

  syncInert();

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close the menu after choosing a link, and if the viewport is widened
  // past the mobile breakpoint while it's open.
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 760) closeMenu();
    syncInert();
  });
})();

// Animated blob background behind the hero section.
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var blobs = [];
  var tints = [
    'rgba(252,176,49,0.20)',
    'rgba(246,137,48,0.16)',
    'rgba(140,196,140,0.18)',
    'rgba(15,32,21,0.75)'
  ];

  for (var i = 0; i < 11; i++) {
    blobs.push({
      x: Math.random(),
      y: Math.random(),
      r: 160 + Math.random() * 280,
      vx: (Math.random() - 0.5) * 0.0011,
      vy: (Math.random() - 0.5) * 0.0009,
      ph: Math.random() * Math.PI * 2,
      period: 5500 + Math.random() * 5000,
      amp: 0.28 + Math.random() * 0.22,
      aph: Math.random() * Math.PI * 2,
      aPeriod: 6000 + Math.random() * 6000,
      c: tints[i % tints.length]
    });
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  var rafId;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(t) {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -0.25 || b.x > 1.25) b.vx *= -1;
      if (b.y < -0.25 || b.y > 1.25) b.vy *= -1;

      var breathe = 1 + Math.sin(t / b.period + b.ph) * b.amp;
      var fade = 0.75 + Math.sin(t / b.aPeriod + b.aph) * 0.25;
      var cx = b.x * w;
      var cy = b.y * h;
      var r = b.r * breathe;

      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'rgba(34,69,45,0)');

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(draw);
  }

  if (reduceMotion) {
    // Draw a single static frame instead of animating continuously.
    draw(0);
  } else {
    rafId = requestAnimationFrame(draw);
  }
})();

// Fade-and-rise entrance animation for elements marked ".reveal" as they
// scroll into view. Items that share a parent (e.g. the "what to expect"
// or "past events" cards) are staggered slightly.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  items.forEach(function (el) {
    if (el.hasAttribute('data-reveal-delay')) {
      el.style.transitionDelay = el.getAttribute('data-reveal-delay') + 'ms';
      return;
    }
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    var index = siblings.indexOf(el);
    el.style.transitionDelay = (index * 90) + 'ms';
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
})();
// Modal dialogs opened via [data-modal-open="<dialog id>"], e.g. the
// "Get the details" meetup button. Uses the native <dialog> element, so
// Escape-to-close and focus trapping are handled by the browser.
(function () {
  var openTriggers = document.querySelectorAll('[data-modal-open]');
  if (!openTriggers.length) return;

  openTriggers.forEach(function (trigger) {
    var modal = document.getElementById(trigger.getAttribute('data-modal-open'));
    if (!modal || typeof modal.showModal !== 'function') return;

    trigger.addEventListener('click', function () {
      modal.showModal();
    });

    modal.querySelectorAll('[data-modal-close]').forEach(function (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.close();
      });
    });

    // A click that lands on the <dialog> element itself (rather than on
    // .meetup-modal__inner) means the user clicked the backdrop.
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        modal.close();
      }
    });
  });
})();
