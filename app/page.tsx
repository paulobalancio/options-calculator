import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `Options Profit Calculator — Free P&L Charts for Calls & Puts · ${SITE_NAME}` },
  description:
    'Model option trades before you place them. Free calculators for long calls and long puts with a live profit/loss matrix, payoff chart, breakeven, and Greeks.',
  alternates: { canonical: '/' },
  openGraph: {
    title: `Options Profit Calculator · ${SITE_NAME}`,
    description:
      'Free calculators for long calls and long puts with a live P&L matrix and payoff chart.',
    url: '/',
  },
};

interface StrategyCard {
  href: string;
  name: string;
  outlook: string;
  description: string;
  /** Payoff-shape glyph path in a 64×36 viewBox. */
  glyphPath: string;
}

const STRATEGIES: StrategyCard[] = [
  {
    href: '/calculator/long-call',
    name: 'Long Call',
    outlook: 'Bullish',
    description:
      'Buy a call to profit from a rising stock. Risk is capped at the premium; upside is unlimited.',
    glyphPath: 'M4 24h28l28 -16',
  },
  {
    href: '/calculator/long-put',
    name: 'Long Put',
    outlook: 'Bearish',
    description:
      'Buy a put to profit from a falling stock, or to hedge shares you own. Risk is capped at the premium.',
    glyphPath: 'M4 8l28 16h28',
  },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Free options profit calculator with a live P&L matrix, payoff chart, and Greeks for long calls and long puts.',
  };

  return (
    <div className="space-y-12">
      <header className="max-w-2xl pt-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Options profit calculator
        </h1>
        <p className="mt-3 text-ink-secondary">
          See what an option trade could make — or lose — before you place it. Pick a
          strategy, enter the trade, and get a live profit/loss matrix across every
          price and date until expiration, a payoff chart, breakeven, and Greeks. Free,
          fast, and nothing to sign up for.
        </p>
      </header>

      <section aria-labelledby="pick-strategy">
        <h2 id="pick-strategy" className="text-lg font-semibold tracking-tight">
          Pick a strategy
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STRATEGIES.map((strategy) => (
            <Link
              key={strategy.href}
              href={strategy.href}
              className="group rounded-lg border border-line bg-surface p-5 transition-colors duration-fast hover:border-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold tracking-tight group-hover:text-accent">
                      {strategy.name}
                    </h3>
                    <span className="text-xs uppercase tracking-wide text-ink-tertiary">
                      {strategy.outlook}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink-secondary">{strategy.description}</p>
                </div>
                <svg
                  viewBox="0 0 64 36"
                  className="mt-1 h-9 w-16 shrink-0"
                  aria-hidden="true"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 24h56" stroke="var(--color-line-strong)" strokeWidth="1" />
                  <path d={strategy.glyphPath} stroke="var(--color-accent)" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-tertiary">
          Spreads, covered calls, and multi-leg strategies are on the way.
        </p>
      </section>

      <section aria-labelledby="why" className="max-w-2xl">
        <h2 id="why" className="text-lg font-semibold tracking-tight">
          Why model a trade first?
        </h2>
        <p className="mt-3 text-ink-secondary">
          An option’s outcome depends on more than direction: strike selection, premium
          paid, time decay, and implied volatility all shape what you actually take
          home. The matrix view shows your estimated P&amp;L at every combination of
          stock price and date — so you can see not just whether a trade can win, but
          how much room it has to be wrong, and how fast time works against it. All math
          runs in your browser using the Black-Scholes model; nothing you enter is
          stored or sent anywhere.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
