import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ai-tutor/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
'/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
});
