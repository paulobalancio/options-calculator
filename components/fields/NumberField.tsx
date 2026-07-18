'use client';

export interface NumberFieldProps {
  id: string;
  label: string;
  /** Unit affix: "$" renders as a prefix, anything else as a suffix. */
  unit: '$' | '%' | '#' | 'days';
  value: string;
  onChange: (raw: string) => void;
  error?: string;
  /** Secondary label text, e.g. "per share". */
  hint?: string;
}

/**
 * Labeled numeric text input with a unit affix and designed error state.
 * Uses a text input with decimal keypad rather than type="number" so users
 * can type freely ("$1,250") and validation stays in our hands.
 */
export function NumberField({ id, label, unit, value, onChange, error, hint }: NumberFieldProps) {
  const errorId = `${id}-error`;
  const isPrefix = unit === '$';
  const affix = (
    <span className="select-none text-sm text-ink-tertiary" aria-hidden="true">
      {unit}
    </span>
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-ink-tertiary">{hint}</span>}
      </label>
      <div
        className={`flex items-center gap-1.5 rounded-sm border bg-surface px-3 transition-colors duration-fast focus-within:border-accent ${
          error ? 'border-danger bg-danger-wash' : 'border-line-strong'
        }`}
      >
        {isPrefix && affix}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="numeric w-full min-w-0 bg-transparent py-2 text-base outline-none"
        />
        {!isPrefix && affix}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
