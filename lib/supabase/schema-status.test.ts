import { describe, expect, it } from "vitest";
import { isProfileSchemaUnavailable } from "@/lib/supabase/schema-status";

describe("isProfileSchemaUnavailable", () => {
  it.each(["42P01", "PGRST205"])(
    "將資料表不存在錯誤 %s 視為可使用本機展示模式",
    (code) => {
      expect(isProfileSchemaUnavailable({ code })).toBe(true);
    },
  );

  it("只將指定資料表的 PGRST204 欄位錯誤視為結構尚未就緒", () => {
    expect(
      isProfileSchemaUnavailable({
        code: "PGRST204",
        message: "Could not find the height_cm column in health_profiles",
      }),
    ).toBe(true);
    expect(
      isProfileSchemaUnavailable({
        code: "PGRST204",
        message: "Could not find the unrelated column",
      }),
    ).toBe(false);
  });

  it("不把權限、網路或其他資料庫錯誤誤判為展示模式", () => {
    expect(isProfileSchemaUnavailable({ code: "42501" })).toBe(false);
    expect(isProfileSchemaUnavailable({ code: "PGRST000" })).toBe(false);
    expect(isProfileSchemaUnavailable(null)).toBe(false);
  });
});
