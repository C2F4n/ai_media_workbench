const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { selectTool } = require('./helpers/navigation.cjs');

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
    if (url.pathname === '/api/system/capabilities') {
      const text = entries.find(entry => entry.provider === 'deepseek');
      return ok({ registration: false, mediaTool: true, supportedOperations: [], asrProviders: [],
        textAi: { source: text.mode, provider: text.mode === 'SERVER' ? 'local' : text.textProvider || 'deepseek', model: text.model, available: text.configured } });
    }
    if (url.pathname === '/api/users/me/cloud-credentials') return ok(entries);
    if (url.pathname.startsWith('/api/users/me/cloud-credentials/') && request.method() === 'PUT') {
      const provider = url.pathname.split('/').pop(), body = request.postDataJSON(); writes.push({ provider, body });
      entries = entries.map((entry) => entry.provider === provider ? { ...entry, mode: body.mode, version: entry.version + 1, configured: body.mode === 'PERSONAL', personalStored: body.mode === 'PERSONAL', appId: body.appId, workspaceId: body.workspaceId, model: body.model, textProvider: body.textProvider } : entry);
      return ok(entries.find((entry) => entry.provider === provider));
    }
    if (['/api/media', '/api/tasks'].includes(url.pathname)) return ok({ items: [], total: 0, page: 1, pageSize: 10 });
    throw new Error('Unexpected fixture request: ' + request.method() + ' ' + url.pathname);
  });
  await page.goto('http://workbench.test/'); await expect(page.locator('#workbench-panel')).toBeVisible();
  await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click(); await expect(page.locator('.cloud-provider')).toHaveCount(3);
  return writes;
}

for (const width of [1365, 390]) test(`cloud credentials require the visible save command at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const writes = await fixture(page); let confirmations = 0, accept = false;
  page.on('dialog', async (dialog) => { confirmations++; await (accept ? dialog.accept() : dialog.dismiss()); });
  for (const [provider, name] of [['tencent', '腾讯云语音识别'], ['aliyun', '阿里云百炼语音识别'], ['deepseek', '文字 AI']]) {
    await page.locator(provider === 'deepseek' ? '#cloud-text-tab' : '#cloud-speech-tab').click();
    const card = page.locator('#cloud-' + provider), save = card.getByRole('button', { name: '保存' + name + '配置', exact: true });
    await card.locator('select[name=mode]').selectOption('PERSONAL');
    const before = writes.length, beforeDialogs = confirmations;
    for (const input of await card.locator('input:visible').all()) {
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

for (const width of [1365, 390]) test(`OpenAI and Bailian settings are classified and never reuse a different vendors key at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 }); const writes = await fixture(page); page.on('dialog', dialog => dialog.accept());
  const card = page.locator('#cloud-deepseek'), mode = card.locator('select[name=mode]'), vendor = card.locator('select[name=textProvider]');
  const key = card.locator('input[name=apiKey]'), model = card.locator('input[name=model]'), workspace = card.locator('input[name=workspaceId]');
  const save = card.getByRole('button', { name: '保存文字 AI配置', exact: true });
  await expect(card).toBeVisible(); await expect(page.locator('#cloud-tencent')).toBeHidden();
  await mode.selectOption('PERSONAL'); await key.fill('sk-old-draft'); await vendor.selectOption('openai');
  await expect(key).toHaveValue(''); await expect(model).toHaveValue(''); await expect(key).toHaveAttribute('required', '');
  await expect(workspace).toBeHidden(); await expect(card.locator('[aria-label="官方接口地址"]')).toHaveText('https://api.openai.com/v1/chat/completions');
  await save.click(); expect(writes).toHaveLength(0);
  await key.fill('sk-openai-fixture'); await model.fill('gpt-fixture'); await model.press('Enter'); expect(writes).toHaveLength(0);
  await save.click(); await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
  expect(writes[0].body).toEqual({ expectedVersion: 0, mode: 'PERSONAL', textProvider: 'openai', apiKey: 'sk-openai-fixture', model: 'gpt-fixture' });
  await expect(key).toHaveValue(''); await expect(vendor).toHaveValue('openai');
  await vendor.selectOption('bailian'); await expect(key).toHaveValue(''); await expect(model).toHaveValue('qwen-plus');
  await save.click(); expect(writes).toHaveLength(1);
  await key.fill('sk-bailian-fixture'); await workspace.fill('workspace-123');
  await expect(card.locator('[aria-label="官方接口地址"]')).toHaveText('https://workspace-123.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/chat/completions');
  await save.click(); await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
  expect(writes[1].body).toEqual({ expectedVersion: 1, mode: 'PERSONAL', textProvider: 'bailian', apiKey: 'sk-bailian-fixture', model: 'qwen-plus', workspaceId: 'workspace-123' });
  await expect(key).toHaveValue('');
  await page.locator('#cloud-speech-tab').click(); await expect(page.locator('#cloud-tencent')).toBeVisible(); await expect(page.locator('#cloud-aliyun')).toBeVisible(); await expect(card).toBeHidden();
  await page.locator('#cloud-speech-tab').focus(); await page.keyboard.press('ArrowLeft'); await expect(card).toBeVisible();
  await expect(workspace).toHaveValue('workspace-123'); await expect(vendor).toHaveValue('bailian');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: testInfo.outputPath(`text-providers-${width}.png`), fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload(); await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click();
  await expect(vendor).toHaveValue('bailian'); await expect(key).toHaveValue('');
  await expect(vendor.locator('option:checked')).toHaveText('千问 / 阿里云百炼');
  await page.locator('#back-workbench').click(); await selectTool(page, 'ai');
  await expect(page.locator('#dependency-summary')).toContainText('阿里云百炼');
});

for (const width of [1365, 390]) test(`Doubao uses its own key and explicit model and survives reload at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 }); const writes = await fixture(page); page.on('dialog', dialog => dialog.accept());
  const card = page.locator('#cloud-deepseek'), vendor = card.locator('select[name=textProvider]');
  const key = card.locator('input[name=apiKey]'), model = card.locator('input[name=model]'), workspace = card.locator('input[name=workspaceId]');
  const save = card.getByRole('button', { name: '保存文字 AI配置', exact: true });
  await card.locator('select[name=mode]').selectOption('PERSONAL');
  await vendor.selectOption('bailian'); await key.fill('sk-qwen-draft'); await workspace.fill('old-workspace');
  await vendor.selectOption('doubao');
  await expect(vendor.locator('option:checked')).toHaveText('豆包 / 火山方舟');
  await expect(key).toHaveValue(''); await expect(key).toHaveAttribute('required', '');
  await expect(model).toHaveValue(''); await expect(model).toHaveAttribute('placeholder', '填写 Model ID 或 Endpoint ID（ep-...）');
  await expect(workspace).toBeHidden(); await expect(workspace).toHaveValue('');
  await expect(card.locator('[aria-label="官方接口地址"]')).toHaveText('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
  await key.fill('ark-fixture-not-real'); await save.click(); expect(writes).toHaveLength(0);
  await model.fill('ep-fixture'); await save.click(); await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
  expect(writes[0].body).toEqual({ expectedVersion: 0, mode: 'PERSONAL', textProvider: 'doubao', apiKey: 'ark-fixture-not-real', model: 'ep-fixture' });
  await expect(key).toHaveValue('');
  await page.reload(); await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click();
  await expect(vendor).toHaveValue('doubao'); await expect(model).toHaveValue('ep-fixture'); await expect(key).toHaveValue('');
  await model.fill('doubao-model-fixture'); await save.click(); await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
  expect(writes[1].body).toEqual({ expectedVersion: 1, mode: 'PERSONAL', textProvider: 'doubao', model: 'doubao-model-fixture' });
  await page.screenshot({ path: testInfo.outputPath(`doubao-${width}.png`), fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#back-workbench').click(); await selectTool(page, 'ai');
  await expect(page.locator('#dependency-summary')).toContainText('豆包 / 火山方舟');
});
