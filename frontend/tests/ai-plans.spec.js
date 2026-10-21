const { test, expect } = require('@playwright/test');
const { selectTool } = require('./helpers/navigation.cjs');
const { serveStatic } = require('./helpers/static.cjs');

test.beforeEach(async ({ page }) => { await serveStatic(page); });

// Browser contract fixture only: no credentials, cloud calls or media processing are involved.
async function fixture(page, enabled = true) {
  const mediaId = '22222222-2222-4222-8222-222222222222', planId = '33333333-3333-4333-8333-333333333333';
  const taskId = '44444444-4444-4444-8444-444444444444', now = '2026-10-20T00:00:00Z';
  const media = { id: mediaId, originalFilename: '视频测试.mp4', sizeBytes: 1000000, kind: 'VIDEO', status: 'READY', previewUrl: null,
    metadata: { container: 'mp4', durationMs: 5000, width: 160, height: 90, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  let plan = null, task = null, posts = 0, patches = 0, executes = 0, loseExecuteResponse = true;
  await page.route('**/api/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', message: '成功', data, requestId: 'fixture', details: [] }) });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, emailVerification: false, passwordRecovery: false, aiPlans: enabled,
      asr: false, semanticSearch: false, clipRecommendations: false, mediaTool: true, maxUploadBytes: 1073741824, maxDurationMs: 900000,
      supportedOperations: ['transcode', 'trim', 'mute'], asrProviders: [], subtitleCorrection: false });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: 'AI 测试', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now });
    if (url.pathname === '/api/media') return ok({ items: [media], page: 1, pageSize: 10, total: 1 });
    if (url.pathname === '/api/media/' + mediaId) return ok(media);
    if (url.pathname === '/api/operation-plans' && method === 'GET') return ok({ items: plan ? [plan] : [], page: 1, pageSize: 10, total: plan ? 1 : 0 });
    if (url.pathname === '/api/operation-plans' && method === 'POST') {
      posts++; const input = req.postDataJSON(); expect(input).toEqual({ mediaId, instruction: '压小一点' });
      expect(req.headers()['x-csrf-token']).toBe('fixture-csrf');
      plan = { id: planId, mediaId, instruction: input.instruction, version: 1, status: 'NEEDS_INPUT', parameters: null, summary: '请补充处理要求',
        questions: [{ code: 'TARGET_SIZE_REQUIRED', message: '请补充压缩后的目标体积，例如20MB。' }], warnings: [], taskId: null, createdAt: now, updatedAt: now };
      return ok(plan, 201);
    }
    if (url.pathname === '/api/operation-plans/' + planId && method === 'PATCH') {
      patches++; const input = req.postDataJSON(); expect(input).toEqual({ expectedVersion: 1, instruction: '改成截取前1秒' });
      plan = { ...plan, instruction: input.instruction, version: 2, status: 'READY', parameters: { operation: 'trim', outputFormat: 'mp4', startMs: 0, endMs: 1000, audioMode: 'keep' }, questions: [], summary: 'MP4 / 原分辨率 / 保留音轨 / 裁切 0-1000 毫秒' };
      return ok(plan);
    }
    if (url.pathname === '/api/operation-plans/' + planId + '/execute') {
      executes++; expect(req.postDataJSON()).toEqual({ expectedVersion: 2 });
      if (!task) task = { id: taskId, mediaId, planId, planVersion: 2, kind: 'MEDIA_PROCESSING', sourceId: planId, sourceVersion: 2,
        parameters: plan.parameters, status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100, outputs: [], transcript: null, error: null, createdAt: now };
      plan = { ...plan, status: 'EXECUTED', taskId };
      if (loseExecuteResponse) { loseExecuteResponse = false; return route.abort('failed'); }
      return ok(task);
    }
    if (url.pathname === '/api/tasks') return ok({ items: task ? [task] : [], page: 1, pageSize: 10, total: task ? 1 : 0 });
    if (url.pathname === '/api/tasks/' + taskId) return ok(task);
    throw new Error('Unexpected fixture request: ' + method + ' ' + url.pathname);
  });
  return { state: () => ({ posts, patches, executes, task, plan }) };
}

test('AI plans clarify, preserve version context, require confirmation and retry the same task', async ({ page }, testInfo) => {
  const errors = []; page.on('pageerror', (error) => errors.push(error.message)); page.on('dialog', (dialog) => dialog.accept());
  const app = await fixture(page);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await selectTool(page, 'ai');
  await expect(page.locator('#ai-state')).toHaveText('');
  await page.locator('#ai-instruction').fill('压小一点'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-plan-status')).toHaveText('待补充');
  await expect(page.locator('#ai-plan-questions')).toContainText('请补充压缩后的目标体积');
  await expect(page.locator('#execute-ai-plan')).toBeDisabled(); expect(app.state().task).toBeNull();
  await page.locator('#ai-instruction').fill('改成截取前1秒'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-plan-status')).toHaveText('待确认');
  await expect(page.locator('#ai-plan-parameters')).toContainText('0.000 至 1.000 秒');
  expect(app.state().posts).toBe(1); expect(app.state().patches).toBe(1); expect(app.state().task).toBeNull();
  for (const viewport of [{ width: 1365, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#ai-section').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('ai-plan-' + viewport.width + '.png'), fullPage: true });
  }
  await page.locator('#execute-ai-plan').click(); await expect(page.locator('#ai-error')).toBeVisible();
  await expect(page.locator('#execute-ai-plan')).toBeEnabled();
  await page.locator('#execute-ai-plan').click(); await expect(page.locator('#ai-plan-status')).toHaveText('已执行');
  await expect(page.locator('#ai-result-slot #conversion-result')).toBeVisible();
  await expect(page.locator('#task-status')).toHaveText('已完成');
  expect(app.state().executes).toBe(2); expect(app.state().posts).toBe(1); expect(app.state().plan.taskId).toBe(app.state().task.id);
  await selectTool(page, 'convert'); await expect(page.locator('#conversion-layout #conversion-result')).toBeVisible();
  await selectTool(page, 'ai'); await expect(page.locator('#ai-result-slot #conversion-result')).toBeVisible();
  await page.reload(); await selectTool(page, 'ai');
  await expect(page.locator('#ai-instruction')).toHaveValue('改成截取前1秒');
  await expect(page.locator('#ai-plan-status')).toHaveText('已执行');
  await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('missing DeepSeek credentials keep AI generation closed without disabling explicit tools', async ({ page }) => {
  const app = await fixture(page, false);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await selectTool(page, 'ai'); await page.locator('#ai-instruction').fill('截取前1秒');
  await expect(page.locator('#ai-state')).toHaveText('AI 服务尚未配置。'); await expect(page.locator('#generate-ai-plan')).toBeDisabled();
  await selectTool(page, 'convert'); await expect(page.locator('#start-conversion')).toBeEnabled();
  expect(app.state().posts).toBe(0);
});

async function compoundFixture(page, join = false) {
  const mediaId = '22222222-2222-4222-8222-222222222222', planId = '33333333-3333-4333-8333-333333333333', taskId = '44444444-4444-4444-8444-444444444444';
  const now = '2026-10-21T00:00:00Z';
  const media = { id: mediaId, originalFilename: '组合处理.mp4', sizeBytes: 2000000, status: 'READY', kind: 'VIDEO', previewUrl: null,
    metadata: { container: 'mov,mp4', durationMs: 20000, width: 640, height: 360, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  let plan = null, task = null, posts = 0, patches = 0, executes = 0;
  const exportParameters = { operation: 'export', outputFormat: 'mp4', videoCodec: 'h264', resolutionPreset: '360p', width: null, height: null,
    audioMode: 'mute', startMs: 0, endMs: 5000, targetSizeBytes: null, extractAudio: false };
  const joinParameters = { operation: 'join_clips', outputFormat: 'mp4', audioMode: 'keep', clips: [{ startMs: 0, endMs: 5000 }, { startMs: 15000, endMs: 20000 }] };
  await page.route('**/api/**', (route) => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method();
    const ok = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', data }) });
    if (path === '/api/auth/csrf') return ok({ token: 'fixture-csrf' });
    if (path === '/api/users/me') return ok({ id: 'fixture', username: 'fixture', displayName: '组合测试', email: 'fixture@example.com', emailVerified: true, createdAt: now });
    if (path === '/api/system/capabilities') return ok({ registration: false, aiPlans: true, mediaTool: true, asrProviders: [],
      supportedOperations: ['transcode', 'trim', 'mute', 'export', 'join_clips'], exportFormats: ['mp4'], exportVideoCodecs: ['h264'], maxUploadBytes: 1073741824, maxDurationMs: 900000 });
    if (path === '/api/media') return ok({ items: [media], total: 1, page: 1, pageSize: 10 });
    if (path === '/api/media/' + mediaId) return ok(media);
    if (path === '/api/operation-plans' && method === 'GET') return ok({ items: plan ? [plan] : [], total: plan ? 1 : 0, page: 1, pageSize: 10 });
    if (path === '/api/operation-plans' && method === 'POST') {
      posts++; const input = request.postDataJSON();
      plan = { id: planId, mediaId, version: 1, instruction: input.instruction, parameters: join ? null : exportParameters,
        status: join ? 'NEEDS_INPUT' : 'READY', summary: join ? '请补充处理要求' : 'MP4 / h264 / 360p / 裁切0-5000毫秒 / 静音',
        questions: join ? [{ code: 'CLIP_RANGES_REQUIRED', message: '请明确各片段要保留的时间区间和拼接顺序。' }] : [], warnings: [], taskId: null, createdAt: now, updatedAt: now };
      return ok(plan, 201);
    }
    if (path === '/api/operation-plans/' + planId && method === 'PATCH') {
      patches++; const input = request.postDataJSON(); expect(input.expectedVersion).toBe(plan.version);
      plan = { ...plan, version: plan.version + 1, instruction: join ? plan.instruction + '\n补充：' + input.instruction : input.instruction,
        parameters: join ? joinParameters : { ...exportParameters, resolutionPreset: '480p' }, questions: [], status: 'READY',
        summary: join ? 'MP4 / 原分辨率 / 拼接2段 / 10000毫秒' : 'MP4 / h264 / 480p / 裁切0-5000毫秒 / 静音' };
      return ok(plan);
    }
    if (path === '/api/operation-plans/' + planId + '/execute') {
      executes++; expect(request.postDataJSON().expectedVersion).toBe(plan.version);
      if (!task) task = { id: taskId, mediaId, planId, planVersion: plan.version, kind: 'MEDIA_PROCESSING', parameters: plan.parameters,
        status: 'SUCCEEDED', stage: 'DONE', outputs: [], progressPercent: 100, error: null, transcript: null, createdAt: now };
      plan = { ...plan, status: 'EXECUTED', taskId }; return ok(task);
    }
    if (path === '/api/tasks') return ok({ items: task ? [task] : [], total: task ? 1 : 0, page: 1, pageSize: 10 });
    if (path === '/api/tasks/' + taskId) return ok(task);
    throw new Error('Unexpected compound fixture request: ' + method + ' ' + path);
  });
  return { state: () => ({ plan, task, posts, patches, executes }) };
}

test('AI composite confirmation displays exact trim resolution and mute, preserves edits and executes once', async ({ page }, testInfo) => {
  const app = await compoundFixture(page); page.on('dialog', (d) => d.accept());
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'ai');
  await page.locator('#ai-instruction').fill('保留前5秒，压缩至360p，静音，发回来'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-plan-status')).toHaveText('待确认');
  const parameters = page.locator('#ai-plan-parameters'); await expect(parameters).toContainText('360p'); await expect(parameters).toContainText('0.000 至 5.000 秒'); await expect(parameters).toContainText('全部移除');
  expect(app.state().task).toBeNull();
  await page.locator('#ai-instruction').fill('改成480p，其他不变'); await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  await page.locator('#generate-ai-plan').click(); await expect(parameters).toContainText('480p'); await expect(parameters).toContainText('0.000 至 5.000 秒');
  for (const width of [1365, 390]) {
    await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#ai-section').screenshot({ path: testInfo.outputPath('compound-ai-' + width + '.png') });
  }
  await page.locator('#execute-ai-plan').click(); await expect(page.locator('#ai-plan-status')).toHaveText('已执行'); expect(app.state().executes).toBe(1);
  await page.reload(); await selectTool(page, 'ai'); await expect(parameters).toContainText('480p'); await expect(page.locator('#execute-ai-plan')).toBeDisabled();
});

test('ambiguous AI head and tail join retains its original requirement and shows both ordered intervals', async ({ page }) => {
  const app = await compoundFixture(page, true); page.on('dialog', (d) => d.accept());
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'ai');
  await page.locator('#ai-instruction').fill('剪切视频5秒和后五秒，拼接后发回来'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-plan-questions')).toContainText('拼接顺序'); await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  await page.locator('#ai-instruction').fill('第一段保留前5秒，最后5秒放后面'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-instruction')).toHaveValue(/剪切视频5秒和后五秒/);
  const rows = page.locator('#ai-plan-parameters > div');
  await expect(rows.filter({ hasText: '第 1 段' })).toContainText('0.000 至 5.000 秒');
  await expect(rows.filter({ hasText: '第 2 段' })).toContainText('15.000 至 20.000 秒');
  await expect(rows.filter({ hasText: '拼接总时长' })).toContainText('10.000 秒'); expect(app.state().task).toBeNull();
  await page.locator('#execute-ai-plan').click(); await expect(page.locator('#ai-plan-status')).toHaveText('已执行');
  expect(app.state().task.parameters.clips).toEqual([{ startMs: 0, endMs: 5000 }, { startMs: 15000, endMs: 20000 }]);
});
