import { describe, expect, it } from 'vitest';
import {
  blackScholesGreeks,
  blackScholesPrice,
  intrinsicValue,
  normCdf,
} from './black-scholes';

describe('normCdf', () => {
  it('matches standard normal table values', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 7);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normCdf(-1.96)).toBeCloseTo(0.025, 4);
    expect(normCdf(1)).toBeCloseTo(0.8413, 4);
  });
});

describe('blackScholesPrice', () => {
  // Hull, "Options, Futures, and Other Derivatives": S=42, K=40, r=10%,
  // vol=20%, T=0.5y gives call ≈ 4.76 and put ≈ 0.81.
  const hull = { spot: 42, strike: 40, yearsToExpiry: 0.5, vol: 0.2, rate: 0.1 };

  it('reproduces Hull textbook call value', () => {
    expect(blackScholesPrice({ type: 'call', ...hull })).toBeCloseTo(4.759, 3);
  });

  it('reproduces Hull textbook put value', () => {
    expect(blackScholesPrice({ type: 'put', ...hull })).toBeCloseTo(0.8086, 3);
  });

  // Widely published ATM reference: S=K=100, T=1y, r=5%, vol=20%.
  const atm = { spot: 100, strike: 100, yearsToExpiry: 1, vol: 0.2, rate: 0.05 };

  it('reproduces standard ATM reference values', () => {
    expect(blackScholesPrice({ type: 'call', ...atm })).toBeCloseTo(10.4506, 3);
    expect(blackScholesPrice({ type: 'put', ...atm })).toBeCloseTo(5.5735, 3);
  });

  it('satisfies put-call parity: C − P = S − K·e^(−rT)', () => {
    const cases = [
      { spot: 100, strike: 95, yearsToExpiry: 0.25, vol: 0.35, rate: 0.045 },
      { spot: 250, strike: 300, yearsToExpiry: 1.5, vol: 0.6, rate: 0.02 },
      { spot: 18, strike: 20, yearsToExpiry: 0.08, vol: 0.9, rate: 0.05 },
    ];
    for (const c of cases) {
      const call = blackScholesPrice({ type: 'call', ...c });
      const put = blackScholesPrice({ type: 'put', ...c });
      const parity = c.spot - c.strike * Math.exp(-c.rate * c.yearsToExpiry);
      expect(call - put).toBeCloseTo(parity, 6);
    }
  });

  it('returns intrinsic value at expiry', () => {
    const base = { strike: 100, yearsToExpiry: 0, vol: 0.3, rate: 0.045 };
    expect(blackScholesPrice({ type: 'call', spot: 110, ...base })).toBe(10);
    expect(blackScholesPrice({ type: 'call', spot: 90, ...base })).toBe(0);
    expect(blackScholesPrice({ type: 'put', spot: 90, ...base })).toBe(10);
    expect(blackScholesPrice({ type: 'put', spot: 110, ...base })).toBe(0);
  });

  it('never prices below intrinsic value before expiry', () => {
    const deep = { spot: 200, strike: 100, yearsToExpiry: 0.5, vol: 0.2, rate: 0.05 };
    expect(blackScholesPrice({ type: 'call', ...deep })).toBeGreaterThanOrEqual(
      intrinsicValue('call', deep.spot, deep.strike),
    );
  });
});

describe('blackScholesGreeks', () => {
  const atm = { spot: 100, strike: 100, yearsToExpiry: 1, vol: 0.2, rate: 0.05 };

  it('matches published ATM Greeks for a call', () => {
    const g = blackScholesGreeks({ type: 'call', ...atm });
    expect(g.delta).toBeCloseTo(0.6368, 3);
    expect(g.gamma).toBeCloseTo(0.018762, 4);
    expect(g.vegaPer1Pct).toBeCloseTo(0.37524, 3);
    // Annual call theta ≈ −6.414 → per calendar day ≈ −0.01757.
    expect(g.thetaPerDay).toBeCloseTo(-0.01757, 4);
  });

  it('put delta equals call delta minus one', () => {
    const call = blackScholesGreeks({ type: 'call', ...atm });
    const put = blackScholesGreeks({ type: 'put', ...atm });
    expect(put.delta).toBeCloseTo(call.delta - 1, 6);
    expect(put.gamma).toBeCloseTo(call.gamma, 6);
    expect(put.vegaPer1Pct).toBeCloseTo(call.vegaPer1Pct, 6);
  });

  it('collapses to step-function delta at expiry', () => {
    const base = { strike: 100, yearsToExpiry: 0, vol: 0.3, rate: 0.045 };
    expect(blackScholesGreeks({ type: 'call', spot: 110, ...base }).delta).toBe(1);
    expect(blackScholesGreeks({ type: 'call', spot: 90, ...base }).delta).toBe(0);
    expect(blackScholesGreeks({ type: 'put', spot: 90, ...base }).delta).toBe(-1);
  });
});
