import type { Metadata } from 'next';
import { CalculatorShell } from '@/components/calculator/CalculatorShell';
import { FaqSection, type FaqItem } from '@/components/content/FaqSection';
import { FormulaBlock } from '@/components/content/FormulaBlock';
import { Disclaimer } from '@/components/site/Disclaimer';

export const metadata: Metadata = {
  title: { absolute: 'Long Call Calculator — Call Option Profit Calculator' },
  description:
    'Free long call calculator: see profit, loss, and breakeven for any call option across every price and date until expiry, with a live P&L heatmap and payoff chart.',
  alternates: { canonical: '/calculator/long-call' },
  openGraph: {
    title: 'Long Call Calculator — Call Option Profit Calculator',
    description:
      'Model a long call before you trade: live P&L matrix, payoff chart, breakeven, and Greeks.',
    url: '/calculator/long-call',
  },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How is long call profit calculated?',
    answer:
      'At expiration, profit = (stock price − strike price − premium paid) × 100 × contracts, as long as the stock is above the strike. If it finishes at or below the strike, the call expires worthless and you lose the full premium. Before expiration, the calculator uses the Black-Scholes model to estimate the option’s remaining time value as well.',
  },
  {
    question: 'What is the breakeven price for a long call?',
    answer:
      'Breakeven at expiration is the strike price plus the premium paid per share. For example, a $105 call bought for $3.50 breaks even with the stock at $108.50. Before expiration you can close the position at a profit below breakeven if the option still holds enough time value.',
  },
  {
    question: 'Can I lose more than I paid for a call option?',
    answer:
      'No. A long call’s maximum loss is the total premium paid (premium × 100 × contracts), which happens if the stock closes at or below the strike at expiration. Unlike buying stock on margin or shorting, the risk is capped from the start.',
  },
  {
    question: 'What happens to my call option as expiration approaches?',
    answer:
      'The option loses time value each day — a decay called theta. The calculator’s matrix shows this directly: reading a row from left to right, the same stock price produces a smaller profit on later dates because less time value remains.',
  },
  {
    question: 'How does implied volatility affect a long call?',
    answer:
      'Higher implied volatility raises option prices, so a long call gains value when IV rises (vega is positive) and loses value when IV falls — even if the stock doesn’t move. The calculator assumes IV stays constant, so treat results after a big event like earnings with caution.',
  },
  {
    question: 'Is the maximum profit on a long call really unlimited?',
    answer:
      'In theory, yes: there is no ceiling on how high a stock can rise, so a call’s payoff has no cap. In practice your profit is limited by how far the stock actually moves before expiration, which is why the calculator focuses on realistic price scenarios around the current price.',
  },
];

export default function LongCallPage() {
  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Long call calculator</h1>
        <p className="mt-1 max-w-2xl text-ink-secondary">
          Estimate a call option’s profit or loss at any stock price on any date before
          expiration. Results update as you type.
        </p>
      </header>

      <CalculatorShell strategyId="long-call" />

      <Disclaimer />

      <section aria-labelledby="how-it-works" className="max-w-3xl space-y-4">
        <h2 id="how-it-works" className="text-lg font-semibold tracking-tight">
          How a long call works
        </h2>
        <p className="text-ink-secondary">
          Buying a call gives you the right — not the obligation — to buy 100 shares per
          contract at the strike price, any time until expiration. You pay a premium up
          front for that right. It is the classic bullish options trade: if the stock
          rises well above the strike, the call’s value grows roughly dollar-for-dollar
          with the stock, but you only ever risk the premium you paid.
        </p>
        <p className="text-ink-secondary">
          The trade-off is time. Part of the premium is time value, and it melts away as
          expiration approaches. A stock that drifts sideways can leave a call worth
          less every day even though nothing went “wrong.” That is why the P&amp;L matrix
          above shows dates as columns: the same stock price is worth less to you on a
          later date, and you can see exactly how much less.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">
          Profit, loss, and breakeven formulas
        </h2>
        <div className="space-y-3">
          <FormulaBlock
            label="Profit at expiration"
            formula="P&L = (max(Stock − Strike, 0) − Premium) × 100 × Contracts"
          />
          <FormulaBlock label="Breakeven" formula="Breakeven = Strike + Premium" />
          <FormulaBlock
            label="Maximum loss"
            formula="Max loss = Premium × 100 × Contracts"
          />
        </div>
        <p className="text-ink-secondary">
          Before expiration the position is worth more than these formulas suggest,
          because the option still carries time value. The calculator prices that
          remaining value with the Black-Scholes model using your implied volatility
          input, which is how it fills in every date column between today and expiry.
        </p>

        <h2 className="text-lg font-semibold tracking-tight">Reading the P&amp;L matrix</h2>
        <p className="text-ink-secondary">
          Each row is a hypothetical stock price; each column is a calendar date. A cell
          shows your estimated profit or loss in dollars if the stock reached that price
          on that date. Green cells are profitable scenarios, red cells are losses, and
          the color depth is scaled to your best and worst outcomes in the table. The
          bottom-left region — stock falling, time passing — is where long calls bleed;
          the top-right corner is where they pay.
        </p>
      </section>

      <FaqSection items={FAQ_ITEMS} />
    </article>
  );
}
