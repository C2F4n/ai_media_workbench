const { test, expect } = require('@playwright/test');
const { postAuth } = require('./helpers/auth-api.cjs');

test('missing SMTP configuration closes registration at the API', async ({ page }) => {
  const result = await (await page.request.get('/api/system/capabilities')).json();
  test.skip(result.data.registration, 'Run this check with real mail disabled.');
  const response = await postAuth(page.request, 'registration-email-code', { email: 'closed@example.com' });
  expect(response.status()).toBe(503);
  expect(['REGISTRATION_DISABLED', 'EMAIL_DELIVERY_UNAVAILABLE']).toContain((await response.json()).code);
});
