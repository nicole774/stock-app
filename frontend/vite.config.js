import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // isole les dépendances volumineuses (recharts) dans un chunk séparé
        manualChunks: {
          recharts: ["recharts"],
        },
      },
    },
  },
});
