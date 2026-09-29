import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true, // Allow ngrok-free.app, cloud tunnels, and custom hostnames
    cors: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
