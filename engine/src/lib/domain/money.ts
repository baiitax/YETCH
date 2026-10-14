// Money is always an exact integer count of minor units (halalas for SAR). No floating point is used
// for stored or computed amounts. Floats appear only in percentage display, never in money.

const EXPONENT: Record<string, number> = { SAR: 2, USD: 2, EUR: 2 };

export function currencyExponent(currency: string): number {
  const exp = EXPONENT[currency];
  if (exp === undefined) throw new Error(`Unsupported currency: ${currency}`);
  return exp;
}

/** Parses an amount typed by a person ("1500", "1,500.5", "1500.00") into minor units. Returns null if invalid. */
export function parseMoneyToMinor(input: string, currency = 'SAR'): bigint | null {
  const exp = currencyExponent(currency);
  const text = input.trim().replace(/,/g, '');
  // Whole units are capped at 13 digits so that minor units stay below 2^53 and are exact in JavaScript numbers.
  const pattern = exp === 0 ? /^\d{1,13}$/ : new RegExp(`^\\d{1,13}(\\.\\d{1,${exp}})?$`);
  if (!pattern.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const paddedFraction = (fraction + '0'.repeat(exp)).slice(0, exp);
  const scale = BigInt(10) ** BigInt(exp);
  return BigInt(whole) * scale + BigInt(paddedFraction === '' ? '0' : paddedFraction);
}

/** Formats minor units for display, for example 150000n -> "SAR 1,500.00". */
export function formatMinor(minor: bigint, currency = 'SAR'): string {
  const exp = currencyExponent(currency);
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const scale = BigInt(10) ** BigInt(exp);
  const whole = (abs / scale).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = exp === 0 ? '' : '.' + (abs % scale).toString().padStart(exp, '0');
  return `${negative ? '-' : ''}${currency} ${whole}${fraction}`;
}

/** Converts minor units to the decimal string used by form inputs, for example 150000n -> "1500.00". */
export function minorToInput(minor: bigint | null | undefined, currency = 'SAR'): string {
  if (minor === null || minor === undefined) return '';
  const exp = currencyExponent(currency);
  const scale = BigInt(10) ** BigInt(exp);
  const whole = (minor / scale).toString();
  return exp === 0 ? whole : `${whole}.${(minor % scale).toString().padStart(exp, '0')}`;
}

/** Sums minor-unit amounts. Mixed currencies are never added together; the result is grouped by currency. */
export function sumByCurrency(items: ReadonlyArray<{ amountMinor: bigint; currency: string }>): Record<string, bigint> {
  const totals: Record<string, bigint> = {};
  for (const item of items) {
    totals[item.currency] = (totals[item.currency] ?? 0n) + item.amountMinor;
  }
  return totals;
}
