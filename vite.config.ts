import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: 'public/_redirects',
        dest: '.', // Puts it at root of dist/
      },
    ],
  }),],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: 'public',
});
