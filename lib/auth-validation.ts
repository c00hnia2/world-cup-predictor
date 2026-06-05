const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return "Adres email jest wymagany.";
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Podaj prawidłowy adres email.";
  }

  return null;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();

  if (!trimmed) {
    return "Nazwa użytkownika jest wymagana.";
  }

  if (!USERNAME_PATTERN.test(trimmed)) {
    return "Nazwa użytkownika musi mieć 3–30 znaków (litery, cyfry, _).";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Hasło jest wymagane.";
  }

  if (password.length < 6) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }

  return null;
}
