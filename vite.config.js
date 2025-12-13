import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';

import Solid from 'vite-plugin-solid';
import NeodxSVG from '@neodx/svg/vite';
import Inspect from 'vite-plugin-inspect';
import TailwindCSS from '@tailwindcss/vite';

import { patchCssModules as PatchCssModules } from 'vite-css-modules';
import { optimizeCssModules as OptimizeCssModules } from 'vite-plugin-optimize-css-modules';

export default defineConfig({
        plugins: [
                PatchCssModules({
                        exportMode: 'named',
                        generateSourceTypes: true,
                }),
                NeodxSVG({
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
                }),
                OptimizeCssModules(),
                TailwindCSS(),
                Solid(),
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
                        '@': fileURLToPath(new URL('./src', import.meta.url)),
                },
        },
        server: {
                host: '0.0.0.0',
                port: 5147,
                allowedHosts: ['s28.d2.cdn-eu.null-force.com'],
        },
});
