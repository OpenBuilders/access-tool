import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 400,
    cssMinify: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@pages': path.resolve(__dirname, './src/pages'),
      '@common': path.resolve(__dirname, './src/common'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@routes': path.resolve(__dirname, './src/Routes'),
    },
  },
  plugins: [
    react(),
    svgr(),
    splitVendorChunkPlugin(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
      include: ['events'],
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
