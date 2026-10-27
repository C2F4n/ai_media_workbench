import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: fileURLToPath(new URL('../src/main/resources/static/assets/ui', import.meta.url)),
    emptyOutDir: true,
    license: { fileName: 'THIRD_PARTY_NOTICES.md' },
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'AmwUI',
      formats: ['iife'],
      fileName: () => 'components.js'
    },
    sourcemap: false
  },
  define: { __VUE_OPTIONS_API__: false, __VUE_PROD_DEVTOOLS__: false, 'process.env.NODE_ENV': '"production"' }
});
