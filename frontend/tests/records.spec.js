const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

async function fixture(page) {
  await serveStatic(page);
  const now = '2026-10-22T10:00:00Z', mediaId = '22222222-2222-4222-8222-222222222222';
  const media = { id: mediaId, originalFilename: 'record-source.mp4', sizeBytes: 2000000, status: 'READY', kind: 'VIDEO', previewUrl: null,
    metadata: { container: 'mp4', durationMs: 10000, width: 640, height: 360, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  const parameters = { operation: 'export', outputFormat: 'mp3', videoCodec: null, resolutionPreset: null, width: null, height: null,
    audioMode: 'keep', startMs: null, endMs: null, targetSizeBytes: null, extractAudio: false };
  const state = { removed: [], writes: [], prompts: [], tasks: [], plans: [], created: 0, patched: 0 };
  state.plans = Array.from({ length: 12 }, (_, i) => ({ id: `33333333-3333-4333-8333-${String(i).padStart(12, '0')}`, mediaId, version: 1,
    status: 'READY', parameters, instruction: null, summary: `MP3 音频方案 ${i + 1}`, questions: [], warnings: [], taskId: null, createdAt: now, updatedAt: now }));
  state.tasks = ['SUCCEEDED', 'FAILED', 'QUEUED'].map((status, i) => ({ id: `44444444-4444-4444-8444-${String(i).padStart(12, '0')}`, mediaId,
    planId: state.plans[i].id, planVersion: 1, kind: 'MEDIA_PROCESSING', parameters, status, stage: status === 'QUEUED' ? 'WAITING' : status === 'FAILED' ? 'FAILED' : 'DONE',
    outputs: [], error: status === 'FAILED' ? { code: 'TRANSCODE_FAILED', message: '测试失败描述' } : null, createdAt: now }));
  const entries = ['tencent', 'aliyun', 'deepseek'].map(provider => ({ provider, version: 0, mode: 'SERVER', available: provider === 'deepseek', configured: provider === 'deepseek', personalStored: false }));
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data }) });
    const list = items => { const page = Number(url.searchParams.get('page') || 1), size = Number(url.searchParams.get('pageSize') || 10); return ok({ items: items.slice((page - 1) * size, page * size), total: items.length, page, pageSize: size }); };
    if (path === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (path === '/api/users/me') return ok({ id: 'fixture-user', username: 'fixture', displayName: '记录测试', email: 'fixture@example.com', emailVerified: true, createdAt: now });
    if (path === '/api/system/capabilities') return ok({ registration: false, aiPlans: true, mediaTool: true, asrProviders: [],
      supportedOperations: ['transcode', 'extract_audio', 'export', 'workflow'], exportFormats: ['mp4', 'mp3', 'm4a'], exportVideoCodecs: ['h264'],
      maxUploadBytes: 3221225472, maxDurationMs: 900000, textAi: { source: 'SERVER', model: 'qwen3.5-4b', available: true } });
    if (path === '/api/media') return list([media]);
    if (path === '/api/media/' + mediaId) return ok(media);
    if (path === '/api/users/me/cloud-credentials') return ok(entries);
    if (path === '/api/tasks' && method === 'GET') return list(state.tasks);
    if (path.startsWith('/api/tasks/')) {
      const id = path.split('/').pop(), task = state.tasks.find(item => item.id === id);
      if (method === 'DELETE') { expect(req.headers()['x-csrf-token']).toBe('fixture-csrf'); state.removed.push(id); state.tasks = state.tasks.filter(item => item.id !== id); return ok(null); }
      return ok(task);
    }
    if (path === '/api/operation-plans' && method === 'GET') return list(state.plans);
    if (path === '/api/operation-plans' && method === 'POST') {
      const body = req.postDataJSON(); state.writes.push(body); state.created++;
      const plan = { id: `55555555-5555-4555-8555-${String(state.created).padStart(12, '0')}`, mediaId, version: 1, instruction: body.instruction || null,
        parameters: body.parameters || null, status: body.instruction ? 'NEEDS_INPUT' : 'READY', summary: body.instruction ? '请完善要求' : '已保存音频方案',
        questions: body.instruction ? [{ code: 'TRIM_RANGE_REQUIRED', message: '请明确保留区间' }] : [], warnings: [], createdAt: now, updatedAt: now };
      if (body.instruction) state.prompts.push(body.instruction);
      state.plans.unshift(plan); return ok(plan, 201);
    }
    if (path.startsWith('/api/operation-plans/')) {
      const id = path.split('/').pop(), plan = state.plans.find(item => item.id === id);
      if (method === 'GET') return ok(plan);
      if (method === 'DELETE') { state.removed.push(id); state.plans = state.plans.filter(item => item.id !== id); return ok(null); }
      if (method === 'PATCH') {
        const body = req.postDataJSON(); expect(body.expectedVersion).toBe(plan.version); state.patched++;
        if (body.instruction) state.prompts.push(body.instruction);
        Object.assign(plan, { version: plan.version + 1, instruction: body.instruction || null, parameters: body.parameters || null });
        return ok(plan);
      }
    }
    throw new Error('Unexpected records request: ' + method + ' ' + path);
  });
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  return state;
}

for (const width of [1365, 390]) {
  test(`history is separate, expandable and deletable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 }); const errors = []; page.on('pageerror', error => errors.push(error.message));
    const state = await fixture(page); let accept = false; page.on('dialog', dialog => accept ? dialog.accept() : dialog.dismiss());
    await page.locator('#phase-export-tab').click(); await expect(page.locator('#task-section')).toBeHidden();
    await selectTool(page, 'history'); await expect(page.locator('#workspace-tool-title')).toHaveText('处理记录');
    await expect(page.locator('#workspace-phases')).toBeHidden(); await expect(page.locator('#phase-export')).toBeHidden();
    const rows = page.locator('#task-list > li'); await expect(rows).toHaveCount(3);
    await rows.nth(1).locator('summary').click(); await expect(rows.nth(1)).toContainText('测试失败描述');
    await expect(rows.nth(1).locator('.record-instruction')).toHaveText('MP3 音频方案 2');
    await expect(rows.nth(2).getByRole('button', { name: '删除处理记录', exact: true })).toBeDisabled();
    await rows.first().getByRole('button', { name: '删除处理记录', exact: true }).click(); expect(state.removed).toHaveLength(0);
    accept = true; await rows.first().getByRole('button', { name: '删除处理记录', exact: true }).click();
    await expect(rows).toHaveCount(2); expect(state.removed).toHaveLength(1);
    await expect(rows.first().locator('details')).toHaveAttribute('open', '');
    await page.screenshot({ path: testInfo.outputPath(`history-${width}.png`), fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await rows.first().getByRole('button', { name: '打开处理结果', exact: true }).click();
    await expect(page.locator('#workspace-tool-title')).toHaveText('提取音频'); await expect(page.locator('#phase-export')).toBeVisible();
    await expect(page.locator('#workspace-file-state')).toHaveText('record-source.mp4');
    await page.reload(); await selectTool(page, 'history'); await expect(rows).toHaveCount(2); expect(errors).toEqual([]);
  });

  test(`saved audio plans have pagination restore and deletion at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 }); const state = await fixture(page); page.on('dialog', dialog => dialog.accept());
    await selectTool(page, 'audio'); await page.locator('#save-export-plan').click();
    await expect(page.locator('#export-plan-state')).toContainText('已保存'); expect(state.created).toBe(1);
    await page.locator('#export-audio-format').selectOption('m4a'); await page.locator('#save-export-plan').click();
    await expect(page.locator('#export-plan-state')).toContainText('v2'); expect(state.created).toBe(1); expect(state.patched).toBe(1);
    await selectTool(page, 'history'); await page.locator('#history-plans-tab').click();
    await expect(page.locator('#plan-total')).toHaveText('13 个方案'); await expect(page.locator('#plan-list > li')).toHaveCount(10);
    await page.locator('#plan-next').click(); await expect(page.locator('#plan-page')).toHaveText('2'); await expect(page.locator('#plan-list > li')).toHaveCount(3);
    await page.locator('#plan-prev').click(); await expect(page.locator('#plan-page')).toHaveText('1');
    const first = page.locator('#plan-list > li').first(); await first.locator('summary').click(); await expect(first).toContainText('m4a');
    await page.screenshot({ path: testInfo.outputPath(`plans-${width}.png`), fullPage: true, animations: 'disabled' });
    await first.getByRole('button', { name: '恢复这个方案', exact: true }).click();
    await expect(page.locator('#workspace-tool-title')).toHaveText('提取音频'); await expect(page.locator('#phase-edit')).toBeVisible();
    await expect(page.locator('#export-audio-format')).toHaveValue('m4a');
    await selectTool(page, 'history'); await first.getByRole('button', { name: '删除保存的方案', exact: true }).click();
    await expect(page.locator('#plan-total')).toHaveText('12 个方案'); expect(state.removed).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`settings use horizontal categories and retain drafts at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 }); await fixture(page);
    await page.locator('#header-account').click(); await expect(page.locator('#profile-section')).toBeVisible();
    await expect(page.locator('#security-section')).toBeHidden(); await expect(page.locator('#cloud-section')).toBeHidden();
    await page.locator('#account-cloud-tab').click(); await expect(page.locator('#cloud-section')).toBeVisible();
    await expect(page.locator('#cloud-deepseek .model-warning')).toContainText('理解能力有限');
    const positions = await page.locator('.account-nav [role=tab]').evaluateAll(tabs => tabs.map(tab => tab.getBoundingClientRect().top));
    expect(new Set(positions).size).toBe(1);
    if (width > 1000) {
      await page.locator('#cloud-speech-tab').click();
      const tops = await page.locator('#cloud-speech-providers .cloud-provider').evaluateAll(cards => cards.map(card => card.getBoundingClientRect().top)); expect(new Set(tops).size).toBe(1);
      await page.locator('#cloud-text-tab').click();
    }
    await page.locator('#cloud-deepseek select[name=mode]').selectOption('PERSONAL'); await page.locator('#cloud-deepseek input[name=apiKey]').fill('unsaved-fixture');
    await expect(page.locator('#cloud-deepseek .model-warning')).toBeHidden();
    await page.locator('#account-security-tab').click(); await expect(page.locator('#password-form')).toBeVisible(); await expect(page.locator('#account-danger-section')).toBeVisible();
    await page.locator('#account-security-tab').focus(); await page.keyboard.press('ArrowRight');
    await expect(page.locator('#account-cloud-tab')).toBeFocused(); await expect(page.locator('#cloud-deepseek input[name=apiKey]')).toHaveValue('unsaved-fixture');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`settings-${width}.png`), fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('repeated AI regeneration keeps only the current rewritten prompt', async ({ page }) => {
  const state = await fixture(page); await selectTool(page, 'ai');
  await expect(page.locator('#ai-model-warning')).toBeVisible();
  for (const text of ['剪切视频', '保留视频前5秒', '保留视频前3秒并静音']) {
    await page.locator('#ai-instruction').fill(text); await page.locator('#generate-ai-plan').click();
    await expect(page.locator('#ai-plan')).toBeVisible(); await expect(page.locator('#ai-instruction')).toHaveValue(text);
    await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  }
  expect(state.prompts).toEqual(['剪切视频', '保留视频前5秒', '保留视频前3秒并静音']);
  expect(state.created).toBe(1); expect(state.patched).toBe(2);
});

test('a delayed task list cannot restore a deleted history entry', async ({ page }) => {
  const state = await fixture(page); await expect(page.locator('#task-list > li')).toHaveCount(3);
  await page.clock.install(); await selectTool(page, 'history'); page.on('dialog', dialog => dialog.accept());
  let release, captured, finished, hold = true;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { captured = resolve; });
  const ended = new Promise(resolve => { finished = resolve; });
  await page.route('**/api/tasks?*', async route => {
    if (!hold) return route.fallback();
    hold = false; const items = [...state.tasks]; captured(); await gate;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data: { items, total: items.length, page: 1, pageSize: 10 } }) }); finished();
  });
  try {
    await page.locator('#refresh-tasks').click(); await started;
    await page.locator('#task-list > li').first().getByRole('button', { name: '删除处理记录', exact: true }).click();
    await expect(page.locator('#task-list > li')).toHaveCount(2);
    release(); await ended; await expect(page.locator('#task-list > li')).toHaveCount(2);
  } finally { release(); }
});
