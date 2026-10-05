# Project Instructions
- Stack: React (Vite), TypeScript (Strict), Tailwind CSS, Lucide React, Supabase (Auth & DB).
- Structure: Pages in `src/pages/`, UI in `src/components/ui/`, feature components in `src/components/features/`, Supabase client in `src/lib/supabase.ts`.
- UI & Style: Clean Tailwind classes; strictly responsive and mobile-friendly; keep styling consistent.
- Localization: UI text and comments must use Traditional Chinese (zh-TW, Taiwan phrasing: 使用者 not 用戶, 專案 not 項目).
- Code Quality: Clean functional components with explicit TypeScript interfaces; strictly forbid `any`.
- Supabase Rules: Fetch data via Supabase JS client inside custom hooks (`src/hooks/`); generate DB types from Supabase CLI.
- Logic & State: Keep UI presentational; extract business logic and DB queries to `src/services/` or `src/hooks/`.
- Git Commits: Follow standard commit prefixes (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`).
- Security & Safety: Only use ANON key in frontend; NEVER commit service role keys or `.env` files.