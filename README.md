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

## Google Analytics 4 (free standard property)
Set `googleAnalyticsId` in `site.config.json` to your GA4 web stream Measurement ID (`G-...`), then run `npm run build`. Alternatively set the `GA_MEASUREMENT_ID` environment variable for the build. An empty ID leaves analytics disabled; an invalid ID stops the build.

The Google tag loads asynchronously on every generated page. Existing `contact_click` events record WhatsApp and call clicks using `method` and `page`; they do not contain enquiry form contents. Confirm page views and contact clicks in GA4 Realtime after deployment.

### Google Tag Manager
`googleTagManagerId` is set to the supplied container `GTM-5R77Z3KJ`. The provided async Google Tag Manager snippet is generated on every page. Keep the direct `googleAnalyticsId` empty when using GTM. Configure and publish the GA4 destination inside this container, then verify reports in GA4 Realtime; installing a container alone does not confirm that a GA4 destination is configured.
