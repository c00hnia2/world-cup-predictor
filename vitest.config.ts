import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Domyślnie środowisko Node (testy czystej logiki w lib/).
    // Testy komponentów React dodają na górze pliku dyrektywę:
    //   // @vitest-environment jsdom
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    // e2e/ należy do Playwrighta — Vitest nie może próbować go uruchamiać.
    exclude: ["node_modules", ".next", "e2e/**"],
  },
});
