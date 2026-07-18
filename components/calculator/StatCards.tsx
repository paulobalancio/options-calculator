'use client';

import { NumberField } from '@/components/fields/NumberField';
import {
  formatMoney,
  formatSignedMoney,
  formatSignedPercent,
} from '@/lib/format';
import type { StrategySummary } from '@/lib/options/strategies';

interface StatCardsProps {
  summary: StrategySummary;
  /** P&L at expiry if the stock hits the user's target price. */
  targetPnl: number;
  targetPriceRaw: string;
  targetPriceError?: string;
  onTargetPriceChange: (value: string) => void;
}

function pnlClass(value: number): string {
  if (value > 0) return 'text-profit';
  if (value < 0) return 'text-loss';
  return '';
}

/** Headline numbers: max profit/loss, breakeven, cost, and return at target. */
export function StatCards({
  summary,
  targetPnl,
  targetPriceRaw,
  targetPriceError,
  onTargetPriceChange,
}: StatCardsProps) {
  const targetReturn = summary.netCost > 0 ? targetPnl / summary.netCost : 0;

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div className="rounded-md border border-line bg-surface p-3">
        <dt className="text-xs uppercase tracking-wide text-ink-tertiary">Max profit</dt>
        <dd className={`numeric mt-1 text-lg ${summary.maxProfit === null ? 'text-profit' : pnlClass(summary.maxProfit ?? 0)}`}>
          {summary.maxProfit === null ? 'Unlimited' : formatSignedMoney(summary.maxProfit)}
        </dd>
      </div>
      <div className="rounded-md border border-line bg-surface p-3">
        <dt className="text-xs uppercase tracking-wide text-ink-tertiary">Max loss</dt>
        <dd className="numeric mt-1 text-lg text-loss">
          {formatSignedMoney(-summary.maxLoss)}
        </dd>
      </div>
      <div className="rounded-md border border-line bg-surface p-3">
        <dt className="text-xs uppercase tracking-wide text-ink-tertiary">Breakeven</dt>
        <dd className="numeric mt-1 text-lg">{formatMoney(summary.breakevens[0])}</dd>
      </div>
      <div className="rounded-md border border-line bg-surface p-3">
        <dt className="text-xs uppercase tracking-wide text-ink-tertiary">Cost of trade</dt>
        <dd className="numeric mt-1 text-lg">{formatMoney(summary.netCost)}</dd>
      </div>
      <div className="col-span-2 rounded-md border border-line bg-surface p-3 sm:col-span-1">
        <dt className="text-xs uppercase tracking-wide text-ink-tertiary">
          Return at target
        </dt>
        <dd>
          <div className={`numeric mt-1 text-lg ${pnlClass(targetPnl)}`}>
            {formatSignedMoney(targetPnl)}{' '}
            <span className="text-sm">({formatSignedPercent(targetReturn)})</span>
          </div>
          <div className="mt-2">
            <NumberField
              id="targetPrice"
              label="Target price"
              unit="$"
              value={targetPriceRaw}
              error={targetPriceError}
              onChange={onTargetPriceChange}
            />
          </div>
        </dd>
      </div>
    </dl>
  );
}
