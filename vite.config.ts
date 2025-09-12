import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      util: 'util',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      url: 'url',
      zlib: 'browserify-zlib',
      http: 'stream-http',
      https: 'https-browserify',
      assert: 'assert',
      os: 'os-browserify',
      path: 'path-browserify',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {
          buffer: 'Buffer'
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'wagmi', 
      '@web3modal/ethereum',
      '@web3modal/react',
      'buffer',
      'util'
    ],
  },
})