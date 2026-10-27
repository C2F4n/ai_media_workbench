import { createHttpClient } from '../api/client';
import { isTool } from '../workbench/catalog';
import * as ui from '../ui';
import { element as $ } from './dom';
import { errorInfo } from './types';
import type * as API from '../api/contracts';
import type { Parameters, Plan, PlanView, Task, Page, EditStep, TranslationDraft, TranslationRun, Confirmation, CloudConfirmation, DeletingResource, ErrorInfo } from './types';
import type { ClipResult, FindResult } from '../types';
import type { AuthMode } from '../auth/types';
import type { ActionConfirmation } from '../cloud/catalog';

export function startWorkbench() {
  'use strict';
  ui.mountApplication();


  const findView = ui.mountFindResults($('find-results-view'), (action, item) => {
    if (busy || !findResult) return;
    if (action === 'preview') previewFind(item);
    else useFindRange(item, action === 'join');
  });
  const planView = ui.mountPlanDetails($('ai-plan-details'));
  // Vue owns authentication fields; all requests still use the existing session/CSRF client.
  const authView = ui.mountAuthForm($('auth-form-content'), {
    sendCode: email => request<API.RegistrationEmailChallenge>('/api/auth/registration-email-code', { method: 'POST', body: { email } }),
    register: body => request<API.User>('/api/auth/register', { method: 'POST', body }),
    login: async body => {
      const data = await request<API.SessionResponse>('/api/auth/login', { method: 'POST', body });
      setCsrfToken(data.csrfToken);
      showAccount(data.user, true);
      notice('account-notice', '');
      channel?.postMessage('account-changed');
    },
    registered: () => showAuth('注册成功，请登录。'),
    setBusy,
    expired: async message => {
      showAuth(); notice('auth-notice', message, true);
      await refreshCsrf().catch(() => {});
    }
  });
  const { toolNames } = ui;
  const navigationView = ui.mountWorkspaceNavigation($('tool-sidebar'), $('workspace-phases'), {
    selectTool: selectToolFromNavigation,
    selectPhase: phase => selectWorkbenchPhase(phase)
  });
  document.querySelectorAll<HTMLElement>('[data-transport-warning]:not(#auth-form-content [data-transport-warning])').forEach(element => {
    element.hidden = location.protocol !== 'http:' || window.isSecureContext;
  });
  // 登录令牌不是 JWT：AMW_SESSION HttpOnly Cookie 携带服务端会话 ID，JS 不读取令牌，也不将令牌存入 localStorage。
  let currentUser: API.User | null = null;
  let capabilities: API.Capabilities | null = null;
  let cloudEntries: API.CloudCredential[] | null = null, cloudOwner: string | null = null, cloudLoading: boolean = false, cloudRevision: number = 0;
  let busy = false;
  const narrowNavigation = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const systemAuthTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let authThemePreference: 'light' | 'dark' | null = null;
  try {
    const saved = localStorage.getItem('amw-auth-theme');
    if (saved === 'light' || saved === 'dark') authThemePreference = saved;
  } catch { /* 外观偏好存储不可用时，仍可在当前页面切换。 */ }
  function applyAuthTheme() {
    const theme = authThemePreference || (systemAuthTheme.matches ? 'dark' : 'light');
    $('auth-view').dataset.theme = theme;
    const button = $('auth-theme-toggle'), dark = theme === 'dark';
    button.title = dark ? '切换到亮色模式' : '切换到暗色模式';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-pressed', String(dark));
    button.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    icons();
  }
  applyAuthTheme();
  $('auth-theme-toggle').addEventListener('click', () => {
    authThemePreference = $('auth-view').dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('amw-auth-theme', authThemePreference); } catch { /* 不影响当前页面切换。 */ }
    applyAuthTheme();
  });
  systemAuthTheme.addEventListener('change', () => { if (!authThemePreference) applyAuthTheme(); });
  window.addEventListener('storage', event => {
    if (event.key !== 'amw-auth-theme' && event.key !== null) return;
    authThemePreference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    applyAuthTheme();
  });
  const authGallery = $('auth-gallery'), authSlides = [...authGallery.querySelectorAll<HTMLElement>('.auth-slide')];
  let authSlideIndex = 0, authGalleryTimer: ReturnType<typeof setTimeout> | null = null, authGalleryHovered = false;
  let authGalleryAnimations: Animation[] = [], authGalleryTransition = 0;
  const cloudConfirmationKey = 'amw-cloud-confirmation';
  let skipCloudConfirmation: boolean = false, pendingCloudConfirmation: CloudConfirmation | null = null;
  let pendingActionConfirmation: Confirmation | null = null;
  let dependencySignature = '';
  const asrModelChoices = new Map<string, string>();
  let activePanel = 'workbench';
  let mediaPage = 1;
  let mediaTotal = 0;
  let selectedMedia: API.Media | null = null;
  let probeTimer: ReturnType<typeof setTimeout> | null = null;
  let previewUrl: string | null = null;
  let selectedTask: Task | null = null;
  let taskTimer: ReturnType<typeof setTimeout> | null = null;
  let taskPage = 1;
  let taskTotal = 0;
  let planPage = 1, planTotal = 0, planListRevision = 0, taskListRevision = 0;
  const records = ui.createRecordState();
  const expandedRecords = records.expanded, recordInstructions = records.instructions;
  const historyView = ui.mountHistory({
    openMedia: openListedMedia, removeMedia: removeListedMedia, openTask: openListedTask,
    removeTask: task => deleteRecord('task', task), inspectTask: inspectListedTask,
    restorePlan: restoreListedPlan, removePlan: plan => deleteRecord('plan', plan),
    size: sizeText, mediaStatus: statusText, operation: taskVerb, taskStatus, format: taskFormat
  }, expandedRecords, recordInstructions);
  const instructionRequests = new Set();
  let pendingPlan: Plan | null = null;
  let exportPlan: Plan | null = null, exportDirty = false, exportRevision = 0;
  let outputId: string | null = null;
  let processingOperation: Parameters['operation'] = 'transcode';
  let compressionSourceId: string | null = null;
  let trimSourceId: string | null = null;
  let deletingMedia: DeletingResource | null = null;
  let deletingOutput: DeletingResource | null = null;
  let workspaceRevision = 0;
  let subtitle: API.Transcript | null = null;
  let subtitleMediaId: string | null = null;
  let subtitleRevision = 0;
  let subtitleLatestVersion = 0;
  let subtitleDirty = false;
  let subtitleLoading = false;
  let subtitleTaskLoaded: string | null = null;
  let translationDraft: TranslationDraft | null = null;
  let translationRun: TranslationRun | null = null;
  let pendingSubtitlePlan: Plan | null = null;
  let joinRows: { start: string; end: string }[] = [], joinSourceId: string | null = null, joinRevision = 0, joinLoading = false, joinDirty = false, pendingJoinPlan: Plan | null = null, joinPreviewRange: { start: number; end: number } | null = null;
  let aiPlan: PlanView | null = null;
  let aiSourceId: string | null = null;
  let aiRevision = 0;
  let aiLoading = false;
  let aiPlanDirty = false;
  let aiGenerating = false;
  let workflowMode = false, workflowSteps: EditStep[] = [], workflowDirty = false;
  let workflowAnimations: Animation[] = [], workflowHeightAnimation: Animation | null = null, workflowTransition = 0, workflowTransitionEnd = 0;
  const sequenceView = ui.mountSequenceEditors({
    joinChanged: () => { joinDirty = true; clearJoinPreview(); syncJoinControls(); },
    previewJoin, workflowChanged, defaultStep: workflowDefault
  });
  const transcriptView = ui.mountTranscriptEditors({
    changed: () => { subtitleDirty = true; syncSubtitleControls(); }, correct: correctSegment
  });
  const cloudView = ui.mountCloudSettings({
    context: () => JSON.stringify([currentUser?.id, cloudRevision, workspaceRevision]),
    confirm: confirmAction, error: message => notice('cloud-error', message, true), write: writeCloudCredential
  });
  let findTranscript: Pick<API.Transcript, 'id' | 'version'> | null = null;
  let findMediaId: string | null = null;
  let findRevision = 0;
  let findLoading = false;
  let findRunning = false;
  let findResult: FindResult | null = null;
  let findPreviewRange: { start: number; end: number } | null = null;
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('amw-account') : null;

  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: '用户名或密码不正确。',
    UNAUTHENTICATED: '登录已失效，请重新登录。',
    CSRF_INVALID: '安全验证已过期，请重新提交。',
    HTTPS_REQUIRED: '请通过 HTTPS 安全连接访问本站。',
    CURRENT_PASSWORD_INVALID: '当前密码不正确。',
    ACCOUNT_ALREADY_EXISTS: '用户名或邮箱已被使用，请更换后重试。',
    INVALID_REQUEST: '请完整填写表单。',
    INVALID_PARAMETERS: '输入有误，请检查格式、长度及必填项。',
    PASSWORD_UNCHANGED: '新密码不能与当前密码相同。',
    WEAK_PASSWORD: '密码过于简单：至少使用3个不同字符，且不要使用常见弱密码。',
    REGISTRATION_DISABLED: '当前暂未开放注册。',
    EMAIL_DELIVERY_UNAVAILABLE: '验证邮件暂时无法发送，请稍后重试。',
    EMAIL_VERIFICATION_INVALID: '验证码无效、已过期或尝试次数已用尽，请重新获取。',
    MEDIA_TOOL_UNAVAILABLE: '视频检测工具暂不可用。',
    MEDIA_PREVIEW_UNAVAILABLE: '原素材暂时无法直接预览。',
    TRANSCODE_UNAVAILABLE: '视频转换工具暂不可用。',
    COMPRESSION_TARGET_UNREACHABLE: '目标体积无法达成，请增大目标或降低分辨率。',
    SOURCE_HAS_NO_AUDIO: '素材没有可提取的音轨。',
    AUDIO_EXTRACTION_UNAVAILABLE: 'MP3编码工具暂不可用。',
    AUDIO_EXTRACTION_FAILED: '提取音频失败，请检查素材后重试。',
    TRIM_FAILED: '视频裁切失败，请调整区间或更换素材。',
    MUTE_FAILED: '视频静音失败，请检查素材后重试。',
    AI_UNAVAILABLE: 'AI 服务尚未配置或暂不可用。',
    LOCAL_AI_UNAVAILABLE: '服务端模型暂不可用，请稍后重试或切换我的凭据。',
    AI_BUSY: 'AI 服务繁忙，请稍后重试。',
    AI_PLAN_FAILED: '未生成有效方案，请修改处理要求后重试。',
    AI_ANALYSIS_FAILED: '未得到有效的字幕分析结果，请修改目标或稍后重试。',
    TRANSCRIPT_ANALYSIS_TOO_LARGE: '字幕超过本次分析上限，请使用较短素材。',
    AI_FAILED: '文字校对失败，请稍后重试或手动修改。',
    AI_TRANSLATION_FAILED: '字幕翻译结果无效或不完整，原字幕未修改。',
    TRANSCRIPT_TRANSLATION_TOO_LARGE: '本批字幕超过翻译上限，请减少字幕内容。',
    ASR_UNAVAILABLE: '所选语音识别服务尚未配置或暂不可用。',
    ASR_FAILED: '语音识别失败，请检查服务配置或稍后重试。',
    ASR_NO_SPEECH: '没有识别到有效语音。',
    TRANSCRIPT_ALREADY_EXISTS: '素材已有字幕，请刷新后确认是否重新识别。',
    TRANSCRIPT_VERSION_CONFLICT: '字幕已变更，请刷新字幕后重试。',
    SUBTITLE_BURN_UNAVAILABLE: '字幕烧录工具暂不可用。',
    SUBTITLE_BURN_FAILED: '字幕烧录失败，未生成可用结果。',
    CLIP_JOIN_FAILED: '片段拼接失败，未生成可用结果。',
    CLOUD_CREDENTIALS_UNAVAILABLE: '个人云端凭据暂不可读取，请检查加密密钥或重新配置。',
    CLOUD_CREDENTIALS_CONFLICT: '云端配置已被修改，请刷新后重试。',
    CLOUD_AUTH_FAILED: '云端身份验证失败。请前往设置 → AI服务，检查密钥、所选供应商及接口地域是否匹配。',
    CLOUD_PERMISSION_DENIED: '云端拒绝访问。请检查账号状态、服务是否开通，以及密钥或工作空间权限。',
    CLOUD_QUOTA_EXCEEDED: '云端余额或可用额度不足。请到对应供应商控制台检查余额、资源包和额度限制。',
    CLOUD_MODEL_UNAVAILABLE: '云端模型或接入点不存在或无权访问。请在设置 → AI服务中检查模型ID、地域及开通权限。',
    CLOUD_RATE_LIMITED: '云端调用频率或并发超限，请稍后重试。本次不会自动重试。',
    CLOUD_REQUEST_REJECTED: '云端未接受请求。请检查所选模型是否支持当前功能、参数及输入内容。',
    CLOUD_NETWORK_ERROR: '服务器无法连接云端服务。请检查服务器网络、代理及TLS连接。',
    CLOUD_TIMEOUT: '云端调用超时，请稍后重试。本次不会自动重试。',
    CLOUD_SERVICE_UNAVAILABLE: '云端服务暂不可用或返回异常，请稍后重试。',
    QUEUE_FULL: '处理队列已满，请稍后重试。',
    PLAN_VERSION_CONFLICT: '方案版本已变化，请刷新后重试。',
    TASK_NOT_CANCELLABLE: '任务已经结束，无法取消。',
    OUTPUT_UNAVAILABLE: '结果文件已丢失或不可用。',
    FILE_TOO_LARGE: '文件超过上传大小限制。',
    STORAGE_ERROR: '文件暂时无法保存，请稍后重试。',
    RESOURCE_CONFLICT: '当前素材状态不允许此操作。',
    RESOURCE_NOT_FOUND: '素材不存在或已不可访问。',
    INTERNAL_ERROR: '操作暂时未完成，请稍后重试。'
  };

  const { request, refreshCsrf, ApiError, setCsrfToken } = createHttpClient(code =>
    code === 'AI_UNAVAILABLE' && capabilities?.textAi?.source === 'SERVER' ? messages.LOCAL_AI_UNAVAILABLE : messages[code] || '请求未完成，请稍后重试。');

  // 将图标占位元素渲染为 Lucide 图标。
  function icons() { window.lucide?.createIcons(); }

  // 在指定位置显示或清除提示信息。
  function notice(id: string, text: string, error = false) {
    if (id === 'auth-notice') { authView.notice(text, error); return; }
    const element = $(id);
    element.textContent = text;
    element.hidden = !text;
    element.classList.toggle('error', error);
  }

  function syncCloudConfirmationSetting() {
    $('skip-cloud-confirmation').checked = skipCloudConfirmation;
    $('skip-cloud-confirmation').disabled = !currentUser;
  }
  function loadCloudConfirmationSetting(reset = false) {
    skipCloudConfirmation = false;
    try {
      if (reset) localStorage.removeItem(cloudConfirmationKey);
      else {
        const saved = JSON.parse(localStorage.getItem(cloudConfirmationKey) || 'null');
        skipCloudConfirmation = !!currentUser && saved?.owner === currentUser.id && saved?.skip === true;
      }
    } catch { /* 存储不可用时默认保留提示，本页手动设置仍可生效。 */ }
    syncCloudConfirmationSetting();
  }
  function setCloudConfirmationSetting(skip: boolean) {
    skipCloudConfirmation = !!currentUser && skip;
    try {
      if (skipCloudConfirmation && currentUser) localStorage.setItem(cloudConfirmationKey, JSON.stringify({ owner: currentUser.id, skip: true }));
      else localStorage.removeItem(cloudConfirmationKey);
    } catch { /* 此偏好不包含令牌或凭据，保存失败不阻断当前操作。 */ }
    syncCloudConfirmationSetting();
  }
  function cloudConfirmationContext() {
    return JSON.stringify([currentUser?.id, workspaceRevision, selectedMedia?.id, capabilities?.textAi, capabilities?.asrProviders, capabilities?.asrModels, $('asr-model').value]);
  }
  function finishCloudConfirmation(accepted: boolean) {
    const pending = pendingCloudConfirmation;
    if (!pending) return;
    pendingCloudConfirmation = null;
    accepted = accepted && !busy && pending.context === cloudConfirmationContext();
    // 取消、关闭和 Escape 都不保存“不再提示”，也不会发起请求。
    if (accepted && pending.paid && $('cloud-confirm-skip').checked) setCloudConfirmationSetting(true);
    if ($('cloud-confirm-dialog').open) $('cloud-confirm-dialog').close();
    pending.resolve(accepted);
  }
  function confirmCloudCall({ provider, content, detail = '', paid = true }: { provider: string; content: string; detail?: string; paid?: boolean }): Promise<boolean> {
    if (busy || !currentUser || pendingCloudConfirmation || document.querySelector('dialog[open]')) return Promise.resolve(false);
    if (paid && skipCloudConfirmation) return Promise.resolve(true);
    $('cloud-confirm-title').textContent = paid ? '确认调用云端服务' : '确认字幕翻译';
    $('cloud-confirm-provider').textContent = provider;
    $('cloud-confirm-content').textContent = content;
    $('cloud-confirm-detail').textContent = detail; $('cloud-confirm-detail').hidden = !detail;
    $('cloud-confirm-fee').hidden = !paid; $('cloud-confirm-skip-row').hidden = !paid;
    $('cloud-confirm-dialog').setAttribute('aria-describedby', ['cloud-confirm-description', paid && 'cloud-confirm-fee', detail && 'cloud-confirm-detail'].filter(Boolean).join(' '));
    $('cloud-confirm-skip').checked = false;
    return new Promise<boolean>(resolve => {
      pendingCloudConfirmation = { resolve, paid, context: cloudConfirmationContext() };
      $('cloud-confirm-dialog').showModal();
    });
  }
  $('skip-cloud-confirmation').addEventListener('change', event => setCloudConfirmationSetting((event.currentTarget as HTMLInputElement).checked));
  $('accept-cloud-confirm').addEventListener('click', () => finishCloudConfirmation(true));
  for (const id of ['cancel-cloud-confirm', 'close-cloud-confirm'] as const) $(id).addEventListener('click', () => finishCloudConfirmation(false));
  $('cloud-confirm-dialog').addEventListener('cancel', event => { event.preventDefault(); finishCloudConfirmation(false); });
  $('cloud-confirm-dialog').addEventListener('close', () => { if (!$('cloud-confirm-dialog').open) finishCloudConfirmation(false); });
  // 所有站内弹窗共用键盘焦点边界，取消键与关闭键不提交业务操作。
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...(event.currentTarget as HTMLDialogElement).querySelectorAll<HTMLButtonElement>('button:not(:disabled), input:not(:disabled)')].filter(element => element.getClientRects().length);
    const target = event.shiftKey && document.activeElement === controls[0] ? controls.at(-1)
      : !event.shiftKey && document.activeElement === controls.at(-1) ? controls[0] : null;
    if (target) { event.preventDefault(); target.focus(); }
  }));
  window.addEventListener('storage', event => { if (event.key === cloudConfirmationKey || event.key === null) loadCloudConfirmationSetting(); });

  function actionConfirmationContext() {
    return JSON.stringify([currentUser?.id, workspaceRevision, selectedMedia?.id, activePanel, navigationView.tool]);
  }
  function finishActionConfirmation(accepted: boolean) {
    const pending = pendingActionConfirmation;
    if (!pending) return;
    pendingActionConfirmation = null;
    accepted = accepted && !busy && pending.context === actionConfirmationContext();
    if ($('action-confirm-dialog').open) $('action-confirm-dialog').close();
    pending.resolve(accepted);
  }
  function confirmAction({ title, message, confirmLabel, kind = 'warning', icon = 'triangle-alert' }: ActionConfirmation): Promise<boolean> {
    if (busy || !currentUser || pendingActionConfirmation || document.querySelector('dialog[open]')) return Promise.resolve(false);
    $('action-confirm-title').textContent = title;
    $('action-confirm-description').textContent = message;
    $('action-confirm-dialog').dataset.kind = kind;
    const glyph = document.createElement('i'); glyph.dataset.lucide = icon; glyph.setAttribute('aria-hidden', 'true');
    $('action-confirm-icon').replaceChildren(glyph);
    $('accept-action-confirm').className = 'button ' + (kind === 'danger' ? 'danger' : 'primary');
    $('accept-action-confirm').querySelector('span')!.textContent = confirmLabel;
    icons();
    return new Promise<boolean>(resolve => {
      pendingActionConfirmation = { resolve, context: actionConfirmationContext() };
      $('action-confirm-dialog').showModal();
    });
  }
  $('accept-action-confirm').addEventListener('click', () => finishActionConfirmation(true));
  for (const id of ['cancel-action-confirm', 'close-action-confirm'] as const) $(id).addEventListener('click', () => finishActionConfirmation(false));
  $('action-confirm-dialog').addEventListener('cancel', event => { event.preventDefault(); finishActionConfirmation(false); });
  $('action-confirm-dialog').addEventListener('close', () => { if (!$('action-confirm-dialog').open) finishActionConfirmation(false); });

  // 只显示指定页面视图。
  function showOnly(view: string) {
    if (view !== 'account-view') { finishCloudConfirmation(false); finishActionConfirmation(false); }
    for (const id of ['loading-view', 'unavailable-view', 'auth-view', 'account-view'] as const) {
      $(id).hidden = id !== view;
    }
    document.querySelector<HTMLElement>('.app-header')!.hidden = view !== 'account-view';
    if (view !== 'auth-view') stopAuthFormAnimation();
    $('header-logout').hidden = view !== 'account-view';
    $('header-account').hidden = view !== 'account-view';
    syncNavigation();
    syncAuthGallery();
  }

  function settleAuthGallery() {
    authGalleryTransition++;
    authGalleryAnimations.forEach(animation => animation.cancel()); authGalleryAnimations = [];
    authSlides.forEach((slide, index) => { slide.hidden = index !== authSlideIndex; slide.inert = slide.hidden; });
  }
  function syncAuthGallery() {
    clearTimeout(authGalleryTimer ?? undefined); authGalleryTimer = null;
    const visible = !$('auth-view').hidden && !document.hidden;
    if (visible) for (const image of authGallery.querySelectorAll<HTMLImageElement>('img[data-src]')) {
      if (!image.hasAttribute('src')) image.src = image.dataset.src || '';
    }
    if (!visible) settleAuthGallery();
    const ready = authSlides.every(slide => { const image = slide.querySelector('img')!; return image.hasAttribute('src') && image.complete; });
    if (visible && ready && !reducedMotion.matches && !authGalleryHovered) {
      authGalleryTimer = setTimeout(() => setAuthSlide((authSlideIndex + 1) % authSlides.length), 6000);
    }
  }
  function setAuthSlide(index: number) {
    const outgoing = authSlides[authSlideIndex], incoming = authSlides[index];
    if (index === authSlideIndex) { syncAuthGallery(); return; }
    settleAuthGallery(); authSlideIndex = index;
    authGallery.dataset.slide = String(index);
    incoming.hidden = false; incoming.inert = false; outgoing.inert = true;
    if (reducedMotion.matches || $('auth-view').hidden) settleAuthGallery();
    else {
      const token = authGalleryTransition, options = { duration: 720, easing: 'cubic-bezier(.22,.75,.22,1)' };
      authGalleryAnimations = [
        outgoing.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], options),
        incoming.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], options)
      ];
      Promise.all(authGalleryAnimations.map(animation => animation.finished)).then(() => {
        if (token === authGalleryTransition) settleAuthGallery();
      }).catch(() => { /* 隐藏登录页或改变动态效果偏好时，取消旧动画并归一显示状态。 */ });
    }
    syncAuthGallery();
  }
  authSlides.forEach((slide, index) => {
    slide.inert = index !== authSlideIndex;
    slide.querySelector('img')!.addEventListener('load', () => { slide.querySelector<HTMLElement>('.auth-image-fallback')!.hidden = true; syncAuthGallery(); });
    slide.querySelector('img')!.addEventListener('error', event => {
      (event.currentTarget as HTMLImageElement).hidden = true;
      slide.querySelector<HTMLElement>('.auth-image-fallback')!.hidden = false;
      syncAuthGallery();
    });
  });
  authGallery.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { authGalleryHovered = true; syncAuthGallery(); } });
  authGallery.addEventListener('pointerleave', () => { authGalleryHovered = false; syncAuthGallery(); });
  document.addEventListener('visibilitychange', syncAuthGallery);
  window.addEventListener('pagehide', () => { clearTimeout(authGalleryTimer ?? undefined); authGalleryTimer = null; settleAuthGallery(); });
  window.addEventListener('pageshow', syncAuthGallery);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { settleAuthGallery(); stopAuthFormAnimation(); }
    syncAuthGallery();
  });

  // 设置请求等待状态并禁用或恢复表单控件。
  function setBusy(value: boolean) {
    busy = value;
    document.querySelectorAll<HTMLButtonElement>('button:not(#auth-theme-toggle), form input, form select').forEach((element) => {
      if (!element.closest('#find-results-view, #ai-plan-details, #auth-form-content, #tool-sidebar, #workspace-phases, #toggle-sidebar, #sidebar-backdrop, #media-list, #plan-list, #task-list, #join-clips, #workflow-steps, #subtitle-segments, #translation-segments, #cloud-providers')) element.disabled = value || element.hasAttribute('data-unavailable');
    });
    updateRegistrationControls();
    navigationView.update({ busy: value });
    historyView.update({ busy: value });
    document.body.setAttribute('aria-busy', String(value));
    syncMediaControls();
  }

  function updateRegistrationControls() {
    authView.update({ busy, registration: capabilities ? !!capabilities.registration : null });
  }
  function stopAuthFormAnimation() { authView.stopAnimation(); }
  function switchMode(mode: AuthMode, animate = false) { authView.switchMode(mode, animate); }

  // 清空密码输入框并恢复密码隐藏状态。
  function clearPasswords() {
    authView.clearPasswords();
    document.querySelectorAll<HTMLInputElement>('input[autocomplete="current-password"], input[autocomplete="new-password"]').forEach((input) => {
      if (input.closest('#auth-form-content')) return;
      input.value = '';
      input.type = 'password';
    });
    document.querySelectorAll<HTMLButtonElement>('.password-toggle:not(#auth-form-content .password-toggle)').forEach((button) => {
      button.title = '显示密码';
      button.setAttribute('aria-label', '显示密码');
      button.innerHTML = '<i data-lucide="eye" aria-hidden="true"></i>';
    });
    for (const ids of Object.values(accountFormFields)) for (const id of ids) {
      setAccountFieldError($<HTMLInputElement>(id), ''); delete $(id).dataset.touched;
    }
    icons();
  }

  // 清除页面中的用户状态并显示登录界面。
  function showAuth(message = '') {
    asrModelChoices.clear();
    delete $('asr-model').dataset.catalog;
    finishCloudConfirmation(false);
    finishActionConfirmation(false);
    currentUser = null;
    loadCloudConfirmationSetting(true);
    clearCloud();
    if (capabilities) capabilities = { ...capabilities, aiPlans: false, asr: false, asrProviders: [], semanticSearch: false, clipRecommendations: false, subtitleCorrection: false, subtitleTranslation: false };
    resetWorkbench();
    $('delete-dialog').close();
    clearPasswords();
    switchMode('login');
    showOnly('auth-view');
    notice('auth-notice', message);
    notice('account-notice', '');
  }

  // 填充用户资料并显示账号界面。
  function showAccount(user: API.User, newLogin = false) {
    // 用户输入用 textContent 填入，不能当作 HTML 执行，避免昵称等字段造成脚本注入。
    const first = currentUser?.id !== user.id;
    // Another tab may switch accounts without this page passing through logout.
    if (first && currentUser) resetWorkbench();
    currentUser = user;
    if (first || newLogin) loadCloudConfirmationSetting(newLogin);
    $('workspace-user').textContent = user.displayName;
    $('account-greeting').textContent = `你好，${user.displayName}`;
    $('profile-username').textContent = user.username;
    $('profile-email').textContent = user.email;
    $('profile-email-status').textContent = user.emailVerified ? '已验证' : '未验证';
    $('profile-created').textContent = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai'
    }).format(new Date(user.createdAt));
    $('profile-name').value = String(user.displayName);
    clearPasswords();
    showOnly('account-view');
    notice('auth-notice', '');
    if (first) { clearCloud(); selectPanel('workbench'); refreshUserCapabilities(); loadMedia(); loadTasks(); }
  }

  // 向后端查询当前登录用户并恢复对应界面。
  async function restoreSession() {
    // 刷新页面后询问服务端恢复身份，不凭本地“已登录”标记判断；401 才切回登录界面。
    try {
      await refreshCsrf();
      const user = await request<API.User>('/api/users/me');
      showAccount(user);
    } catch (caught) {
      const error = errorInfo(caught);
      if (error.status === 401) showAuth();
      else showOnly('unavailable-view');
    }
  }

  // 执行表单操作，统一处理等待状态和错误提示。
  async function operation(errorId: string, action: () => Promise<void>, successFocus: string | null = null) {
    // 表单操作统一管理等待、错误和解锁；finally 确保请求失败后按钮也能恢复。
    notice(errorId, '');
    setBusy(true);
    let focusAfterError = null;
    try {
      await action();
      if (successFocus) focusAfterError = $(successFocus);
    } catch (caught) {
      const error = errorInfo(caught);
      if (error.code === 'UNAUTHENTICATED') {
        showAuth();
        notice('auth-notice', error.message, true);
        await refreshCsrf().catch(() => {});
      } else {
        const issues = accountServerErrors(errorId, error);
        notice(errorId, issues.length ? accountErrorSummary(issues) : error.message, true);
        focusAfterError = issues[0]?.input;
      }
    } finally {
      setBusy(false);
      focusAfterError?.focus();
    }
  }

  // Authentication and account security share the same typed password rules.
  const { newPasswordIssue, existingPasswordIssue } = ui;
  function validateNewPassword(password: string, confirmation: string) {
    const issue = newPasswordIssue(password);
    if (issue) throw new Error(issue);
    if (password !== confirmation) throw new Error('两次输入的密码不一致。');
  }

  const accountFormFields: Record<string, string[]> = {
    'password-error': ['current-password', 'new-password', 'confirm-new-password']
  };
  const accountFieldRules: Record<string, (input: HTMLInputElement) => string> = {
    'current-password': input => existingPasswordIssue(input.value, '当前密码'),
    'new-password': input => newPasswordIssue(input.value) || (input.value === $('current-password').value ? messages.PASSWORD_UNCHANGED : ''),
    'confirm-new-password': input => !input.value ? '请再次输入新密码。' : input.value !== $('new-password').value ? '两次输入的密码不一致。' : ''
  };
  function setAccountFieldError(input: HTMLInputElement, message: string) {
    const error = $(`${input.id}-error`);
    error.textContent = message; error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else { input.removeAttribute('aria-invalid'); delete input.dataset.serverError; }
  }
  function validateAccountFields(errorId: string, ids = accountFormFields[errorId]) {
    const issues = [];
    for (const id of ids) {
      const input = $<HTMLInputElement>(id), message = accountFieldRules[id](input);
      setAccountFieldError(input, message); if (message) issues.push({ input, message });
    }
    notice(errorId, accountErrorSummary(issues), true);
    issues[0]?.input.focus();
    return !issues.length;
  }
  function accountErrorSummary(issues: { input: HTMLInputElement; message: string }[]) {
    return issues.length > 1 ? `有${issues.length}项需要修改，请查看标红输入框下方的提示。` : issues[0]?.message || '';
  }
  function accountServerErrors(errorId: string, error: ErrorInfo) {
    const ids = accountFormFields[errorId];
    if (!ids) return [];
    let details = ['INVALID_PARAMETERS', 'INVALID_REQUEST'].includes(error.code ?? '') ? error.details || [] : [];
    const field = error.code === 'WEAK_PASSWORD' ? 'newPassword'
      : error.code === 'CURRENT_PASSWORD_INVALID' ? 'currentPassword'
      : error.code === 'PASSWORD_UNCHANGED' ? 'newPassword' : null;
    if (field) details = [{ field, message: error.message }];
    const issues = [];
    for (const id of ids) {
      const input = $<HTMLInputElement>(id), detail = details.find(item => item.field === input.name);
      if (detail) { setAccountFieldError(input, detail.message); input.dataset.serverError = 'true'; issues.push({ input, message: detail.message }); }
    }
    return issues;
  }
  for (const [errorId, ids] of Object.entries(accountFormFields)) for (const id of ids) {
    const input = $<HTMLInputElement>(id), label = input.closest('.field')!, error = document.createElement('span');
    // 显式保留原字段名，避免错误文字加入可访问名称；提示另由aria-describedby关联。
    input.setAttribute('aria-label', label.firstChild?.textContent?.trim() || '');
    error.id = `${id}-error`; error.className = 'field-error'; error.hidden = true; label.append(error);
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
    const validate = () => setAccountFieldError(input, accountFieldRules[id](input));
    input.addEventListener('blur', event => {
      input.dataset.touched = 'true';
      // 点表单按钮时由点击处理器校验，避免先展开错误行移动按钮，导致本次点击落空。
      if ((event.relatedTarget instanceof Element ? event.relatedTarget.closest('button') : null) && input.form?.contains(event.relatedTarget as Node)) return;
      if (!input.dataset.serverError) validate();
    });
    input.addEventListener('input', () => {
      notice(errorId, '');
      delete input.dataset.serverError;
      if (input.dataset.touched || input.hasAttribute('aria-invalid')) validate();
      const confirmation = id === 'new-password' ? $('confirm-new-password') : null;
      if (confirmation?.dataset.touched || confirmation?.hasAttribute('aria-invalid')) setAccountFieldError(confirmation, accountFieldRules[confirmation.id](confirmation));
    });
  }

  document.querySelectorAll<HTMLButtonElement>('.password-toggle:not(#auth-form-content .password-toggle)').forEach((button) => {
    button.addEventListener('click', () => {
      const input = $<HTMLInputElement>(button.dataset.passwordTarget || '');
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.title = reveal ? '隐藏密码' : '显示密码';
      button.setAttribute('aria-label', button.title);
      button.innerHTML = reveal ? '<i data-lucide="eye-off" aria-hidden="true"></i>' : '<i data-lucide="eye" aria-hidden="true"></i>';
      icons();
    });
  });

  // 退出当前设备或所有设备，并切回登录界面。
  async function signOut(allDevices: boolean) {
    // logout 只退出当前会话，logout-all 撤销所有设备；二者都不注销账号。
    await request<void>(allDevices ? '/api/auth/logout-all' : '/api/auth/logout', { method: 'POST' });
    showAuth(allDevices ? '已退出所有设备。' : '已退出登录。');
    await refreshCsrf();
    channel?.postMessage('account-changed');
  }
  $('header-logout').addEventListener('click', () => operation('account-notice', () => signOut(false)));
  $('logout-all').addEventListener('click', () => operation('account-notice', () => signOut(true)));

  $('profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('profile-name').value.trim();
    operation('profile-error', async () => {
      if (!name || Array.from(name).length > 50) throw new Error('昵称需要1–50个字符。');
      const user = await request<API.User>('/api/users/me', { method: 'PATCH', body: { displayName: name } });
      showAccount(user);
      notice('account-notice', '昵称已更新。');
    });
  });

  $('password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy || !validateAccountFields('password-error')) return;
    const body = { currentPassword: $('current-password').value, newPassword: $('new-password').value };
    const confirmation = $('confirm-new-password').value;
    operation('password-error', async () => {
      validateNewPassword(body.newPassword, confirmation);
      await request<void>('/api/users/me/password', { method: 'PUT', body });
      showAuth('密码已修改，请重新登录。');
      await refreshCsrf();
      channel?.postMessage('account-changed');
    });
  });

  // 关闭注销确认弹窗并清空密码。
  function closeDeleteDialog() { $('delete-dialog').close(); clearPasswords(); }
  $('open-delete-dialog').addEventListener('click', () => {
    $('delete-form').reset();
    notice('delete-error', '');
    $('delete-dialog').showModal();
  });
  $('close-delete-dialog').addEventListener('click', closeDeleteDialog);
  $('cancel-delete').addEventListener('click', closeDeleteDialog);
  $('delete-dialog').addEventListener('cancel', () => { clearPasswords(); });
  $('delete-form').addEventListener('submit', (event) => {
    // 账号注销独立使用 DELETE，并提交当前密码和确认用户名；最终身份与权限由后端核验。
    event.preventDefault();
    if (!currentUser) return;
    const username = currentUser.username;
    const body = { currentPassword: $('delete-password').value, confirmUsername: $('delete-username').value };
    operation('delete-error', async () => {
      if (body.confirmUsername.toLowerCase() !== username.toLowerCase()) throw new Error('确认用户名与当前账号不一致。');
      await request<API.User>('/api/users/me', { method: 'DELETE', body });
      showAuth('账号已注销。');
      await refreshCsrf();
      channel?.postMessage('account-changed');
    });
  });

  $('retry-connection').addEventListener('click', () => boot());
  $('header-account').addEventListener('click', () => selectPanel(activePanel === 'account' ? 'workbench' : 'account'));
  $('back-workbench').addEventListener('click', () => selectPanel('workbench'));

  function selectPanel(panel: string) {
    activePanel = panel;
    clearCloudSecrets();
    if (panel === 'account' && currentUser && cloudOwner !== currentUser.id) loadCloudCredentials();
    $('workbench-panel').hidden = panel !== 'workbench';
    $('account-panel').hidden = panel !== 'account';
    $('header-location').textContent = panel === 'workbench' ? '工作台' : '账户';
    $('header-account').setAttribute('aria-expanded', String(panel === 'account'));
    syncNavigation();
    if (panel !== 'workbench') document.querySelectorAll<HTMLMediaElement>('#workbench-panel video, #workbench-panel audio').forEach(player => player.pause());
  }

  function selectAccountTab(tab: string) {
    for (const name of ['profile', 'security', 'cloud'] as const) {
      const active = name === tab;
      $(`${name}-section`).hidden = !active;
      $(`account-${name}-tab`).setAttribute('aria-selected', String(active));
      $(`account-${name}-tab`).tabIndex = active ? 0 : -1;
    }
    $('account-danger-section').hidden = tab !== 'security';
  }
  for (const name of ['profile', 'security', 'cloud'] as const) $(`account-${name}-tab`).addEventListener('click', () => selectAccountTab(name));
  document.querySelector<HTMLElement>('.account-nav')!.addEventListener('keydown', event => {
    const tabs = ['profile', 'security', 'cloud'], current = tabs.findIndex(name => $(`account-${name}-tab`) === document.activeElement);
    if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (current + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    selectAccountTab(tabs[next]); $(`account-${tabs[next]}-tab`).focus();
  });

  function syncMediaControls() {
    const combined = $('export-combine').checked && processingOperation !== 'extract_audio';
    const needsTrim = processingOperation === 'trim' || combined && $('export-trim').checked;
    const needsCompression = processingOperation === 'compress' || combined && $('export-compress').checked;
    $('upload-submit').disabled = busy || !currentUser || !capabilities?.mediaTool || !$('media-file').files?.length;
    $('media-file').disabled = busy || !capabilities?.mediaTool;
    $('media-prev').disabled = busy || mediaPage <= 1;
    $('media-next').disabled = busy || mediaPage * 10 >= mediaTotal;
    $('retry-probe').disabled = busy || !capabilities?.mediaTool;
    if (selectedMedia?.status === 'READY' && compressionSourceId !== selectedMedia.id) {
      compressionSourceId = selectedMedia.id;
      $('compression-target').value = String((selectedMedia.sizeBytes * .7 / 1024 / 1024).toFixed(3));
    }
    const target = Math.floor(Number($('compression-target').value) * 1024 * 1024);
    if (selectedMedia?.status === 'READY' && trimSourceId !== selectedMedia.id) {
      trimSourceId = selectedMedia.id;
      $('trim-start').value = '0'; $('trim-end').value = String((selectedMedia.metadata?.durationMs ?? 0) / 1000);
      for (const id of ['trim-start', 'trim-end'] as const) $(id).max = String((selectedMedia?.metadata?.durationMs ?? 0) / 1000);
    }
    for (const id of ['trim-start', 'trim-end'] as const) {
      $(id).disabled = busy || !needsTrim; $(id).required = needsTrim;
    }
    const invalidTrim = needsTrim && !trimRange().valid;
    $('trim-range-error').hidden = !needsTrim || selectedMedia?.status !== 'READY' || !invalidTrim;
    $('compression-target').disabled = busy || !needsCompression;
    $('compression-target').required = needsCompression;
    $('compression-target-field').hidden = !needsCompression;
    $('trim-fields').hidden = !needsTrim;
    const invalidTarget = needsCompression && (!Number.isSafeInteger(target) || target < 32768 || target >= (selectedMedia?.sizeBytes || 0));
    $('start-conversion').disabled = busy || selectedMedia?.status !== 'READY' || invalidTarget || invalidTrim
      || (processingOperation === 'extract_audio' && !selectedMedia.metadata?.hasAudio)
      || !capabilities?.supportedOperations?.includes(processingOperation)
      || (taskActive(selectedTask) && selectedTask.mediaId === selectedMedia?.id);
    $('compression-small').hidden = processingOperation !== 'compress' || selectedMedia?.status !== 'READY' || selectedMedia.sizeBytes > 32768;
    $('conversion-resolution').disabled = busy || processingOperation === 'extract_audio' || processingOperation === 'trim' && !combined;
    $('resolution-field').hidden = processingOperation === 'extract_audio' || processingOperation === 'trim' && !combined;
    $('audio-missing').hidden = processingOperation !== 'extract_audio' || selectedMedia?.status !== 'READY' || !!selectedMedia.metadata?.hasAudio;
    $('conversion-source').textContent = selectedMedia?.status === 'READY' ? (selectedMedia?.originalFilename || '未选择就绪素材') : '未选择就绪素材';
    $('cancel-task').disabled = busy || !taskActive(selectedTask) || selectedTask?.status === 'CANCELLING';
    $('delete-output').disabled = busy || !outputId;
    $('task-prev').disabled = busy || taskPage <= 1;
    $('task-next').disabled = busy || taskPage * 10 >= taskTotal;
    $('plan-prev').disabled = busy || planPage <= 1;
    $('plan-next').disabled = busy || planPage * 10 >= planTotal;

    syncExportControls(needsCompression);
    syncSubtitleControls();
    syncAIControls();
    syncFindControls();
    syncJoinControls();
    syncCloudControls();
    renderToolDependencies();
    syncWorkbenchPhase();
  }

  const { textVendors } = ui;
  function textVendorName() { return textVendors[capabilities?.textAi?.provider === 'local' ? 'deepseek' : capabilities?.textAi?.provider || 'deepseek']?.name || 'DeepSeek'; }
  function selectCloudCategory(category: string) {
    for (const name of ['text', 'speech'] as const) {
      const active = name === category;
      $(`cloud-${name}-panel`).hidden = !active; $(`cloud-${name}-tab`).setAttribute('aria-selected', String(active));
      $(`cloud-${name}-tab`).tabIndex = active ? 0 : -1;
    }
  }
  for (const name of ['text', 'speech'] as const) $(`cloud-${name}-tab`).addEventListener('click', () => selectCloudCategory(name));
  document.querySelector<HTMLElement>('.cloud-categories')!.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const category = event.key === 'Home' ? 'text' : event.key === 'End' ? 'speech' : $('cloud-text-panel').hidden ? 'text' : 'speech';
    selectCloudCategory(category); $(`cloud-${category}-tab`).focus();
  });
  function clearCloudSecrets() { cloudView.clearSecrets(); }
  function clearCloud() {
    cloudRevision++; cloudEntries = null; cloudOwner = null; cloudLoading = false;
    cloudView.update({ entries: [] }); selectCloudCategory('text'); notice('cloud-state', ''); notice('cloud-error', '');
  }
  let userCapabilitiesRevision = 0;
  async function refreshUserCapabilities() {
    const owner = currentUser?.id, revision = workspaceRevision;
    if (!owner) return;
    const requestRevision = ++userCapabilitiesRevision;
    try {
      const item = await request<API.Capabilities>('/api/system/capabilities');
      if (currentUser?.id !== owner || workspaceRevision !== revision || requestRevision !== userCapabilitiesRevision) return;
      capabilities = item; updateRegistrationControls(); syncMediaControls();
      const saved = cloudEntries?.find(entry => entry.provider === 'deepseek');
      if (saved?.mode === 'SERVER' && item.textAi?.source === 'SERVER') {
        cloudEntries = (cloudEntries ?? []).map(entry => entry.provider === 'deepseek' ? { ...entry, available: item.textAi.available, unavailableReason: item.textAi.unavailableReason } : entry);
        cloudView.update({ entries: cloudEntries });
      }
    } catch (caught) {
      const error = errorInfo(caught); if (currentUser?.id === owner && error.status === 401) showAuth(); }
  }
  function syncCloudControls() {
    $('refresh-cloud').disabled = busy || cloudLoading || !currentUser;
    cloudView.update({ disabled: busy || cloudLoading || !currentUser });
  }
  async function writeCloudCredential(provider: API.CloudCredential['provider'], method: 'PUT' | 'DELETE', body: Record<string, unknown>) {
    const owner = currentUser?.id, revision = cloudRevision;
    await operation('cloud-error', async () => {
      const result = await request<API.CloudCredential>('/api/users/me/cloud-credentials/' + provider, { method, body });
      if (currentUser?.id !== owner || cloudRevision !== revision) return;
      cloudEntries = (cloudEntries ?? []).map(item => item.provider === provider ? result : item);
      cloudView.update({ entries: cloudEntries }); syncCloudControls(); await refreshUserCapabilities();
    });
  }
  async function loadCloudCredentials() {
    const owner = currentUser?.id, revision = ++cloudRevision; if (!owner) return;
    clearCloudSecrets(); cloudLoading = true; syncCloudControls(); notice('cloud-error', ''); notice('cloud-state', '正在读取配置…');
    try {
      const items = await request<API.CloudCredential[]>('/api/users/me/cloud-credentials');
      if (currentUser?.id !== owner || cloudRevision !== revision) return;
      cloudEntries = items; cloudOwner = owner; cloudView.update({ entries: cloudEntries }); icons(); notice('cloud-state', '');
      await refreshUserCapabilities();
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || cloudRevision !== revision) return;
      if (error.status === 401) showAuth(); else notice('cloud-error', error.message, true);
    } finally { if (cloudRevision === revision) { cloudLoading = false; syncCloudControls(); } }
  }
  $('refresh-cloud').addEventListener('click', loadCloudCredentials);

  function resetWorkbench() {
    planListRevision++; taskListRevision++; planPage = 1; planTotal = 0; expandedRecords.clear(); recordInstructions.clear();
    historyView.clear(); notice('plan-list-error', ''); selectAccountTab('profile');
    navigationView.reset();
    clearExport();
    workspaceRevision++;
    clearAIPlan();
    clearFind();
    clearJoin();
    clearSubtitle();
    deletingMedia = null; $('delete-media-dialog').close();
    deletingOutput = null; $('delete-output-dialog').close();
    clearTimeout(probeTimer ?? undefined); probeTimer = null;
    mediaPage = 1; mediaTotal = 0; selectedMedia = null;
    clearSourcePreview();

    $('media-result').hidden = true;
    $('media-result-empty').hidden = false;
    $('media-status').hidden = true;
    $('media-file').value = '';
    $('selected-filename').textContent = '未选择文件';
    $('selected-size').textContent = '';
    $('upload-state').textContent = '';
    $('selected-preview').pause();
    $('selected-preview').removeAttribute('src');
    $('selected-preview').hidden = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    clearTimeout(taskTimer ?? undefined); taskTimer = null;
    selectedTask = null; pendingPlan = null; outputId = null; taskPage = 1; taskTotal = 0; compressionSourceId = null;
    $('compression-target').value = ''; trimSourceId = null; $('trim-start').value = ''; $('trim-end').value = '';

    $('conversion-result').hidden = true;
    $('output-preview').pause(); $('output-preview').removeAttribute('src'); $('output-preview').load();
    $('output-preview').hidden = true; $('download-output').hidden = true; $('download-output').removeAttribute('href');
    $('delete-output').hidden = true; $('output-empty').hidden = true;
    $('output-audio').pause(); $('output-audio').removeAttribute('src'); $('output-audio').load(); $('output-audio').hidden = true;
    selectTool('detect', false);
  }

  function clearMediaResult() {
    clearExport();
    clearFind();
    clearJoin();
    clearAIPlan();
    clearSubtitle();
    clearTimeout(probeTimer ?? undefined); probeTimer = null; selectedMedia = null;
    clearSourcePreview();
    $('media-result').hidden = true; $('media-result-empty').hidden = false; $('media-status').hidden = true;
    compressionSourceId = null; $('compression-target').value = '';
    trimSourceId = null; $('trim-start').value = ''; $('trim-end').value = '';
    syncMediaControls();
  }

  function clearTaskResult() {
    selectedTask = null; outputId = null;
    $('conversion-result').hidden = true;
    for (const id of ['output-preview', 'output-audio'] as const) {
      $(id).pause(); $(id).removeAttribute('src'); $(id).load(); $(id).hidden = true;
    }
    $('download-output').hidden = true; $('download-output').removeAttribute('href');
    $('delete-output').hidden = true; $('output-empty').hidden = true;
    syncMediaControls();
  }

  function forgetMedia(id: string) {
    // 作废删除前已发出的轮询响应，不能让迟到的结果重新填回界面。
    workspaceRevision++;
    if (selectedMedia?.id === id) clearMediaResult();
    if (selectedTask?.mediaId === id) clearTaskResult();
    if (pendingPlan?.mediaId === id) pendingPlan = null;
  }

  function sizeText(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  function statusText(status: string) { return ({ PROBING: '检测中', READY: '已就绪', FAILED: '检测失败' })[status] || status; }

  function clearSourcePreview() {
    const player = $('source-preview');
    player.pause(); player.removeAttribute('src'); player.load(); player.hidden = true;
    $('retry-source-preview').hidden = true;
    notice('source-preview-status', '');
  }

  function displaySourcePreview(item: API.Media) {
    const url = item.status === 'READY' ? item.previewUrl : null;
    if ($('source-preview').getAttribute('src') !== url) {
      clearSourcePreview();
      if (url) { $('source-preview').src = url; $('source-preview').hidden = false; }
    }
    if (!url) notice('source-preview-status', item.status === 'READY' ? '当前格式不支持直接预览。' : '');
  }

  $('source-preview').addEventListener('error', () => {
    if (selectedMedia?.previewUrl && $('source-preview').error) {
      notice('source-preview-status', '原视频暂时无法播放。', true);
      $('retry-source-preview').hidden = false;
    }
  });
  $('source-preview').addEventListener('loadeddata', () => {
    notice('source-preview-status', ''); $('retry-source-preview').hidden = true;
  });
  $('retry-source-preview').addEventListener('click', () => {
    if (!selectedMedia?.previewUrl) return;
    notice('source-preview-status', ''); $('retry-source-preview').hidden = true; $('source-preview').load();
  });

  async function confirmMediaSwitch(id: string | null) {
    if (busy) return false;
    if (!selectedMedia || selectedMedia.id === id || !(subtitleDirty || translationDraft || joinDirty || exportDirty || workflowDirty || aiPlanDirty)) return true;
    return confirmAction({ title: '切换素材', message: '当前素材有未保存的修改。切换后，这些修改将被放弃，已保存的方案、字幕和原素材不受影响。', confirmLabel: '放弃并切换', icon: 'file-video' });
  }
  // 后台刷新只更新展示；用户主动切换的确认放在请求和工作台状态变更之前。
  function displayMedia(item: API.Media) {
    if (selectedMedia && selectedMedia.id !== item.id) clearExport();
    clearTimeout(probeTimer ?? undefined); probeTimer = null;
    if (selectedMedia?.id !== item.id) clearSubtitle();
    if (selectedMedia?.id !== item.id) clearAIPlan();
    if (selectedMedia?.id !== item.id) clearFind();
    if (selectedMedia?.id !== item.id) clearJoin();
    selectedMedia = item;
    displaySourcePreview(item);
    $('media-result-empty').hidden = true;
    $('media-result').hidden = false;
    $('media-result-name').textContent = item.originalFilename;
    $('media-status').hidden = false;
    $('media-status').textContent = statusText(item.status);
    $('media-status').className = 'media-status ' + (item.status === 'READY' ? 'ready' : item.status === 'FAILED' ? 'failed' : '');
    const values = [['大小', sizeText(item.sizeBytes)]];
    if (item.metadata) {
      const m = item.metadata;
      values.push(['时长', `${(m.durationMs / 1000).toFixed(2)} 秒`], ['分辨率', `${m.width} × ${m.height}`],
        ['容器', m.container], ['视频编码', m.videoCodec || '未知'], ['音轨', m.hasAudio ? m.audioCodec || '未知' : '无音轨']);
    }
    $('media-metadata').replaceChildren(...values.map(([label, value]) => {
      const row = document.createElement('div');
      const key = document.createElement('dt'); key.textContent = label;
      const detail = document.createElement('dd'); detail.textContent = value;
      row.append(key, detail); return row;
    }));
    notice('media-error', item.error?.message || '', true);
    $('retry-probe').hidden = item.status !== 'FAILED';
    syncMediaControls();
    if (!$('subtitle-section').hidden && item.status === 'READY' && subtitleMediaId !== item.id) loadSubtitle();
    if (!$('ai-section').hidden && item.status === 'READY' && aiSourceId !== item.id) loadAIPlan();
    if (!$('find-section').hidden && item.status === 'READY' && findMediaId !== item.id) loadFindTranscript();
    if (!$('join-section').hidden && item.status === 'READY' && joinSourceId !== item.id) loadJoinPlan();
    if (item.status === 'PROBING') {
      const owner = currentUser?.id;
      const revision = workspaceRevision;
      probeTimer = setTimeout(async () => {
        probeTimer = null;
        if (!owner || currentUser?.id !== owner || selectedMedia?.id !== item.id) return;
        try {
          const updated = await request<API.Media>(`/api/media/${item.id}`);
          if (currentUser?.id !== owner || selectedMedia?.id !== item.id || workspaceRevision !== revision) return;
          displayMedia(updated);
          if (updated.status !== 'PROBING') await loadMedia();
        } catch (caught) {
      const error = errorInfo(caught);
          if (currentUser?.id !== owner || workspaceRevision !== revision) return;
          if (error.status === 401) showAuth();
          else if (error.status === 404 && selectedMedia?.id === item.id) { forgetMedia(item.id); await loadMedia(); await loadTasks(); }
          else notice('media-error', error.message, true);
        }
      }, 2000);
    }
  }

  async function loadMedia() {
    const owner = currentUser?.id;
    const revision = workspaceRevision;
    const page = mediaPage;
    if (!owner) return;
    try {
      const result = await request<Page<API.Media>>(`/api/media?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || mediaPage !== page) return;
      if (page > 1 && !result.items.length) { mediaPage = Math.max(1, Math.ceil(result.total / 10)); return loadMedia(); }
      notice('media-list-error', '');
      mediaTotal = result.total;
      $('media-list-empty').hidden = result.items.length > 0;
      $('media-total').textContent = `${result.total} 个素材`;
      $('media-page').textContent = String(mediaPage);
      historyView.update({ media: result.items });
      const selected = result.items.find((item) => item.id === selectedMedia?.id);
      if (selected) displayMedia(selected);
      else if (!selectedMedia && result.items.length) displayMedia(result.items[0]);
      else if (selectedMedia) {
        const id = selectedMedia.id;
        try {
          const updated = await request<API.Media>(`/api/media/${id}`);
          if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== id || mediaPage !== page) return;
          displayMedia(updated);
        } catch (caught) {
      const error = errorInfo(caught);
          if (currentUser?.id !== owner || workspaceRevision !== revision) return;
          if (error.status !== 404) throw error;
          forgetMedia(id); await loadTasks();
        }
      }
      if (!capabilities?.mediaTool) notice('upload-error', '视频检测工具暂不可用。', true);
      syncMediaControls(); icons();
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || mediaPage !== page) return;
      if (error.status === 401) showAuth();
      else notice('media-list-error', error.message, true);
    }
  }

  $('media-file').addEventListener('change', () => {
    const file = $('media-file').files?.[0];
    notice('upload-error', '');
    $('selected-filename').textContent = file?.name || '未选择文件';
    $('selected-size').textContent = file ? sizeText(file.size) : '';
    $('selected-preview').pause();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = file ? URL.createObjectURL(file) : null;
    $('selected-preview').hidden = !previewUrl;
    if (previewUrl) $('selected-preview').src = previewUrl;
    else $('selected-preview').removeAttribute('src');
    syncMediaControls();
  });

  $('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = $('media-file').files?.[0];
    if (!await confirmMediaSwitch(null) || busy) return;
    operation('upload-error', async () => {
      if (!file || !file.size) throw new Error('请选择非空的视频文件。');
      if (!capabilities) throw new Error('服务能力尚未加载，请稍后重试。');
      if (file.size > capabilities.maxUploadBytes) throw new Error(`文件不能超过${sizeText(capabilities.maxUploadBytes)}。`);
      const body = new FormData(); body.append('file', file);
      $('upload-state').textContent = '上传中…';
      try {
        const saved = await request<API.Media>('/api/media', { method: 'POST', body });
        $('upload-state').textContent = '上传完成';
        mediaPage = 1; displayMedia(saved); await loadMedia();
      } catch (caught) {
      const error = errorInfo(caught);
        $('upload-state').textContent = ''; throw error;
      }
    });
  });
  $('retry-probe').addEventListener('click', () => operation('media-error', async () => {
    if (!selectedMedia) return;
    displayMedia(await request<API.Media>(`/api/media/${selectedMedia.id}/probe`, { method: 'POST' }));
    await loadMedia();
  }));
  $('refresh-media').addEventListener('click', () => loadMedia());
  function closeMediaDelete() { $('delete-media-dialog').close(); deletingMedia = null; }
  $('close-delete-media').addEventListener('click', closeMediaDelete);
  $('cancel-delete-media').addEventListener('click', closeMediaDelete);
  $('delete-media-dialog').addEventListener('cancel', (event) => { if (busy) event.preventDefault(); else deletingMedia = null; });
  $('delete-media-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy || !deletingMedia) return;
    const item = deletingMedia;
    operation('delete-media-error', async () => {
      await request<API.Media>(`/api/media/${item.id}`, { method: 'DELETE' });
      if (currentUser?.id !== item.owner) return;
      forgetMedia(item.id); closeMediaDelete();
      await loadMedia(); await loadTasks();
      notice('account-notice', '素材及关联记录已删除，文件将在后台清理。');
      $('refresh-media').focus();
    });
  });
  $('media-prev').addEventListener('click', () => { if (mediaPage > 1) { mediaPage--; loadMedia(); } });
  $('media-next').addEventListener('click', () => { if (mediaPage * 10 < mediaTotal) { mediaPage++; loadMedia(); } });

  function selectTool(tool: string, revealGroup = true) {
    if (!isTool(tool) || !navigationView.selectTool(tool, revealGroup)) return;
    $('workspace-tool-title').textContent = toolNames[tool];
    $('detect-editor').hidden = tool !== 'detect';
    const processing = ['convert', 'compress', 'audio', 'trim', 'mute'].includes(tool);
    processingOperation = tool === 'mute' ? 'mute' : tool === 'trim' ? 'trim' : tool === 'audio' ? 'extract_audio' : tool === 'compress' ? 'compress' : 'transcode';
    $('history-panel').hidden = tool !== 'history';
    $('workspace-toolbar').hidden = tool === 'history';
    $('tool-dependencies').hidden = tool === 'history';
    $('conversion-section').hidden = !processing;
    $('task-section').hidden = false;
    $('ai-section').hidden = tool !== 'ai';
    $('find-section').hidden = tool !== 'find';
    if (tool !== 'find') $('find-preview').pause();
    $('join-section').hidden = tool !== 'join';
    if (tool !== 'join') $('join-preview').pause();
    if (tool === 'join' && selectedMedia?.status === 'READY' && joinSourceId !== selectedMedia.id) loadJoinPlan();
    if (tool === 'find' && selectedMedia?.status === 'READY') loadFindTranscript();
    if (tool === 'ai' && selectedMedia?.status === 'READY' && aiSourceId !== selectedMedia.id) loadAIPlan();
    $('subtitle-section').hidden = tool !== 'subtitle';
    if (tool === 'subtitle' && selectedMedia?.status === 'READY' && subtitleMediaId !== selectedMedia.id) loadSubtitle();
    $('compression-target-field').hidden = processingOperation !== 'compress';
    $('compression-target').required = processingOperation === 'compress';
    $('compression-target').disabled = processingOperation !== 'compress';
    $('conversion-title').textContent = tool === 'mute' ? '视频静音' : tool === 'trim' ? '视频裁切' : tool === 'audio' ? '提取音频' : tool === 'compress' ? '视频压缩' : '视频转换';
    $('start-processing-label').textContent = tool === 'mute' ? '开始静音' : tool === 'trim' ? '开始裁切' : tool === 'audio' ? '开始提取' : tool === 'compress' ? '开始压缩' : '开始转换';
    $('resolution-field').hidden = tool === 'audio' || tool === 'trim';
    $('trim-fields').hidden = tool !== 'trim';
    $('processing-fields').classList.toggle('audio', tool === 'audio');
    $('processing-fields').classList.toggle('trim', tool === 'trim');
    $('processing-format').textContent = tool === 'audio' ? 'MP3 · 192 kbps' : 'MP4 · H.264';
    $('processing-audio-mode').textContent = tool === 'mute' ? '移除音轨' : tool === 'audio' ? '第一条音轨' : '保留音轨';
    notice('conversion-error', '');
    syncMediaControls();
    if (tool === 'history' && !$('history-plans-panel').hidden) loadPlans();
  }

  function syncWorkbenchPhase() {
    const ready = selectedMedia?.status === 'READY';
    $('continue-editing').disabled = busy || !ready;
    $('workspace-file-state').textContent = selectedMedia ? (selectedMedia?.originalFilename || '未选择就绪素材') : '未选择素材';
    $('workspace-file-state').title = selectedMedia?.originalFilename || '';
    $('editor-filename').textContent = selectedMedia?.originalFilename || '未选择素材';
    const metadata = selectedMedia?.metadata;
    $('editor-file-info').textContent = metadata ? `${(metadata.durationMs / 1000).toFixed(2)} 秒 · ${metadata.width} × ${metadata.height} · ${sizeText(selectedMedia?.sizeBytes || 0)}` : selectedMedia ? statusText(selectedMedia.status) : '等待导入';
    $('editor-preview-empty').hidden = !!$('source-preview').getAttribute('src');
    $('editor-metadata').replaceChildren(...(selectedMedia ? [...$('media-metadata').children].map(row => row.cloneNode(true)) : []));
    const resultVisible = !!selectedTask && selectedTask.kind !== 'TRANSCRIPTION' && !$('conversion-result').hidden;
    $('export-result-empty').hidden = resultVisible;
    const srtReady = navigationView.tool === 'subtitle' && !!subtitle && !subtitleDirty && !$('download-srt').hidden;
    $('export-srt').hidden = !srtReady;
    if (srtReady) { $('export-srt').setAttribute('href', $('download-srt').getAttribute('href') || ''); $('export-srt').setAttribute('download', 'subtitles.srt'); }
    else $('export-srt').removeAttribute('href');
    $('export-empty-title').textContent = srtReady ? '字幕已就绪' : '暂无导出结果';
    $('export-result-summary').textContent = srtReady ? `字幕 v${subtitle?.version} · SRT` : selectedTask?.kind === 'TRANSCRIPTION' ? '字幕识别结果保存在编辑区' : '尚未生成文件';
  }
  function selectWorkbenchPhase(phase: string, animate = true) {
    if (navigationView.selectPhase(phase, animate)) syncWorkbenchPhase();
  }
  function revealTask(task: Task) {
    displayTask(task);
    selectWorkbenchPhase(task.kind === 'TRANSCRIPTION' ? 'edit' : 'export');
  }

  function syncNavigation() {
    navigationView.update({ visible: !!currentUser && activePanel === 'workbench' && !$('account-view').hidden, busy });
  }
  function setNavigationOpen(value: boolean, focus = true) { navigationView.setOpen(value, focus); }

  function renderToolDependencies() {
    const c: Partial<API.Capabilities> = capabilities || {}, subtitleTool = navigationView.tool === 'subtitle', cloudTool = ['ai', 'find'].includes(navigationView.tool);
    const provider = $('asr-provider').value, providers: readonly string[] = c.asrProviders || [];
    const localAi = c.textAi?.source === 'SERVER';
    $('ai-model-warning').hidden = !localAi || workflowMode;
    const textService = localAi ? '服务端部署 · 千问 ' + (c.textAi?.model || 'Qwen3.5-4B') : textVendorName() + ' · 文本对话 API';
    const unavailable = c.textAi?.available === true ? '处理工具暂不可用' : localAi ? messages.LOCAL_AI_UNAVAILABLE : c.textAi?.unavailableReason || '未配置';
    const signature = JSON.stringify([navigationView.tool, workflowMode, provider, $('asr-model').value, c.mediaTool, c.supportedOperations, c.aiPlans, c.semanticSearch, c.clipRecommendations, c.subtitleCorrection, c.subtitleTranslation, providers, c.textAi]);
    if (dependencySignature === signature) return;
    dependencySignature = signature;
    const kind = navigationView.tool === 'ai' && workflowMode ? 'local' : subtitleTool ? 'mixed' : cloudTool ? localAi ? 'local' : 'cloud' : 'local';
    navigationView.update({ localTextAI: localAi, textService });
    $('dependency-kind').dataset.kind = kind; $('dependency-kind').textContent = { local: localAi && cloudTool && !(navigationView.tool === 'ai' && workflowMode) ? '服务端部署' : '服务端处理', cloud: '云端 API', mixed: '站点 + API' }[kind];
    const textTool = cloudTool && !(navigationView.tool === 'ai' && workflowMode);
    $('dependency-summary').textContent = textTool ? c.textAi?.available === false ? unavailable : textService : subtitleTool ? '语音识别 API / 文字模型' : '站点处理 · 无第三方 AI 调用';
    $('dependency-summary').classList.toggle('unavailable', !!(textTool && c.textAi?.available === false));
    $('dependency-title').textContent = toolNames[navigationView.tool];
    $('dependency-settings').hidden = kind === 'local' && !(cloudTool && !(navigationView.tool === 'ai' && workflowMode));
    const rows: [string, string, string, boolean][] = [];
    let detail = '';
    if (subtitleTool) {
      const model = asrModels().find(item => item.provider === provider && item.id === $('asr-model').value);
      rows.push(['语音转字幕', (provider === 'aliyun' ? '阿里云百炼 · ' : '腾讯云 · ') + (model?.name || '语音识别 API'), providers.includes(provider) ? '已配置' : '未配置或工具未就绪', providers.includes(provider)]);
      rows.push(['文字校对', textService, c.subtitleCorrection ? localAi ? '已就绪' : '已配置' : unavailable, !!c.subtitleCorrection]);
      rows.push(['字幕翻译 / 双语字幕', textService, c.subtitleTranslation ? localAi ? '已就绪' : '已配置' : unavailable, !!c.subtitleTranslation]);
      rows.push(['编辑 / SRT', '本站后端 · 无第三方 API', '站点处理', true]);
      rows.push(['已有字幕烧录', '服务端 FFmpeg / libass', c.supportedOperations?.includes('burn_subtitles') ? '工具已就绪' : '工具未就绪', !!c.supportedOperations?.includes('burn_subtitles')]);
      detail = localAi ? '语音识别向选定供应商发送音轨；文字校对使用站点服务端部署的千问，不需要用户自行部署模型。' : '识别向选定供应商发送音轨，校对只发送选中句子的文字；第三方调用可能计费。';
    } else if (cloudTool) {
      if (navigationView.tool === 'ai') {
        if (workflowMode) rows.push(['分步填写', '本站后端 · 无第三方 API', c.supportedOperations?.includes('workflow') ? '工具已就绪' : '工具未就绪', !!c.supportedOperations?.includes('workflow')]);
        else rows.push(['指令理解', textService, c.aiPlans ? localAi ? '已就绪' : '已配置' : unavailable, !!c.aiPlans]);
        rows.push(['确认后执行', '服务端 FFmpeg · 无第三方 API', '站点处理', true]);
        detail = workflowMode ? '参数由站点服务端处理，不调用第三方 AI。' : localAi ? '使用站点服务端部署的千问，仅向模型提供文字和素材参数，不向第三方模型服务上传视频。确认方案后才执行。' : '仅发送处理要求和素材参数，不上传原视频。第三方生成方案可能计费，确认后才由站点执行。';
      } else {
        rows.push(['内容检索', textService, c.semanticSearch ? localAi ? '已就绪' : '已配置' : unavailable, !!c.semanticSearch]);
        rows.push(['片段建议', textService, c.clipRecommendations ? localAi ? '已就绪' : '已配置' : unavailable, !!c.clipRecommendations]);
        detail = localAi ? '站点服务端部署的千问分析已保存字幕，不向第三方模型服务发送字幕或原视频。' : `向 ${textVendorName()} 发送已保存字幕及查找要求，不发送原视频；第三方调用可能计费。`;
      }
    } else {
      const operation = ({ convert: 'transcode', compress: 'compress', audio: 'extract_audio', trim: 'trim', join: 'join_clips', mute: 'mute' } as Partial<Record<string, string>>)[navigationView.tool];
      const ready = navigationView.tool === 'detect' ? c.mediaTool : c.supportedOperations?.includes(operation || '');
      rows.push(['处理引擎', navigationView.tool === 'detect' ? '服务端 ffprobe' : '服务端 FFmpeg / ffprobe', ready ? '工具已就绪' : '工具未就绪', !!ready]);
      rows.push(['第三方 API', '不需要 API Key', '无需云端 AI', true]);
      detail = '素材由站点服务端保存和处理，不需要用户安装处理工具，不调用第三方 AI。';
    }
    $('dependency-services').replaceChildren(...rows.map(([label, service, state, ready]) => {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'), name = document.createElement('span'), status = document.createElement('span');
      dt.textContent = label; name.textContent = service; status.textContent = state; status.className = 'dependency-state'; status.dataset.ready = String(ready);
      dd.append(name, status); row.append(dt, dd); return row;
    }));
    $('dependency-detail').textContent = detail;
  }
  $('asr-provider').addEventListener('change', () => { syncSubtitleControls(); renderToolDependencies(); });
  $('asr-model').addEventListener('change', () => {
    asrModelChoices.set($('asr-provider').value, $('asr-model').value);
    syncSubtitleControls(); renderToolDependencies();
  });
  $('dependency-settings').addEventListener('click', () => {
    setNavigationOpen(false, false); selectPanel('account'); selectAccountTab('cloud'); selectCloudCategory(navigationView.tool === 'subtitle' ? 'speech' : 'text');
    $('cloud-section').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    $('refresh-cloud').focus({ preventScroll: true });
  });

  const exportCodecMatrix: Record<string, string[]> = { mp4: ['h264', 'hevc', 'av1'], mov: ['h264', 'hevc'], mkv: ['h264', 'hevc', 'vp9', 'av1'], webm: ['vp9', 'av1'] };
  function clearExport() {
    exportRevision++; exportPlan = null; exportDirty = false;
    $('export-format').value = 'mp4'; $('export-codec').value = 'h264'; $('export-audio-format').value = 'mp3';
    $('conversion-resolution').value = 'source';
    for (const id of ['export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract'] as const) $(id).checked = false;
    notice('export-plan-state', '');
  }
  function syncExportControls(compressing: boolean) {
    const audio = processingOperation === 'extract_audio', combined = $('export-combine').checked && !audio;
    const enabled = capabilities?.supportedOperations?.includes('export');
    $('export-format-field').hidden = audio; $('export-codec-field').hidden = audio;
    $('export-audio-format-field').hidden = !audio; $('export-combine-field').hidden = audio;
    $('export-combination').hidden = !combined;
    $('export-custom-fields').hidden = audio || processingOperation === 'trim' && !combined || $('conversion-resolution').value !== 'custom';
    for (const id of ['export-format', 'export-audio-format'] as const) {
      for (const option of $(id).options) option.disabled = !capabilities?.exportFormats?.some(format => format === option.value);
      $(id).disabled = busy || !enabled;
    }
    const allowed = (exportCodecMatrix[$('export-format').value] || []).filter((codec) => capabilities?.exportVideoCodecs?.some(value => value === codec) && (!compressing || ['h264', 'vp9'].includes(codec)));
    for (const option of $('export-codec').options) option.disabled = !allowed.includes(option.value);
    if (enabled && !allowed.includes($('export-codec').value)) $('export-codec').value = String(allowed[0] || '');
    $('export-codec').disabled = busy || !enabled;
    for (const id of ['export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract', 'export-width', 'export-height'] as const) $(id).disabled = busy || !enabled;
    $('export-extract').disabled ||= !selectedMedia?.metadata?.hasAudio;
    const unavailable = !enabled || !currentUser || selectedMedia?.status !== 'READY';
    $('save-export-plan').disabled = busy || unavailable;
    $('restore-export-plan').disabled = busy || unavailable;
    if (combined || $('export-format').value !== 'mp4' || $('export-codec').value !== 'h264') $('start-processing-label').textContent = '导出';
    if (enabled) {
      const format = audio ? $('export-audio-format').value : $('export-format').value;
      $('processing-format').textContent = format.toUpperCase() + (audio ? '' : ' · ' + $('export-codec').selectedOptions[0]?.textContent);
    }
    $('processing-audio-mode').textContent = audio ? '第一条音轨' : processingOperation === 'mute' || combined && $('export-mute').checked ? '移除音轨' : '保留音轨';
  }
  function exportParameters(): Parameters {
    const audio = processingOperation === 'extract_audio', combined = $('export-combine').checked && !audio;
    const trim = processingOperation === 'trim' || combined && $('export-trim').checked;
    const compress = processingOperation === 'compress' || combined && $('export-compress').checked;
    const range = trimRange();
    if (trim && !range.valid) throw new Error('区间需至少0.5秒，且不超过素材时长。');
    const resolution = audio ? null : processingOperation === 'trim' && !combined ? 'source' : $('conversion-resolution').value;
    const p = { operation: 'export', outputFormat: audio ? $('export-audio-format').value : $('export-format').value,
      videoCodec: audio ? null : $('export-codec').value, resolutionPreset: resolution,
      width: resolution === 'custom' ? Number($('export-width').value) : null, height: resolution === 'custom' ? Number($('export-height').value) : null,
      audioMode: !audio && (processingOperation === 'mute' || combined && $('export-mute').checked) ? 'mute' : 'keep',
      startMs: trim ? range.startMs : null, endMs: trim ? range.endMs : null,
      targetSizeBytes: compress ? Math.floor(Number($('compression-target').value) * 1024 * 1024) : null,
      extractAudio: combined && $('export-extract').checked } satisfies Parameters;
    if (p.targetSizeBytes != null && (!Number.isSafeInteger(p.targetSizeBytes) || p.targetSizeBytes < 32768 || p.targetSizeBytes >= (selectedMedia?.sizeBytes || 0))) throw new Error('目标体积需至少32 KB，并小于原文件。');
    if (resolution === 'custom' && (p.width == null || p.height == null || ![p.width, p.height].every((n) => Number.isInteger(n) && n >= 2 && n <= 4096) || p.width * p.height > 8847360)) throw new Error('自定义尺寸需为2至4096的整数，总像素不超过8847360。');
    return p;
  }
  function usesExport() {
    return $('export-combine').checked || (processingOperation === 'extract_audio' ? $('export-audio-format').value !== 'mp3'
      : $('export-format').value !== 'mp4' || $('export-codec').value !== 'h264' || !['source', '720p'].includes($('conversion-resolution').value));
  }
  function sameParameters(a: Parameters | null, b: Parameters) { return (Object.keys(b) as (keyof Parameters)[]).every((key) => a?.[key] === b[key]); }
  async function saveExportPlan(parameters: Parameters): Promise<Plan | null | undefined> {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = exportRevision, workspace = workspaceRevision;
    if (!owner || !mediaId) throw new Error('请先选择就绪素材。');
    const editable = exportPlan?.mediaId === mediaId && exportPlan.status === 'READY' ? exportPlan : null;
    const plan = await request<Plan>(editable ? `/api/operation-plans/${editable.id}` : '/api/operation-plans', {
      method: editable ? 'PATCH' : 'POST', body: editable ? { expectedVersion: editable.version, parameters } : { mediaId, parameters } });
    if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || exportRevision !== revision || workspaceRevision !== workspace) return null;
    exportPlan = plan; exportDirty = false; notice('export-plan-state', `已保存 · v${plan.version}`); return plan;
  }
  $('save-export-plan').addEventListener('click', () => operation('conversion-error', async () => { await saveExportPlan(exportParameters()); }));
  $('restore-export-plan').addEventListener('click', async () => {
    if (busy) return;
    if (exportDirty && !await confirmAction({ title: '恢复导出方案', message: '当前未保存的导出设置将被替换为最近保存的方案。原素材和已生成的文件保持不变。', confirmLabel: '恢复方案', icon: 'rotate-ccw' })) return;
    if (busy) return;
    operation('conversion-error', async () => {
      const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = exportRevision, workspace = workspaceRevision;
      let found = null, page = 1;
      do {
        const result = await request<Page<Plan>>(`/api/operation-plans?mediaId=${mediaId}&page=${page}&pageSize=50`);
        if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || exportRevision !== revision || workspaceRevision !== workspace) return;
        found = result.items.find((plan) => plan.parameters?.operation === 'export');
        if (found || page * 50 >= result.total) break;
        page++;
      } while (page <= 20);
      if (!found) { notice('export-plan-state', '暂无已保存的导出方案'); return; }
      restoreExportPlan(found);
    });
  });
  function restoreExportPlan(found: Plan) {
    const p = found.parameters; if (!p) return; exportPlan = found; exportDirty = false;
    selectTool(['mp3', 'm4a', 'wav', 'flac'].includes(p.outputFormat) ? 'audio' : 'convert');
    if (p.videoCodec) { $('export-format').value = String(p.outputFormat); $('export-codec').value = String(p.videoCodec); }
    else $('export-audio-format').value = String(p.outputFormat);
    $('conversion-resolution').value = String(p.resolutionPreset || 'source');
    if (p.width) $('export-width').value = String(p.width); if (p.height) $('export-height').value = String(p.height);
    $('export-combine').checked = !!p.videoCodec; $('export-trim').checked = p.startMs != null; $('export-compress').checked = p.targetSizeBytes != null;
    $('export-mute').checked = p.audioMode === 'mute'; $('export-extract').checked = !!p.extractAudio;
    if (p.startMs != null) { $('trim-start').value = String(p.startMs / 1000); $('trim-end').value = String((p.endMs ?? p.startMs ?? 0) / 1000); }
    if (p.targetSizeBytes != null) $('compression-target').value = String(Number((p.targetSizeBytes / 1024 / 1024).toFixed(6)));
    notice('export-plan-state', `已恢复 · v${found.version}`); syncMediaControls();
  }
  for (const id of ['export-format', 'export-codec', 'export-audio-format', 'export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract', 'export-width', 'export-height', 'conversion-resolution', 'compression-target', 'trim-start', 'trim-end'] as const) {
    $(id).addEventListener('input', () => { exportDirty = true; exportRevision++; notice('export-plan-state', '未保存'); syncMediaControls(); });
  }
  function selectToolFromNavigation(tool: string) {
    if (busy) return;
    selectTool(tool);
    const required = { convert: 'transcode', compress: 'compress', trim: 'trim', audio: 'extract_audio', mute: 'mute' }[tool];
    const unavailable = { convert: '视频转换工具暂不可用。', compress: '视频压缩工具暂不可用。', trim: '视频裁切工具暂不可用。', audio: 'MP3编码工具暂不可用。', mute: '视频静音工具暂不可用。' }[tool];
    if (required && !capabilities?.supportedOperations?.includes(required)) notice('conversion-error', unavailable || '处理工具暂不可用。', true);
  }
  $('compression-target').addEventListener('input', syncMediaControls);
  function trimRange() {
    const parse = (id: 'trim-start' | 'trim-end') => {
      const seconds = Number($(id).value), milliseconds = Math.round(seconds * 1000);
      return $(id).value !== '' && Number.isSafeInteger(milliseconds) && Math.abs(seconds - milliseconds / 1000) < 1e-9 ? milliseconds : NaN;
    };
    const startMs = parse('trim-start'), endMs = parse('trim-end');
    return { startMs, endMs, valid: startMs >= 0 && endMs - startMs >= 500 && endMs <= (selectedMedia?.metadata?.durationMs || 0) };
  }
  for (const id of ['trim-start', 'trim-end'] as const) $(id).addEventListener('input', syncMediaControls);
  function clearJoinPreview() {
    joinPreviewRange = null; $('join-preview').pause(); $('join-preview').removeAttribute('src'); $('join-preview').onloadedmetadata = null;
    $('join-preview').load(); $('join-preview').hidden = true;
  }
  function clearJoin() {
    joinRevision++; joinRows = []; joinSourceId = null; joinLoading = false; joinDirty = false; pendingJoinPlan = null;
    sequenceView.update({ rows: [] }); clearJoinPreview(); notice('join-error', '');
  }
  function joinRow(startMs: number, endMs: number) { return { start: String(startMs / 1000), end: String(endMs / 1000) }; }
  function joinParameters() {
    const parse = (value: string) => /^\d+(?:\.\d{1,3})?$/.test(value) ? Math.round(Number(value) * 1000) : NaN;
    const clips = joinRows.map((row) => ({ startMs: parse(row.start), endMs: parse(row.end) }));
    const total = clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0);
    const valid = clips.length > 0 && clips.length <= 20 && Number.isSafeInteger(total) && total <= 900000
      && clips.every((clip) => Number.isSafeInteger(clip.startMs) && Number.isSafeInteger(clip.endMs) && clip.startMs >= 0
        && clip.endMs - clip.startMs >= 500 && clip.endMs <= (selectedMedia?.metadata?.durationMs || 0));
    return { clips, total, valid };
  }
  function syncJoinControls() {
    const ready = selectedMedia?.status === 'READY', data = joinParameters();
    $('join-source').textContent = ready ? (selectedMedia?.originalFilename || '未选择就绪素材') : '未选择就绪素材';
    $('join-total').textContent = `${joinRows.length} 段 · ${Number.isFinite(data.total) ? (data.total / 1000).toFixed(3) : '--'} 秒`;
    $('join-range-error').hidden = !ready || !joinRows.length || data.valid;
    $('join-state').textContent = joinLoading ? '正在读取方案…' : !ready ? '未选择就绪素材'
      : !capabilities?.supportedOperations?.includes('join_clips') ? '片段拼接工具暂不可用。' : joinDirty ? '未导出' : '';
    $('export-join').disabled = busy || joinLoading || !ready || !data.valid || !capabilities?.supportedOperations?.includes('join_clips')
      || (taskActive(selectedTask) && selectedTask.mediaId === selectedMedia?.id);
    $('add-join-clip').disabled = busy || joinLoading || !ready || joinRows.length >= 20;
    $('refresh-join').disabled = busy || joinLoading || !ready;
    sequenceView.update({ joinDisabled: busy || joinLoading, preview: !!selectedMedia?.previewUrl });
  }
  function renderJoin() { sequenceView.update({ rows: joinRows }); syncJoinControls(); }
  function previewJoin(index: number) {
    if (busy || !selectedMedia?.previewUrl) return;
    const clip = joinParameters().clips[index]; if (!clip || !Number.isSafeInteger(clip.startMs) || !Number.isSafeInteger(clip.endMs) || clip.endMs <= clip.startMs) return;
    joinPreviewRange = { start: clip.startMs / 1000, end: clip.endMs / 1000 }; const video = $('join-preview'); video.hidden = false;
    const play = () => { if (joinPreviewRange) { video.currentTime = joinPreviewRange.start; video.play().catch(() => notice('join-error', '片段暂时无法播放。', true)); } };
    if (video.getAttribute('src') !== selectedMedia.previewUrl) { video.onloadedmetadata = play; video.src = selectedMedia.previewUrl; video.load(); }
    else if (video.readyState >= 1) play(); else video.onloadedmetadata = play;
  }
  async function loadJoinPlan() {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision, token = ++joinRevision;
    if (!owner || !mediaId || selectedMedia?.status !== 'READY') return;
    joinSourceId = mediaId; joinLoading = true; pendingJoinPlan = null; joinDirty = false; clearJoinPreview();
    joinRows = [joinRow(0, (selectedMedia?.metadata?.durationMs ?? 0))]; renderJoin();
    try {
      const page = await request<Page<Plan>>(`/api/operation-plans?mediaId=${mediaId}&page=1&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || joinRevision !== token) return;
      const plan = page.items.find((item) => item.parameters?.operation === 'join_clips');
      if (plan) { joinRows = (plan.parameters?.clips ?? []).map((clip) => joinRow(clip.startMs, clip.endMs)); pendingJoinPlan = plan.status === 'READY' ? plan : null; }
      notice('join-error', '');
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || joinRevision !== token) return;
      if (error.status === 401) showAuth(); else notice('join-error', error.message, true);
    } finally { if (joinRevision === token) { joinLoading = false; renderJoin(); } }
  }
  $('join-preview').addEventListener('timeupdate', () => { if (joinPreviewRange && $('join-preview').currentTime >= joinPreviewRange.end) $('join-preview').pause(); });
  $('join-preview').addEventListener('play', () => { const video = $('join-preview'); if (joinPreviewRange && (video.currentTime < joinPreviewRange.start || video.currentTime >= joinPreviewRange.end)) video.currentTime = joinPreviewRange.start; });
  $('refresh-join').addEventListener('click', async () => {
    if (busy || joinDirty && !await confirmAction({ title: '恢复拼接方案', message: '放弃当前未导出的片段顺序和时间修改，恢复最近保存的拼接方案。原素材保持不变。', confirmLabel: '恢复方案', icon: 'rotate-ccw' })) return;
    loadJoinPlan();
  });
  $('add-join-clip').addEventListener('click', () => {
    if (busy || joinLoading || !selectedMedia || joinRows.length >= 20) return;
    joinRows.push(joinRow(0, Math.min(5000, (selectedMedia?.metadata?.durationMs ?? 0)))); joinDirty = true; renderJoin();
  });
  $('join-form').addEventListener('submit', async (event) => {
    event.preventDefault(); const data = joinParameters();
    if (busy || joinLoading || !data.valid || selectedMedia?.status !== 'READY') return;
    const token = joinRevision;
    if (!await confirmAction({ title: '导出拼接视频', message: `按当前顺序拼接 ${data.clips.length} 段，共 ${(data.total / 1000).toFixed(3)} 秒，生成 MP4。原素材保持不变。`, confirmLabel: '开始导出', kind: 'info', icon: 'clapperboard' })) return;
    if (busy || joinRevision !== token) return;
    const owner = currentUser?.id, mediaId = selectedMedia.id, revision = workspaceRevision;
    operation('join-error', async () => {
      const parameters = { operation: 'join_clips', outputFormat: 'mp4', clips: data.clips, audioMode: 'keep' };
      const current = () => currentUser?.id === owner && workspaceRevision === revision && selectedMedia?.id === mediaId;
      let plan = pendingJoinPlan?.mediaId === mediaId ? pendingJoinPlan : null;
      if (!plan) {
        plan = await request<Plan>('/api/operation-plans', { method: 'POST', body: { mediaId, parameters } });
        if (!current()) return; pendingJoinPlan = plan;
      } else if (JSON.stringify(plan.parameters?.clips) !== JSON.stringify(data.clips)) {
        plan = await request<Plan>(`/api/operation-plans/${plan.id}`, { method: 'PATCH', body: { expectedVersion: plan.version, parameters } });
        if (!current()) return; pendingJoinPlan = plan;
      }
      const task = await request<Task>(`/api/operation-plans/${plan.id}/execute`, { method: 'POST', body: { expectedVersion: plan.version } });
      if (!current()) return;
      pendingJoinPlan = null; joinDirty = false; revealTask(task); taskPage = 1; await loadTasks();
    });
  });

  function clearFindResults() {
    findResult = null; findPreviewRange = null;
    findView.clear(); notice('find-result-state', '');
    $('find-preview').pause(); $('find-preview').removeAttribute('src'); $('find-preview').load();
    $('find-preview').onloadedmetadata = null;
    $('find-preview-section').hidden = true; notice('find-preview-error', '');
  }
  function clearFind() {
    findRevision++; findMediaId = null; findTranscript = null; findLoading = false; findRunning = false;
    $('find-query').value = ''; clearFindResults(); notice('find-error', '');
  }
  function findMode() { return document.querySelector<HTMLInputElement>('input[name="find-mode"]:checked')!.value; }
  function syncFindControls() {
    const recommend = findMode() === 'recommend', ready = selectedMedia?.status === 'READY';
    const configured = recommend ? capabilities?.clipRecommendations : capabilities?.semanticSearch;
    const limit = Number($('find-limit').value), budget = Number($('find-budget').value);
    $('find-source').textContent = selectedMedia?.originalFilename || '未选择就绪素材';
    $('find-budget-field').hidden = !recommend; $('find-budget').required = recommend;
    $('find-budget').disabled = busy || findLoading || !recommend;
    $('find-limit').disabled = busy || findLoading;
    document.querySelectorAll<HTMLInputElement>('input[name="find-mode"]').forEach((input) => { input.disabled = busy || findLoading; });
    $('find-limit').max = recommend ? '10' : '20';
    $('find-query').disabled = busy || findLoading || !ready;
    $('refresh-find').disabled = busy || findLoading || !ready;
    $('find-submit').disabled = busy || findLoading || !ready || !findTranscript || !configured || !$('find-query').value.trim()
      || !Number.isInteger(limit) || limit < 1 || limit > (recommend ? 10 : 20)
      || (recommend && (!Number.isInteger(budget) || budget < 1 || budget > 900));
    $('find-submit-label').textContent = findRunning ? '分析中…' : recommend ? '生成建议' : '查找片段';
    $('find-state').textContent = findLoading ? '正在读取字幕…' : findRunning ? '正在分析字幕…' : !ready ? '未选择就绪素材'
      : !findTranscript ? '当前素材暂无字幕。' : !configured ? capabilities?.textAi?.source === 'SERVER' ? messages.LOCAL_AI_UNAVAILABLE : capabilities?.textAi?.unavailableReason || 'AI 服务尚未配置。' : `字幕 v${findTranscript.version}`;
    findView.update({ busy, previewAvailable: !!selectedMedia?.previewUrl,
      canTrim: !!capabilities?.supportedOperations?.includes('trim'), canJoin: !!capabilities?.supportedOperations?.includes('join_clips') });
  }
  async function loadFindTranscript() {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia?.status !== 'READY') return;
    const token = ++findRevision; findMediaId = mediaId; findLoading = true; syncFindControls();
    try {
      const item = await request<API.Transcript>(`/api/media/${mediaId}/transcript`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || findRevision !== token) return;
      if (findTranscript?.id !== item.id || findTranscript?.version !== item.version) clearFindResults();
      findTranscript = { id: item.id, version: item.version }; notice('find-error', '');
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || findRevision !== token) return;
      if (error.status === 401) showAuth();
      else if (error.status === 404) { findTranscript = null; clearFindResults(); }
      else notice('find-error', error.message, true);
    } finally { if (findRevision === token) { findLoading = false; syncFindControls(); } }
  }
  function findTime(ms: number) { return `${(ms / 1000).toFixed(3)} 秒`; }
  function displayFindResults(result: FindResult, recommend: boolean) {
    clearFindResults(); findResult = result;
    const items = (recommend ? result.clips : result.matches) || [];
    notice('find-result-state', items.length ? `${items.length} 个结果 · 字幕 v${result.transcriptVersion}` : result.message || '未找到相关片段。');
    findView.update({ result, recommend });
    syncFindControls();
  }
  function useFindRange(item: ClipResult, join: boolean) {
    const snapshot = findResult, owner = currentUser?.id, revision = workspaceRevision, token = findRevision;
    if (!snapshot) return;
    operation('find-error', async () => {
      const current = await request<API.Transcript>(`/api/media/${snapshot.mediaId}/transcript`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || token !== findRevision || selectedMedia?.id !== snapshot.mediaId) return;
      if (current.id !== snapshot.transcriptId || current.version !== snapshot.transcriptVersion) {
        clearFindResults(); findTranscript = current; throw new ApiError('TRANSCRIPT_VERSION_CONFLICT', 409);
      }
      if (join) {
        if (joinSourceId !== snapshot.mediaId) await loadJoinPlan();
        if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== snapshot.mediaId || token !== findRevision) return;
        const replace = !joinDirty && !pendingJoinPlan && joinRows.length === 1 && joinRows[0].start === '0' && Number(joinRows[0].end) * 1000 === (selectedMedia?.metadata?.durationMs ?? 0);
        if (!replace && joinRows.length >= 20) throw new Error('最多添加20个片段。');
        if (replace) joinRows = [];
        joinRows.push(joinRow(item.startMs, item.endMs)); joinDirty = true; selectTool('join'); renderJoin(); $('join-section').scrollIntoView({ block: 'start' });
      } else {
        selectTool('trim'); trimSourceId = selectedMedia.id;
        $('trim-start').value = String(String(item.startMs / 1000)); $('trim-end').value = String(String(item.endMs / 1000));
        syncMediaControls(); $('conversion-section').scrollIntoView({ block: 'start' });
      }
    });
  }
  function previewFind(item: ClipResult) {
    if (!selectedMedia?.previewUrl || findResult?.mediaId !== selectedMedia.id) return;
    const video = $('find-preview'); findPreviewRange = { start: item.startMs / 1000, end: item.endMs / 1000 };
    const range = findPreviewRange;
    notice('find-preview-error', ''); $('find-preview-range').textContent = `${findTime(item.startMs)} 至 ${findTime(item.endMs)}`;
    $('find-preview-section').hidden = false;
    const play = () => {
      if (!findPreviewRange) return;
      video.currentTime = findPreviewRange.start;
      video.play().catch(() => { if (findPreviewRange === range) notice('find-preview-error', '片段暂时无法播放，请重试。', true); });
    };
    if (video.getAttribute('src') !== selectedMedia.previewUrl || video.error) {
      video.onloadedmetadata = play; video.src = selectedMedia.previewUrl; video.load();
    } else if (video.readyState >= 1) play();
    else video.onloadedmetadata = play;
  }
  $('find-preview').addEventListener('timeupdate', () => {
    if (findPreviewRange && $('find-preview').currentTime >= findPreviewRange.end) $('find-preview').pause();
  });
  $('find-preview').addEventListener('play', () => {
    const video = $('find-preview');
    if (findPreviewRange && (video.currentTime < findPreviewRange.start || video.currentTime >= findPreviewRange.end)) video.currentTime = findPreviewRange.start;
  });
  $('find-preview').addEventListener('error', () => { if (findPreviewRange) notice('find-preview-error', '原视频暂时无法播放。', true); });
  $('refresh-find').addEventListener('click', loadFindTranscript);
  for (const id of ['find-query', 'find-limit', 'find-budget'] as const) $(id).addEventListener('input', () => { findRevision++; clearFindResults(); syncFindControls(); });
  document.querySelectorAll<HTMLInputElement>('input[name="find-mode"]').forEach((input) => input.addEventListener('change', () => {
    findRevision++; clearFindResults(); $('find-limit').value = String(findMode() === 'recommend' ? '3' : '10'); syncFindControls();
  }));
  $('find-form').addEventListener('submit', async (event) => {
    event.preventDefault(); if (busy || !findTranscript || !selectedMedia) return;
    const owner = currentUser?.id, mediaId = selectedMedia.id, revision = workspaceRevision, previous = findRevision;
    const snapshot = findTranscript, recommend = findMode() === 'recommend';
    if (capabilities?.textAi?.source !== 'SERVER' && !await confirmCloudCall({ provider: textVendorName(), content: '目标描述和当前已保存的字幕' })) return;
    if (busy || currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || findRevision !== previous || findTranscript !== snapshot) return;
    const token = ++findRevision;
    operation('find-error', async () => {
      const query = $('find-query').value.trim(); if (!query || Array.from(query).length > 500) throw new Error('目标内容需要1至500个字符。');
      findRunning = true; clearFindResults(); syncFindControls();
      try {
        const body: { query: string; transcriptId: string; transcriptVersion: number; limit: number; maxTotalDurationMs?: number } = { query, transcriptId: snapshot.id, transcriptVersion: snapshot.version, limit: Number($('find-limit').value) };
        if (recommend) body.maxTotalDurationMs = Number($('find-budget').value) * 1000;
        const result = await request<FindResult>(`/api/media/${mediaId}/${recommend ? 'clip-recommendations' : 'search'}`, { method: 'POST', body });
        if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || findRevision !== token) return;
        displayFindResults(result, recommend);
      } finally { findRunning = false; syncFindControls(); }
    });
  });

  function workflowChanged() {
    workflowDirty = true; aiPlanDirty = true; aiRevision++; $('ai-plan').hidden = true; syncAIControls();
  }
  function workflowDefault(operation: string): EditStep {
    const endMs = Math.min(5000, selectedMedia?.metadata?.durationMs || 5000);
    return operation === 'trim' ? { operation, startMs: 0, endMs } : operation === 'resize' ? { operation, resolutionPreset: '360p', width: null, height: null }
      : operation === 'join_clips' ? { operation, clips: [{ startMs: 0, endMs }] } : { operation: 'mute' };
  }
  function renderWorkflowSteps() {
    sequenceView.update({ steps: workflowSteps, duration: selectedMedia?.metadata?.durationMs || 0 });
    syncAIControls();
  }
  function fillWorkflow(parameters: Parameters) {
    const steps = parameters.steps || [], last = steps.at(-1);
    if (!last || last.operation !== 'export') throw new Error('顺序方案缺少有效的导出步骤。');
    workflowSteps = structuredClone(steps.slice(0, -1).filter((step): step is EditStep => step.operation !== 'export'));
    $('workflow-format').value = String(last.outputFormat); $('workflow-size').value = String(last.targetSizeBytes == null ? '' : last.targetSizeBytes / 1048576);
    $('workflow-audio').checked = !!last.extractAudio; if (last.videoCodec) $('workflow-codec').value = String(last.videoCodec);
    workflowDirty = false; renderWorkflowSteps();
  }
  function settleWorkflowPanels() {
    workflowTransition++;
    workflowAnimations.forEach(animation => animation.cancel()); workflowAnimations = [];
    workflowHeightAnimation?.cancel(); workflowHeightAnimation = null;
    for (const form of [$('ai-form'), $('workflow-form')]) {
      form.classList.remove('mode-outgoing');
      form.hidden = form.id === 'ai-form' ? workflowMode : !workflowMode;
      form.inert = form.hidden;
    }
  }
  function fitWorkflowTransition(fromHeight = $('workflow-viewport').getBoundingClientRect().height) {
    const viewport = $('workflow-viewport');
    workflowHeightAnimation?.cancel();
    const target = viewport.getBoundingClientRect().height, remaining = workflowTransitionEnd - performance.now();
    workflowHeightAnimation = remaining > 0 && Math.abs(target - fromHeight) > 1
      ? viewport.animate([{ height: `${fromHeight}px` }, { height: `${target}px` }],
        { duration: remaining, easing: 'cubic-bezier(.22,.75,.22,1)' }) : null;
  }
  function setWorkflowMode(manual: boolean) {
    const viewport = $('workflow-viewport'), outgoing = $(workflowMode ? 'workflow-form' : 'ai-form');
    const animate = manual !== workflowMode && !reducedMotion.matches && viewport.getClientRects().length > 0;
    const fromHeight = viewport.getBoundingClientRect().height;
    settleWorkflowPanels();
    workflowMode = manual; aiRevision++; aiLoading = false;
    $('ai-form').hidden = manual; $('ai-form').inert = manual;
    $('workflow-form').hidden = !manual; $('workflow-form').inert = !manual;
    $('workflow-mode').dataset.mode = manual ? 'steps' : 'text';
    $('workflow-text-mode').setAttribute('aria-pressed', String(!manual)); $('workflow-step-mode').setAttribute('aria-pressed', String(manual));
    renderToolDependencies(); syncAIControls();
    if (!animate) return;
    const incoming = $(manual ? 'workflow-form' : 'ai-form'), direction = manual ? 1 : -1, token = workflowTransition;
    outgoing.classList.add('mode-outgoing'); outgoing.hidden = false; outgoing.inert = true;
    const options = { duration: 340, easing: 'cubic-bezier(.22,.75,.22,1)' };
    workflowAnimations = [
      outgoing.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-direction * 110}%)`, opacity: 0 }], options),
      incoming.animate([{ transform: `translateX(${direction * 110}%)`, opacity: .2 }, { transform: 'translateX(0)', opacity: 1 }], options)
    ];
    workflowTransitionEnd = performance.now() + options.duration;
    fitWorkflowTransition(fromHeight);
    Promise.all(workflowAnimations.map(animation => animation.finished)).then(() => {
      if (token === workflowTransition) settleWorkflowPanels();
    }).catch(() => { /* 快速切换会取消旧动画，由最新模式负责收尾。 */ });
  }
  // 恢复方案、增删步骤或窗口变化时，动画目标高度跟随表单实际尺寸，不使用固定高度截断内容。
  const workflowSizeObserver = new ResizeObserver(() => { if (workflowHeightAnimation) fitWorkflowTransition(); });
  workflowSizeObserver.observe($('ai-form')); workflowSizeObserver.observe($('workflow-form'));
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settleWorkflowPanels(); });
  $('workflow-text-mode').addEventListener('click', async () => {
    if (busy || !workflowMode) return;
    if (workflowDirty && !await confirmAction({ title: '切换文字输入', message: '当前未保存的处理步骤将被放弃。已保存的方案保留，可稍后重新打开。', confirmLabel: '放弃并切换', icon: 'messages-square' })) return;
    workflowDirty = false; setWorkflowMode(false); renderAIPlan(null); loadAIPlan(true);
  });
  $('workflow-step-mode').addEventListener('click', () => {
    if (!workflowMode) { setWorkflowMode(true); renderAIPlan(null); loadAIPlan(); }
  });
  $('workflow-edit').addEventListener('click', () => {
    if (aiPlan?.parameters?.operation !== 'workflow') return;
    setWorkflowMode(true); fillWorkflow(aiPlan.parameters); renderAIPlan(aiPlan);
  });
  $('workflow-add').addEventListener('click', () => {
    if (workflowSteps.length < 11) { workflowSteps.push(workflowDefault('trim')); workflowChanged(); renderWorkflowSteps(); }
  });
  for (const id of ['workflow-format', 'workflow-codec', 'workflow-size', 'workflow-audio'] as const) $(id).addEventListener('input', workflowChanged);
  $('workflow-form').addEventListener('submit', event => {
    event.preventDefault();
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision, token = aiRevision;
    if (busy || aiLoading || !mediaId) return;
    operation('workflow-error', async () => {
      let duration = (selectedMedia?.metadata?.durationMs ?? 0), muted = !selectedMedia?.metadata?.hasAudio;
      for (const [index, step] of workflowSteps.entries()) {
        if (step.operation === 'trim' || step.operation === 'join_clips') {
          const clips = step.operation === 'trim' ? [step] : step.clips, minimum = step.operation === 'trim' ? 100 : 500;
          if (clips.some(clip => !Number.isSafeInteger(clip.startMs) || !Number.isSafeInteger(clip.endMs) || clip.startMs < 0 || clip.endMs > duration || clip.endMs - clip.startMs < minimum))
            throw new Error(`步骤 ${index + 1} 区间无效：当前结果长 ${(duration / 1000).toFixed(3)} 秒，区间至少 ${minimum / 1000} 秒。`);
          duration = clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0);
          if (duration > 900000) throw new Error('拼接结果不能超过15分钟。');
        }
        if (step.operation === 'mute') muted = true;
      }
      const format = $('workflow-format').value, audio = ['mp3', 'm4a', 'wav', 'flac'].includes(format);
      if (audio && muted) throw new Error('当前步骤已无音轨，无法导出音频。');
      const last = { operation: 'export', outputFormat: format, videoCodec: audio ? null : $('workflow-codec').value,
        targetSizeBytes: audio || !$('workflow-size').value ? null : Math.round(Number($('workflow-size').value) * 1048576), extractAudio: !audio && $('workflow-audio').checked };
      const parameters = { operation: 'workflow', outputFormat: format, steps: [...structuredClone(workflowSteps), last] };
      const editable = aiPlan?.parameters?.operation === 'workflow' && aiPlan.status === 'READY' && aiPlan.mediaId === mediaId ? aiPlan : null;
      const plan = await request<Plan>(editable ? `/api/operation-plans/${editable.id}` : '/api/operation-plans', { method: editable ? 'PATCH' : 'POST',
        body: editable ? { expectedVersion: editable.version, parameters } : { mediaId, parameters } });
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || aiRevision !== token) return;
      workflowDirty = false; renderAIPlan(plan);
    });
  });

  function clearAIPlan() {
    aiRevision++; aiPlan = null; aiSourceId = null; aiLoading = false; aiPlanDirty = false; aiGenerating = false;
    $('ai-plan').hidden = true; $('ai-instruction').value = ''; notice('ai-error', '');
    workflowDirty = false; workflowSteps = []; renderWorkflowSteps(); notice('workflow-error', '');
    $('workflow-format').value = 'mp4'; $('workflow-codec').value = 'h264'; $('workflow-size').value = ''; $('workflow-audio').checked = false;
  }
  function syncAIControls() {
    const ready = selectedMedia?.status === 'READY';
    $('ai-source').textContent = ready ? (selectedMedia?.originalFilename || '未选择就绪素材') : '未选择就绪素材';
    $('ai-instruction').disabled = busy || aiLoading || !ready;
    $('generate-ai-plan').disabled = busy || aiLoading || !ready || !capabilities?.aiPlans || !$('ai-instruction').value.trim();
    $('refresh-ai-plan').disabled = busy || aiLoading || !ready;
    $('execute-ai-plan').disabled = busy || aiLoading || aiPlanDirty || !ready || aiPlan?.mediaId !== selectedMedia?.id || aiPlan?.status !== 'READY';
    $('ai-state').textContent = aiGenerating ? '正在生成方案…' : aiLoading ? '正在读取方案…' : !capabilities?.aiPlans ? capabilities?.textAi?.available === true ? '当前处理工具暂不可用。' : capabilities?.textAi?.source === 'SERVER' ? messages.LOCAL_AI_UNAVAILABLE : capabilities?.textAi?.unavailableReason || 'AI 服务尚未配置。' : '';
    $('generate-ai-label').textContent = aiGenerating ? '生成中…' : '生成方案';
    $('ai-result-slot').hidden = !selectedTask || selectedTask.mediaId !== selectedMedia?.id || selectedTask.kind === 'TRANSCRIPTION';
    $('workflow-source').textContent = ready ? (selectedMedia?.originalFilename || '未选择就绪素材') : '未选择就绪素材';
    const workflowUnavailable = busy || aiLoading || !ready || !capabilities?.supportedOperations?.includes('workflow');
    for (const element of $('workflow-form').querySelectorAll<HTMLInputElement>('input, select, button')) if (!element.closest('#workflow-steps')) element.disabled = workflowUnavailable;
    sequenceView.update({ workflowDisabled: workflowUnavailable });
    $('workflow-add').disabled ||= workflowSteps.length >= 11;
    $('workflow-text-mode').disabled = busy || aiLoading; $('workflow-step-mode').disabled = busy || aiLoading;
    const format = $('workflow-format').value, audio = ['mp3', 'm4a', 'wav', 'flac'].includes(format);
    $('workflow-codec-field').hidden = audio; $('workflow-size-field').hidden = audio; $('workflow-audio-field').hidden = audio;
    for (const option of $('workflow-format').options) option.disabled = !capabilities?.exportFormats?.some(format => format === option.value);
    const codecs = (exportCodecMatrix[format] || []).filter(codec => capabilities?.exportVideoCodecs?.some(value => value === codec)
      && (!$('workflow-size').value || ['h264', 'vp9'].includes(codec)));
    for (const option of $('workflow-codec').options) option.disabled = !codecs.includes(option.value);
    if (!audio && codecs.length && !codecs.includes($('workflow-codec').value)) $('workflow-codec').value = String(codecs[0]);
    $('workflow-audio').disabled ||= !selectedMedia?.metadata?.hasAudio;
    $('workflow-state').textContent = !capabilities?.supportedOperations?.includes('workflow') ? '顺序处理工具暂不可用。' : workflowDirty ? '未保存' : '';

  }
  function renderAIPlan(plan: PlanView | null) {
    aiPlan = plan; aiPlanDirty = false; $('ai-plan').hidden = !plan;
    if (!plan) { planView.update(null); syncAIControls(); return; }
    $('ai-plan-status').textContent = plan.status === 'NEEDS_INPUT' ? '待补充' : plan.status === 'EXECUTED' ? '已执行' : '待确认';
    $('ai-plan-status').className = 'media-status ' + (plan.status === 'READY' ? 'ready' : '');
    $('ai-plan-summary').textContent = plan.summary;
    const p = plan.parameters;
    planView.update(plan);
    $('workflow-edit').hidden = p?.operation !== 'workflow' || workflowMode;
    syncAIControls();
  }
  async function loadAIPlan(preserveInput = false) {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia?.status !== 'READY') return;
    const token = ++aiRevision; aiSourceId = mediaId; aiLoading = true; syncAIControls();
    try {
      const result = await request<Page<Plan>>(`/api/operation-plans?mediaId=${mediaId}&page=1&pageSize=10`);
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || aiRevision !== token) return;
      const plan = result.items.find((item) => workflowMode ? item.parameters?.operation === 'workflow' : item.instruction);
      if (workflowMode && plan?.parameters) fillWorkflow(plan.parameters);
      if (!workflowMode && !preserveInput) $('ai-instruction').value = String(plan?.instruction || '');
      renderAIPlan(plan || null); notice('ai-error', '');
      if (!workflowMode && preserveInput && $('ai-instruction').value !== (plan?.instruction || '')) {
        aiPlanDirty = true; $('ai-plan').hidden = true; syncAIControls();
      }
      if (plan?.taskId) {
        const task = await request<Task>(`/api/tasks/${plan.taskId}`);
        if (currentUser?.id === owner && selectedMedia?.id === mediaId && workspaceRevision === revision && aiRevision === token) displayTask(task);
      }
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || aiRevision !== token) return;
      if (error.status === 401) showAuth(); else notice('ai-error', error.message, true);
    } finally { if (aiRevision === token) { aiLoading = false; syncAIControls(); } }
  }
  $('refresh-ai-plan').addEventListener('click', async () => {
    if (busy) return;
    if ((workflowMode ? workflowDirty : $('ai-instruction').value) && !await confirmAction({ title: '恢复最近方案', message: '恢复最近保存的方案并放弃当前输入。未保存的文字或处理步骤不会保留。', confirmLabel: '恢复方案', icon: 'rotate-ccw' })) return;
    workflowDirty = false; loadAIPlan();
  });
  $('ai-instruction').addEventListener('input', () => { aiRevision++; aiPlanDirty = true; $('ai-plan').hidden = true; syncAIControls(); });
  $('ai-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const instruction = $('ai-instruction').value.trim(), owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!instruction || busy || !mediaId) return;
    const previous = aiRevision;
    if (capabilities?.textAi?.source !== 'SERVER' && !await confirmCloudCall({ provider: textVendorName(), content: '处理要求和视频参数' })) return;
    if (busy || currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || aiRevision !== previous) return;
    const token = ++aiRevision; aiSourceId = mediaId;
    operation('ai-error', async () => {
      if (Array.from(instruction).length > 2000) throw new Error('处理要求不能超过2000个字符。');
      aiGenerating = true; syncAIControls();
      try {
        const body = aiPlan && aiPlan.status !== 'EXECUTED' ? { expectedVersion: aiPlan.version, instruction } : { mediaId, instruction };
        const plan = await request<Plan>(aiPlan && aiPlan.status !== 'EXECUTED' ? `/api/operation-plans/${aiPlan.id}` : '/api/operation-plans', {
          method: aiPlan && aiPlan.status !== 'EXECUTED' ? 'PATCH' : 'POST', body
        });
        if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || aiRevision !== token) return;
        renderAIPlan(plan);
      } finally { aiGenerating = false; syncAIControls(); }
    });
  });
  $('execute-ai-plan').addEventListener('click', () => {
    const plan = aiPlan, owner = currentUser?.id, token = aiRevision, revision = workspaceRevision;
    if (busy || plan?.status !== 'READY' || plan.mediaId !== selectedMedia?.id) return;
    operation('ai-error', async () => {
      const task = await request<Task>(`/api/operation-plans/${plan.id}/execute`, { method: 'POST', body: { expectedVersion: plan.version } });
      if (currentUser?.id !== owner || workspaceRevision !== revision || aiRevision !== token || selectedMedia?.id !== plan.mediaId) return;
      renderAIPlan({ ...plan, status: 'EXECUTED', taskId: task.id }); revealTask(task); taskPage = 1; await loadTasks();
    });
  });

  function clearSubtitle() {
    if (translationRun) translationRun.cancelled = true;
    translationRun = null; clearTranslation();
    subtitleRevision++; subtitle = null; subtitleMediaId = null; subtitleLatestVersion = 0;
    subtitleDirty = false; subtitleLoading = false; subtitleTaskLoaded = null;
    pendingSubtitlePlan = null; $('subtitle-result-slot').hidden = true;
    $('subtitle-editor').hidden = true; transcriptView.setSegments([]);
    $('download-srt').removeAttribute('href'); $('subtitle-original').checked = false;
    notice('subtitle-error', '');
  }

  function asrModels(): Array<Pick<API.AsrModel, 'provider' | 'id' | 'name'> & { recommended?: boolean }> {
    // 兼容尚未提供模型目录的旧后端，只展示原先已实现的两个模型。
    return Array.isArray(capabilities?.asrModels) ? capabilities.asrModels : [
      { provider: 'tencent', id: '16k_zh', name: '中文通用 16k' },
      { provider: 'aliyun', id: 'paraformer-realtime-v2', name: 'Paraformer V2 · 常规转写' }
    ];
  }
  function syncAsrModels(disabled: boolean) {
    const provider = $('asr-provider').value, select = $('asr-model');
    const models = asrModels().filter(item => item.provider === provider);
    const signature = JSON.stringify([provider, models]);
    if (select.dataset.catalog !== signature) {
      select.replaceChildren(); select.dataset.catalog = signature;
      for (const model of models) {
        const option = document.createElement('option'); option.value = String(model.id);
        option.textContent = model.name + (model.recommended && models.length > 1 ? '（推荐）' : ''); option.title = model.id;
        select.append(option);
      }
      const remembered = asrModelChoices.get(provider);
      select.value = String(models.find(item => item.id === remembered)?.id || models.find(item => item.recommended)?.id || models[0]?.id || '');
    }
    select.disabled = disabled || !models.length;
    $('asr-model-note').hidden = !models.length;
    $('asr-model-note').textContent = models.length ? `${select.value} · 文言文与生僻字需核对，模型权限与费用以服务商为准。` : '';
  }
  function syncSubtitleControls() {
    const providers: readonly string[] = capabilities?.asrProviders || [];
    for (const option of $('asr-provider').options) option.disabled = !providers.includes(option.value);
    if (!$('asr-provider').value || !providers.includes($('asr-provider').value)) $('asr-provider').value = String(providers[0] || '');
    const task = selectedTask?.kind === 'TRANSCRIPTION' && selectedTask.mediaId === selectedMedia?.id ? selectedTask : null;
    syncAsrModels(busy || subtitleLoading || taskActive(task));
    $('subtitle-source').textContent = selectedMedia?.originalFilename || '未选择就绪素材';
    $('asr-provider').disabled = busy || !providers.length || taskActive(task);
    $('start-transcription').disabled = busy || subtitleLoading || selectedMedia?.status !== 'READY'
      || !selectedMedia?.metadata?.hasAudio || !providers.length || !$('asr-model').value || taskActive(task) || !!translationDraft;
    $('transcription-label').textContent = subtitle ? '重新识别' : '识别字幕';
    $('cancel-transcription').hidden = !taskActive(task);
    $('cancel-transcription').disabled = busy || task?.status === 'CANCELLING';
    $('refresh-subtitle').disabled = busy || subtitleLoading || selectedMedia?.status !== 'READY';
    $('subtitle-state').textContent = subtitleLoading ? '正在读取字幕…'
      : taskActive(task) ? taskStatus(task.status, 'transcribe')
      : task?.error ? task.error.message
      : selectedMedia?.status === 'READY' && !selectedMedia?.metadata?.hasAudio ? '当前素材没有音轨。'
      : !providers.length ? '语音识别服务尚未配置。' : !subtitle ? '暂无字幕' : `${subtitle.segments.length} 段字幕`;
    $('save-subtitle').disabled = busy || !subtitleDirty || !subtitle || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked;
    $('subtitle-version').disabled = busy || subtitleDirty || !!translationDraft || !subtitle;
    $('subtitle-original').disabled = busy || subtitleDirty || !!translationDraft || !subtitle;
    $('subtitle-draft-state').textContent = subtitleDirty ? '有未保存的修改' : subtitle ? `已保存 · v${subtitle.version}` : '';
    const readOnly = !subtitle || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked || !!translationDraft;
    $('translate-subtitle').disabled = busy || subtitleLoading || !subtitle || subtitleDirty || !!translationDraft
      || subtitle.version !== subtitleLatestVersion || !capabilities?.subtitleTranslation || taskActive(task);
    $('translate-subtitle').title = !capabilities?.subtitleTranslation ? '文字模型暂不可用，请检查 AI 服务配置' : subtitleDirty ? '请先保存字幕修改' : '翻译字幕';
    $('translation-language').disabled = busy || !!translationDraft;
    $('cancel-translation').hidden = !translationRun;
    $('cancel-translation').disabled = !translationRun || translationRun.cancelled;
    $('save-translation').disabled = busy || !translationDraft;
    $('discard-translation').disabled = busy;
    $('translation-layout').disabled = busy;
    transcriptView.update({ translationDisabled: busy });
    const burnTask = selectedTask?.mediaId === selectedMedia?.id && selectedTask?.parameters?.operation === 'burn_subtitles' ? selectedTask : null;
    $('subtitle-result-slot').hidden = !burnTask;
    $('burn-subtitle').disabled = busy || subtitleLoading || readOnly || subtitleDirty || selectedMedia?.status !== 'READY'
      || !capabilities?.supportedOperations?.includes('burn_subtitles') || taskActive(burnTask);
    $('burn-subtitle').title = !capabilities?.supportedOperations?.includes('burn_subtitles') ? '字幕烧录工具暂不可用' : subtitleDirty ? '请先保存字幕' : '生成字幕视频';
    transcriptView.update({ disabled: busy || readOnly, canCorrect: !busy && !readOnly && !subtitleDirty && !!capabilities?.subtitleCorrection,
      correctionTitle: capabilities?.textAi?.source === 'SERVER' ? '服务端千问校对' : textVendorName() + ' 校对', duration: selectedMedia?.metadata?.durationMs || 0 });
    $('download-srt').hidden = !subtitle || subtitleDirty || !!translationDraft;
    if (subtitle) $('download-srt').href = `/api/transcripts/${subtitle.id}/srt?version=${$('subtitle-original').checked ? 1 : subtitle.version}`;
  }

  async function loadSubtitle(version?: number) {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia?.status !== 'READY') return;
    clearTranslation();
    const token = ++subtitleRevision;
    subtitleMediaId = mediaId; subtitleLoading = true; syncSubtitleControls();
    try {
      const result = await request<API.Transcript>(version && subtitle ? `/api/transcripts/${subtitle.id}?version=${version}` : `/api/media/${mediaId}/transcript`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || subtitleRevision !== token) return;
      if (!version) subtitleLatestVersion = result.version;
      subtitle = result; subtitleDirty = false; $('subtitle-original').checked = false;
      $('subtitle-version').replaceChildren(...Array.from({ length: subtitleLatestVersion }, (_, index) => {
        const option = document.createElement('option'); option.value = String(String(index + 1)); option.textContent = `v${index + 1}`; return option;
      }));
      $('subtitle-version').value = String(String(result.version)); renderSubtitle(); notice('subtitle-error', '');
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || subtitleRevision !== token) return;
      if (error.status === 401) showAuth();
      else if (error.status === 404) { subtitle = null; $('subtitle-editor').hidden = true; }
      else notice('subtitle-error', error.message, true);
    } finally {
      if (subtitleRevision === token) { subtitleLoading = false; syncSubtitleControls(); }
    }
  }

  function renderSubtitle() {
    $('subtitle-editor').hidden = !subtitle;
    transcriptView.setSegments(subtitle ? $('subtitle-original').checked ? subtitle.originalSegments : subtitle.segments : []);
    syncSubtitleControls();
  }
  async function correctSegment(segmentId: string): Promise<string | null> {
    if (busy || !subtitle || !capabilities?.subtitleCorrection) return null;
    const item = subtitle, token = subtitleRevision, owner = currentUser?.id;
    if (capabilities?.textAi?.source !== 'SERVER' && !await confirmCloudCall({ provider: textVendorName(), content: '当前这段已保存的字幕', detail: '获取校对建议，不会直接覆盖原文。' })) return null;
    if (busy || currentUser?.id !== owner || subtitleRevision !== token || subtitle !== item) return null;
    let corrected = null;
    await operation('subtitle-error', async () => {
      const suggestion = await request<API.TranscriptCorrection>(`/api/transcripts/${item.id}/corrections`, { method: 'POST', body: { expectedVersion: item.version, segmentId } });
      if (currentUser?.id === owner && subtitleRevision === token && subtitle === item) corrected = suggestion.correctedText;
    });
    return corrected;
  }

  function clearTranslation() {
    translationDraft = null; $('translation-preview').hidden = true; transcriptView.clearTranslation();
    $('subtitle-segments').hidden = false; notice('translation-state', '');
  }
  function translationText(index: number) {
    const draft = translationDraft;
    if (!draft) return '';
    const translated = draft.segments[index].text.replace(/\r\n?/g, '\n').trim();
    return $('translation-layout').value === 'bilingual' ? draft.source[index].text + '\n' + translated : translated;
  }
  function renderTranslation() {
    const draft = translationDraft; if (!draft) return;
    $('translation-preview').hidden = false; $('subtitle-segments').hidden = true;
    $('translation-title').textContent = `翻译预览 · ${$('translation-language').selectedOptions[0].textContent} · 原稿 v${draft.item.version}`;
    transcriptView.setTranslation(draft.source, draft.segments); transcriptView.update({ bilingual: $('translation-layout').value === 'bilingual' });
    syncSubtitleControls(); syncWorkbenchPhase();
  }
  $('translation-layout').addEventListener('change', () => {
    transcriptView.update({ bilingual: $('translation-layout').value === 'bilingual' });
  });
  $('discard-translation').addEventListener('click', async () => {
    if (busy || !translationDraft) return;
    const draft = translationDraft;
    if (!await confirmAction({ title: '放弃译文', message: '未保存的译文和本次编辑将被清除，已保存的字幕原稿保留。已发出的翻译请求仍可能计费。', confirmLabel: '放弃译文', icon: 'languages' }) || busy || translationDraft !== draft) return;
    clearTranslation(); syncSubtitleControls(); syncWorkbenchPhase();
  });
  $('cancel-translation').addEventListener('click', () => {
    if (!translationRun) return;
    translationRun.cancelled = true; notice('translation-state', '正在停止，等待当前批次结束…'); syncSubtitleControls();
  });
  $('translate-subtitle').addEventListener('click', async () => {
    if (busy || !subtitle || subtitleDirty || translationDraft || subtitle.version !== subtitleLatestVersion || !capabilities?.subtitleTranslation) return;
    const item = subtitle, owner = currentUser?.id, revision = workspaceRevision, token = subtitleRevision;
    const language = $('translation-language').value, useOriginal = $('subtitle-original').checked;
    const source = useOriginal ? item.originalSegments : item.segments, batches: API.TranscriptSegment[][] = [];
    let batch: API.TranscriptSegment[] = [], characters = 0;
    for (const segment of source) {
      const length = Array.from(segment.text).length;
      if (batch.length && (batch.length >= 20 || characters + length > 2000)) { batches.push(batch); batch = []; characters = 0; }
      batch.push(segment); characters += length;
    }
    if (batch.length) batches.push(batch);
    if (batches.length > 60) { notice('subtitle-error', '字幕超过本次 60 批翻译上限，请精简字幕后再试。', true); return; }
    const provider = capabilities?.textAi?.source === 'SERVER' ? '服务端千问' : textVendorName();
    if (!await confirmCloudCall({ provider, content: '当前选择的已保存字幕', paid: capabilities?.textAi?.source !== 'SERVER',
      detail: `${source.length} 段字幕，分 ${batches.length} 批翻译为${$('translation-language').selectedOptions[0].textContent}。原稿保留，译文需确认后保存。` })) return;
    if (busy || currentUser?.id !== owner || workspaceRevision !== revision || subtitleRevision !== token || subtitle !== item) return;
    const run = { cancelled: false, complete: false }; translationRun = run;
    const current = () => currentUser?.id === owner && workspaceRevision === revision && subtitleRevision === token && subtitle === item && translationRun === run;
    await operation('subtitle-error', async () => {
      try {
        const translated: API.TranscriptSegment[] = [];
        for (const segments of batches) {
          if (!current() || run.cancelled) return;
          notice('translation-state', `正在翻译 ${translated.length} / ${source.length} 段…`);
          const result = await request<API.TranscriptTranslation>(`/api/transcripts/${item.id}/translations`, { method: 'POST', body: {
            expectedVersion: item.version, targetLanguage: language, segmentIds: segments.map(segment => segment.id), useOriginal
          } });
          if (!current() || run.cancelled) return;
          if (result.transcriptId !== item.id || result.transcriptVersion !== item.version || result.targetLanguage !== language
              || !Array.isArray(result.segments) || result.segments.length !== segments.length
              || result.segments.some((segment, index) => segment.id !== segments[index].id || segment.startMs !== segments[index].startMs || segment.endMs !== segments[index].endMs || typeof segment.text !== 'string'))
            throw new ApiError('AI_TRANSLATION_FAILED', 422);
          translated.push(...result.segments);
        }
        const latest = await request<API.Transcript>(`/api/media/${item.mediaId}/transcript`);
        if (!current() || run.cancelled) return;
        if (latest.id !== item.id || latest.version !== item.version) throw new ApiError('TRANSCRIPT_VERSION_CONFLICT', 409);
        translationDraft = { item, source, segments: translated, language, useOriginal };
        run.complete = true; notice('translation-state', `${translated.length} 段译文待确认`); renderTranslation();
      } finally {
        if (current()) {
          if (!run.complete) notice('translation-state', run.cancelled ? '已停止，原稿未修改。已发出的请求仍可能计费。' : '翻译未完成，原稿未修改。');
          translationRun = null; syncSubtitleControls();
        }
      }
    });
  });
  $('save-translation').addEventListener('click', async () => {
    if (busy || !translationDraft || !subtitle) return;
    const draft = translationDraft, item = subtitle, owner = currentUser?.id, token = subtitleRevision;
    if (!await confirmAction({ title: '保存字幕新版本', message: `将${$('translation-layout').value === 'bilingual' ? '双语字幕' : '译文'}保存为新版本。原稿 v${item.version} 和识别原文继续保留。`, confirmLabel: '保存新版本', kind: 'info', icon: 'save' })) return;
    if (busy || currentUser?.id !== owner || subtitleRevision !== token || subtitle !== item || translationDraft !== draft) return;
    await operation('subtitle-error', async () => {
      const segments = draft.segments.map((segment, index) => {
        const text = translationText(index);
        if (!draft.segments[index].text.trim() || Array.from(text).length > 2000 || /\n[\t ]*\n|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/.test(text))
          throw new Error(`第 ${index + 1} 段字幕不能为空、包含空行或控制字符，原文与译文合计最多 2000 个字符；可改选仅译文或精简文本。`);
        return { id: segment.id, startMs: segment.startMs, endMs: segment.endMs, text };
      });
      if (new TextEncoder().encode(JSON.stringify(segments)).length > 2 * 1024 * 1024) throw new Error('字幕总量超过 2 MiB，请精简译文。');
      const latest = await request<API.Transcript>(`/api/media/${item.mediaId}/transcript`);
      if (currentUser?.id !== owner || subtitleRevision !== token || translationDraft !== draft) return;
      if (latest.id !== item.id || latest.version !== item.version) throw new ApiError('TRANSCRIPT_VERSION_CONFLICT', 409);
      await request<API.Transcript>(`/api/transcripts/${item.id}`, { method: 'PATCH', body: { expectedVersion: item.version, segments } });
      if (currentUser?.id !== owner || subtitleRevision !== token || translationDraft !== draft) return;
      await loadSubtitle(); notice('translation-state', '已保存新版本');
    });
  });

  $('burn-subtitle').addEventListener('click', async () => {
    if (busy || !subtitle || subtitleDirty || subtitleLoading || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked) return;
    const item = subtitle, owner = currentUser?.id, revision = workspaceRevision;
    if (!await confirmAction({ title: '导出带字幕视频', message: `使用已保存的字幕 v${item.version} 生成带字幕的 MP4。字幕将烧录进画面，原视频保持不变。`, confirmLabel: '开始导出', kind: 'info', icon: 'captions' })) return;
    if (busy || currentUser?.id !== owner || workspaceRevision !== revision || subtitle !== item || subtitleDirty) return;
    operation('subtitle-error', async () => {
      const parameters = { operation: 'burn_subtitles', outputFormat: 'mp4', transcriptId: item.id, transcriptVersion: item.version, resolutionPreset: 'source', audioMode: 'keep' };
      if (!pendingSubtitlePlan || pendingSubtitlePlan.mediaId !== item.mediaId || pendingSubtitlePlan.parameters?.transcriptId !== item.id
          || pendingSubtitlePlan.parameters?.transcriptVersion !== item.version) {
        pendingSubtitlePlan = await request<Plan>('/api/operation-plans', { method: 'POST', body: { mediaId: item.mediaId, parameters } });
      }
      const task = await request<Task>(`/api/operation-plans/${pendingSubtitlePlan.id}/execute`, { method: 'POST', body: { expectedVersion: pendingSubtitlePlan.version } });
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== item.mediaId) return;
      pendingSubtitlePlan = null; revealTask(task); taskPage = 1; await loadTasks();
    });
  });
  $('refresh-subtitle').addEventListener('click', async () => {
    if (busy) return;
    if ((subtitleDirty || translationDraft) && !await confirmAction({ title: '刷新字幕', message: '未保存的字幕和翻译修改将被放弃，重新读取已保存的字幕版本。', confirmLabel: '放弃并刷新', icon: 'refresh-cw' })) return;
    loadSubtitle();
  });
  $('subtitle-version').addEventListener('change', () => loadSubtitle(Number($('subtitle-version').value)));
  $('subtitle-original').addEventListener('change', renderSubtitle);
  $('start-transcription').addEventListener('click', async () => {
    if (busy || !selectedMedia || !capabilities?.asr) return;
    const provider = $('asr-provider').value, model = $('asr-model').value, vendor = provider === 'aliyun' ? '阿里云百炼' : '腾讯云';
    if (!asrModels().some(item => item.provider === provider && item.id === model)) return;
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    const item = subtitle;
    if (!await confirmCloudCall({ provider: vendor, content: '当前素材的音轨', detail: `模型：${model}。` + (item ? '重新识别会创建新字幕，原有版本仍保留。' : '') })) return;
    if (busy || currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || subtitle !== item || $('asr-provider').value !== provider || $('asr-model').value !== model) return;
    operation('subtitle-error', async () => {
      const task = await request<Task>(`/api/media/${mediaId}/transcriptions`, {
        method: 'POST', body: { language: 'zh-CN', force: !!item, provider, ...(Array.isArray(capabilities?.asrModels) ? { model } : {}) }
      });
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
      displayTask(task); taskPage = 1; await loadTasks();
    });
  });
  $('cancel-transcription').addEventListener('click', () => operation('subtitle-error', async () => {
    if (selectedTask?.kind !== 'TRANSCRIPTION' || selectedTask.mediaId !== selectedMedia?.id) return;
    displayTask(await request<Task>(`/api/tasks/${selectedTask.id}/cancel`, { method: 'POST' })); await loadTasks();
  }));
  $('save-subtitle').addEventListener('click', () => {
    const item = subtitle, token = subtitleRevision, owner = currentUser?.id;
    if (!item) return;
    operation('subtitle-error', async () => {
      const segments = [...$('subtitle-segments').children].map((row) => {
        const milliseconds = (field: string) => {
          const raw = row.querySelector<HTMLInputElement>(`[data-field="${field}"]`)!.value, seconds = Number(raw), ms = Math.round(seconds * 1000);
          if (raw === '' || !Number.isSafeInteger(ms) || Math.abs(seconds - ms / 1000) > 1e-9) throw new Error('时间最多保留三位小数。');
          return ms;
        };
        return { id: (row as HTMLElement).dataset.segmentId, startMs: milliseconds('startMs'), endMs: milliseconds('endMs'), text: row.querySelector('textarea')!.value };
      });
      const result = await request<API.Transcript>(`/api/transcripts/${item.id}`, { method: 'PATCH', body: { expectedVersion: item.version, segments } });
      if (currentUser?.id !== owner || subtitleRevision !== token || subtitle !== item) return;
      subtitleDirty = false; await loadSubtitle();
      notice('subtitle-error', '');
    });
  });
  // 关闭/刷新页面时只能使用浏览器的离站保护，不能以异步站内弹窗替代。
  window.addEventListener('beforeunload', (event) => { if (subtitleDirty || translationDraft || translationRun || joinDirty || exportDirty || workflowDirty) { event.preventDefault(); event.returnValue = ''; } });

  function taskActive<T extends { status: string }>(task: T | null | undefined): task is T & { status: 'QUEUED' | 'RUNNING' | 'CANCELLING' } { return !!task && ['QUEUED', 'RUNNING', 'CANCELLING'].includes(task.status); }
  function taskStatus(status: string, operation?: string) {
    const verb = taskVerb(operation);
    return ({ QUEUED: '排队中', RUNNING: verb + '中', CANCELLING: '取消中', CANCELLED: '已取消', SUCCEEDED: '已完成', FAILED: verb + '失败' })[status] || status;
  }
  function taskVerb(operation?: string) { return operation === 'workflow' ? '顺序处理' : operation === 'export' ? '导出' : operation === 'join_clips' ? '拼接' : operation === 'burn_subtitles' ? '字幕烧录' : operation === 'transcribe' ? '识别' : operation === 'mute' ? '静音' : operation === 'trim' ? '裁切' : operation === 'extract_audio' ? '提取' : operation === 'compress' ? '压缩' : '转换'; }
  function taskFormat(parameters: Parameters | null) {
    if (parameters?.operation === 'workflow') return `${parameters.outputFormat.toUpperCase()} · ${(parameters.steps ?? []).length} 步`;
    if (parameters?.operation === 'export') return `${parameters.outputFormat.toUpperCase()}${parameters.videoCodec ? ' · ' + parameters.videoCodec : ''}${parameters.startMs !== null ? ' · 裁切' : ''}${parameters.targetSizeBytes !== null ? ' · 压缩' : ''}${parameters.audioMode === 'mute' ? ' · 静音' : ''}`;
    if (parameters?.operation === 'join_clips') return `MP4 · ${(parameters.clips ?? []).length}段 · ${((parameters.clips ?? []).reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0) / 1000).toFixed(3)} 秒`;
    if (parameters?.operation === 'burn_subtitles') return `MP4 · 字幕 v${parameters.transcriptVersion}`;
    if (parameters?.operation === 'trim') return `MP4 · ${((parameters.startMs ?? 0) / 1000).toFixed(3)}-${((parameters.endMs ?? 0) / 1000).toFixed(3)} 秒`;
    return parameters?.operation === 'extract_audio' ? 'MP3' : `MP4 · ${parameters?.resolutionPreset === '720p' ? '720p' : '原分辨率'}`;
  }
  function displayTask(task: Task, preferredOutputId = outputId) {
    selectedTask = task;
    if (task.kind === 'TRANSCRIPTION') {
      $('conversion-result').hidden = true;
      if (task.mediaId === selectedMedia?.id && task.status === 'SUCCEEDED' && task.transcript
          && subtitleTaskLoaded !== task.id && !subtitleDirty && !translationDraft && !translationRun && !subtitleLoading) {
        subtitleTaskLoaded = task.id; loadSubtitle();
      }
      syncMediaControls(); return;
    }
    $('conversion-result').hidden = false;
    $('task-status').textContent = taskStatus(task.status, task.parameters?.operation);
    $('task-status').className = 'media-status ' + (task.status === 'SUCCEEDED' ? 'ready' : task.status === 'FAILED' ? 'failed' : '');
    const stage = ({ WAITING: '等待处理', TRANSCODING: '正在' + taskVerb(task.parameters?.operation), VERIFYING: '正在校验文件', DONE: task.outputs.length ? '文件已就绪' : '无可用结果', CANCELLED: '任务已取消', FAILED: '任务未完成', TRANSCRIBING: '正在识别', EXPORTING: '正在导出' })[task.stage] || task.stage;
    $('task-stage').textContent = `${task.id.slice(0, 8)} · ${taskFormat(task.parameters)} · ${stage}`;
    notice('task-error', task.error?.message || '', true);
    $('cancel-task').hidden = !taskActive(task);
    const result = task.status === 'SUCCEEDED' ? task.outputs.find((item) => item.id === preferredOutputId) || task.outputs[0] : null;
    $('output-selector-field').hidden = task.outputs.length < 2;
    $('output-selector').replaceChildren(...task.outputs.map((item) => { const option = document.createElement('option'); option.value = String(item.id); option.textContent = item.filename; return option; }));
    if (result) $('output-selector').value = String(result.id);
    $('output-empty').hidden = task.status !== 'SUCCEEDED' || !!result;
    const audioResult = result?.contentType?.startsWith('audio/');
    $('compression-stats').hidden = !result || task.parameters?.operation !== 'compress';
    $('compression-stats').textContent = result && task.parameters?.operation === 'compress'
      ? `目标 ${sizeText(task.parameters.targetSizeBytes ?? 0)} · 实际 ${sizeText(result.sizeBytes)}` : '';
    if (outputId !== (result?.id || null)) {
      $('output-preview').pause();
      $('output-audio').pause();
      $('output-preview').removeAttribute('src'); $('output-preview').load();
      $('output-audio').removeAttribute('src'); $('output-audio').load();
      if (result?.previewUrl) $(audioResult ? 'output-audio' : 'output-preview').src = result.previewUrl;
      outputId = result?.id || null;
    }
    $('output-preview').hidden = !result?.previewUrl || !!audioResult;
    $('output-audio').hidden = !result?.previewUrl || !audioResult;
    notice('output-preview-status', result && !result.previewUrl ? '当前格式请下载后播放。' : '');
    $('audio-stats').hidden = !audioResult;
    $('audio-stats').textContent = audioResult && result ? `${((result.metadata?.durationMs ?? 0) / 1000).toFixed(2)} 秒 · ${sizeText(result.sizeBytes)}` : '';
    $('download-label').textContent = '下载 ' + (result?.filename?.split('.').pop()?.toUpperCase() || '文件');
    $('download-output').hidden = !result;
    $('delete-output').hidden = !result;
    if (result) { $('download-output').href = result.downloadUrl; $('download-output').setAttribute('download', result.filename); }
    else $('download-output').removeAttribute('href');
    syncMediaControls();
  }
  $('output-selector').addEventListener('change', () => {
    const id = $('output-selector').value;
    if (selectedTask) displayTask(selectedTask, id);
  });
  for (const id of ['output-preview', 'output-audio'] as const) $(id).addEventListener('error', () => {
    if (outputId && $(id).error) notice('output-preview-status', '浏览器无法播放此编码，请下载后播放。');
  });

  async function openListedMedia(item: API.Media) {
    const owner = currentUser?.id, revision = workspaceRevision;
    if (!await confirmMediaSwitch(item.id) || busy || currentUser?.id !== owner || workspaceRevision !== revision) return;
    displayMedia(item);
    if (selectedMedia?.id === item.id && item.status === 'READY') selectWorkbenchPhase('edit');
  }
  function removeListedMedia(item: API.Media) {
    if (busy || !currentUser) return;
    deletingMedia = { id: item.id, owner: currentUser.id, revision: workspaceRevision };
    $('delete-media-name').textContent = item.originalFilename; notice('delete-media-error', '');
    $('delete-media-dialog').showModal(); $('cancel-delete-media').focus();
  }
  async function openListedTask(task: Task) {
    const owner = currentUser?.id, revision = workspaceRevision;
    if (task.mediaId) {
            if (!await confirmMediaSwitch(task.mediaId) || busy || currentUser?.id !== owner || workspaceRevision !== revision) return;
            operation('task-list-error', async () => {
              const source = await request<API.Media>(`/api/media/${task.mediaId}`);
              if (currentUser?.id !== owner || workspaceRevision !== revision) return;
              displayMedia(source);
              if (selectedMedia?.id !== source.id) return;
              if (task.parameters?.operation === 'workflow') {
                selectTool('ai'); setWorkflowMode(true); fillWorkflow(task.parameters);
                renderAIPlan({ id: task.planId || task.id, mediaId: task.mediaId, version: task.planVersion || 1, status: 'EXECUTED', parameters: task.parameters,
                  summary: taskFormat(task.parameters), questions: [], warnings: [], taskId: task.id });
              } else if (task.parameters?.operation === 'join_clips') {
                selectTool('join'); joinRevision++; joinLoading = false; joinSourceId = task.mediaId;
                joinRows = (task.parameters.clips ?? []).map((clip) => joinRow(clip.startMs, clip.endMs)); joinDirty = false; pendingJoinPlan = null; renderJoin();
              } else if (task.kind === 'TRANSCRIPTION' || task.parameters?.operation === 'burn_subtitles') selectTool('subtitle');
              else selectTool(task.parameters?.operation === 'export' && !task.parameters.videoCodec || task.parameters?.operation === 'extract_audio' ? 'audio'
                : (({ mute: 'mute', trim: 'trim', compress: 'compress' } as Record<string, string>)[task.parameters?.operation || ''] || 'convert'));
              revealTask(task);
            });
          } else { selectTool(task.parameters?.operation === 'mute' ? 'mute' : task.parameters?.operation === 'trim' ? 'trim' : task.parameters?.operation === 'extract_audio' ? 'audio' : task.parameters?.operation === 'compress' ? 'compress' : 'convert'); revealTask(task); }
  }
  async function inspectListedTask(task: Task) {
    if (!task.planId) return;
    const owner = currentUser?.id, revision = workspaceRevision;
    const key = task.planId + ':' + task.planVersion;
    if (recordInstructions.has(key) || instructionRequests.has(key)) return;
    instructionRequests.add(key); recordInstructions.set(key, '正在读取处理要求…');
    try {
      const plan = await request<Plan>(`/api/operation-plans/${task.planId}`);
      if (currentUser?.id === owner && workspaceRevision === revision) recordInstructions.set(key, plan.instruction || plan.summary || '');
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id === owner && workspaceRevision === revision) recordInstructions.set(key, error.status === 404 ? '原方案已删除，任务参数仍保留。' : '处理要求暂时无法读取。');
    } finally { instructionRequests.delete(key); }
  }
  async function deleteRecord(kind: 'task' | 'plan', record: Task | Plan) {
    if (busy || kind === 'task' && taskActive(record)) return;
    const text = kind === 'task' ? '删除这条处理记录？仅从记录列表移除，原素材和生成文件会保留。' : '删除这个保存的方案？已生成的任务和文件不受影响。';
    if (!await confirmAction({ title: kind === 'task' ? '删除处理记录' : '删除保存的方案', message: text, confirmLabel: '确认删除', kind: 'danger', icon: 'trash-2' })) return;
    const owner = currentUser?.id, revision = workspaceRevision;
    operation(kind === 'task' ? 'task-list-error' : 'plan-list-error', async () => {
      await request<void>(`/api/${kind === 'task' ? 'tasks' : 'operation-plans'}/${record.id}`, { method: 'DELETE' });
      if (currentUser?.id !== owner || workspaceRevision !== revision) return;
      expandedRecords.delete(kind + ':' + record.id);
      if (kind === 'task') {
        taskListRevision++;
        if (selectedTask?.id === record.id) clearTaskResult();
        await loadTasks(); $('refresh-tasks').focus();
      } else {
        if (exportPlan?.id === record.id) { exportPlan = null; exportDirty = true; notice('export-plan-state', '方案已删除，当前参数未清空'); }
        if (pendingPlan?.id === record.id) pendingPlan = null;
        if (pendingJoinPlan?.id === record.id) { pendingJoinPlan = null; joinDirty = true; }
        if (pendingSubtitlePlan?.id === record.id) pendingSubtitlePlan = null;
        if (aiPlan?.id === record.id) { aiPlan = null; aiPlanDirty = true; $('ai-plan').hidden = true; }
        for (const key of recordInstructions.keys()) if (key.startsWith(record.id + ':')) recordInstructions.delete(key);
        await loadPlans(); $('refresh-plans').focus();
      }
    });
  }
  async function restoreListedPlan(plan: Plan) {
    const dirty = exportDirty || aiPlanDirty || workflowDirty || joinDirty || subtitleDirty || !!translationDraft;
    if (busy || dirty && !await confirmAction({ title: '恢复保存的方案', message: '当前未保存的编辑将被此方案替换。已保存的版本和生成文件不受影响。', confirmLabel: '恢复方案', icon: 'rotate-ccw' })) return;
    const owner = currentUser?.id, revision = workspaceRevision;
    operation('plan-list-error', async () => {
      const source = await request<API.Media>(`/api/media/${plan.mediaId}`);
      if (currentUser?.id !== owner || workspaceRevision !== revision) return;
      displayMedia(source); if (selectedMedia?.id !== source.id) return;
      const p = plan.parameters;
      if (!p) throw new Error('这个方案尚未生成可执行参数。');
      if (p?.operation === 'export') restoreExportPlan(plan);
      else if (plan.instruction || p?.operation === 'workflow') {
        aiRevision++; aiLoading = false; aiSourceId = source.id;
        selectTool('ai'); setWorkflowMode(p?.operation === 'workflow');
        if (workflowMode) fillWorkflow(p); else $('ai-instruction').value = String(plan.instruction || '');
        renderAIPlan(plan);
      } else if (p?.operation === 'join_clips') {
        joinRevision++; joinLoading = false; joinSourceId = source.id; selectTool('join');
        joinRows = (p.clips ?? []).map(clip => joinRow(clip.startMs, clip.endMs)); joinDirty = false; pendingJoinPlan = plan.status === 'READY' ? plan : null; renderJoin();
      } else if (p?.operation === 'burn_subtitles') {
        selectTool('subtitle');
      } else {
        const tool = { transcode: 'convert', compress: 'compress', extract_audio: 'audio', trim: 'trim', mute: 'mute' }[p?.operation];
        if (!tool) throw new Error('这个方案暂不支持恢复编辑。');
        clearExport(); selectTool(tool); $('conversion-resolution').value = String(p.resolutionPreset || 'source');
        if (p.startMs != null) { $('trim-start').value = String(p.startMs / 1000); $('trim-end').value = String((p.endMs ?? p.startMs ?? 0) / 1000); }
        if (p.targetSizeBytes) $('compression-target').value = String(p.targetSizeBytes / 1024 / 1024);
        pendingPlan = plan.status === 'READY' ? plan : null;
      }
      selectWorkbenchPhase('edit'); syncMediaControls();
      if (plan.taskId) {
        const task = await request<Task>(`/api/tasks/${plan.taskId}`);
        if (currentUser?.id === owner && workspaceRevision === revision && selectedMedia?.id === source.id) displayTask(task);
      }
    });
  }
  async function loadPlans() {
    const owner = currentUser?.id, revision = workspaceRevision, page = planPage, token = ++planListRevision;
    if (!owner) return;
    try {
      const result = await request<Page<Plan>>(`/api/operation-plans?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || token !== planListRevision || page !== planPage) return;
      if (page > 1 && !result.items.length) { planPage = Math.max(1, Math.ceil(result.total / 10)); return loadPlans(); }
      planTotal = result.total; $('plan-total').textContent = `${result.total} 个方案`; $('plan-page').textContent = String(page);
      $('plan-list-empty').hidden = !!result.items.length; notice('plan-list-error', '');
      historyView.update({ plans: result.items });
      icons(); syncMediaControls();
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || token !== planListRevision) return;
      if (error.status === 401) showAuth(); else notice('plan-list-error', error.message, true);
    }
  }
  function selectHistoryTab(plans: boolean) {
    $('history-tasks-slot').hidden = plans; $('history-plans-panel').hidden = !plans;
    $('history-tasks-tab').setAttribute('aria-selected', String(!plans)); $('history-plans-tab').setAttribute('aria-selected', String(plans));
    $('history-tasks-tab').tabIndex = plans ? -1 : 0; $('history-plans-tab').tabIndex = plans ? 0 : -1;
    if (plans) loadPlans(); else loadTasks();
  }
  $('history-tasks-tab').addEventListener('click', () => selectHistoryTab(false));
  $('history-plans-tab').addEventListener('click', () => selectHistoryTab(true));
  document.querySelector<HTMLElement>('.history-tabs')!.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const plans = event.key === 'End' || event.key !== 'Home' && $('history-plans-panel').hidden;
    selectHistoryTab(plans); $(plans ? 'history-plans-tab' : 'history-tasks-tab').focus();
  });
  $('refresh-plans').addEventListener('click', loadPlans);
  $('plan-prev').addEventListener('click', () => { if (planPage > 1) { planPage--; loadPlans(); } });
  $('plan-next').addEventListener('click', () => { if (planPage * 10 < planTotal) { planPage++; loadPlans(); } });

  async function loadTasks() {
    clearTimeout(taskTimer ?? undefined); taskTimer = null;
    const token = ++taskListRevision;
    const owner = currentUser?.id;
    const page = taskPage;
    const revision = workspaceRevision;
    if (!owner) return;
    try {
      const result = await request<Page<Task>>(`/api/tasks?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || taskPage !== page || workspaceRevision !== revision || taskListRevision !== token) return;
      if (page > 1 && !result.items.length) { taskPage = Math.max(1, Math.ceil(result.total / 10)); return loadTasks(); }
      notice('task-list-error', '');
      taskTotal = result.total;
      $('task-total').textContent = `${result.total} 个任务`; $('task-page').textContent = String(page);
      $('task-list-empty').hidden = result.items.length > 0;
      historyView.update({ tasks: result.items });
      const chosen = result.items.find((task) => task.id === selectedTask?.id);
      if (chosen) displayTask(chosen);
      else if (!selectedTask && result.items.length) displayTask(result.items[0]);
      else if (selectedTask) {
        const id = selectedTask.id;
        let updated;
        try { updated = await request<Task>(`/api/tasks/${id}`); }
        catch (caught) {
      const error = errorInfo(caught);
          if (currentUser?.id !== owner || workspaceRevision !== revision || taskListRevision !== token) return;
          if (error.status !== 404) throw error;
          clearTaskResult(); return;
        }
        if (currentUser?.id !== owner || selectedTask?.id !== id || taskPage !== page || workspaceRevision !== revision || taskListRevision !== token) return;
        displayTask(updated);
      }
      icons(); syncMediaControls();
      if (result.items.some(taskActive) || taskActive(selectedTask)) taskTimer = setTimeout(loadTasks, 2000);
    } catch (caught) {
      const error = errorInfo(caught);
      if (currentUser?.id !== owner || workspaceRevision !== revision || taskPage !== page || taskListRevision !== token) return;
      if (error.status === 401) showAuth();
      else { notice('task-list-error', error.message, true); taskTimer = setTimeout(loadTasks, 5000); }
    }
  }

  $('conversion-form').addEventListener('submit', (event) => {
    event.preventDefault();
    operation('conversion-error', async () => {
      if (selectedMedia?.status !== 'READY') throw new Error('当前素材尚未就绪。');
      const mediaId = selectedMedia.id;
      const resolution = $('conversion-resolution').value;
      const range = trimRange();
      if (processingOperation === 'trim' && !range.valid) throw new Error('区间需至少0.5秒，且不超过素材时长。');
      let parameters: Parameters = processingOperation === 'trim' ? { operation: 'trim', outputFormat: 'mp4', startMs: range.startMs, endMs: range.endMs, audioMode: 'keep' }
        : processingOperation === 'extract_audio' ? { operation: 'extract_audio', outputFormat: 'mp3' }
        : processingOperation === 'mute' ? { operation: 'mute', outputFormat: 'mp4', resolutionPreset: resolution }
        : { operation: processingOperation, outputFormat: 'mp4', resolutionPreset: resolution, audioMode: 'keep' };
      if (processingOperation === 'extract_audio' && !selectedMedia.metadata?.hasAudio) throw new Error('素材没有可提取的音轨。');
      if (processingOperation === 'compress') {
        parameters.targetSizeBytes = Math.floor(Number($('compression-target').value) * 1024 * 1024);
        if (!Number.isSafeInteger(parameters.targetSizeBytes) || parameters.targetSizeBytes < 32768 || parameters.targetSizeBytes >= selectedMedia.sizeBytes)
          throw new Error('目标体积需至少32 KB，并小于原文件。');
      }
      if (usesExport() || exportPlan?.mediaId === mediaId && exportPlan.status === 'READY' && sameParameters(exportPlan.parameters, exportParameters())) parameters = exportParameters();
      const owner = currentUser?.id, revision = workspaceRevision;
      // Retain the plan on an uncertain execute response so another click cannot enqueue a duplicate task.
      if (!pendingPlan || pendingPlan.mediaId !== mediaId || !sameParameters(pendingPlan.parameters, parameters)) {
        const plan = parameters.operation === 'export' ? await saveExportPlan(parameters)
          : await request<Plan>('/api/operation-plans', { method: 'POST', body: { mediaId, parameters } });
        if (!plan || currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
        pendingPlan = plan;
      }
      const task = await request<Task>(`/api/operation-plans/${pendingPlan.id}/execute`, { method: 'POST', body: { expectedVersion: pendingPlan.version } });
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
      if (exportPlan?.id === pendingPlan.id) exportPlan = { ...exportPlan, status: 'EXECUTED' };
      exportDirty = false;
      revealTask(task); pendingPlan = null; taskPage = 1; await loadTasks();
    });
  });
  $('cancel-task').addEventListener('click', () => operation('task-error', async () => {
    if (!selectedTask) return;
    displayTask(await request<Task>(`/api/tasks/${selectedTask.id}/cancel`, { method: 'POST' })); await loadTasks();
  }));
  function closeOutputDelete() { $('delete-output-dialog').close(); deletingOutput = null; }
  $('delete-output').addEventListener('click', () => {
    const result = selectedTask?.outputs.find((item) => item.id === outputId);
    if (busy || !result) return;
    if (!currentUser) return;
    deletingOutput = { id: result.id, owner: currentUser.id };
    $('delete-output-name').textContent = result.filename; notice('delete-output-error', '');
    $('delete-output-dialog').showModal(); $('cancel-delete-output').focus();
  });
  $('close-delete-output').addEventListener('click', closeOutputDelete);
  $('cancel-delete-output').addEventListener('click', closeOutputDelete);
  $('delete-output-dialog').addEventListener('cancel', (event) => { if (busy) event.preventDefault(); else deletingOutput = null; });
  $('delete-output-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy || !deletingOutput) return;
    const item = deletingOutput;
    operation('delete-output-error', async () => {
      await request<void>(`/api/outputs/${item.id}`, { method: 'DELETE' });
      if (currentUser?.id !== item.owner) return;
      workspaceRevision++;
      if (selectedTask) displayTask({ ...selectedTask, outputs: selectedTask.outputs.filter((result) => result.id !== item.id) });
      closeOutputDelete(); await loadTasks();
      notice('account-notice', '结果已删除，原素材和处理记录已保留。');
      $('refresh-tasks').focus();
    });
  });
  $('refresh-tasks').addEventListener('click', loadTasks);
  $('task-prev').addEventListener('click', () => { if (taskPage > 1) { taskPage--; loadTasks(); } });
  $('task-next').addEventListener('click', () => { if (taskPage * 10 < taskTotal) { taskPage++; loadTasks(); } });
  // 标签页间只广播“账号状态变了”，不传凭证；其他标签页收到后重新向服务端确认身份。
  if (channel) channel.onmessage = () => { finishCloudConfirmation(false); finishActionConfirmation(false); loadCloudConfirmationSetting(); if (!busy) restoreSession(); };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !busy && capabilities) restoreSession();
  });

  // 加载系统能力和登录状态，完成页面初始化。
  async function boot() {
    showOnly('loading-view');
    setBusy(true);
    try {
      capabilities = await request<API.Capabilities>('/api/system/capabilities');
      await restoreSession();
    } catch (caught) {
      const error = errorInfo(caught);
      $('unavailable-message').textContent = error.code === 'HTTPS_REQUIRED' ? messages.HTTPS_REQUIRED : '服务暂时不可用，请稍后重试。';
      showOnly('unavailable-view');
    } finally {
      setBusy(false);
      icons();
    }
  }

  // 只移动已有节点，保留表单、事件、任务轮询及未保存输入，阶段切换不重新创建业务视图。
  $('import-library-slot').append($('recent-section'));
  $('history-tasks-slot').append($('task-section'));
  $('export-result-slot').append($('conversion-result'));
  $('editor-preview-slot').append($('source-preview'));
  $('editor-preview-messages').append($('source-preview-status'), $('retry-source-preview'));
  $('editor-info-details').open = !narrowNavigation.matches;
  $('continue-editing').addEventListener('click', () => selectWorkbenchPhase('edit'));
  $('replace-source').addEventListener('click', () => selectWorkbenchPhase('import'));
  $('back-to-editing').addEventListener('click', () => selectWorkbenchPhase('edit'));
  document.querySelectorAll<HTMLElement>('[data-tool-target]').forEach(button => button.addEventListener('click', () => selectTool(button.dataset.toolTarget || '')));
  icons();
  // 只刷新状态，不自动重发模型请求；服务停止或恢复后可更新按钮和不可用提示。
  let refreshingCapabilities = false;
  setInterval(async () => {
    if (!currentUser || busy || document.hidden || refreshingCapabilities) return;
    refreshingCapabilities = true;
    try { await refreshUserCapabilities(); } finally { refreshingCapabilities = false; }
  }, 10000);
  boot();
}
