# 系統架構與工程規範

## 1. 核心技術棧

| 領域 | 技術與說明 |
| --- | --- |
| 前端框架與建置工具 | React 18+、Vite |
| 程式語言 | TypeScript Strict Mode；禁止使用 `any` |
| 樣式與圖標 | Tailwind CSS、Lucide React |
| 資料來源 | Mock Data；使用前端模擬資料與非同步 API 模擬函式 |
| 後端服務規範 | Supabase（相關整合與安全規範見下文） |
| 資料庫 | PostgreSQL；所有資料表均須啟用 Row Level Security（RLS） |
| 身分驗證 | Supabase Authentication；支援 Email/Password 與 OAuth |
| 檔案儲存 | Supabase Storage；儲存靜態檔案與圖片 |
| 資料庫 SDK | `@supabase/supabase-js` |
| 狀態管理 | React Custom Hooks 與 React Context API；全域狀態範例：`AuthContext` |

## 2. 目錄結構與職責

```text
├── .github/
│   └── copilot-instructions.md    # AI Agent 輕量級提示指令（10 行以內）
├── public/                        # 靜態資源（Favicon、Manifest 等）
├── src/
│   ├── assets/                    # 專案內部靜態檔案（圖片、字型）
│   ├── components/                # 介面元件
│   │   ├── ui/                    # 基礎元件（Button、Input、Card、Modal、Badge）
│   │   ├── common/                # 全站共用版型（Header、Footer、Sidebar、Layout）
│   │   └── features/              # 依業務功能分群的元件
│   │       ├── auth/              # 登入與註冊表單元件
│   │       └── [feature_name]/    # 功能介面（如 ProductCard、PostList）
│   ├── context/                   # React Context 全域狀態（如 AuthContext.tsx）
│   ├── hooks/                     # 自訂 React Hooks，封裝 UI 邏輯與資料對接
│   │   ├── useAuth.ts             # 使用者登入狀態 Hook
│   │   └── use[Feature].ts        # 業務資料操作 Hook
│   ├── lib/                       # 第三方服務初始化設定
│   │   └── supabase.ts            # Supabase Client 初始化（僅限 Client/Anon Key）
│   ├── pages/                     # 頁面級元件，對應路由主畫面
│   ├── services/                  # Supabase API 與資料庫讀寫（CRUD 原子函式）
│   │   ├── authService.ts         # 身分驗證服務
│   │   └── [feature]Service.ts    # 各資料表的 CRUD 操作
│   ├── types/                     # 全域 TypeScript 型別定義
│   │   ├── database.types.ts      # Supabase CLI 產生的資料庫 Schema 型別
│   │   └── index.ts               # 前端頁面與 View Model 型別
│   ├── utils/                     # 共用工具函式與格式化工具
│   │   ├── formatters.ts          # 日期、金額等格式化函式
│   │   └── constants.ts           # 全域常數
│   ├── App.tsx                    # 應用程式入口與路由設定
│   ├── main.tsx                   # React DOM 渲染入口
│   └── index.css                 # 全域樣式與 Tailwind CSS 載入點
├── .env.example                   # 環境變數範例
├── .gitignore                     # Git 忽略規則
├── index.html                     # HTML 骨架
├── package.json                   # 專案套件依賴與指令
├── tailwind.config.js             # Tailwind CSS 設定
├── tsconfig.json                  # TypeScript 嚴格模式設定
└── vite.config.ts                 # Vite 建置與路徑別名設定
```

## 3. 架構設計原則

### 3.1 職責分離

- **`components/`（UI 展示層）：** 接收 props、渲染介面並發出事件。不得直接呼叫 `supabase.from(...)` 或撰寫複雜商業邏輯。
- **`services/`（資料處理層）：** 直接呼叫 Supabase SDK 執行 CRUD 操作，例如 `supabase.from('posts').select('*')`。查詢與回傳值必須使用強型別。
- **`hooks/`（狀態與邏輯層）：** 呼叫 `services/` 取得資料，並使用 React 狀態與副作用處理非同步狀態（如 `loading`、`error`、`data`），再提供給 `pages/` 或 `components/` 使用。

## 4. Supabase 資料庫與安全規範

### 4.1 金鑰與環境變數

專案根目錄應提供 `.env.local` 作為本機環境設定，並確認該檔案已加入 `.gitignore`，不得提交至版本控制。`.env.example` 僅放置範例值：

```dotenv
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

前端只能使用公開的 `ANON_KEY`。禁止在前端寫入或使用 `SUPABASE_SERVICE_ROLE_KEY`，以免洩漏資料庫管理權限。

### 4.2 行級安全政策（RLS）

- Supabase 中的所有資料表都必須啟用 RLS。
- `SELECT`、`INSERT`、`UPDATE`、`DELETE` 政策必須依據 `auth.uid()` 限制存取權限。
- 不得開放未受保護的公開寫入權限。

### 4.3 強型別對接

所有 Supabase Client 都必須載入資料庫 Schema 型別：

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## 5. UI、樣式與響應式規範

- **Mobile-First 響應式設計：** 所有介面都必須適用於行動裝置與桌面端，並使用 Tailwind CSS 斷點前綴（如 `md:`、`lg:`）。
- **圖標：** 全站統一使用 `lucide-react`，維持視覺一致性。
- **樣式組合：** 條件式 class 應保持清楚，避免過長或重複的 class 字串。
- **元件重用：** 將重複使用的基礎元件整理至 `src/components/ui/`。

## 6. 在地化與繁體中文（台灣）用語

所有使用者可見文字，包括按鈕、提示、表單驗證、彈窗訊息與 Toast，都必須使用繁體中文（台灣慣用詞）。不得使用簡體中文或中國大陸用語。

| 必須使用 | 避免使用 |
| --- | --- |
| 使用者／會員 | 用戶 |
| 登入／登出 | 登錄／退出 |
| 設定 | 設置 |
| 專案 | 項目 |
| 預設 | 默認 |
| 支援 | 支持 |
| 資訊 | 信息 |
| 上傳／下載 | 上載／下載 |
| 連結 | 鏈接 |
| 建立 | 創建 |
| 確認／送出 | 提交／確定 |
| 螢幕 | 屏幕 |
| 程式／軟體 | 程序／軟件 |
| 記憶體 | 內存 |

## 7. Git 提交與分支規範

### 7.1 Commit Message

Commit Message 必須遵循 Conventional Commits 格式：

| 前綴 | 用途 |
| --- | --- |
| `feat:` | 新增功能 |
| `fix:` | 修復 Bug |
| `docs:` | 修改文件（如 README、ARCHITECTURE） |
| `style:` | 調整程式碼格式或 UI 樣式，不影響邏輯 |
| `refactor:` | 重構程式碼 |
| `test:` | 新增或修改測試 |

### 7.2 提交安全檢查

Push 前確認沒有將 `.env` 檔案、API Keys 或個人金鑰加入版本控制。
