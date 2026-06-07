import { test, expect } from "@playwright/test";

// Ścieżki chronione: niezalogowany użytkownik trafia na /login z parametrem next.
test.describe("Ochrona tras (middleware)", () => {
  test("przekierowuje niezalogowanego z /leagues na /login", async ({ page }) => {
    await page.goto("/leagues");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/next=%2Fleagues|next=\/leagues/);
  });

  test("przekierowuje niezalogowanego z /admin na /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("strona logowania pokazuje formularz", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("link", { name: "Zarejestruj się" })).toBeVisible();
  });
});
