import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Run test files one at a time, not in parallel, so two integration
    // tests never try to start a sandbox node on the same port.
    fileParallelism: false,
  },
});
