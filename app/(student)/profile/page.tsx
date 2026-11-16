import Link from "next/link";
import { redirect } from "next/navigation";
import { HealthProfileForm } from "@/components/features/profile/health-profile-form";
import { isProfileSchemaUnavailable } from "@/lib/supabase/schema-status";
import {
  createSupabaseServerClient,
  isLocalDemoAllowed,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { HealthProfile } from "@/types/profile";

export const dynamic = "force-dynamic";

function ConfigurationNotice() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h1 className="text-xl font-bold">尚未設定 Supabase</h1>
      <p className="mt-2 text-sm leading-6">
        請複製 <code>.env.example</code> 為 <code>.env.local</code>，填入 Supabase
        專案網址及 ANON Key，並套用資料庫遷移後重新啟動專案。
      </p>
    </section>
  );
}

interface ProfileScreenProps {
  initialProfile: HealthProfile | null;
  demoMode: boolean;
}

function ProfileScreen({ initialProfile, demoMode }: ProfileScreenProps) {
  return (
    <div>
      {demoMode ? (
        <aside
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
          role="status"
        >
          <strong>本機展示模式</strong>
          <p>
            資料只會暫存於目前瀏覽器分頁，關閉分頁後即清除，不會同步至
            Supabase。請勿在展示模式輸入真實敏感資料。
          </p>
        </aside>
      ) : null}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">
            {demoMode ? "本機展示" : "學員專區"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            健康檔案與目標設定
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            填寫身體資料以查看每日消耗熱量估算，並設定個人每日目標。
          </p>
        </div>
        {!demoMode ? (
          <Link
            href="/login"
            className="text-sm font-medium text-brand underline underline-offset-4"
          >
            帳號登入
          </Link>
        ) : null}
      </header>
      <HealthProfileForm initialProfile={initialProfile} demoMode={demoMode} />
    </div>
  );
}

function DatabaseErrorNotice() {
  return (
    <section
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"
      role="alert"
    >
      <h1 className="text-xl font-bold">無法載入健康檔案</h1>
      <p className="mt-2 text-sm">
        資料庫讀取失敗，請稍後再試或檢查 Supabase 權限設定。
      </p>
    </section>
  );
}

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return isLocalDemoAllowed() ? (
      <ProfileScreen initialProfile={null} demoMode />
    ) : (
      <ConfigurationNotice />
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=sign-in-required");
  }

  const { data: accountProfile, error: accountError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError && isProfileSchemaUnavailable(accountError)) {
    return isLocalDemoAllowed() ? (
      <ProfileScreen initialProfile={null} demoMode />
    ) : (
      <DatabaseErrorNotice />
    );
  }

  if (accountError) {
    console.error("無法驗證學員身分：", accountError);
    return <DatabaseErrorNotice />;
  }

  if (accountProfile && accountProfile.role !== "student") {
    return (
      <section
        className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
        role="alert"
      >
        <h1 className="text-xl font-bold">此頁面僅供學員使用</h1>
        <p className="mt-2 text-sm">目前帳號沒有學員權限，無法檢視健康檔案。</p>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("health_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error && isProfileSchemaUnavailable(error)) {
    return isLocalDemoAllowed() ? (
      <ProfileScreen initialProfile={null} demoMode />
    ) : (
      <DatabaseErrorNotice />
    );
  }

  if (error) {
    console.error("健康檔案讀取失敗：", error);
    return <DatabaseErrorNotice />;
  }

  const profile: HealthProfile | null = data
    ? {
        heightCm: Number(data.height_cm),
        weightKg: Number(data.weight_kg),
        bodyFatPercent: Number(data.body_fat_percent),
        age: Number(data.age),
        sex: data.sex,
        activityLevel: data.activity_level,
        fitnessGoal: data.fitness_goal,
        preferredExerciseType: data.preferred_exercise_type,
        dietaryRestrictions: data.dietary_restrictions,
        dietaryOther: data.dietary_other,
        dailyCalorieTarget:
          data.daily_calorie_target === null
            ? null
            : Number(data.daily_calorie_target),
        dailyCarbohydrateTarget:
          data.daily_carbohydrate_target === null
            ? null
            : Number(data.daily_carbohydrate_target),
        dailyProteinTarget:
          data.daily_protein_target === null
            ? null
            : Number(data.daily_protein_target),
        dailyFatTarget:
          data.daily_fat_target === null ? null : Number(data.daily_fat_target),
      }
    : null;

  return <ProfileScreen initialProfile={profile} demoMode={false} />;
}
