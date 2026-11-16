import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e-test/profile");
});

test("顯示健康資料單位與未設定的每日目標", async ({ page }) => {
  await expect(page.getByLabel("身高（公分）")).toBeVisible();
  await expect(page.getByLabel("體重（公斤）")).toBeVisible();
  await expect(page.getByLabel("體脂率（百分比）")).toBeVisible();
  await expect(page.getByLabel("年齡（歲）")).toBeVisible();
  await expect(page.getByText("未設定", { exact: true })).toHaveCount(4);
  await expect(page.getByText("不會以 TDEE 代替", { exact: false })).toBeVisible();
});

test("有效輸入會即時顯示四捨五入的 BMR 與 TDEE", async ({ page }) => {
  await page.getByLabel("身高（公分）").fill("175");
  await page.getByLabel("體重（公斤）").fill("70");
  await page.getByLabel("體脂率（百分比）").fill("22");
  await page.getByLabel("年齡（歲）").fill("30");
  await page.getByLabel("生理性別").selectOption("male");
  await page.getByLabel("活動量").selectOption("moderate");

  await expect(page.getByText("1649 kcal/日")).toBeVisible();
  await expect(page.getByText("2556 kcal/日")).toBeVisible();

  await page.getByLabel("體重（公斤）").fill("71");
  await expect(page.getByText("1659 kcal/日")).toBeVisible();
  await expect(page.getByText("2571 kcal/日")).toBeVisible();
  await expect(page.getByText("1649 kcal/日")).toHaveCount(0);
});

test("可複選飲食限制並補充其他說明", async ({ page }) => {
  await page.getByLabel("素食").check();
  const otherRestriction = page.getByRole("checkbox", {
    name: "其他",
    exact: true,
  });
  await otherRestriction.check();
  await page.getByLabel("其他飲食限制說明").fill("避免堅果");

  await expect(page.getByLabel("素食")).toBeChecked();
  await expect(otherRestriction).toBeChecked();
  await expect(page.getByLabel("其他飲食限制說明")).toHaveValue("避免堅果");
});

test("接受數值範圍端點並拒絕 0、負數、非數字及超上限", async ({
  page,
}) => {
  const height = page.getByLabel("身高（公分）");
  const weight = page.getByLabel("體重（公斤）");
  const bodyFat = page.getByLabel("體脂率（百分比）");
  const age = page.getByLabel("年齡（歲）");

  await height.fill("50");
  await height.blur();
  await expect(page.getByText("身高須介於 50 至 250 公分。")).toHaveCount(0);
  await height.fill("250");
  await height.blur();
  await expect(page.getByText("身高須介於 50 至 250 公分。")).toHaveCount(0);

  for (const [field, value] of [
    [weight, "20"],
    [weight, "300"],
    [bodyFat, "1"],
    [bodyFat, "75"],
    [age, "13"],
    [age, "120"],
  ] as const) {
    await field.fill(value);
    await field.blur();
    await expect(
      page.getByText(/體重須介於|體脂率須介於|年齡須為/),
    ).toHaveCount(0);
  }

  for (const value of ["0", "-1", "251", "abc"]) {
    await height.fill(value);
    await height.blur();
    await expect(
      page.getByText("身高須介於 50 至 250 公分。"),
    ).toBeVisible();
  }

  for (const [field, values, message] of [
    [weight, ["0", "-1", "301", "abc"], "體重須介於 20 至 300 公斤。"],
    [bodyFat, ["0", "-1", "76", "abc"], "體脂率須介於 1 至 75%。"],
    [age, ["0", "-1", "121", "abc", "30.5"], "年齡須為 13 至 120 歲的整數。"],
  ] as const) {
    for (const value of values) {
      await field.fill(value);
      await field.blur();
      await expect(page.getByText(message)).toBeVisible();
    }
  }
});

test("未填寫必填欄位時阻止儲存並列出待填資料", async ({ page }) => {
  await page.getByRole("button", { name: "儲存健康檔案" }).click();

  await expect(page.getByText("此欄位為必填。")).toHaveCount(7);
  await expect(
    page.getByText("尚待填寫：身高、體重、年齡、生理性別、活動量。"),
  ).toBeVisible();
  await expect(
    page.getByText("資料完整且有效後顯示估算結果。"),
  ).toBeVisible();
});

test("展示模式可暫存健康檔案並於同一分頁重新載入", async ({ page }) => {
  await page.getByLabel("身高（公分）").fill("170");
  await page.getByLabel("體重（公斤）").fill("65");
  await page.getByLabel("體脂率（百分比）").fill("22");
  await page.getByLabel("年齡（歲）").fill("30");
  await page.getByLabel("生理性別").selectOption("female");
  await page.getByLabel("活動量").selectOption("moderate");
  await page.getByLabel("健身目標").selectOption("maintenance");
  await page.getByRole("button", { name: "儲存健康檔案" }).click();

  await expect(
    page.getByText("健康檔案已暫存於本機瀏覽器分頁，尚未同步至 Supabase。"),
  ).toBeVisible();
  await page.reload();

  await expect(page.getByLabel("身高（公分）")).toHaveValue("170");
  await expect(page.getByLabel("體重（公斤）")).toHaveValue("65");
  await expect(page.getByLabel("健身目標")).toHaveValue("maintenance");
});

test("未設定 Supabase 時正式健康檔案頁自動進入展示模式", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page.getByText("本機展示模式")).toBeVisible();
  await expect(page.getByLabel("身高（公分）")).toBeVisible();
  await expect(page.getByRole("button", { name: "儲存健康檔案" })).toBeEnabled();
});
