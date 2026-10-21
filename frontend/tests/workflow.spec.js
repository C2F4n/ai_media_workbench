const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

async function fixture(page, ai = false) {
  await serveStatic(page);
  const mediaId = '22222222-2222-4222-8222-222222222222', planId = '33333333-3333-4333-8333-333333333333', taskId = '44444444-4444-4444-8444-444444444444';
  const now = '2026-10-21T00:00:00Z';
  const media = { id: mediaId, originalFilename: 'workflow.mp4', sizeBytes: 2000000, status: 'READY', kind: 'VIDEO', previewUrl: null,
    metadata: { container: 'mov', durationMs: 20000, width: 1920, height: 1080, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  let plan = null, task = null, posts = [], patches = [], executes = 0;
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    const ok = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ code: 'SUCCESS', message: '成功', data, details: [], requestId: 'fixture' }) });
    if (url.pathname === '/api/system/capabilities') return ok({ registration: false, aiPlans: ai, mediaTool: true, asr: false, asrProviders: [], maxUploadBytes: 1073741824, maxDurationMs: 900000,
      supportedOperations: ['transcode', 'trim', 'mute', 'export', 'workflow'], exportFormats: ['mp4', 'webm', 'mp3', 'flac'], exportVideoCodecs: ['h264', 'vp9'] });
    if (url.pathname === '/api/auth/csrf') return ok({ token: 'fixture-csrf', headerName: 'X-CSRF-Token' });
    if (url.pathname === '/api/users/me') return ok({ id: '11111111-1111-4111-8111-111111111111', username: 'fixture', displayName: '测试', email: 'fixture@example.com', emailVerified: true, createdAt: now, updatedAt: now });
    if (url.pathname === '/api/media') return ok({ items: [media], page: 1, pageSize: 10, total: 1 });
    if (url.pathname === '/api/media/' + mediaId) return ok(media);
    if (url.pathname === '/api/operation-plans' && method === 'GET') return ok({ items: plan ? [plan] : [], page: 1, pageSize: 10, total: plan ? 1 : 0 });
    if (url.pathname === '/api/operation-plans' && method === 'POST' || url.pathname === '/api/operation-plans/' + planId && method === 'PATCH') {
      const body = req.postDataJSON(); (method === 'POST' ? posts : patches).push(body);
      expect(req.headers()['x-csrf-token']).toBe('fixture-csrf');
      const parameters = body.parameters || { operation: 'workflow', outputFormat: 'mp4', steps: [{ operation: 'trim', startMs: 0, endMs: 5000 }, { operation: 'resize', resolutionPreset: '360p', width: null, height: null }, { operation: 'export', outputFormat: 'mp4', videoCodec: 'h264', targetSizeBytes: null, extractAudio: false }] };
      plan = { id: planId, mediaId, version: (plan?.version || 0) + 1, status: 'READY', instruction: body.instruction || null, parameters,
        summary: `顺序处理 / ${parameters.steps.length} 步 / ${parameters.outputFormat.toUpperCase()}`, questions: [], warnings: [], taskId: null, createdAt: now, updatedAt: now };
      return ok(plan);
    }
    if (url.pathname === '/api/operation-plans/' + planId + '/execute') {
      executes++; expect(req.postDataJSON()).toEqual({ expectedVersion: plan.version });
      task = { id: taskId, mediaId, planId, planVersion: plan.version, kind: 'MEDIA_PROCESSING', parameters: plan.parameters, status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100, outputs: [], error: null, createdAt: now };
      plan = { ...plan, status: 'EXECUTED', taskId }; return ok(task);
    }
    if (url.pathname === '/api/tasks') return ok({ items: task ? [task] : [], page: 1, pageSize: 10, total: task ? 1 : 0 });
    if (url.pathname === '/api/tasks/' + taskId) return ok(task);
    throw new Error(`Unexpected fixture request: ${method} ${url.pathname}`);
  });
  return { state: () => ({ plan, task, posts, patches, executes }) };
}

for (const width of [1365, 390]) test(`manual ordered workflow edits moves saves confirms and restores without cloud API at ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 1000 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const app = await fixture(page);
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'ai');
  await expect(page.locator('#generate-ai-plan')).toBeDisabled();
  await page.locator('#workflow-step-mode').click(); await expect(page.locator('#workflow-save')).toBeEnabled();
  await expect(page.locator('#dependency-kind')).toHaveText('本地处理');
  await page.locator('#workflow-add').click();
  await page.getByLabel('步骤 1 操作', { exact: true }).selectOption('join_clips');
  await page.getByRole('button', { name: '步骤 1 添加区间', exact: true }).click();
  const first = page.locator('.workflow-step').nth(0);
  await first.getByLabel('片段 2 开始（秒）', { exact: true }).fill('15');
  await first.getByLabel('结束（秒）', { exact: true }).nth(1).fill('20');
  await page.locator('#workflow-add').click(); await page.getByLabel('步骤 2 操作', { exact: true }).selectOption('resize');
  await page.locator('#workflow-add').click();
  const third = page.locator('.workflow-step').nth(2);
  await third.getByLabel('开始（上一步结果，秒）').fill('1'); await third.getByLabel('结束（秒）', { exact: true }).fill('8');
  await page.locator('#workflow-add').click(); await page.getByLabel('步骤 4 操作', { exact: true }).selectOption('mute');
  await page.getByRole('button', { name: '上移步骤 3', exact: true }).click();
  await expect(page.getByLabel('步骤 2 操作', { exact: true })).toHaveValue('trim');
  await page.getByRole('button', { name: '下移步骤 2', exact: true }).click();
  await expect(page.getByLabel('步骤 2 操作', { exact: true })).toHaveValue('resize');
  await page.locator('#workflow-size').fill('0.5'); await page.locator('#workflow-audio').check();
  await page.locator('#workflow-save').click(); await expect(page.locator('#ai-plan-status')).toHaveText('待确认');
  expect(app.state().executes).toBe(0); expect(app.state().posts).toHaveLength(1);
  const parameters = app.state().posts[0].parameters;
  expect(parameters.steps.map(s => s.operation)).toEqual(['join_clips', 'resize', 'trim', 'mute', 'export']);
  expect(parameters.steps[0].clips).toEqual([{ startMs: 0, endMs: 5000 }, { startMs: 15000, endMs: 20000 }]);
  expect(parameters.steps.at(-1)).toMatchObject({ targetSizeBytes: 524288, extractAudio: true });
  await expect(page.locator('#ai-plan-parameters')).toContainText('步骤 5');
  await page.getByRole('button', { name: '删除步骤 4', exact: true }).click(); await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  await page.locator('#workflow-save').click(); await expect(page.locator('#ai-plan-summary')).toContainText('4 步');
  expect(app.state().patches[0].expectedVersion).toBe(1);
  await page.screenshot({ path: testInfo.outputPath(`workflow-${width}.png`), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#execute-ai-plan').click(); await expect(page.locator('#ai-plan-status')).toHaveText('已执行');
  expect(app.state().executes).toBe(1); await expect(page.locator('#task-stage')).toContainText('4 步');
  await page.reload(); await selectTool(page, 'ai'); await page.locator('#workflow-step-mode').click();
  await expect(page.locator('#workflow-steps .workflow-step')).toHaveCount(3); await expect(page.locator('#workflow-size')).toHaveValue('0.5');
  await expect(page.locator('#ai-plan-status')).toHaveText('已执行'); await expect(page.locator('#execute-ai-plan')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('invalid later ranges are rejected locally and AI workflows can be edited with the same step form', async ({ page }) => {
  const app = await fixture(page, true); let dialogs = 0;
  page.on('dialog', async dialog => { dialogs++; await dialog.accept(); });
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪'); await selectTool(page, 'ai');
  await page.locator('#ai-instruction').fill('保留前5秒，360p导出'); await page.locator('#generate-ai-plan').click();
  await expect(page.locator('#ai-plan-parameters')).toContainText('步骤 3');
  await page.getByRole('button', { name: '编辑步骤', exact: true }).click();
  await expect(page.locator('#workflow-steps .workflow-step')).toHaveCount(2);
  await page.locator('#workflow-add').click();
  await page.locator('.workflow-step').nth(2).getByLabel('结束（秒）', { exact: true }).fill('6');
  await page.locator('#workflow-save').click(); await expect(page.locator('#workflow-error')).toContainText('当前结果长 5.000 秒');
  expect(app.state().patches).toHaveLength(0); expect(dialogs).toBe(1);
  await page.getByRole('button', { name: '删除步骤 3', exact: true }).click();
  await page.locator('#workflow-format').selectOption('flac'); await expect(page.locator('#workflow-codec-field')).toBeHidden();
  await page.locator('#workflow-save').click(); await expect(page.locator('#ai-plan-status')).toHaveText('待确认');
  expect(app.state().patches[0].parameters.steps.at(-1)).toEqual({ operation: 'export', outputFormat: 'flac', videoCodec: null, targetSizeBytes: null, extractAudio: false });
  expect(dialogs).toBe(1); expect(app.state().executes).toBe(0);
});
