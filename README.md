# Cyprus Housing

An interactive look at housing affordability in Cyprus: what people earn, what
renting and buying actually cost across the five districts, the deposit wall that
keeps first-time buyers renting, and the measurement gap that lets the island hold
the EU's lowest housing-cost share and a real affordability crisis at the same time.

Static React site (Vite). No backend — every figure
lives in a single JSON file the component imports at build time.

🔗 Live: [https://cyprus-housing-analysis.vercel.app](https://cyprus-housing-analysis.vercel.app/)  ·  Read the full piece, interactive charts and all.


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

## Attribution & fair use

Rents and prices are median asking figures compiled from public listings on Bazaraki
and Spitogatos (June 2026); official statistics are from Eurostat, CYSTAT, the Central
Bank of Cyprus and the Department of Lands & Surveys, each credited in the footer.
Asking prices run above transaction (closing) prices and are labelled accordingly. The
asking-rent index and the household affordability ratios are the author's own and are
indicative, not an official register.
