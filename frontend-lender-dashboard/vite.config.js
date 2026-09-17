import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const lenderPort = Number(process.env.VITE_LENDER_PORT || process.env.PORT || 3002);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kisancred/shared-ui': path.resolve(__dirname, '../packages/shared-ui/src'),
    },
  },
  server: {
    port: lenderPort,
    host: '0.0.0.0',
  },
  preview: {
    port: lenderPort,
    host: '0.0.0.0',
  },
});
