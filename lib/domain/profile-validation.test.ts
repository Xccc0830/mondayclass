import { describe, expect, it } from "vitest";
import {
  validateProfileForm,
  type ProfileErrors,
} from "@/lib/domain/profile-validation";
import type { ProfileFormValues } from "@/types/profile";

const validForm: ProfileFormValues = {
  heightCm: "170",
  weightKg: "65",
  bodyFatPercent: "22",
  age: "30",
  sex: "female",
  activityLevel: "moderate",
  fitnessGoal: "fat_loss",
  preferredExerciseType: "",
  dietaryRestrictions: [],
  dietaryOther: "",
  dailyCalorieTarget: "",
  dailyCarbohydrateTarget: "",
  dailyProteinTarget: "",
  dailyFatTarget: "",
};

describe("validateProfileForm", () => {
  it("接受有效必填資料，並保留可留空的偏好與目標", () => {
    const result = validateProfileForm(validForm);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.dailyCalorieTarget).toBeNull();
      expect(result.value.dailyCarbohydrateTarget).toBeNull();
      expect(result.value.preferredExerciseType).toBeNull();
      expect(result.value.dietaryRestrictions).toEqual([]);
    }
  });

  it("接受數值端點與小數身高、體重及體脂率", () => {
    const result = validateProfileForm({
      ...validForm,
      heightCm: "50.5",
      weightKg: "20.25",
      bodyFatPercent: "1.5",
      age: "13",
    });
    expect(result.success).toBe(true);

    expect(
      validateProfileForm({
        ...validForm,
        heightCm: "250",
        weightKg: "300",
        bodyFatPercent: "75",
        age: "120",
      }).success,
    ).toBe(true);
  });

  it.each([
    ["身高", "heightCm", "0", "身高須介於 50 至 250 公分。"],
    ["身高負數", "heightCm", "-1", "身高須介於 50 至 250 公分。"],
    ["身高非數字", "heightCm", "abc", "身高須介於 50 至 250 公分。"],
    ["身高超出上限", "heightCm", "251", "身高須介於 50 至 250 公分。"],
    ["體重", "weightKg", "0", "體重須介於 20 至 300 公斤。"],
    ["體重負數", "weightKg", "-1", "體重須介於 20 至 300 公斤。"],
    ["體重非數字", "weightKg", "abc", "體重須介於 20 至 300 公斤。"],
    ["體重超出上限", "weightKg", "301", "體重須介於 20 至 300 公斤。"],
    ["體脂率", "bodyFatPercent", "0", "體脂率須介於 1 至 75%。"],
    ["體脂率負數", "bodyFatPercent", "-1", "體脂率須介於 1 至 75%。"],
    ["體脂率非數字", "bodyFatPercent", "abc", "體脂率須介於 1 至 75%。"],
    ["體脂率超出上限", "bodyFatPercent", "76", "體脂率須介於 1 至 75%。"],
    ["年齡", "age", "0", "年齡須為 13 至 120 歲的整數。"],
    ["年齡負數", "age", "-1", "年齡須為 13 至 120 歲的整數。"],
    ["年齡非數字", "age", "abc", "年齡須為 13 至 120 歲的整數。"],
    ["年齡超出上限", "age", "121", "年齡須為 13 至 120 歲的整數。"],
    ["年齡非整數", "age", "30.5", "年齡須為 13 至 120 歲的整數。"],
  ] as const)(
    "拒絕無效的 %s 值並回傳指定欄位提示",
    (_label, field, value, message) => {
      const result = validateProfileForm({ ...validForm, [field]: value });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[field]).toBe(message);
      }
    },
  );

  it("每個必填欄位缺漏時均回報必填錯誤", () => {
    const emptyForm: ProfileFormValues = {
      ...validForm,
      heightCm: "",
      weightKg: "",
      bodyFatPercent: "",
      age: "",
      sex: "",
      activityLevel: "",
      fitnessGoal: "",
    };
    const result = validateProfileForm(emptyForm);
    expect(result.success).toBe(false);
    if (!result.success) {
      const required: (keyof ProfileErrors)[] = [
        "heightCm",
        "weightKg",
        "bodyFatPercent",
        "age",
        "sex",
        "activityLevel",
        "fitnessGoal",
      ];
      for (const field of required) {
        expect(result.errors[field]).toBe("此欄位為必填。");
      }
    }
  });

  it("可複選飲食限制及填寫其他說明", () => {
    const result = validateProfileForm({
      ...validForm,
      dietaryRestrictions: ["vegetarian", "other"],
      dietaryOther: "避免堅果",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.dietaryRestrictions).toEqual(["vegetarian", "other"]);
      expect(result.value.dietaryOther).toBe("避免堅果");
    }
  });

  it("可設定個人每日熱量與三大營養素目標", () => {
    const result = validateProfileForm({
      ...validForm,
      dailyCalorieTarget: "2000",
      dailyCarbohydrateTarget: "250",
      dailyProteinTarget: "150",
      dailyFatTarget: "65",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.dailyCalorieTarget).toBe(2000);
      expect(result.value.dailyCarbohydrateTarget).toBe(250);
      expect(result.value.dailyProteinTarget).toBe(150);
      expect(result.value.dailyFatTarget).toBe(65);
    }
  });

  it("未設定每日目標維持未設定，不以 TDEE 回填", () => {
    const result = validateProfileForm(validForm);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.dailyCalorieTarget).toBeNull();
      expect(result.value.dailyCarbohydrateTarget).toBeNull();
      expect(result.value.dailyProteinTarget).toBeNull();
      expect(result.value.dailyFatTarget).toBeNull();
    }
  });
});
