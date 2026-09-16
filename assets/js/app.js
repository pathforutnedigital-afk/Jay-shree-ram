/* ==========================================================================
   app.js  —  सामायिक स्क्रिप्ट (हेडर, फूटर, नेव्हिगेशन, अ‍ॅनिमेशन, लाइटबॉक्स)
   ========================================================================== */

(function () {
  'use strict';

  var S = window.DB ? DB.settings() : {};
  var PATH = location.pathname.split('/').pop() || 'index.html';

  /* ---------- सुरक्षित मजकूर ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  window.esc = esc;

  var UTSAV = [
    ['ganeshotsav.html', 'गणेशोत्सव'],
    ['navratri.html', 'नवरात्रोत्सव'],
    ['dahihandi.html', 'दहीहंडी'],
    ['other-festivals.html', 'इतर उत्सव']
  ];
  var GALLERY = [
    ['gallery.html', 'फोटो गॅलरी'],
    ['videos.html', 'व्हिडिओ गॅलरी']
  ];
  var UPAKRAM = [
    ['social.html', 'सामाजिक उपक्रम'],
    ['sports.html', 'खेळ व स्पर्धा'],
    ['mankari.html', 'आरतीचे मानकरी'],
    ['events.html', 'आगामी कार्यक्रम']
  ];

  function isOn(files) {
    for (var i = 0; i < files.length; i++) if (files[i][0] === PATH) return true;
    return false;
  }
  function dd(id, label, items) {
    var h = '<div class="has-drop"><button class="navbtn' + (isOn(items) ? ' active' : '') +
      '" aria-haspopup="true" aria-expanded="false">' + label +
      ' <i class="fa-solid fa-chevron-down caret"></i></button><div class="drop">';
    for (var i = 0; i < items.length; i++) {
      h += '<a href="' + items[i][0] + '"' + (items[i][0] === PATH ? ' class="active"' : '') + '>' + items[i][1] + '</a>';
    }
    return h + '</div></div>';
  }
  function mlist(items, cls) {
    var h = '';
    for (var i = 0; i < items.length; i++) h += '<a class="' + (cls || '') + '" href="' + items[i][0] + '">' + items[i][1] + '</a>';
    return h;
  }
  function a(href, label) {
    return '<a href="' + href + '"' + (href === PATH ? ' class="active"' : '') + '>' + label + '</a>';
  }

  /* ---------- हेडर ---------- */
  function header() {
    var el = document.getElementById('site-header');
    if (!el) return;
    el.className = 'site-header';
    el.innerHTML =
      '<div class="wrap hdr">' +
        '<a class="brand" href="index.html" aria-label="मुखपृष्ठ">' +
          '<img src="assets/img/logo.png" alt="जय श्री राम मित्र मंडळ लोगो" width="46" height="46">' +
          '<span><b>॥ जय श्री राम मित्र मंडळ ॥</b><small>परंपरा • संस्कृती • एकता • सेवा</small></span>' +
        '</a>' +
        '<nav class="nav" aria-label="मुख्य नेव्हिगेशन">' +
          a('index.html', 'मुखपृष्ठ') +
          a('about.html', 'आमच्याविषयी') +
          dd('u', 'उत्सव', UTSAV) +
          dd('g', 'गॅलरी', GALLERY) +
          dd('k', 'उपक्रम', UPAKRAM) +
          a('team.html', 'आमची टीम') +
          a('contact.html', 'संपर्क') +
        '</nav>' +
        '<a class="btn btn-primary btn-sm" href="ganeshotsav.html"><i class="fa-solid fa-om"></i> आमचे उत्सव पाहा</a>' +
        '<button class="burger" id="burger" aria-label="मेनू उघडा" aria-expanded="false">' +
          '<span></span><span></span><span></span></button>' +
      '</div>' +
      '<div class="mnav wrap" id="mnav">' +
        mlist([['index.html', 'मुखपृष्ठ'], ['about.html', 'आमच्याविषयी']]) +
        '<a href="#" style="pointer-events:none;color:var(--orange-deep)">उत्सव</a>' +
        '<div class="sub">' + mlist(UTSAV) + '</div>' +
        '<a href="#" style="pointer-events:none;color:var(--orange-deep)">गॅलरी</a>' +
        '<div class="sub">' + mlist(GALLERY) + '</div>' +
        '<a href="#" style="pointer-events:none;color:var(--orange-deep)">उपक्रम</a>' +
        '<div class="sub">' + mlist(UPAKRAM) + '</div>' +
        mlist([['team.html', 'आमची टीम'], ['contact.html', 'संपर्क']]) +
        '<a class="btn btn-primary btn-block" href="ganeshotsav.html">आमचे उत्सव पाहा</a>' +
      '</div>';

    var b = document.getElementById('burger'), m = document.getElementById('mnav');
    b.addEventListener('click', function () {
      var open = m.classList.toggle('show');
      b.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'मेनू बंद करा' : 'मेनू उघडा');
    });
    window.addEventListener('scroll', function () {
      el.classList.toggle('stuck', window.scrollY > 8);
    }, { passive: true });
  }

  /* ---------- फूटर ---------- */
  function footer() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.className = 'site-footer';
    el.innerHTML =
      '<div class="wrap"><div class="fgrid">' +
        '<div>' +
          '<div class="fbrand"><img src="assets/img/logo.png" alt="" width="56" height="56">' +
          '<span><b>॥ जय श्री राम मित्र मंडळ ॥</b><small>परंपरा • संस्कृती • एकता • सेवा</small></span></div>' +
          '<p style="font-size:.95rem">विविध धार्मिक, सांस्कृतिक, सामाजिक आणि मनोरंजनात्मक उपक्रमांच्या माध्यमातून एकता, संस्कृती आणि बंधुभाव जपणारे आपले मंडळ.</p>' +
          '<div class="fsocial">' +
            '<a href="' + esc(S.facebook || '#') + '" aria-label="Facebook" target="_blank" rel="noopener"><i class="fa-brands fa-facebook-f"></i></a>' +
            '<a href="' + esc(S.instagram || '#') + '" aria-label="Instagram" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>' +
            '<a href="' + esc(S.youtube || '#') + '" aria-label="YouTube" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i></a>' +
            '<a href="https://wa.me/' + esc(S.whatsapp || '') + '" aria-label="WhatsApp" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i></a>' +
          '</div>' +
        '</div>' +
        '<div><h5>दुवे</h5><ul class="flinks">' +
          '<li><a href="index.html">मुखपृष्ठ</a></li>' +
          '<li><a href="about.html">आमच्याविषयी</a></li>' +
          '<li><a href="ganeshotsav.html">उत्सव</a></li>' +
          '<li><a href="gallery.html">गॅलरी</a></li>' +
          '<li><a href="social.html">उपक्रम</a></li>' +
          '<li><a href="contact.html">संपर्क</a></li>' +
        '</ul></div>' +
        '<div><h5>उत्सव</h5><ul class="flinks">' +
          '<li><a href="ganeshotsav.html">गणेशोत्सव</a></li>' +
          '<li><a href="navratri.html">नवरात्रोत्सव</a></li>' +
          '<li><a href="dahihandi.html">दहीहंडी</a></li>' +
          '<li><a href="other-festivals.html">इतर उत्सव</a></li>' +
          '<li><a href="mankari.html">आरतीचे मानकरी</a></li>' +
          '<li><a href="events.html">आगामी कार्यक्रम</a></li>' +
        '</ul></div>' +
        '<div><h5>संपर्क</h5><ul class="flinks">' +
          '<li><i class="fa-solid fa-location-dot"></i> ' + esc(S.address || '') + '</li>' +
          '<li><i class="fa-solid fa-phone"></i> <a href="tel:' + esc(S.phone || '') + '">' + esc(S.phone || '') + '</a></li>' +
          '<li><i class="fa-solid fa-envelope"></i> <a href="mailto:' + esc(S.email || '') + '">' + esc(S.email || '') + '</a></li>' +
        '</ul></div>' +
      '</div></div>' +
      '<div class="fbar wrap"><span>© 2026 जय श्री राम मित्र मंडळ. सर्व हक्क राखीव.</span>' +
      '<span><a href="admin.html">प्रशासक लॉगिन</a></span></div>';

    /* WhatsApp बटण */
    if (!document.querySelector('.wa') && S.whatsapp) {
      var w = document.createElement('a');
      w.className = 'wa';
      w.href = 'https://wa.me/' + S.whatsapp;
      w.target = '_blank';
      w.rel = 'noopener';
      w.setAttribute('aria-label', 'WhatsApp वर संपर्क साधा');
      w.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
      document.body.appendChild(w);
    }
  }

  /* ---------- स्क्रोल रिव्हील ---------- */
  function reveal() {
    var nodes = document.querySelectorAll('.rv');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, idx) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.dataset.delay || (idx * 70), 10);
          setTimeout(function () { e.target.classList.add('in'); }, d);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
  }

  /* ---------- लाइटबॉक्स ---------- */
  var LB = { items: [], i: 0, el: null };

  function buildLB() {
    if (LB.el) return LB.el;
    var d = document.createElement('div');
    d.className = 'lightbox';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'फोटो');
    d.innerHTML =
      '<button class="lb-btn lb-close" aria-label="बंद करा"><i class="fa-solid fa-xmark"></i></button>' +
      '<button class="lb-btn lb-prev" aria-label="मागील"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<button class="lb-btn lb-next" aria-label="पुढील"><i class="fa-solid fa-chevron-right"></i></button>' +
      '<div><img alt=""><p class="lb-cap"></p></div>';
    document.body.appendChild(d);
    d.querySelector('.lb-close').onclick = closeLB;
    d.querySelector('.lb-prev').onclick = function (e) { e.stopPropagation(); step(-1); };
    d.querySelector('.lb-next').onclick = function (e) { e.stopPropagation(); step(1); };
    d.addEventListener('click', function (e) { if (e.target === d) closeLB(); });

    /* मोबाइल स्वाइप */
    var x0 = null;
    d.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    d.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
      x0 = null;
    });
    LB.el = d;
    return d;
  }
  function render() {
    var it = LB.items[LB.i];
    if (!it) return;
    LB.el.querySelector('img').src = it.url;
    LB.el.querySelector('img').alt = it.title || 'फोटो';
    LB.el.querySelector('.lb-cap').textContent = (it.title || '') + (it.album ? ' — ' + it.album : '');
  }
  function step(n) {
    LB.i = (LB.i + n + LB.items.length) % LB.items.length;
    render();
  }
  function closeLB() {
    if (LB.el) LB.el.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openLightbox = function (items, index) {
    LB.items = items; LB.i = index || 0;
    buildLB().classList.add('open');
    document.body.style.overflow = 'hidden';
    render();
  };
  document.addEventListener('keydown', function (e) {
    if (!LB.el || !LB.el.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------- साहाय्यक: कार्ड टेम्पलेट्स ---------- */
  window.T = {
    festivalCard: function (f) {
      return '<a class="fcard rv" href="' + esc(f.page || '#') + '" style="--bg:url(' + esc(f.image) + ')">' +
        '<style></style>' +
        '<h3>' + esc(f.name) + '</h3><p>' + esc(f.desc) + '</p>' +
        '<span class="link">अधिक पाहा <i class="fa-solid fa-arrow-right"></i></span></a>';
    },
    empty: function (title, msg, icon) {
      return '<div class="empty"><i class="fa-solid ' + (icon || 'fa-inbox') + '"></i>' +
        '<b>' + esc(title) + '</b><span>' + esc(msg) + '</span></div>';
    }
  };

  /* fcard पार्श्वभूमी लागू करणे (::before साठी inline style वापरता येत नाही) */
  window.applyCardBg = function (root) {
    var nodes = (root || document).querySelectorAll('[data-bg]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], u = n.getAttribute('data-bg');
      var id = 'bg' + Math.random().toString(36).slice(2, 8);
      n.setAttribute('data-bgid', id);
      var st = document.createElement('style');
      st.textContent = '[data-bgid="' + id + '"]::before{background-image:url("' + u.replace(/"/g, '\\"') + '")}';
      document.head.appendChild(st);
      n.removeAttribute('data-bg');
    }
  };

  /* ---------- स्थिर वर्षे ---------- */
  window.yearsOf = function (rows, key) {
    var set = {}, out = [], i;
    for (i = 0; i < rows.length; i++) { var y = rows[i][key || 'year']; if (y) set[y] = 1; }
    for (var k in set) out.push(parseInt(k, 10));
    return out.sort(function (a, b) { return b - a; });
  };

  /* पानाच्या स्वतःच्या स्क्रिप्टने render केल्यावर पुन्हा चालवता यावे.
     हे DOMContentLoaded पूर्वीही उपलब्ध असावे लागते. */
  window.refreshUI = function () { reveal(); applyCardBg(document); };

  /* ---------- सुरुवात ---------- */
  function init() {
    header();
    footer();
    reveal();
    applyCardBg(document);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
