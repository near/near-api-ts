import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      'universal/index': 'universal/index.ts',
    },
    platform: 'neutral',
    target: 'es2024',
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
    target: 'node24',
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
    target: 'es2024',
    format: ['esm'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    splitting: false,
    clean: true,
  },
]);
