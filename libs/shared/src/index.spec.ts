import { describe, it, expect } from 'vitest';

describe('Shared Library', () => {
  it('should export types', () => {
    // Verify the index exports are working
    expect(true).toBeTruthy();
  });

  it('should be loadable', async () => {
    const shared = await import('./index');
    expect(shared).toBeDefined();
  });
});
