import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const farmPort = Number(process.env.VITE_FARMER_PORT || process.env.PORT || 3000);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@kisancred/shared-ui': path.resolve(__dirname, '../packages/shared-ui/src'),
    },
  },
  server: {
    port: farmPort,
    host: '0.0.0.0',
  },
  preview: {
    port: farmPort,
    host: '0.0.0.0',
  },
});
