# 高階系統架構與工程規範

## 1. 核心技術棧

| 領域 | 技術與說明 |
| --- | --- |
| 全端框架 | Next.js 14+，使用 App Router |
| 程式語言 | TypeScript Strict Mode；禁止使用 `any` |
| 樣式與 UI 元件 | Tailwind CSS、Lucide React |
| 後端與資料庫（BaaS） | Supabase、PostgreSQL；資料表必須啟用 Row Level Security（RLS） |
| 身分驗證 | Supabase Authentication，透過伺服器端 SSR 與 Cookie 管理工作階段 |
| Supabase 套件 | `@supabase/ssr`、`@supabase/supabase-js` |

## 2. 目錄結構與職責

```text
├── .github/
│   └── copilot-instructions.md    # AI Agent 輕量級提示指令
├── app/                           # Next.js App Router 主目錄
│   ├── (auth)/                    # 身分驗證路由群組（登入、註冊）
│   ├── (dashboard)/               # 需登入才能存取的頁面群組
│   │   ├── layout.tsx             # 受保護頁面的共用版型與驗證檢查
│   │   └── page.tsx               # 主儀表板（Server Component）
│   ├── api/                       # Route Handlers（如 Webhook 或 REST API）
│   ├── favicon.ico
│   ├── globals.css                # Tailwind CSS 全域樣式
│   ├── layout.tsx                 # Root Layout
│   └── page.tsx                   # 專案首頁
├── components/                    # 共用與功能元件
│   ├── ui/                        # 基礎 UI 元件（Button、Input、Card、Modal）
│   ├── common/                    # 全站共用版型元件（Header、Footer、Sidebar）
│   └── features/                  # 依業務功能分類的 Client／Server 元件
│       └── [feature_name]/
├── actions/                       # Next.js Server Actions，處理資料異動
│   └── [feature]Actions.ts        # INSERT、UPDATE、DELETE 等操作
├── lib/                           # 第三方套件與 Supabase 工廠函式
│   └── supabase/
│       ├── client.ts              # Browser Client，供 Client Component 使用
│       ├── server.ts              # Server Client，供伺服器端程式使用
│       └── middleware.ts          # Middleware 使用的 Client
├── middleware.ts                  # 工作階段更新與路由驗證
├── types/                         # 全域 TypeScript 型別定義
│   ├── database.types.ts          # Supabase CLI 產生的 Schema 型別
│   └── index.ts                   # 共用型別
├── utils/                         # 共用工具函式與格式化工具
├── .env.example                   # 環境變數範例
├── .gitignore
├── next.config.mjs                # Next.js 設定
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 3. 架構設計原則

### 3.1 優先使用 React Server Components

- `app/` 中的頁面與元件預設為 Server Components，資料讀取可在伺服器端直接執行，通常不需要透過 `useEffect` 或 `useState` 載入資料。
- 只有需要互動功能（例如事件處理、表單輸入狀態或 `useContext`）時，才在檔案頂端加入 `'use client'`。

### 3.2 分離資料讀取與異動

- **資料查詢：** 在 Server Component 中建立 Supabase Server Client，以 `async`／`await` 查詢資料並在伺服器端預先渲染。
- **資料異動：** 新增、更新與刪除操作透過 `actions/` 中的 Server Actions 處理。完成後視需求使用 `revalidatePath` 或 `revalidateTag` 更新快取。
- **安全性：** 不得將伺服器專用金鑰或具權限的寫入邏輯暴露給用戶端。

## 4. Supabase SSR 與身分驗證

### 4.1 Cookie 工作階段

使用 `@supabase/ssr` 管理伺服器端與瀏覽器端共用的 Supabase 工作階段。依照執行環境，在 Server Component、Server Actions 與 Middleware 中建立對應的 Supabase Client，並透過 Cookie 讀取或更新工作階段。

### 4.2 路由驗證

根目錄的 `middleware.ts` 可用來更新工作階段，並依路由規則導向未登入的使用者。受保護路由（例如 `/dashboard/*`）仍須在伺服器端確認使用者身分與資料存取權限；不可只依賴用戶端檢查。

## 5. 在地化與繁體中文（台灣）用語

所有使用者可見的介面文字與錯誤提示，必須使用繁體中文及台灣慣用詞。程式碼註解也使用繁體中文。

| 建議使用 | 避免使用 |
| --- | --- |
| 使用者／會員 | 用戶 |
| 登入／登出 | 登錄／退出 |
| 設定 | 設置 |
| 專案 | 項目 |
| 預設 | 默認 |
| 資訊 | 信息 |
| 連結 | 鏈接 |
| 建立／繪製 | 創建／渲染 |

## 6. Git 提交規範

Commit Message 遵循 Conventional Commits 格式：

| 前綴 | 用途 |
| --- | --- |
| `feat:` | 新增功能 |
| `fix:` | 修復錯誤 |
| `docs:` | 修改文件 |
| `style:` | 調整 UI 樣式或程式碼格式，不影響邏輯 |
| `refactor:` | 重構程式碼或架構（例如將 Client Component 改為 Server Component） |

## 7. 可延伸的程式碼範例

如有需要，可再補充以下範例：

- `lib/supabase/` 中的 Browser、Server 與 Middleware Client 設定。
- 在 Server Component 中向 Supabase 查詢資料並呈現的範例。
- 使用 Server Actions 處理表單提交與 Supabase 資料寫入的範例。
