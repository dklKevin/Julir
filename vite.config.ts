/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Base public path
    base: env.VITE_BASE_URL || '/',

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      strictPort: false,
      open: true,
      cors: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      strictPort: false,
    },

    // Build configuration for production
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,

      // Terser options for aggressive minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug'] : [],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },

      // Rollup options for code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React
            'react-vendor': ['react', 'react-dom'],
            // Icons chunk
            'icons': ['lucide-react'],
          },
          // Asset file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },

      // Increase chunk size warning limit
      chunkSizeWarningLimit: 500,

      // Target modern browsers
      target: 'es2020',

      // CSS code splitting
      cssCodeSplit: true,

      // Report compressed size
      reportCompressedSize: true,
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@services': resolve(__dirname, './src/services'),
        '@constants': resolve(__dirname, './src/constants'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
      },
    },

    // CSS configuration
    css: {
      devSourcemap: true,
      postcss: './postcss.config.js',
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '2.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Optimization for dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: [],
    },

    // Test configuration (Vitest)
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'json', 'html', 'lcov', 'cobertura'],
        reportsDirectory: './coverage',
        exclude: [
          'node_modules/',
          'dist/',
          'src/test/',
          'src/main.tsx',
          '**/*.d.ts',
          '**/*.config.*',
          '**/index.ts',
          '**/*.stories.{ts,tsx}',
          '**/*.mock.{ts,tsx}',
        ],
        // Thresholds match current measured coverage; raise as tests expand
        thresholds: {
          statements: 54,
          branches: 50,
          functions: 40,
          lines: 54,
        },
        // Watermarks for color-coded output
        watermarks: {
          statements: [50, 80],
          branches: [50, 80],
          functions: [50, 80],
          lines: [50, 80],
        },
        // Clean coverage directory before running
        clean: true,
        // Include all source files (even untested ones)
        all: true,
        // Source files to include
        include: ['src/**/*.{ts,tsx}'],
      },
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist'],
    },
  }
})
