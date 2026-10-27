const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');
const { selectTool } = require('./helpers/navigation.cjs');

async function fixture(page, local = false) {
  await serveStatic(page);
  const now = '2026-10-24T00:00:00Z', mediaId = '22222222-2222-4222-8222-222222222222';
  const transcriptId = '66666666-6666-4666-8666-666666666666', segmentId = '77777777-7777-4777-8777-777777777777';
  const state = { signedIn: true, userId: '11111111-1111-4111-8111-111111111111', calls: [], plan: null, task: null };
  const user = () => ({ id: state.userId, username: 'fixture_user', displayName: '确认测试', email: 'fixture@example.com', emailVerified: true, createdAt: now });
  const media = { id: mediaId, originalFilename: 'confirmation.mp4', kind: 'VIDEO', status: 'READY', sizeBytes: 123, previewUrl: null,
    metadata: { container: 'mp4', durationMs: 5000, width: 320, height: 180, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' }, createdAt: now, updatedAt: now };
  const segments = [{ id: segmentId, startMs: 0, endMs: 1000, text: '测试原文。' }];
  const transcript = { id: transcriptId, mediaId, version: 1, language: 'zh-CN', segments, originalSegments: segments, createdAt: now, updatedAt: now };
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method();
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ code: status === 401 ? 'UNAUTHENTICATED' : 'SUCCESS', data, details: [] }) });
    if (path === '/api/auth/csrf') return reply({ token: 'fixture-csrf' });
    if (path === '/api/users/me') return state.signedIn ? reply(user()) : reply(null, 401);
    if (path === '/api/auth/login') { state.signedIn = true; return reply({ user: user(), csrfToken: 'fixture-csrf' }); }
    if (path === '/api/auth/logout') { state.signedIn = false; return reply(null); }
    if (path === '/api/system/capabilities') return reply({ registration: false, mediaTool: true, supportedOperations: ['transcode'],
      aiPlans: true, semanticSearch: true, clipRecommendations: true, asr: true, asrProviders: ['tencent', 'aliyun'], subtitleCorrection: true, subtitleTranslation: true,
      textAi: { provider: local ? 'local' : 'deepseek', source: local ? 'SERVER' : 'PERSONAL', model: local ? 'qwen' : 'deepseek-chat', available: true } });
    if (path === '/api/users/me/cloud-credentials') return reply([]);
    if (path === '/api/media') return reply({ items: [media], total: 1, page: 1, pageSize: 10 });
    if (path === `/api/media/${mediaId}`) return reply(media);
    if (path === `/api/media/${mediaId}/transcript` || path === `/api/transcripts/${transcriptId}`) return reply(transcript);
    if (path === '/api/tasks') return reply({ items: state.task ? [state.task] : [], total: state.task ? 1 : 0, page: 1, pageSize: 10 });
    if (state.task && path === '/api/tasks/' + state.task.id) return reply(state.task);
    if (path === '/api/operation-plans' && method === 'GET') return reply({ items: state.plan ? [state.plan] : [], total: state.plan ? 1 : 0, page: 1, pageSize: 10 });
    if (method === 'POST' || method === 'PATCH') {
      state.calls.push({ path, body: request.postDataJSON() });
      if (path === '/api/operation-plans' || path.startsWith('/api/operation-plans/')) {
        state.plan = { id: '33333333-3333-4333-8333-333333333333', mediaId, version: (state.plan?.version || 0) + 1, instruction: request.postDataJSON().instruction,
          status: 'NEEDS_INPUT', parameters: null, summary: '测试方案', questions: [], warnings: [], taskId: null, createdAt: now, updatedAt: now };
        return reply(state.plan);
      }
      if (path.endsWith('/search')) return reply({ mediaId, transcriptId, transcriptVersion: 1, matches: [], message: '未找到相关内容。' });
      if (path.endsWith('/clip-recommendations')) return reply({ mediaId, transcriptId, transcriptVersion: 1, clips: [], message: '未找到相关片段。' });
      if (path.endsWith('/corrections')) return reply({ transcriptId, version: 1, segmentId, originalText: segments[0].text, correctedText: '校对建议。' });
      if (path.endsWith('/translations')) return reply({ transcriptId, transcriptVersion: 1, targetLanguage: request.postDataJSON().targetLanguage, segments: [{ ...segments[0], text: 'Translated text.' }] });
      if (path.endsWith('/transcriptions')) {
        state.task = { id: '44444444-4444-4444-8444-444444444444', mediaId, kind: 'TRANSCRIPTION', status: 'SUCCEEDED', stage: 'DONE', progressPercent: 100,
          transcript: { transcriptId, version: 1 }, outputs: [], error: null, createdAt: now };
        return reply(state.task);
      }
    }
    throw new Error('Unexpected fixture request: ' + method + ' ' + path);
  });
  page.on('dialog', dialog => { throw new Error('Unexpected native dialog: ' + dialog.message()); });
  await page.goto('/'); await expect(page.locator('#media-status')).toHaveText('已就绪');
  return state;
}

async function openSettings(page) {
  await page.locator('#header-account').click(); await page.locator('#account-cloud-tab').click();
  await expect(page.locator('#skip-cloud-confirmation')).toBeVisible();
}
async function start(page, feature) {
  if (feature === 'ai') {
    await selectTool(page, 'ai'); await page.locator('#ai-instruction').fill('保留前1秒'); await page.locator('#generate-ai-plan').click();
  } else if (feature === 'find' || feature === 'recommend') {
    await selectTool(page, 'find'); await expect(page.locator('#find-state')).toHaveText('字幕 v1');
    if (feature === 'recommend') await page.locator('input[name="find-mode"][value="recommend"]').check();
    await page.locator('#find-query').fill('寻找测试内容'); await page.locator('#find-submit').click();
  } else {
    await selectTool(page, 'subtitle'); await expect(page.locator('#subtitle-editor')).toBeVisible();
    if (feature === 'correct') await page.getByRole('button', { name: '校对第1段', exact: true }).click();
    else if (feature === 'translate') await page.locator('#translate-subtitle').click();
    else { await page.locator('#asr-provider').selectOption(feature); await page.locator('#start-transcription').click(); }
  }
}

for (const feature of ['ai', 'find', 'recommend', 'correct', 'translate', 'tencent', 'aliyun']) {
  test(`${feature} waits for the styled cloud confirmation and sends exactly once`, async ({ page }) => {
    const state = await fixture(page); await start(page, feature);
    await expect(page.locator('#cloud-confirm-dialog')).toBeVisible(); expect(state.calls).toHaveLength(0);
    await expect(page.locator('#cloud-confirm-provider')).toHaveText(feature === 'tencent' ? '腾讯云' : feature === 'aliyun' ? '阿里云百炼' : 'DeepSeek');
    await expect(page.locator('#cloud-confirm-fee')).toContainText('可能产生服务费用');
    await expect(page.locator('#cloud-confirm-skip-row')).toHaveText('本次登录不再提示');
    if (feature === 'translate') await expect(page.locator('#cloud-confirm-detail')).toContainText('1 段字幕，分 1 批');
    await page.locator('#accept-cloud-confirm').click(); await expect.poll(() => state.calls.length).toBe(1);
    await expect(page.locator('#cloud-confirm-dialog')).toBeHidden();
  });
  test(`${feature} honors the setting for this login`, async ({ page }) => {
    const state = await fixture(page); await openSettings(page); await page.locator('#skip-cloud-confirmation').check(); await page.locator('#back-workbench').click();
    await start(page, feature); await expect.poll(() => state.calls.length).toBe(1); await expect(page.locator('#cloud-confirm-dialog')).toBeHidden();
  });
}

for (const width of [1365, 390, 320]) test(`cloud dialog is keyboard accessible and fits ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 844 }); const state = await fixture(page); await start(page, 'ai');
  const dialog = page.getByRole('dialog', { name: '确认调用云端服务' }); await expect(dialog).toBeVisible();
  await expect(page.locator('#cancel-cloud-confirm')).toBeFocused();
  const box = await dialog.boundingBox(); expect(box.x).toBeGreaterThanOrEqual(16); expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  for (let index = 0; index < 8; index++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true); }
  expect(await page.locator('#accept-cloud-confirm span').evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(25);
  await page.screenshot({ path: testInfo.outputPath(`cloud-confirm-${width}.png`), animations: 'disabled' });
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); expect(state.calls).toHaveLength(0);
  await expect(page.locator('#generate-ai-plan')).toBeFocused();
});

test('cancel close and Escape never commit the checkbox or call a supplier', async ({ page }) => {
  const state = await fixture(page);
  for (const action of ['cancel-cloud-confirm', 'close-cloud-confirm', 'escape']) {
    await start(page, 'ai'); await page.locator('#cloud-confirm-skip').check();
    if (action === 'escape') await page.keyboard.press('Escape'); else await page.locator('#' + action).click();
    await expect(page.locator('#cloud-confirm-dialog')).toBeHidden(); expect(state.calls).toHaveLength(0);
    expect(await page.evaluate(() => localStorage.getItem('amw-cloud-confirmation'))).toBeNull();
  }
});

test('accepted suppression survives reload, synchronizes with settings and resets on a new login', async ({ page }) => {
  const state = await fixture(page); await start(page, 'ai'); await page.locator('#cloud-confirm-skip').check(); await page.locator('#accept-cloud-confirm').click();
  await expect.poll(() => state.calls.length).toBe(1); await openSettings(page); await expect(page.locator('#skip-cloud-confirmation')).toBeChecked();
  await page.reload(); await expect(page.locator('#media-status')).toHaveText('已就绪'); await start(page, 'ai'); await expect.poll(() => state.calls.length).toBe(2);
  await expect(page.locator('#cloud-confirm-dialog')).toBeHidden();
  await openSettings(page); await page.locator('#skip-cloud-confirmation').uncheck(); await page.locator('#back-workbench').click();
  await start(page, 'ai'); await expect(page.locator('#cloud-confirm-dialog')).toBeVisible(); await page.locator('#cancel-cloud-confirm').click();
  await openSettings(page); await page.locator('#skip-cloud-confirmation').check(); await page.locator('#header-logout').click();
  await expect(page.locator('#auth-view')).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('amw-cloud-confirmation'))).toBeNull();
  await page.locator('#login-username').fill('fixture_user'); await page.locator('#login-password').fill('Abc123'); await page.locator('#login-form button[type="submit"]').click();
  await expect(page.locator('#media-status')).toHaveText('已就绪'); await start(page, 'ai'); await expect(page.locator('#cloud-confirm-dialog')).toBeVisible();
  expect(state.calls).toHaveLength(2);
});

test('preferences do not apply to another account and disabled storage still permits this page to opt out', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('amw-cloud-confirmation', JSON.stringify({ owner: 'another-user', skip: true })));
  const state = await fixture(page); await start(page, 'ai'); await expect(page.locator('#cloud-confirm-dialog')).toBeVisible();
  await page.locator('#cancel-cloud-confirm').click();
  await page.evaluate(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }); });
  await start(page, 'ai'); await page.locator('#cloud-confirm-skip').check(); await page.locator('#accept-cloud-confirm').click();
  await expect.poll(() => state.calls.length).toBe(1); await start(page, 'ai'); await expect.poll(() => state.calls.length).toBe(2);
  await expect(page.locator('#cloud-confirm-dialog')).toBeHidden();
});

test('duplicate clicks do not share approval and an account change cancels pending approval', async ({ page }) => {
  const state = await fixture(page); await start(page, 'ai');
  await page.evaluate(() => { for (let index = 0; index < 5; index++) document.getElementById('ai-form').requestSubmit(); });
  expect(state.calls).toHaveLength(0); await page.locator('#accept-cloud-confirm').click(); await expect.poll(() => state.calls.length).toBe(1);
  await start(page, 'ai');
  await page.evaluate(() => { const channel = new BroadcastChannel('amw-account'); channel.postMessage('account-changed'); channel.close(); });
  await expect(page.locator('#cloud-confirm-dialog')).toBeHidden(); expect(state.calls).toHaveLength(1);
});

test('local text AI needs no fee prompt and local translation retains its batch confirmation', async ({ page }) => {
  const state = await fixture(page, true); await start(page, 'ai'); await expect.poll(() => state.calls.length).toBe(1);
  await expect(page.locator('#cloud-confirm-dialog')).toBeHidden();
  await openSettings(page); await page.locator('#skip-cloud-confirmation').check(); await page.locator('#back-workbench').click();
  await start(page, 'translate'); await expect(page.locator('#cloud-confirm-dialog')).toBeVisible();
  await expect(page.locator('#cloud-confirm-title')).toHaveText('确认字幕翻译');
  await expect(page.locator('#cloud-confirm-fee')).toBeHidden(); await expect(page.locator('#cloud-confirm-skip-row')).toBeHidden();
  expect(state.calls).toHaveLength(1); await page.locator('#accept-cloud-confirm').click(); await expect.poll(() => state.calls.length).toBe(2);
});

test('settings synchronize across tabs without exposing any credential', async ({ page, context }) => {
  await fixture(page); await openSettings(page);
  const other = await context.newPage(); await fixture(other); await openSettings(other);
  await page.locator('#skip-cloud-confirmation').check(); await expect(other.locator('#skip-cloud-confirmation')).toBeChecked();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('amw-cloud-confirmation')))).toEqual({ owner: '11111111-1111-4111-8111-111111111111', skip: true });
  await other.locator('#skip-cloud-confirmation').uncheck(); await expect(page.locator('#skip-cloud-confirmation')).not.toBeChecked();
  await other.close();
});

test('short screens can scroll the dialog and confirm without overflowing the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 480 }); const state = await fixture(page); await start(page, 'translate');
  await expect.poll(() => page.locator('#cloud-confirm-dialog').evaluate(element => element.getAnimations().length)).toBe(0);
  const box = await page.locator('#cloud-confirm-dialog').boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(16); expect(box.y + box.height).toBeLessThanOrEqual(464);
  await page.locator('#accept-cloud-confirm').click(); await expect.poll(() => state.calls.length).toBe(1);
});
