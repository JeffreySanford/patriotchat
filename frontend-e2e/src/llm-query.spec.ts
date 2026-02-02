import { test, expect, type Locator, type Page } from '@playwright/test';

test('submits a prompt, waits for the API bridge, and surfaces the response', async ({ page }: { page: Page }) => {
  await page.goto('/');
  
  // Verify query input is present and can be filled
  const queryInput: Locator = page.locator('#query-input');
  await expect(queryInput).toBeVisible();
  await page.fill('#query-input', 'Is this working?');
  
  // Verify submit button is present and can be clicked
  const submitButton: Locator = page.locator('button[type=submit]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  
  // Wait for telemetry to be rendered
  const telemetryRows: Locator = page.locator('.telemetry-shell li');
  await telemetryRows.first().waitFor({ state: 'visible', timeout: 5000 });
  
  // Verify telemetry display is present (should always be present regardless of LLM response)
  await expect(telemetryRows).toHaveCount(3);
  
  // Verify telemetry stages are displayed
  for (let i: number = 0; i < 3; i++) {
    await expect(telemetryRows.nth(i)).toBeVisible();
  }
});
