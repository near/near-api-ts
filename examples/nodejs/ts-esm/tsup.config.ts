import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: false,
  dts: false,
  treeshake: 'recommended',
  minify: false,
});
