import { defineConfig, type WxtViteConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["bookmarks"],
  },

  vite: () =>
    ({
      plugins: [tailwindcss()],
      esbuild: {
        drop: ["console", "debugger"],
      },
    } as WxtViteConfig),
});
