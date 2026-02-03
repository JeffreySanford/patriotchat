import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@patriotchat/shared': path.resolve(
        __dirname,
        '../../types/api.dto.ts',
      ) as string,
    },
  },
});
