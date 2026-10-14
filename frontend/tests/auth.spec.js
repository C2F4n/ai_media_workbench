const { test, expect } = require('@playwright/test');
const crypto = require('node:crypto');

const passphrase = 'Browser-Testing-Passphrase-2026!';
const username = () => 'ui_' + crypto.randomBytes(6).toString('hex');

async function register(page, account) {
  await page.goto('/');
  await page.getByRole('tab', { name: '注册', exact: true }).click();
  await page.locator('#register-username').fill(account);
  await page.locator('#register-email').fill(account + '@example.com');
  await page.locator('#register-name').fill('测试创作者');
  await page.locator('#register-password').fill(passphrase);
  await page.locator('#register-confirm-password').fill(passphrase);
  await page.getByRole('button', { name: '创建账户', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('注册成功，请登录。');
}

async function login(page, account, password = passphrase) {
  await page.locator('#login-username').fill(account);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#account-view')).toBeVisible();
}

async function deleteAccount(page, account, password = passphrase) {
  await page.getByRole('button', { name: '注销账号', exact: true }).click();
  await page.locator('#delete-password').fill(password);
  await page.locator('#delete-username').fill(account);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('账号已注销。');
}

test('registration, token validation, reload, logout and account deletion', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const account = username();
  await register(page, account);
  await page.locator('#login-password').fill('Wrong-browser-passphrase!');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  await page.locator('#remember-me').check();
  await login(page, account);
  const cookie = (await context.cookies()).find((item) => item.name === 'AMW_SESSION');
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Lax');
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000);
  await page.reload();
  await expect(page.locator('#profile-username')).toHaveText(account);
  expect(await page.evaluate(() => document.cookie.includes('AMW_SESSION'))).toBe(false);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('button', { name: '退出登录', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('已退出登录。');
  const unauthorized = await context.request.get('/api/users/me');
  expect(unauthorized.status()).toBe(401);
  await login(page, account);
  await page.getByRole('button', { name: '注销账号', exact: true }).click();
  await page.locator('#delete-password').fill('Wrong-browser-passphrase!');
  await page.locator('#delete-username').fill(account);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#delete-error')).toHaveText('当前密码不正确。');
  await page.locator('#delete-password').fill(passphrase);
  await page.getByRole('button', { name: '确认注销', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('账号已注销。');
  await page.locator('#login-username').fill(account);
  await page.locator('#login-password').fill(passphrase);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  expect(errors).toEqual([]);
});

test('second-device token is revoked by password change', async ({ page, browser }) => {
  const account = username();
  await register(page, account);
  await login(page, account);
  const other = await browser.newContext({ baseURL: new URL(page.url()).origin });
  const second = await other.newPage();
  await second.goto('/');
  await login(second, account);
  const next = 'Updated-Browser-Passphrase-2026!';
  await page.locator('#current-password').fill(passphrase);
  await page.locator('#new-password').fill(next);
  await page.locator('#confirm-new-password').fill(next);
  await page.getByRole('button', { name: '修改密码', exact: true }).click();
  await expect(page.locator('#auth-notice')).toHaveText('密码已修改，请重新登录。');
  expect((await other.request.get('/api/users/me')).status()).toBe(401);
  await page.locator('#login-username').fill(account);
  await page.locator('#login-password').fill(passphrase);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#login-error')).toHaveText('用户名或密码不正确。');
  await login(page, account, next);
  await deleteAccount(page, account, next);
  await other.close();
});

test('desktop and mobile pages have assets and no horizontal overflow', async ({ page, context }, testInfo) => {
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#auth-view')).toBeVisible();
    await expect(page.locator('.brand img')).toBeVisible();
    expect(await page.locator('.brand img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await page.locator('.brand svg').count()).toBe(0);
    expect(await page.locator('.password-toggle svg').count()).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('login-' + viewport.width + '.png'), fullPage: true });
    await page.getByRole('tab', { name: '注册', exact: true }).click();
    await expect(page.locator('#register-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('register-' + viewport.width + '.png'), fullPage: true });
  }
  await context.addCookies([{ name: 'AMW_SESSION', value: 'dG90YWxseS1mYWtl', url: 'http://127.0.0.1:8088', httpOnly: true }]);
  await page.reload();
  await expect(page.locator('#auth-view')).toBeVisible();
  expect((await context.request.get('/api/users/me')).status()).toBe(401);
});

test('mobile account and deletion dialog fit the viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const account = username();
  await register(page, account);
  await login(page, account);
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
