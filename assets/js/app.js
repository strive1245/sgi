/* SGI Paper Box site: all interactivity, no dependencies. */
(function () {
  'use strict';
  var S = window.SGI || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = 'https://wa.me/' + S.phoneIntl + '?text=';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  }

  /* ---- click tracking hook (plug in your own analytics here) ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-track]');
    if (a && typeof window.gtag === 'function') window.gtag('event', 'contact_click', { method: a.getAttribute('data-track'), page: location.pathname });
  });

  /* ---- reveal on scroll ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    $$('.sec .card,.sec .prod,.sec .pack-card,.numbers b,.detail,.town-box').forEach(function (n) { n.classList.add('reveal'); io.observe(n); });
  }

  /* ---- count-up numbers ---- */
  var years = new Date().getFullYear() - S.since;
  $$('[data-count]').forEach(function (n) {
    var isYears = n.closest('.stat,.numgrid') && n.parentNode && /Years/.test(n.parentNode.textContent);
    var target = isYears ? years : parseInt(n.getAttribute('data-count'), 10);
    n.textContent = target;
    if (reduce || !('IntersectionObserver' in window)) return;
    var done = false;
    new IntersectionObserver(function (es, ob) {
      es.forEach(function (x) {
        if (x.isIntersecting && !done) {
          done = true; ob.disconnect();
          var t0 = performance.now();
          (function tick(t) {
            var p = Math.min(1, (t - t0) / 1200);
            n.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        }
      });
    }, { threshold: 0.4 }).observe(n);
  });

  /* ---- open now badge (India time) ---- */
  var badge = $('#open-badge');
  if (badge) {
    var h = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()), 10);
    var open = h >= S.opens && h < S.closes;
    badge.classList.toggle('open', open);
    $('#open-text').textContent = open ? 'Open now' : 'Closed now, opens ' + S.opens + ':00 AM';
  }

  /* ---- scroll-driven process ---- */
  var proc = $('#process');
  if (proc && !reduce) {
    var steps = $$('.step', proc), dots = $$('.dots i', proc), arts = [0, 1, 2, 3].map(function (i) { return $('#art' + i); });
    var cur = -1;
    var upd = function () {
      var r = proc.getBoundingClientRect();
      var p = Math.max(0, Math.min(0.999, -r.top / (r.height - window.innerHeight)));
      var s = Math.floor(p * 4);
      if (s === cur) return; cur = s;
      steps.forEach(function (n, i) { n.classList.toggle('on', i === s); });
      dots.forEach(function (n, i) { n.classList.toggle('on', i <= s); });
      arts.forEach(function (n, i) { if (n) n.style.display = i === s ? '' : 'none'; });
    };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---- packing selector ---- */
  var PACK = {
    fruit: { name: 'fruit & produce', title: '5-ply ventilated RSC carton', desc: 'Strong, ventilated cartons that replace wooden crates for fruit and vegetables.', size: 'Made to your size', print: '1-colour brand + handling marks', season: 'Year-round', lead: 'Confirmed on your quote', msg: 'Hello SGI, I am packing fruit & produce products. Please suggest a box and share a quote.' },
    oil: { name: 'oil & food', title: '3-ply or 5-ply oil-pack carton', desc: 'Cartons sized for oil tins and ghee jars, made for oil mills and food units.', size: 'Made to your tin or jar size', print: '1–2 colour brand print', season: 'Year-round', lead: 'Confirmed on your quote', msg: 'Hello SGI, I am packing oil & food products. Please suggest a box and share a quote.' },
    industrial: { name: 'factory & industrial', title: '5-ply heavy-duty shipping carton', desc: 'Heavy-duty cartons for parts, hardware and industrial dispatch.', size: 'Made to your size', print: 'Handling marks + 1 colour', season: 'Year-round', lead: 'Confirmed on your quote', msg: 'Hello SGI, I am packing factory & industrial products. Please suggest a box and share a quote.' },
    shop: { name: 'shop & online sellers', title: '3-ply mailer / shipping box', desc: 'Sturdy boxes for online sellers, courier dispatch and shop packing.', size: 'Made to your size', print: 'Optional logo print', season: 'Year-round', lead: 'Confirmed on your quote', msg: 'Hello SGI, I am a shop / online seller. Please suggest a box and share a quote.' }
  };
  function setPack(k) {
    var d = PACK[k]; if (!d) return;
    $$('.pack-card').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pack') === k)); });
    $('#pk-eyebrow').textContent = 'Recommended for ' + d.name;
    $('#pk-title').textContent = d.title; $('#pk-desc').textContent = d.desc;
    $('#pk-size').textContent = d.size; $('#pk-print').textContent = d.print;
    $('#pk-season').textContent = d.season; $('#pk-lead').textContent = d.lead;
    $('#pk-cta').href = WA + encodeURIComponent(d.msg);
  }
  $$('.pack-card').forEach(function (b) { b.addEventListener('click', function () { setPack(b.getAttribute('data-pack')); }); });
  if ($('#pack-detail')) setPack('fruit');

  /* ---- box builder ---- */
  var svg = $('#box-svg');
  if (svg) {
    var C = 0.8660254;
    var val = function (id) { return Math.max(+$('#' + id).min, Math.min(+$('#' + id).max, parseFloat($('#' + id).value) || +$('#' + id).min)); };
    var checked = function (n) { return document.querySelector('input[name=' + n + ']:checked').value; };
    var poly = function (pts, fill, stroke) { return el('polygon', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill, stroke: stroke || 'rgba(2,6,23,.35)', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }); };
    var draw = function () {
      var L = val('L'), W = val('W'), H = val('H'), type = checked('type'), ply = +checked('ply'), pr = +checked('print');
      var vh = type === 'Tray' ? Math.max(2, H * 0.55) : H;
      var k = Math.min(300 / ((L + W) * C), 190 / (vh + (L + W) * 0.5));
      var minX = -W * C * k, maxX = L * C * k, minY = -vh * k, maxY = (L + W) * 0.5 * k;
      var tx = 200 - (minX + maxX) / 2, ty = 150 - (minY + maxY) / 2;
      var P = function (a, b, h) { return [(a - b) * C * k + tx, (a + b) * 0.5 * k - h * k + ty]; };
      svg.textContent = '';
      var g = el('g', {});
      g.appendChild(el('ellipse', { cx: 200, cy: maxY + ty + 8, rx: (maxX - minX) / 2, ry: 10, fill: 'rgba(2,6,23,.08)' }));
      g.appendChild(poly([P(0, W, 0), P(L, W, 0), P(L, W, vh), P(0, W, vh)], '#C79A63'));
      g.appendChild(poly([P(L, 0, 0), P(L, W, 0), P(L, W, vh), P(L, 0, vh)], '#A87B47'));
      var top = [P(0, 0, vh), P(L, 0, vh), P(L, W, vh), P(0, W, vh)];
      g.appendChild(poly(top, type === 'Tray' ? '#8F6535' : '#D9B48A'));
      if (type === 'Tray') {
        g.appendChild(poly([P(L * .06, W * .08, vh), P(L * .94, W * .08, vh), P(L * .94, W * .92, vh), P(L * .06, W * .92, vh)], '#B88D58'));
      } else {
        g.appendChild(poly([P(0, W * .42, vh), P(L, W * .42, vh), P(L, W * .58, vh), P(0, W * .58, vh)], 'rgba(250,246,240,.85)', 'rgba(2,6,23,.15)'));
        if (type === 'Die-cut') {
          var f = el('polyline', { points: [P(L * .15, 0, vh), P(L * .15, W, vh)].map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: '#8F6535', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 });
          g.appendChild(f);
        }
      }
      if (pr > 0) {
        g.appendChild(poly([P(L * .2, W, vh * .3), P(L * .8, W, vh * .3), P(L * .8, W, vh * .7), P(L * .2, W, vh * .7)], '#13538A', 'none'));
        if (pr > 1) g.appendChild(poly([P(L * .3, W, vh * .42), P(L * .5, W, vh * .42), P(L * .5, W, vh * .58), P(L * .3, W, vh * .58)], '#db7706', 'none'));
      }
      svg.appendChild(g);
      var vol = L * W * H * 16.387064 / 1000;
      var area = (2 * (L + W) + 2) * (H + W) / 144;
      $('#dL').textContent = 'L ' + L + '″'; $('#dW').textContent = 'W ' + W + '″'; $('#dH').textContent = 'H ' + H + '″';
      $('#vol').textContent = vol.toFixed(1) + ' L'; $('#area').textContent = area.toFixed(1) + ' ft²';
      var pnames = ['No printing', '1 colour', '2 colour'], qty = Math.max(1, parseInt($('#qty').value, 10) || 1);
      var msg = 'Hello SGI, I need a quote.\nBox type: ' + type + '\nSize: ' + L + ' x ' + W + ' x ' + H + ' inch\nPly: ' + ply + '-ply\nPrinting: ' + pnames[pr] + '\nQuantity: ' + qty + '\nEstimated volume per box: ' + vol.toFixed(1) + ' L';
      $('#bwa').href = WA + encodeURIComponent(msg);
    };
    ['L', 'W', 'H'].forEach(function (id) {
      var r = $('#' + id + 'r'), n = $('#' + id);
      r.addEventListener('input', function () { n.value = r.value; draw(); });
      n.addEventListener('input', function () { r.value = n.value; draw(); });
    });
    $$('#builder input[type=radio], #qty').forEach(function (n) { n.addEventListener('input', draw); n.addEventListener('change', draw); });
    draw();
  }

  /* ---- delivery map ---- */
  var map = $('#map-svg');
  if (map && S.map) {
    var CX = 400, CY = 285;
    [130, 215, 275].forEach(function (r, i) { map.appendChild(el('circle', { cx: CX, cy: CY, r: r, class: 'ring' + (i === 2 ? ' ring3' : '') })); });
    var line = function (t) { return el('line', { x1: CX, y1: CY, x2: t.x, y2: t.y, stroke: '#e2e8f0', 'stroke-width': 1 }); };
    S.map.forEach(function (t) { map.appendChild(line(t)); });
    map.appendChild(el('circle', { cx: CX, cy: CY, r: 14, class: 'factory-node', fill: '#db7706' }));
    map.appendChild(el('circle', { cx: CX, cy: CY, r: 14, fill: '#09090b' }));
    map.appendChild(el('text', { x: CX, y: CY + 4, 'text-anchor': 'middle', fill: '#fff', 'font-size': 10, 'font-family': 'Space Mono, monospace', 'font-weight': 700 }, 'SGI'));
    map.appendChild(el('text', { x: CX, y: CY - 24, 'text-anchor': 'middle', 'font-size': 10, 'font-family': 'Space Mono, monospace', 'letter-spacing': '1.5', fill: '#475569' }, 'SGI FACTORY · SRI GANGANAGAR'));
    var box = $('#town-box');
    var show = function (t) {
      $$('.node', map).forEach(function (n) { n.classList.toggle('on', n.getAttribute('data-n') === t.name); });
      var msg = WA + encodeURIComponent('Hello SGI, I am in ' + t.name + '. When can you deliver corrugated boxes?');
      box.innerHTML = '';
      var m = document.createElement('span'); m.className = 'mono'; m.style.color = '#94a3b8'; m.textContent = 'Ring ' + t.ring;
      var h = document.createElement('h3'); h.textContent = t.name;
      var p = document.createElement('p'); p.textContent = S.rings[t.ring] + (t.ring === 3 ? '. Ask for the minimum quantity and date.' : '. Confirm your date on WhatsApp.');
      var a = document.createElement('a'); a.className = 'btn btn-green btn-sm'; a.href = msg; a.textContent = 'Ask for delivery'; a.setAttribute('data-track', 'whatsapp');
      box.appendChild(m); box.appendChild(h); box.appendChild(p); box.appendChild(a);
      if (t.slug) {
        var l = document.createElement('a'); l.className = 'btn btn-light btn-sm'; l.style.marginLeft = '8px'; l.href = 'corrugated-boxes-' + t.slug + '/'; l.textContent = 'Town page';
        box.appendChild(l);
      }
    };
    S.map.forEach(function (t) {
      var g = el('g', { class: 'node r' + t.ring, tabindex: 0, role: 'button', 'aria-label': t.name + ', ' + S.rings[t.ring], 'data-n': t.name });
      g.appendChild(el('circle', { cx: t.x, cy: t.y, r: 9 }));
      var right = t.x > CX;
      g.appendChild(el('text', { x: t.x + (right ? 15 : -15), y: t.y + 4, 'text-anchor': right ? 'start' : 'end' }, t.name));
      g.addEventListener('click', function () { show(t); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(t); } });
      map.appendChild(g);
    });
  }

  /* ---- product cards: tap to toggle on touch ---- */
  $$('.prod').forEach(function (c) {
    c.addEventListener('click', function (e) { if (e.target.closest('a')) return; c.classList.toggle('open'); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter') c.classList.toggle('open'); });
  });

  /* ---- quote form: optional endpoint + WhatsApp ---- */
  var form = $('#quote-form');
  if (form) {
    var sel = $('#f-town');
    (S.towns || []).forEach(function (t) { var o = document.createElement('option'); o.textContent = t; o.value = t; sel.appendChild(o); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = { name: $('#f-name').value.trim(), phone: $('#f-phone').value.trim(), town: sel.value, size: $('#f-size').value.trim(), qty: $('#f-qty').value.trim(), message: $('#f-msg').value.trim() };
      var text = 'Hello SGI, I need a quote.\nName: ' + d.name + '\nPhone: ' + d.phone + '\nTown: ' + d.town + (d.size ? '\nBox size: ' + d.size : '') + (d.qty ? '\nQuantity: ' + d.qty : '') + (d.message ? '\nNote: ' + d.message : '');
      var go = function () { $('#f-msg-out').textContent = 'Opening WhatsApp with your details...'; window.open(WA + encodeURIComponent(text), '_blank', 'noopener'); };
      if (S.formEndpoint) {
        fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(d) }).then(go, go);
      } else { go(); }
    });
  }
})();
