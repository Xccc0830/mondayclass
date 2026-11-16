import { describe, expect, it } from "vitest";
import {
  demoProfileStorageKey,
  readDemoProfile,
} from "@/lib/domain/demo-profile";
import type { ProfileFormValues } from "@/types/profile";

const validProfile: ProfileFormValues = {
  heightCm: "170",
  weightKg: "65",
  bodyFatPercent: "22",
  age: "30",
  sex: "female",
  activityLevel: "moderate",
  fitnessGoal: "maintenance",
  preferredExerciseType: "",
  dietaryRestrictions: ["vegetarian"],
  dietaryOther: "",
  dailyCalorieTarget: "2000",
  dailyCarbohydrateTarget: "",
  dailyProteinTarget: "130",
  dailyFatTarget: "",
};

describe("readDemoProfile", () => {
  it("沒有暫存資料時回傳空檔案", () => {
    expect(readDemoProfile(null)).toEqual({ success: true, profile: null });
  });

  it("只還原符合健康檔案驗證規則的暫存資料", () => {
    const result = readDemoProfile(JSON.stringify(validProfile));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.profile?.heightCm).toBe(170);
      expect(result.profile?.dailyCalorieTarget).toBe(2000);
      expect(result.profile?.dailyProteinTarget).toBe(130);
    }
  });

  it.each([
    ["無效 JSON", "{"],
    ["非物件", "null"],
    ["欄位型別錯誤", JSON.stringify({ ...validProfile, age: 30 })],
    ["欄位驗證失敗", JSON.stringify({ ...validProfile, heightCm: "0" })],
  ])("拒絕不可信的暫存內容：%s", (_label, value) => {
    expect(readDemoProfile(value)).toEqual({ success: false });
  });

  it("使用有版本的專屬分頁暫存索引", () => {
    expect(demoProfileStorageKey).toBe("mondayclass:demo-health-profile:v1");
  });
});
