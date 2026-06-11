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
import { getClientIpFromHeaders } from "@/lib/get-client-ip";
import {
  checkRateLimit,
  getRateLimitMessage,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import type { AuthFormState } from "@/types/auth";
import { createClient } from "@/utils/supabase/server";

async function isUsernameTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_username_taken", {
    p_username: username,
  });

  if (error) {
    // Błąd odczytu nie powinien blokować rejestracji — unikalny indeks w bazie
    // i tak ochroni przed duplikatem przy potwierdzeniu emaila.
    console.error("[register] username check error:", error.message);
    return false;
  }

  return data === true;
}

function isUsernameTakenError(error: { message?: string }): boolean {
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("username_taken") ||
    message.includes("users_username_lower_key")
  );
}

export async function register(
  prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const registerRateLimit = checkRateLimit(
    "register",
    await getClientIpFromHeaders(),
    RATE_LIMITS.register,
  );
  if (!registerRateLimit.allowed) {
    return {
      status: "error",
      message: getRateLimitMessage(registerRateLimit),
    };
  }

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
  const siteUrl = SITE_URL;
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();

  // Wczesne, przyjazne sprawdzenie zajętości nicku (case-insensitive).
  // Twardą gwarancję unikalności daje unikalny indeks w bazie (0011).
  const usernameTaken = await isUsernameTaken(supabase, trimmedUsername);
  if (usernameTaken) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: {
        username: "Ta nazwa użytkownika jest już zajęta.",
      },
    };
  }

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

    // Wyścig: nick zajęty między pre-checkiem a zapisem → trigger zgłasza błąd.
    if (isUsernameTakenError(error)) {
      return {
        status: "error",
        message: "Popraw błędy w formularzu.",
        fieldErrors: {
          username: "Ta nazwa użytkownika jest już zajęta.",
        },
      };
    }

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
  const loginRateLimit = checkRateLimit(
    "login",
    await getClientIpFromHeaders(),
    RATE_LIMITS.login,
  );
  if (!loginRateLimit.allowed) {
    return {
      status: "error",
      message: getRateLimitMessage(loginRateLimit),
    };
  }

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
