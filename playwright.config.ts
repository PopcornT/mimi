import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  use: { channel: process.env.CI ? undefined : "chrome", headless: true },
  workers: 1,
  webServer: [
    {
      command: "npm run dev -w @popcornt/mimi-embedded",
      url: "http://127.0.0.1:4316",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "node scripts/static-server.mjs examples/education/build/client 4317",
      url: "http://127.0.0.1:4317",
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        "node scripts/static-server.mjs examples/business/build/client 4318",
      url: "http://127.0.0.1:4318",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
