import { signIn, signUp } from "@/actions/authActions";
import { isSupabaseConfigured } from "@/lib/supabase/server";

interface LoginPageProps {
  searchParams: Promise<{ message?: string }>;
}

const messages: Record<string, string> = {
  missing: "請輸入電子郵件及密碼。",
  "supabase-not-configured": "尚未設定 Supabase，無法完成登入或註冊。",
  "sign-in-failed": "登入失敗，請確認帳號與密碼後重試。",
  "sign-in-required": "請先登入以查看健康檔案。",
  "invalid-sign-up": "請輸入有效電子郵件及至少 8 個字元的密碼。",
  "sign-up-failed": "註冊失敗，請確認電子郵件格式後重試。",
  "site-not-configured": "尚未設定網站網址，暫時無法註冊帳號。",
  "check-email": "註冊申請已送出，請依電子郵件指示完成驗證。",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-ink">登入 MondayClass</h1>
          <p className="mt-2 text-sm text-muted">
            登入後即可建立或更新健康檔案。
          </p>
          {!isSupabaseConfigured() ? (
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              尚未設定 Supabase，請依 <code>.env.example</code> 設定專案環境變數。
            </p>
          ) : null}
          {message && messages[message] ? (
            <p className="mt-5 rounded-lg bg-slate-100 p-3 text-sm text-ink" role="status">
              {messages[message]}
            </p>
          ) : null}
          <form action={signIn} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-ink">
              電子郵件
              <input
                className="form-input"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              密碼
              <input
                className="form-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <button
              className="w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              type="submit"
              disabled={!isSupabaseConfigured()}
            >
              登入
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-ink">建立帳號</h2>
          <p className="mt-2 text-sm text-muted">
            使用電子郵件及至少 8 個字元的密碼註冊。
          </p>
          <form action={signUp} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm font-medium text-ink">
              電子郵件
              <input
                className="form-input"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-ink">
              密碼
              <input
                className="form-input"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <button
              className="w-full rounded-lg border border-brand px-5 py-3 text-sm font-semibold text-brand hover:bg-teal-50 disabled:opacity-60"
              type="submit"
              disabled={!isSupabaseConfigured()}
            >
              註冊
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
