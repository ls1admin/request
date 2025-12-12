import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { viteEnvs } from "vite-envs"
import { defineConfig } from "vite"
import packageJson from "./package.json"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteEnvs({ declarationFile: '.env.example' })],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
