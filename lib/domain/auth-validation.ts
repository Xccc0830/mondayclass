export type AuthCredentialErrors = "missing" | "invalid-sign-up";

export function validateAuthCredentials(
  email: string,
  password: string,
): AuthCredentialErrors | null {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    return "missing";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "invalid-sign-up";
  }

  if (password.length < 8) {
    return "invalid-sign-up";
  }

  return null;
}
