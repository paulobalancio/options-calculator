/**
 * Parsing and validation of raw form input into engine-ready values.
 *
 * The form keeps every field as a string so users can type freely; this
 * module is the single place where strings become validated numbers. While a
 * field is invalid the UI keeps showing results from the last valid state,
 * so the calculator never blanks out mid-edit.
 */

import type { StrategyId } from './options/strategies';

export interface RawCalculatorInputs {
  spotPrice: string;
  strike: string;
  premium: string;
  contracts: string;
  daysToExpiry: string;
  /** Percent, as typed (30 = 30%). */
  impliedVol: string;
  /** Percent, as typed (4.5 = 4.5%). */
  riskFreeRate: string;
  /** Percent half-width of the matrix price range (25 = ±25%). */
  rangePct: string;
  targetPrice: string;
}

export interface CalculatorValues {
  spotPrice: number;
  strike: number;
  premium: number;
  contracts: number;
  daysToExpiry: number;
  /** Decimal (0.30). */
  impliedVol: number;
  /** Decimal (0.045). */
  riskFreeRate: number;
  /** Decimal (0.25). */
  rangePct: number;
  targetPrice: number;
}

export type FieldErrors = Partial<Record<keyof RawCalculatorInputs, string>>;

export interface ParseResult {
  values: CalculatorValues | null;
  errors: FieldErrors;
}

function toNumber(raw: string): number {
  const cleaned = raw.trim().replace(/[$,%\s]/g, '').replace(/,/g, '');
  if (cleaned === '') return NaN;
  return Number(cleaned);
}

interface Rule {
  min: number;
  max: number;
  integer?: boolean;
  message: string;
}

const RULES: Record<keyof RawCalculatorInputs, Rule> = {
  spotPrice: { min: 0.01, max: 1_000_000, message: 'Enter a price above $0' },
  strike: { min: 0.01, max: 1_000_000, message: 'Enter a strike above $0' },
  premium: { min: 0, max: 100_000, message: 'Enter a premium of $0 or more' },
  contracts: { min: 1, max: 10_000, integer: true, message: 'Enter 1–10,000 whole contracts' },
  daysToExpiry: { min: 0, max: 1_095, integer: true, message: 'Enter 0–1,095 days' },
  impliedVol: { min: 0.1, max: 500, message: 'Enter volatility between 0.1% and 500%' },
  riskFreeRate: { min: 0, max: 25, message: 'Enter a rate between 0% and 25%' },
  rangePct: { min: 5, max: 75, message: 'Enter a range between 5% and 75%' },
  targetPrice: { min: 0.01, max: 1_000_000, message: 'Enter a price above $0' },
};

/** Validate one field; returns an error message or null if valid. */
export function validateField(field: keyof RawCalculatorInputs, raw: string): string | null {
  const rule = RULES[field];
  const value = toNumber(raw);
  if (!Number.isFinite(value)) return 'Enter a number';
  if (rule.integer && !Number.isInteger(value)) return rule.message;
  if (value < rule.min || value > rule.max) return rule.message;
  return null;
}

/**
 * Parse the whole form. `values` is null if any field is invalid; `errors`
 * maps each invalid field to a user-facing message.
 */
export function parseCalculatorInputs(raw: RawCalculatorInputs): ParseResult {
  const errors: FieldErrors = {};
  for (const field of Object.keys(RULES) as (keyof RawCalculatorInputs)[]) {
    const error = validateField(field, raw[field]);
    if (error) errors[field] = error;
  }
  if (Object.keys(errors).length > 0) return { values: null, errors };

  return {
    values: {
      spotPrice: toNumber(raw.spotPrice),
      strike: toNumber(raw.strike),
      premium: toNumber(raw.premium),
      contracts: toNumber(raw.contracts),
      daysToExpiry: toNumber(raw.daysToExpiry),
      impliedVol: toNumber(raw.impliedVol) / 100,
      riskFreeRate: toNumber(raw.riskFreeRate) / 100,
      rangePct: toNumber(raw.rangePct) / 100,
      targetPrice: toNumber(raw.targetPrice),
    },
    errors,
  };
}

/**
 * Sensible starting inputs per strategy: a slightly out-of-the-money option
 * on a $100 stock, 30 days out, so the matrix and chart show meaningful
 * structure on first load.
 */
export function defaultInputs(strategyId: StrategyId): RawCalculatorInputs {
  const shared = {
    spotPrice: '100',
    premium: '3.50',
    contracts: '1',
    daysToExpiry: '30',
    impliedVol: '30',
    riskFreeRate: '4.5',
    rangePct: '25',
  };
  return strategyId === 'long-call'
    ? { ...shared, strike: '105', targetPrice: '115' }
    : { ...shared, strike: '95', targetPrice: '85' };
}
