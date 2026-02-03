import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['apps/frontend/src/**/*.spec.ts', 'apps/api/src/**/*.spec.ts'],
    setupFiles: ['apps/frontend/src/test-setup.ts'],
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
      '@': path.resolve(__dirname, './apps/frontend/src'),
    },
  },
});
