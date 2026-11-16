import {
  activityLevels,
  dietaryRestrictionOptions,
  fitnessGoals,
  sexes,
  type DietaryRestriction,
  type HealthProfile,
  type ProfileField,
  type ProfileFormValues,
} from "@/types/profile";

export type ProfileErrors = Partial<
  Record<ProfileField | keyof Pick<
    ProfileFormValues,
    | "preferredExerciseType"
    | "dietaryRestrictions"
    | "dietaryOther"
    | "dailyCalorieTarget"
    | "dailyCarbohydrateTarget"
    | "dailyProteinTarget"
    | "dailyFatTarget"
  >, string>
>;

export type ProfileValidationResult =
  | { success: true; value: HealthProfile }
  | { success: false; errors: ProfileErrors };

const measurementRules = {
  heightCm: { minimum: 50, maximum: 250, message: "身高須介於 50 至 250 公分。" },
  weightKg: { minimum: 20, maximum: 300, message: "體重須介於 20 至 300 公斤。" },
  bodyFatPercent: {
    minimum: 1,
    maximum: 75,
    message: "體脂率須介於 1 至 75%。",
  },
  age: {
    minimum: 13,
    maximum: 120,
    message: "年齡須為 13 至 120 歲的整數。",
    integer: true,
  },
} as const;

type TargetField =
  | "dailyCalorieTarget"
  | "dailyCarbohydrateTarget"
  | "dailyProteinTarget"
  | "dailyFatTarget";

const targetMessages: Record<TargetField, string> = {
  dailyCalorieTarget: "每日熱量目標須為大於 0 的數字。",
  dailyCarbohydrateTarget: "碳水化合物目標須為大於 0 的數字。",
  dailyProteinTarget: "蛋白質目標須為大於 0 的數字。",
  dailyFatTarget: "脂肪目標須為大於 0 的數字。",
};

type RequiredNumericField =
  | "heightCm"
  | "weightKg"
  | "bodyFatPercent"
  | "age";

function parseRequiredNumber(
  field: RequiredNumericField,
  raw: string,
  errors: ProfileErrors,
): number | null {
  const value = raw.trim();
  if (value.length === 0) {
    errors[field] = "此欄位為必填。";
    return null;
  }

  const parsed = Number(value);
  const rule = measurementRules[field];
  if (
    !Number.isFinite(parsed) ||
    parsed < rule.minimum ||
    parsed > rule.maximum ||
    ("integer" in rule && rule.integer && !Number.isInteger(parsed))
  ) {
    errors[field] = rule.message;
    return null;
  }

  return parsed;
}

function parseTarget(raw: string, field: TargetField, errors: ProfileErrors) {
  const value = raw.trim();
  if (value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    errors[field] = targetMessages[field];
    return null;
  }

  return parsed;
}

function isOneOf<const Values extends readonly string[]>(
  value: string,
  options: Values,
): value is Values[number] {
  return options.includes(value);
}

export function validateProfileForm(
  values: ProfileFormValues,
): ProfileValidationResult {
  const errors: ProfileErrors = {};
  const numbers = {
    heightCm: parseRequiredNumber("heightCm", values.heightCm, errors),
    weightKg: parseRequiredNumber("weightKg", values.weightKg, errors),
    bodyFatPercent: parseRequiredNumber(
      "bodyFatPercent",
      values.bodyFatPercent,
      errors,
    ),
    age: parseRequiredNumber("age", values.age, errors),
  };

  if (values.sex.trim().length === 0) {
    errors.sex = "此欄位為必填。";
  } else if (!isOneOf(values.sex, sexes)) {
    errors.sex = "請選擇男性或女性。";
  }

  if (values.activityLevel.trim().length === 0) {
    errors.activityLevel = "此欄位為必填。";
  } else if (!isOneOf(values.activityLevel, activityLevels)) {
    errors.activityLevel = "請選擇活動量。";
  }

  if (values.fitnessGoal.trim().length === 0) {
    errors.fitnessGoal = "此欄位為必填。";
  } else if (!isOneOf(values.fitnessGoal, fitnessGoals)) {
    errors.fitnessGoal = "請選擇健身目標。";
  }

  const restrictions: DietaryRestriction[] = [];
  for (const restriction of values.dietaryRestrictions) {
    if (isOneOf(restriction, dietaryRestrictionOptions)) {
      restrictions.push(restriction);
    } else {
      errors.dietaryRestrictions = "請選擇有效的飲食限制。";
      break;
    }
  }

  const targets = {
    dailyCalorieTarget: parseTarget(
      values.dailyCalorieTarget,
      "dailyCalorieTarget",
      errors,
    ),
    dailyCarbohydrateTarget: parseTarget(
      values.dailyCarbohydrateTarget,
      "dailyCarbohydrateTarget",
      errors,
    ),
    dailyProteinTarget: parseTarget(
      values.dailyProteinTarget,
      "dailyProteinTarget",
      errors,
    ),
    dailyFatTarget: parseTarget(values.dailyFatTarget, "dailyFatTarget", errors),
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const sex = isOneOf(values.sex, sexes) ? values.sex : null;
  const activityLevel = isOneOf(values.activityLevel, activityLevels)
    ? values.activityLevel
    : null;
  const fitnessGoal = isOneOf(values.fitnessGoal, fitnessGoals)
    ? values.fitnessGoal
    : null;
  const incompleteErrors: ProfileErrors = {};
  if (numbers.heightCm === null) {
    incompleteErrors.heightCm = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (numbers.weightKg === null) {
    incompleteErrors.weightKg = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (numbers.bodyFatPercent === null) {
    incompleteErrors.bodyFatPercent = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (numbers.age === null) {
    incompleteErrors.age = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (sex === null) {
    incompleteErrors.sex = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (activityLevel === null) {
    incompleteErrors.activityLevel = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }
  if (fitnessGoal === null) {
    incompleteErrors.fitnessGoal = "此欄位為必填。";
    return { success: false, errors: incompleteErrors };
  }

  const profile: HealthProfile = {
    heightCm: numbers.heightCm,
    weightKg: numbers.weightKg,
    bodyFatPercent: numbers.bodyFatPercent,
    age: numbers.age,
    sex,
    activityLevel,
    fitnessGoal,
    preferredExerciseType: values.preferredExerciseType.trim() || null,
    dietaryRestrictions: restrictions,
    dietaryOther: values.dietaryOther.trim() || null,
    ...targets,
  };
  return { success: true, value: profile };
}
