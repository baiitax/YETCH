// Service packages. Prices are monthly, provisional and exclude advertising spend.
// Values are in halalas (SAR minor units). The "from" price is a minimum for that package.

export const PACKAGES = {
  essential: { label: 'Essential', minMonthlyMinor: 150000n, priceNote: 'SAR 1,500 per month (provisional)' },
  growth: { label: 'Growth', minMonthlyMinor: 300000n, priceNote: 'SAR 3,000 per month (provisional)' },
  managed_growth_plus: {
    label: 'Managed Growth Plus',
    minMonthlyMinor: 500000n,
    priceNote: 'From SAR 5,000 per month (provisional)',
  },
  custom: { label: 'Custom scope', minMonthlyMinor: 0n, priceNote: 'Priced per agreed scope (provisional)' },
} as const;

export type PackageKey = keyof typeof PACKAGES;

export const ADVERTISING_SPEND_NOTE =
  'Advertising spend is excluded from all packages. Any advertising budget is paid by the client directly to the platform.';
