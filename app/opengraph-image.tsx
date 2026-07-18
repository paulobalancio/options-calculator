import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME} — free options profit calculator`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Site-wide Open Graph card, generated at build time. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#faf9f6',
          color: '#191a1e',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#191a1e" />
            <path
              d="M6 21h9l11-11"
              fill="none"
              stroke="#faf9f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1.5 }}>
            Options profit calculator
          </div>
          <div style={{ fontSize: 30, color: '#50525a' }}>
            Live P&L matrix · payoff chart · breakeven · Greeks
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, height: 14 }}>
          <div style={{ flex: 3, backgroundColor: '#c03434', borderRadius: 4 }} />
          <div style={{ flex: 2, backgroundColor: '#e3e1db', borderRadius: 4 }} />
          <div style={{ flex: 5, backgroundColor: '#0e7a46', borderRadius: 4 }} />
        </div>
      </div>
    ),
    size,
  );
}
