import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      "/auth": "http://localhost:4000",
      "/diagnoses": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
