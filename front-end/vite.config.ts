import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; 

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@assets': '/src/assets' 
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.188:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
