(function () {
  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.textContent = 'Menu';
  }
  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    toggle.textContent = 'Close';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) closeNav();
      else openNav();
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = document.getElementById('contactError');
      var btn = document.getElementById('contactBtn');
      if (err) err.classList.remove('show');
      if (btn) btn.disabled = true;
      var data = new URLSearchParams(new FormData(contactForm)).toString();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      }).then(function (res) {
        if (res.ok) {
          contactForm.style.display = 'none';
          var ok = document.getElementById('contactSuccess');
          if (ok) ok.classList.add('show');
        } else {
          if (err) { err.textContent = "Didn't go through — try again."; err.classList.add('show'); }
          if (btn) btn.disabled = false;
        }
      }).catch(function () {
        if (err) { err.textContent = "Didn't go through — try again."; err.classList.add('show'); }
        if (btn) btn.disabled = false;
      });
    });
  }

  var directory = document.getElementById('resDirectory');
  var tabsEl = document.getElementById('resTabs');
  var searchEl = document.getElementById('resSearch');
  var categories = [];
  var activeCat = 'all';

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderTabs() {
    if (!tabsEl) return;
    var html = '<button type="button" class="res-tab is-active" role="tab" aria-selected="true" data-cat="all">All</button>';
    categories.forEach(function (c) {
      html += '<button type="button" class="res-tab" role="tab" aria-selected="false" data-cat="' + c.id + '">' + escapeHtml(c.title) + '</button>';
    });
    tabsEl.innerHTML = html;
    tabsEl.querySelectorAll('.res-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCat = btn.getAttribute('data-cat');
        tabsEl.querySelectorAll('.res-tab').forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        renderDirectory();
      });
    });
  }

  function renderDirectory() {
    if (!directory) return;
    var q = (searchEl && searchEl.value || '').trim().toLowerCase();
    var html = '';
    var shown = 0;
    categories.forEach(function (cat) {
      if (activeCat !== 'all' && cat.id !== activeCat) return;
      var items = cat.items.filter(function (item) {
        if (!q) return true;
        var hay = (item.name + ' ' + item.description).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      if (!items.length) return;
      html += '<div class="res-cat" id="cat-' + escapeHtml(cat.id) + '">';
      html += '<h3 class="res-cat-title">' + escapeHtml(cat.title) + ' <span class="res-count">' + items.length + '</span></h3>';
      html += '<ul class="res-list">';
      items.forEach(function (item) {
        shown++;
        html += '<li class="res-item">';
        html += '<a class="res-name" href="' + escapeHtml(item.url) + '" rel="noopener noreferrer" target="_blank">' + escapeHtml(item.name) + ' <span aria-hidden="true">↗</span></a>';
        html += '<p class="res-desc">' + escapeHtml(item.description) + '</p>';
        html += '</li>';
      });
      html += '</ul></div>';
    });
    if (!html) {
      html = '<p class="res-empty">No matches. Try a different search or category.</p>';
    } else if (q || activeCat !== 'all') {
      html = '<p class="res-meta">' + shown + ' resource' + (shown === 1 ? '' : 's') + '</p>' + html;
    }
    directory.innerHTML = html;
  }

  function showFallback() {
    if (!directory) return;
    directory.innerHTML =
      '<div class="res-fallback">' +
      '<h3>Crisis &amp; essential links</h3>' +
      '<ul>' +
      '<li><a href="https://www.veteranscrisisline.net/" rel="noopener noreferrer" target="_blank">Veterans Crisis Line</a> — Dial 988 then 1, or text 838255.</li>' +
      '<li><a href="https://www.va.gov/" rel="noopener noreferrer" target="_blank">U.S. Department of Veterans Affairs (VA.gov)</a></li>' +
      '<li><a href="https://www.militaryonesource.mil/" rel="noopener noreferrer" target="_blank">Military OneSource</a></li>' +
      '<li><a href="https://www.va.gov/homeless/nationalcallcenter.asp" rel="noopener noreferrer" target="_blank">National Call Center for Homeless Veterans</a> — 877-424-3838.</li>' +
      '</ul>' +
      '<p>Full directory temporarily unavailable. Refresh to try again.</p>' +
      '</div>';
  }

  if (directory) {
    fetch('/resources.json')
      .then(function (r) { if (!r.ok) throw new Error('bad status'); return r.json(); })
      .then(function (data) {
        categories = data.categories || [];
        renderTabs();
        renderDirectory();
      })
      .catch(showFallback);

    if (searchEl) {
      var t;
      searchEl.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(renderDirectory, 120);
      });
    }
  }

  function watchBeehiivMounts() {
    var mounts = document.querySelectorAll('[data-beehiiv-mount]');
    if (!mounts.length) return;
    function mountLooksLive(el) {
      if (el.querySelector('input[type="email"]')) return true;
      var iframe = el.querySelector('iframe');
      if (!iframe) return false;
      var nodes = el.querySelectorAll('div');
      for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i].querySelector('iframe')) continue;
        if (nodes[i].getBoundingClientRect().height > 40) return true;
      }
      return iframe.getBoundingClientRect().height > 40;
    }
    function markReady(el) {
      if (!mountLooksLive(el)) return false;
      el.classList.add('beehiiv-ready');
      return true;
    }
    mounts.forEach(function (mount) {
      if (markReady(mount)) return;
      var obs = new MutationObserver(function () {
        if (markReady(mount)) obs.disconnect();
      });
      obs.observe(mount, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
      var tries = 0;
      var timer = setInterval(function () {
        tries += 1;
        if (markReady(mount) || tries > 40) clearInterval(timer);
      }, 500);
    });
  }
  watchBeehiivMounts();

  function renderVideoRows() {
    var mounts = document.querySelectorAll('[data-video-row]');
    if (!mounts.length) return;
    fetch('/videos.json')
      .then(function (r) { if (!r.ok) throw new Error('bad status'); return r.json(); })
      .then(function (data) {
        var videos = data.videos || [];
        if (!videos.length) return;
        mounts.forEach(function (mount) {
          var html = '';
          videos.forEach(function (v) {
            var href = escapeHtml(v.url || ('https://www.youtube.com/shorts/' + v.id));
            var thumb = escapeHtml(v.thumb || ('/assets/watch/' + v.id + '.jpg'));
            var title = escapeHtml(v.title || 'YouTube short');
            html += '<a class="video-card" href="' + href + '" rel="noopener noreferrer" target="_blank">';
            html += '<img src="' + thumb + '" alt="' + title + '" width="480" height="270" loading="lazy">';
            html += '<span class="vcap">' + title + ' ↗</span>';
            html += '</a>';
          });
          mount.innerHTML = html;
        });
      })
      .catch(function () { /* leave any server-rendered fallback */ });
  }
  renderVideoRows();

  function initSignupPopup() {
    var path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    var skip = { '/privacy': 1, '/terms': 1, '/shipping': 1, '/privacy.html': 1, '/terms.html': 1, '/shipping.html': 1 };
    if (skip[path]) return;

    var STORAGE_KEY = 'hsrm_signup_popup';
    var DELAY_MS = 6000;
    var RESHOW_MS = 10 * 24 * 60 * 60 * 1000; // 10 days (within 7–14)

    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var prev = JSON.parse(raw);
        if (prev && prev.ts && (Date.now() - prev.ts) < RESHOW_MS) return;
      }
    } catch (e) { /* private mode etc. */ }

    var FORM_ID = '03407fcf-b522-4ce4-8583-16a8f3747dad';

    function markDismissed() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() })); } catch (e) {}
    }

    function closePopup(overlay) {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('signup-popup-open');
      markDismissed();
    }


    function openPopup() {
      if (document.getElementById('signupPopup')) return;

      var overlay = document.createElement('div');
      overlay.id = 'signupPopup';
      overlay.className = 'signup-popup';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'signupPopupTitle');
      overlay.setAttribute('aria-hidden', 'true');
      // Copy is short brand-voice placeholder — flag for script bay polish.
      overlay.innerHTML =
        '<div class="signup-popup-backdrop" data-signup-dismiss></div>' +
        '<div class="signup-popup-panel">' +
          '<button type="button" class="signup-popup-close" aria-label="Close" data-signup-dismiss>&times;</button>' +
          '<span class="eyebrow">Free download when you subscribe</span>' +
          '<h2 id="signupPopupTitle">Gather Round Starter Pack</h2>' +
          '<p class="signup-popup-lead">PL Survival Card, Barracks Leadership One-Pagers, and a Counseling Joke Template — free when you subscribe. Confirm your email and we send the pack. Weekly newsletter after that. No spam, no exit survey.</p>' +
          '<div class="form signup-popup-form" data-beehiiv-mount data-signup-popup-mount>' +
            '<p class="beehiiv-fallback"><a class="btn btn-primary" href="https://horseshoeroundme.beehiiv.com/?modal=signup">Sign me up</a></p>' +
            '<p class="fineprint">Unsubscribe anytime.</p>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);
      document.body.classList.add('signup-popup-open');

      var mount = overlay.querySelector('[data-signup-popup-mount]');
      // Scripts must be createElement'd — innerHTML script tags do not execute.
      var loader = document.createElement('script');
      loader.async = true;
      loader.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
      loader.setAttribute('data-beehiiv-form', FORM_ID);
      mount.insertBefore(loader, mount.firstChild);
      var attr = document.createElement('script');
      attr.async = true;
      attr.src = 'https://subscribe-forms.beehiiv.com/attribution.js';
      mount.insertBefore(attr, loader.nextSibling);

      watchBeehiivMounts();

      requestAnimationFrame(function () {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        var closeBtn = overlay.querySelector('.signup-popup-close');
        if (closeBtn) closeBtn.focus();
      });

      overlay.addEventListener('click', function (e) {
        if (e.target && e.target.hasAttribute('data-signup-dismiss')) closePopup(overlay);
      });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key !== 'Escape') return;
        if (!overlay.classList.contains('is-open')) return;
        closePopup(overlay);
        document.removeEventListener('keydown', onKey);
      });
    }

    setTimeout(openPopup, DELAY_MS);
  }
  initSignupPopup();

})();
