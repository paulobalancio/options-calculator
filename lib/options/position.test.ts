import { describe, expect, it } from 'vitest';
import { netCost, pnlAtExpiry, positionPnl, positionValue } from './position';
import { STRATEGIES } from './strategies';
import type { OptionLeg } from './types';

const callLeg: OptionLeg = {
  type: 'call',
  side: 'long',
  strike: 105,
  premium: 3.5,
  contracts: 2,
  impliedVol: 0.3,
};

const putLeg: OptionLeg = {
  type: 'put',
  side: 'long',
  strike: 95,
  premium: 2.25,
  contracts: 1,
  impliedVol: 0.3,
};

describe('netCost', () => {
  it('is premium × 100 × contracts for a long leg', () => {
    expect(netCost([callLeg])).toBe(700);
    expect(netCost([putLeg])).toBe(225);
  });

  it('nets long debits against short credits', () => {
    const short: OptionLeg = { ...callLeg, side: 'short', premium: 1.5, contracts: 2 };
    expect(netCost([callLeg, short])).toBe(700 - 300);
  });
});

describe('pnlAtExpiry', () => {
  it('long call loses exactly the debit below strike', () => {
    expect(pnlAtExpiry([callLeg], 100)).toBe(-700);
    expect(pnlAtExpiry([callLeg], 105)).toBe(-700);
  });

  it('long call breaks even at strike + premium', () => {
    expect(pnlAtExpiry([callLeg], 108.5)).toBeCloseTo(0, 8);
  });

  it('long call gains $100/contract per $1 above breakeven', () => {
    expect(pnlAtExpiry([callLeg], 110.5)).toBeCloseTo(400, 8);
  });

  it('long put breaks even at strike − premium and caps loss above strike', () => {
    expect(pnlAtExpiry([putLeg], 92.75)).toBeCloseTo(0, 8);
    expect(pnlAtExpiry([putLeg], 100)).toBe(-225);
    expect(pnlAtExpiry([putLeg], 90)).toBeCloseTo(275, 8);
  });
});

describe('positionPnl before expiry', () => {
  it('an option with time remaining is worth more than intrinsic (long call P&L above expiry P&L)', () => {
    const spot = 108;
    const before = positionPnl([callLeg], spot, 30 / 365, 0.045);
    const atExpiry = pnlAtExpiry([callLeg], spot);
    expect(before).toBeGreaterThan(atExpiry);
  });

  it('converges to expiry P&L as time runs out', () => {
    const spot = 112;
    expect(positionPnl([callLeg], spot, 0, 0.045)).toBeCloseTo(
      pnlAtExpiry([callLeg], spot),
      8,
    );
  });

  it('positionValue at zero time equals intrinsic value', () => {
    expect(positionValue([callLeg], 110, 0, 0.045)).toBe(5 * 100 * 2);
  });
});

describe('strategy summaries', () => {
  const inputs = { strike: 105, premium: 3.5, contracts: 2, impliedVol: 0.3 };

  it('long call: unlimited profit, loss capped at debit, breakeven K + premium', () => {
    const s = STRATEGIES['long-call'].summarize(inputs);
    expect(s.maxProfit).toBeNull();
    expect(s.maxLoss).toBe(700);
    expect(s.breakevens).toEqual([108.5]);
    expect(s.netCost).toBe(700);
  });

  it('long put: max profit at stock zero, breakeven K − premium', () => {
    const s = STRATEGIES['long-put'].summarize({ ...inputs, strike: 95, premium: 2.25 });
    // Breakeven 92.75; if stock goes to 0, put is worth 95 → profit 92.75 × 100 × 2.
    expect(s.breakevens).toEqual([92.75]);
    expect(s.maxProfit).toBeCloseTo(18550, 8);
    expect(s.maxLoss).toBe(450);
  });

  it('summary breakevens agree with the payoff math', () => {
    for (const id of ['long-call', 'long-put'] as const) {
      const def = STRATEGIES[id];
      const summary = def.summarize(inputs);
      const legs = def.buildLegs(inputs);
      for (const breakeven of summary.breakevens) {
        expect(pnlAtExpiry(legs, breakeven)).toBeCloseTo(0, 8);
      }
    }
  });
});
