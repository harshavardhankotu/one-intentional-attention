/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/one-intentional-attention/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  test: {
    setupFiles: ['./src/__tests__/setup.ts']
  }
});
