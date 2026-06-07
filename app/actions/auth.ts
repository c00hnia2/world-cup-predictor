"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { translateAuthError } from "@/lib/auth-errors";
import {
  validateEmail,
  validateNewPassword,
  validatePassword,
  validateUsername,
} from "@/lib/auth-validation";
import type { AuthFormState } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

export async function register(
  prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const emailError = validateEmail(email);
  const usernameError = validateUsername(username);
  const passwordError = validateNewPassword(password);

  if (emailError || usernameError || passwordError) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: {
        email: emailError ?? undefined,
        username: usernameError ?? undefined,
        password: passwordError ?? undefined,
      },
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/`,
      data: {
        username: trimmedUsername,
        display_name: trimmedUsername,
      },
    },
  });

  if (error) {
    console.error("[register] signUp error:", error.message);
    return {
      status: "error",
      message: translateAuthError(error),
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  const verifyParams = new URLSearchParams({ email: trimmedEmail });
  redirect(`/verify-email?${verifyParams.toString()}`);
}

export async function login(
  prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: {
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    console.error("[login] signIn error:", error.message);
    return {
      status: "error",
      message: translateAuthError(error),
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[logout] signOut error:", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
