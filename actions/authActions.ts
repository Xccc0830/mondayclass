"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateAuthCredentials } from "@/lib/domain/auth-validation";

function readCredential(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return key === "password" ? value : value.trim();
}

export async function signIn(formData: FormData): Promise<void> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");
  const credentialError = validateAuthCredentials(email, password);
  if (credentialError) {
    redirect(
      credentialError === "missing"
        ? "/login?message=missing"
        : "/login?message=sign-in-failed",
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?message=sign-in-failed");
  }
  redirect("/profile");
}

export async function signUp(formData: FormData): Promise<void> {
  const email = readCredential(formData, "email");
  const password = readCredential(formData, "password");
  const credentialError = validateAuthCredentials(email, password);
  if (credentialError) {
    redirect("/login?message=invalid-sign-up");
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || !URL.canParse(siteUrl)) {
    redirect("/login?message=site-not-configured");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: new URL("/auth/callback", siteUrl).toString(),
    },
  });
  if (error) {
    redirect("/login?message=sign-up-failed");
  }
  redirect("/login?message=check-email");
}
