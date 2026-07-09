import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['**/*.test.ts'],
    // Integration tests start a sandbox node, so give tests and hooks
    // (beforeAll/beforeEach setup) plenty of time before timing out.
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
