import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['frontend/src/**/*.spec.ts', 'api/src/**/*.spec.ts'],
    setupFiles: ['frontend/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'frontend/src/test-setup.ts',
        '**/*.spec.ts',
        '**/dist',
        '**/out-tsc',
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@patriotchat/shared': path.resolve(__dirname, './libs/shared/src/index.ts'),
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
});
