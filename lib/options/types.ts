/**
 * Core domain types for the options engine.
 *
 * The engine models every strategy as a set of option legs. A long call is a
 * single long-call leg; a vertical spread would be two legs; adding new
 * strategies means composing legs, not changing the math.
 */

export type OptionType = 'call' | 'put';

/** Whether the leg was bought (long) or written (short). */
export type PositionSide = 'long' | 'short';

/** Shares controlled by one standard equity option contract. */
export const SHARES_PER_CONTRACT = 100;

/**
 * One option leg of a strategy.
 *
 * `premium` and `strike` are per-share dollar amounts, as quoted by brokers.
 * `impliedVol` is annualized and expressed as a decimal (0.35 = 35%).
 */
export interface OptionLeg {
  type: OptionType;
  side: PositionSide;
  strike: number;
  premium: number;
  contracts: number;
  impliedVol: number;
}

/**
 * Market conditions shared by every leg of a position.
 *
 * `riskFreeRate` is the annualized rate (decimal) used for discounting in
 * Black-Scholes — conventionally the Treasury yield matching the option's
 * time to expiry.
 */
export interface MarketInputs {
  spotPrice: number;
  daysToExpiry: number;
  riskFreeRate: number;
}

export const DAYS_PER_YEAR = 365;

/** Convert calendar days to the year fraction Black-Scholes expects. */
export function daysToYears(days: number): number {
  return days / DAYS_PER_YEAR;
}
