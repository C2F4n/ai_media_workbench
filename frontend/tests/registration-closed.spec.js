const { test, expect } = require('@playwright/test');

test('missing SMTP configuration closes registration without hiding login', async ({ page }, testInfo) => {
  const result = await (await page.request.get('/api/system/capabilities')).json();
  test.skip(result.data.registration, 'Run this check with real mail disabled.');
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#login-username')).toBeEnabled();
    await page.getByRole('tab', { name: '注册', exact: true }).click();
    await expect(page.locator('#register-unavailable')).toBeVisible();
    await expect(page.locator('#send-email-code')).toBeDisabled();
    await expect(page.locator('#register-submit')).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('registration-closed-' + viewport.width + '.png'), fullPage: true });
  }
});
