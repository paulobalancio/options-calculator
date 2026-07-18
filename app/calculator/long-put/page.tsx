import type { Metadata } from 'next';
import { CalculatorShell } from '@/components/calculator/CalculatorShell';
import { FaqSection, type FaqItem } from '@/components/content/FaqSection';
import { FormulaBlock } from '@/components/content/FormulaBlock';
import { Disclaimer } from '@/components/site/Disclaimer';

export const metadata: Metadata = {
  title: { absolute: 'Long Put Calculator — Put Option Profit Calculator' },
  description:
    'Free long put calculator: see profit, loss, and breakeven for any put option across every price and date until expiry, with a live P&L heatmap and payoff chart.',
  alternates: { canonical: '/calculator/long-put' },
  openGraph: {
    title: 'Long Put Calculator — Put Option Profit Calculator',
    description:
      'Model a long put before you trade: live P&L matrix, payoff chart, breakeven, and Greeks.',
    url: '/calculator/long-put',
  },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How is long put profit calculated?',
    answer:
      'At expiration, profit = (strike price − stock price − premium paid) × 100 × contracts, as long as the stock is below the strike. If it finishes at or above the strike, the put expires worthless and you lose the full premium. Before expiration, the calculator uses the Black-Scholes model to estimate remaining time value as well.',
  },
  {
    question: 'What is the breakeven price for a long put?',
    answer:
      'Breakeven at expiration is the strike price minus the premium paid per share. A $95 put bought for $3.50 breaks even with the stock at $91.50. Below that, each further $1 drop in the stock adds $100 of profit per contract.',
  },
  {
    question: 'What is the maximum profit on a long put?',
    answer:
      'A stock cannot fall below zero, so the maximum profit is (strike − premium) × 100 × contracts, reached if the stock goes to $0 by expiration. That cap is theoretical for most stocks, but it is why a put’s payoff, unlike a call’s, is not unlimited.',
  },
  {
    question: 'Can I lose more than I paid for a put option?',
    answer:
      'No. The maximum loss on a long put is the total premium paid (premium × 100 × contracts), which happens if the stock closes at or above the strike at expiration. That capped risk is a key difference from short-selling stock, where losses are unbounded.',
  },
  {
    question: 'Are puts a good way to hedge a stock position?',
    answer:
      'Buying puts against shares you own (a protective put) acts like insurance: the put gains value as the stock falls, offsetting losses below the strike. The premium is the cost of that insurance, and this calculator shows exactly how much protection a given strike and expiry buys.',
  },
  {
    question: 'How does time decay affect a long put?',
    answer:
      'Like calls, puts lose time value daily (theta). Reading any row of the matrix left to right shows the same stock price producing less profit on later dates. A put needs the stock to fall far enough, fast enough, to outrun that decay.',
  },
];

export default function LongPutPage() {
  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Long put calculator</h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">
          Estimate a put option’s profit or loss at any stock price on any date before
          expiration. Results update as you type.
        </p>
      </header>

      <CalculatorShell strategyId="long-put" />

      <Disclaimer />

      <section aria-labelledby="how-it-works" className="max-w-3xl space-y-4">
        <h2 id="how-it-works" className="text-lg font-semibold tracking-tight">
          How a long put works
        </h2>
        <p className="text-ink-secondary">
          Buying a put gives you the right — not the obligation — to sell 100 shares per
          contract at the strike price, any time until expiration. You pay a premium for
          that right. It is the classic bearish trade: if the stock falls well below the
          strike, the put’s value rises roughly dollar-for-dollar as the stock drops,
          while your risk stays capped at the premium paid. Traders also buy puts as
          insurance against shares they own.
        </p>
        <p className="text-ink-secondary">
          As with calls, time works against you. Part of the premium is time value that
          decays toward zero at expiration, so a stock that merely drifts sideways
          erodes the position day by day. The matrix above makes the race visible: the
          stock has to fall past your breakeven before time value runs out.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">
          Profit, loss, and breakeven formulas
        </h2>
        <div className="space-y-3">
          <FormulaBlock
            label="Profit at expiration"
            formula="P&L = (max(Strike − Stock, 0) − Premium) × 100 × Contracts"
          />
          <FormulaBlock label="Breakeven" formula="Breakeven = Strike − Premium" />
          <FormulaBlock
            label="Maximum profit"
            formula="Max profit = (Strike − Premium) × 100 × Contracts"
          />
          <FormulaBlock
            label="Maximum loss"
            formula="Max loss = Premium × 100 × Contracts"
          />
        </div>
        <p className="text-ink-secondary">
          Between today and expiration the put also carries time value, which the
          calculator prices with the Black-Scholes model at your implied volatility
          input. That is why intermediate date columns show smaller losses (or larger
          gains) than the expiry column at the same stock price.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">Reading the P&amp;L matrix</h2>
        <p className="text-ink-secondary">
          Each row is a hypothetical stock price; each column is a calendar date. A cell
          shows your estimated profit or loss in dollars if the stock reached that price
          on that date. For a long put the map is the mirror image of a call’s: the
          profitable green region sits in the lower rows where the stock has fallen, and
          the red region grows toward the upper-right as the stock holds firm and time
          value drains away.
        </p>
      </section>

      <FaqSection items={FAQ_ITEMS} />
    </article>
  );
}
