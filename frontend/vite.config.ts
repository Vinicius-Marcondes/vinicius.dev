import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const parseAllowedHosts = (value: string | undefined) =>
  value
    ?.split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0) ?? []

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: parseAllowedHosts(process.env.FRONTEND_DEV_ALLOWED_HOSTS),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
      '/media/photos': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
