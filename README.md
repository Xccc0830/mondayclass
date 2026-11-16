# MondayClass

健身教練平台，使用 Next.js App Router、TypeScript Strict、Tailwind CSS 與 Supabase SSR。

## 本機啟動

1. 安裝 Node.js 22 及套件：

   ```sh
   npm install
   ```

2. 複製 `.env.example` 為 `.env.local`，填入 Supabase 專案網址、ANON Key 及本機網站網址。請勿在前端或版本控制中使用 Service Role Key。
3. 在 Supabase SQL Editor 執行 [`supabase/migrations/202611160001_create_health_profiles.sql`](./supabase/migrations/202611160001_create_health_profiles.sql)，建立帳號角色、健康檔案資料表、註冊時建立預設學員身分的 Trigger 與 RLS 政策。遷移也會為既有 Auth 帳號補上缺少的預設學員身分；沒有 profile row 的已登入帳號則可安全建立自己的健康檔案。
4. 在 Supabase Authentication 設定允許的重新導向網址，包含本機的 `/auth/callback`。
5. 執行 `npm run dev`，開啟終端機顯示的本機網址。

## 驗證

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

E2E 測試會以開發模式啟動專用測試頁，不需要 Supabase 帳號；正式環境不提供該測試頁。健康檔案的讀寫仍須 Supabase 設定及已套用資料庫遷移。

本機開發環境尚未設定 Supabase，或 Supabase 的帳號／健康檔案資料表尚未建立時，健康檔案頁會切換至本機展示模式，並使用目前分頁的 `sessionStorage` 暫存。關閉分頁即清除；資料不會同步至 Supabase，請勿在此模式輸入真實敏感資料。資料表存在但發生權限或其他資料庫錯誤時不會降級，以免隱藏正式讀寫問題。
