import { test, expect, type Locator, type Page, type Response } from '@playwright/test';

test('submits a prompt, waits for the API bridge, and surfaces the response', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await page.fill('#query-input', 'Is this working?');
  const responsePromise: Promise<Response> = page.waitForResponse(
    (response: Response) => response.url().includes('/api/query') && response.status() === 200,
  );
  await page.click('button[type=submit]');
  await responsePromise;
  const response: Locator = page.locator('.response-shell p');
  await expect(response).toBeVisible({ timeout: 15_000 });
  await expect(response).not.toBeEmpty();
  const telemetryRows: Locator = page.locator('.telemetry-shell li');
  await expect(telemetryRows).toHaveCount(3);
});
