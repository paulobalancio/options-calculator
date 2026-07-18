/**
 * Black-Scholes pricing for European options.
 *
 * The model gives the fair value of an option from five inputs: spot price,
 * strike, time to expiry, volatility, and the risk-free rate. We use it to
 * estimate what an option will be worth at intermediate dates before expiry —
 * that is what makes the P&L matrix possible, since at any date short of
 * expiry an option still carries time value on top of intrinsic value.
 */

import type { OptionType } from './types';

/** Standard normal probability density function φ(x). */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal cumulative distribution function N(x).
 *
 * Uses the Abramowitz & Stegun 7.1.26 rational approximation of erf, accurate
 * to ~1.5e-7 — far below display precision for option prices.
 */
export function normCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

export interface PricingInputs {
  type: OptionType;
  spot: number;
  strike: number;
  /** Time to expiry as a year fraction; 0 or negative means expired. */
  yearsToExpiry: number;
  /** Annualized implied volatility as a decimal (0.35 = 35%). */
  vol: number;
  /** Annualized risk-free rate as a decimal. */
  rate: number;
}

/** Value of an option at expiry: what exercising it is worth, floored at 0. */
export function intrinsicValue(type: OptionType, spot: number, strike: number): number {
  return type === 'call' ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
}

/**
 * The d1/d2 terms shared by the price and every Greek.
 *
 * d1 measures how far in-the-money the option is expected to finish, in
 * standard deviations of the stock's log return; d2 shifts d1 down by one
 * volatility unit and drives the probability of expiring in-the-money.
 */
function dTerms(inputs: PricingInputs): { d1: number; d2: number } {
  const { spot, strike, yearsToExpiry, vol, rate } = inputs;
  const volSqrtT = vol * Math.sqrt(yearsToExpiry);
  const d1 =
    (Math.log(spot / strike) + (rate + (vol * vol) / 2) * yearsToExpiry) / volSqrtT;
  return { d1, d2: d1 - volSqrtT };
}

/**
 * Black-Scholes fair value of a European call or put, per share.
 *
 * At or past expiry (or with zero volatility) this degrades gracefully to
 * intrinsic value, so the same function prices every cell of the P&L matrix
 * including the expiry column.
 */
export function blackScholesPrice(inputs: PricingInputs): number {
  const { type, spot, strike, yearsToExpiry, vol, rate } = inputs;
  if (yearsToExpiry <= 0 || vol <= 0) {
    return intrinsicValue(type, spot, strike);
  }
  const { d1, d2 } = dTerms(inputs);
  const discountedStrike = strike * Math.exp(-rate * yearsToExpiry);
  if (type === 'call') {
    return spot * normCdf(d1) - discountedStrike * normCdf(d2);
  }
  return discountedStrike * normCdf(-d2) - spot * normCdf(-d1);
}

export interface Greeks {
  /** Change in option price per $1 move in the stock (−1 to 1). */
  delta: number;
  /** Change in delta per $1 move in the stock. */
  gamma: number;
  /** Time decay: change in option price per calendar day, usually negative. */
  thetaPerDay: number;
  /** Change in option price per 1-percentage-point change in implied vol. */
  vegaPer1Pct: number;
}

/**
 * The Greeks: sensitivities of the option price to its inputs.
 *
 * Theta is annualized internally and reported per calendar day; vega is
 * reported per 1% vol change — the units traders actually quote.
 */
export function blackScholesGreeks(inputs: PricingInputs): Greeks {
  const { type, spot, strike, yearsToExpiry, vol, rate } = inputs;
  if (yearsToExpiry <= 0 || vol <= 0) {
    const inTheMoney = intrinsicValue(type, spot, strike) > 0;
    const expiredDelta = inTheMoney ? (type === 'call' ? 1 : -1) : 0;
    return { delta: expiredDelta, gamma: 0, thetaPerDay: 0, vegaPer1Pct: 0 };
  }
  const { d1, d2 } = dTerms(inputs);
  const sqrtT = Math.sqrt(yearsToExpiry);
  const pdfD1 = normPdf(d1);
  const discountedStrike = strike * Math.exp(-rate * yearsToExpiry);

  const delta = type === 'call' ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = pdfD1 / (spot * vol * sqrtT);
  const vegaPer1Pct = (spot * pdfD1 * sqrtT) / 100;
  const decay = -(spot * pdfD1 * vol) / (2 * sqrtT);
  const carry =
    type === 'call'
      ? -rate * discountedStrike * normCdf(d2)
      : rate * discountedStrike * normCdf(-d2);
  const thetaPerDay = (decay + carry) / 365;

  return { delta, gamma, thetaPerDay, vegaPer1Pct };
}
