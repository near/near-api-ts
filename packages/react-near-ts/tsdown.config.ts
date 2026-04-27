import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  target: 'esnext',
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
});
