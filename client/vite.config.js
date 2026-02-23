import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync('../crts/localhost-key.pem'),
      cert: fs.readFileSync('../crts/localhost.pem'),
    },
    port: 5173
  }
})
