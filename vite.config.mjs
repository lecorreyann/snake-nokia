import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': path.resolve('./node_modules/react-native-web'),
      'react-native-safe-area-context': path.resolve('./src/web/SafeAreaContext.jsx'),
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js'],
  },
  optimizeDeps: {
    include: ['react-native-web'],
    exclude: ['react-native'],
  },
  define: {
    __DEV__: JSON.stringify(true),
    global: 'window',
  },
});
