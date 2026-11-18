const { test, expect } = require('@playwright/test');
const { serveStatic } = require('./helpers/static.cjs');

async function openWorkbench(page, workspaceApi) {
  await serveStatic(page);
  let signedIn = true;
  const paths = [];
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    paths.push(path);
    const reply = data => route.fulfill({ json: { code: 'SUCCESS', data } });
    if (path === '/api/auth/csrf') return reply({ token: 'home-fixture' });
    if (path === '/api/auth/logout') { signedIn = false; return reply(null); }
    if (path === '/api/system/capabilities') return reply({
      registration: true, mediaTool: true, maxUploadBytes: 3 * 1024 ** 3,
      supportedOperations: ['transcode', 'compress', 'extract_audio', 'trim', 'join_clips', 'mute', 'export', 'workflow'],
      exportFormats: ['mp4', 'mp3', 'wav'], exportVideoCodecs: ['h264']
    });
    if (path === '/api/users/me') {
      return signedIn ? reply({
        id: 'home-fixture-user', username: 'demo_user', displayName: '示例账号',
        email: 'demo@example.com', emailVerified: true, createdAt: '2026-11-17T00:00:00Z'
      }) : route.fulfill({ status: 401, json: { code: 'UNAUTHENTICATED', data: null } });
    }
    if (path === '/api/users/me/cloud-credentials') return reply([]);
    const handled = workspaceApi?.(route, path, reply);
    if (handled) return handled;
    return reply({ items: [], total: 0 });
  });
  await page.goto('/');
  await expect(page.getByRole('region', { name: '工作台主界面' })).toBeVisible();
  return paths;
}

test('the new home uses its own navigation and opens each set of tools', async ({ page }) => {
  const paths = await openWorkbench(page);
  const sidebar = page.locator('#workspace-home-sidebar');
  const workspace = page.getByRole('region', { name: '工作台主界面' });
  await expect(page.locator('#app-header')).toBeHidden();
  await expect(page.locator('#tool-sidebar')).toBeHidden();
  const panel = workspace.getByRole('tabpanel', { name: '视频检测', exact: true });
  await expect(panel.getByRole('button', { name: '选择视频' })).toBeVisible();
  await expect(panel.getByRole('heading', { name: '检测结果' })).toBeVisible();
  await expect(sidebar).toHaveCSS('width', '82px');
  await sidebar.hover({ position: { x: 28, y: 145 } });
  await expect(sidebar).toHaveCSS('width', '244px');
  await expect(sidebar.getByText('查看旧版工作台')).toHaveCount(0);
  const categoryButtons = sidebar.getByRole('navigation').getByRole('button');
  const sections = [
    { label: '常规处理', tabs: ['视频检测', '视频转换', '视频压缩', '提取音频', '视频裁切', '片段拼接', '视频静音'] },
    { label: 'AI协作处理', tabs: ['字幕处理', 'AI 处理', '找片段'] },
    { label: '历史记录', tabs: ['处理记录'] }
  ];
  await expect(categoryButtons).toHaveCount(3);
  await expect(categoryButtons.first()).toHaveAttribute('aria-current', 'page');
  for (const [index, { label, tabs }] of sections.entries()) {
    const category = categoryButtons.nth(index);
    await expect(category).toHaveAccessibleName(label);
    await category.click();
    await expect(category).toHaveAttribute('aria-current', 'page');
    await expect(workspace.getByRole('heading', { name: label, exact: true, level: 1 })).toBeVisible();
    await expect(workspace.getByRole('tablist', { name: label + '子功能', exact: true }).getByRole('tab')).toHaveText(tabs);
  }
  await expect(page.locator('#history-panel')).toBeVisible();
  await page.mouse.move(880, 300);
  await expect(sidebar).toHaveCSS('width', '82px');
  expect(paths).toContain('/api/media');
  expect(paths).toContain('/api/tasks');
});

test('the detection library has its own scroll and moves to the import page when needed', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 650 });
  const media = Array.from({ length: 10 }, (_, index) => ({
    id: 'asset-' + index, originalFilename: `素材 ${index + 1}.mp4`, sizeBytes: 1500000, status: 'READY',
    metadata: { container: 'mp4', durationMs: 5200, width: 960, height: 540, videoCodec: 'h264', hasAudio: false }
  }));
  await openWorkbench(page, (route, path, reply) => {
    if (path === '/api/media') return reply({ items: media, total: media.length });
  });
  const preview = page.getByRole('region', { name: '素材预览', exact: true });
  const results = page.getByRole('region', { name: '检测结果', exact: true });
  const library = page.locator('#detect-library-slot');
  await expect(library.locator('#media-list > li')).toHaveCount(media.length);
  const surface = 'rgb(255, 255, 255)';
  await expect(page.locator('.workspace-home-content')).toHaveCSS('background-color', surface);
  await expect(page.locator('#workspace-tool-panel-detect')).toHaveCSS('background-color', surface);
  await expect(page.locator('#workspace-tool-panel-detect')).toHaveCSS('background-image', 'none');
  for (const pane of [preview, results, library]) await expect(pane).toHaveCSS('background-color', surface);
  const previewBounds = await preview.boundingBox();
  const resultsBounds = await results.boundingBox();
  const libraryBounds = await library.boundingBox();
  expect(previewBounds.x + previewBounds.width).toBeLessThan(resultsBounds.x);
  expect(resultsBounds.x + resultsBounds.width).toBeLessThan(libraryBounds.x);
  const tabs = page.getByRole('tablist', { name: '常规处理子功能', exact: true });
  const tabBounds = await tabs.boundingBox();
  const detectionBody = page.locator('#workspace-tool-panel-detect .workspace-tool-panel-body');
  expect(await detectionBody.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  await library.hover();
  await page.mouse.wheel(0, 600);
  await expect.poll(() => library.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  expect(await preview.boundingBox()).toEqual(previewBounds);
  expect(await results.boundingBox()).toEqual(resultsBounds);
  expect(await tabs.boundingBox()).toEqual(tabBounds);
  expect(await preview.evaluate(element => element.scrollTop)).toBe(0);
  expect(await results.evaluate(element => element.scrollTop)).toBe(0);

  await tabs.getByRole('tab', { name: '视频转换', exact: true }).click();
  await page.getByRole('tab', { name: '导入', exact: true }).click();
  await expect(page.locator('#import-library-slot #media-list > li')).toHaveCount(media.length);
  await expect(page.locator('#recent-section')).toHaveCount(1);
});

test('new video detection stages a file, polls the service, and supports retrying a failed detection', async ({ page }) => {
  const id = '4934a446-58ad-456d-8a42-72a4d92f2190';
  const item = { id, originalFilename: '测试素材.webm', sizeBytes: 512, status: 'PROBING', metadata: null, previewUrl: null };
  let retried = false;
  let previewRequested = false;
  let uploaded = false;
  await openWorkbench(page, (route, path, reply) => {
    if (path === '/api/media') {
      if (route.request().method() === 'GET') return reply({ items: [], page: 1, pageSize: 10, total: 0 });
      expect(route.request().method()).toBe('POST');
      expect(route.request().headers()['x-csrf-token']).toBe('home-fixture');
      expect(route.request().postData()).toContain('测试素材.webm');
      uploaded = true;
      return reply(item);
    }
    if (path.endsWith('/probe')) {
      expect(route.request().method()).toBe('POST');
      retried = true;
      return reply(item);
    }
    if (path.endsWith('/preview')) {
      previewRequested = true;
      return route.fulfill({ status: 415, body: '' });
    }
    if (path !== `/api/media/${id}`) return;
    if (!retried) return reply({ ...item, status: 'FAILED', error: { message: '视频检测失败，请重试。' } });
    return reply({ ...item, status: 'READY', metadata: {
      width: 1920, height: 1080, durationMs: 7250, container: 'webm', videoCodec: 'vp9',
      hasAudio: true, audioCodec: 'opus', bitRate: 2280000, videoBitRate: 2152000,
      audioBitRate: 128000, frameRate: 29.97003, sampleRate: 48000,
      channels: 2, channelLayout: 'stereo', pixelFormat: 'yuv420p'
    }, previewUrl: `/api/media/${id}/preview` });
  });
  const workspace = page.getByRole('region', { name: '工作台主界面' });
  const panel = workspace.getByRole('tabpanel', { name: '视频检测', exact: true });
  const detection = panel.locator('.media-detect');
  const file = detection.locator('input[type=file]');
  await file.setInputFiles({ name: '空白.webm', mimeType: 'video/webm', buffer: Buffer.alloc(0) });
  await expect(panel.getByRole('alert')).toHaveText('请选择非空的视频文件。');
  await file.setInputFiles({ name: item.originalFilename, mimeType: 'video/webm', buffer: Buffer.alloc(item.sizeBytes) });
  await expect(detection.getByText(item.originalFilename)).toBeVisible();
  expect(uploaded).toBe(false);

  await panel.getByRole('button', { name: '上传并检测' }).click();
  await expect(detection.getByRole('status')).toHaveText('检测中');
  await expect(panel.getByRole('alert')).toHaveText('视频检测失败，请重试。');
  await panel.getByRole('button', { name: '重新检测' }).click();
  await expect(detection.getByRole('status')).toHaveText('已完成');
  await expect(detection.getByText('1920 × 1080', { exact: false })).toBeVisible();
  await expect(detection.getByText('7.25 秒')).toBeVisible();
  await expect(detection.getByText('VP9')).toBeVisible();
  await expect(detection.getByText('OPUS')).toBeVisible();
  await expect(detection.getByText('2.28 Mbps', { exact: true })).toBeVisible();
  await expect(detection.getByText('2.152 Mbps', { exact: true })).toBeVisible();
  await expect(detection.getByText('128 kbps', { exact: true })).toBeVisible();
  await expect(detection.getByText('29.97 fps', { exact: true })).toBeVisible();
  await expect(detection.getByText('48 kHz', { exact: true })).toBeVisible();
  await expect(detection.getByText('双声道 · stereo', { exact: true })).toBeVisible();
  await expect.poll(() => previewRequested).toBe(true);
  await expect(panel.getByRole('button', { name: '重新加载预览' })).toBeVisible();
  await workspace.getByRole('tab', { name: '视频转换' }).click();
  await expect(page.locator('#editor-filename')).toHaveText(item.originalFilename);
  await expect(page.locator('#editor-metadata')).toContainText('2.28 Mbps');
  await expect(page.locator('#editor-metadata')).toContainText('29.97 fps');
  await expect(page.getByRole('button', { name: '开始转换', exact: true })).toBeEnabled();
  await workspace.getByRole('tab', { name: '视频检测' }).click();
  await expect(detection.getByText('7.25 秒')).toBeVisible();
});

test('every tool opens its editor and a submitted task can be reopened from history', async ({ page }) => {
  const media = { id: 'fixture-media', originalFilename: '素材.mp4', sizeBytes: 1800000, status: 'READY',
    metadata: { container: 'mp4', durationMs: 12000, width: 1280, height: 720, videoCodec: 'h264', hasAudio: true, audioCodec: 'aac' } };
  let plan, task;
  await openWorkbench(page, (route, path, reply) => {
    if (path === '/api/media') return reply({ items: [media], total: 1 });
    if (path === '/api/media/' + media.id) return reply(media);
    if (path === '/api/operation-plans' && route.request().method() === 'POST') {
      plan = { id: 'fixture-plan', version: 1, status: 'READY', ...route.request().postDataJSON() };
      return reply(plan);
    }
    if (path === '/api/operation-plans/fixture-plan/execute') {
      expect(route.request().postDataJSON()).toEqual({ expectedVersion: 1 });
      task = { id: 'fixture-task', mediaId: media.id, planId: plan.id, planVersion: 1,
        kind: 'MEDIA_PROCESSING', status: 'SUCCEEDED', stage: 'DONE', parameters: plan.parameters,
        createdAt: '2026-11-17T00:00:00Z', outputs: [] };
      return reply(task);
    }
    if (path === '/api/tasks') return reply({ items: task ? [task] : [], total: task ? 1 : 0 });
  });
  const workspace = page.getByRole('region', { name: '工作台主界面' });
  const sidebar = page.locator('#workspace-home-sidebar');
  for (const [label, control] of [
    ['视频转换', '#export-format'], ['视频压缩', '#compression-target'], ['提取音频', '#export-audio-format'],
    ['视频裁切', '#trim-start'], ['片段拼接', '#join-form'], ['视频静音', '#conversion-form']
  ]) {
    await workspace.getByRole('tab', { name: label, exact: true }).click();
    const panel = workspace.getByRole('tabpanel', { name: label, exact: true });
    await expect(panel.locator(control)).toBeVisible();
    await expect(panel.locator('#editor-filename')).toHaveText(media.originalFilename);
    await expect(panel.locator('.editor-inspector #editor-filename')).toHaveText(media.originalFilename);
    await expect(panel.locator('#editor-metadata')).toContainText('总码率（估算）');
    await expect(workspace.locator('.workspace-subnav:visible').getByRole('tablist', { name: '处理流程' })).toBeVisible();
  }
  await sidebar.getByRole('button', { name: 'AI协作处理' }).click();
  for (const [label, control] of [
    ['字幕处理', '#subtitle-section'], ['AI 处理', '#workflow-mode'], ['找片段', '#find-form']
  ]) {
    await workspace.getByRole('tab', { name: label, exact: true }).click();
    await expect(workspace.getByRole('tabpanel', { name: label, exact: true }).locator(control)).toBeVisible();
    await expect(workspace.locator('#workspace-subnav-ai').getByRole('tablist', { name: '处理流程' })).toBeVisible();
  }

  await sidebar.getByRole('button', { name: '常规处理' }).click();
  await workspace.getByRole('tab', { name: '视频静音', exact: true }).click();
  await page.locator('#phase-import-tab').click();
  await expect(page.getByRole('button', { name: /^素材\.mp4/ })).toBeVisible();
  await page.getByRole('button', { name: /^素材\.mp4/ }).click();
  await page.locator('#conversion-resolution').selectOption('360p');
  await page.getByRole('button', { name: '开始静音', exact: true }).click();
  await expect(page.locator('#phase-export')).toBeVisible();
  expect(plan.mediaId).toBe(media.id);
  expect(plan.parameters).toMatchObject({ operation: 'export', audioMode: 'mute', resolutionPreset: '360p' });
  await sidebar.getByRole('button', { name: '历史记录', exact: true }).click();
  await expect(page.locator('#task-list > li')).toHaveCount(1);
  await page.getByRole('button', { name: '打开处理结果', exact: true }).click();
  await expect(workspace.getByRole('tab', { name: '视频静音', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#phase-export')).toBeVisible();
});

test('tool tabs magnify by pointer distance and exchange the front and back cards', async ({ page }) => {
  await openWorkbench(page);
  const workspace = page.getByRole('region', { name: '工作台主界面' });
  const tabs = workspace.getByRole('tablist', { name: '常规处理子功能' });
  const first = tabs.getByRole('tab', { name: '视频检测' });
  const second = tabs.getByRole('tab', { name: '视频转换' });
  const frontCard = workspace.locator('#workspace-tool-panel-detect');
  const backCard = workspace.locator('#workspace-tool-panel-convert');
  const frontGlow = frontCard.locator('.workspace-tool-glow');
  const backGlow = backCard.locator('.workspace-tool-glow');
  const glowX = glow => glow.evaluate(element => parseFloat(element.style.getPropertyValue('--workspace-glow-x')));
  const indicator = tabs.locator('.workspace-tool-tab-indicator');
  const indicatorX = () => indicator.evaluate(element => element.getBoundingClientRect().x);
  const secondX = (await second.boundingBox()).x;
  const scale = tab => tab.locator('span').evaluate(span => new DOMMatrix(getComputedStyle(span).transform).a);
  const tabTop = (await first.boundingBox()).y;
  const cardTop = (await frontCard.boundingBox()).y;

  await expect(frontCard).toBeVisible();
  await expect(backCard).toBeHidden();
  await expect(frontGlow).toHaveCSS('opacity', '0');
  await first.hover();
  await expect(backCard).toBeVisible();
  await expect(backCard).toHaveAttribute('data-depth', '1');
  await expect(frontGlow).toHaveCSS('opacity', '1');
  await expect(backGlow).toHaveCSS('opacity', '1');
  await expect(workspace.locator('#workspace-tool-panel-compress .workspace-tool-glow')).toHaveCSS('opacity', '1');
  await expect(frontGlow).toHaveCSS('pointer-events', 'none');
  expect(await frontGlow.evaluate(element => getComputedStyle(element, '::before').maskComposite)).toContain('exclude');
  const initialGlowX = await glowX(frontGlow);
  await expect.poll(() => scale(first)).toBeGreaterThan(1.2);
  await expect.poll(() => scale(second)).toBeGreaterThan(1.01);
  expect(await scale(second)).toBeLessThan(await scale(first));
  const titleBounds = await workspace.getByRole('heading', { name: '常规处理', exact: true, level: 1 }).boundingBox();
  const firstBounds = await first.boundingBox();
  expect(firstBounds.x - (titleBounds.x + titleBounds.width)).toBeGreaterThan(0);
  expect(firstBounds.x - (titleBounds.x + titleBounds.width)).toBeLessThanOrEqual(16);
  expect(titleBounds.y + titleBounds.height / 2).toBeCloseTo(firstBounds.y + firstBounds.height / 2, 0);
  expect((await first.boundingBox()).y).toBeCloseTo(tabTop, 0);
  expect((await frontCard.boundingBox()).y).toBeCloseTo(cardTop, 0);
  await frontCard.getByRole('heading', { name: '素材预览', exact: true }).hover();
  await expect(first).toBeVisible();
  await expect.poll(() => scale(first)).toBe(1);
  await expect(backCard).toBeHidden();
  await expect(backGlow).toHaveCSS('opacity', '0');

  await second.hover();
  await expect.poll(() => glowX(frontGlow)).toBeGreaterThan(initialGlowX);
  const top = card => card.evaluate(element => element.getBoundingClientRect().top);
  await expect.poll(async () => (await top(frontCard)) - (await top(backCard))).toBeGreaterThan(17);
  await workspace.evaluate(element => element.addEventListener('transitionrun', event => {
    if (event.propertyName === 'transform' && event.target.matches('.workspace-tool-panel')) {
      event.target.dataset.animatedDepth = event.target.dataset.depth;
    }
  }));
  await second.click();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(workspace.getByRole('tabpanel', { name: '视频转换', exact: true })).toBeVisible();
  await expect(backCard).toHaveCSS('background-image', 'none');
  await expect(backCard).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(backCard).toHaveAttribute('data-animated-depth', '0');
  await expect(frontCard).toHaveAttribute('data-animated-depth', '1');
  await expect(frontCard).toBeVisible();
  await expect.poll(async () => (await top(backCard)) - (await top(frontCard))).toBeGreaterThan(17);
  await expect.poll(indicatorX).toBeCloseTo(secondX, 0);
  await expect(backCard.getByRole('heading', { name: '视频转换', exact: true })).toHaveCount(0);
  await backCard.getByRole('heading', { name: '输出设置', exact: true }).hover();
  await expect(frontCard).toBeHidden();
  await expect(backCard).toBeVisible();
  await second.press('End');
  const last = tabs.getByRole('tab', { name: '视频静音' });
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');
});

test('editor columns scroll independently while the navigation and animated cards stay separate', async ({ page }) => {
  await page.setViewportSize({ width: 1365, height: 540 });
  await openWorkbench(page);
  const workspace = page.getByRole('region', { name: '工作台主界面' });
  const tabs = workspace.getByRole('tablist', { name: '常规处理子功能' });
  await tabs.getByRole('tab', { name: '视频转换' }).click();
  await workspace.getByRole('tab', { name: '编辑', exact: true }).click();

  const nav = workspace.locator('.workspace-tool-tabs:visible .workspace-tool-nav');
  const front = workspace.getByRole('tabpanel', { name: '视频转换' });
  const body = front.locator('.workspace-tool-panel-body');
  const preview = front.locator('.editor-inspector');
  const settings = front.getByRole('region', { name: '编辑设置' });
  const toolbar = workspace.getByRole('tablist', { name: '处理流程' });
  await expect(page.locator('#workspace-phases')).toHaveCount(1);
  await expect(page.locator('#workspace-subnav-regular #workspace-phases')).toBeVisible();
  await page.locator('#workspace-subnav-regular').evaluate(element =>
    Promise.all(element.getAnimations().map(animation => animation.finished)));
  await front.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  const toolbarBounds = await toolbar.boundingBox();
  const navBounds = await nav.boundingBox();
  const frontBounds = await front.boundingBox();
  const scrollTop = locator => locator.evaluate(element => element.scrollTop);
  const previewFrameBounds = await front.locator('#editor-preview-slot').boundingBox();
  const filenameBounds = await front.locator('#editor-filename').boundingBox();
  expect(filenameBounds.y).toBeGreaterThanOrEqual(previewFrameBounds.y + previewFrameBounds.height);
  const settingsBounds = await settings.boundingBox();
  await preview.hover();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => scrollTop(preview)).toBeGreaterThan(0);
  const previewScroll = await scrollTop(preview);
  expect(await scrollTop(settings)).toBe(0);
  expect(await settings.boundingBox()).toEqual(settingsBounds);
  await settings.hover();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => scrollTop(settings)).toBeGreaterThan(0);
  expect(await scrollTop(preview)).toBe(previewScroll);
  expect(await scrollTop(body)).toBe(0);
  expect(await nav.boundingBox()).toEqual(navBounds);
  expect(await front.boundingBox()).toEqual(frontBounds);
  expect(await toolbar.boundingBox()).toEqual(toolbarBounds);
  expect(await scrollTop(page.locator('.workspace-home-content'))).toBe(0);
  expect((await toolbar.boundingBox()).y).toBeLessThan((await body.boundingBox()).y);
  expect(toolbarBounds.y).toBeGreaterThanOrEqual(navBounds.y + navBounds.height);

  await tabs.getByRole('tab', { name: '视频压缩' }).hover();
  for (const depth of [1, 2]) {
    const back = workspace.locator(`.workspace-tool-tabs:visible .workspace-tool-panel[data-depth="${depth}"]`);
    await expect(back).toBeVisible();
    await expect.poll(async () => (await back.boundingBox()).y).toBeLessThan(frontBounds.y - 10);
    expect((await back.boundingBox()).y).toBeGreaterThan(navBounds.y + navBounds.height);
  }
  await tabs.getByRole('tab', { name: '视频压缩' }).click();
  await expect(workspace.getByRole('tabpanel', { name: '视频压缩' })).toBeVisible();
  await tabs.getByRole('tab', { name: '视频转换' }).click();
  await expect.poll(() => scrollTop(body)).toBe(0);
  await expect.poll(() => scrollTop(preview)).toBe(0);
  await expect.poll(() => scrollTop(settings)).toBe(0);
});

test('profile, settings, logout and the static avatar appear together at the bottom', async ({ page }) => {
  await openWorkbench(page);
  const sidebar = page.locator('#workspace-home-sidebar');
  const actions = sidebar.locator('.workspace-home-account-actions');
  const profile = actions.getByRole('button', { name: '个人资料', exact: true });
  const settings = actions.getByRole('button', { name: '设置', exact: true });
  const logout = actions.getByRole('button', { name: '退出登录', exact: true });
  const avatar = actions.locator('.workspace-home-avatar');
  expect((await profile.boundingBox()).y).toBeLessThan((await settings.boundingBox()).y);
  expect((await settings.boundingBox()).y).toBeLessThan((await logout.boundingBox()).y);
  expect((await logout.boundingBox()).y).toBeLessThan((await avatar.boundingBox()).y);
  await sidebar.getByRole('button', { name: '历史记录', exact: true }).click();
  await avatar.click();
  await expect(page.locator('#account-panel')).toBeHidden();
  await profile.click();
  await expect(page.locator('#profile-section')).toBeVisible();
  await expect(page.locator('#profile-username')).toHaveText('demo_user');
  await expect(profile).toHaveAttribute('aria-current', 'page');
  await settings.click();
  await expect(page.locator('#security-section')).toBeVisible();
  await expect(settings).toHaveAttribute('aria-current', 'page');
  await page.getByRole('tab', { name: '账户资料', exact: true }).click();
  await expect(profile).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: '返回工作台', exact: true }).click();
  await expect(page.getByRole('tablist', { name: '历史记录子功能', exact: true })).toBeVisible();
  await expect(page.locator('#history-panel')).toBeVisible();
  await logout.click();
  await expect(page.locator('#auth-view')).toBeVisible();
  await expect(page.locator('#account-view')).toBeHidden();
});

test('only the new workspace is shipped, even when an old bookmark requests the legacy layout', async ({ page }) => {
  const paths = await openWorkbench(page);
  await page.goto('/?workbench=legacy');
  await expect(page.getByRole('region', { name: '工作台主界面' })).toBeVisible();
  for (const id of ['app-header', 'tool-sidebar', 'upload-form', 'toggle-sidebar']) await expect(page.locator('#' + id)).toHaveCount(0);
  await expect(page.getByRole('button', { name: '查看旧版工作台' })).toHaveCount(0);
  expect(paths).not.toContain('/api/auth/logout');
});

test('the mobile sidebar can expand by touch without shifting the overview', async ({ browser }, testInfo) => {
  const page = await browser.newPage({
    baseURL: testInfo.project.use.baseURL, viewport: { width: 390, height: 750 }, isMobile: true, hasTouch: true
  });
  try {
    await openWorkbench(page);
    const sidebar = page.locator('#workspace-home-sidebar');
    const overview = page.getByRole('region', { name: '工作台主界面' });
    const initial = await overview.boundingBox();
    await expect(sidebar).toHaveCSS('width', '54px');
    const title = overview.getByRole('heading', { name: '常规处理', exact: true, level: 1 });
    const titleLeft = (await title.boundingBox()).x;
    const lastTool = overview.getByRole('tab', { name: '视频静音' });
    await lastTool.tap();
    await expect(lastTool).toHaveAttribute('aria-selected', 'true');
    await expect(title).toBeVisible();
    expect((await title.boundingBox()).x).toBe(titleLeft);
    await expect(overview.getByRole('tabpanel', { name: '视频静音', exact: true })).toBeVisible();
    const beforeExpand = await overview.boundingBox();
    await sidebar.getByRole('button', { name: '展开侧栏' }).tap();
    await expect(sidebar).toHaveCSS('width', '230px');
    expect(await overview.boundingBox()).toEqual(beforeExpand);
    expect(beforeExpand.x).toBe(initial.x);
    await sidebar.getByRole('button', { name: 'AI协作处理', exact: true }).tap();
    await expect(sidebar).toHaveCSS('width', '54px');
    await expect(overview.getByRole('tablist', { name: 'AI协作处理子功能', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await page.close();
  }
});
