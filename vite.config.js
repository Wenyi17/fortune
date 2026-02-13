import { defineConfig } from 'vite';

export default defineConfig({
  root: 'fortune',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'fortune/index.html',
        bazi: 'fortune/bazi.html',
        iching: 'fortune/iching.html',
        astrology: 'fortune/astrology.html',
        cezi: 'fortune/cezi.html',
        tarot: 'fortune/tarot.html',
      },
    },
  },
});
