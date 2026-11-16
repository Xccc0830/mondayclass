import type { ActivityLevel, Sex } from "@/types/profile";

export const activityFactors: Readonly<Record<ActivityLevel, number>> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

export interface EnergyInput {
  heightCm: number | null | undefined;
  weightKg: number | null | undefined;
  age: number | null | undefined;
  sex: Sex | null | undefined;
  activityLevel: ActivityLevel | null | undefined;
}

export type EnergyField = keyof EnergyInput;

export interface EnergyCalculation {
  bmr: number;
  tdee: number;
}

export type EnergyCalculationResult =
  | { success: true; value: EnergyCalculation }
  | {
      success: false;
      missingFields: EnergyField[];
      invalidFields: EnergyField[];
    };

const isValidNumber = (
  value: number | null | undefined,
  minimum: number,
  maximum: number,
  integer = false,
): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= minimum &&
  value <= maximum &&
  (!integer || Number.isInteger(value));

function isActivityLevel(value: string): value is ActivityLevel {
  return Object.hasOwn(activityFactors, value);
}

function calculateUnroundedBmr(input: EnergyInput): number | null {
  if (
    !isValidNumber(input.heightCm, 50, 250) ||
    !isValidNumber(input.weightKg, 20, 300) ||
    !isValidNumber(input.age, 13, 120, true) ||
    (input.sex !== "male" && input.sex !== "female")
  ) {
    return null;
  }

  const sexAdjustment = input.sex === "male" ? 5 : -161;
  const rawBmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * input.age +
    sexAdjustment;

  return rawBmr;
}

export function calculateBmr(input: EnergyInput): number | null {
  const bmr = calculateUnroundedBmr(input);
  return bmr === null ? null : Math.round(bmr);
}

export function calculateTdee(input: EnergyInput): EnergyCalculationResult {
  const missingFields: EnergyField[] = [];
  const invalidFields: EnergyField[] = [];

  const numberFields = [
    ["heightCm", input.heightCm, 50, 250, false],
    ["weightKg", input.weightKg, 20, 300, false],
    ["age", input.age, 13, 120, true],
  ] as const;

  for (const [field, value, minimum, maximum, integer] of numberFields) {
    if (value === null || value === undefined) {
      missingFields.push(field);
    } else if (!isValidNumber(value, minimum, maximum, integer)) {
      invalidFields.push(field);
    }
  }

  if (input.sex === null || input.sex === undefined) {
    missingFields.push("sex");
  } else if (input.sex !== "male" && input.sex !== "female") {
    invalidFields.push("sex");
  }

  const activityLevel = input.activityLevel;
  if (activityLevel === null || activityLevel === undefined) {
    missingFields.push("activityLevel");
  } else if (!isActivityLevel(activityLevel)) {
    invalidFields.push("activityLevel");
  }

  if (missingFields.length > 0 || invalidFields.length > 0) {
    return { success: false, missingFields, invalidFields };
  }

  const rawBmr = calculateUnroundedBmr(input);
  if (rawBmr === null) {
    return {
      success: false,
      missingFields: [],
      invalidFields: ["heightCm", "weightKg", "age", "sex"],
    };
  }

  if (
    input.activityLevel === null ||
    input.activityLevel === undefined ||
    !isActivityLevel(input.activityLevel)
  ) {
    return {
      success: false,
      missingFields: [],
      invalidFields: ["activityLevel"],
    };
  }

  const activityFactor = activityFactors[input.activityLevel];
  return {
    success: true,
    value: {
      bmr: Math.round(rawBmr),
      tdee: Math.round(rawBmr * activityFactor),
    },
  };
}
