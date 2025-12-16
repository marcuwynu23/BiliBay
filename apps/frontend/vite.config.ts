import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:4000",
    },
    allowedHosts: [
      "test.marcuwynu.space"
    ]
  },
});
