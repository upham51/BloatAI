import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function assetSizeBudgetPlugin(options?: {
  /** Directories (relative to repo root) to scan for static assets. */
  includeDirs?: string[];
  /** Budget rules (first match wins). */
  budgets?: Array<{ test: RegExp; maxBytes: number; label: string }>;
}) {
  const includeDirs = options?.includeDirs ?? ["public/assets"];
  const budgets =
    options?.budgets ??
    [
      { test: /\.mp4$/i, maxBytes: 3_000_000, label: "MP4 video" },
      { test: /\.(webp|png|jpe?g|gif)$/i, maxBytes: 1_500_000, label: "Image" },
      { test: /\.svg$/i, maxBytes: 300_000, label: "SVG" },
    ];

  const walk = (dir: string): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results = results.concat(walk(full));
      else if (entry.isFile()) results.push(full);
    }
    return results;
  };

  return {
    name: "asset-size-budget",
    apply: "build" as const,
    buildStart() {
      const over: Array<{ file: string; size: number; budget: (typeof budgets)[number] }> = [];

      for (const relDir of includeDirs) {
        const absDir = path.resolve(__dirname, relDir);
        for (const file of walk(absDir)) {
          const rule = budgets.find((b) => b.test.test(file));
          if (!rule) continue;

          const size = fs.statSync(file).size;
          if (size > rule.maxBytes) {
            over.push({ file, size, budget: rule });
          }
        }
      }

      if (over.length) {
        const lines = over
          .sort((a, b) => b.size - a.size)
          .map((o) => {
            const rel = path.relative(__dirname, o.file);
            const sizeMb = (o.size / 1_000_000).toFixed(2);
            const maxMb = (o.budget.maxBytes / 1_000_000).toFixed(2);
            return `- ${rel}: ${sizeMb}MB (max ${maxMb}MB for ${o.budget.label})`;
          })
          .join("\n");

        throw new Error(
          `Asset size budget exceeded. Please compress/resize these files before shipping:\n${lines}\n\nTip: for MP4 (target ~300x300): ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset slow -vf scale=300:300 output.mp4`
        );
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    assetSizeBudgetPlugin(),
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
