/**
 * Position-level math: values a set of option legs as one strategy.
 *
 * Everything here is leg-agnostic — a long call, a straddle, or an iron
 * condor all flow through the same three functions. New strategies only need
 * to describe their legs.
 */

import { blackScholesPrice, intrinsicValue } from './black-scholes';
import { SHARES_PER_CONTRACT, type OptionLeg } from './types';

/** +1 for long legs, −1 for short legs. */
function legSign(leg: OptionLeg): number {
  return leg.side === 'long' ? 1 : -1;
}

/** Dollars controlled by a leg: contracts × 100 shares. */
function legScale(leg: OptionLeg): number {
  return leg.contracts * SHARES_PER_CONTRACT;
}

/**
 * Net cost to open the position, in dollars.
 *
 * Long legs cost their premium; short legs collect it. For a long call or
 * put this is simply premium × 100 × contracts — the most you can lose.
 */
export function netCost(legs: readonly OptionLeg[]): number {
  return legs.reduce((sum, leg) => sum + legSign(leg) * leg.premium * legScale(leg), 0);
}

/**
 * Theoretical market value of the position at a hypothetical spot price and
 * time before expiry, using Black-Scholes for each leg.
 */
export function positionValue(
  legs: readonly OptionLeg[],
  spot: number,
  yearsToExpiry: number,
  rate: number,
): number {
  return legs.reduce((sum, leg) => {
    const price = blackScholesPrice({
      type: leg.type,
      spot,
      strike: leg.strike,
      yearsToExpiry,
      vol: leg.impliedVol,
      rate,
    });
    return sum + legSign(leg) * price * legScale(leg);
  }, 0);
}

/**
 * Estimated profit or loss in dollars if the stock were at `spot` with
 * `yearsToExpiry` remaining: current theoretical value minus what the
 * position cost to open. This is the number in every P&L matrix cell.
 */
export function positionPnl(
  legs: readonly OptionLeg[],
  spot: number,
  yearsToExpiry: number,
  rate: number,
): number {
  return positionValue(legs, spot, yearsToExpiry, rate) - netCost(legs);
}

/**
 * Profit or loss at expiry, when only intrinsic value remains. Drives the
 * payoff line chart and the matrix's final column.
 */
export function pnlAtExpiry(legs: readonly OptionLeg[], spot: number): number {
  const value = legs.reduce(
    (sum, leg) =>
      sum + legSign(leg) * intrinsicValue(leg.type, spot, leg.strike) * legScale(leg),
    0,
  );
  return value - netCost(legs);
}
