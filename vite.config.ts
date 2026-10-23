import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // SPA mode: the app renders entirely on the client from a static shell.
    tanstackStart({ spa: { enabled: true } }),
    react(),
  ],
});
