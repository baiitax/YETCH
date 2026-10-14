// Input safety helpers used by sign-in, password reset and redirects.

/** Accepts only same-site relative paths. Blocks protocol-relative URLs, backslashes and control characters. */
export function safeNextPath(value: unknown, fallback = '/dashboard'): string {
  if (typeof value !== 'string') return fallback;
  if (value.length === 0 || value.length > 300) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) return fallback;
  if (value.startsWith('/login') || value.startsWith('/auth/')) return fallback;
  return value;
}

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

/** Minimum policy for new passwords. No default or shared passwords are ever created by the system. */
export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return 'too_short';
  if (password.length > PASSWORD_MAX_LENGTH) return 'too_long';
  if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase()) && email.split('@')[0].length >= 4) {
    return 'contains_identifier';
  }
  if (/^(.)\1+$/.test(password)) return 'repetitive';
  return null;
}
