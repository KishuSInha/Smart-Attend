import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// import basicSsl from '@vitejs/plugin-basic-ssl'; // Removed for HTTP

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Removed plugins array modification for basicSsl
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  server: {
    host: "::", // Revert to previous host setting
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
