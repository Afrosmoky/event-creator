import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';

import Solid from 'vite-plugin-solid';
import NeodxSVG from '@neodx/svg/vite';
import Inspect from 'vite-plugin-inspect';
import solidSvg from 'vite-plugin-solid-svg';
import TailwindCSS from '@tailwindcss/vite';

import { patchCssModules as PatchCssModules } from 'vite-css-modules';
import { optimizeCssModules as OptimizeCssModules } from 'vite-plugin-optimize-css-modules';
import path from 'node:path';

export default defineConfig({
        base: '/svg-editor/',
        plugins: [
                PatchCssModules({
                        exportMode: 'named',
                        generateSourceTypes: true,
                }),
                /*NeodxSVG({
                        root: 'assets',
                        output: 'public',
                        group: true,
                        optimize: true,
                        metadata: {
                                path: 'src/sprite.gen.ts',
                                runtime: {
                                        size: true,
                                        viewBox: true,
                                },
                        },
                }),*/
                OptimizeCssModules(),
                TailwindCSS(),
                Solid(),
                solidSvg({
                        defaultAsComponent: false
                }),
                Inspect(),
        ],
        css: {
                modules: {
                        localsConvention: 'camelCaseOnly',
                },
        },
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
