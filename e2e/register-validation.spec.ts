import { test, expect } from "@playwright/test";

// Weryfikuje serwerową walidację siły hasła (validateNewPassword) bez dotykania
// Supabase — przy błędach walidacji akcja zwraca błąd PRZED wywołaniem signUp.
test.describe("Rejestracja — walidacja po stronie serwera", () => {
  test("odrzuca zbyt słabe hasło i pokazuje błąd pola", async ({ page }) => {
    await page.goto("/register");

    await page.locator("#email").fill("nowy.uzytkownik@example.com");
    await page.locator("#username").fill("typer2026");
    // 7 cyfr: przechodzi natywne minLength=6, ale łamie politykę serwera (>=8 + litera).
    await page.locator("#password").fill("1234567");

    await page.getByRole("button", { name: "Utwórz konto" }).click();

    await expect(page.getByText(/co najmniej 8 znaków/i)).toBeVisible();
    // Nie powinno dojść do przekierowania na /verify-email ani na /.
    await expect(page).toHaveURL(/\/register/);
  });
});
