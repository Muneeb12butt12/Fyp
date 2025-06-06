import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: [
    '**/*.PNG',
    '**/*.png',
    '**/*.JPG',
    '**/*.jpg',
    '**/*.JPEG',
    '**/*.jpeg',
    '**/*.svg',
    '**/*.gif',
    '**/*.webp'
  ],
  server: {
    proxy: {
      // API requests
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        
      },
      // Socket.IO requests
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600, // in kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor modules into separate chunk
          vendor: ['react', 'react-dom', 'socket.io-client'],
          // Split Material-UI modules
          mui: [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
        },
      },
    },
  },
});