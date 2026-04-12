import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['lucide-react', '@google/genai', 'sql.js'],
      exclude: ['firebase'],
    },
    // ✅ CAPACITOR: caminhos relativos para funcionar no WebView do Android
    base: './',
    css: {
      // ⚠️ Desativa Lightning CSS para evitar conflitos com @theme do Tailwind v4
      transformer: 'postcss',
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      cssMinify: false, // Evita minificação com Lightning CSS
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
