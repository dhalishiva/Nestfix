import { test, expect } from '@playwright/test';

test('Nestfix shell is navigable and theme toggle works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /home care,/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nestfix home' })).toHaveAttribute('href', '/');
  const button = page.getByRole('button', { name: /use (light|dark) theme/i });
  await expect(button).toBeVisible();
  const initial = await page.locator('html').getAttribute('class');
  await button.click();
  await expect.poll(async () => page.locator('html').getAttribute('class')).not.toBe(initial);
  await expect(page.getByRole('heading', { name: /a service experience/i })).toBeVisible();
});

test('Health endpoint identifies the phase', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toMatchObject({ ok: true, app: 'nestfix', phase: 1 });
});
