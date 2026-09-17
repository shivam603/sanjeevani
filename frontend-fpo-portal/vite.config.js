import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const fpoPort = Number(process.env.VITE_FPO_PORT || process.env.PORT || 3001);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kisancred/shared-ui': path.resolve(__dirname, '../packages/shared-ui/src'),
    },
  },
  server: {
    port: fpoPort,
    host: '0.0.0.0',
  },
  preview: {
    port: fpoPort,
    host: '0.0.0.0',
  },
});
