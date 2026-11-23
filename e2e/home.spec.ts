import { expect, test } from "@playwright/test";

test("根路徑可成功載入並導向健康檔案頁", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "健康檔案與目標設定" }),
  ).toBeVisible();
});

test("根路徑導向的頁面顯示健康檔案表單", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("MondayClass 健康檔案");
  await expect(page.getByLabel("身高（公分）")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "儲存健康檔案" }),
  ).toBeEnabled();
});
