const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

for (const width of [1365, 390]) test(`mail failures allow retry and only successful sends start the short countdown at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 }); await serveStatic(page); await page.clock.install();
  let sends = 0;
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const respond = (data, status = 200, code = 'SUCCESS', headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ code, message: code, data, details: [] }) });
    if (path === '/api/system/capabilities') return respond({ registration: true, emailVerification: true, maxUploadBytes: 1073741824, maxDurationMs: 900000, supportedOperations: [], asrProviders: [] });
    if (path === '/api/auth/csrf') return respond({ token: 'fixture', headerName: 'X-CSRF-Token' });
    if (path === '/api/users/me') return respond(null, 401, 'UNAUTHENTICATED');
    if (path === '/api/auth/registration-email-code') {
      sends++;
      if (sends < 3) return respond(null, 503, 'EMAIL_DELIVERY_UNAVAILABLE');
      if (sends === 3) return respond({ challengeId: '33333333-3333-4333-8333-333333333333', expiresAt: new Date(Date.now() + 600000).toISOString() });
      return respond(null, 429, 'RATE_LIMITED', { 'Retry-After': '8' });
    }
    throw new Error('Unexpected request: ' + path);
  });
  await page.goto('/'); await page.getByRole('tab', { name: '注册', exact: true }).click();
  await page.locator('#register-email').fill('owner@example.com');
  for (let i = 0; i < 2; i++) {
    await page.locator('#send-email-code').click();
    await expect(page.locator('#register-error')).toContainText('验证邮件暂时无法发送');
    await expect(page.locator('#send-email-code')).toBeEnabled();
    await expect(page.locator('#email-code-label')).toHaveText('发送验证码');
    await expect(page.locator('#email-code-notice')).toBeHidden();
  }
  expect(sends).toBe(2);
  await page.locator('#send-email-code').click();
  await expect(page.locator('#email-code-notice')).toBeVisible(); await expect(page.locator('#email-code-label')).toHaveText('20秒后重发');
  await expect(page.locator('#send-email-code')).toBeDisabled(); expect(sends).toBe(3);
  await page.clock.fastForward(21000); await expect(page.locator('#send-email-code')).toBeEnabled();
  await page.locator('#send-email-code').click(); await expect(page.locator('#register-error')).toContainText('8秒后重试');
  await expect(page.locator('#email-code-label')).toHaveText('8秒后重发');
  await page.clock.fastForward(9000); await expect(page.locator('#send-email-code')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
