import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test('has title', async ({ page }: { page: Page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring that references the assistant view.
  expect(await page.locator('h1').innerText()).toContain('assistant');
});
