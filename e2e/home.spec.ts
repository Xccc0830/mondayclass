import { expect, test } from "@playwright/test";

test("首頁可正常載入並顯示平台歡迎內容", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "歡迎使用 mondayclass" }),
  ).toBeVisible();
  await expect(
    page.getByText("測試環境已就緒，開始打造你的健身教練平台。"),
  ).toBeVisible();
});
