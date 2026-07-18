'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { formatMoney } from '@/lib/format';
import { pnlAtExpiry } from '@/lib/options/position';
import type { OptionLeg } from '@/lib/options/types';

interface PayoffChartProps {
  legs: readonly OptionLeg[];
  spotPrice: number;
  strike: number;
  breakeven: number;
  priceMin: number;
  priceMax: number;
}

const PAD = { left: 56, right: 12, top: 30, bottom: 28 };
const SAMPLES = 96;

/** Round-numbered axis ticks covering [min, max], d3-style. */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const rawStep = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude;
  const ticks: number[] = [];
  for (let tick = Math.ceil(min / step) * step; tick <= max + step / 1e6; tick += step) {
    ticks.push(tick);
  }
  return ticks;
}

/**
 * Compact axis label ("$500", "-$1.5K"). Hand-rolled rather than
 * Intl compact notation, whose output differs between Node (build-time
 * render) and browsers — a guaranteed hydration mismatch.
 */
function axisMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const thousands = abs / 1000;
    return `${sign}$${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
  }
  return `${sign}$${Number(abs.toFixed(2))}`;
}

/**
 * P&L at expiration vs. stock price, as hand-rolled SVG (no chart library).
 * The kink at the strike is sampled exactly; profit and loss regions are
 * colored by clipping the same path above and below the zero line. Sized to
 * its container with a ResizeObserver; the container's CSS height reserves
 * space so the chart causes no layout shift.
 */
export function PayoffChart({
  legs,
  spotPrice,
  strike,
  breakeven,
  priceMin,
  priceMax,
}: PayoffChartProps) {
  const clipId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 240 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = height - PAD.top - PAD.bottom;

  // Sample the payoff, inserting the exact kink and breakeven prices so the
  // hockey-stick bend stays sharp at any sample density.
  const prices = new Set<number>([strike, breakeven]);
  for (let i = 0; i <= SAMPLES; i++) {
    prices.add(priceMin + ((priceMax - priceMin) * i) / SAMPLES);
  }
  const samples = [...prices]
    .filter((price) => price >= priceMin && price <= priceMax)
    .sort((a, b) => a - b)
    .map((price) => ({ price, pnl: pnlAtExpiry(legs, price) }));

  const pnls = samples.map((sample) => sample.pnl);
  let yMin = Math.min(...pnls, 0);
  let yMax = Math.max(...pnls, 0);
  const yPad = (yMax - yMin || 1) * 0.08;
  yMin -= yPad;
  yMax += yPad;

  const x = (price: number) =>
    PAD.left + ((price - priceMin) / (priceMax - priceMin)) * plotWidth;
  const y = (pnl: number) => PAD.top + ((yMax - pnl) / (yMax - yMin)) * plotHeight;
  const zeroY = y(0);

  const linePath = samples
    .map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.price).toFixed(2)} ${y(s.pnl).toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L${x(priceMax).toFixed(2)} ${zeroY.toFixed(2)} L${x(
    priceMin,
  ).toFixed(2)} ${zeroY.toFixed(2)} Z`;

  const markers = [
    { price: spotPrice, label: `Current ${formatMoney(spotPrice)}`, color: 'var(--color-accent)', dash: '' },
    { price: strike, label: `Strike ${formatMoney(strike)}`, color: 'var(--color-ink-tertiary)', dash: '4 3' },
    { price: breakeven, label: `B/E ${formatMoney(breakeven)}`, color: 'var(--color-ink)', dash: '4 3' },
  ].filter((marker) => marker.price >= priceMin && marker.price <= priceMax);

  // Nudge marker labels onto a second row when two lines sit close together.
  let previousLabelX = -Infinity;
  let previousRow = 0;
  const labeled = markers.map((marker) => {
    const markerX = x(marker.price);
    const row = markerX - previousLabelX < 90 && previousRow === 0 ? 1 : 0;
    previousLabelX = markerX;
    previousRow = row;
    return { ...marker, x: markerX, labelY: 10 + row * 11 };
  });

  const xTicks = niceTicks(priceMin, priceMax, Math.max(3, Math.floor(plotWidth / 90)));
  const yTicks = niceTicks(yMin, yMax, 5);

  return (
    <section aria-label="Payoff at expiration">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Payoff at expiration</h2>
        <p className="text-xs text-ink-tertiary">P&L if held to expiry, by stock price</p>
      </div>
      <div
        ref={containerRef}
        className="h-60 overflow-hidden rounded-lg border border-line bg-surface sm:h-72"
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Payoff chart: breakeven at ${formatMoney(breakeven)}, strike at ${formatMoney(strike)}, current price ${formatMoney(spotPrice)}.`}
          className="block h-full w-full"
        >
          <defs>
            <clipPath id={`${clipId}-profit`}>
              <rect x="0" y="0" width={width} height={zeroY} />
            </clipPath>
            <clipPath id={`${clipId}-loss`}>
              <rect x="0" y={zeroY} width={width} height={height - zeroY} />
            </clipPath>
          </defs>

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? 'var(--color-line-strong)' : 'var(--color-line)'}
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 3}
                textAnchor="end"
                className="numeric"
                fontSize="11"
                fill="var(--color-ink-tertiary)"
              >
                {axisMoney(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <text
              key={`x-${tick}`}
              x={x(tick)}
              y={height - 8}
              textAnchor="middle"
              className="numeric"
              fontSize="11"
              fill="var(--color-ink-tertiary)"
            >
              {axisMoney(tick)}
            </text>
          ))}

          <path
            d={areaPath}
            fill="var(--color-profit)"
            opacity="0.1"
            clipPath={`url(#${clipId}-profit)`}
          />
          <path
            d={areaPath}
            fill="var(--color-loss)"
            opacity="0.1"
            clipPath={`url(#${clipId}-loss)`}
          />
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-profit)"
            strokeWidth="1.75"
            clipPath={`url(#${clipId}-profit)`}
          />
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-loss)"
            strokeWidth="1.75"
            clipPath={`url(#${clipId}-loss)`}
          />

          {labeled.map((marker) => (
            <g key={marker.label}>
              <line
                x1={marker.x}
                x2={marker.x}
                y1={PAD.top - 4}
                y2={height - PAD.bottom}
                stroke={marker.color}
                strokeDasharray={marker.dash}
                strokeWidth="1"
              />
              <text
                x={Math.min(Math.max(marker.x, PAD.left + 40), width - PAD.right - 44)}
                y={marker.labelY}
                textAnchor="middle"
                fontSize="10"
                fill={marker.color}
              >
                {marker.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
