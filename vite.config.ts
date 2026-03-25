import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root, '')

  /** Proxy target — must match backend `server.port` (default 8080). */
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8080'
  const port = Number(env.VITE_DEV_PORT || 5173)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)

  const apiProxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    server: {
      port,
      host: env.VITE_DEV_HOST === '1' || env.VITE_DEV_HOST === 'true',
      proxy: apiProxy,
    },
    preview: {
      port: previewPort,
      proxy: apiProxy,
    },
  }
})
