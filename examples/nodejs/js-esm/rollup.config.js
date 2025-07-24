import resolve from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  input: 'src/index.js',
  output: {
    file: 'public/bundle.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    visualizer({
      emitFile: true,
      filename: 'stats.html',
    }),
  ],
};
