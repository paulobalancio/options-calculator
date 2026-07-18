/**
 * P&L matrix construction — the app's signature output.
 *
 * Rows are hypothetical stock prices around the current spot; columns are
 * calendar dates from today to expiry. Each cell estimates the position's
 * profit or loss if the stock reached that price on that date, using
 * Black-Scholes for the remaining time value.
 */

import { positionPnl } from './position';
import { daysToYears, type MarketInputs, type OptionLeg } from './types';

export interface MatrixOptions {
  /** Half-width of the price range as a fraction of spot (0.25 = ±25%). */
  rangePct: number;
  /** Number of price rows. */
  priceSteps: number;
  /** Maximum number of date columns, including today and expiry. */
  maxDateColumns: number;
}

export const DEFAULT_MATRIX_OPTIONS: MatrixOptions = {
  rangePct: 0.25,
  priceSteps: 21,
  maxDateColumns: 12,
};

export interface PnlMatrix {
  /** Price rows, highest first (as brokers display option chains). */
  prices: number[];
  /** Days from today for each column; last entry is expiry. */
  dayOffsets: number[];
  /** cells[row][col] = P&L in dollars at prices[row] on dayOffsets[col]. */
  cells: number[][];
  /** Extremes across all cells, for symmetric color scaling. */
  maxGain: number;
  maxLoss: number;
}

/**
 * Evenly spaced hypothetical prices around spot, highest first, rounded to
 * cents. Step count is forced odd so the current spot is always its own row.
 */
export function buildPriceRange(spot: number, rangePct: number, steps: number): number[] {
  const oddSteps = steps % 2 === 0 ? steps + 1 : steps;
  const half = Math.floor(oddSteps / 2);
  const stepSize = (spot * rangePct) / half;
  const prices: number[] = [];
  for (let i = half; i >= -half; i--) {
    prices.push(Math.round((spot + i * stepSize) * 100) / 100);
  }
  return prices;
}

/**
 * Day offsets from today through expiry, always including both endpoints.
 * With few days to expiry every date gets a column; otherwise dates are
 * evenly thinned to fit `maxColumns`.
 */
export function buildDayOffsets(daysToExpiry: number, maxColumns: number): number[] {
  const totalDays = Math.max(Math.round(daysToExpiry), 0);
  if (totalDays === 0) return [0];
  const columns = Math.min(totalDays + 1, Math.max(maxColumns, 2));
  const offsets: number[] = [];
  for (let i = 0; i < columns; i++) {
    offsets.push(Math.round((i * totalDays) / (columns - 1)));
  }
  return [...new Set(offsets)];
}

/** Build the full matrix for a position under given market conditions. */
export function buildPnlMatrix(
  legs: readonly OptionLeg[],
  market: MarketInputs,
  options: MatrixOptions = DEFAULT_MATRIX_OPTIONS,
): PnlMatrix {
  const prices = buildPriceRange(market.spotPrice, options.rangePct, options.priceSteps);
  const dayOffsets = buildDayOffsets(market.daysToExpiry, options.maxDateColumns);

  let maxGain = -Infinity;
  let maxLoss = Infinity;
  const cells = prices.map((price) =>
    dayOffsets.map((day) => {
      const remainingYears = daysToYears(market.daysToExpiry - day);
      const pnl = positionPnl(legs, price, remainingYears, market.riskFreeRate);
      if (pnl > maxGain) maxGain = pnl;
      if (pnl < maxLoss) maxLoss = pnl;
      return pnl;
    }),
  );

  return { prices, dayOffsets, cells, maxGain, maxLoss };
}
