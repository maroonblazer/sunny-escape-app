import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub Pages project path (the repo name) for the
// production build, but stay at root for local dev/preview.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sunny-escape-app/' : '/',
  plugins: [react()],
}))
