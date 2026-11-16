import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mimiDocs } from "@popcornt/mimi/vite";
export default defineConfig({
  plugins: [
    react(),
    mimiDocs({
      contentDir: "../education/content",
      configPath: "../education/docs.config.json",
    }),
  ],
});
