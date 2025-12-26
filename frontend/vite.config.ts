import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [
        react({
            babel: {
                presets: ['@babel/preset-react', '@babel/preset-typescript'],
            },
        }),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    optimizeDeps: {
        exclude: ['@dnd-kit/sortable', '@dnd-kit/core'],
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
        },
        rollupOptions: {
            plugins: []
        }
    },

});
