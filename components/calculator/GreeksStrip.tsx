'use client';

import type { Greeks } from '@/lib/options/black-scholes';

const GREEK_LABELS = [
  { key: 'delta', label: 'Delta', digits: 2 },
  { key: 'gamma', label: 'Gamma', digits: 4 },
  { key: 'thetaPerDay', label: 'Theta/day', digits: 3 },
  { key: 'vegaPer1Pct', label: 'Vega/1%', digits: 3 },
] as const;

/** Compact per-share Greeks readout under the stat cards. */
export function GreeksStrip({ greeks }: { greeks: Greeks }) {
  return (
    <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-md border border-line bg-sunken px-4 py-2.5">
      {GREEK_LABELS.map(({ key, label, digits }) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <dt className="text-xs text-ink-tertiary">{label}</dt>
          <dd className="numeric text-sm">{greeks[key].toFixed(digits)}</dd>
        </div>
      ))}
      <div className="text-xs text-ink-tertiary">per share</div>
    </dl>
  );
}
