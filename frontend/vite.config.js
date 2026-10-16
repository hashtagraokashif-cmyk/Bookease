import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Let phones and other devices on the same Wi-Fi open the site.
    host: true,
    // Pass /api requests on to the backend running on this computer, so other
    // devices only ever need to reach this one address.
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
  // `npm run preview` (testing the production build) uses the same settings.
  preview: {
    host: true,
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
})
