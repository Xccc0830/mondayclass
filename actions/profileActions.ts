"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateProfileForm } from "@/lib/domain/profile-validation";
import type { ProfileActionState } from "@/types/profile-action";
import type { ProfileFormValues } from "@/types/profile";

function readFormString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

function readRestrictions(data: FormData): string[] {
  return data
    .getAll("dietaryRestrictions")
    .map((value) => (typeof value === "string" ? value : "__invalid__"));
}

function readProfileForm(data: FormData): ProfileFormValues {
  return {
    heightCm: readFormString(data, "heightCm"),
    weightKg: readFormString(data, "weightKg"),
    bodyFatPercent: readFormString(data, "bodyFatPercent"),
    age: readFormString(data, "age"),
    sex: readFormString(data, "sex"),
    activityLevel: readFormString(data, "activityLevel"),
    fitnessGoal: readFormString(data, "fitnessGoal"),
    preferredExerciseType: readFormString(data, "preferredExerciseType"),
    dietaryRestrictions: readRestrictions(data),
    dietaryOther: readFormString(data, "dietaryOther"),
    dailyCalorieTarget: readFormString(data, "dailyCalorieTarget"),
    dailyCarbohydrateTarget: readFormString(data, "dailyCarbohydrateTarget"),
    dailyProteinTarget: readFormString(data, "dailyProteinTarget"),
    dailyFatTarget: readFormString(data, "dailyFatTarget"),
  };
}

export async function saveHealthProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const validation = validateProfileForm(readProfileForm(formData));
  if (!validation.success) {
    return {
      success: false,
      message: "請修正表單中的欄位後再儲存。",
      errors: validation.errors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "登入狀態已失效，請重新登入後再儲存。",
      errors: {},
    };
  }

  const { data: accountProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("無法讀取帳號權限：", profileError);
    return {
      success: false,
      message: "無法驗證帳號權限，請稍後再試。",
      errors: {},
    };
  }

  if (accountProfile && accountProfile.role !== "student") {
    return {
      success: false,
      message: "目前帳號沒有學員權限，無法儲存健康檔案。",
      errors: {},
    };
  }

  const profile = validation.value;
  const { error } = await supabase.from("health_profiles").upsert(
    {
      user_id: user.id,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      body_fat_percent: profile.bodyFatPercent,
      age: profile.age,
      sex: profile.sex,
      activity_level: profile.activityLevel,
      fitness_goal: profile.fitnessGoal,
      preferred_exercise_type: profile.preferredExerciseType,
      dietary_restrictions: profile.dietaryRestrictions,
      dietary_other: profile.dietaryOther,
      daily_calorie_target: profile.dailyCalorieTarget,
      daily_carbohydrate_target: profile.dailyCarbohydrateTarget,
      daily_protein_target: profile.dailyProteinTarget,
      daily_fat_target: profile.dailyFatTarget,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("健康檔案儲存失敗：", error);
    return {
      success: false,
      message: "健康檔案儲存失敗，請稍後再試。",
      errors: {},
    };
  }

  revalidatePath("/profile");
  return {
    success: true,
    message: "健康檔案已儲存。",
    errors: {},
  };
}
