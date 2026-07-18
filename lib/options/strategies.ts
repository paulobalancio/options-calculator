/**
 * Strategy definitions — the extension point for new calculators.
 *
 * A strategy turns user inputs into option legs plus closed-form summary
 * stats (max profit, max loss, breakevens). To add a spread or covered call
 * later: add an entry here and a route that renders it; the engine, matrix,
 * and chart code need no changes.
 */

import { netCost } from './position';
import { SHARES_PER_CONTRACT, type OptionLeg } from './types';

export type StrategyId = 'long-call' | 'long-put';

/** User-entered terms of a single-leg strategy. */
export interface SingleLegInputs {
  strike: number;
  premium: number;
  contracts: number;
  impliedVol: number;
}

export interface StrategySummary {
  /** Dollars; null means unlimited (a long call's upside has no cap). */
  maxProfit: number | null;
  /** Dollars, expressed as a positive number. */
  maxLoss: number;
  /** Stock prices at expiry where the position breaks even. */
  breakevens: number[];
  /** Cash paid to open the position (debit), in dollars. */
  netCost: number;
}

export interface StrategyDefinition {
  id: StrategyId;
  name: string;
  buildLegs(inputs: SingleLegInputs): OptionLeg[];
  summarize(inputs: SingleLegInputs): StrategySummary;
}

/**
 * Long call: buy a call, profit if the stock rises above strike + premium by
 * expiry. Upside is unlimited; loss is capped at the premium paid.
 */
const longCall: StrategyDefinition = {
  id: 'long-call',
  name: 'Long Call',
  buildLegs: (inputs) => [
    {
      type: 'call',
      side: 'long',
      strike: inputs.strike,
      premium: inputs.premium,
      contracts: inputs.contracts,
      impliedVol: inputs.impliedVol,
    },
  ],
  summarize(inputs) {
    const legs = this.buildLegs(inputs);
    const cost = netCost(legs);
    return {
      maxProfit: null,
      maxLoss: cost,
      breakevens: [inputs.strike + inputs.premium],
      netCost: cost,
    };
  },
};

/**
 * Long put: buy a put, profit if the stock falls below strike − premium by
 * expiry. Max profit is capped by the stock reaching zero; loss is capped at
 * the premium paid.
 */
const longPut: StrategyDefinition = {
  id: 'long-put',
  name: 'Long Put',
  buildLegs: (inputs) => [
    {
      type: 'put',
      side: 'long',
      strike: inputs.strike,
      premium: inputs.premium,
      contracts: inputs.contracts,
      impliedVol: inputs.impliedVol,
    },
  ],
  summarize(inputs) {
    const legs = this.buildLegs(inputs);
    const cost = netCost(legs);
    const breakeven = inputs.strike - inputs.premium;
    return {
      maxProfit: breakeven * SHARES_PER_CONTRACT * inputs.contracts,
      maxLoss: cost,
      breakevens: [breakeven],
      netCost: cost,
    };
  },
};

export const STRATEGIES: Record<StrategyId, StrategyDefinition> = {
  'long-call': longCall,
  'long-put': longPut,
};
