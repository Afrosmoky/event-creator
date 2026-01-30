import { defineConfig } from 'vite';

import Solid from 'vite-plugin-solid';
import Inspect from 'vite-plugin-inspect';
import solidSvg from 'vite-plugin-solid-svg';
import TailwindCSS from '@tailwindcss/vite';

import path from 'node:path';

export default defineConfig({
        base: '/svg-editor/',
        plugins: [
                TailwindCSS(),
                Solid(),
                solidSvg({
                        defaultAsComponent: false
                }),
                Inspect(),
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
                port: 5147,
                allowedHosts: ['s28.d2.cdn-eu.null-force.com'],
        },
});
