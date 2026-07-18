import { SITE_NAME } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-8 text-xs text-ink-tertiary">
        <p>
          {SITE_NAME} provides educational estimates only, not investment advice. Options
          involve substantial risk and are not suitable for every investor.
        </p>
        <p>
          © {new Date().getFullYear()} {SITE_NAME} ·{' '}
          <a
            href="https://github.com/paulobalancio/options-calculator"
            className="underline underline-offset-2 transition-colors duration-fast hover:text-ink-secondary"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
