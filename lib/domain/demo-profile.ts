import { validateProfileForm } from "@/lib/domain/profile-validation";
import type { HealthProfile, ProfileFormValues } from "@/types/profile";

export const demoProfileStorageKey = "mondayclass:demo-health-profile:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProfileFormValues(value: unknown): value is ProfileFormValues {
  if (!isRecord(value) || !isStringArray(value.dietaryRestrictions)) {
    return false;
  }

  return [
    "heightCm",
    "weightKg",
    "bodyFatPercent",
    "age",
    "sex",
    "activityLevel",
    "fitnessGoal",
    "preferredExerciseType",
    "dietaryOther",
    "dailyCalorieTarget",
    "dailyCarbohydrateTarget",
    "dailyProteinTarget",
    "dailyFatTarget",
  ].every((key) => typeof value[key] === "string");
}

export type DemoProfileReadResult =
  | { success: true; profile: HealthProfile | null }
  | { success: false };

export function readDemoProfile(serialized: string | null): DemoProfileReadResult {
  if (serialized === null) {
    return { success: true, profile: null };
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isProfileFormValues(parsed)) {
      return { success: false };
    }

    const validation = validateProfileForm(parsed);
    return validation.success
      ? { success: true, profile: validation.value }
      : { success: false };
  } catch {
    return { success: false };
  }
}
