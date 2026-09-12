import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kisancred/shared-ui': path.resolve(__dirname, '../packages/shared-ui/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
