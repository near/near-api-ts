import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  target: 'es2025',
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
});
