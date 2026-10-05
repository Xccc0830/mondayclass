# 系統架構與工程規範 (ARCHITECTURE.md)

## 1. 核心技術棧
- **開發工具與框架：** React 18+ (使用 Vite 建置工具)
- **語言：** TypeScript (Strict Mode，嚴格型別檢查，嚴禁使用 `any`)
- **樣式與圖標：** Tailwind CSS、Lucide React (圖標庫)
- **狀態管理與邏輯：** React Hooks (自訂 Hooks 封裝業務邏輯)
- **資料來源：** Mock Data (前端模擬資料與非同步 API 模擬函式)

---

## 2. 目錄結構與職責分工
├── src/
│   ├── assets/                    # 靜態資源 (圖片、字型等)
│   ├── components/                # 元件庫
│   │   ├── ui/                    # 基礎底層 UI 元件 (如 Button, Card, Modal)
│   │   ├── common/                # 全站共用元件 (如 Header, Sidebar, Footer)
│   │   └── features/              # 依業務功能劃分的複合元件
│   ├── hooks/                     # 自訂 React Hooks (處理狀態與資料邏輯)
│   ├── pages/                     # 頁面級元件 (路由對應頁面)
│   ├── types/                     # 全域 TypeScript 型別定義 (.ts)
│   └── utils/                     # 共用工具函式與 Mock 資料庫
│       ├── mockData.ts            # 前端模擬資料
│       └── helpers.ts             # 格式化、計算等工具函式
├── public/                        # 公開靜態檔案
├── index.html                     # HTML 入口
├── package.json                   # 專案套件設定
└── tsconfig.json                  # TypeScript 嚴格設定

### 架構核心原則：
1. **元件展示純粹化 (Presentational Purity)：** `components/` 內的元件盡可能只負責 UI 渲染與視覺互動，邏輯處理與資料切換應抽離至 `src/hooks/`。
2. **模擬資料隔離：** 所有與後端 API 相關的模擬行為（如 `setTimeout` 模擬請求）統一放在 `src/utils/` 或自訂 Hook 中，避免直接把硬編碼資料散落於 UI 元件中。

---

## 3. UI 與樣式開發規範
- **響應式設計 (Responsive Design)：** 所有介面必須同時支援行動裝置 (Mobile) 與桌面端 (Desktop)，優先採用 Mobile-First 策略。
- **Tailwind 撰寫規範：** 保持 Class 名稱簡潔清晰，重複性高的樣式組合應封裝為底層 UI 元件 (`src/components/ui/`)。
- **圖標選用：** 統一使用 `lucide-react`，確保全站圖標視覺風格一致。

---

## 4. 在地化與繁體中文（台灣）用語規範
專案中所有使用者可見文字（按鈕、提示、表單驗證、彈窗訊息）一律強制使用**繁體中文（台灣慣用詞）**。嚴禁使用簡體中文轉譯或中國大陸用語。

### 用語對照表：

| 台灣習慣用語 (必須使用) | 禁止使用之用語 (避免出現) |
| :--- | :--- |
| **使用者 / 會員** | 用戶 |
| **登入 / 登出** | 登錄 / 退出 |
| **設定** | 設置 |
| **專案** | 項目 |
| **預設** | 默認 |
| **支援** | 支持 |
| **資訊** | 信息 |
| **上傳 / 下載** | 上載 / 下載 |
| **連結** | 鏈接 |
| **建立** | 創建 |
| **確認 / 送出** | 提交 / 確定 |
| **螢幕** | 屏幕 |
| **程式 / 軟體** | 程序 / 軟件 |