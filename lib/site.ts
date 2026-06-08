function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Automatyczny fallback na produkcyjną domenę Vercela, gdy zmienna nie jest ustawiona.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Typer MŚ 2026";
export const SITE_DESCRIPTION =
  "Typuj wyniki Mistrzostw Świata 2026 i rywalizuj ze znajomymi w prywatnych ligach.";
