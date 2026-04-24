import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      'universal/index': 'universal/index.ts',
    },
    root: 'universal',
    platform: 'neutral',
    target: 'es2025',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
  },
  {
    entry: {
      'node/index': 'node/index.ts',
    },
    root: 'node',
    platform: 'node',
    target: 'es2025',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
  },
  {
    entry: {
      'browser/index': 'browser/index.ts',
    },
    root: 'browser',
    platform: 'browser',
    target: 'es2025',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
  },
]);
