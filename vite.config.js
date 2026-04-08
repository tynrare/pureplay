import { defineConfig } from "vite";
import plugin_pug from "vite-plugin-pug";
import basicSsl from "@vitejs/plugin-basic-ssl";
import legacy from "@vitejs/plugin-legacy";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  publicDir: "res",
  base: "./",
  plugins: [
    //basicSsl(),
    plugin_pug({ pretty: false }, { name: "pureplay" }),
    legacy({
      targets: ["baseline widely available"],
      modernPolyfills: true,
      renderLegacyChunks: false,
      renderModernChunks: true,
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: "vendor",
              test: /node_modules/,
              priority: 2,
            },
            {
              name: 'app',
              test: /src/,
              priority: 1,
              minSize: 100000,
              maxSize: 500000
            },
          ],
        },
      },
    },
  },
  devtools: false,
  //...
});
