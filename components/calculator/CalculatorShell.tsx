'use client';

import { useMemo, useRef, useState } from 'react';
import { GreeksStrip } from '@/components/calculator/GreeksStrip';
import { InputPanel } from '@/components/calculator/InputPanel';
import { PayoffChart } from '@/components/calculator/PayoffChart';
import { PnlMatrixTable } from '@/components/calculator/PnlMatrixTable';
import { StatCards } from '@/components/calculator/StatCards';
import {
  defaultInputs,
  parseCalculatorInputs,
  type CalculatorValues,
  type RawCalculatorInputs,
} from '@/lib/calculator-inputs';
import { blackScholesGreeks } from '@/lib/options/black-scholes';
import { buildPnlMatrix, DEFAULT_MATRIX_OPTIONS } from '@/lib/options/pnl-matrix';
import { pnlAtExpiry } from '@/lib/options/position';
import { STRATEGIES, type StrategyId } from '@/lib/options/strategies';
import { daysToYears } from '@/lib/options/types';

/**
 * The interactive calculator island: owns form state, derives every output
 * from the engine on each keystroke (no Calculate button). While a field is
 * invalid, results continue rendering from the last valid inputs.
 */
export function CalculatorShell({ strategyId }: { strategyId: StrategyId }) {
  const definition = STRATEGIES[strategyId];
  const [raw, setRaw] = useState<RawCalculatorInputs>(() => defaultInputs(strategyId));
  const parsed = useMemo(() => parseCalculatorInputs(raw), [raw]);

  const lastValidRef = useRef<CalculatorValues | null>(null);
  if (parsed.values) lastValidRef.current = parsed.values;
  const values = parsed.values ?? lastValidRef.current;

  const derived = useMemo(() => {
    if (!values) return null;
    const strategyInputs = {
      strike: values.strike,
      premium: values.premium,
      contracts: values.contracts,
      impliedVol: values.impliedVol,
    };
    const legs = definition.buildLegs(strategyInputs);
    const summary = definition.summarize(strategyInputs);
    const market = {
      spotPrice: values.spotPrice,
      daysToExpiry: values.daysToExpiry,
      riskFreeRate: values.riskFreeRate,
    };
    const matrix = buildPnlMatrix(legs, market, {
      ...DEFAULT_MATRIX_OPTIONS,
      rangePct: values.rangePct,
    });
    const greeks = blackScholesGreeks({
      type: legs[0].type,
      spot: values.spotPrice,
      strike: values.strike,
      yearsToExpiry: daysToYears(values.daysToExpiry),
      vol: values.impliedVol,
      rate: values.riskFreeRate,
    });
    return {
      legs,
      summary,
      matrix,
      greeks,
      targetPnl: pnlAtExpiry(legs, values.targetPrice),
      priceMin: matrix.prices[matrix.prices.length - 1],
      priceMax: matrix.prices[0],
    };
  }, [values, definition]);

  if (!values || !derived) return null;

  const handleChange = (field: keyof RawCalculatorInputs, value: string) => {
    setRaw((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <InputPanel raw={raw} errors={parsed.errors} onChange={handleChange} />
        <div className="min-w-0 space-y-4">
          <StatCards
            summary={derived.summary}
            targetPnl={derived.targetPnl}
            targetPriceRaw={raw.targetPrice}
            targetPriceError={parsed.errors.targetPrice}
            onTargetPriceChange={(value) => handleChange('targetPrice', value)}
          />
          <GreeksStrip greeks={derived.greeks} />
          <PayoffChart
            legs={derived.legs}
            spotPrice={values.spotPrice}
            strike={values.strike}
            breakeven={derived.summary.breakevens[0]}
            priceMin={derived.priceMin}
            priceMax={derived.priceMax}
          />
        </div>
      </div>
      <PnlMatrixTable matrix={derived.matrix} spotPrice={values.spotPrice} />
    </div>
  );
}
