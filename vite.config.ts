import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Laad alle omgevingsvariabelen (zowel lokaal als van Netlify)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Dit zorgt ervoor dat 'process.env.API_KEY' in de code wordt vervangen door de echte waarde
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  }
})