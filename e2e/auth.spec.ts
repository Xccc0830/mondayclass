import { expect, test } from "@playwright/test";

test("未設定 Supabase 時登入頁會顯示設定提示並停用帳號操作", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(
    page.getByText("尚未設定 Supabase，請依 .env.example 設定專案環境變數。"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "登入" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "註冊" })).toBeDisabled();
});

test("未設定 Supabase 時受保護頁可進入本機展示模式", async ({ page }) => {
  await page.goto("/profile");

  await expect(page.getByText("本機展示模式")).toBeVisible();
  await expect(page.getByLabel("身高（公分）")).toBeVisible();
});

test("登入與註冊錯誤訊息會在登入頁正確顯示", async ({ page }) => {
  await page.goto("/login?message=missing");
  await expect(page.getByText("請輸入電子郵件及密碼。")).toBeVisible();

  await page.goto("/login?message=sign-in-failed");
  await expect(
    page.getByText("登入失敗，請確認帳號與密碼後重試。"),
  ).toBeVisible();

  await page.goto("/login?message=invalid-sign-up");
  await expect(
    page.getByText("請輸入有效電子郵件及至少 8 個字元的密碼。"),
  ).toBeVisible();

  await page.goto("/login?message=check-email");
  await expect(
    page.getByText("註冊申請已送出，請依電子郵件指示完成驗證。"),
  ).toBeVisible();
});
