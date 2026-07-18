'use client';

import { NumberField } from '@/components/fields/NumberField';
import type { FieldErrors, RawCalculatorInputs } from '@/lib/calculator-inputs';

interface InputPanelProps {
  raw: RawCalculatorInputs;
  errors: FieldErrors;
  onChange: (field: keyof RawCalculatorInputs, value: string) => void;
}

/**
 * The trade-entry form. Core fields always visible; risk-free rate and the
 * matrix price range live behind an "Advanced" disclosure since their
 * defaults are right for almost everyone.
 */
export function InputPanel({ raw, errors, onChange }: InputPanelProps) {
  const field = (key: keyof RawCalculatorInputs) => ({
    id: key,
    value: raw[key],
    error: errors[key],
    onChange: (value: string) => onChange(key, value),
  });

  return (
    <form
      aria-label="Trade inputs"
      onSubmit={(event) => event.preventDefault()}
      className="rounded-lg border border-line bg-surface p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Stock price" unit="$" {...field('spotPrice')} />
        <NumberField label="Strike" unit="$" {...field('strike')} />
        <NumberField label="Premium" hint="per share" unit="$" {...field('premium')} />
        <NumberField label="Contracts" unit="#" {...field('contracts')} />
        <NumberField label="Days to expiry" unit="days" {...field('daysToExpiry')} />
        <NumberField label="Implied volatility" unit="%" {...field('impliedVol')} />
      </div>

      <details className="group mt-4 border-t border-line pt-3">
        <summary className="cursor-pointer list-none text-sm font-medium text-ink-secondary transition-colors duration-fast hover:text-ink">
          <span aria-hidden="true" className="mr-1.5 inline-block transition-transform duration-fast group-open:rotate-90">
            ›
          </span>
          Advanced
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumberField label="Risk-free rate" unit="%" {...field('riskFreeRate')} />
          <NumberField label="Price range" hint="±" unit="%" {...field('rangePct')} />
        </div>
      </details>
    </form>
  );
}
