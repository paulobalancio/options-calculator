/** Number formatting used by all display components. en-US, USD. */

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const moneyWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const signedWhole = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
});

const percent1 = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

/** "$1,234.56" — prices, premiums, costs. */
export function formatMoney(value: number): string {
  return money.format(value);
}

/** "$1,235" — larger dollar amounts where cents are noise. */
export function formatMoneyWhole(value: number): string {
  return moneyWhole.format(value);
}

/** "+$400.00" / "-$350.00" — signed P&L amounts. */
export function formatSignedMoney(value: number): string {
  return (value > 0 ? '+' : '') + money.format(value);
}

/** "+1,240" / "-350" / "0" — compact P&L for matrix cells (dollars implied). */
export function formatCellPnl(value: number): string {
  return signedWhole.format(value);
}

/** "92.9%" from a decimal fraction (0.929). */
export function formatPercent(fraction: number): string {
  return percent1.format(fraction);
}

/** "+92.9%" — signed return figures. */
export function formatSignedPercent(fraction: number): string {
  return (fraction > 0 ? '+' : '') + percent1.format(fraction);
}
