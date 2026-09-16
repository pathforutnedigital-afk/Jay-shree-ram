/* ==========================================================================
   admin.js  —  प्रशासक पॅनेल
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ====================== लॉगिन ====================== */
  function showLogin() {
    $('loginView').style.display = 'grid';
    $('adminView').hidden = true;
  }
  function showAdmin() {
    $('loginView').style.display = 'none';
    $('adminView').hidden = false;
    route('dash');
  }

  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = DB.login($('le').value, $('lp').value);
    $('loginErr').classList.toggle('show', !ok);
    if (ok) { $('loginErr').classList.remove('show'); showAdmin(); }
    else { $('lp').value = ''; $('lp').focus(); }
  });

  $('logout').addEventListener('click', function (e) {
    e.preventDefault();
    DB.logout();
    location.reload();
  });

  $('mburger').addEventListener('click', function () { $('aside').classList.toggle('show'); });

  /* ====================== मोडल ====================== */
  var M = { fields: [], onSave: null };

  function closeModal() { $('modal').classList.remove('open'); }
  $('mX').onclick = closeModal;
  $('mCancel').onclick = closeModal;
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /**
   * fields: [{k:'name', l:'नाव', t:'text|textarea|date|number|select|image|url', opts:[], req:true}]
   */
  function openModal(title, fields, row, onSave) {
    M.fields = fields; M.onSave = onSave;
    $('mTitle').textContent = title;
    var f = $('mForm');
    f.innerHTML = fields.map(function (fd) {
      var v = row && row[fd.k] != null ? row[fd.k] : (fd.def || '');
      var id = 'fld_' + fd.k;
      var input;
      if (fd.t === 'textarea') {
        input = '<textarea id="' + id + '">' + esc(v) + '</textarea>';
      } else if (fd.t === 'select') {
        input = '<select id="' + id + '">' + fd.opts.map(function (o) {
          return '<option value="' + esc(o) + '"' + (String(o) === String(v) ? ' selected' : '') + '>' + esc(o) + '</option>';
        }).join('') + '</select>';
      } else if (fd.t === 'image') {
        input = '<input id="' + id + '" type="hidden" value="' + esc(v) + '">' +
          '<input type="file" accept="image/*" data-for="' + id + '">' +
          '<img class="imgprev' + (v ? ' show' : '') + '" id="prev_' + fd.k + '" src="' + esc(v) + '" alt="">' +
          '<p class="note" style="margin-top:6px">फोटो निवडा किंवा रिकामे ठेवल्यास आपोआप प्लेसहोल्डर वापरला जाईल.</p>';
      } else {
        input = '<input id="' + id + '" type="' + (fd.t || 'text') + '" value="' + esc(v) + '" placeholder="' + esc(fd.ph || '') + '">';
      }
      return '<div class="field" data-k="' + fd.k + '"><label for="' + id + '">' + esc(fd.l) +
        (fd.req ? ' *' : '') + '</label>' + input +
        '<span class="err">हे क्षेत्र आवश्यक आहे.</span></div>';
    }).join('');

    /* प्रतिमा अपलोड */
    [].forEach.call(f.querySelectorAll('input[type=file]'), function (inp) {
      inp.addEventListener('change', function () {
        var file = inp.files && inp.files[0];
        if (!file) return;
        if (file.size > 2.5 * 1024 * 1024) { toast('फोटो २.५ MB पेक्षा लहान असावा'); inp.value = ''; return; }
        var r = new FileReader();
        r.onload = function () {
          $(inp.dataset.for).value = r.result;
          var p = f.querySelector('#prev_' + inp.dataset.for.replace('fld_', ''));
          if (p) { p.src = r.result; p.classList.add('show'); }
        };
        r.readAsDataURL(file);
      });
    });

    $('modal').classList.add('open');
    var first = f.querySelector('input:not([type=hidden]):not([type=file]),textarea,select');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  $('mSave').onclick = function () {
    var out = {}, bad = false;
    M.fields.forEach(function (fd) {
      var el = $('fld_' + fd.k);
      var v = el ? el.value.trim() : '';
      var wrap = $('mForm').querySelector('[data-k="' + fd.k + '"]');
      var isBad = fd.req && !v;
      if (wrap) wrap.classList.toggle('invalid', isBad);
      if (isBad) bad = true;
      out[fd.k] = v;
    });
    if (bad) { toast('कृपया आवश्यक माहिती भरा'); return; }
    M.onSave(out);
    closeModal();
  };

  /* ====================== सामान्य टेबल दृश्य ====================== */
  function table(cols, rows, actions) {
    if (!rows.length) {
      return '<div class="empty"><i class="fa-solid fa-folder-open"></i><b>अद्याप एकही नोंद नाही</b>' +
        '<span>वरील बटणावर क्लिक करून पहिली नोंद जोडा.</span></div>';
    }
    return '<div class="tblwrap"><table class="dt"><thead><tr>' +
      cols.map(function (c) { return '<th>' + esc(c.l) + '</th>'; }).join('') +
      (actions ? '<th style="width:110px">क्रिया</th>' : '') + '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr>' + cols.map(function (c) {
          return '<td>' + (c.r ? c.r(r) : esc(r[c.k])) + '</td>';
        }).join('') +
        (actions ? '<td><button class="iconbtn" data-act="edit" data-id="' + r.id + '" title="बदल करा"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="iconbtn danger" data-act="del" data-id="' + r.id + '" title="काढून टाका"><i class="fa-solid fa-trash"></i></button></td>' : '') +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  var IMG = function (r) { return '<img class="th" src="' + esc(r.image || r.photo || r.url) + '" alt="" loading="lazy">'; };

  /**
   * CRUD दृश्य तयार करते
   */
  function crud(cfg) {
    var rows = DB.list(cfg.table);
    $('view').innerHTML =
      '<div class="atop"><h2>' + esc(cfg.title) + '</h2>' +
      '<button class="btn btn-primary btn-sm" id="addBtn"><i class="fa-solid fa-plus"></i> ' + esc(cfg.addLabel || 'नवीन जोडा') + '</button></div>' +
      '<div class="panel"><div class="panel-h"><h3>एकूण ' + rows.length + ' नोंदी</h3></div>' +
      table(cfg.cols, rows, true) + '</div>';

    function save(data, id) {
      /* रिकाम्या प्रतिमेसाठी प्लेसहोल्डर */
      cfg.fields.forEach(function (f) {
        if (f.t === 'image' && !data[f.k]) {
          data[f.k] = DB.ph(data[cfg.labelKey] || cfg.title, 800, 600, Math.floor(Math.random() * 5));
        }
      });
      if (id) { DB.update(cfg.table, id, data); toast('बदल जतन झाले'); }
      else { DB.insert(cfg.table, data); toast('नवीन नोंद जोडली'); }
      crud(cfg);
    }

    $('addBtn').onclick = function () {
      openModal(cfg.addLabel || 'नवीन नोंद', cfg.fields, null, function (d) { save(d, null); });
    };

    /* श्रोता पॅनेलवर लावला जातो — पुन्हा render झाल्यावर तो आपोआप नष्ट होतो,
       त्यामुळे जुने श्रोते साचून राहत नाहीत. */
    $('view').querySelector('.panel').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var id = b.dataset.id;
      var row = DB.get(cfg.table, id);
      if (!row) return;
      if (b.dataset.act === 'edit') {
        openModal(cfg.title + ' — बदल करा', cfg.fields, row, function (d) { save(d, id); });
      } else if (confirm('"' + (row[cfg.labelKey] || 'ही नोंद') + '" कायमची काढून टाकायची आहे का?')) {
        DB.remove(cfg.table, id);
        toast('नोंद काढून टाकली');
        crud(cfg);
      }
    });
  }

  /* ====================== दृश्ये ====================== */
  var YEARS = (function () {
    var y = new Date().getFullYear(), a = [];
    for (var i = y + 1; i >= y - 6; i--) a.push(String(i));
    return a;
  })();

  var VIEWS = {

    dash: function () {
      var c = [
        ['fa-om', DB.list('festivals').length, 'एकूण उत्सव'],
        ['fa-calendar-days', DB.list('events').length, 'एकूण कार्यक्रम'],
        ['fa-images', DB.list('photos').length, 'एकूण फोटो'],
        ['fa-video', DB.list('videos').length, 'एकूण व्हिडिओ'],
        ['fa-hands-praying', DB.list('aarti_mankari').length, 'एकूण मानकरी'],
        ['fa-trophy', DB.list('competitions').length, 'एकूण स्पर्धा'],
        ['fa-people-group', DB.list('team_members').length, 'टीम सदस्य'],
        ['fa-envelope', DB.list('messages').length, 'नवीन संदेश']
      ];
      var s = DB.session();
      var tm = DB.todayMankari();
      $('view').innerHTML =
        '<div class="atop"><h2>डॅशबोर्ड</h2></div>' +
        '<p style="margin-bottom:22px">नमस्कार, <b>' + esc(s ? s.name : 'प्रशासक') + '</b>. संकेतस्थळाची सद्यस्थिती खाली दिली आहे.</p>' +
        '<div class="astats">' + c.map(function (x) {
          return '<div class="astat"><span class="ico"><i class="fa-solid ' + x[0] + '"></i></span>' +
            '<span><b>' + x[1] + '</b><span>' + x[2] + '</span></span></div>';
        }).join('') + '</div>' +

        '<div class="panel" style="margin-bottom:24px"><div class="panel-h"><h3>आजचे आरतीचे मानकरी</h3></div>' +
        '<div style="padding:20px">' + (tm.length
          ? tm.map(function (m) {
              return '<div style="display:flex;gap:14px;align-items:center">' +
                '<img class="th" style="width:60px;height:60px;border-radius:50%" src="' + esc(m.photo) + '" alt="">' +
                '<span><b style="font-family:Mukta,sans-serif;font-size:1.05rem">' + esc(m.name) + '</b><br>' +
                '<span style="color:var(--ink-mute)">' + esc(m.family) + ' — ' + DB.fmtDate(m.date) + '</span></span></div>';
            }).join('')
          : '<span style="color:var(--ink-mute)">आजच्या तारखेसाठी कोणताही मानकरी नोंदवलेला नाही. "आरतीचे मानकरी" विभागातून नोंद जोडा.</span>') +
        '</div></div>' +

        '<div class="panel"><div class="panel-h"><h3>माहितीचा बॅकअप</h3></div>' +
        '<div style="padding:20px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-outline btn-sm" id="expBtn"><i class="fa-solid fa-download"></i> बॅकअप उतरवा</button>' +
        '<button class="btn btn-outline btn-sm" id="impBtn"><i class="fa-solid fa-upload"></i> बॅकअप भरा</button>' +
        '<input type="file" id="impFile" accept="application/json" hidden>' +
        '<button class="btn btn-outline btn-sm" id="resetBtn"><i class="fa-solid fa-rotate-left"></i> नमुना माहिती पुन्हा भरा</button>' +
        '</div></div>';

      $('expBtn').onclick = function () {
        var b = new Blob([DB.exportJSON()], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'mandal-backup-' + DB.today() + '.json';
        a.click();
        toast('बॅकअप तयार झाला');
      };
      $('impBtn').onclick = function () { $('impFile').click(); };
      $('impFile').onchange = function () {
        var f = this.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try { DB.importJSON(r.result); toast('बॅकअप भरला गेला'); route('dash'); }
          catch (e) { toast('फाइल वाचता आली नाही'); }
        };
        r.readAsText(f);
      };
      $('resetBtn').onclick = function () {
        if (confirm('सर्व सध्याची माहिती जाऊन नमुना माहिती पुन्हा भरली जाईल. पुढे जायचे का?')) {
          DB.reset(); toast('नमुना माहिती पुन्हा भरली'); route('dash');
        }
      };
    },

    festivals: function () {
      crud({
        table: 'festivals', title: 'उत्सव', addLabel: 'नवीन उत्सव जोडा', labelKey: 'name',
        cols: [
          { l: 'फोटो', r: IMG },
          { l: 'उत्सव', k: 'name' },
          { l: 'वर्ष', k: 'year' },
          { l: 'मुख्यपृष्ठावर', r: function (r) { return r.featured ? '<span class="tag">होय</span>' : '<span class="tag" style="background:#EEE;color:#777">नाही</span>'; } },
          { l: 'माहिती', r: function (r) { return esc(String(r.desc || '').slice(0, 60)) + '…'; } }
        ],
        fields: [
          { k: 'name', l: 'उत्सवाचे नाव', t: 'text', req: true, ph: 'उदा. दिवाळी' },
          { k: 'desc', l: 'थोडक्यात माहिती', t: 'textarea', req: true },
          { k: 'year', l: 'वर्ष', t: 'select', opts: YEARS },
          { k: 'image', l: 'फोटो', t: 'image' },
          { k: 'page', l: 'पानाचा दुवा', t: 'text', def: 'other-festivals.html', ph: 'other-festivals.html' },
          { k: 'featured', l: 'मुख्यपृष्ठावर दाखवायचे?', t: 'select', opts: ['0', '1'] }
        ]
      });
    },

    events: function () {
      crud({
        table: 'events', title: 'कार्यक्रम', addLabel: 'नवीन कार्यक्रम जोडा', labelKey: 'title',
        cols: [
          { l: 'पोस्टर', r: IMG },
          { l: 'कार्यक्रम', k: 'title' },
          { l: 'तारीख', r: function (r) { return DB.fmtDate(r.date); } },
          { l: 'वेळ', k: 'time' },
          { l: 'ठिकाण', k: 'venue' }
        ],
        fields: [
          { k: 'title', l: 'कार्यक्रमाचे नाव', t: 'text', req: true },
          { k: 'date', l: 'तारीख', t: 'date', req: true },
          { k: 'time', l: 'वेळ', t: 'text', ph: 'उदा. सायंकाळी ६:३०' },
          { k: 'venue', l: 'ठिकाण', t: 'text', ph: 'उदा. मुख्य मंडप' },
          { k: 'desc', l: 'माहिती', t: 'textarea' },
          { k: 'image', l: 'पोस्टर', t: 'image' }
        ]
      });
    },

    mankari: function () {
      crud({
        table: 'aarti_mankari', title: 'आरतीचे मानकरी', addLabel: 'नवीन मानकरी जोडा', labelKey: 'name',
        cols: [
          { l: 'फोटो', r: function (r) { return '<img class="th" style="border-radius:50%" src="' + esc(r.photo) + '" alt="">'; } },
          { l: 'मानकरीचे नाव', k: 'name' },
          { l: 'कुटुंब', k: 'family' },
          { l: 'तारीख', r: function (r) { return DB.fmtDate(r.date) + ' (' + DB.dayName(r.date) + ')'; } },
          { l: 'उत्सव', k: 'festival' },
          { l: 'वर्ष', k: 'year' }
        ],
        fields: [
          { k: 'name', l: 'मानकरीचे नाव', t: 'text', req: true, ph: 'श्री. / सौ. पूर्ण नाव' },
          { k: 'family', l: 'कुटुंबाचे नाव', t: 'text', req: true, ph: 'उदा. जोशी कुटुंब' },
          { k: 'date', l: 'आरतीची तारीख', t: 'date', req: true },
          { k: 'festival', l: 'उत्सव', t: 'select', opts: ['गणेशोत्सव', 'नवरात्रोत्सव', 'दहीहंडी', 'इतर'] },
          { k: 'year', l: 'वर्ष', t: 'select', opts: YEARS },
          { k: 'photo', l: 'कुटुंबाचा फोटो', t: 'image' }
        ]
      });
    },

    photos: function () {
      crud({
        table: 'photos', title: 'फोटो', addLabel: 'नवीन फोटो जोडा', labelKey: 'title',
        cols: [
          { l: 'फोटो', r: IMG },
          { l: 'शीर्षक', k: 'title' },
          { l: 'अल्बम', r: function (r) { return '<span class="tag">' + esc(r.album) + '</span>'; } },
          { l: 'वर्ष', k: 'year' }
        ],
        fields: [
          { k: 'title', l: 'शीर्षक', t: 'text', req: true },
          { k: 'album', l: 'अल्बम', t: 'select', opts: ['गणेशोत्सव', 'नवरात्र', 'दहीहंडी', 'खेळ', 'सामाजिक उपक्रम', 'इतर'] },
          { k: 'year', l: 'वर्ष', t: 'select', opts: YEARS },
          { k: 'url', l: 'फोटो', t: 'image' }
        ]
      });
    },

    videos: function () {
      crud({
        table: 'videos', title: 'व्हिडिओ', addLabel: 'नवीन व्हिडिओ जोडा', labelKey: 'title',
        cols: [
          { l: 'थंबनेल', r: function (r) { return '<img class="th" src="https://img.youtube.com/vi/' + esc(r.yt) + '/default.jpg" alt="">'; } },
          { l: 'शीर्षक', k: 'title' },
          { l: 'गट', r: function (r) { return '<span class="tag">' + esc(r.cat) + '</span>'; } },
          { l: 'YouTube ID', k: 'yt' }
        ],
        fields: [
          { k: 'title', l: 'व्हिडिओचे शीर्षक', t: 'text', req: true },
          { k: 'yt', l: 'YouTube व्हिडिओ ID', t: 'text', req: true, ph: 'उदा. dQw4w9WgXcQ (Shorts साठीही चालेल)' },
          { k: 'cat', l: 'गट', t: 'select', opts: ['गणेशोत्सव', 'नवरात्र', 'दहीहंडी', 'स्पर्धा', 'सामाजिक उपक्रम'] },
          { k: 'desc', l: 'माहिती', t: 'textarea' }
        ]
      });
    },

    competitions: function () {
      crud({
        table: 'competitions', title: 'स्पर्धा', addLabel: 'नवीन स्पर्धा जोडा', labelKey: 'name',
        cols: [
          { l: 'फोटो', r: IMG },
          { l: 'स्पर्धा', k: 'name' },
          { l: 'तारीख', r: function (r) { return DB.fmtDate(r.date); } },
          { l: 'ठिकाण', k: 'venue' },
          { l: 'सहभाग', k: 'participants' }
        ],
        fields: [
          { k: 'name', l: 'स्पर्धेचे नाव', t: 'text', req: true },
          { k: 'date', l: 'तारीख', t: 'date' },
          { k: 'venue', l: 'ठिकाण', t: 'text' },
          { k: 'participants', l: 'सहभागी', t: 'text', ph: 'उदा. १६ संघ' },
          { k: 'desc', l: 'माहिती', t: 'textarea' },
          { k: 'icon', l: 'चिन्ह (Font Awesome)', t: 'text', def: 'fa-trophy', ph: 'fa-trophy' },
          { k: 'image', l: 'फोटो', t: 'image' }
        ]
      });
    },

    winners: function () {
      crud({
        table: 'competition_winners', title: 'विजेते', addLabel: 'नवीन विजेता जोडा', labelKey: 'name',
        cols: [
          { l: 'स्पर्धा', k: 'comp' },
          { l: 'क्रमांक', r: function (r) { return '<span class="tag">' + esc(r.rank) + '</span>'; } },
          { l: 'विजेता', k: 'name' },
          { l: 'वर्ष', k: 'year' }
        ],
        fields: [
          { k: 'comp', l: 'स्पर्धेचे नाव', t: 'text', req: true },
          { k: 'rank', l: 'क्रमांक', t: 'select', opts: ['प्रथम', 'द्वितीय', 'तृतीय', 'उत्तेजनार्थ'] },
          { k: 'name', l: 'विजेत्याचे नाव', t: 'text', req: true },
          { k: 'year', l: 'वर्ष', t: 'select', opts: YEARS }
        ]
      });
    },

    team: function () {
      crud({
        table: 'team_members', title: 'टीम सदस्य', addLabel: 'नवीन सदस्य जोडा', labelKey: 'name',
        cols: [
          { l: 'फोटो', r: function (r) { return '<img class="th" style="border-radius:50%" src="' + esc(r.photo) + '" alt="">'; } },
          { l: 'नाव', k: 'name' },
          { l: 'पद', r: function (r) { return '<span class="tag">' + esc(r.role) + '</span>'; } },
          { l: 'परिचय', r: function (r) { return esc(String(r.bio || '').slice(0, 50)) + '…'; } }
        ],
        fields: [
          { k: 'name', l: 'पूर्ण नाव', t: 'text', req: true },
          { k: 'role', l: 'पद', t: 'select', opts: ['अध्यक्ष', 'उपाध्यक्ष', 'सचिव', 'खजिनदार', 'कार्याध्यक्ष', 'सदस्य', 'कार्यकर्ते'] },
          { k: 'bio', l: 'थोडक्यात परिचय', t: 'textarea' },
          { k: 'photo', l: 'फोटो', t: 'image' },
          { k: 'fb', l: 'Facebook दुवा', t: 'url' },
          { k: 'ig', l: 'Instagram दुवा', t: 'url' }
        ]
      });
    },

    social: function () {
      crud({
        table: 'social_initiatives', title: 'सामाजिक उपक्रम', addLabel: 'नवीन उपक्रम जोडा', labelKey: 'title',
        cols: [
          { l: 'फोटो', r: IMG },
          { l: 'उपक्रम', k: 'title' },
          { l: 'माहिती', r: function (r) { return esc(String(r.desc || '').slice(0, 60)) + '…'; } }
        ],
        fields: [
          { k: 'title', l: 'उपक्रमाचे नाव', t: 'text', req: true },
          { k: 'desc', l: 'माहिती', t: 'textarea', req: true },
          { k: 'icon', l: 'चिन्ह (Font Awesome)', t: 'text', def: 'fa-hands-holding-heart' },
          { k: 'image', l: 'फोटो', t: 'image' }
        ]
      });
    },

    messages: function () {
      var rows = DB.list('messages');
      $('view').innerHTML =
        '<div class="atop"><h2>संपर्क फॉर्ममधील संदेश</h2></div>' +
        '<div class="panel"><div class="panel-h"><h3>एकूण ' + rows.length + ' संदेश</h3></div>' +
        table([
          { l: 'नाव', k: 'name' },
          { l: 'मोबाईल', r: function (r) { return '<a href="tel:' + esc(r.phone) + '">' + esc(r.phone) + '</a>'; } },
          { l: 'ईमेल', r: function (r) { return '<a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a>'; } },
          { l: 'संदेश', r: function (r) { return esc(r.msg); } },
          { l: 'दिनांक', r: function (r) { return DB.fmtDate(String(r.at || '').slice(0, 10)); } }
        ], rows, true) + '</div>';

      $('view').querySelector('.panel').addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var r = DB.get('messages', b.dataset.id);
        if (!r) return;
        if (b.dataset.act === 'del') {
          if (confirm('हा संदेश काढून टाकायचा का?')) { DB.remove('messages', b.dataset.id); toast('संदेश काढला'); VIEWS.messages(); }
        } else {
          alert(r.name + ' (' + r.phone + ')\n\n' + r.msg);
        }
      });
    },

    settings: function () {
      var S = DB.settings();
      var f = [
        ['name', 'मंडळाचे नाव', 'text'], ['tagline', 'टॅगलाइन', 'text'],
        ['address', 'पत्ता', 'textarea'], ['phone', 'मोबाईल नंबर', 'text'],
        ['phone2', 'दुसरा नंबर', 'text'], ['email', 'ईमेल', 'email'],
        ['whatsapp', 'WhatsApp नंबर (देश कोडसह, उदा. 919876543210)', 'text'],
        ['instagram', 'Instagram दुवा', 'url'], ['facebook', 'Facebook दुवा', 'url'],
        ['youtube', 'YouTube दुवा', 'url'], ['maps', 'Google Maps embed दुवा', 'url']
      ];
      var st = [
        ['stat_festivals', 'आयोजित उत्सव'], ['stat_cultural', 'सांस्कृतिक कार्यक्रम'],
        ['stat_social', 'सामाजिक उपक्रम'], ['stat_years', 'वर्षांचा प्रवास']
      ];
      var ab = [['about1', 'परिच्छेद १'], ['about2', 'परिच्छेद २'], ['about3', 'परिच्छेद ३']];

      function fld(k, l, t) {
        var v = esc(S[k] || '');
        return '<div class="field"><label for="s_' + k + '">' + esc(l) + '</label>' +
          (t === 'textarea' ? '<textarea id="s_' + k + '">' + v + '</textarea>'
            : '<input id="s_' + k + '" type="' + t + '" value="' + v + '">') + '</div>';
      }

      $('view').innerHTML =
        '<div class="atop"><h2>संपर्क व साइट सेटिंग्ज</h2>' +
        '<button class="btn btn-primary btn-sm" id="saveS"><i class="fa-solid fa-floppy-disk"></i> जतन करा</button></div>' +
        '<div class="alert alert-ok" id="sOk">बदल जतन झाले. वेबसाइटवर लगेच दिसतील.</div>' +

        '<div class="panel" style="margin-bottom:22px"><div class="panel-h"><h3>संपर्क माहिती</h3></div>' +
        '<div style="padding:22px"><div class="two">' + f.map(function (x) { return fld(x[0], x[1], x[2]); }).join('') + '</div></div></div>' +

        '<div class="panel" style="margin-bottom:22px"><div class="panel-h"><h3>आकडेवारी (मुखपृष्ठ)</h3></div>' +
        '<div style="padding:22px"><div class="two">' + st.map(function (x) { return fld(x[0], x[1], 'text'); }).join('') + '</div></div></div>' +

        '<div class="panel" style="margin-bottom:22px"><div class="panel-h"><h3>आमच्याविषयी मजकूर</h3></div>' +
        '<div style="padding:22px">' + ab.map(function (x) { return fld(x[0], x[1], 'textarea'); }).join('') + '</div></div>' +

        '<div class="panel"><div class="panel-h"><h3>पासवर्ड बदला</h3></div>' +
        '<div style="padding:22px"><div class="two">' +
        '<div class="field"><label for="op">सध्याचा पासवर्ड</label><input id="op" type="password"></div>' +
        '<div class="field"><label for="np">नवीन पासवर्ड</label><input id="np" type="password"></div>' +
        '</div><button class="btn btn-outline btn-sm" id="pwBtn">पासवर्ड बदला</button></div></div>';

      $('saveS').onclick = function () {
        var patch = {};
        f.concat(st).concat(ab).forEach(function (x) {
          var el = $('s_' + x[0]); if (el) patch[x[0]] = el.value.trim();
        });
        DB.saveSettings(patch);
        $('sOk').classList.add('show');
        toast('सेटिंग्ज जतन झाल्या');
        setTimeout(function () { $('sOk').classList.remove('show'); }, 5000);
      };
      $('pwBtn').onclick = function () {
        var o = $('op').value, n = $('np').value;
        if (n.length < 6) { toast('नवीन पासवर्ड किमान ६ अक्षरांचा हवा'); return; }
        if (DB.changePassword(o, n)) { toast('पासवर्ड बदलला'); $('op').value = ''; $('np').value = ''; }
        else { toast('सध्याचा पासवर्ड चुकीचा आहे'); }
      };
    }
  };

  /* ====================== राउटिंग ====================== */
  function route(v) {
    (VIEWS[v] || VIEWS.dash)();
    [].forEach.call(document.querySelectorAll('#anav a[data-v]'), function (a) {
      a.classList.toggle('on', a.dataset.v === v);
    });
    $('aside').classList.remove('show');
    window.scrollTo(0, 0);
  }

  document.getElementById('anav').addEventListener('click', function (e) {
    var a = e.target.closest('a[data-v]'); if (!a) return;
    e.preventDefault();
    route(a.dataset.v);
  });

  /* ====================== सुरुवात ====================== */
  if (DB.session()) showAdmin(); else showLogin();
})();
