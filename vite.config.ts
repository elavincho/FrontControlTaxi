// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { defineConfig } from 'vite';

// export default defineConfig(() => {
//   return {
//     plugins: [react(), tailwindcss()],
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, '.'),
//       },
//     },
//     server: {
//       // HMR is disabled in AI Studio via DISABLE_HMR env var.
//       // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
//       hmr: process.env.DISABLE_HMR !== 'true',
//       // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
//       watch: process.env.DISABLE_HMR === 'true' ? null : {},
//     },
//   };
// });

// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { defineConfig } from 'vite';

// export default defineConfig(() => {
//   return {
//     plugins: [react(), tailwindcss()],
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, '.'),
//         '@components': path.resolve(__dirname, './src/components'),
//         '@utils': path.resolve(__dirname, './src/utils'),
//         '@types': path.resolve(__dirname, './src/types'),
//       },
//     },
//     // ✅ IMPORTANTE: Asegura que public se copie correctamente
//     publicDir: 'public',
//     build: {
//       // ✅ Configuración para producción
//       outDir: 'dist',
//       assetsDir: 'assets',
//       // ✅ Asegura que los archivos estáticos se copien
//       rollupOptions: {
//         output: {
//           assetFileNames: 'assets/[name].[hash].[ext]',
//         },
//       },
//       // ✅ Mejora el rendimiento del build
//       minify: 'terser',
//       terserOptions: {
//         compress: {
//           drop_console: process.env.NODE_ENV === 'production',
//           drop_debugger: true,
//         },
//       },
//     },
//     server: {
//       // HMR is disabled in AI Studio via DISABLE_HMR env var.
//       // Do not modify—file watching is disabled to prevent flickering during agent edits.
//       hmr: process.env.DISABLE_HMR !== 'true',
//       // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
//       watch: process.env.DISABLE_HMR === 'true' ? null : {},
//       // ✅ Configuración para desarrollo
//       port: 5173,
//       open: false,
//     },
//     // ✅ Configuración para preview (producción local)
//     preview: {
//       port: 4173,
//       open: false,
//     },
//     // ✅ Define variables de entorno disponibles
//     define: {
//       __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
//     },
//   };
// });

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Configuración directa sin función
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
    open: false,
  },
});