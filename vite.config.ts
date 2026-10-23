import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? "/",
  plugins: [
    // SPA mode: the app renders entirely on the client from a static shell.
    tanstackStart({ spa: { enabled: true, prerender: { outputPath: "/index.html" } } }),
    react(),
  ],
});
