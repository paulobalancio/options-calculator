import { describe, expect, it } from 'vitest';
import { buildDayOffsets, buildPnlMatrix, buildPriceRange } from './pnl-matrix';
import { pnlAtExpiry } from './position';
import { STRATEGIES } from './strategies';

describe('buildPriceRange', () => {
  it('spans ±25% around spot with spot as the middle row', () => {
    const prices = buildPriceRange(100, 0.25, 21);
    expect(prices).toHaveLength(21);
    expect(prices[0]).toBe(125);
    expect(prices[10]).toBe(100);
    expect(prices[20]).toBe(75);
  });

  it('sorts highest price first', () => {
    const prices = buildPriceRange(250, 0.25, 21);
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  it('forces an odd step count so spot is always a row', () => {
    const prices = buildPriceRange(100, 0.25, 20);
    expect(prices.length % 2).toBe(1);
    expect(prices).toContain(100);
  });
});

describe('buildDayOffsets', () => {
  it('always includes today and expiry', () => {
    const offsets = buildDayOffsets(45, 12);
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBe(45);
    expect(offsets.length).toBeLessThanOrEqual(12);
  });

  it('gives every day a column when expiry is near', () => {
    expect(buildDayOffsets(5, 12)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('handles zero days to expiry', () => {
    expect(buildDayOffsets(0, 12)).toEqual([0]);
  });
});

describe('buildPnlMatrix', () => {
  const inputs = { strike: 105, premium: 3.5, contracts: 1, impliedVol: 0.3 };
  const legs = STRATEGIES['long-call'].buildLegs(inputs);
  const market = { spotPrice: 100, daysToExpiry: 30, riskFreeRate: 0.045 };

  it('final column equals the expiry payoff', () => {
    const matrix = buildPnlMatrix(legs, market);
    const lastCol = matrix.dayOffsets.length - 1;
    for (let row = 0; row < matrix.prices.length; row++) {
      expect(matrix.cells[row][lastCol]).toBeCloseTo(
        pnlAtExpiry(legs, matrix.prices[row]),
        6,
      );
    }
  });

  it('long call: cells increase with stock price on every date', () => {
    const matrix = buildPnlMatrix(legs, market);
    for (let col = 0; col < matrix.dayOffsets.length; col++) {
      for (let row = 1; row < matrix.prices.length; row++) {
        // Prices are sorted descending, so P&L must not increase down a column.
        expect(matrix.cells[row][col]).toBeLessThanOrEqual(matrix.cells[row - 1][col]);
      }
    }
  });

  it('loss never exceeds the debit paid', () => {
    const matrix = buildPnlMatrix(legs, market);
    expect(matrix.maxLoss).toBeGreaterThanOrEqual(-350);
  });

  it('tracks extremes matching the cell contents', () => {
    const matrix = buildPnlMatrix(legs, market);
    const flat = matrix.cells.flat();
    expect(matrix.maxGain).toBe(Math.max(...flat));
    expect(matrix.maxLoss).toBe(Math.min(...flat));
  });
});
