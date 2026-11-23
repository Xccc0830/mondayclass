interface DatabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
}

const profileSchemaNames = /\b(?:profiles|health_profiles)\b/i;

export function isProfileSchemaUnavailable(
  error: DatabaseErrorLike | null,
): boolean {
  if (!error) {
    return false;
  }

  if (error.code === "42P01" || error.code === "PGRST205") {
    return true;
  }

  return (
    error.code === "PGRST204" &&
    profileSchemaNames.test(`${error.message ?? ""} ${error.details ?? ""}`)
  );
}
