import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  define: {
    global: "globalThis", // ✅ Better global polyfill
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings during build
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.message.includes('sourcemap')) return;
        if (warning.message.includes('lucide-react')) return;
        
        warn(warning);
      }
    },
    sourcemap: false, // Disable sourcemaps to reduce warnings
  },
  server: {
    // Development proxy (localhost backend)
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
