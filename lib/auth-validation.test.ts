import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateNewPassword,
} from "@/lib/auth-validation";

describe("validateEmail", () => {
  it("akceptuje poprawny email (z trimowaniem)", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("  user@example.com  ")).toBeNull();
  });

  it("odrzuca pusty adres", () => {
    expect(validateEmail("")).toMatch(/wymagany/);
    expect(validateEmail("   ")).toMatch(/wymagany/);
  });

  it("odrzuca niepoprawny format", () => {
    expect(validateEmail("brak-malpy")).toMatch(/prawidłowy/);
    expect(validateEmail("a@b")).toMatch(/prawidłowy/);
    expect(validateEmail("a @b.pl")).toMatch(/prawidłowy/);
  });
});

describe("validateUsername", () => {
  it("akceptuje 3–30 znaków alfanumerycznych i _", () => {
    expect(validateUsername("abc")).toBeNull();
    expect(validateUsername("jan_kowalski")).toBeNull();
    expect(validateUsername("a".repeat(30))).toBeNull();
  });

  it("odrzuca pustą nazwę", () => {
    expect(validateUsername("")).toMatch(/wymagana/);
  });

  it("odrzuca za krótkie i za długie", () => {
    expect(validateUsername("ab")).toMatch(/3–30/);
    expect(validateUsername("a".repeat(31))).toMatch(/3–30/);
  });

  it("odrzuca znaki niedozwolone (spacja, diakrytyki, symbole)", () => {
    expect(validateUsername("jan kowalski")).toMatch(/3–30/);
    expect(validateUsername("paweł")).toMatch(/3–30/);
    expect(validateUsername("user!")).toMatch(/3–30/);
  });
});

describe("validatePassword (logowanie)", () => {
  it("akceptuje dowolne niepuste hasło (bez polityki siły)", () => {
    expect(validatePassword("123456")).toBeNull();
    expect(validatePassword("x")).toBeNull(); // istniejące konta nie są blokowane
  });

  it("odrzuca puste hasło", () => {
    expect(validatePassword("")).toMatch(/wymagane/);
  });
});

describe("validateNewPassword (rejestracja)", () => {
  it("akceptuje hasło >= 8 znaków z literą i cyfrą", () => {
    expect(validateNewPassword("haslo123")).toBeNull();
    expect(validateNewPassword("Bezpieczne1")).toBeNull();
  });

  it("odrzuca puste hasło", () => {
    expect(validateNewPassword("")).toMatch(/wymagane/);
  });

  it("odrzuca hasło krótsze niż 8 znaków", () => {
    expect(validateNewPassword("ab12")).toMatch(/co najmniej 8/);
  });

  it("odrzuca hasło bez cyfry lub bez litery", () => {
    expect(validateNewPassword("samoliterki")).toMatch(/literę i.*cyfrę/);
    expect(validateNewPassword("12345678")).toMatch(/literę i.*cyfrę/);
  });
});
