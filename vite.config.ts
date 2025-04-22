import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8', 
      reporter: ['text', 'json', 'html'], 
    },
  },

  build: {
    sourcemap: true
  }
});