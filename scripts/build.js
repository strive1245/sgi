#!/usr/bin/env node
/* Generates index.html, the 13 town pages, 404.html, sitemap.xml and robots.txt
   from site.config.json + data/towns.json. Run: node scripts/build.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const towns = JSON.parse(fs.readFileSync(path.join(root, 'data/towns.json'), 'utf8'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = t => `https://wa.me/${cfg.phoneIntl}?text=${encodeURIComponent(t)}`;
const years = new Date().getFullYear() - cfg.since;
const address = `${cfg.street}, ${cfg.city}, ${cfg.region} ${cfg.postal}`;
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
const WA_DEFAULT = wa('Hello, I need a quote for corrugated boxes.');
const icon = {
  phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>',
  doc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>'
};
const boxSvg = '<svg viewBox="0 0 200 200" aria-hidden="true"><polygon points="100,20 169,60 100,100 31,60" fill="#D9B48A"/><polygon points="31,60 100,100 100,180 31,140" fill="#C79A63"/><polygon points="100,100 169,60 169,140 100,180" fill="#A87B47"/></svg>';

const ringLabel = { 1: 'Same or next day', 2: 'About 2 days', 3: 'Large or repeat orders' };

const jsonLdBusiness = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: cfg.name,
  alternateName: ['SGI Paper Box', 'Shree Ganpati Industries'],
  url: cfg.siteUrl,
  image: `${cfg.siteUrl}/assets/img/logo-mark.svg`,
  logo: `${cfg.siteUrl}/assets/img/logo-mark.svg`,
  telephone: `+${cfg.phoneIntl}`,
  ...(cfg.email ? { email: cfg.email } : {}),
  foundingDate: String(cfg.since),
  address: { '@type': 'PostalAddress', streetAddress: cfg.street, addressLocality: cfg.city, addressRegion: cfg.region, postalCode: cfg.postal, addressCountry: 'IN' },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: String(cfg.opens).padStart(2, '0') + ':00', closes: String(cfg.closes).padStart(2, '0') + ':00' }],
  areaServed: towns.map(t => ({ '@type': 'City', name: t.name })),
  contactPoint: { '@type': 'ContactPoint', name: cfg.person, telephone: `+${cfg.phoneIntl}`, contactType: 'sales', areaServed: 'IN', availableLanguage: ['English', 'Hindi'] }
});
const jsonLdSite = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, alternateName: ['SGI Paper Box', 'Shree Ganpati Industries'], url: cfg.siteUrl });
const ld = o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;

function head({ title, desc, url, extra = '', depth = 0 }) {
  const rel = depth ? '../' : '';
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#09090B">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${cfg.siteUrl}/assets/img/og-image.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${rel}assets/img/logo-mark.svg">
<link rel="manifest" href="${rel}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/css/style.css">
${extra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

function header(depth = 0) {
  const p = depth ? '../' : '';
  return `<header class="site-header"><div class="wrap">
<a class="brand" href="${p}index.html" aria-label="${esc(cfg.name)} home"><img src="${p}assets/img/logo-mark.svg" alt="SGI logo, a corrugated box mark" width="36" height="36"><span><b>Shree Ganpati</b><small>Paper Box Industries</small></span></a>
<nav class="nav" aria-label="Main"><a href="${p}index.html#products">Products</a><a href="${p}index.html#box-builder">Box Builder</a><a href="${p}index.html#delivery">Delivery</a><a href="${p}index.html#faq">FAQ</a><a href="${p}index.html#connect">Connect</a></nav>
<div class="head-cta"><a class="head-phone" href="tel:+${cfg.phoneIntl}" data-track="call">${cfg.phone}</a><a class="btn btn-dark btn-sm" href="tel:+${cfg.phoneIntl}" data-track="call">${icon.phone} Call</a><a class="btn btn-green btn-sm" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} WhatsApp</a></div>
</div></header>`;
}

function footer(depth = 0) {
  const p = depth ? '../' : '';
  return `<footer class="site-footer"><div class="wrap">
<div class="foot-grid">
<div><h4>${esc(cfg.name)}</h4><p>Corrugated boxes made in ${cfg.city} since ${cfg.since}.<br>${esc(address)}<br>Open every day, ${cfg.hoursText}.</p><p style="margin-top:10px"><a href="tel:+${cfg.phoneIntl}">${cfg.phone}</a> &middot; ${esc(cfg.person)}, ${cfg.role}${cfg.email ? ` &middot; <a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>` : ''}</p></div>
<div><h4>Quick links</h4><ul><li><a href="${p}index.html#products">Fruit cartons</a></li><li><a href="${p}index.html#products">Printed boxes</a></li><li><a href="${p}index.html#box-builder">Box builder</a></li><li><a href="${p}index.html#delivery">Delivery map</a></li><li><a href="${p}index.html#faq">FAQ</a></li><li><a href="${p}index.html#connect">Get a quote</a></li></ul></div>
<div><h4>Towns we serve</h4><ul class="towns">${towns.map(t => `<li><a href="${p}corrugated-boxes-${t.slug}/">${esc(t.name)}</a></li>`).join('')}</ul></div>
</div>
<div class="copy">&copy; ${new Date().getFullYear()} ${esc(cfg.name)}. All rights reserved.</div>
</div></footer>
<nav class="mbar" aria-label="Quick contact"><a href="tel:+${cfg.phoneIntl}" data-track="call">${icon.phone}<span>Call</span><small>${cfg.phone}</small></a><a class="wa" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat}<span>WhatsApp</span></a><a href="${p}index.html#connect">${icon.doc}<span>Get quote</span></a></nav>
<a class="float-wa" href="${WA_DEFAULT}" aria-label="Chat on WhatsApp" data-track="whatsapp" style="color:#fff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg></a>`;
}

const faqs = [
  ['What is the minimum order quantity?', 'Minimum order depends on the box size and printing. Small trial lots are welcome so you can check the quality first. Message us on WhatsApp with your size and quantity for an exact answer.'],
  ['How fast will I get my boxes?', 'Orders for Sri Ganganagar and nearby towns usually move the same day or the next morning once your sample is approved. Towns further out take about two days. Ask on WhatsApp for your exact delivery date.'],
  ['Can you print my brand and logo on the boxes?', 'Yes. We print 1 or 2 colour flexo on boxes, such as your brand name, logo and handling marks. Send your logo on WhatsApp and we will advise on the best setup.'],
  ['Do you provide a GST invoice?', 'Yes. Every order comes with a proper GST invoice.'],
  ['What are the payment terms?', 'Payment terms are agreed when the quote is confirmed and depend on the order size and whether you are a regular buyer. Ask on WhatsApp.'],
  ['Do you charge for delivery?', 'Delivery charges depend on distance and lot size, and we state them clearly in your quote so there are no surprises.'],
  ['What are your opening hours?', `We are open every day, ${cfg.hoursText}. Walk in or call ${cfg.phone}.`],
  ["I searched for 'carton box' or 'cartoon box'. Is that the same thing?", "Yes. 'Carton box', 'cartoon box', 'cardboard box' and 'corrugated box' all mean the same thing: a box made of corrugated board. We make them in 3-ply and 5-ply, to your size."]
];
const faqLd = list => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

const products = [
  ['Fruit & vegetable cartons', 'Strong, ventilated cartons that replace wooden crates for fruit and produce.', '5-ply', 'Made to your size', '1-colour', 'fruit & vegetable cartons'],
  ['Oil-pack cartons', 'Cartons sized for oil tins and ghee jars, made for oil mills and food units.', '3-ply / 5-ply', 'Made to your size', '1–2 colour', 'oil-pack cartons'],
  ['Printed boxes', 'Your brand printed clean on kraft liner: names, logos and handling marks.', '3-ply / 5-ply', 'Made to your size', '1–2 colour flexo', 'printed boxes'],
  ['Shipping & mailer boxes', 'Sturdy boxes for online sellers, courier dispatch and shop packing.', '3-ply', 'Made to your size', 'Optional logo print', 'shipping & mailer boxes'],
  ['Die-cut boxes', 'Custom shapes, trays and self-locking boxes cut to your dieline.', 'As per your need', 'Custom dieline', 'Optional', 'die-cut boxes'],
  ['Custom sizes', 'Any length, width and height made to order in 3-ply or 5-ply board.', '3-ply / 5-ply', 'Any size', 'Optional', 'custom sizes']
];

const mapTowns = [
  ['Sadul Shahar', 'sadul-shahar', 1, 495, 340], ['Padampur', 'padampur', 1, 345, 385], ['Raisinghnagar', 'raisinghnagar', 1, 285, 365],
  ['Suratgarh', 'suratgarh', 1, 425, 410], ['Anupgarh', 'anupgarh', 1, 262, 300],
  ['Abohar', 'abohar', 2, 480, 95], ['Fazilka', 'fazilka', 2, 325, 95], ['Hanumangarh', 'hanumangarh', 2, 565, 415],
  ['Sirsa', 'sirsa', 2, 610, 260], ['Malout', 'malout', 2, 570, 135],
  ['Bikaner', 'bikaner', 3, 330, 550], ['Bathinda', 'bathinda', 3, 650, 150], ['Muktsar', null, 3, 515, 40]
];
const appData = {
  phone: cfg.phone, phoneIntl: cfg.phoneIntl, since: cfg.since, opens: cfg.opens, closes: cfg.closes,
  formEndpoint: cfg.formEndpoint, rings: ringLabel,
  map: mapTowns.map(([name, slug, ring, x, y]) => ({ name, slug, ring, x, y })),
  towns: towns.map(t => t.name).concat(['Muktsar', 'Other'])
};

function buildHome() {
  const title = `${cfg.name} – Corrugated Boxes, ${cfg.city}`;
  const desc = `Corrugated box manufacturer in ${cfg.city} since ${cfg.since}. Kinnow, oil-pack and printed cartons. Call ${cfg.person} ${cfg.phone} for a quote.`;
  const gallery = cfg.gallery && cfg.gallery.length
    ? cfg.gallery.map(g => `<figure><img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" width="800" height="600"></figure>`).join('')
    : [1, 2, 3].map(i => `<div class="ph" role="img" aria-label="Factory photo ${i} to be added">${boxSvg}Add factory photo ${i}<br>(see README)</div>`).join('');
  const marq = ['Corrugated boxes', `Since ${cfg.since}`, cfg.city, '3-ply · 5-ply', 'Printed cartons', 'Made local'];
  const marqHtml = [...marq, ...marq].map(m => `<span>${m}</span>`).join('');
  return `${head({ title, desc, url: cfg.siteUrl + '/', extra: ld(jsonLdSite()) + ld(jsonLdBusiness()) + ld(faqLd(faqs)) })}
${header()}
<main id="main">

<section class="hero blueprint">
<div class="hero-ghost" aria-hidden="true">SGI</div>
<div class="wrap"><div class="hero-grid">
<div>
<span class="pill"><i></i>Manufacturing live in ${cfg.city} &middot; Since ${cfg.since}</span>
<h1><span>Packed right.</span><span>Made next door.</span><span class="a">Delivered this week.</span></h1>
<p class="hero-lead">Corrugated cartons, printed boxes and shipping boxes made in ${cfg.city}. Sample before bulk, GST invoice, and a quote on WhatsApp within 2 hours.</p>
<div class="hero-actions"><a class="btn btn-green" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} Get quote on WhatsApp</a><a class="btn btn-ghost" href="#products">Explore products</a></div>
<p class="hero-small">GST invoice &middot; Sample before bulk &middot; Factory visits welcome &middot; Call ${cfg.phone}</p>
</div>
<aside class="factory-card" aria-label="Factory summary">
${cfg.heroPhoto ? `<img class="hero-photo" src="${esc(cfg.heroPhoto)}" alt="${esc(cfg.name)} factory, ${esc(cfg.city)}" width="800" height="600">` : `<div class="ph" role="img" aria-label="Factory photo to be added">${boxSvg}Add your factory photo<br>(see README)</div>`}
<div class="fc-foot"><span class="mono">${esc(cfg.street)}, ${esc(cfg.city)}, ${esc(cfg.region)} ${esc(cfg.postal)}</span><span class="mono">Est. ${cfg.since}</span></div>
<div class="stats">
<div class="stat"><b><span data-count="${years}">${years}</span>+</b><span>Years in business</span></div>
<div class="stat"><b><span data-count="${cfg.townsServed}">${cfg.townsServed}</span></b><span>Towns served</span></div>
<div class="stat"><b>2 hr</b><span>Quote on WhatsApp</span></div>
<div class="stat"><b>8&ndash;8</b><span>Open every day</span></div>
</div></aside>
</div></div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${marqHtml}</div></div>
<div class="trust"><div class="wrap"><ul><li>GST registered</li><li>Udyog Vihar, ${cfg.city}</li><li>In business since ${cfg.since}</li><li>Open every day, 8 AM to 8 PM</li><li>Daily deliveries to nearby towns</li></ul></div></div>

<section class="process" id="process" aria-label="Process">
<div class="process-pin"><div class="wrap"><div class="process-grid">
<div>
<span class="mono eyebrow">01 / Process</span>
<h2 style="font-weight:900;font-size:clamp(30px,5vw,56px);margin-bottom:26px">From paper to package.</h2>
<div class="step on" data-step="0"><div class="num">01</div><h3>Input</h3><p>Kraft paper reels arrive at the factory floor.</p></div>
<div class="step" data-step="1"><div class="num">02</div><h3>Corrugation</h3><p>Paper is fluted and pasted into 3-ply or 5-ply board.</p></div>
<div class="step" data-step="2"><div class="num">03</div><h3>Print &amp; cut</h3><p>Printed, die-cut and stitched to your size.</p></div>
<div class="step" data-step="3"><div class="num">04</div><h3>Delivery</h3><p>On your doorstep, from just down the road.</p></div>
<div class="dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
</div>
<div class="step-art" aria-hidden="true">
<svg id="art0" viewBox="0 0 320 240"><g class="spin"><circle cx="110" cy="120" r="70" fill="#D9B48A"/><circle cx="110" cy="120" r="46" fill="none" stroke="#B98B5E" stroke-width="3"/><circle cx="110" cy="120" r="22" fill="#FAF6F0"/></g><circle cx="230" cy="150" r="42" fill="#C79A63"/><circle cx="230" cy="150" r="14" fill="#FAF6F0"/></svg>
<svg id="art1" viewBox="0 0 320 240" style="display:none"><rect x="30" y="60" width="260" height="14" fill="#D9B48A"/><path class="flute" d="M30 110 Q47 80 64 110 T98 110 T132 110 T166 110 T200 110 T234 110 T268 110 T302 110" fill="none" stroke="#B98B5E" stroke-width="5"/><rect x="30" y="146" width="260" height="14" fill="#D9B48A"/></svg>
<svg id="art2" viewBox="0 0 320 240" style="display:none"><rect x="40" y="150" width="240" height="26" fill="#D9B48A"/><rect x="90" y="70" width="140" height="36" rx="8" fill="#13538A"/><g class="spin"><circle cx="160" cy="124" r="22" fill="#db7706"/><line x1="160" y1="102" x2="160" y2="146" stroke="#fff" stroke-width="3"/></g></svg>
<svg id="art3" viewBox="0 0 320 240" style="display:none"><line x1="20" y1="180" x2="300" y2="180" stroke="#cbd5e1" stroke-width="3"/><g class="truck"><rect x="70" y="100" width="120" height="70" fill="#13538A"/><rect x="190" y="124" width="50" height="46" fill="#db7706"/><circle cx="105" cy="176" r="12" fill="#09090B"/><circle cx="215" cy="176" r="12" fill="#09090B"/></g></svg>
</div>
</div></div></div>
</section>

<section class="sec" id="packing"><div class="wrap">
<span class="mono eyebrow">02 / Packing</span>
<h2>What are you<br>packing?</h2>
<p class="lead">Pick what goes inside your box. We will suggest the right carton for it.</p>
<div class="pack-grid" role="group" aria-label="What are you packing?">
<button class="pack-card" data-pack="fruit" aria-pressed="true"><b>Fruit &amp; produce</b><span>5-ply ventilated RSC carton</span></button>
<button class="pack-card" data-pack="oil" aria-pressed="false"><b>Oil &amp; food</b><span>3-ply or 5-ply oil-pack carton</span></button>
<button class="pack-card" data-pack="industrial" aria-pressed="false"><b>Factory &amp; industrial</b><span>5-ply heavy-duty shipping carton</span></button>
<button class="pack-card" data-pack="shop" aria-pressed="false"><b>Shop &amp; online sellers</b><span>3-ply mailer / shipping box</span></button>
</div>
<div class="detail" id="pack-detail" aria-live="polite">
<div><span class="mono eyebrow" id="pk-eyebrow">Recommended for fruit &amp; produce</span><h3 id="pk-title">5-ply ventilated RSC carton</h3><p id="pk-desc"></p><p style="margin-top:20px"><a class="btn btn-green" id="pk-cta" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} Get a quote for this</a></p></div>
<div class="specs"><div><small>Typical sizes</small><b id="pk-size"></b></div><div><small>Print options</small><b id="pk-print"></b></div><div><small>Season</small><b id="pk-season"></b></div><div><small>Lead time</small><b id="pk-lead"></b></div></div>
</div>
</div></section>

<section class="sec soft" id="box-builder"><div class="wrap">
<span class="mono eyebrow">03 / Box builder</span>
<h2>Build your box.<br>Send it on WhatsApp.</h2>
<p class="lead">Slide the size in inches, pick the ply and printing. Your box takes shape live, then send it straight to the factory for a quote within 2 hours.</p>
<div class="builder">
<div class="stage">
<svg id="box-svg" viewBox="0 0 400 300" role="img" aria-label="Live preview of your box"></svg>
<div class="dim-row"><span id="dL">L 16&Prime;</span><span id="dW">W 12&Prime;</span><span id="dH">H 10&Prime;</span></div>
<div class="calc"><div><small>Est. carton volume</small><b id="vol">31.5 L</b></div><div><small>Est. board area</small><b id="area">8.9 ft&sup2;</b></div></div>
</div>
<form class="panel" id="builder" onsubmit="return false">
<fieldset><legend class="mono" style="color:var(--muted);margin-bottom:8px">Box type</legend><div class="seg">
<input type="radio" name="type" id="t1" value="Regular slotted" checked><label for="t1">Regular slotted</label>
<input type="radio" name="type" id="t2" value="Die-cut"><label for="t2">Die-cut</label>
<input type="radio" name="type" id="t3" value="Tray"><label for="t3">Tray</label></div></fieldset>
<div class="fld"><label for="L">Length (in)</label><div class="slide"><input type="range" id="Lr" min="4" max="48" value="16" aria-label="Length slider"><input type="number" id="L" min="4" max="48" value="16"></div></div>
<div class="fld"><label for="W">Width (in)</label><div class="slide"><input type="range" id="Wr" min="4" max="36" value="12" aria-label="Width slider"><input type="number" id="W" min="4" max="36" value="12"></div></div>
<div class="fld"><label for="H">Height (in)</label><div class="slide"><input type="range" id="Hr" min="2" max="36" value="10" aria-label="Height slider"><input type="number" id="H" min="2" max="36" value="10"></div></div>
<fieldset><legend class="mono" style="color:var(--muted);margin-bottom:8px">Ply</legend><div class="seg">
<input type="radio" name="ply" id="p1" value="1"><label for="p1">1-ply</label>
<input type="radio" name="ply" id="p2" value="2"><label for="p2">2-ply</label>
<input type="radio" name="ply" id="p3" value="3"><label for="p3">3-ply</label>
<input type="radio" name="ply" id="p5" value="5" checked><label for="p5">5-ply</label></div></fieldset>
<fieldset><legend class="mono" style="color:var(--muted);margin-bottom:8px">Printing</legend><div class="seg">
<input type="radio" name="print" id="q0" value="0" checked><label for="q0">No printing</label>
<input type="radio" name="print" id="q1" value="1"><label for="q1">1 colour</label>
<input type="radio" name="print" id="q2" value="2"><label for="q2">2 colour</label></div></fieldset>
<div class="fld"><label for="qty">Quantity</label><input type="number" id="qty" min="1" value="500"></div>
<a class="btn btn-green" id="bwa" href="${WA_DEFAULT}" data-track="whatsapp" style="width:100%">${icon.chat} Send this to SGI on WhatsApp</a>
<p class="note">Quote within 2 hours. No prices online: every box is made to order, so we quote for your exact size.</p>
</form>
</div>
</div></section>

<section class="sec" id="delivery"><div class="wrap">
<span class="mono eyebrow">04 / Delivery map</span>
<h2>Freight was never<br>your problem.</h2>
<p class="lead">Boxes are bulky. That is why we serve the markets next door better than anyone far away. Tap your town.</p>
<div class="legend"><span><i style="background:var(--green)"></i>Ring 1 &middot; same / next day</span><span><i style="background:var(--accent)"></i>Ring 2 &middot; ~2 days</span><span><i style="background:var(--navy)"></i>Ring 3 &middot; large orders</span></div>
<div class="map-wrap">
<div class="map"><svg id="map-svg" viewBox="0 0 800 590" role="group" aria-label="Delivery map around ${cfg.city}"></svg></div>
<div class="town-box" id="town-box" aria-live="polite"><span class="mono" style="color:#94a3b8">Tap a town</span><h3>${cfg.city}</h3><p>Our factory is here. Tap any town on the map to see delivery time.</p><a class="btn btn-green" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} Ask for delivery</a></div>
</div>
<p class="tiny">Stylised map &mdash; positions and distances are indicative, not to scale.</p>
</div></section>

<section class="sec soft" id="why-local"><div class="wrap">
<span class="mono eyebrow">05 / Why local</span>
<h2>Why buy from<br>next door?</h2>
<div class="cards3" style="margin-top:36px">
<div class="card"><span class="n">01</span><h3>Same-day delivery nearby</h3><p>Our factory is in Udyog Vihar, ${cfg.city}. Orders for the city and nearby towns move the same day or the next morning.</p></div>
<div class="card"><span class="n">02</span><h3>See your sample first</h3><p>We make a sample before bulk production, so you approve the exact box you are paying for: size, ply and print.</p></div>
<div class="card"><span class="n">03</span><h3>Visit the factory</h3><p>Quick print changes and face-to-face planning. Walk in any day between 8 AM and 8 PM and talk directly to the owner.</p></div>
</div>
</div></section>

<section class="sec" id="products"><div class="wrap">
<span class="mono eyebrow">06 / Products</span>
<h2>Corrugated boxes made<br>in ${cfg.city}.</h2>
<p class="lead">Every box is made to order at our Udyog Vihar factory. Hover or tap a card to see build details.</p>
<div class="pgrid">
${products.map(p => `<article class="prod" tabindex="0"><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p><div class="specs"><div><small>Ply</small><b>${esc(p[2])}</b></div><div><small>Sizes</small><b>${esc(p[3])}</b></div><div><small>Print</small><b>${esc(p[4])}</b></div></div><a class="more" href="${wa('Hello SGI, I need a quote for ' + p[5] + '.')}" data-track="whatsapp">Get quote &rarr;</a></article>`).join('\n')}
</div>
</div></section>

<section class="sec soft" id="factory"><div class="wrap">
<span class="mono eyebrow">07 / Factory &amp; quality</span>
<h2>Inside the Udyog Vihar<br>factory.</h2>
<p class="lead">Come see your boxes being made. Factory visits are welcome every day, 8 AM to 8 PM.</p>
<div class="gal">${gallery}</div>
<div class="two">
<div class="card"><h3>Under one roof</h3><p>Corrugation, printing, die-cutting and stitching all happen at our Udyog Vihar factory, so your size and print changes are quick, and you deal with the maker directly.</p></div>
<div class="card"><h3>Capacity</h3><p>Capacity scales with your order. Tell us your monthly quantity and we plan production around it, so regular buyers never wait.</p><h3 style="margin-top:22px">Quality checks</h3><ul class="checks"><li>Size and print check on every batch</li><li>Sample approved by you before bulk production</li><li>Visit the factory and check quality yourself</li></ul></div>
</div>
</div></section>

<section class="numbers"><div class="wrap"><span class="mono eyebrow" style="display:block;margin-bottom:18px">08 / Numbers</span><div class="numgrid"><div><b data-count="${years}">${years}</b><span>Years in business</span></div><div><b data-count="${cfg.townsServed}">${cfg.townsServed}</b><span>Towns served</span></div></div></div></section>

<section class="sec" id="faq"><div class="wrap faq">
<span class="mono eyebrow">10 / FAQ</span>
<h2>Questions buyers<br>ask us most.</h2>
<p class="lead">Minimum order, delivery, printing, GST invoice: the things every buyer wants to know first.</p>
${faqs.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('\n')}
</div></section>

<section class="sec soft" id="connect"><div class="wrap">
<span class="mono eyebrow">11 / Connect</span>
<h2>Connect<br>with us.</h2>
<p class="lead">Send your box size on WhatsApp and get a quote within 2 hours. The phone number is never hidden behind a form.</p>
<div class="connect">
<div class="contact-card">
<h3>${esc(cfg.person)}</h3><div class="role">${cfg.role}, ${esc(cfg.name)}</div>
<p style="margin-top:14px"><span class="open-badge" id="open-badge"><i></i><b id="open-text">Open daily ${cfg.hoursText}</b></span></p>
<a class="big-phone" href="tel:+${cfg.phoneIntl}" data-track="call">${cfg.phone}</a>
<div class="row"><a class="btn btn-light btn-sm" href="tel:+${cfg.phoneIntl}" data-track="call">${icon.phone} Tap to call</a><a class="btn btn-green btn-sm" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} WhatsApp us</a></div>
<ul><li>${esc(address)}</li><li>Open every day, ${cfg.hoursText}</li>${cfg.email ? `<li><a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a></li>` : ''}</ul>
<a class="btn btn-light btn-sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cfg.name + ' ' + cfg.street + ' ' + cfg.city + ' ' + cfg.region + ' ' + cfg.postal)}" target="_blank" rel="noopener">Get directions</a>
</div>
<form class="form-card" id="quote-form">
<span class="mono eyebrow">Quick quote form</span><h3>Tell us what you need.</h3>
<p style="color:#475569">Fill this in and we open WhatsApp with your details so they reach ${esc(cfg.person)} instantly.</p>
<div class="form-grid">
<div><label for="f-name">Name</label><input type="text" id="f-name" required autocomplete="name"></div>
<div><label for="f-phone">Phone</label><input type="tel" id="f-phone" required autocomplete="tel" inputmode="tel"></div>
<div><label for="f-town">Town</label><select id="f-town"></select></div>
<div><label for="f-qty">Quantity</label><input type="text" id="f-qty" placeholder="e.g. 500 boxes"></div>
<div class="full"><label for="f-size">Box size (L x W x H)</label><input type="text" id="f-size" placeholder="e.g. 16 x 12 x 10 inch"></div>
<div class="full"><label for="f-msg">Anything else</label><textarea id="f-msg" rows="3" placeholder="Printing, ply, delivery date..."></textarea></div>
</div>
<button class="btn btn-green" type="submit" style="width:100%">${icon.chat} Save &amp; send on WhatsApp</button>
<p class="msg" id="f-msg-out" role="status"></p>
<p class="note">Prefer talking? Call ${cfg.phone}, open daily 8 AM to 8 PM.</p>
</form>
</div>
</div></section>

<section class="cta blueprint-dark"><div class="wrap">
<span class="mono" style="color:#94a3b8;display:block;margin-bottom:16px">12 / Get started</span>
<h2>Get your boxes<br>from next door.</h2>
<div class="row"><a class="btn btn-green" href="${WA_DEFAULT}" data-track="whatsapp">${icon.chat} WhatsApp ${cfg.phone}</a><a class="btn btn-light" href="tel:+${cfg.phoneIntl}" data-track="call">${icon.phone} Call ${cfg.phone}</a></div>
<p>${esc(address)}<br>Open every day, ${cfg.hoursText}</p>
</div></section>

</main>
${footer()}
<script>window.SGI=${JSON.stringify(appData)};</script>
<script src="assets/js/app.js" defer></script>
</body></html>
`;
}

function buildTown(t) {
  const url = `${cfg.siteUrl}/corrugated-boxes-${t.slug}/`;
  const nearby = t.nearby.map(s => towns.find(x => x.slug === s)).filter(Boolean);
  const faq = [[t.faq.q, t.faq.a]];
  const msg = wa(`Hello SGI, I am in ${t.name}. I need a quote for corrugated boxes.`);
  const ldCrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: cfg.siteUrl + '/' },
    { '@type': 'ListItem', position: 2, name: `Corrugated boxes in ${t.name}`, item: url }] };
  return `${head({ title: t.title, desc: t.description, url, depth: 1, extra: ld(jsonLdBusiness()) + ld(faqLd(faq)) + ld(ldCrumb) })}
${header(1)}
<main id="main">
<section class="town-hero blueprint"><div class="wrap">
<p class="crumbs"><a href="../index.html">Home</a> / Corrugated boxes in ${esc(t.name)}</p>
<span class="pill"><i></i>${ringLabel[t.ring]} &middot; from ${cfg.city}</span>
<h1>${esc(t.h1)}</h1>
<p class="lead">${esc(t.intro)}</p>
<div class="hero-actions"><a class="btn btn-green" href="${msg}" data-track="whatsapp">${icon.chat} Get quote on WhatsApp</a><a class="btn btn-ghost" href="tel:+${cfg.phoneIntl}" data-track="call">${icon.phone} Call ${cfg.phone}</a></div>
</div></section>
<div class="wrap"><div class="town-body" style="padding-top:40px">
<div class="card"><h3>Who we supply in ${esc(t.name)}</h3><ul class="checks">${t.supply.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
<h3 style="margin-top:28px">Delivery</h3><p style="margin-top:10px">${esc(t.delivery)}</p>
<h3 style="margin-top:28px">${esc(t.faq.q)}</h3><p style="margin-top:10px">${esc(t.faq.a)}</p></div>
<div>
<div class="contact-card"><h3>${esc(cfg.person)}</h3><div class="role">${cfg.role}, ${esc(cfg.name)}</div><a class="big-phone" href="tel:+${cfg.phoneIntl}" data-track="call">${cfg.phone}</a><ul><li>${esc(address)}</li><li>Open every day, ${cfg.hoursText}</li></ul><a class="btn btn-green btn-sm" href="${msg}" data-track="whatsapp">${icon.chat} WhatsApp us</a></div>
<div class="card" style="margin-top:16px"><h3>Nearby towns</h3><div class="link-list">${nearby.map(n => `<a href="../corrugated-boxes-${n.slug}/">${esc(n.name)}</a>`).join('')}<a href="../index.html#products">All products</a><a href="../index.html#connect">Get a quote</a></div></div>
</div>
</div></div>
</main>
${footer(1)}
<script>window.SGI=${JSON.stringify({ phone: cfg.phone, phoneIntl: cfg.phoneIntl, since: cfg.since, opens: cfg.opens, closes: cfg.closes, formEndpoint: '' })};</script>
<script src="../assets/js/app.js" defer></script>
</body></html>
`;
}

function build404() {
  return `${head({ title: `Page not found | ${cfg.name}`, desc: 'This page does not exist.', url: cfg.siteUrl + '/404.html', extra: '<meta name="robots" content="noindex">' })}
${header()}
<main id="main"><section class="town-hero blueprint"><div class="wrap"><h1>Page not found</h1><p class="lead">That page does not exist. Go back to the home page or message us on WhatsApp.</p><div class="hero-actions"><a class="btn btn-dark" href="/index.html">Home</a><a class="btn btn-green" href="${WA_DEFAULT}">${icon.chat} WhatsApp</a></div></div></section></main>
${footer()}
</body></html>
`;
}

const write = (rel, data) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
write('index.html', buildHome());
towns.forEach(t => write(`corrugated-boxes-${t.slug}/index.html`, buildTown(t)));
write('404.html', build404());
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [`${cfg.siteUrl}/`, ...towns.map(t => `${cfg.siteUrl}/corrugated-boxes-${t.slug}/`)].map(u => `<url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
write('site.webmanifest', JSON.stringify({ name: cfg.name, short_name: 'SGI Paper Box', start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#09090B', icons: [{ src: '/assets/img/logo-mark.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2) + '\n');
console.log(`Built index.html, ${towns.length} town pages, 404.html, sitemap.xml, robots.txt, site.webmanifest`);
