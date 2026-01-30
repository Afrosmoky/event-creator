import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import devtools from 'solid-devtools/vite';

import solidSvg from 'vite-plugin-solid-svg';
import path from 'node:path';

export default defineConfig({
    base: '/svg-editor/',
    plugins: [
        devtools(),
        solidPlugin(),
        solidSvg({
            defaultAsComponent: false
        }),
        tailwindcss(),
    ],
    build: {
        minify: false,
        cssMinify: false,
        sourcemap: false,
        target: 'esnext',
        modulePreload: {
            polyfill: false,
        },
        rollupOptions: {
            output: {
                format: 'esm',
                entryFileNames: '[hash:21].js',
                chunkFileNames: '[hash:21].js',
                assetFileNames: '[hash:21].[ext]',
                hashCharacters: 'hex',
            },
        },
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/assets/': path.resolve(__dirname, './assets')
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5147
    },
});
