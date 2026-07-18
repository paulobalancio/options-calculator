'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { formatCellPnl, formatMoney } from '@/lib/format';
import type { PnlMatrix } from '@/lib/options/pnl-matrix';

interface PnlMatrixTableProps {
  matrix: PnlMatrix;
  spotPrice: number;
}

/**
 * Heatmap color for one cell: profit/loss token mixed toward the surface
 * color, scaled by that cell's share of the matrix's max gain or loss. The
 * whole ramp derives from the two semantic P&L tokens.
 */
function cellStyle(pnl: number, maxGain: number, maxLoss: number): CSSProperties {
  const intensity =
    pnl >= 0
      ? maxGain > 0
        ? pnl / maxGain
        : 0
      : maxLoss < 0
        ? pnl / maxLoss
        : 0;
  if (intensity < 0.02) return {};
  const base = pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)';
  const strong = pnl >= 0 ? 'var(--color-profit-strong)' : 'var(--color-loss-strong)';
  const mix = Math.round(6 + 74 * intensity);
  return {
    backgroundColor: `color-mix(in oklab, ${base} ${mix}%, var(--color-surface))`,
    color: intensity > 0.55 ? 'var(--color-surface)' : strong,
  };
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/**
 * The P&L matrix: price rows × date columns, recalculated live. The price
 * column sticks during horizontal scroll so the table works down to 360px.
 *
 * Calendar-date headers depend on the client's clock, so they render as
 * day offsets until mount to keep server and client HTML identical.
 */
export function PnlMatrixTable({ matrix, spotPrice }: PnlMatrixTableProps) {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const dateLabel = (offset: number, index: number): string => {
    if (index === 0) return 'Today';
    if (!today) return `+${offset}d`;
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return dateFormat.format(date);
  };
  const lastColumn = matrix.dayOffsets.length - 1;

  return (
    <section aria-label="Profit and loss matrix">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Profit / loss matrix</h2>
        <p className="text-xs text-ink-tertiary">
          Estimated P&L in dollars by stock price and date · assumes constant IV
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-sunken">
              <th
                scope="col"
                className="sticky left-0 z-10 border-b border-r border-line-strong bg-sunken px-3 py-2 text-left font-medium"
              >
                Price
              </th>
              {matrix.dayOffsets.map((offset, index) => (
                <th
                  key={offset}
                  scope="col"
                  className={`min-w-14 border-b border-line px-2 py-2 text-right font-medium ${
                    index === lastColumn ? 'text-ink' : 'text-ink-secondary'
                  }`}
                >
                  {index === lastColumn ? 'Expiry' : dateLabel(offset, index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.prices.map((price, row) => {
              const isSpotRow = Math.abs(price - spotPrice) < 1e-9;
              return (
                <tr key={price}>
                  <th
                    scope="row"
                    className={`numeric sticky left-0 z-10 border-r border-line-strong bg-surface px-3 py-1 text-left font-normal ${
                      isSpotRow ? 'font-semibold text-accent' : 'text-ink-secondary'
                    }`}
                  >
                    {formatMoney(price)}
                  </th>
                  {matrix.cells[row].map((pnl, col) => (
                    <td
                      key={matrix.dayOffsets[col]}
                      style={cellStyle(pnl, matrix.maxGain, matrix.maxLoss)}
                      className="numeric px-2 py-1 text-right"
                    >
                      {formatCellPnl(pnl)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
