# Cyprus Housing

An interactive look at housing affordability in Cyprus: what people earn, what
renting and buying actually cost across the five districts, the deposit wall that
keeps first-time buyers renting, and the measurement gap that lets the island hold
the EU's lowest housing-cost share and a real affordability crisis at the same time.

Static React site (Vite). No backend — every figure
lives in a single JSON file the component imports at build time.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## How the data works

- `**src/data/housing.json**` is the single source of truth — incomes, rents, sale
prices, sizes, trends, schemes, every figure the piece shows. `App.jsx` imports it
at build time; nothing is fetched in the browser. Edit the JSON and rebuild, and the
calculator, map, tables and charts all update.
- **Current rents and sale prices** are median asking figures from live property-portal
listings (Bazaraki / Spitogatos), captured June 2026, with sample sizes in each
`note` field. They are asking prices and run above closing prices — flagged as such.
- **Trends** (rent-vs-wage, Cyprus vs EU) are indexed series from Eurostat (HICP rents,
compensation per employee) and CYSTAT. Overburden, arrears, tenure and under-occupation
are Eurostat EU-SILC; buyer nationality, transactions and building permits are DLS,
PwC and CYSTAT. Every series carries its source in the article footer.

## Deploy (standalone site)

Any static host works. Recommended: **Vercel** or **Cloudflare Pages** — free, custom
domain, auto-deploy on push to `main`.

1. Push this repo to GitHub.
2. Import it in Vercel / Cloudflare Pages (Vite is auto-detected via `vercel.json`).
  - Build command: `npm run build`
  - Output directory: `dist`
3. Add your domain. Every push to `main` redeploys.

`base: './'` in `vite.config.js` keeps asset paths relative, so it also works from a
project subpath or embedded.

## Embedding in articles

- **A site you control:** drop in an `<iframe>` pointing at the deployed URL.
- **Medium:** Medium only embeds from its Embedly allow-list, so a custom iframe won't
render. Link out to the live site and use a screenshot or a short screen-recording GIF
inline. (Check Medium's current embed behaviour before publishing.)

## Attribution & fair use

Rents and prices are median asking figures compiled from public listings on Bazaraki
and Spitogatos (June 2026); official statistics are from Eurostat, CYSTAT, the Central
Bank of Cyprus and the Department of Lands & Surveys, each credited in the footer.
Asking prices run above transaction (closing) prices and are labelled accordingly. The
asking-rent index and the household affordability ratios are the author's own and are
indicative, not an official register.
