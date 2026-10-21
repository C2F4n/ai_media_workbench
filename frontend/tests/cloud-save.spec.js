const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

// 所有页面资源和API均拦截为测试数据，不启动服务，也不接触真实凭据。
async function fixture(page) {
  const root = path.resolve(__dirname, '../../src/main/resources/static'), writes = [];
  const names = ['tencent', 'aliyun', 'deepseek'];
  let entries = names.map((provider) => ({ provider, mode: 'SERVER', version: 0, configured: false, personalStored: false, model: provider === 'deepseek' ? 'deepseek-flash' : null }));
  await page.route('http://workbench.test/**', async (route) => {
    const request = route.request(), url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) {
      const files = { '/': 'index.html', '/assets/styles.css': 'assets/styles.css', '/assets/app.js': 'assets/app.js', '/assets/vendor/lucide.min.js': 'assets/vendor/lucide.min.js', '/assets/brand.svg': 'assets/brand.svg' };
      const file = files[url.pathname]; if (!file) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ status: 200, contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html', body: fs.readFileSync(path.join(root, file)) });
    }
    const ok = (data) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data }) });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (url.pathname === '/api/users/me') return ok({ id: 'fixture-user', username: 'fixture', displayName: '配置测试', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-21T00:00:00Z' });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, mediaTool: true, supportedOperations: [], asrProviders: [] });
    if (url.pathname === '/api/users/me/cloud-credentials') return ok(entries);
    if (url.pathname.startsWith('/api/users/me/cloud-credentials/') && request.method() === 'PUT') {
      const provider = url.pathname.split('/').pop(), body = request.postDataJSON(); writes.push({ provider, body });
      entries = entries.map((entry) => entry.provider === provider ? { ...entry, mode: body.mode, version: entry.version + 1, configured: body.mode === 'PERSONAL', personalStored: body.mode === 'PERSONAL', appId: body.appId, workspaceId: body.workspaceId, model: body.model } : entry);
      return ok(entries.find((entry) => entry.provider === provider));
    }
    if (['/api/media', '/api/tasks'].includes(url.pathname)) return ok({ items: [], total: 0, page: 1, pageSize: 10 });
    throw new Error('Unexpected fixture request: ' + request.method() + ' ' + url.pathname);
  });
  await page.goto('http://workbench.test/'); await expect(page.locator('#workbench-panel')).toBeVisible();
  await page.locator('#header-account').click(); await expect(page.locator('.cloud-provider')).toHaveCount(3);
  return writes;
}

for (const width of [1365, 390]) test(`cloud credentials require the visible save command at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const writes = await fixture(page); let confirmations = 0, accept = false;
  page.on('dialog', async (dialog) => { confirmations++; await (accept ? dialog.accept() : dialog.dismiss()); });
  for (const [provider, name] of [['tencent', '腾讯云语音识别'], ['aliyun', '阿里云百炼语音识别'], ['deepseek', 'DeepSeek']]) {
    const card = page.locator('#cloud-' + provider), save = card.getByRole('button', { name: '保存' + name + '配置', exact: true });
    await card.locator('select').selectOption('PERSONAL');
    const before = writes.length, beforeDialogs = confirmations;
    for (const input of await card.locator('input').all()) {
      const field = await input.getAttribute('name');
      await input.fill(field === 'appId' ? '123456' : field === 'model' ? 'deepseek-flash' : 'fake-test-value');
      await input.press('Enter');
    }
    expect(confirmations).toBe(beforeDialogs); expect(writes).toHaveLength(before);
    await expect(save).toHaveText('保存'); await expect(save).toBeVisible();
    await save.click(); expect(confirmations).toBe(beforeDialogs + 1); expect(writes).toHaveLength(before);
    accept = true; await save.click(); accept = false;
    await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置'); expect(writes).toHaveLength(before + 1);
    for (const input of await card.locator('input[data-secret]').all()) await expect(input).toHaveValue('');
    expect(await save.evaluate((button) => button.scrollWidth <= button.clientWidth)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#cloud-section').screenshot({ path: testInfo.outputPath('save-buttons-' + width + '.png') });
});
