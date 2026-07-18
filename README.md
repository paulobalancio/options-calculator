# OptionCalc

A fast, modern options profit calculator. Model long calls and long puts before
you trade: a live P&L matrix across every price and date until expiration, a
payoff chart, breakeven, cost, and Greeks — all recalculated as you type.

Pure client-side math on statically generated pages. No backend, no accounts,
no market-data feeds; every input is manual and nothing you enter leaves the
browser.

## Stack

- **Next.js 15** (App Router, static generation) + **TypeScript** (strict)
- **Tailwind CSS v4** with a custom design-token layer (`styles/tokens.css`) —
  components use only tokens, never default Tailwind colors
- **Custom SVG** payoff chart (no chart library)
- **Vitest** for unit tests

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine unit tests
npm run build      # production build (all routes static)
```

Set `NEXT_PUBLIC_SITE_URL` in the deployment environment so the sitemap,
canonical URLs, and Open Graph tags emit the real origin.

## How the engine is structured

All financial math lives in `lib/options/`, fully separated from presentation:

| Module | Responsibility |
| --- | --- |
| `black-scholes.ts` | European option pricing and Greeks (delta, gamma, theta, vega) |
| `types.ts` | Domain types — every strategy is a set of `OptionLeg`s |
| `position.ts` | Values any set of legs: net cost, theoretical value, P&L now and at expiry |
| `pnl-matrix.ts` | The price × date P&L grid, with extremes for color scaling |
| `strategies.ts` | Strategy registry: legs + closed-form summary (max profit/loss, breakevens) |

The UI (`components/calculator/`) consumes the engine through one client
island, `CalculatorShell`, which parses form input (`lib/calculator-inputs.ts`)
and derives every output per keystroke.

Every math function is unit-tested against known-good values — including the
Hull textbook Black-Scholes example and put-call parity — in `lib/**/*.test.ts`.
No untested financial math ships.

## Adding a new strategy

The engine is leg-based, so strategies compose without touching the math:

1. Add a `StrategyDefinition` to `lib/options/strategies.ts`: an id, a
   `buildLegs()` that maps user inputs to option legs (two legs for a vertical
   spread, etc.), and a `summarize()` with closed-form max profit/loss and
   breakevens. Add tests for the summary math.
2. Add a route at `app/calculator/<strategy>/page.tsx` — metadata, an
   explainer, FAQs, and `<CalculatorShell strategyId="…" />`.
3. Add the route to `app/sitemap.ts` and the header/homepage lists.

`position.ts`, `pnl-matrix.ts`, the matrix table, and the payoff chart already
handle arbitrary leg arrays.

## Design system

`styles/tokens.css` defines the entire visual language: ink/paper palette with
one accent blue, profit/loss colors reserved exclusively for P&L data, a
six-size type scale, 4px spacing grid, one shadow token, and 150ms
interactive-state transitions. Numbers always render in JetBrains Mono with
tabular figures so live values never shift in width.

## Disclaimer

Educational estimates only — not investment advice. Values are theoretical
Black-Scholes estimates assuming constant implied volatility and rates.
