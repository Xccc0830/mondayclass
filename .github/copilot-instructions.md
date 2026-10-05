# Project Instructions
- Stack: Next.js 14+ (App Router), TypeScript (Strict), Tailwind CSS, Lucide React, Supabase (@supabase/ssr).
- Structure: Routes in `app/`, UI components in `components/ui/`, feature components in `components/features/`, Supabase SSR clients in `lib/supabase/`.
- Component Strategy: Default to Server Components; explicitly use 'use client' only for interactive UI logic.
- UI & Style: Clean Tailwind classes; strictly responsive and mobile-friendly; keep styling consistent.
- Localization: UI text and comments must use Traditional Chinese (zh-TW, Taiwan phrasing: 使用者 not 用戶, 專案 not 項目).
- Code Quality: Clean functional components with explicit TypeScript interfaces; strictly forbid `any`.
- Supabase Rules: Use Server Clients/Server Actions for data fetching and mutations; use Browser Client only for client components.
- Security & Safety: Protect routes via Middleware; enforce RLS; only expose ANON key; NEVER commit service role keys or `.env` files.