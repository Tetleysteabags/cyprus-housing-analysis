import React, { useState, useMemo, useEffect } from "react";
import DATA from "./data/housing.json";

const eur = (n) => "€" + Math.round(n).toLocaleString("en-US");

/* ---------- signature interactive: the rent-burden meter ---------- */
function Calculator() {
  const [household, setHousehold] = useState("couple");
  const [earnings, setEarnings] = useState("median");
  const [district, setDistrict] = useState("Nicosia");
  const [beds, setBeds] = useState("2");

  const net = DATA.income.householdNet[household][earnings];
  const rent = DATA.rents[district][beds];
  const burden = (rent / net) * 100;
  const zone = burden < 30 ? "calm" : burden <= 40 ? "warn" : "alarm";
  const left = net - rent;

  const verdict =
    zone === "calm"
      ? "Affordable — below the 30% comfort line."
      : zone === "warn"
      ? "Stretched — between the 30% comfort line and the 40% overburden line."
      : "Overburdened — above the 40% line economists treat as unaffordable.";

  const scale = 90; // meter runs 0–90% of income
  const pct = Math.min(burden, scale) / scale * 100;

  const Chip = ({ v, cur, set, children }) => (
    <button className={"chip" + (v === cur ? " on" : "")} onClick={() => set(v)}>{children}</button>
  );

  return (
    <div className="calc">
      <div className="calcgrid">
        <div className="field">
          <label>Household</label>
          <div className="chips">
            <Chip v="single" cur={household} set={(x) => { setHousehold(x); setBeds("1"); }}>One earner</Chip>
            <Chip v="couple" cur={household} set={(x) => { setHousehold(x); setBeds("2"); }}>A couple</Chip>
          </div>
        </div>
        <div className="field">
          <label>Earning</label>
          <div className="chips">
            <Chip v="minimum" cur={earnings} set={setEarnings}>Minimum wage</Chip>
            <Chip v="median" cur={earnings} set={setEarnings}>Median pay</Chip>
            <Chip v="above" cur={earnings} set={setEarnings}>Above average</Chip>
          </div>
        </div>
        <div className="field">
          <label>Looking in</label>
          <div className="chips">
            {["Nicosia", "Limassol", "Larnaca", "Paphos"].map((d) => (
              <Chip key={d} v={d} cur={district} set={setDistrict}>{d}</Chip>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Size</label>
          <div className="chips">
            {["1", "2", "3"].map((b) => (
              <Chip key={b} v={b} cur={beds} set={setBeds}>{b}-bed</Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="readout">
        <div className="ro"><span className="rok">Take-home, combined</span><span className="rov">{eur(net)}/mo</span></div>
        <div className="ro"><span className="rok">Asking rent</span><span className="rov">{eur(rent)}/mo</span></div>
        <div className="ro"><span className="rok">Left for everything else</span><span className={"rov" + (left < 0 ? " neg" : "")}>{eur(left)}/mo</span></div>
      </div>

      <div className="meterwrap">
        <div className="meterbar">
          <div className={"meterfill " + zone} style={{ width: pct + "%" }} />
          <div className="mark" style={{ left: (30 / scale * 100) + "%" }}><span>30%</span></div>
          <div className="mark" style={{ left: (40 / scale * 100) + "%" }}><span>40%</span></div>
        </div>
        <div className={"burdennum " + zone}>{burden.toFixed(0)}%<span> of take-home pay goes on rent</span></div>
      </div>
      <p className={"verdict " + zone}>{verdict}</p>
      <p className="fineprint">
        Net pay modelled from 2026 tax, social-insurance and health rules. Rents are median asking rents for apartments
        from live property-portal listings (June 2026) — what a mover faces today. Asking rents run above what tenancies
        finally settle at.
      </p>
    </div>
  );
}

/* ---------- the overburden flip ---------- */
function OverburdenFlip() {
  const W = 680, H = 300, padL = 150, padR = 90, padT = 24, padB = 40;
  const max = 22;
  const rows = [
    { label: "Everyone (the headline)", cy: DATA.overburden.allPopulation.cy, eu: DATA.overburden.allPopulation.eu },
    { label: "Renters at market price", cy: DATA.overburden.marketTenant.cy, eu: DATA.overburden.marketTenant.eu },
  ];
  const x = (v) => padL + (v / max) * (W - padL - padR);
  const band = (H - padT - padB) / rows.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Housing cost overburden, Cyprus vs EU">
      {[0, 5, 10, 15, 20].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={padT} y2={H - padB} className="grid" />
          <text x={x(t)} y={H - padB + 18} className="axis" textAnchor="middle">{t}%</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const yc = padT + band * i + band / 2 - 20;
        const ye = padT + band * i + band / 2 + 6;
        return (
          <g key={r.label}>
            <text x={padL - 12} y={padT + band * i + band / 2} className="rowlab" textAnchor="end">{r.label}</text>
            <rect x={padL} y={yc} width={x(r.cy) - padL} height={20} className="bar-cy" />
            <text x={x(r.cy) + 8} y={yc + 15} className="barval-cy">{r.cy}%  Cyprus</text>
            <rect x={padL} y={ye} width={x(r.eu) - padL} height={20} className="bar-eu" />
            <text x={x(r.eu) + 8} y={ye + 15} className="barval-eu">{r.eu}%  EU avg</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- national buyer composition ---------- */
function BuyerSplit() {
  const W = 680, H = 130, padL = 12, padR = 12, padT = 30, padB = 40;
  const segs = [
    { k: "Cypriot buyers", v: DATA.buyers2025.domestic.share, cls: "seg-dom" },
    { k: "EU buyers", v: DATA.buyers2025.eu.share, cls: "seg-eu" },
    { k: "Non-EU buyers", v: DATA.buyers2025.nonEu.share, cls: "seg-non" },
  ];
  const innerW = W - padL - padR;
  let acc = 0;
  const avgX = padL + (100 - DATA.buyers2025.foreignShare18yrAvg) / 100 * innerW;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Property buyers by origin, 2025">
      {segs.map((s) => {
        const w = (s.v / 100) * innerW;
        const xpos = padL + (acc / 100) * innerW;
        acc += s.v;
        return (
          <g key={s.k}>
            <rect x={xpos} y={padT} width={w} height={42} className={s.cls} />
            <text x={xpos + w / 2} y={padT + 26} className="segval" textAnchor="middle">{s.v}%</text>
            <text x={xpos + w / 2} y={padT + 60} className="seglab" textAnchor="middle">{s.k}</text>
          </g>
        );
      })}
      <line x1={avgX} x2={avgX} y1={padT - 10} y2={padT + 42} className="avgline" />
      <text x={avgX} y={padT - 14} className="avglab" textAnchor="middle">18-yr foreign avg: {DATA.buyers2025.foreignShare18yrAvg}%</text>
    </svg>
  );
}

/* ---------- permits vs sales: the leading ratio ---------- */
function PermitsSales() {
  const f = DATA.flow2026;
  const W = 680, H = 150, padL = 130, padR = 70, padT = 16;
  const max = 2000;
  const x = (v) => padL + (v / max) * (W - padL - padR);
  const rows = [
    { label: "Permitted (Jan)", v: f.janPermitUnits, cls: "bar-permit" },
    { label: "Sold (Jan)", v: f.janSales, cls: "bar-sold" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Units permitted vs sold, January 2026">
      {rows.map((r, i) => {
        const y = padT + i * 56;
        return (
          <g key={r.label}>
            <text x={padL - 12} y={y + 24} className="rowlab" textAnchor="end">{r.label}</text>
            <rect x={padL} y={y} width={x(r.v) - padL} height={36} className={r.cls} />
            <text x={x(r.v) + 8} y={y + 24} className="barnum">{r.v.toLocaleString()}</text>
          </g>
        );
      })}
      <text x={padL} y={H - 6} className="ratiolab">For the first time in years, the pipeline is running ahead of the sales pace — a ratio of {f.permitsToSales}×.</text>
    </svg>
  );
}

/* ---------- wage ladder: where minimum/median/mean sit ---------- */
function WageLadder({ note, net }) {
  const g = net ? DATA.income.net : DATA.income.gross;
  const max = 3000;
  const pos = (v) => (v / max) * 100;
  const pins = [
    { k: "Minimum wage", v: g.minWage },
    { k: "Median worker", v: g.median },
    { k: "Average (mean)", v: g.mean },
  ];
  return (
    <div className="ladder">
      <div className="laddertrack">
        {[1000, 2000, 3000].map((t) => (
          <div key={t} className="ltick" style={{ left: pos(t) + "%" }}><span>{eur(t)}</span></div>
        ))}
        {pins.map((p, i) => (
          <div key={p.k} className={"pin pin" + i} style={{ left: pos(p.v) + "%" }}>
            <span className="pindot" />
            <span className="pinlab">{p.k}<b>{eur(p.v)}</b></span>
          </div>
        ))}
      </div>
      <p className="laddernote">
        {note || (
          <>Monthly gross pay. The <em>average</em> sits well above the <em>median</em> because a minority of high earners
          pull it up &mdash; so the typical worker earns nearer the median. Use the interactive chart below to see how
          adding workers of different income levels affects the median and mean.</>
        )}
      </p>
    </div>
  );
}

/* ---------- foreign-buyer trend ---------- */
function ForeignTrend() {
  const t = DATA.foreignTrend;
  const W = 680, H = 230, padL = 44, padR = 16, padT = 18, padB = 38;
  const max = 2800;
  const n = t.years.length;
  const bw = (W - padL - padR) / n * 0.55;
  const step = (W - padL - padR) / n;
  const x = (i) => padL + step * i + step / 2;
  const y = (v) => padT + (1 - v / max) * (H - padT - padB);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Non-EU property transfers by year">
      {[0, 1000, 2000].map((g) => (
        <g key={g}>
          <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} className="grid" />
          <text x={padL - 8} y={y(g) + 4} className="axis" textAnchor="end">{g.toLocaleString()}</text>
        </g>
      ))}
      {t.years.map((yr, i) => {
        const v = t.nonEuDeeds[i];
        const h = y(0) - y(v);
        return (
          <g key={yr}>
            <rect x={x(i) - bw / 2} y={y(v)} width={bw} height={h} className={i >= 3 ? "bar-flat" : "bar-rise"} />
            <text x={x(i)} y={y(v) - 7} className="barnum" textAnchor="middle">{v.toLocaleString()}</text>
            <text x={x(i)} y={H - padB + 18} className="axis" textAnchor="middle">{yr}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- interactive: how mean and median move ---------- */
function WageDistribution() {
  // ~47 workers shaped like Cyprus's real earnings distribution (right-skewed)
  const START = [
    ...Array(5).fill(750), ...Array(13).fill(1250), ...Array(9).fill(1750),
    ...Array(6).fill(2250), ...Array(4).fill(2750), ...Array(3).fill(3250),
    ...Array(2).fill(3750), ...Array(2).fill(4250), 4750, 5250, 5750,
  ];
  const [people, setPeople] = useState(START);
  const [pick, setPick] = useState(2000);

  const sorted = [...people].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = people.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  const W = 680, H = 230, padL = 22, padR = 22, padT = 30, padB = 42;
  const MAXX = 6000, BIN = 500, NB = MAXX / BIN; // 12 bins, last holds 6000+
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vx = (v) => padL + (Math.min(v, MAXX) / MAXX) * plotW;
  const counts = Array(NB).fill(0);
  people.forEach((s) => { counts[Math.min(Math.floor(s / BIN), NB - 1)]++; });
  const maxC = Math.max(...counts, 1);
  const by = (c) => padT + plotH * (1 - c / maxC);

  const add = (v) => setPeople((p) => [...p, v]);

  return (
    <div className="dist">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Salary histogram with mean and median">
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} className="axisline" />
        {counts.map((c, i) => {
          const x0 = vx(i * BIN), x1 = vx((i + 1) * BIN);
          return c ? <rect key={i} x={x0 + 1.5} y={by(c)} width={x1 - x0 - 3} height={padT + plotH - by(c)} className={i === NB - 1 ? "hbar hi" : "hbar"} /> : null;
        })}
        {[0, 2000, 4000, 6000].map((t) => (
          <text key={t} x={vx(t)} y={H - padB + 18} className="axis" textAnchor="middle">{t === 6000 ? "6k+" : "\u20ac" + t / 1000 + "k"}</text>
        ))}
        <line x1={vx(median)} x2={vx(median)} y1={padT - 14} y2={padT + plotH} className="medline" />
        <text x={vx(median)} y={padT - 18} className="medlab" textAnchor="middle">median {eur(median)}</text>
        <line x1={vx(mean)} x2={vx(mean)} y1={padT - 14} y2={padT + plotH} className="meanline" />
        <text x={vx(mean)} y={padT - 4} className="meanlab" textAnchor="middle">mean {eur(mean)}</text>
      </svg>

      <div className="distctrl">
        <div className="distadd">
          <input type="range" min="800" max="12000" step="100" value={pick}
            onChange={(e) => setPick(+e.target.value)} aria-label="Choose a salary" />
          <button className="addbtn" onClick={() => add(pick)}>Add a {eur(pick)} earner</button>
        </div>
        <div className="distquick">
          <button className="chip" onClick={() => add(1000)}>+ €1,000 worker</button>
          <button className="chip" onClick={() => add(10000)}>+ €10,000 earner</button>
          <button className="chip" onClick={() => setPeople(START)}>Reset</button>
        </div>
      </div>
      <p className="laddernote">
        A sample of {n} workers, shaped like Cyprus's actual pay distribution. Adding a few high earners moves the
        {" "}<strong>mean</strong> to the right while the <strong>median</strong>, the middle worker, changes little. That
        gap is why the average overstates the typical wage, and why this article uses the median.
      </p>
    </div>
  );
}

/* ---------- rents vs wages, indexed ---------- */
function RentWageDivergence() {
  const t = DATA.trends;
  const W = 680, H = 286, padL = 40, padR = 28, padT = 16, padB = 34;
  const xs = t.years, min = 96, max = 132;
  const x = (i) => padL + (i / (xs.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const path = (arr) => arr.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const lines = [
    { k: "askingRent", lab: "Cyprus asking rents", cls: "ln-rent" },
    { k: "euRent", lab: "EU rents", cls: "ln-eurent" },
    { k: "wage", lab: "Cyprus wages", cls: "ln-wage" },
    { k: "officialRent", lab: "Cyprus official rent index", cls: "ln-off" },
  ];
  return (
    <div className="divwrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Cyprus and EU rents and wages, indexed to 2020">
        {[100, 110, 120, 130].map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} className="grid" />
            <text x={padL - 8} y={y(g) + 4} className="axis" textAnchor="end">{g}</text>
          </g>
        ))}
        {xs.map((yr, i) => (
          <text key={yr} x={x(i)} y={H - padB + 18} className="axis" textAnchor="middle">{yr}</text>
        ))}
        {lines.map((l) => <path key={l.k} d={path(t[l.k])} className={l.cls} fill="none" />)}
      </svg>
      <div className="divlegend">
        {lines.map((l) => (
          <span key={l.k} className="leg"><span className={"legline " + l.cls} />{l.lab}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- interactive map: prices by district ---------- */
function CyprusMap() {
  const [mode, setMode] = useState("rent"); // rent | buy
  const [beds, setBeds] = useState("2");
  const cities = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"];
  const src = mode === "rent" ? DATA.rents : DATA.buy;
  const vals = cities.map((c) => src[c][beds]);
  const min = Math.min(...vals), max = Math.max(...vals);

  const W = 960, H = 540;
  const px = (lon) => (lon - 32.15) / (34.65 - 32.15) * 900 + 30;
  const py = (lat) => (35.78 - lat) / (35.78 - 34.5) * 470 + 30;
  // ~clockwise coastline of Cyprus (Republic + whole island silhouette)
  const coast = [
    [32.27,35.09],[32.43,35.04],[32.58,35.17],[32.73,35.18],[32.95,35.20],[32.92,35.36],
    [33.32,35.34],[33.66,35.34],[34.00,35.42],[34.20,35.50],[34.58,35.69],[34.42,35.55],
    [34.18,35.42],[34.05,35.28],[33.96,35.12],[34.00,35.00],[34.08,34.96],[33.90,34.97],
    [33.63,34.91],[33.50,34.80],[33.28,34.71],[33.04,34.58],[32.83,34.66],[32.66,34.66],
    [32.42,34.74],[32.33,34.86],[32.27,34.98],
  ];
  const path = coast.map((p, i) => (i ? "L" : "M") + px(p[0]).toFixed(1) + " " + py(p[1]).toFixed(1)).join(" ") + " Z";

  const lerp = (t) => {
    const a = [52, 91, 134], b = [197, 83, 46]; // calm -> alarm
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  // label placement clear of the dot: pos = above | below | right
  const off = {
    Nicosia: { dx: 0, anchor: "middle", pos: "above" },
    Limassol: { dx: 0, anchor: "middle", pos: "below" },
    Larnaca: { dx: 22, anchor: "start", pos: "right" },
    Paphos: { dx: 0, anchor: "middle", pos: "below" },
    Famagusta: { dx: 20, anchor: "start", pos: "right" },
  };
  const fmt = (v) => mode === "rent" ? eur(v) + "/mo" : "€" + Math.round(v / 1000) + "k";

  const Chip = ({ v, cur, set, children }) => (
    <button className={"chip" + (v === cur ? " on" : "")} onClick={() => set(v)}>{children}</button>
  );

  return (
    <div className="mapwrap">
      <div className="mapctrl">
        <div className="chips"><Chip v="rent" cur={mode} set={setMode}>Rent /mo</Chip><Chip v="buy" cur={mode} set={setMode}>Buy</Chip></div>
        <div className="chips">{["1", "2", "3"].map((b) => <Chip key={b} v={b} cur={beds} set={setBeds}>{b}-bed</Chip>)}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart map" role="img" aria-label="Cyprus property prices by district">
        <path d={path} className="island" />
        {cities.map((c) => {
          const g = DATA.geo[c], v = src[c][beds];
          const t = max === min ? 0.5 : (v - min) / (max - min);
          const cx = px(g.lon), cy = py(g.lat);
          const o = off[c];
          let ny, vy;
          if (o.pos === "above") { ny = cy - 38; vy = cy - 21; }
          else if (o.pos === "below") { ny = cy + 26; vy = cy + 43; }
          else { ny = cy - 2; vy = cy + 15; }
          return (
            <g key={c}>
              <circle cx={cx} cy={cy} r={11} fill={lerp(t)} stroke="#fff" strokeWidth={2.5} />
              <text x={cx + o.dx} y={ny} className="cityname" textAnchor={o.anchor}>{c}</text>
              <text x={cx + o.dx} y={vy} className="cityval" textAnchor={o.anchor}>{fmt(v)}</text>
            </g>
          );
        })}
      </svg>
      <div className="maplegend">
        <span>cheaper</span>
        <div className="legbar" style={{ background: `linear-gradient(90deg, ${lerp(0)}, ${lerp(1)})` }} />
        <span>pricier</span>
        <span className="legtag">· {beds}-bed apartment, Republic-controlled areas</span>
      </div>
    </div>
  );
}

/* ---------- interactive: years to save a deposit ---------- */
function DepositSaver() {
  const [district, setDistrict] = useState("Nicosia");
  const [beds, setBeds] = useState("1");
  const [living, setLiving] = useState(850);
  const [rate, setRate] = useState(50);
  const [rent, setRent] = useState(DATA.rents["Nicosia"]["1"]);
  useEffect(() => { setRent(DATA.rents[district][beds]); }, [district, beds]);

  const price = DATA.buy[district][beds];
  const deposit = Math.round(price * DATA.mortgage.depositMin / 100);
  const coupleLiving = Math.round(living * 1.6);
  const hh = [
    { label: "Single, min wage", net: 963, live: living },
    { label: "Single, median", net: 1716, live: living },
    { label: "Couple, both min", net: 1926, live: coupleLiving },
    { label: "Couple, both median", net: 3432, live: coupleLiving },
  ];
  const rows = hh.map((h) => {
    const surplus = h.net - rent - h.live;
    const saved = surplus > 0 ? surplus * (rate / 100) : 0;
    const years = saved > 0 ? deposit / (saved * 12) : null;
    return { ...h, saved, years };
  });

  const CAP = 20;
  const W = 680, H = 226, padL = 158, padR = 78, padT = 12, rowH = 46;
  const x0 = padL, x1 = W - padR;
  const bw = (y) => y === null ? 0 : (Math.min(y, CAP) / CAP) * (x1 - x0);
  const color = (y) => y === null ? "#bdb7a6" : y <= 5 ? "var(--calm)" : y <= 10 ? "var(--warn)" : "var(--alarm)";
  const yLabel = (y) => y === null ? "can't save" : y > CAP ? "20+ yrs" : (y >= 10 ? Math.round(y) : y.toFixed(1)) + " yrs";

  const Chip = ({ v, cur, set, children }) => (
    <button className={"chip" + (v === cur ? " on" : "")} onClick={() => set(v)}>{children}</button>
  );

  return (
    <div className="saver">
      <div className="saverhead">
        Deposit on a {beds}-bed in {district}: <strong>{eur(deposit)}</strong>
        <span> ({DATA.mortgage.depositMin}% of {eur(price)})</span>
      </div>
      <div className="mapctrl">
        <div className="chips">{["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"].map((d) => <Chip key={d} v={d} cur={district} set={setDistrict}>{d}</Chip>)}</div>
        <div className="chips">{["1", "2", "3"].map((b) => <Chip key={b} v={b} cur={beds} set={setBeds}>{b}-bed</Chip>)}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Years to save a deposit by household">
        {[5, 10, 15, 20].map((g) => (
          <g key={g}>
            <line x1={x0 + (g / CAP) * (x1 - x0)} x2={x0 + (g / CAP) * (x1 - x0)} y1={padT} y2={padT + rows.length * rowH - 10} className="grid" />
            <text x={x0 + (g / CAP) * (x1 - x0)} y={padT + rows.length * rowH + 4} className="axis" textAnchor="middle">{g === 20 ? "20+" : g}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = padT + i * rowH;
          return (
            <g key={r.label}>
              <text x={0} y={y + 16} className="rowlab">{r.label}</text>
              <rect x={x0} y={y + 4} width={Math.max(bw(r.years), 2)} height={20} rx={2} fill={color(r.years)} />
              <text x={r.years === null ? x0 + 8 : x0 + Math.max(bw(r.years), 2) + 8} y={y + 19} className="savyrs" fill={color(r.years)}>{yLabel(r.years)}</text>
            </g>
          );
        })}
      </svg>
      <div className="saverctrl">
        <label>Rent paid while saving: <strong>{eur(rent)}</strong></label>
        <input type="range" min="400" max="2500" step="25" value={rent} onChange={(e) => setRent(+e.target.value)} />
        <label style={{ marginTop: 14 }}>Essential living costs (per person, excluding rent): <strong>{eur(living)}</strong></label>
        <input type="range" min="500" max="1200" step="50" value={living} onChange={(e) => setLiving(+e.target.value)} />
        <label style={{ marginTop: 14 }}>Share of what's left over that they actually save: <strong>{rate}%</strong></label>
        <input type="range" min="10" max="100" step="5" value={rate} onChange={(e) => setRate(+e.target.value)} />
      </div>
      <p className="laddernote">
        Years to save the deposit, from whatever is left after rent and essential living costs, saving the share you set
        above. At the default 50%, a median dual-income couple still saves several hundred euros a month; minimum-wage
        households have little or nothing left to put aside. The bars ignore help from family, which in practice is how
        many first-time buyers in Cyprus close the gap.
      </p>
    </div>
  );
}

export default function App() {
  const m = DATA.mortgage.entryExample;

  return (
    <div className="page">
      <style>{CSS}</style>

      <header className="hero">
        <p className="eyebrow">Cyprus &middot; housing &middot; {DATA.updated}</p>
        <h1>The most affordable housing in the EU. And a housing crisis. <em>Can both be true?</em></h1>
        <p className="lede">
          On the official measures, Cyprus looks comfortable: households spend a smaller share of their income on housing
          than anywhere else in the EU. Yet asking rents have risen about a quarter in five years, the deposit needed to
          buy keeps first-time buyers renting, and the government's main grant for under-41s drew 525 applicants for a
          scheme intended for around 400 recipients, of whom 152 have so far been approved. Both things are true at once. What follows
          is how that happens, and who carries the cost.
        </p>
        <div className="herostats">
          <div className="hs"><span className="hsv">11%</span><span className="hsl">of income on housing across <em>all</em> households — lowest in the EU (avg 19%)</span></div>
          <div className="hs"><span className="hsv">~25%</span><span className="hsl">rise in asking rents over five years — faster than both wages and the EU</span></div>
          <div className="hs"><span className="hsv">20%</span><span className="hsl">deposit needed to buy — the barrier is saving it, not the monthly repayment</span></div>
          <div className="hs"><span className="hsv">14.3%</span><span className="hsl">behind on rent, mortgage or utility bills, against 9.3% across the EU</span></div>
        </div>
      </header>

      <section>
        <h2>First, what people earn</h2>
        <p className="sub">
          Affordability depends as much on incomes as on rents. The average wage is pulled up by high earners; the
          minimum wage is lower than most rents assume. The charts below show where the three figures sit, and why the
          gap between the average and the typical worker matters.
        </p>
        <WageLadder />
        <WageDistribution />
      </section>

      <section className="band">
        <h2>Can a household afford to move out today?</h2>
        <p className="sub">
          Headline comparisons often pit a single minimum-wage earner against the rent on a whole two-bedroom flat — a
          situation almost no one is actually in. Choose a more realistic household and see what rent would take.
        </p>
        <Calculator />
      </section>

      <section>
        <h2>Matching households to the homes they would rent</h2>
        <p className="body">
          Against current asking rents, most households are stretched. A single person on the minimum wage cannot afford
          a one-bed in any city. A single person on median pay is close to the 40% line in Nicosia and well beyond it in
          Limassol. A couple on two minimum wages is overburdened in both. The only household that stays comfortably below
          the line is a couple on two median salaries, and only in Nicosia; in Limassol, where prices are set by an
          international market, even they are overburdened.
        </p>
        <div className="tablewrap">
          <table className="matched">
            <thead><tr><th>Household</th><th>Home</th><th>Nicosia</th><th>Limassol</th></tr></thead>
            <tbody>
              <tr><td>Single, minimum wage</td><td>1-bed</td><td className="bad">67%</td><td className="bad">142%</td></tr>
              <tr><td>Single, median pay</td><td>1-bed</td><td className="warn">38%</td><td className="bad">80%</td></tr>
              <tr><td>Couple, both minimum</td><td>2-bed</td><td className="bad">47%</td><td className="bad">93%</td></tr>
              <tr><td>Couple, both median</td><td>2-bed</td><td className="ok">26%</td><td className="bad">52%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="caption">
          Rent as a share of combined take-home pay, using median asking rents from property listings (June 2026). Green
          &lt;30% &middot; amber 30–40% &middot; red &gt;40%.
        </p>
      </section>

      <section className="band">
        <h2>How the official numbers stay low</h2>
        <p className="body">
          That 11% is what households spend on housing as a share of income, as Eurostat measures it, and the measure
          counts bills, rent and mortgage interest, but not the capital repaid on a mortgage. Two things keep it low in
          Cyprus. Most people own their home (69%), and most of those outright, with no mortgage at all. This is in large
          part a result of families passing property down between generations, so a large group has almost no housing cost
          beyond utilities. And for those who are buying, the measure counts only the interest, not the full repayment, so
          it understates what a buyer actually pays each month. The number is accurate, but it describes people who are
          already housed. The pressure falls on those entering the market: renters signing new leases, buyers short of a
          deposit, and recent arrivals. Averaged across everyone, that group disappears from the figure.
        </p>
        <OverburdenFlip />
        <p className="caption">
          Source: Eurostat EU-SILC, 2024. Even Cyprus's exposed renters (14.4%) are less overburdened than the average EU
          renter (19.2%), so this is not the worst in Europe. It is a low base eroding unevenly, with the strain falling on
          new entrants the averages do not capture.
        </p>
      </section>

      <section>
        <h2>Did rents outpace pay? It depends what you measure</h2>
        <p className="body">
          The answer is mixed. Asking rents rose about a quarter over five years, while Cypriot pay also rose strongly:
          average earnings were up by more than a fifth, and the median moved in step, so this is not simply the average
          being lifted by top earners. Cyprus's wage growth was close to the EU's over the same period — roughly 25% in
          both. The difference is in rents. EU rents rose about 13% over five years; Cyprus's asking rents rose roughly
          twice as fast. So in aggregate Cypriot rents and wages broadly kept pace with each other, but that is not the
          same as affordability: a household entering the market already spends more than 40% of take-home pay on rent, and
          the two figures rising together does not ease the squeeze, because those households must pay their rent and save
          for a deposit at the same time. Cyprus's own official index, which tracks sitting tenants on older leases, barely
          moved — which is why the headline measures stay low while advertised rents do not. The most recent figures are
          sharper still: the Department of Lands and Surveys recorded the average rent on a Nicosia three-bedroom flat
          rising from €950 to €1,300 in a single year.
        </p>
        <RentWageDivergence />
        <p className="caption">
          Indexed to 2020 = 100. Cyprus wages: CYSTAT; EU comparison: Eurostat (HICP actual rentals and euro-area
          compensation per employee). The Cyprus asking-rent line is the author's index, consistent with the Eurostat
          survey's ~23–28% five-year rise; it is the least precise series here. Cyprus wages tracked EU wages so closely
          that a separate EU-wage line would sit on top of the Cyprus one, so it is omitted.
        </p>
      </section>

      <section>
        <h2>Arrears: the measure that is rising</h2>
        <p className="body">
          If the burden ratios look reassuring, one measure does not: how many people fall behind on payments. Looking at
          housing-only, <strong>4.6%</strong> of Cypriots are in arrears on rent or mortgage, against an EU average of 3%
          (Eurostat, 2024). Including utility bills, the figure rises to <strong>14.3%</strong>, the fourth-highest in the
          EU after Greece, Bulgaria and Romania, against a 9.3% average. Arrears, unlike the burden ratio, capture
          households at the edge: people who are housed, but only just. Difficulty tends to appear here, in missed
          payments, before it shows up in an averaged cost-of-housing figure.
        </p>
      </section>

      <section>
        <h2>Prices by district</h2>
        <p className="sub">
          The island-wide averages hide wide differences by location. Switch between rent and purchase, and between
          bedroom counts; Limassol stands well above the rest on both measures.
        </p>
        <CyprusMap />
        <p className="body" style={{ marginTop: 20 }}>
          Per square metre the gap is just as wide. A two-bedroom flat costs around €4,100/m² to buy in Limassol and
          €3,900 in Paphos, against roughly €2,400 in Nicosia and €2,500 in Larnaca — and rents follow the same pattern,
          near €19 per m² a month in Limassol versus about €11 in Nicosia.
        </p>
        <p className="caption">
          Median asking prices for apartments from live property-portal listings (Bazaraki/Spitogatos), June 2026.
          Asking prices, especially for sale, run above transaction (closing) prices. Republic-controlled areas;
          Famagusta listings are thin and holiday-skewed.
        </p>
      </section>

      <section>
        <h2>Renting is expensive; buying is blocked</h2>
        <p className="body">
          Andreas and Elena are both 30. They married last year and still live with Elena's parents in Strovolos, on the
          edge of Nicosia — Cypriots leave the parental home at 27.2 on average, against the EU's 26.2, and many stay on
          longer while they save. He keeps the books for a small firm; she is a nurse at the general hospital. Between them
          they take home about €3,400 a month — each earns close to the median wage of {eur(DATA.income.gross.median)} a
          month, around €23,600 a year before tax — a typical Cypriot household.
        </p>
        <p className="body">
          They want a two-bedroom flat of their own. In Nicosia that costs about €200,000, with roughly €40,000 needed in
          cash up front. The monthly payment is not the obstacle: the mortgage would run about €790 a month — less than
          the {eur(DATA.rents.Nicosia["2"])} rent on the same flat, and comfortably inside the bank's limit that repayments
          stay within {DATA.mortgage.dtiCeiling[0]} to {DATA.mortgage.dtiCeiling[1]}% of income. The deposit is the
          obstacle. If they stay with Elena's parents and save what they would otherwise pay in rent, they reach €40,000 in
          about three years; if they move into a one-bedroom of their own first, at around {eur(DATA.rents.Nicosia["1"])} a
          month, it takes closer to five. Either way, the flats within reach are seldom the ones being built — and, like
          most couples they know, their realistic route to a deposit is the one the official figures never capture: help
          from their parents.
        </p>
        <p className="body">
          And Andreas and Elena are the comfortable case — a dual-income couple on median pay, for whom the barrier is time
          and the deposit rather than the monthly payment. Lower down it is harder still: a single person on median pay, or
          a couple on two minimum wages, can just about meet the repayments on a small flat, but the deposit — years of
          saving while paying rent — is the wall most cannot clear. Ownership stays furthest from the same households the
          rental market is already stretching.
        </p>
        <WageLadder net note={<>Monthly take-home (net) pay per worker. A couple's household income is two of these, so
          a median couple takes home about {eur(DATA.income.net.median * 2)} — the figure the savings estimate below uses.</>} />
        <DepositSaver />
      </section>

      <section className="band">
        <h2>Foreign buyers, in proportion</h2>
        <p className="body">
          Limassol's prices point to the role of foreign money, but the common claim that foreigners are buying up the
          island is only half right. Foreign buyers, EU and non-EU together, accounted for
          {" "}{DATA.buyers2025.foreignShare}% of residential sales in 2025 — high, but close to the 18-year average of
          {" "}{DATA.buyers2025.foreignShare18yrAvg}%. The split matters: EU buyers were {DATA.buyers2025.eu.share}% and
          non-EU buyers {DATA.buyers2025.nonEu.share}%, with the non-EU share concentrated on the coast. Limassol stands
          apart for a related but separate reason: its high prices mean it alone accounts for
          {" "}{DATA.buyers2025.limassolValueShare}% of all transaction value. Nationally, though, locals are not being
          shut out — domestic purchases nearly doubled, from {DATA.buyers2025.domestic2018.toLocaleString()} in 2018 to
          {" "}{DATA.buyers2025.domestic.count.toLocaleString()} in 2025.
        </p>
        <BuyerSplit />
        <p className="body" style={{ marginTop: 18 }}>
          The foreign share is also levelling off rather than accelerating. Transfers to non-EU buyers nearly tripled,
          from {DATA.foreignTrend.nonEuDeeds[0].toLocaleString()} in 2020 to {DATA.foreignTrend.nonEuDeeds[3].toLocaleString()}
          {" "}in 2023, during the golden-visa boom, then flattened in 2024, with the headline share easing back from its
          2022 peak.
        </p>
        <ForeignTrend />
        <p className="caption">
          Non-EU transfers of immovable property (DLS / Parliament): a sharp rise to 2023, then a plateau. National buyer
          split via DLS; PwC's lower 28% counts land and commercial transactions too.
        </p>
      </section>

      <section>
        <h2>Enough homes, but not where they are needed</h2>
        <p className="body">
          The fullest count is the 2021 census, which Cyprus conducts only once a decade:
          {" "}{DATA.supply.census2021Total.toLocaleString()} dwellings, of which
          {" "}{DATA.supply.census2021VacantOrTemp.toLocaleString()} (about {DATA.supply.census2021VacantPct}%) were vacant
          or temporary. Most of that is holiday and second homes, concentrated in Paphos and Famagusta (about
          {" "}{DATA.supply.secondHomePaphos}% and {DATA.supply.secondHomeFamagusta}%), rather than empty flats available to
          let. Industry bodies put genuinely idle urban stock much lower: ETEK estimates about
          {" "}{DATA.supply.idleStockEstimateEtek.toLocaleString()} units drawing near-zero electricity. The shortage is
          therefore not of housing in general — the renting share has risen from 27.1% in 2014 to {DATA.context.renters2024}%
          — but of modern, long-term rental homes in the cities where the jobs are. Cyprus has the EU's highest share of
          under-occupied homes ({DATA.tenure.underOccupied.cy}% against {DATA.tenure.underOccupied.eu}%): space exists, but
          much of it is owner-occupied and in the wrong places.
        </p>
        <p className="body">
          A growing share of what could be long-term housing has also moved to tourists. Short-term holiday lets in the
          government-controlled areas have risen roughly sixfold in under three years, to an estimated 12,000–13,000 units,
          and they are concentrated in the coastal districts — Paphos, Limassol and Famagusta — where asking rents are
          highest. A proposed cap on them was rejected in 2025, and each additional unit let to tourists is one removed
          from the long-term market. Cities from Amsterdam to Barcelona have capped or phased out short-term lets for the
          same reason, though the evidence that this lowers rents is mixed; and a tourism-dependent economy like Cyprus's,
          where holiday lets are a far larger share of local stock than in a big capital, faces a sharper trade-off than
          most.
        </p>
      </section>

      <section className="band">
        <h2>Building is picking up, but the question is what kind</h2>
        <p className="body">
          In January 2026, CYSTAT recorded permits for
          {" "}{DATA.flow2026.janPermitUnits.toLocaleString()} new homes, up {DATA.flow2026.janPermitUnitsYoY}% on a year
          earlier, against {DATA.flow2026.janSales.toLocaleString()} sales recorded by the Land Registry. This basically
          means that the approved pipeline is running ahead of the sales pace: more new homes are being approved for
          construction than are currently being bought, a sign that new construction may be starting to catch up with
          demand.
        </p>
        <PermitsSales />
        <p className="body" style={{ marginTop: 18 }}>
          The thing to look at is the composition of these new permits and dwellings. The surge is overwhelmingly
          apartments — apartment units were up {DATA.flow2026.janApartmentYoY}% year-on-year in January. But most new
          apartments go to owner-occupiers or to individual landlords, not into the long-term rental pool (PwC), and little
          of the new stock is the affordable, long-term rental housing that is missing. More construction does not
          automatically mean cheaper rents.
        </p>
      </section>

      <section className="band">
        <h2>What the state is doing, and its scale</h2>
        <p className="sub">
          The policy response is real but small against the shortfall. Demand is the clearest sign: more than 560
          applications have come in across the new affordable schemes, and the main young-buyer grant alone drew 525, for a
          programme intended for around 400 recipients.
        </p>
        <div className="tablewrap">
          <table className="schemes">
            <thead><tr><th>Scheme</th><th>What it gives</th><th>Reality check</th></tr></thead>
            <tbody>
              {DATA.schemes.map((s) => (
                <tr key={s.name}><td className="snm">{s.name}</td><td>{s.detail}</td><td className="rc">{s.reach}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>The bottom line</h2>
        <p className="body">
          Cyprus still has one of the lowest housing burdens in the EU, and that is what the averages capture. But the
          margin is narrowing unevenly: asking rents have risen roughly twice as fast as the EU average over five years,
          the price-to-income ratio rose 0.6% here in 2024 while it fell 1.7% across the bloc (Eurostat), and arrears already run above average.
          The cost is not carried by the average household but by those entering the market — renters signing new leases,
          couples short of a deposit, workers who have moved for a job. Cyprus is not the worst in Europe, and is unlikely
          to become so soon. The open questions are which direction it moves, and whether the homes now being built are
          ones those households can afford to live in.
        </p>
      </section>

      <footer className="foot">
        <p>
          <strong>Sources &amp; method.</strong> Incomes: CYSTAT earnings (average and median gross monthly); net pay modelled
          by the author from 2026 income-tax, social-insurance (8.8%) and GHS (2.65%) rules — a derived figure, not an
          official net series. Rents and apartment prices: median asking figures from live property-portal listings
          (Bazaraki/Spitogatos), June 2026, with sample sizes from tens (Famagusta) to several thousand (Limassol);
          affordability ratios are the author's. Asking prices, especially for sale, sit above transaction (closing)
          prices. The rent-vs-wage index is indicative — Cyprus wages from CYSTAT, EU wages and rents from Eurostat, and
          the Cyprus asking-rent line the author's compilation from listing data.
          Overburden, cost share, arrears, tenure and under-occupation: Eurostat EU-SILC (2024) and the Central Bank of Cyprus.
          Buyer nationality and transaction counts: Department of Lands &amp; Surveys and PwC (2025); January 2026 transactions from the
          Department of Lands &amp; Surveys and building permits from CYSTAT. Housing stock and vacancy: CYSTAT Census 2021.
          The 43,000-home gap is a figure aired at a 2026 housing-policy discussion in Nicosia (reported by Cyprus
          Property News); the ~35,000 idle-units estimate is from ETEK, the technical chamber, based on dwellings drawing
          near-zero electricity; and the latent-building-capacity figure is Ask Wire's (Pavlos Loizou), from unused
          permitted floor area. These are attributed sector estimates, not official statistics. Affordable-scheme
          application and approval figures: Interior Minister Constantinos Ioannou, in replies to parliamentary questions
          (2025–26).
        </p>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.page{
  --paper:#f3f1ea; --card:#fbfaf5; --ink:#1c1b18; --muted:#666056; --line:#e2ddcf;
  --calm:#345b86; --warn:#bf8a2c; --alarm:#c5532e; --calm-soft:#e7edf3; --alarm-soft:#f6e6de;
  background:var(--paper); color:var(--ink);
  font-family:'Source Serif 4',Georgia,serif; line-height:1.72; font-size:18px;
  -webkit-font-smoothing:antialiased;
  background-image:radial-gradient(1200px 480px at 88% -8%, rgba(52,91,134,.05), transparent 70%);
}
.wrap, .page section, .hero, .foot{max-width:700px;margin-left:auto;margin-right:auto;padding-left:26px;padding-right:26px;}

/* hero */
.hero{padding-top:92px;padding-bottom:8px;}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:26px;}
h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(36px,6.2vw,60px);line-height:1.02;letter-spacing:-.025em;margin-bottom:26px;}
h1 em{font-style:normal;color:var(--alarm);}
.lede{font-size:21px;line-height:1.62;color:#393730;max-width:600px;margin-bottom:44px;}
.herostats{display:grid;grid-template-columns:1fr 1fr;column-gap:34px;margin-bottom:8px;border-top:1.5px solid var(--ink);}
.hs{padding:20px 0 22px;border-bottom:1px solid var(--line);}
.hsv{display:block;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:30px;letter-spacing:-.02em;line-height:1;margin-bottom:9px;}
.hsl{font-size:14px;line-height:1.45;color:var(--muted);}
.hsl em{font-style:italic;color:var(--ink);}

/* sections + headings */
section{padding-top:84px;}
.band{padding-top:84px;}
h2{position:relative;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:clamp(24px,3.6vw,33px);line-height:1.13;letter-spacing:-.02em;margin-bottom:20px;padding-top:22px;}
h2::before{content:"";position:absolute;top:0;left:0;width:36px;height:3px;background:var(--calm);}
.sub{font-size:19px;line-height:1.6;color:var(--muted);margin-bottom:32px;max-width:600px;}
.body{font-size:18.5px;margin-bottom:18px;}
.body strong{font-weight:600;}
.body em{font-style:italic;}
.caption{font-family:'IBM Plex Mono',monospace;font-size:12.5px;line-height:1.65;color:var(--muted);margin-top:18px;padding-left:14px;border-left:2px solid var(--line);}
.fineprint{font-family:'IBM Plex Mono',monospace;font-size:11.5px;line-height:1.65;color:var(--muted);margin-top:18px;}

/* cards (tools) */
.calc,.dist{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:28px;box-shadow:0 1px 2px rgba(28,27,24,.03);}
.dist{padding:24px 28px 22px;}

/* calculator */
.calcgrid{display:grid;grid-template-columns:1fr 1fr;gap:24px 32px;margin-bottom:26px;}
.field label{display:block;font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:11px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;}
.chip{font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:500;padding:8px 14px;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:3px;cursor:pointer;transition:border-color .12s,background .12s,color .12s;}
.chip:hover{border-color:var(--calm);}
.chip.on{background:var(--ink);color:#fff;border-color:var(--ink);}
.readout{display:flex;flex-wrap:wrap;gap:14px 34px;padding:18px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:28px;}
.ro{display:flex;flex-direction:column;gap:3px;}
.rok{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
.rov{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:22px;}
.rov.neg{color:var(--alarm);}
.meterwrap{margin-bottom:10px;}
.meterbar{position:relative;height:32px;background:var(--paper);border:1px solid var(--line);border-radius:3px;overflow:visible;}
.meterfill{height:100%;border-radius:2px 0 0 2px;transition:width .4s cubic-bezier(.3,.7,.3,1),background .2s;}
.meterfill.calm{background:var(--calm);}
.meterfill.warn{background:var(--warn);}
.meterfill.alarm{background:var(--alarm);}
.mark{position:absolute;top:-7px;bottom:-24px;width:0;border-left:2px dotted #a39e90;}
.mark span{position:absolute;bottom:-21px;left:-12px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--muted);}
.burdennum{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;margin-top:34px;letter-spacing:-.025em;line-height:1;}
.burdennum span{font-family:'Source Serif 4',serif;font-weight:400;font-size:16px;color:var(--muted);margin-left:12px;letter-spacing:0;}
.burdennum.calm{color:var(--calm);}.burdennum.warn{color:var(--warn);}.burdennum.alarm{color:var(--alarm);}
.verdict{font-size:16.5px;margin-top:10px;font-weight:500;}
.verdict.calm{color:var(--calm);}.verdict.warn{color:#a4761d;}.verdict.alarm{color:var(--alarm);}

/* charts */
.chart{width:100%;height:auto;margin:10px 0 4px;overflow:visible;display:block;}
.grid{stroke:var(--line);stroke-width:1;}
.axisline{stroke:var(--ink);stroke-width:1;}
.axis{font-family:'IBM Plex Mono',monospace;font-size:11px;fill:var(--muted);}
.rowlab{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:500;fill:var(--ink);}
.bar-cy{fill:var(--alarm);}.bar-eu{fill:#c7c1b0;}
.barval-cy{font-family:'IBM Plex Mono',monospace;font-size:12px;fill:var(--alarm);font-weight:500;}
.barval-eu{font-family:'IBM Plex Mono',monospace;font-size:12px;fill:var(--muted);}
.seg-dom{fill:var(--calm);}.seg-eu{fill:#7ea4c6;}.seg-non{fill:var(--alarm);}
.segval{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;fill:#fff;}
.seglab{font-family:'IBM Plex Mono',monospace;font-size:11.5px;fill:var(--muted);}
.avgline{stroke:var(--ink);stroke-width:1.5;stroke-dasharray:3 3;}
.avglab{font-family:'IBM Plex Mono',monospace;font-size:11px;fill:var(--ink);}
.bar-permit{fill:var(--calm);}.bar-sold{fill:#c7c1b0;}
.bar-rise{fill:var(--alarm);}.bar-flat{fill:#d6b3a3;}
.barnum{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;fill:var(--ink);dominant-baseline:middle;}
.ratiolab{font-family:'IBM Plex Mono',monospace;font-size:12px;fill:var(--muted);}

/* wage ladder */
.ladder{margin:14px 0 24px;}
.laddertrack{position:relative;height:58px;margin:34px 0 2px;border-bottom:2px solid var(--line);}
.ltick{position:absolute;bottom:0;height:58px;border-left:1px dashed var(--line);}
.ltick span{position:absolute;bottom:-20px;left:-16px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--muted);}
.pin{position:absolute;bottom:0;transform:translateX(-50%);}
.pindot{position:absolute;bottom:-5px;left:-5px;width:11px;height:11px;border-radius:50%;background:var(--calm);border:2px solid var(--card);box-shadow:0 0 0 1px var(--calm);}
.pin1 .pindot{background:var(--alarm);box-shadow:0 0 0 1px var(--alarm);}
.pin2 .pindot{background:var(--ink);box-shadow:0 0 0 1px var(--ink);}
.pinlab{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--muted);text-align:center;}
.pinlab b{display:block;font-family:'Space Grotesk',sans-serif;font-size:15px;color:var(--ink);font-weight:600;margin-top:3px;}
.pin1 .pinlab{bottom:36px;}
.laddernote{font-size:15px;line-height:1.6;color:var(--muted);margin-top:22px;}
.laddernote strong{color:var(--ink);font-weight:600;}

/* distribution histogram */
.dist{margin:6px 0 24px;}
.hbar{fill:var(--calm);opacity:.85;}
.hbar.hi{fill:var(--alarm);opacity:.85;}
.medline{stroke:var(--ink);stroke-width:2;}
.meanline{stroke:var(--alarm);stroke-width:2;stroke-dasharray:4 3;}
.medlab{font-family:'IBM Plex Mono',monospace;font-size:11.5px;fill:var(--ink);font-weight:600;}
.meanlab{font-family:'IBM Plex Mono',monospace;font-size:11.5px;fill:var(--alarm);font-weight:600;}
.distctrl{display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;margin-top:14px;}
.distadd{display:flex;align-items:center;gap:12px;flex:1;min-width:240px;}
.distadd input[type=range]{flex:1;accent-color:var(--calm);height:4px;}
.addbtn{font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:600;padding:9px 15px;background:var(--ink);color:#fff;border:none;border-radius:3px;cursor:pointer;white-space:nowrap;}
.distquick{display:flex;gap:8px;flex-wrap:wrap;}

/* deposit saver */
.saver{margin:8px 0 6px;}
.saverhead{font-family:'Source Serif 4',serif;font-size:17px;margin-bottom:14px;}
.saverhead strong{font-family:'Space Grotesk',sans-serif;font-weight:600;}
.saverhead span{color:var(--muted);font-size:14px;}
.savyrs{font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:500;dominant-baseline:middle;}
.saverctrl{margin:6px 0 2px;}
.saverctrl label{display:block;font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--muted);margin-bottom:8px;}
.saverctrl label strong{color:var(--ink);}
.ctrlhint{text-transform:none;letter-spacing:0;color:var(--muted);font-weight:400;}
.saverctrl input[type=range]{width:100%;max-width:340px;accent-color:var(--calm);height:4px;}

/* divergence lines */
.ln-rent{stroke:var(--alarm);stroke-width:2.5;}
.ln-eurent{stroke:var(--alarm);stroke-width:2;stroke-dasharray:5 4;}
.ln-wage{stroke:var(--calm);stroke-width:2.5;}
.ln-off{stroke:#bdb7a6;stroke-width:2;}
.divlegend{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;margin-top:12px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--muted);}
.leg{display:inline-flex;align-items:center;gap:7px;}
.legline{width:22px;height:0;border-top-width:3px;border-top-style:solid;display:inline-block;}
.legline.ln-rent{border-color:var(--alarm);}
.legline.ln-eurent{border-color:var(--alarm);border-top-style:dashed;}
.legline.ln-wage{border-color:var(--calm);}
.legline.ln-off{border-color:#bdb7a6;}

/* map */
.mapwrap{margin:8px 0 10px;}
.mapctrl{display:flex;flex-wrap:wrap;gap:12px 20px;margin-bottom:12px;}
.map{max-width:600px;margin:0 auto;display:block;}
.island{fill:#e8e5d6;stroke:#bdb6a2;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;}
.cityname{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;fill:var(--ink);}
.cityval{font-family:'IBM Plex Mono',monospace;font-size:14px;fill:var(--ink);font-weight:500;}
.maplegend{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted);}
.legbar{width:150px;height:8px;border-radius:4px;}
.legtag{flex-basis:100%;text-align:center;}

/* tables */
.tablewrap{overflow-x:auto;margin-top:4px;}
table{width:100%;border-collapse:collapse;font-size:15.5px;}
thead th{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:11px 14px;border-bottom:1.5px solid var(--ink);}
tbody td{padding:13px 14px;border-bottom:1px solid var(--line);vertical-align:top;}
.matched td{font-family:'Source Serif 4',serif;}
.matched td.ok{color:var(--calm);font-weight:600;font-family:'Space Grotesk',sans-serif;}
.matched td.warn{color:#a4761d;font-weight:600;font-family:'Space Grotesk',sans-serif;}
.matched td.bad{color:var(--alarm);font-weight:600;font-family:'Space Grotesk',sans-serif;}
.schemes .snm{font-weight:600;font-family:'Space Grotesk',sans-serif;font-size:14px;}
.schemes .rc{color:var(--muted);font-style:italic;}

/* footer */
.foot{border-top:1px solid var(--line);margin-top:88px;padding-top:28px;padding-bottom:80px;}
.foot p{font-family:'IBM Plex Mono',monospace;font-size:11.5px;line-height:1.75;color:var(--muted);}
.foot strong{color:var(--ink);font-weight:600;}

@media(max-width:640px){
  .hero{padding-top:64px;}
  .herostats{grid-template-columns:1fr;column-gap:0;}
  .calcgrid{grid-template-columns:1fr;}
  section,.band{padding-top:64px;}
}
@media(prefers-reduced-motion:reduce){.meterfill{transition:none;}}
`;
