import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths'
import glslify from 'rollup-plugin-glslify';

export default defineConfig({
  plugins: [
    solidPlugin(),
    tsconfigPaths(),
    glslify({
      "transform": ["glslify-import"],
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
