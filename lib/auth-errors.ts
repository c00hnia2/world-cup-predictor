import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Nieprawidłowy adres email lub hasło.",
  user_already_exists: "Użytkownik z tym adresem email już istnieje.",
  email_exists: "Użytkownik z tym adresem email już istnieje.",
  weak_password: "Hasło jest za słabe.",
  invalid_email: "Podaj prawidłowy adres email.",
  over_email_send_rate_limit: "Zbyt wiele prób. Spróbuj ponownie za chwilę.",
  email_not_confirmed: "Potwierdź adres email przed zalogowaniem.",
  user_not_found: "Nie znaleziono użytkownika o podanym adresie email.",
  same_password: "Nowe hasło musi różnić się od obecnego.",
  signup_disabled: "Rejestracja jest obecnie wyłączona.",
};

export function translateAuthError(
  error: AuthError | Error | null | undefined,
): string {
  if (!error) {
    return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
  }

  const code = "code" in error ? error.code : undefined;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  const message = error.message.toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  if (
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  ) {
    return AUTH_ERROR_MESSAGES.user_already_exists;
  }

  if (message.includes("password") && message.includes("weak")) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }

  if (message.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }

  if (message.includes("invalid email")) {
    return AUTH_ERROR_MESSAGES.invalid_email;
  }

  return "Wystąpił błąd autoryzacji. Spróbuj ponownie.";
}
