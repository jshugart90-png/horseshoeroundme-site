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

  var form = document.getElementById('formCard');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var emailEl = document.getElementById('email');
      var email = emailEl.value.trim();
      var err = document.getElementById('formError');
      if (err) err.classList.remove('show');
      if (!email || email.indexOf('@') < 1) {
        emailEl.focus();
        emailEl.style.borderColor = 'var(--gold-bright)';
        return;
      }
      emailEl.style.borderColor = '';
      var btn = document.getElementById('signupBtn');
      if (btn) btn.disabled = true;
      var data = new URLSearchParams(new FormData(form)).toString();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          var ok = document.getElementById('successCard');
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
})();
