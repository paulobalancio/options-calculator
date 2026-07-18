/**
 * Shown on every calculator page. Results are theoretical Black-Scholes
 * estimates, and the distinction matters legally and practically.
 */
export function Disclaimer() {
  return (
    <aside
      role="note"
      className="rounded-md border border-line bg-sunken px-4 py-3 text-sm text-ink-secondary"
    >
      <strong className="font-semibold text-ink">Educational estimates only — not investment advice.</strong>{' '}
      Values are theoretical Black-Scholes estimates that assume constant implied
      volatility and interest rates. Real option prices, fills, fees, and early
      assignment can differ materially.
    </aside>
  );
}
