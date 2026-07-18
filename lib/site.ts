/** Site-wide constants used by metadata, JSON-LD, and the sitemap. */

export const SITE_NAME = 'OptionCalc';

/**
 * Canonical origin for absolute URLs (sitemap, Open Graph, canonicals).
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment to override.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://options-calculator.vercel.app';
