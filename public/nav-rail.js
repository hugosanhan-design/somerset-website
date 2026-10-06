/* Somerset rail behaviour — one implementation for every page on the site.
   Loaded by the Next layout AND by the standalone HTML pages, so the rail
   behaves identically whether the page came from React or from a generator.

   Progressive enhancement: without this file the rail is open, navigable and
   fully functional. Nothing here is required to use the site.

   Cookies rather than localStorage, deliberately: Next reads slc_nav on the
   server and renders the rail at the right width in the FIRST paint. With
   localStorage every returning visitor would see it open for a frame, then snap
   shut. All four are functional preferences, set only by the visitor's own
   action. */
(function () {
  var shell = document.querySelector('.sl-shell');
  if (!shell) return;

  var rail = shell.querySelector('.sl-rail');
  var toggle = shell.querySelector('.sl-toggle');
  var burger = shell.querySelector('.sl-burger');
  var scrim = shell.querySelector('.sl-scrim');
  var hint = shell.querySelector('.sl-hint');
  var hintX = hint && hint.querySelector('.sl-x');
  var BREAK = parseInt(shell.getAttribute('data-breakpoint') || '900', 10);
  var timer = null;

  function setCookie(k, v) {
    try {
      document.cookie = k + '=' + encodeURIComponent(v) +
        ';path=/;max-age=31536000;samesite=lax' +
        (location.protocol === 'https:' ? ';secure' : '');
    } catch (e) {}
  }
  function getCookie(k) {
    try {
      var m = document.cookie.match('(^|;)\\s*' + k + '\\s*=\\s*([^;]+)');
      return m ? decodeURIComponent(m[2]) : null;
    } catch (e) { return null; }
  }

  function hideHint(persist) {
    if (!hint) return;
    hint.classList.remove('sl-show');
    if (toggle) toggle.classList.remove('sl-pulse');
    if (timer) { clearTimeout(timer); timer = null; }
    if (persist) setCookie('slc_navhint', '1');
  }

  function setCollapsed(c) {
    shell.classList.toggle('sl-collapsed', c);
    if (toggle) {
      toggle.setAttribute('aria-expanded', c ? 'false' : 'true');
      toggle.setAttribute('aria-label', c ? 'Expand navigation' : 'Collapse navigation');
    }
    setCookie('slc_nav', c ? 'collapsed' : 'open');
  }

  /* Default collapsed: the rail is the free-content shelf, four icons wide.
     Only an explicit "open" widens it. */
  setCollapsed(getCookie('slc_nav') !== 'open');

  if (toggle) {
    toggle.addEventListener('click', function () {
      hideHint(true);
      setCollapsed(!shell.classList.contains('sl-collapsed'));
    });
  }
  if (hintX) hintX.addEventListener('click', function () { hideHint(true); });

  /* Visit 1 sees nothing but the site. The nudge waits for visit 2, sits next
     to the control it describes, and never returns once seen or dismissed. */
  function maybeHint() {
    var visits = parseInt(getCookie('slc_visits') || '0', 10) + 1;
    setCookie('slc_visits', String(Math.min(visits, 9)));
    if (!hint) return;
    if (visits < 2) return;
    if (getCookie('slc_navhint') === '1') return;
    if (shell.classList.contains('sl-narrow')) return;
    timer = setTimeout(function () {
      hint.classList.add('sl-show');
      if (toggle) toggle.classList.add('sl-pulse');
      timer = setTimeout(function () { hideHint(true); }, 9000);
    }, 1400);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { shell.classList.remove('sl-open'); return; }
    var t = e.target || {};
    var tag = (t.tagName || '').toUpperCase();
    if (e.key === '[' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !t.isContentEditable) {
      if (shell.classList.contains('sl-narrow')) return;
      e.preventDefault();
      hideHint(true);
      setCollapsed(!shell.classList.contains('sl-collapsed'));
    }
  });

  if (burger) burger.addEventListener('click', function () { shell.classList.add('sl-open'); });
  if (scrim) scrim.addEventListener('click', function () { shell.classList.remove('sl-open'); });
  if (rail) {
    rail.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) shell.classList.remove('sl-open');
    });
  }

  /* Active link is applied here, not on the server, so every route can stay
     static and the shell needs no pathname. Longest matching href wins, so
     /student/progress beats /student. */
  function markActive() {
    if (!rail) return;
    var here = location.pathname.replace(/\/+$/, "") || "/";
    var best = null, bestLen = -1;
    rail.querySelectorAll("a[href]").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("#")[0].replace(/\/+$/, "");
      if (!href || href.charAt(0) !== "/") return;
      if (href === "/") return;
      if (here === href || here.indexOf(href + "/") === 0) {
        if (href.length > bestLen) { best = a; bestLen = href.length; }
      }
    });
    if (best && best.classList.contains("sl-item")) {
      best.classList.add("sl-active");
      best.setAttribute("aria-current", "page");
    }
  }

  function measure() {
    var narrow = window.innerWidth < BREAK;
    shell.classList.toggle('sl-narrow', narrow);
    if (!narrow) shell.classList.remove('sl-open');
  }
  measure();
  window.addEventListener('resize', measure);

  markActive();
  maybeHint();
})();
