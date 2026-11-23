import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("首頁", () => {
  it("將根路徑導向健康檔案頁", () => {
    HomePage();

    expect(redirect).toHaveBeenCalledWith("/profile");
  });
});
