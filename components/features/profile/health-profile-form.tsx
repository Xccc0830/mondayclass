"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { calculateTdee } from "@/lib/domain/energy";
import {
  demoProfileStorageKey,
  readDemoProfile,
} from "@/lib/domain/demo-profile";
import { saveHealthProfile } from "@/actions/profileActions";
import {
  validateProfileForm,
  type ProfileErrors,
} from "@/lib/domain/profile-validation";
import type {
  ActivityLevel,
  DietaryRestriction,
  HealthProfile,
  ProfileFormValues,
  Sex,
} from "@/types/profile";
import { initialProfileActionState } from "@/types/profile-action";

interface HealthProfileFormProps {
  initialProfile: HealthProfile | null;
  demoMode?: boolean;
}

interface FieldProps {
  id: string;
  label: string;
  unit?: string;
  error?: string;
  children: ReactNode;
}

const energyFieldLabels = {
  heightCm: "身高",
  weightKg: "體重",
  age: "年齡",
  sex: "生理性別",
  activityLevel: "活動量",
} as const;

const profileErrorFields: readonly (keyof ProfileErrors)[] = [
  "heightCm",
  "weightKg",
  "bodyFatPercent",
  "age",
  "sex",
  "activityLevel",
  "fitnessGoal",
  "preferredExerciseType",
  "dietaryRestrictions",
  "dietaryOther",
  "dailyCalorieTarget",
  "dailyCarbohydrateTarget",
  "dailyProteinTarget",
  "dailyFatTarget",
];

const dietaryLabels: readonly {
  value: DietaryRestriction;
  label: string;
}[] = [
  { value: "vegetarian", label: "素食" },
  { value: "vegan", label: "全素" },
  { value: "dairy_free", label: "避免乳製品" },
  { value: "gluten_free", label: "無麩質" },
  { value: "halal", label: "清真飲食" },
  { value: "other", label: "其他" },
];

const initialFormValues = (
  profile: HealthProfile | null,
): ProfileFormValues => ({
  heightCm: profile ? String(profile.heightCm) : "",
  weightKg: profile ? String(profile.weightKg) : "",
  bodyFatPercent: profile ? String(profile.bodyFatPercent) : "",
  age: profile ? String(profile.age) : "",
  sex: profile?.sex ?? "",
  activityLevel: profile?.activityLevel ?? "",
  fitnessGoal: profile?.fitnessGoal ?? "",
  preferredExerciseType: profile?.preferredExerciseType ?? "",
  dietaryRestrictions: profile?.dietaryRestrictions ?? [],
  dietaryOther: profile?.dietaryOther ?? "",
  dailyCalorieTarget: profile?.dailyCalorieTarget
    ? String(profile.dailyCalorieTarget)
    : "",
  dailyCarbohydrateTarget: profile?.dailyCarbohydrateTarget
    ? String(profile.dailyCarbohydrateTarget)
    : "",
  dailyProteinTarget: profile?.dailyProteinTarget
    ? String(profile.dailyProteinTarget)
    : "",
  dailyFatTarget: profile?.dailyFatTarget ? String(profile.dailyFatTarget) : "",
});

function Field({ id, label, unit, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {unit ? (
          <span className="ml-1 font-normal text-muted">（{unit}）</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toCalculationInput(values: ProfileFormValues) {
  const parse = (value: string): number | null => {
    if (value.trim().length === 0) {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  };

  const sex: Sex | null =
    values.sex === "male" || values.sex === "female" ? values.sex : null;
  const activityLevel: ActivityLevel | null = [
    "sedentary",
    "light",
    "moderate",
    "high",
    "very_high",
  ].includes(values.activityLevel)
    ? (values.activityLevel as ActivityLevel)
    : null;

  return {
    heightCm: parse(values.heightCm),
    weightKg: parse(values.weightKg),
    age: parse(values.age),
    sex,
    activityLevel,
  };
}

export function HealthProfileForm({
  initialProfile,
  demoMode = false,
}: HealthProfileFormProps) {
  const [values, setValues] = useState(() => initialFormValues(initialProfile));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [actionState, formAction, pending] = useActionState(
    saveHealthProfile,
    initialProfileActionState,
  );

  useEffect(() => {
    setErrors(actionState.errors);
  }, [actionState.errors]);

  useEffect(() => {
    if (!demoMode) {
      return;
    }

    try {
      const saved = readDemoProfile(
        window.sessionStorage.getItem(demoProfileStorageKey),
      );
      if (saved.success && saved.profile) {
        setValues(initialFormValues(saved.profile));
      } else if (!saved.success) {
        setDemoMessage("本機暫存資料格式無效，已載入空白表單。");
      }
    } catch {
      setDemoMessage("無法讀取本機暫存資料，請確認瀏覽器儲存空間權限。");
    }
  }, [demoMode]);

  const calculation = useMemo(
    () => calculateTdee(toCalculationInput(values)),
    [values],
  );

  function updateValue(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.currentTarget;
    setValues((current) => ({ ...current, [name]: value }));
    const errorField = profileErrorFields.find((field) => field === name);
    if (errorField) {
      setErrors((current) => {
        const next = { ...current };
        delete next[errorField];
        return next;
      });
    }
  }

  function updateRestriction(
    event: ChangeEvent<HTMLInputElement>,
    restriction: DietaryRestriction,
  ) {
    const isChecked = event.currentTarget.checked;
    setValues((current) => ({
      ...current,
      dietaryRestrictions: isChecked
        ? [...current.dietaryRestrictions, restriction]
        : current.dietaryRestrictions.filter((item) => item !== restriction),
    }));
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const formValues: ProfileFormValues = {
      ...values,
      dietaryRestrictions: formData
        .getAll("dietaryRestrictions")
        .filter((value): value is string => typeof value === "string"),
    };
    const result = validateProfileForm(formValues);
    if (!result.success) {
      event.preventDefault();
      setErrors(result.errors);
      return;
    }

    if (demoMode) {
      event.preventDefault();
      try {
        window.sessionStorage.setItem(
          demoProfileStorageKey,
          JSON.stringify(formValues),
        );
        setDemoMessage("健康檔案已暫存於本機瀏覽器分頁，尚未同步至 Supabase。");
      } catch {
        setDemoMessage("本機暫存失敗，請確認瀏覽器儲存空間權限後重試。");
      }
    }
  }

  const missingCalculationFields =
    calculation.success === false
      ? calculation.missingFields.map((field) => energyFieldLabels[field])
      : [];
  const invalidCalculationFields =
    calculation.success === false
      ? calculation.invalidFields.map((field) => energyFieldLabels[field])
      : [];

  function validateField(field: keyof ProfileErrors) {
    const result = validateProfileForm(values);
    setErrors((current) => {
      const next = { ...current };
      if (result.success || !result.errors[field]) {
        delete next[field];
      } else {
        next[field] = result.errors[field];
      }
      return next;
    });
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} noValidate>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <h2 className="text-lg font-bold text-ink">個人生理資料</h2>
            <p className="mt-1 text-sm text-muted">
              標示為必填的欄位完成後，才能儲存健康檔案。
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="heightCm" label="身高" unit="公分" error={errors.heightCm}>
              <input
                id="heightCm"
                name="heightCm"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={values.heightCm}
                onChange={updateValue}
                onBlur={() => validateField("heightCm")}
                aria-invalid={Boolean(errors.heightCm)}
                aria-describedby={errors.heightCm ? "heightCm-error" : undefined}
                className="form-input"
                placeholder="例如 170"
              />
            </Field>
            <Field id="weightKg" label="體重" unit="公斤" error={errors.weightKg}>
              <input
                id="weightKg"
                name="weightKg"
                type="text"
                inputMode="decimal"
                value={values.weightKg}
                onChange={updateValue}
                onBlur={() => validateField("weightKg")}
                aria-invalid={Boolean(errors.weightKg)}
                aria-describedby={errors.weightKg ? "weightKg-error" : undefined}
                className="form-input"
                placeholder="例如 65"
              />
            </Field>
            <Field
              id="bodyFatPercent"
              label="體脂率"
              unit="百分比"
              error={errors.bodyFatPercent}
            >
              <input
                id="bodyFatPercent"
                name="bodyFatPercent"
                type="text"
                inputMode="decimal"
                value={values.bodyFatPercent}
                onChange={updateValue}
                onBlur={() => validateField("bodyFatPercent")}
                aria-invalid={Boolean(errors.bodyFatPercent)}
                aria-describedby={
                  errors.bodyFatPercent ? "bodyFatPercent-error" : undefined
                }
                className="form-input"
                placeholder="例如 22"
              />
            </Field>
            <Field id="age" label="年齡" unit="歲" error={errors.age}>
              <input
                id="age"
                name="age"
                type="text"
                inputMode="numeric"
                value={values.age}
                onChange={updateValue}
                onBlur={() => validateField("age")}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? "age-error" : undefined}
                className="form-input"
                placeholder="例如 30"
              />
            </Field>
            <Field id="sex" label="生理性別" error={errors.sex}>
              <select
                id="sex"
                name="sex"
                value={values.sex}
                onChange={updateValue}
                aria-invalid={Boolean(errors.sex)}
                className="form-input"
              >
                <option value="">請選擇</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </Field>
            <Field
              id="activityLevel"
              label="活動量"
              error={errors.activityLevel}
            >
              <select
                id="activityLevel"
                name="activityLevel"
                value={values.activityLevel}
                onChange={updateValue}
                aria-invalid={Boolean(errors.activityLevel)}
                className="form-input"
              >
                <option value="">請選擇</option>
                <option value="sedentary">久坐</option>
                <option value="light">輕度活動</option>
                <option value="moderate">中度活動</option>
                <option value="high">高度活動</option>
                <option value="very_high">非常高度活動</option>
              </select>
            </Field>
            <Field id="fitnessGoal" label="健身目標" error={errors.fitnessGoal}>
              <select
                id="fitnessGoal"
                name="fitnessGoal"
                value={values.fitnessGoal}
                onChange={updateValue}
                aria-invalid={Boolean(errors.fitnessGoal)}
                className="form-input"
              >
                <option value="">請選擇</option>
                <option value="fat_loss">減脂</option>
                <option value="muscle_gain">增肌</option>
                <option value="maintenance">維持</option>
              </select>
            </Field>
          </div>

          <div className="space-y-5 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-ink">運動與飲食偏好</h2>
            <Field
              id="preferredExerciseType"
              label="偏好的運動類型"
              error={errors.preferredExerciseType}
            >
              <input
                id="preferredExerciseType"
                name="preferredExerciseType"
                type="text"
                value={values.preferredExerciseType}
                onChange={updateValue}
                className="form-input"
                placeholder="例如：重量訓練、瑜伽"
              />
            </Field>
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-ink">
                飲食限制（可複選）
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {dietaryLabels.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      name="dietaryRestrictions"
                      value={value}
                      checked={values.dietaryRestrictions.includes(value)}
                      onChange={(event) => updateRestriction(event, value)}
                      className="size-4 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {errors.dietaryRestrictions ? (
                <p className="text-sm text-red-700" role="alert">
                  {errors.dietaryRestrictions}
                </p>
              ) : null}
              {values.dietaryRestrictions.includes("other") ? (
                <Field id="dietaryOther" label="其他飲食限制說明">
                  <input
                    id="dietaryOther"
                    name="dietaryOther"
                    type="text"
                    value={values.dietaryOther}
                    onChange={updateValue}
                    className="form-input"
                    placeholder="請補充說明"
                  />
                </Field>
              ) : null}
            </fieldset>
          </div>
        </section>

        <aside className="space-y-5">
          <section
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            aria-labelledby="energy-heading"
          >
            <div>
              <h2 id="energy-heading" className="text-lg font-bold text-ink">
                每日消耗熱量估算
              </h2>
              <p className="mt-1 text-sm text-muted">
                依 Mifflin-St Jeor 公式計算；結果僅供參考。
              </p>
            </div>
            {calculation.success ? (
              <dl className="space-y-3">
                <div className="flex justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-sm text-muted">基礎代謝率（BMR）</dt>
                  <dd className="font-bold text-ink">
                    {calculation.value.bmr} kcal/日
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sm text-muted">每日總消耗熱量（TDEE）</dt>
                  <dd className="font-bold text-ink">
                    {calculation.value.tdee} kcal/日
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-2 text-sm text-muted" aria-live="polite">
                <p>資料完整且有效後顯示估算結果。</p>
                {missingCalculationFields.length > 0 ? (
                  <p>
                    尚待填寫：{missingCalculationFields.join("、")}
                    {missingCalculationFields.length > 0 ? "。" : ""}
                  </p>
                ) : null}
                {invalidCalculationFields.length > 0 ? (
                  <p>請修正：{invalidCalculationFields.join("、")}。</p>
                ) : null}
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-ink">個人每日目標</h2>
              <p className="mt-1 text-sm text-muted">
                尚未設定的目標會顯示「未設定」，不會以 TDEE 代替。
              </p>
            </div>
            <TargetInput
              id="dailyCalorieTarget"
              label="每日熱量"
              unit="kcal/日"
              value={values.dailyCalorieTarget}
              error={errors.dailyCalorieTarget}
              onChange={updateValue}
            />
            <TargetInput
              id="dailyCarbohydrateTarget"
              label="碳水化合物"
              unit="公克/日"
              value={values.dailyCarbohydrateTarget}
              error={errors.dailyCarbohydrateTarget}
              onChange={updateValue}
            />
            <TargetInput
              id="dailyProteinTarget"
              label="蛋白質"
              unit="公克/日"
              value={values.dailyProteinTarget}
              error={errors.dailyProteinTarget}
              onChange={updateValue}
            />
            <TargetInput
              id="dailyFatTarget"
              label="脂肪"
              unit="公克/日"
              value={values.dailyFatTarget}
              error={errors.dailyFatTarget}
              onChange={updateValue}
            />
          </section>
        </aside>
      </div>

      {demoMessage || actionState.message ? (
        <p
          className={`mt-5 rounded-lg p-3 text-sm ${
            demoMode || actionState.success
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
          role="status"
        >
          {demoMode ? demoMessage : actionState.message}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "儲存中…" : "儲存健康檔案"}
        </button>
      </div>
    </form>
  );
}

interface TargetInputProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function TargetInput({
  id,
  label,
  unit,
  value,
  error,
  onChange,
}: TargetInputProps) {
  return (
    <Field id={id} label={label} unit={unit} error={error}>
      <div className="flex items-center gap-3">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          className="form-input"
          placeholder="未設定"
        />
        <span className="min-w-16 text-right text-xs text-muted">
          {value.trim() ? value : "未設定"}
        </span>
      </div>
    </Field>
  );
}
