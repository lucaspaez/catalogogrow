import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.config.js',
                'dist/',
                'api/',
            ],
            // Umbrales de cobertura según reglas
            lines: 80,
            functions: 80,
            branches: 80,
            statements: 80,
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
