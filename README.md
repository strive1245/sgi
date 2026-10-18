# Shree Ganpati Paper Box Industries (SGI) website

Static site, no framework. Corrugated boxes made in Sri Ganganagar, Rajasthan.

## Edit content
- Business details (phone, address, hours, year): `site.config.json`
- 13 town SEO pages: `data/towns.json`
- Then rebuild: `node scripts/build.js` (generates `index.html`, `corrugated-boxes-*/`, `sitemap.xml`, `robots.txt`, `404.html`)

## Before going live
1. Put your main factory photo at `assets/img/factory.jpg` and set `"heroPhoto": "assets/img/factory.jpg"` in `site.config.json` (shows in the home page hero card).
1. Add more factory photos to `assets/img/` and list them in `gallery` in `site.config.json`.
2. Add `assets/img/og-image.png` (1200x630) for link previews.
3. Optional: set `email` and `formEndpoint` (e.g. a Formspree URL) in `site.config.json`. Without it, quotes go via WhatsApp.
4. Rebuild, commit, push.

## Run locally
`npm start` then open http://localhost:3000

## Deploy
Netlify, Cloudflare Pages or GitHub Pages: no build command needed (build output is committed); publish directory is the repo root. Point sgiboxes.com at it.

## After launch
Submit `sitemap.xml` in Google Search Console; claim the Google Business Profile with the same name and phone (8005810091) as Justdial/IndiaMART.
