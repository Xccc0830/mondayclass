import { describe, expect, it } from "vitest";
import {
  activityFactors,
  calculateBmr,
  calculateTdee,
  type EnergyInput,
} from "@/lib/domain/energy";

const validInput: EnergyInput = {
  heightCm: 175,
  weightKg: 70,
  age: 30,
  sex: "male",
  activityLevel: "moderate",
};

describe("calculateBmr", () => {
  it("依男性 Mifflin-St Jeor 公式計算並四捨五入", () => {
    expect(calculateBmr(validInput)).toBe(1649);
  });

  it("依女性 Mifflin-St Jeor 公式計算並四捨五入", () => {
    expect(calculateBmr({ ...validInput, sex: "female" })).toBe(1483);
  });

  it("接受身高、體重與年齡的有效端點", () => {
    expect(
      calculateBmr({
        ...validInput,
        heightCm: 50,
        weightKg: 20,
        age: 13,
      }),
    ).not.toBeNull();
    expect(
      calculateBmr({
        ...validInput,
        heightCm: 250,
        weightKg: 300,
        age: 120,
      }),
    ).not.toBeNull();
  });

  it.each([
    ["身高為 0", { heightCm: 0 }],
    ["身高為負數", { heightCm: -1 }],
    ["身高超過上限", { heightCm: 250.01 }],
    ["體重為 0", { weightKg: 0 }],
    ["體重為負數", { weightKg: -1 }],
    ["體重超過上限", { weightKg: 300.01 }],
    ["年齡為 0", { age: 0 }],
    ["年齡為負數", { age: -1 }],
    ["年齡超過上限", { age: 121 }],
    ["年齡不是整數", { age: 30.5 }],
  ])("必要數值無效時不計算 BMR（%s）", (_label, invalidValues) => {
    expect(calculateBmr({ ...validInput, ...invalidValues })).toBeNull();
  });

  it.each([
    ["身高", { heightCm: null }],
    ["體重", { weightKg: null }],
    ["年齡", { age: null }],
    ["生理性別", { sex: null }],
  ])("必要欄位「%s」缺漏時不計算 BMR", (_label, missingValue) => {
    expect(calculateBmr({ ...validInput, ...missingValue })).toBeNull();
  });
});

describe("calculateTdee", () => {
  it("依所有活動係數計算 TDEE 並四捨五入", () => {
    for (const [activityLevel, factor] of Object.entries(activityFactors)) {
      expect(
        calculateTdee({
          ...validInput,
          activityLevel: activityLevel as EnergyInput["activityLevel"],
        }),
      ).toEqual({
        success: true,
        value: { bmr: 1649, tdee: Math.round(1648.75 * factor) },
      });
    }
  });

  it("接受所有生理資料的有效端點", () => {
    expect(
      calculateTdee({
        ...validInput,
        heightCm: 50,
        weightKg: 20,
        age: 13,
        activityLevel: "sedentary",
      }).success,
    ).toBe(true);
    expect(
      calculateTdee({
        ...validInput,
        heightCm: 250,
        weightKg: 300,
        age: 120,
        activityLevel: "very_high",
      }).success,
    ).toBe(true);
  });

  it.each([
    ["身高", "heightCm"],
    ["體重", "weightKg"],
    ["年齡", "age"],
    ["生理性別", "sex"],
    ["活動量", "activityLevel"],
  ] as const)("必要欄位「%s」缺漏時不回傳估算值", (_label, field) => {
    const result = calculateTdee({ ...validInput, [field]: null });
    expect(result).toEqual({
      success: false,
      missingFields: [field],
      invalidFields: [],
    });
  });

  it("必要數值無效時同時列出全部無效欄位", () => {
    expect(
      calculateTdee({
        ...validInput,
        heightCm: 0,
        weightKg: -1,
        age: 120.5,
      }),
    ).toEqual({
      success: false,
      missingFields: [],
      invalidFields: ["heightCm", "weightKg", "age"],
    });
  });

  it("活動量無效時不計算 TDEE", () => {
    expect(
      calculateTdee({
        ...validInput,
        activityLevel: "unknown" as EnergyInput["activityLevel"],
      }).success,
    ).toBe(false);
  });
});
