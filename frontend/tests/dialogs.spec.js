const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');
const fs = require('node:fs');
const path = require('node:path');

async function fixture(page) {
  await serveStatic(page);
  const now = '2026-10-24T00:00:00Z', mediaId = '22222222-2222-4222-8222-222222222222';
  const media = { id: mediaId, originalFilename: 'original.mp4', status: 'READY', kind: 'VIDEO', sizeBytes: 2000000, previewUrl: null,
    metadata: { durationMs: 5000, width: 320, height: 180, container: 'mp4', videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  const other = { ...media, id: '22222222-2222-4222-8222-222222222223', originalFilename: 'other.mp4' };
  const base = { mediaId, version: 1, status: 'READY', questions: [], warnings: [], taskId: null, createdAt: now, updatedAt: now };
  const state = { writes: [], reads: [], plans: [
    { ...base, id: '33333333-3333-4333-8333-333333333331', instruction: '已保存的处理要求', summary: '已保存方案', parameters: { operation: 'mute', outputFormat: 'mp4', resolutionPreset: 'source' } },
    { ...base, id: '33333333-3333-4333-8333-333333333332', instruction: null, summary: '导出方案', parameters: { operation: 'export', outputFormat: 'mp4', videoCodec: 'h264', resolutionPreset: '720p', audioMode: 'keep', extractAudio: false } },
    { ...base, id: '33333333-3333-4333-8333-333333333333', instruction: null, summary: '拼接方案', parameters: { operation: 'join_clips', outputFormat: 'mp4', audioMode: 'keep', clips: [{ startMs: 0, endMs: 1000 }] } }
  ] };
  state.tasks = [{ id: '44444444-4444-4444-8444-444444444444', mediaId, planId: state.plans[0].id, planVersion: 1,
    kind: 'MEDIA_PROCESSING', status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100, outputs: [], parameters: state.plans[0].parameters, error: null, createdAt: now }];
  state.entries = ['tencent', 'aliyun', 'deepseek'].map(provider => ({ provider, mode: 'SERVER', version: 0, configured: provider === 'deepseek', available: provider === 'deepseek', personalStored: false }));
  await page.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), name = url.pathname, method = request.method();
    const ok = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data, details: [] }) });
    const list = items => ok({ items, total: items.length, page: 1, pageSize: 10 });
    if (method === 'GET') state.reads.push(name);
    else state.writes.push({ name, method, body: request.postDataJSON() });
    if (name === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (name === '/api/users/me') return ok({ id: 'fixture-user', username: 'fixture_user', displayName: '弹窗测试', email: 'fixture@example.com', emailVerified: true, createdAt: now });
    if (name === '/api/system/capabilities') return ok({ registration: false, mediaTool: true, aiPlans: true, asrProviders: [],
      supportedOperations: ['transcode', 'export', 'workflow', 'join_clips'], exportFormats: ['mp4', 'webm'], exportVideoCodecs: ['h264', 'vp9'],
      textAi: { source: 'SERVER', provider: 'local', available: true, model: 'qwen' } });
    if (name === '/api/users/me/cloud-credentials') return ok(state.entries);
    if (name.startsWith('/api/users/me/cloud-credentials/')) {
      const item = state.entries.find(entry => entry.provider === name.split('/').pop());
      Object.assign(item, { version: item.version + 1, mode: method === 'DELETE' ? 'OFF' : request.postDataJSON().mode });
      item.personalStored = item.mode === 'PERSONAL'; item.configured = item.mode !== 'OFF'; item.available = item.configured; return ok(item);
    }
    if (name === '/api/media') return list([media, other]);
    if (name === '/api/media/' + mediaId || name === '/api/media/' + other.id) return ok(name.endsWith(mediaId) ? media : other);
    if (name.endsWith('/transcript')) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'RESOURCE_NOT_FOUND', data: null }) });
    if (name === '/api/operation-plans' && method === 'GET') return list(state.plans);
    if (name === '/api/operation-plans' && method === 'POST') {
      const item = { ...base, id: '55555555-5555-4555-8555-555555555555', parameters: request.postDataJSON().parameters, instruction: null }; state.plans.unshift(item); return ok(item);
    }
    if (name.endsWith('/execute')) return ok({ ...state.tasks[0], planId: name.split('/').at(-2) });
    if (name.startsWith('/api/operation-plans/')) {
      const id = name.split('/').pop(); if (method === 'DELETE') { state.plans = state.plans.filter(item => item.id !== id); return ok(null); }
      return ok(state.plans.find(item => item.id === id));
    }
    if (name === '/api/tasks') return list(state.tasks);
    if (name.startsWith('/api/tasks/')) {
      if (method === 'DELETE') { state.tasks = []; return ok(null); } return ok(state.tasks[0]);
    }
    throw new Error('Unexpected dialog fixture request: ' + method + ' ' + name);
  });
  page.on('dialog', dialog => { throw new Error('Unexpected browser dialog: ' + dialog.message()); });
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  return state;
}

test('the application contains no native confirm alert or prompt calls', () => {
  const code = fs.readFileSync(path.resolve(__dirname, '../../src/main/resources/static/assets/app.js'), 'utf8');
  expect(code).not.toMatch(/\b(?:confirm|alert|prompt)\s*\(/);
  expect(code).toContain("addEventListener('beforeunload'");
});

for (const width of [1365, 390, 320]) test(`restore confirmation preserves drafts on cancel and fits ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 }); const state = await fixture(page); await selectTool(page, 'ai');
  await expect(page.locator('#ai-instruction')).toHaveValue('已保存的处理要求'); await page.locator('#ai-instruction').fill('尚未保存的输入');
  const before = state.reads.length;
  for (const close of ['cancel-action-confirm', 'close-action-confirm', 'Escape']) {
    await page.locator('#refresh-ai-plan').click(); await expect(page.locator('#action-confirm-dialog')).toBeVisible();
    await expect(page.locator('#action-confirm-title')).toHaveText('恢复最近方案'); await expect(page.locator('#cancel-action-confirm')).toBeFocused();
    await expect(page.locator('#action-confirm-dialog input')).toHaveCount(0);
    if (close === 'Escape') await page.keyboard.press('Escape'); else await page.locator('#' + close).click();
    await expect(page.locator('#ai-instruction')).toHaveValue('尚未保存的输入');
    await expect(page.locator('#refresh-ai-plan')).toBeFocused();
  }
  expect(state.reads).toHaveLength(before); expect(state.writes).toHaveLength(0);
  await page.locator('#refresh-ai-plan').click();
  for (let index = 0; index < 6; index++) { await page.keyboard.press('Tab'); expect(await page.locator('#action-confirm-dialog').evaluate(dialog => dialog.contains(document.activeElement))).toBe(true); }
  await expect.poll(() => page.locator('#action-confirm-dialog').evaluate(dialog => dialog.getAnimations().length)).toBe(0);
  const box = await page.locator('#action-confirm-dialog').boundingBox(); expect(box.x).toBeGreaterThanOrEqual(16); expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
  expect(await page.locator('#accept-action-confirm span').evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(25);
  await page.screenshot({ path: testInfo.outputPath(`restore-dialog-${width}.png`), animations: 'disabled' });
  await page.locator('#accept-action-confirm').click(); await expect(page.locator('#ai-instruction')).toHaveValue('已保存的处理要求');
  await expect(page.locator('#action-confirm-dialog')).toBeHidden();
});

test('credentials are not submitted until approved and deletion is always confirmed', async ({ page }) => {
  const state = await fixture(page); await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click();
  await page.locator('#skip-cloud-confirmation').check();
  const card = page.locator('#cloud-deepseek'); await card.locator('select[name=mode]').selectOption('PERSONAL');
  await card.locator('input[name=apiKey]').fill('fake-secret-not-for-modal');
  const save = card.getByRole('button', { name: '保存文字 AI配置', exact: true }); await save.click();
  await expect(page.locator('#action-confirm-title')).toHaveText('保存个人凭据'); await expect(page.locator('#action-confirm-dialog')).not.toContainText('fake-secret-not-for-modal');
  expect(state.writes).toHaveLength(0); await page.locator('#cancel-action-confirm').click(); await expect(card.locator('input[name=apiKey]')).toHaveValue('fake-secret-not-for-modal');
  await save.click(); await page.locator('#accept-action-confirm').click(); await expect(card.locator('[role=status]')).toHaveText('个人凭据已配置'); expect(state.writes).toHaveLength(1);
  await card.getByRole('button', { name: '删除文字 AI个人凭据', exact: true }).click();
  await expect(page.locator('#action-confirm-dialog')).toHaveAttribute('data-kind', 'danger'); await expect(page.locator('#action-confirm-title')).toHaveText('删除个人凭据');
  await page.locator('#cancel-action-confirm').click(); expect(state.writes).toHaveLength(1);
  await card.locator('select[name=mode]').selectOption('SERVER'); await save.click(); await expect(page.locator('#action-confirm-title')).toHaveText('切换服务来源');
  await page.locator('#cancel-action-confirm').click(); expect(state.writes).toHaveLength(1);
  await card.getByRole('button', { name: '删除文字 AI个人凭据', exact: true }).click(); await page.locator('#accept-action-confirm').click();
  await expect.poll(() => state.writes.length).toBe(2); expect(state.writes[1].method).toBe('DELETE');
});

test('switching media retains unsaved input until the user explicitly discards it', async ({ page }) => {
  await fixture(page); await selectTool(page, 'ai'); await page.locator('#ai-instruction').fill('保留我的修改');
  await page.locator('#phase-import-tab').click(); await page.getByRole('button', { name: /^other\.mp4/ }).click();
  await expect(page.locator('#action-confirm-title')).toHaveText('切换素材'); await page.locator('#cancel-action-confirm').click();
  await expect(page.locator('#workspace-file-state')).toHaveText('original.mp4');
  await page.getByRole('button', { name: /^other\.mp4/ }).click(); await page.locator('#accept-action-confirm').click();
  await expect(page.locator('#workspace-file-state')).toHaveText('other.mp4');
});

test('export restore asks before starting requests and uses the saved parameters after approval', async ({ page }) => {
  const state = await fixture(page); await selectTool(page, 'convert'); await page.locator('#phase-edit-tab').click();
  await page.locator('#conversion-resolution').selectOption('360p'); await page.locator('#restore-export-plan').click();
  await expect(page.locator('#action-confirm-title')).toHaveText('恢复导出方案'); await expect(page.locator('#accept-action-confirm')).toBeEnabled();
  const reads = state.reads.length; await page.locator('#cancel-action-confirm').click(); expect(state.reads).toHaveLength(reads);
  await expect(page.locator('#conversion-resolution')).toHaveValue('360p');
  await page.locator('#restore-export-plan').click(); await page.locator('#accept-action-confirm').click();
  await expect(page.locator('#conversion-resolution')).toHaveValue('720p');
});

test('step editing and join reset remain unchanged on cancel and export waits for confirmation', async ({ page }) => {
  const state = await fixture(page); await selectTool(page, 'ai'); await page.locator('#workflow-step-mode').click(); await page.locator('#workflow-add').click();
  const count = await page.locator('.workflow-step').count(); await page.locator('#workflow-text-mode').click(); await expect(page.locator('#action-confirm-title')).toHaveText('切换文字输入');
  await page.locator('#cancel-action-confirm').click(); await expect(page.locator('.workflow-step')).toHaveCount(count);
  await page.locator('#workflow-text-mode').click(); await page.locator('#accept-action-confirm').click(); await expect(page.locator('#ai-form')).toBeVisible();
  await selectTool(page, 'join'); await page.locator('#add-join-clip').click(); await page.locator('#refresh-join').click();
  await expect(page.locator('#action-confirm-title')).toHaveText('恢复拼接方案'); await page.locator('#cancel-action-confirm').click();
  await expect(page.locator('.join-row')).toHaveCount(2); await page.locator('#refresh-join').click(); await page.locator('#accept-action-confirm').click();
  await expect(page.locator('.join-row')).toHaveCount(1); await page.locator('#join-form button[type=submit]').click();
  await expect(page.locator('#action-confirm-title')).toHaveText('导出拼接视频'); expect(state.writes).toHaveLength(0);
  await page.locator('#accept-action-confirm').click(); await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].name).toMatch(/\/execute$/);
});

test('history deletion uses a destructive dialog even with cloud prompts disabled', async ({ page }, testInfo) => {
  const state = await fixture(page); await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click(); await page.locator('#skip-cloud-confirmation').check();
  await page.locator('#back-workbench').click(); await selectTool(page, 'history');
  const remove = page.getByRole('button', { name: '删除处理记录', exact: true }); await remove.click();
  await expect(page.locator('#action-confirm-dialog')).toHaveAttribute('data-kind', 'danger');
  await expect(page.locator('#accept-action-confirm')).toHaveClass('button danger');
  await page.screenshot({ path: testInfo.outputPath('delete-history-dialog.png'), animations: 'disabled' });
  await page.locator('#cancel-action-confirm').click(); expect(state.writes).toHaveLength(0);
  await remove.click(); await page.locator('#accept-action-confirm').click(); await expect(page.locator('#task-list > li')).toHaveCount(0);
  expect(state.writes).toHaveLength(1);
});

test('a stale approval cannot restore input after an account change and reduced motion is respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await fixture(page); await selectTool(page, 'ai'); await page.locator('#ai-instruction').fill('暂不丢弃');
  await page.locator('#refresh-ai-plan').click(); expect(await page.locator('#action-confirm-dialog').evaluate(dialog => dialog.getAnimations().length)).toBe(0);
  await page.evaluate(() => { const channel = new BroadcastChannel('amw-account'); channel.postMessage('account-changed'); channel.close(); });
  await expect(page.locator('#action-confirm-dialog')).toBeHidden(); await expect(page.locator('#ai-instruction')).toHaveValue('暂不丢弃');
});

for (const [id, cancel] of [['delete-media-dialog', 'cancel-delete-media'], ['delete-output-dialog', 'cancel-delete-output'], ['delete-dialog', 'cancel-delete']]) {
  test(`${id} shares the dialog design and fits small screens`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 568 }); await fixture(page);
    await page.locator('#' + id).evaluate(dialog => dialog.showModal());
    await expect(page.locator('#' + id + ' .dialog-icon svg')).toHaveCount(1);
    await expect.poll(() => page.locator('#' + id).evaluate(dialog => dialog.getAnimations().length)).toBe(0);
    const box = await page.locator('#' + id).boundingBox(); expect(box.x).toBeGreaterThanOrEqual(16); expect(box.x + box.width).toBeLessThanOrEqual(304);
    expect(await page.locator('#' + id).evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(id + '-320.png'), animations: 'disabled' });
    await page.locator('#' + cancel).click(); await expect(page.locator('#' + id)).toBeHidden();
  });
}
