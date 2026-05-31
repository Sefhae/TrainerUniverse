// Single source of truth for the account-creation password policy. Shared by
// the registration form (live checklist + submit guard) and the API routes
// (server-side enforcement, so the rules can't be bypassed by calling the API
// directly).

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
    test: (pw) => pw.length >= PASSWORD_MIN && pw.length <= PASSWORD_MAX,
  },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { id: 'symbol', label: 'One symbol', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

// Returns a human-readable error message, or null if the password is valid.
export function validatePassword(pw: string): string | null {
  if (!pw) return 'Password is required.';
  if (pw.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
  if (pw.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters.`;
  if (PASSWORD_RULES.every((r) => r.test(pw))) return null;
  return 'Password must include an uppercase letter, a lowercase letter, a number, and a symbol.';
}
