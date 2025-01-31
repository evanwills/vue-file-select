import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import wasm from 'vite-plugin-wasm';
// import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // One (or both) of these plugins is breaking the dev server.
    // wasm(),
    // topLevelAwait(),
  ],
  server: {
    port: 3917,
  }
})
