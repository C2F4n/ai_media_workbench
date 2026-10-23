const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

async function fixture(page) {
  await serveStatic(page);
  const state = { ready: false, mode: 'SERVER', version: 0, writes: [] };
  const reason = '本地模型不可用，请检查推理服务是否已启动、加载完成及端口配置';
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url());
    const ok = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data }) });
    const available = state.mode === 'PERSONAL' || state.mode === 'SERVER' && state.ready;
    const entry = () => ({ provider: 'deepseek', mode: state.mode, version: state.version, configured: true,
      available, personalStored: state.mode === 'PERSONAL', model: state.mode === 'PERSONAL' ? 'deepseek-flash' : 'qwen3.5-4b', unavailableReason: available ? null : reason });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (url.pathname === '/api/users/me') return ok({ id: 'fixture-user', username: 'fixture', displayName: '本地模型测试', email: 'fixture@example.com', emailVerified: true, createdAt: '2026-10-22T00:00:00Z' });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, mediaTool: true,
      aiPlans: available, subtitleCorrection: available, semanticSearch: available, clipRecommendations: available,
      supportedOperations: ['workflow', 'export'], exportFormats: ['mp4'], exportVideoCodecs: ['h264'], asrProviders: [],
      textAi: { source: state.mode, model: entry().model, available, unavailableReason: available ? null : reason } });
    if (url.pathname === '/api/users/me/cloud-credentials') return ok([
      ...['tencent', 'aliyun'].map(provider => ({ provider, mode: 'SERVER', version: 0, configured: false, available: false,
        personalStored: false, unavailableReason: '本地模型不支持语音识别，请配置我的凭据' })), entry()
    ]);
    if (url.pathname === '/api/users/me/cloud-credentials/deepseek' && req.method() === 'PUT') {
      const body = req.postDataJSON(); state.writes.push(body); state.mode = body.mode; state.version++;
      return ok({ ...entry(), mode: state.mode, personalStored: state.mode === 'PERSONAL', available: state.mode === 'PERSONAL' || state.ready });
    }
    if (['/api/media', '/api/tasks'].includes(url.pathname)) return ok({ items: [], total: 0, page: 1, pageSize: 10 });
    throw new Error('Unexpected fixture request: ' + req.method() + ' ' + url.pathname);
  });
  await page.goto('/'); await expect(page.locator('#workbench-panel')).toBeVisible();
  return state;
}

for (const width of [1365, 390]) test(`local model reports unavailability and recovers without replacing personal credentials at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  await page.clock.install();
  const state = await fixture(page), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#header-account').click();
  await page.locator('#account-cloud-tab').click();
  const card = page.locator('#cloud-deepseek');
  await expect(card.locator('select[name=mode] option[value=SERVER]')).toHaveText('服务端部署 · 千问');
  await expect(card.locator('[role=status]')).toContainText('服务端模型暂不可用');
  await expect(page.locator('#cloud-tencent [role=status]')).toContainText('不支持语音识别');
  await expect(page.locator('#cloud-providers')).not.toContainText('站点配置');
  await card.locator('select[name=mode]').selectOption('PERSONAL');
  await expect(card.locator('select[name=model]')).toHaveValue('deepseek-flash');
  await card.locator('input[name=apiKey]').fill('not-yet-saved');
  await page.clock.runFor(11000);
  await expect(card.locator('input[name=apiKey]')).toHaveValue('not-yet-saved');
  await expect(card.locator('[role=status]')).toHaveText('未保存');
  expect(state.writes).toHaveLength(0);
  await card.getByRole('button', { name: '保存文字 AI配置', exact: true }).click();
  await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置');
  state.ready = true;
  await page.locator('#refresh-cloud').click();
  await expect(card.locator('select[name=mode]')).toHaveValue('PERSONAL');
  await card.locator('select[name=mode]').selectOption('SERVER');
  await card.getByRole('button', { name: '保存文字 AI配置', exact: true }).click();
  await expect(card.locator('[role=status]')).toHaveText('服务端模型已就绪');
  await expect(card.locator('input[name=apiKey]')).toHaveValue('');
  state.ready = false;
  await page.locator('#refresh-cloud').click();
  await expect(card.locator('[role=status]')).toContainText('服务端模型暂不可用');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const heading = card.locator('.section-heading');
  expect(await heading.evaluate(element => {
    const title = element.querySelector('h3').getBoundingClientRect(), status = element.querySelector('[role=status]').getBoundingClientRect();
    return title.right <= status.left || title.bottom <= status.top;
  })).toBe(true);
  await page.locator('#cloud-section').screenshot({ path: testInfo.outputPath(`local-settings-${width}.png`) });
  await page.locator('#back-workbench').click(); await selectTool(page, 'ai');
  await page.clock.runFor(300);
  await page.locator('#tool-dependencies summary').click();
  await expect(page.locator('#dependency-kind')).toHaveText('服务端部署');
  await expect(page.locator('#dependency-services')).toContainText('服务端部署 · 千问');
  await expect(page.locator('#ai-state')).toContainText('服务端模型暂不可用');
  await expect(page.locator('#dependency-settings')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath(`local-unavailable-${width}.png`), fullPage: true });
  expect(errors).toEqual([]);
});
