const { test, expect } = require('@playwright/test');
const crypto = require('node:crypto');
const { postAuth, login } = require('./helpers/auth-api.cjs');

const passphrase = 'Br2026';
const username = () => 'ui_' + crypto.randomBytes(6).toString('hex');

async function register(page, account) {
  if (!process.env.TEST_MAILBOX_URL) throw new Error('Set TEST_MAILBOX_URL to the loopback test SMTP inbox; never bypass email verification.');
  const email = account + '@example.com';
  const delivery = await postAuth(page.request, 'registration-email-code', { email });
  expect(delivery.status()).toBe(200);
  const { challengeId } = (await delivery.json()).data;
  const mailbox = await page.request.get(process.env.TEST_MAILBOX_URL + '/messages?email=' + encodeURIComponent(email));
  expect(mailbox.ok()).toBe(true);
  const { code } = await mailbox.json();
  const body = { username: account, email, emailChallengeId: challengeId, emailCode: code, password: passphrase, displayName: '测试创作者' };
  const wrongCode = await postAuth(page.request, 'register', { ...body, emailCode: code === '000000' ? '000001' : '000000' });
  expect((await wrongCode.json()).code).toBe('EMAIL_VERIFICATION_INVALID');
  for (const rejected of ['Ab12!', 'Abcd1234Efgh56789']) {
    const response = await postAuth(page.request, 'register', { ...body, password: rejected });
    expect((await response.json()).code).toBe('INVALID_PARAMETERS');
  }
  expect((await postAuth(page.request, 'register', body)).status()).toBe(201);
}

async function expectInvalidLogin(page, username, password) {
  const response = await postAuth(page.request, 'login', { username, password });
  expect(response.status()).toBe(401);
  expect((await response.json()).code).toBe('INVALID_CREDENTIALS');
}

async function deleteAccount(page, account, password = passphrase) {
  await openAccount(page);
  await page.getByRole('button', { name: '注销账号', exact: true }).click();
  await page.locator('#delete-password').fill(password);
  await page.locator('#delete-username').fill(account);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('账号已注销。');
}

async function openAccount(page) {
  await page.locator('#workspace-home-sidebar').getByRole('button', { name: '设置', exact: true }).click();
}

test('the new phone forms register by email, then log in and start a workbench session', async ({ page }) => {
  const account = username();
  const email = account + '@example.com';
  await page.goto('/');
  await page.locator('#register-tab').click();
  await page.locator('#register-username').fill(account);
  await page.locator('#register-email').fill(email);
  await page.locator('#send-email-code').click();
  await expect(page.locator('#register-form [role=status]')).toContainText('验证码已发送');
  const mailbox = await page.request.get(process.env.TEST_MAILBOX_URL + '/messages?email=' + encodeURIComponent(email));
  expect(mailbox.ok()).toBe(true);
  await page.locator('#register-code').fill((await mailbox.json()).code);
  await page.locator('#register-password').fill(passphrase);
  await page.locator('#register-confirmation').fill(passphrase);
  await page.locator('#register-form button[type=submit]').click();
  await expect(page.locator('#login-username')).toHaveValue(account);
  await page.locator('#login-password').fill(passphrase);
  await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('#workspace-home-overview')).toBeVisible();
  await deleteAccount(page, account);
});

test('registration, token validation, reload, logout and account deletion', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = username();
  await register(page, account);
  await expectInvalidLogin(page, account, 'Wrong-browser-passphrase!');
  await login(page, account, passphrase, true);
  const cookie = (await context.cookies()).find((item) => item.name === 'AMW_SESSION');
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Lax');
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000);
  await page.reload();
  await expect(page.locator('#profile-username')).toHaveText(account);
  expect(await page.evaluate(() => document.cookie.includes('AMW_SESSION'))).toBe(false);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('button', { name: '退出登录', exact: true }).click();
  await expect(page.locator('#auth-view')).toBeVisible();
  await expect(page.locator('#auth-notice')).toBeHidden();
  const unauthorized = await context.request.get('/api/users/me');
  expect(unauthorized.status()).toBe(401);
  await login(page, account, passphrase);
  await openAccount(page);
  await page.getByRole('button', { name: '注销账号', exact: true }).click();
  await page.locator('#delete-password').fill('Wrong-browser-passphrase!');
  await page.locator('#delete-username').fill(account);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#delete-error')).toHaveText('当前密码不正确。');
  await page.locator('#delete-password').fill(passphrase);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('账号已注销。');
  await expectInvalidLogin(page, account, passphrase);
  expect(errors).toEqual([]);
});

test('second-device token is revoked by password change', async ({ page, browser }) => {
  const account = username();
  await register(page, account);
  await login(page, account, passphrase);
  const other = await browser.newContext({ baseURL: new URL(page.url()).origin });
  const second = await other.newPage();
  await second.goto('/');
  await login(second, account, passphrase);
  const next = 'UpdatedPass2026!';
  await openAccount(page);
  await page.locator('#current-password').fill(passphrase);
  await page.locator('#new-password').fill(next);
  await page.locator('#confirm-new-password').fill(next);
  await page.getByRole('button', { name: '修改密码', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('密码已修改，请重新登录。');
  expect((await other.request.get('/api/users/me')).status()).toBe(401);
  await expectInvalidLogin(page, account, passphrase);
  await login(page, account, next);
  await deleteAccount(page, account, next);
  await other.close();
});

test('desktop and mobile pages have assets and no horizontal overflow', async ({ page, context }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#auth-view')).toBeVisible();
    const matrix = page.locator('.auth-matrix-trail');
    await expect(matrix).toBeVisible();
    await expect.poll(() => matrix.evaluate(canvas => canvas.height)).toBeGreaterThan(300);
    await expect(page.locator('#home-tab')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#login-tab').click();
    await expect(page.locator('#login-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('login-' + viewport.width + '.png'), fullPage: true });
    await page.getByRole('tab', { name: '注册', exact: true }).click();
    await expect(page.locator('#register-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('register-' + viewport.width + '.png'), fullPage: true });
  }
  await context.addCookies([{ name: 'AMW_SESSION', value: 'dG90YWxseS1mYWtl', url: new URL(page.url()).origin, httpOnly: true }]);
  await page.reload();
  await expect(page.locator('#auth-view')).toBeVisible();
  expect((await context.request.get('/api/users/me')).status()).toBe(401);
});

test('mobile account and deletion dialog fit the viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const account = username();
  await register(page, account);
  await login(page, account, passphrase);
  await openAccount(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('account-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '注销账号', exact: true }).click();
  const bounds = await page.locator('#delete-dialog').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath('delete-mobile.png'), fullPage: true });
  await page.locator('#delete-password').fill(passphrase);
  await page.locator('#delete-username').fill(account);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('账号已注销。');
});

test('JSON success, empty success and security failures share the Result contract', async ({ context }) => {
  const checks = [
    [await context.request.get('/api/system/capabilities'), 200, 'SUCCESS'],
    [await context.request.get('/api/users/me'), 401, 'UNAUTHENTICATED'],
    [await context.request.post('/api/auth/login', { data: { username: username(), password: passphrase } }), 403, 'CSRF_INVALID'],
    [await context.request.post('/api/auth/logout'), 200, 'SUCCESS']
  ];
  for (const [response, status, code] of checks) {
    expect(response.status()).toBe(status);
    const result = await response.json();
    expect(Object.keys(result).sort()).toEqual(['code', 'data', 'details', 'message', 'requestId']);
    expect(result.code).toBe(code);
    expect(result.requestId).toBe(response.headers()['x-request-id']);
    expect(result.details).toEqual([]);
    if (status !== 200 || response.url().endsWith('/logout')) expect(result.data).toBeNull();
    else expect(result.data.registration).toBe(true);
  }
});
