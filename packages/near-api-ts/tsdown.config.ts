import { defineConfig } from 'tsdown';

// Each target builds into its own outDir. With a shared `dist` the unbundled
// node/browser builds emit their own chunks of `universal/**` into
// `dist/universal`, overwriting the universal build's entry files.
export default defineConfig([
  {
    entry: {
      index: 'universal/index.ts',
    },
    root: 'universal',
    platform: 'neutral',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist/universal',
    dts: true,
    sourcemap: true,
    unbundle: true,
  },
  {
    entry: {
      index: 'node/index.ts',
    },
    root: 'node',
    platform: 'node',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist/node',
    dts: true,
    sourcemap: true,
    unbundle: true,
  },
  {
    entry: {
      index: 'browser/index.ts',
    },
    root: 'browser',
    platform: 'browser',
    target: 'esnext',
    format: ['esm'],
    outDir: 'dist/browser',
    dts: true,
    sourcemap: true,
    unbundle: true,
  },
]);