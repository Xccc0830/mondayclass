import { describe, expect, it } from "vitest";
import { validateAuthCredentials } from "@/lib/domain/auth-validation";

describe("validateAuthCredentials", () => {
  it("電子郵件或密碼缺漏時回傳 missing", () => {
    expect(validateAuthCredentials("", "password123")).toBe("missing");
    expect(validateAuthCredentials("student@example.com", "")).toBe("missing");
  });

  it("拒絕無效電子郵件及不足八個字元的密碼", () => {
    expect(validateAuthCredentials("not-an-email", "password123")).toBe(
      "invalid-sign-up",
    );
    expect(validateAuthCredentials("student@example.com", "1234567")).toBe(
      "invalid-sign-up",
    );
  });

  it("接受有效電子郵件及至少八個字元的密碼", () => {
    expect(
      validateAuthCredentials("  student@example.com  ", "password123"),
    ).toBeNull();
  });
});
