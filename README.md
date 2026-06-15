# Cyprus housing affordability — interactive data piece

**The most affordable housing in the EU. And a housing crisis. Can both be true?**

An interactive, data-driven article on housing affordability in Cyprus. It reconciles a paradox: on the official EU measures Cyprus households spend the lowest share of income on housing in the bloc (11%), yet new movers face asking rents and a deposit wall that put both renting and buying out of reach. The spine is a *measurement gap* — the official numbers describe people already housed; the squeeze is on those entering the market.

Companion piece to the Cyprus water/reservoirs analysis.

## What's inside

- **Earnings** — gross and net pay (minimum / median / mean), with an interactive distribution showing why the mean sits above the median.
- **Rent burden calculator** — pick a household and district, see rent as a share of take-home pay.
- **Matched households** — rent vs net income for realistic household/home pairings.
- **The measurement gap** — why the official 11% cost share stays low (outright ownership, family transfer).
- **Rents vs pay, Cyprus vs EU** — indexed series; Cyprus asking rents rose ~2× the EU rate while wages tracked the EU.
- **Arrears** — the one official measure that is rising.
- **Prices by district** — stylised map of rents and sale prices, plus price per m².
- **Buying blocked** — a deposit/savings tool and a worked household example.
- **Foreign buyers, supply, short-term lets, the building pipeline, and state schemes.**

## Data & sourcing

Current rent and sale **price levels** are median asking prices from live property-portal listings (Bazaraki / Spitogatos), June 2026. **Trends** use Eurostat (HICP rents, compensation per employee) and CYSTAT indices. **Overburden, arrears, tenure** are Eurostat EU-SILC (2024) and the Central Bank of Cyprus. **Buyer nationality, transactions and building permits** are from the Department of Lands & Surveys, PwC and CYSTAT. Full method and sources are in the article footer. Asking prices run above transaction (closing) prices and are labelled as such.

## Tech

Vite + React (no backend). All content lives in `src/App.jsx`; figures are centralised in `src/data/housing.json`.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the build
```

## Deploy

Deploys to Vercel as a static Vite app (`vercel.json` sets framework, build command and output directory). Import the GitHub repo in Vercel; the defaults are auto-detected.
