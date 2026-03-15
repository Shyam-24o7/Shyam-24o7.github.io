(function () {
  'use strict';

  /* ── Light / Dark mode toggle ───────────────────────────── */
  var html      = document.documentElement;
  var themeBtn  = document.getElementById('theme-toggle');
  var themeIcon = themeBtn ? themeBtn.querySelector('.theme-icon') : null;

  // 🌙 = currently dark mode  |  ☀ = currently light mode
  function setIcon(isLight) {
    if (themeIcon) themeIcon.textContent = isLight ? '☀' : '🌙';
  }

  // Restore saved preference on load
  var saved = localStorage.getItem('theme');
  if (saved === 'light') {
    html.classList.add('light');
    setIcon(true);
  } else {
    setIcon(false);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isLight = html.classList.toggle('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      setIcon(isLight);
    });
  }

  /* ── Mobile nav toggle ───────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var nav    = document.querySelector('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Scroll progress bar + header shadow + scroll-to-top ─── */
  var progressBar = document.getElementById('scroll-progress');
  var header      = document.querySelector('.site-header');
  var scrollTopBtn = document.getElementById('scroll-top');

  function onScroll() {
    var sy       = window.scrollY;
    var docH     = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docH > 0) {
      progressBar.style.width = ((sy / docH) * 100).toFixed(2) + '%';
    }
    if (header) {
      header.classList.toggle('scrolled', sy > 8);
    }
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', sy > 400);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Code block language badge ───────────────────────────── */
  document.querySelectorAll('.highlight').forEach(function (block) {
    var cls   = block.className || '';
    var match = cls.match(/\blang-(\S+)/) ||
                cls.match(/\b(javascript|typescript|python|bash|shell|cpp|c|java|rust|go|html|css|json|yaml|sql|r|markdown|matlab)\b/i);
    if (match) block.setAttribute('data-lang', match[1].toLowerCase());
  });

  /* ── Scroll reveal ───────────────────────────────────────── */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal],[data-reveal-right]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

    document.querySelectorAll(
      '.post-item, .archive-post-item, .hero'
    ).forEach(function (el) {
      el.setAttribute('data-reveal', '');
      obs.observe(el);
    });

    document.querySelectorAll('.sidebar-section').forEach(function (el) {
      el.setAttribute('data-reveal-right', '');
      obs.observe(el);
    });
  }

  /* ── Search overlay ──────────────────────────────────────── */
  var searchBtn     = document.getElementById('search-btn');
  var searchOverlay = document.getElementById('search-overlay');
  var searchClose   = document.getElementById('search-close');
  var searchInput   = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    if (searchInput) { searchInput.value = ''; searchInput.focus(); }
    if (searchResults) searchResults.innerHTML = '<p class="search-hint">Start typing to search &nbsp;·&nbsp; <kbd>Esc</kbd> to close</p>';
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');
  }

  function highlight(text, query) {
    if (!query) return text;
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function doSearch(query) {
    var idx = window.__searchIndex;
    if (!idx || !searchResults) return;
    query = query.trim();
    if (!query) {
      searchResults.innerHTML = '<p class="search-hint">Start typing to search &nbsp;·&nbsp; <kbd>Esc</kbd> to close</p>';
      return;
    }
    var q = query.toLowerCase();
    var hits = idx.filter(function(post) {
      return post.title.toLowerCase().indexOf(q) > -1 ||
             post.excerpt.toLowerCase().indexOf(q) > -1 ||
             post.tags.some(function(t) { return t.toLowerCase().indexOf(q) > -1; });
    });
    if (!hits.length) {
      searchResults.innerHTML = '<p class="search-no-results">No results for "<strong>' +
        query.replace(/</g, '&lt;') + '</strong>"</p>';
      return;
    }
    searchResults.innerHTML = hits.slice(0, 12).map(function(post) {
      var tagsHtml = post.tags.length
        ? post.tags.map(function(t) { return '<span class="tag-pill" style="font-size:0.63rem;padding:0.08rem 0.45rem;">' + t + '</span>'; }).join(' ')
        : '';
      return '<a class="search-result-item" href="' + post.path + '">' +
        '<div class="search-result-title">' + highlight(post.title, query) + '</div>' +
        '<div class="search-result-meta">' + post.date + (tagsHtml ? ' &nbsp;·&nbsp; ' + tagsHtml : '') + '</div>' +
        '<div class="search-result-excerpt">' + highlight(post.excerpt, query) + '</div>' +
        '</a>';
    }).join('');
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchInput) {
    searchInput.addEventListener('input', function() { doSearch(this.value); });
  }

  // Click outside modal to close
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // Keyboard: Ctrl+K opens, Esc closes
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchOverlay && searchOverlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });

  /* ── Typewriter (home page hero only) ────────────────────── */
  var typingEl = document.querySelector('.hero-typing');
  if (typingEl) {
    var phrases = [
      'Hardware Acceleration',
      'Computer Architecture',
      'GPU Computing',
      'FPGA Design',
      'Quantum Computing',
      'Mathematics'
    ];
    var pi = 0, ci = 0, deleting = false;

    function tick() {
      var phrase = phrases[pi];
      if (!deleting) {
        typingEl.textContent = phrase.slice(0, ci + 1);
        ci++;
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 75);
      } else {
        typingEl.textContent = phrase.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 350);
          return;
        }
        setTimeout(tick, 38);
      }
    }
    setTimeout(tick, 600);
  }

  /* ── Hover scrollbar ─────────────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    var sbW = window.innerWidth - document.documentElement.clientWidth;
    if (!sbW) return;
    // cursor is literally over the scrollbar track
    if (window.innerWidth - e.clientX <= sbW) {
      html.classList.add('scrollbar-near');
    } else {
      html.classList.remove('scrollbar-near');
    }
  });

})();
