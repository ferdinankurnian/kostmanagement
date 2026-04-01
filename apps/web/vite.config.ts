import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        ws: true,
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
    }),
    tailwindcss(),
    react(),
  ],
});
