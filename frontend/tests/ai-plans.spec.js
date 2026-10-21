const { test, expect } = require('@playwright/test');

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
  await page.locator('#ai-tool').click();
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
  await page.locator('#convert-tool').click(); await expect(page.locator('#conversion-layout #conversion-result')).toBeVisible();
  await page.locator('#ai-tool').click(); await expect(page.locator('#ai-result-slot #conversion-result')).toBeVisible();
  await page.reload(); await page.locator('#ai-tool').click();
  await expect(page.locator('#ai-instruction')).toHaveValue('改成截取前1秒');
  await expect(page.locator('#ai-plan-status')).toHaveText('已执行');
  await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('missing DeepSeek credentials keep AI generation closed without disabling explicit tools', async ({ page }) => {
  const app = await fixture(page, false);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  await page.locator('#ai-tool').click(); await page.locator('#ai-instruction').fill('截取前1秒');
  await expect(page.locator('#ai-state')).toHaveText('AI 服务尚未配置。'); await expect(page.locator('#generate-ai-plan')).toBeDisabled();
  await page.locator('#convert-tool').click(); await expect(page.locator('#start-conversion')).toBeEnabled();
  expect(app.state().posts).toBe(0);
});
