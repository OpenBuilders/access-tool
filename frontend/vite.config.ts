import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  base: "/vite/",
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
      '@hooks': path.resolve(__dirname, './src/common/hooks'),
      '@utils': path.resolve(__dirname, './src/common/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/common/types'),
      '@styles': path.resolve(__dirname, './src/common/styles'),
      '@config': path.resolve(__dirname, './src/config'),
      '@services': path.resolve(__dirname, './src/services'),
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
