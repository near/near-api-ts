import resolve from '@rollup/plugin-node-resolve';
import { visualizer } from 'rollup-plugin-visualizer';
import terser from '@rollup/plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip'

export default {
  input: 'src/index.js',
  output: {
    file: 'public/bundle.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    terser(),
    gzipPlugin(),
    visualizer({
      emitFile: true,
      gzipSize: true,
      minify: true,
      filename: 'stats.html',
    }),
  ],
};
