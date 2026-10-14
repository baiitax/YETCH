// Normalisation for matching and duplicate checks. Display values are kept as entered; normalised
// values are used only for lookups.

const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim().toLowerCase();
  if (value === '') return null;
  return EMAIL_PATTERN.test(value) && value.length <= 254 ? value : null;
}

/**
 * Normalises a phone number to E.164. Saudi local numbers ("05xxxxxxxx") are read as +966.
 * Returns null when the number cannot be read as a valid international number.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let value = input.replace(/[\s\-().]/g, '');
  if (value === '') return null;
  if (value.startsWith('00')) value = '+' + value.slice(2);
  else if (/^05\d{8}$/.test(value)) value = '+966' + value.slice(1);
  else if (/^9665\d{8}$/.test(value)) value = '+' + value;
  if (!/^\+[1-9]\d{7,14}$/.test(value)) return null;
  return value;
}

export function isValidEmail(input: string): boolean {
  return normalizeEmail(input) !== null;
}
