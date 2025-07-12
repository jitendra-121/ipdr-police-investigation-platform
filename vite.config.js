import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    // Define global variables for browser compatibility
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    // Include Neo4j driver for browser optimization
    include: ['neo4j-driver']
  }
})
