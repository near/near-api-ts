import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      'universal/index': 'universal/index.ts',
    },
    platform: 'neutral',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
  },
  {
    entry: {
      'node/index': 'node/index.ts',
    },
    platform: 'node',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
  },
  {
    entry: {
      'browser/index': 'browser/index.ts',
    },
    platform: 'browser',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
  },
]);
