import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                app: resolve(__dirname, 'app/index.html'),
                auth: resolve(__dirname, 'auth/index.html'),
            },
        },
    },
    plugins: [react()],
});