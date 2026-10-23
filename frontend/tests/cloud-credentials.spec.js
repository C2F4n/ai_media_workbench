const { test, expect } = require('@playwright/test');
const crypto = require('node:crypto');
const password = 'CloudTests-2026!';

async function csrf(context) { return (await (await context.request.get('/api/auth/csrf')).json()).data.token; }
async function account(page, context) {
  if (!process.env.TEST_MAILBOX_URL) throw new Error('TEST_MAILBOX_URL is required; use only the local test inbox.');
  const username = 'byok_' + crypto.randomBytes(5).toString('hex'), email = username + '@example.com';
  const headers = { 'X-CSRF-Token': await csrf(context) };
  const sent = await context.request.post('/api/auth/registration-email-code', { headers, data: { email } });
  expect(sent.status()).toBe(200);
  const challenge = (await sent.json()).data.challengeId;
  const code = (await (await context.request.get(process.env.TEST_MAILBOX_URL + '/messages?email=' + encodeURIComponent(email))).json()).code;
  expect((await context.request.post('/api/auth/register', { headers, data: { username, email, password, emailChallengeId: challenge, emailCode: code } })).status()).toBe(201);
  await page.goto('/');
  await page.locator('#login-username').fill(username); await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.locator('#workbench-panel')).toBeVisible();
  return username;
}
async function remove(context, username) {
  const response = await context.request.delete('/api/users/me', { headers: { 'X-CSRF-Token': await csrf(context) }, data: { currentPassword: password, confirmUsername: username } });
  expect(response.status()).toBe(200);
}
async function settings(page) {
  await page.locator('#header-account').click();
  await page.locator('#account-cloud-tab').click();
  await expect(page.locator('.cloud-provider')).toHaveCount(3);
}

test('personal credentials are private, never echoed, versioned and explicitly disabled on deletion', async ({ page, context, browser }, testInfo) => {
  test.setTimeout(60000);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  const username = await account(page, context);
  let second, otherName;
  try {
    await settings(page);
    for (const [provider, fields] of [
      ['tencent', { appId: '123456', secretId: 'OnlyFakeSecretId', secretKey: 'OnlyFakeSecretKey' }],
      ['aliyun', { apiKey: 'sk-fake-aliyun-browser', workspaceId: 'workspace-test' }],
      ['deepseek', { apiKey: 'sk-fake-deepseek-browser', model: 'deepseek-flash' }]
    ]) {
      await page.locator(provider === 'deepseek' ? '#cloud-text-tab' : '#cloud-speech-tab').click();
      const card = page.locator('#cloud-' + provider);
      await card.locator('select[name=mode]').selectOption('PERSONAL');
      for (const [key, value] of Object.entries(fields)) {
        if (key === 'model') await card.locator('select[name=model]').selectOption(value);
        else await card.locator('input[name="' + key + '"]').fill(value);
      }
      await card.getByRole('button', { name: /^保存/ }).click();
      await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
      for (const input of await card.locator('input[data-secret]').all()) await expect(input).toHaveValue('');
    }
    const result = await context.request.get('/api/users/me/cloud-credentials');
    expect(result.headers()['cache-control']).toBe('no-store');
    expect(await result.text()).not.toMatch(/OnlyFake|sk-fake|encryptedPayload|secretId|secretKey|apiKey/);
    expect((await (await context.request.get('/api/system/capabilities')).json()).data.subtitleCorrection).toBe(true);
    const deepseek = page.locator('#cloud-deepseek');
    await deepseek.locator('select[name=model]').selectOption('deepseek-v4-pro');
    await deepseek.getByRole('button', { name: '保存文字 AI配置', exact: true }).click();
    await expect(deepseek.locator('[role=status]')).toHaveText('个人凭据已配置');
    await page.reload(); await settings(page);
    await expect(deepseek.locator('select[name=model]')).toHaveValue('deepseek-v4-pro');
    await expect(deepseek.locator('input[name=apiKey]')).toHaveValue('');
    await deepseek.locator('input[name=apiKey]').fill('not-saved');
    await page.locator('#back-workbench').click();
    await expect(deepseek.locator('input[name=apiKey]')).toHaveValue('');
    await page.locator('#header-account').click();
    const changed = await context.request.put('/api/users/me/cloud-credentials/deepseek', {
      headers: { 'X-CSRF-Token': await csrf(context) }, data: { expectedVersion: 2, mode: 'PERSONAL', model: 'deepseek-flash' }
    });
    expect(changed.status()).toBe(200);
    await deepseek.getByRole('button', { name: '保存文字 AI配置', exact: true }).click();
    await expect(page.locator('#cloud-error')).toHaveText('云端配置已被修改，请刷新后重试。');
    await page.locator('#refresh-cloud').click();
    await expect(deepseek.locator('select[name=model]')).toHaveValue('deepseek-flash');
    for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('#cloud-section').screenshot({ path: testInfo.outputPath('cloud-' + viewport.width + '.png') });
    }
    second = await browser.newContext({ baseURL: new URL(page.url()).origin });
    const other = await second.newPage(); otherName = await account(other, second); await settings(other);
    await expect(other.locator('#cloud-deepseek select[name=mode]')).toHaveValue('SERVER');
    expect((await (await second.request.get('/api/users/me/cloud-credentials')).json()).data.every((item) => item.version === 0 && !item.personalStored)).toBe(true);
    expect((await (await second.request.get('/api/system/capabilities')).json()).data.subtitleCorrection).toBe(false);
    await deepseek.getByRole('button', { name: '删除文字 AI个人凭据', exact: true }).click();
    await expect(deepseek.locator('[role=status]')).toHaveText('已停用');
    expect((await (await context.request.get('/api/system/capabilities')).json()).data.subtitleCorrection).toBe(false);
    await page.locator('#cloud-speech-tab').click(); await page.locator('#cloud-tencent input[name=secretKey]').fill('unsaved-key');
    await page.getByRole('button', { name: '退出登录', exact: true }).click();
    await expect(page.locator('#auth-view')).toBeVisible();
    await expect(page.locator('.cloud-provider')).toHaveCount(0);
    await page.locator('#login-username').fill(username); await page.locator('#login-password').fill(password);
    await page.getByRole('button', { name: '登录', exact: true }).click();
    await expect(page.locator('#workbench-panel')).toBeVisible(); await settings(page);
    await expect(page.locator('#cloud-tencent input[name=secretKey]')).toHaveValue('');
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(errors).toEqual([]);
  } finally {
    if (otherName) await remove(second, otherName);
    if (second) await second.close();
    await remove(context, username);
  }
});
