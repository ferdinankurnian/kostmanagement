import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],
});
