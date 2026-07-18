import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

const NAV_LINKS = [
  { href: '/calculator/long-call', label: 'Long Call' },
  { href: '/calculator/long-put', label: 'Long Put' },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5"
            aria-hidden="true"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 13h6l8-8" />
          </svg>
          {SITE_NAME}
        </Link>
        <nav aria-label="Calculators">
          <ul className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-secondary transition-colors duration-fast hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
