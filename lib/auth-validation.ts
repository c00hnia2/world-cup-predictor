import { isDisposableEmail } from "disposable-email-domains-js";

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

  if (isDisposableEmail(trimmed)) {
    return "Rejestracja przy użyciu tymczasowych adresów e-mail jest zablokowana.";
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

// Walidacja przy logowaniu — tylko obecność (siłę sprawdzamy przy rejestracji,
// żeby nie zablokować istniejących kont z krótszym hasłem).
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Hasło jest wymagane.";
  }

  return null;
}

// Walidacja przy rejestracji/zmianie hasła — polityka siły hasła.
const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(password: string): string | null {
  if (!password) {
    return "Hasło jest wymagane.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną literę i jedną cyfrę.";
  }

  return null;
}
