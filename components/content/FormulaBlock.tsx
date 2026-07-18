/** A named formula rendered in the numeric face inside a sunken well. */
export function FormulaBlock({ label, formula }: { label: string; formula: string }) {
  return (
    <div className="rounded-md border border-line bg-sunken px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-ink-tertiary">{label}</div>
      <div className="numeric mt-1 text-sm">{formula}</div>
    </div>
  );
}
