import { describe, expect, it } from 'vitest';
import { defaultInputs, parseCalculatorInputs } from './calculator-inputs';

describe('parseCalculatorInputs', () => {
  it('parses the default inputs for both strategies', () => {
    for (const id of ['long-call', 'long-put'] as const) {
      const { values, errors } = parseCalculatorInputs(defaultInputs(id));
      expect(errors).toEqual({});
      expect(values).not.toBeNull();
      expect(values?.impliedVol).toBeCloseTo(0.3, 8);
      expect(values?.riskFreeRate).toBeCloseTo(0.045, 8);
      expect(values?.rangePct).toBeCloseTo(0.25, 8);
    }
  });

  it('tolerates $ signs, commas, and whitespace', () => {
    const raw = { ...defaultInputs('long-call'), spotPrice: ' $1,250.50 ' };
    const { values } = parseCalculatorInputs(raw);
    expect(values?.spotPrice).toBe(1250.5);
  });

  it('rejects non-numeric and out-of-range values with per-field errors', () => {
    const raw = {
      ...defaultInputs('long-call'),
      spotPrice: 'abc',
      contracts: '2.5',
      impliedVol: '0',
    };
    const { values, errors } = parseCalculatorInputs(raw);
    expect(values).toBeNull();
    expect(errors.spotPrice).toBe('Enter a number');
    expect(errors.contracts).toMatch(/whole contracts/);
    expect(errors.impliedVol).toMatch(/volatility/);
    expect(errors.strike).toBeUndefined();
  });

  it('allows zero days to expiry (expiration day)', () => {
    const raw = { ...defaultInputs('long-call'), daysToExpiry: '0' };
    expect(parseCalculatorInputs(raw).values?.daysToExpiry).toBe(0);
  });
});
