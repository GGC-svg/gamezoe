import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/games': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/get_serverinfo': {
          target: 'http://localhost:4002',
          changeOrigin: true
        },
        '/get_user_status': {
          target: 'http://localhost:4002',
          changeOrigin: true
        },
        '/get_message': {
          target: 'http://localhost:4002',
          changeOrigin: true
        },
        '/guest': {
          target: 'http://localhost:4002',
          changeOrigin: true
        },
        '/login': {
          target: 'http://localhost:4002',
          changeOrigin: true
        },
        '/myfish_socket': {
          target: 'ws://localhost:9001',
          changeOrigin: true,
          ws: true
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
