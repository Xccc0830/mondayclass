export const activityLevels = [
  "sedentary",
  "light",
  "moderate",
  "high",
  "very_high",
] as const;

export type ActivityLevel = (typeof activityLevels)[number];

export const sexes = ["male", "female"] as const;
export type Sex = (typeof sexes)[number];

export const fitnessGoals = ["fat_loss", "muscle_gain", "maintenance"] as const;
export type FitnessGoal = (typeof fitnessGoals)[number];

export const dietaryRestrictionOptions = [
  "vegetarian",
  "vegan",
  "dairy_free",
  "gluten_free",
  "halal",
  "other",
] as const;

export type DietaryRestriction = (typeof dietaryRestrictionOptions)[number];

export const profileFields = [
  "heightCm",
  "weightKg",
  "bodyFatPercent",
  "age",
  "sex",
  "activityLevel",
  "fitnessGoal",
] as const;

export type ProfileField = (typeof profileFields)[number];

export interface HealthProfile {
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  preferredExerciseType: string | null;
  dietaryRestrictions: DietaryRestriction[];
  dietaryOther: string | null;
  dailyCalorieTarget: number | null;
  dailyCarbohydrateTarget: number | null;
  dailyProteinTarget: number | null;
  dailyFatTarget: number | null;
}

export type HealthProfileRecord = HealthProfile & {
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export interface ProfileFormValues {
  heightCm: string;
  weightKg: string;
  bodyFatPercent: string;
  age: string;
  sex: string;
  activityLevel: string;
  fitnessGoal: string;
  preferredExerciseType: string;
  dietaryRestrictions: string[];
  dietaryOther: string;
  dailyCalorieTarget: string;
  dailyCarbohydrateTarget: string;
  dailyProteinTarget: string;
  dailyFatTarget: string;
}
