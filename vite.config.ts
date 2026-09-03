import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    fs: {
      strict: false,
      allow: ['..'],
    },
    watch: {
      ignored: [
        '**/android/**',
        '**/.git/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/*.sqlite*',
        '**/.env*',
      ],
    },
  },
});
