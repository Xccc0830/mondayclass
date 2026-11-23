import { notFound } from "next/navigation";
import { HealthProfileForm } from "@/components/features/profile/health-profile-form";

export const dynamic = "force-dynamic";

export default function ProfileE2ePage() {
  if (
    process.env.E2E_TEST_MODE !== "1" ||
    process.env.NODE_ENV === "production"
  ) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-ink">健康檔案與目標設定</h1>
        <HealthProfileForm initialProfile={null} demoMode />
      </div>
    </main>
  );
}
