import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  envDir: '..',
  plugins: [react()],
  server: { port: 5173 },
  build: { rollupOptions: { output: { manualChunks(id) {
    if (!id.includes('node_modules')) return undefined;
    if (id.includes('lucide-react')) return 'icons';
    if (id.includes('react-router')) return 'router';
    if (id.includes('axios')) return 'http';
    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react';
    return undefined;
  } } } },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.js', exclude: ['e2e/**', 'node_modules/**'] },
});
