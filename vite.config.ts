import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting and caching
        manualChunks: {
          // React core (rarely changes, good for long-term caching)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI library (Radix components, frequently used)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-switch',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],

          // Form and validation (used in multiple pages)
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],

          // Charts and visualization (only used in Insights)
          'vendor-charts': ['recharts'],

          // Data fetching and state management
          'vendor-query': ['@tanstack/react-query'],

          // Supabase (database client)
          'vendor-supabase': ['@supabase/supabase-js'],

          // Utilities and helpers
          'vendor-utils': [
            'date-fns',
            'framer-motion',
            'lucide-react',
            'clsx',
            'tailwind-merge',
          ],

          // IndexedDB for local storage
          'vendor-idb': ['idb'],
        },
      },
    },
    // Increase chunk size warning limit (we're optimizing chunks manually)
    chunkSizeWarningLimit: 1000,
  },
}));
