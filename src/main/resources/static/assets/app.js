(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  // 登录令牌不是 JWT：AMW_SESSION HttpOnly Cookie 携带服务端会话 ID，JS 不读取或写入 localStorage。
  let currentUser = null;
  let csrfToken = null;
  let capabilities = null;
  let cloudEntries = null, cloudOwner = null, cloudLoading = false, cloudRevision = 0;
  let busy = false;
  const narrowNavigation = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let navigationPreference = { pinned: true, open: true };
  const toolGroupPreferences = { regular: true, ai: true, history: true };
  try {
    const saved = JSON.parse(localStorage.getItem('amw-navigation') || 'null');
    if (saved && typeof saved.pinned === 'boolean' && typeof saved.open === 'boolean') navigationPreference = saved;
  } catch { /* 存储被禁用时，导航仍使用默认设置。 */ }
  try {
    const saved = JSON.parse(localStorage.getItem('amw-tool-groups') || 'null');
    for (const name of Object.keys(toolGroupPreferences)) if (typeof saved?.[name] === 'boolean') toolGroupPreferences[name] = saved[name];
  } catch { /* 分组偏好不影响功能可用性。 */ }
  let navigationOpen = !narrowNavigation.matches && navigationPreference.open;
  let activeTool = 'detect', toolAnimation = null, dependencySignature = '';
  const phaseOrder = ['import', 'edit', 'export'];
  const toolPhases = new Map();
  let activePhase = 'import', phaseAnimation = null;
  let registrationChallenge = null;
  const registrationCooldowns = new Map();
  let registrationCooldownTimer = null;
  let activePanel = 'workbench';
  let mediaPage = 1;
  let mediaTotal = 0;
  let selectedMedia = null;
  let probeTimer = null;
  let previewUrl = null;
  let selectedTask = null;
  let taskTimer = null;
  let taskPage = 1;
  let taskTotal = 0;
  let planPage = 1, planTotal = 0, planListRevision = 0, taskListRevision = 0;
  const expandedRecords = new Set(), recordInstructions = new Map();
  let pendingPlan = null;
  let exportPlan = null, exportDirty = false, exportRevision = 0;
  let outputId = null;
  let processingOperation = 'transcode';
  let compressionSourceId = null;
  let trimSourceId = null;
  let deletingMedia = null;
  let deletingOutput = null;
  let workspaceRevision = 0;
  let subtitle = null;
  let subtitleMediaId = null;
  let subtitleRevision = 0;
  let subtitleLatestVersion = 0;
  let subtitleDirty = false;
  let subtitleLoading = false;
  let subtitleTaskLoaded = null;
  let pendingSubtitlePlan = null;
  let joinRows = [], joinSourceId = null, joinRevision = 0, joinLoading = false, joinDirty = false, pendingJoinPlan = null, joinPreviewRange = null;
  let aiPlan = null;
  let aiSourceId = null;
  let aiRevision = 0;
  let aiLoading = false;
  let aiPlanDirty = false;
  let aiGenerating = false;
  let workflowMode = false, workflowSteps = [], workflowDirty = false;
  let findTranscript = null;
  let findMediaId = null;
  let findRevision = 0;
  let findLoading = false;
  let findRunning = false;
  let findResult = null;
  let findPreviewRange = null;
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('amw-account') : null;

  const messages = {
    INVALID_CREDENTIALS: '用户名或密码不正确。',
    UNAUTHENTICATED: '登录已失效，请重新登录。',
    CSRF_INVALID: '安全验证已过期，请重新提交。',
    CURRENT_PASSWORD_INVALID: '当前密码不正确。',
    ACCOUNT_ALREADY_EXISTS: '用户名或邮箱已被使用，请更换后重试。',
    INVALID_REQUEST: '请完整填写表单。',
    INVALID_PARAMETERS: '请检查输入内容和确认用户名。',
    PASSWORD_UNCHANGED: '新密码不能与当前密码相同。',
    WEAK_PASSWORD: '密码过于简单，请换用不易猜测的密码。',
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

  class ApiError extends Error {
    constructor(code, status, retryAfter) {
      super(code === 'RATE_LIMITED'
        ? `操作过于频繁，请在${Math.max(1, Number(retryAfter) || 60)}秒后重试。`
        : (code === 'AI_UNAVAILABLE' && capabilities?.textAi?.source === 'SERVER'
          ? messages.LOCAL_AI_UNAVAILABLE : messages[code] || '请求未完成，请稍后重试。'));
      this.code = code;
      this.status = status;
      this.retryAfter = Math.max(1, Number(retryAfter) || 60);
    }
  }

  // 获取并保存最新 CSRF 令牌。
  async function refreshCsrf() {
    const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('暂时无法连接服务，请稍后重试。');
    const result = await response.json();
    if (result.code !== 'SUCCESS' || !result.data?.token) throw new Error('暂时无法连接服务，请稍后重试。');
    csrfToken = result.data.token;
  }

  // 发送 API 请求，处理统一响应、错误和 CSRF 过期重试。
  async function request(path, options = {}, retried = false) {
    // 所有 API 共用入口：封装 JSON、自动携带同源 Cookie，并为写请求附加 CSRF 头。
    const method = options.method || 'GET';
    const writes = method !== 'GET';
    const multipart = options.body instanceof FormData;
    if (writes && !csrfToken) await refreshCsrf();
    const headers = { Accept: 'application/json' };
    if (writes) headers['X-CSRF-Token'] = csrfToken;
    if (options.body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(path, {
        method, headers, credentials: 'same-origin', cache: 'no-store',
        body: options.body === undefined ? undefined : multipart ? options.body : JSON.stringify(options.body)
      });
    } catch {
      throw new Error('暂时无法连接服务，请稍后重试。');
    }
    // 成功和失败都解析 Result；调用方只接收 data，退出等无数据成功返回 null。
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.code !== 'SUCCESS') {
      if (response.status === 403 && result.code === 'CSRF_INVALID' && !retried) {
        // 仅在安全过滤器尚未执行业务就拒绝请求时重试一次；网络错误不自动重发，避免重复操作。
        await refreshCsrf();
        return request(path, options, true);
      }
      throw new ApiError(result.code, response.status, response.headers.get('Retry-After'));
    }
    return result.data;
  }

  // 将图标占位元素渲染为 Lucide 图标。
  function icons() { window.lucide?.createIcons(); }

  // 在指定位置显示或清除提示信息。
  function notice(id, text, error = false) {
    const element = $(id);
    element.textContent = text;
    element.hidden = !text;
    element.classList.toggle('error', error);
  }

  // 只显示指定页面视图。
  function showOnly(view) {
    for (const id of ['loading-view', 'unavailable-view', 'auth-view', 'account-view']) {
      $(id).hidden = id !== view;
    }
    $('header-logout').hidden = view !== 'account-view';
    $('header-account').hidden = view !== 'account-view';
    syncNavigation();
  }

  // 设置请求等待状态并禁用或恢复表单控件。
  function setBusy(value) {
    busy = value;
    document.querySelectorAll('button, form input, form select').forEach((element) => { element.disabled = value || element.hasAttribute('data-unavailable'); });
    updateRegistrationControls();
    document.body.setAttribute('aria-busy', String(value));
    syncMediaControls();
  }

  // 没有邮件服务或尚未申请验证码时，不允许提交注册。
  function updateRegistrationControls() {
    const now = Date.now();
    for (const [email, until] of registrationCooldowns) if (until <= now) registrationCooldowns.delete(email);
    const email = $('register-email').value.trim().toLowerCase();
    const seconds = Math.max(0, Math.ceil(((registrationCooldowns.get(email) || 0) - now) / 1000));
    $('send-email-code').disabled = busy || !capabilities?.registration || seconds > 0;
    $('email-code-label').textContent = seconds > 0 ? `${seconds}秒后重发` : '发送验证码';
    $('register-submit').disabled = busy || !capabilities?.registration || !registrationChallenge;
    $('register-unavailable').hidden = !capabilities || capabilities.registration;
    if (!registrationCooldowns.size && registrationCooldownTimer) { clearInterval(registrationCooldownTimer); registrationCooldownTimer = null; }
  }

  function registrationCooldown(email, seconds) {
    registrationCooldowns.set(email, Date.now() + Math.max(1, seconds) * 1000);
    if (!registrationCooldownTimer) registrationCooldownTimer = setInterval(updateRegistrationControls, 250);
    updateRegistrationControls();
  }

  // 切换登录和注册表单。
  function switchMode(mode) {
    const login = mode === 'login';
    $('login-tab').setAttribute('aria-selected', String(login));
    $('register-tab').setAttribute('aria-selected', String(!login));
    $('login-panel').hidden = !login;
    $('register-panel').hidden = login;
    $('auth-title').textContent = login ? '登录账户' : '创建账户';
    notice('login-error', '');
    notice('register-error', '');
  }

  // 清空密码输入框并恢复密码隐藏状态。
  function clearPasswords() {
    document.querySelectorAll('input[autocomplete="current-password"], input[autocomplete="new-password"]').forEach((input) => {
      input.value = '';
      input.type = 'password';
    });
    document.querySelectorAll('.password-toggle').forEach((button) => {
      button.title = '显示密码';
      button.setAttribute('aria-label', '显示密码');
      button.innerHTML = '<i data-lucide="eye" aria-hidden="true"></i>';
    });
    icons();
  }

  // 清除页面中的用户状态并显示登录界面。
  function showAuth(message = '') {
    currentUser = null;
    clearCloud();
    if (capabilities) capabilities = { ...capabilities, aiPlans: false, asr: false, asrProviders: [], semanticSearch: false, clipRecommendations: false, subtitleCorrection: false };
    resetWorkbench();
    $('delete-dialog').close();
    clearPasswords();
    switchMode('login');
    showOnly('auth-view');
    notice('auth-notice', message);
    notice('account-notice', '');
  }

  // 填充用户资料并显示账号界面。
  function showAccount(user) {
    // 用户输入用 textContent 填入，不能当作 HTML 执行，避免昵称等字段造成脚本注入。
    const first = currentUser?.id !== user.id;
    currentUser = user;
    $('workspace-user').textContent = user.displayName;
    $('account-greeting').textContent = `你好，${user.displayName}`;
    $('profile-username').textContent = user.username;
    $('profile-email').textContent = user.email;
    $('profile-email-status').textContent = user.emailVerified ? '已验证' : '未验证';
    $('profile-created').textContent = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai'
    }).format(new Date(user.createdAt));
    $('profile-name').value = user.displayName;
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
      const user = await request('/api/users/me');
      showAccount(user);
    } catch (error) {
      if (error.status === 401) showAuth();
      else showOnly('unavailable-view');
    }
  }

  // 执行表单操作，统一处理等待状态和错误提示。
  async function operation(errorId, action) {
    // 表单操作统一管理等待、错误和解锁；finally 确保请求失败后按钮也能恢复。
    notice(errorId, '');
    setBusy(true);
    try {
      await action();
    } catch (error) {
      if (error.code === 'UNAUTHENTICATED') {
        showAuth();
        notice('auth-notice', error.message, true);
        await refreshCsrf().catch(() => {});
      } else notice(errorId, error.message, true);
    } finally {
      setBusy(false);
    }
  }

  // 检查新密码长度及两次输入是否一致。
  function validateNewPassword(password, confirmation) {
    const length = Array.from(password).length;
    if (length < 6 || length > 16) throw new Error('密码需要6–16个字符。');
    if (password !== confirmation) throw new Error('两次输入的密码不一致。');
  }

  $('login-tab').addEventListener('click', () => { switchMode('login'); notice('auth-notice', ''); });
  $('register-tab').addEventListener('click', () => { switchMode('register'); notice('auth-notice', ''); });
  document.querySelector('.tabs').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const tab = event.key === 'ArrowRight' ? $('register-tab') : $('login-tab');
    tab.click();
    tab.focus();
  });
  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = $(button.dataset.passwordTarget);
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.title = reveal ? '隐藏密码' : '显示密码';
      button.setAttribute('aria-label', button.title);
      button.innerHTML = reveal ? '<i data-lucide="eye-off" aria-hidden="true"></i>' : '<i data-lucide="eye" aria-hidden="true"></i>';
      icons();
    });
  });

  // 更换邮箱后必须重新取码，不能拿旧邮箱的验证结果注册另一个邮箱。
  $('register-email').addEventListener('input', () => {
    registrationChallenge = null;
    $('register-email-code').value = '';
    $('email-code-notice').hidden = true;
    updateRegistrationControls();
  });

  $('send-email-code').addEventListener('click', () => {
    const input = $('register-email');
    if (!input.reportValidity()) return;
    const email = input.value.trim().toLowerCase();
    operation('register-error', async () => {
      let challenge;
      try { challenge = await request('/api/auth/registration-email-code', { method: 'POST', body: { email } }); }
      catch (error) {
        if (error.code === 'RATE_LIMITED') registrationCooldown(email, error.retryAfter);
        throw error;
      }
      registrationCooldown(email, 20);
      registrationChallenge = { ...challenge, email };
      $('register-email-code').value = '';
      $('email-code-notice').textContent = '验证码已发送，请查看邮箱。';
      $('email-code-notice').hidden = false;
    });
  });

  $('register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    operation('register-error', async () => {
      validateNewPassword(body.password, body.confirmPassword);
      // 确认密码只用于前端比对，不属于后端 DTO；后端仍独立校验密码规则，不能信任前端检查。
      delete body.confirmPassword;
      body.email = body.email.trim();
      if (!registrationChallenge || registrationChallenge.email !== body.email.toLowerCase()) {
        throw new Error('请先获取当前邮箱的验证码。');
      }
      body.emailChallengeId = registrationChallenge.challengeId;
      body.displayName = body.displayName.trim();
      if (!body.displayName) delete body.displayName;
      if (body.displayName && Array.from(body.displayName).length > 50) throw new Error('昵称最多50个字符。');
      const user = await request('/api/auth/register', { method: 'POST', body });
      $('login-username').value = user.username;
      $('register-form').reset();
      registrationChallenge = null;
      $('email-code-notice').hidden = true;
      showAuth('注册成功，请登录。');
      $('login-username').value = user.username;
      $('login-password').focus();
    });
  });

  $('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const body = {
      username: $('login-username').value, password: $('login-password').value,
      rememberMe: $('remember-me').checked
    };
    operation('login-error', async () => {
      const data = await request('/api/auth/login', { method: 'POST', body });
      // 登录后服务端轮换了会话与 CSRF，后续操作必须使用新令牌。
      csrfToken = data.csrfToken;
      showAccount(data.user);
      notice('account-notice', '');
      channel?.postMessage('account-changed');
    });
  });

  // 退出当前设备或所有设备，并切回登录界面。
  async function signOut(allDevices) {
    // logout 只退出当前会话，logout-all 撤销所有设备；二者都不注销账号。
    await request(allDevices ? '/api/auth/logout-all' : '/api/auth/logout', { method: 'POST' });
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
      const user = await request('/api/users/me', { method: 'PATCH', body: { displayName: name } });
      showAccount(user);
      notice('account-notice', '昵称已更新。');
    });
  });

  $('password-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const body = { currentPassword: $('current-password').value, newPassword: $('new-password').value };
    const confirmation = $('confirm-new-password').value;
    operation('password-error', async () => {
      validateNewPassword(body.newPassword, confirmation);
      await request('/api/users/me/password', { method: 'PUT', body });
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
    const body = { currentPassword: $('delete-password').value, confirmUsername: $('delete-username').value };
    operation('delete-error', async () => {
      if (body.confirmUsername.toLowerCase() !== currentUser.username.toLowerCase()) throw new Error('确认用户名与当前账号不一致。');
      await request('/api/users/me', { method: 'DELETE', body });
      showAuth('账号已注销。');
      await refreshCsrf();
      channel?.postMessage('account-changed');
    });
  });

  $('retry-connection').addEventListener('click', () => boot());
  $('header-account').addEventListener('click', () => selectPanel(activePanel === 'account' ? 'workbench' : 'account'));
  $('back-workbench').addEventListener('click', () => selectPanel('workbench'));

  function selectPanel(panel) {
    activePanel = panel;
    clearCloudSecrets();
    if (panel === 'account' && currentUser && cloudOwner !== currentUser.id) loadCloudCredentials();
    $('workbench-panel').hidden = panel !== 'workbench';
    $('account-panel').hidden = panel !== 'account';
    $('header-location').textContent = panel === 'workbench' ? '工作台' : '账户';
    $('header-account').setAttribute('aria-expanded', String(panel === 'account'));
    syncNavigation();
    if (panel !== 'workbench') document.querySelectorAll('#workbench-panel video, #workbench-panel audio').forEach(player => player.pause());
  }

  function selectAccountTab(tab) {
    for (const name of ['profile', 'security', 'cloud']) {
      const active = name === tab;
      $(`${name}-section`).hidden = !active;
      $(`account-${name}-tab`).setAttribute('aria-selected', String(active));
      $(`account-${name}-tab`).tabIndex = active ? 0 : -1;
    }
    $('account-danger-section').hidden = tab !== 'security';
  }
  for (const name of ['profile', 'security', 'cloud']) $(`account-${name}-tab`).addEventListener('click', () => selectAccountTab(name));
  document.querySelector('.account-nav').addEventListener('keydown', event => {
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
    $('upload-submit').disabled = busy || !currentUser || !capabilities?.mediaTool || !$('media-file').files.length;
    $('media-file').disabled = busy || !capabilities?.mediaTool;
    $('media-prev').disabled = busy || mediaPage <= 1;
    $('media-next').disabled = busy || mediaPage * 10 >= mediaTotal;
    $('retry-probe').disabled = busy || !capabilities?.mediaTool;
    if (selectedMedia?.status === 'READY' && compressionSourceId !== selectedMedia.id) {
      compressionSourceId = selectedMedia.id;
      $('compression-target').value = (selectedMedia.sizeBytes * .7 / 1024 / 1024).toFixed(3);
    }
    const target = Math.floor(Number($('compression-target').value) * 1024 * 1024);
    if (selectedMedia?.status === 'READY' && trimSourceId !== selectedMedia.id) {
      trimSourceId = selectedMedia.id;
      $('trim-start').value = '0'; $('trim-end').value = String(selectedMedia.metadata.durationMs / 1000);
      for (const id of ['trim-start', 'trim-end']) $(id).max = String(selectedMedia.metadata.durationMs / 1000);
    }
    for (const id of ['trim-start', 'trim-end']) {
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
    $('audio-missing').hidden = processingOperation !== 'extract_audio' || selectedMedia?.status !== 'READY' || selectedMedia.metadata?.hasAudio;
    $('conversion-source').textContent = selectedMedia?.status === 'READY' ? selectedMedia.originalFilename : '未选择就绪素材';
    $('cancel-task').disabled = busy || !taskActive(selectedTask) || selectedTask?.status === 'CANCELLING';
    $('delete-output').disabled = busy || !outputId;
    $('task-prev').disabled = busy || taskPage <= 1;
    $('task-next').disabled = busy || taskPage * 10 >= taskTotal;
    $('plan-prev').disabled = busy || planPage <= 1;
    $('plan-next').disabled = busy || planPage * 10 >= planTotal;
    document.querySelectorAll('[data-record-action]').forEach(button => { button.disabled = busy || button.dataset.active === 'true'; });
    syncExportControls(needsCompression);
    syncSubtitleControls();
    syncAIControls();
    syncFindControls();
    syncJoinControls();
    syncCloudControls();
    renderToolDependencies();
    syncWorkbenchPhase();
  }

  const cloudProviders = [
    { id: 'tencent', name: '腾讯云语音识别', fields: [['appId', 'AppId', false, 20], ['secretId', 'SecretId', true, 128], ['secretKey', 'SecretKey', true, 256]] },
    { id: 'aliyun', name: '阿里云百炼语音识别', fields: [['apiKey', 'API Key', true, 512], ['workspaceId', 'Workspace ID', false, 80]] },
    { id: 'deepseek', name: '文字 AI', fields: [['apiKey', 'DeepSeek API Key', true, 512], ['model', 'DeepSeek 模型', false, 80]] }
  ];
  function clearCloudSecrets() { $('cloud-providers').querySelectorAll('input[data-secret]').forEach((input) => { input.value = ''; }); }
  function clearCloud() {
    cloudRevision++; cloudEntries = null; cloudOwner = null; cloudLoading = false;
    $('cloud-providers').replaceChildren(); notice('cloud-state', ''); notice('cloud-error', '');
  }
  let userCapabilitiesRevision = 0;
  async function refreshUserCapabilities() {
    const owner = currentUser?.id, revision = workspaceRevision;
    if (!owner) return;
    const requestRevision = ++userCapabilitiesRevision;
    try {
      const item = await request('/api/system/capabilities');
      if (currentUser?.id !== owner || workspaceRevision !== revision || requestRevision !== userCapabilitiesRevision) return;
      capabilities = item; updateRegistrationControls(); syncMediaControls();
      const saved = cloudEntries?.find(entry => entry.provider === 'deepseek');
      if (saved?.mode === 'SERVER' && item.textAi?.source === 'SERVER') {
        Object.assign(saved, { available: item.textAi.available, unavailableReason: item.textAi.unavailableReason });
        const article = $('cloud-deepseek');
        if (article && !article.dataset.dirty) renderCloudStatus(article.querySelector('[role=status]'), saved);
      }
    } catch (error) { if (currentUser?.id === owner && error.status === 401) showAuth(); }
  }
  function syncCloudControls() {
    $('refresh-cloud').disabled = busy || cloudLoading || !currentUser;
    $('cloud-providers').querySelectorAll('input,select,button').forEach((element) => { element.disabled = busy || cloudLoading || !currentUser; });
  }
  function renderCloudStatus(element, saved) {
    const available = saved.available ?? saved.configured;
    element.textContent = saved.mode === 'OFF' ? '已停用' : saved.mode === 'SERVER'
      ? available ? '服务端模型已就绪' : saved.provider === 'deepseek' ? messages.LOCAL_AI_UNAVAILABLE : '服务端模型不支持语音识别，请配置我的凭据'
      : available ? '个人凭据已配置' : saved.unavailableReason || (saved.personalStored ? '个人凭据不可读取' : '个人凭据尚未配置');
    element.classList.toggle('error', saved.mode !== 'OFF' && !available);
  }
  function renderCloudProvider(provider) {
    const saved = cloudEntries?.find((item) => item.provider === provider.id); if (!saved) return;
    let article = $('cloud-' + provider.id);
    if (!article) { article = document.createElement('article'); article.id = 'cloud-' + provider.id; article.className = 'cloud-provider'; $('cloud-providers').append(article); }
    article.replaceChildren();
    delete article.dataset.dirty;
    const heading = document.createElement('div'); heading.className = 'section-heading';
    const title = document.createElement('h3'); title.textContent = provider.name;
    const state = document.createElement('span'); state.className = 'cloud-provider-status muted'; state.setAttribute('role', 'status');
    renderCloudStatus(state, saved);
    heading.append(title, state); article.append(heading);
    const form = document.createElement('form'); form.autocomplete = 'off';
    const source = document.createElement('label'); source.className = 'field'; source.textContent = '服务来源';
    const mode = document.createElement('select'); mode.setAttribute('aria-label', provider.name + '凭据来源');
    for (const [value, text] of [['PERSONAL', '我的凭据'], ['SERVER', provider.id === 'deepseek' ? '服务端部署 · 千问' : '服务端模型（不支持语音识别）'], ['OFF', '停用']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; mode.append(option);
    }
    mode.value = saved.mode; source.append(mode); form.append(source);
    const modelWarning = document.createElement('p'); modelWarning.className = 'model-warning';
    modelWarning.textContent = '服务端使用轻量模型，理解能力有限，复杂要求可能解析不准确。';
    modelWarning.hidden = provider.id !== 'deepseek' || mode.value !== 'SERVER'; form.append(modelWarning);
    const fields = document.createElement('div'); fields.hidden = mode.value !== 'PERSONAL';
    for (const [name, labelText, secret, max] of provider.fields) {
      const label = document.createElement('label'); label.className = 'field'; label.textContent = labelText;
      const input = document.createElement('input'); input.name = name; input.type = secret ? 'password' : 'text'; input.maxLength = max;
      input.autocomplete = secret ? 'new-password' : 'off'; input.spellcheck = false; input.setAttribute('aria-label', provider.name + ' ' + labelText);
      if (secret) { input.dataset.secret = 'true'; input.placeholder = saved.personalStored ? '已保存，留空保留' : labelText; }
      else input.value = name === 'model' && saved.mode !== 'PERSONAL' ? 'deepseek-flash' : saved[name] || (name === 'model' ? 'deepseek-flash' : '');
      input.addEventListener('input', () => { article.dataset.dirty = 'true'; state.textContent = '未保存'; state.classList.remove('error'); }); label.append(input); fields.append(label);
    }
    mode.addEventListener('change', () => { article.dataset.dirty = 'true'; fields.hidden = mode.value !== 'PERSONAL'; modelWarning.hidden = provider.id !== 'deepseek' || mode.value !== 'SERVER'; form.querySelectorAll('input[data-secret]').forEach((input) => { input.value = ''; }); state.textContent = '未保存'; state.classList.remove('error'); });
    form.append(fields);
    const actions = document.createElement('div'); actions.className = 'cloud-provider-actions';
    const save = document.createElement('button'); save.type = 'button'; save.className = 'button primary'; save.title = '保存配置'; save.setAttribute('aria-label', '保存' + provider.name + '配置'); save.innerHTML = '<i data-lucide="save" aria-hidden="true"></i><span>保存</span>'; actions.append(save);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'icon-button danger-outline'; remove.title = '删除个人凭据并停用'; remove.setAttribute('aria-label', '删除' + provider.name + '个人凭据'); remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>'; remove.hidden = !saved.personalStored; actions.append(remove);
    form.append(actions); article.append(form);
    const write = (method, body) => {
      const owner = currentUser?.id, revision = cloudRevision;
      operation('cloud-error', async () => {
        const result = await request('/api/users/me/cloud-credentials/' + provider.id, { method, body });
        if (currentUser?.id !== owner || cloudRevision !== revision) return;
        cloudEntries = cloudEntries.map((item) => item.provider === provider.id ? result : item);
        renderCloudProvider(provider); syncCloudControls(); icons(); await refreshUserCapabilities();
      });
    };
    // 凭据只在激活保存按钮时提交，输入框回车产生的隐式submit不得写入。
    form.addEventListener('submit', (event) => event.preventDefault());
    save.addEventListener('click', () => {
      if (busy || cloudLoading || !form.reportValidity()) return;
      const body = { expectedVersion: saved.version, mode: mode.value };
      if (mode.value === 'PERSONAL') {
        for (const input of fields.querySelectorAll('input')) if (!input.dataset.secret || input.value) body[input.name] = input.value;
        if (!window.confirm('将个人凭据加密保存在此服务器，并使用你对应服务商的额度。保存？')) return;
      } else if (saved.personalStored && !window.confirm('这会删除此供应商的个人凭据，并切换凭据来源。继续？')) return;
      write('PUT', body);
    });
    remove.addEventListener('click', () => {
      if (busy || !window.confirm('删除此供应商的个人凭据并停用？不会自动切换到服务端模型或其他服务。')) return;
      write('DELETE', { expectedVersion: saved.version });
    });
  }
  async function loadCloudCredentials() {
    const owner = currentUser?.id, revision = ++cloudRevision; if (!owner) return;
    clearCloudSecrets(); cloudLoading = true; syncCloudControls(); notice('cloud-error', ''); notice('cloud-state', '正在读取配置…');
    try {
      const items = await request('/api/users/me/cloud-credentials');
      if (currentUser?.id !== owner || cloudRevision !== revision) return;
      cloudEntries = items; cloudOwner = owner; cloudProviders.forEach(renderCloudProvider); icons(); notice('cloud-state', '');
      await refreshUserCapabilities();
    } catch (error) {
      if (currentUser?.id !== owner || cloudRevision !== revision) return;
      if (error.status === 401) showAuth(); else notice('cloud-error', error.message, true);
    } finally { if (cloudRevision === revision) { cloudLoading = false; syncCloudControls(); } }
  }
  $('refresh-cloud').addEventListener('click', loadCloudCredentials);

  function resetWorkbench() {
    planListRevision++; taskListRevision++; planPage = 1; planTotal = 0; expandedRecords.clear(); recordInstructions.clear();
    $('plan-list').replaceChildren(); notice('plan-list-error', ''); selectAccountTab('profile');
    toolPhases.clear(); activePhase = 'import'; activeTool = 'detect';
    clearExport();
    workspaceRevision++;
    clearAIPlan();
    clearFind();
    clearJoin();
    clearSubtitle();
    deletingMedia = null; $('delete-media-dialog').close();
    deletingOutput = null; $('delete-output-dialog').close();
    clearTimeout(probeTimer); probeTimer = null;
    mediaPage = 1; mediaTotal = 0; selectedMedia = null;
    clearSourcePreview();
    $('media-list').replaceChildren();
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
    clearTimeout(taskTimer); taskTimer = null;
    selectedTask = null; pendingPlan = null; outputId = null; taskPage = 1; taskTotal = 0; compressionSourceId = null;
    $('compression-target').value = ''; trimSourceId = null; $('trim-start').value = ''; $('trim-end').value = '';
    $('task-list').replaceChildren();
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
    clearTimeout(probeTimer); probeTimer = null; selectedMedia = null;
    clearSourcePreview();
    $('media-result').hidden = true; $('media-result-empty').hidden = false; $('media-status').hidden = true;
    compressionSourceId = null; $('compression-target').value = '';
    trimSourceId = null; $('trim-start').value = ''; $('trim-end').value = '';
    syncMediaControls();
  }

  function clearTaskResult() {
    selectedTask = null; outputId = null;
    $('conversion-result').hidden = true;
    for (const id of ['output-preview', 'output-audio']) {
      $(id).pause(); $(id).removeAttribute('src'); $(id).load(); $(id).hidden = true;
    }
    $('download-output').hidden = true; $('download-output').removeAttribute('href');
    $('delete-output').hidden = true; $('output-empty').hidden = true;
    syncMediaControls();
  }

  function forgetMedia(id) {
    // 作废删除前已发出的轮询响应，不能让迟到的结果重新填回界面。
    workspaceRevision++;
    if (selectedMedia?.id === id) clearMediaResult();
    if (selectedTask?.mediaId === id) clearTaskResult();
    if (pendingPlan?.mediaId === id) pendingPlan = null;
  }

  function sizeText(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }

  function statusText(status) { return ({ PROBING: '检测中', READY: '已就绪', FAILED: '检测失败' })[status] || status; }

  function clearSourcePreview() {
    const player = $('source-preview');
    player.pause(); player.removeAttribute('src'); player.load(); player.hidden = true;
    $('retry-source-preview').hidden = true;
    notice('source-preview-status', '');
  }

  function displaySourcePreview(item) {
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

  function displayMedia(item) {
    if (selectedMedia && selectedMedia.id !== item.id && (subtitleDirty || joinDirty || exportDirty || workflowDirty) && !window.confirm('放弃未保存的修改并切换素材？')) return;
    if (selectedMedia && selectedMedia.id !== item.id) clearExport();
    clearTimeout(probeTimer); probeTimer = null;
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
        ['容器', m.container], ['视频编码', m.videoCodec], ['音轨', m.hasAudio ? m.audioCodec : '无音轨']);
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
          const updated = await request(`/api/media/${item.id}`);
          if (currentUser?.id !== owner || selectedMedia?.id !== item.id || workspaceRevision !== revision) return;
          displayMedia(updated);
          if (updated.status !== 'PROBING') await loadMedia();
        } catch (error) {
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
      const result = await request(`/api/media?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || mediaPage !== page) return;
      if (page > 1 && !result.items.length) { mediaPage = Math.max(1, Math.ceil(result.total / 10)); return loadMedia(); }
      notice('media-list-error', '');
      mediaTotal = result.total;
      $('media-list-empty').hidden = result.items.length > 0;
      $('media-total').textContent = `${result.total} 个素材`;
      $('media-page').textContent = String(mediaPage);
      $('media-list').replaceChildren(...result.items.map((item) => {
        const row = document.createElement('li'); row.className = 'media-row';
        const button = document.createElement('button'); button.type = 'button';
        const icon = document.createElement('i'); icon.setAttribute('data-lucide', 'file-video'); icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.className = 'file-name'; name.textContent = item.originalFilename;
        const size = document.createElement('span'); size.className = 'file-size'; size.textContent = sizeText(item.sizeBytes);
        const status = document.createElement('span'); status.className = 'media-status ' + (item.status === 'READY' ? 'ready' : item.status === 'FAILED' ? 'failed' : ''); status.textContent = statusText(item.status);
        button.append(icon, name, size, status); button.addEventListener('click', () => {
          displayMedia(item);
          if (selectedMedia?.id === item.id && item.status === 'READY') selectWorkbenchPhase('edit');
        });
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'icon-button media-remove';
        remove.title = '删除素材'; remove.setAttribute('aria-label', `删除素材 ${item.originalFilename}`); remove.disabled = busy;
        const trash = document.createElement('i'); trash.setAttribute('data-lucide', 'trash-2'); trash.setAttribute('aria-hidden', 'true');
        remove.append(trash); remove.addEventListener('click', () => {
          deletingMedia = { id: item.id, owner, revision: workspaceRevision };
          $('delete-media-name').textContent = item.originalFilename; notice('delete-media-error', '');
          $('delete-media-dialog').showModal(); $('cancel-delete-media').focus();
        });
        row.append(button, remove); return row;
      }));
      const selected = result.items.find((item) => item.id === selectedMedia?.id);
      if (selected) displayMedia(selected);
      else if (!selectedMedia && result.items.length) displayMedia(result.items[0]);
      else if (selectedMedia) {
        const id = selectedMedia.id;
        try {
          const updated = await request(`/api/media/${id}`);
          if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== id || mediaPage !== page) return;
          displayMedia(updated);
        } catch (error) {
          if (currentUser?.id !== owner || workspaceRevision !== revision) return;
          if (error.status !== 404) throw error;
          forgetMedia(id); await loadTasks();
        }
      }
      if (!capabilities?.mediaTool) notice('upload-error', '视频检测工具暂不可用。', true);
      syncMediaControls(); icons();
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || mediaPage !== page) return;
      if (error.status === 401) showAuth();
      else notice('media-list-error', error.message, true);
    }
  }

  $('media-file').addEventListener('change', () => {
    const file = $('media-file').files[0];
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

  $('upload-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const file = $('media-file').files[0];
    operation('upload-error', async () => {
      if (!file || !file.size) throw new Error('请选择非空的视频文件。');
      if (file.size > capabilities.maxUploadBytes) throw new Error(`文件不能超过${sizeText(capabilities.maxUploadBytes)}。`);
      const body = new FormData(); body.append('file', file);
      $('upload-state').textContent = '上传中…';
      try {
        const saved = await request('/api/media', { method: 'POST', body });
        $('upload-state').textContent = '上传完成';
        mediaPage = 1; displayMedia(saved); await loadMedia();
      } catch (error) {
        $('upload-state').textContent = ''; throw error;
      }
    });
  });
  $('retry-probe').addEventListener('click', () => operation('media-error', async () => {
    if (!selectedMedia) return;
    displayMedia(await request(`/api/media/${selectedMedia.id}/probe`, { method: 'POST' }));
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
      await request(`/api/media/${item.id}`, { method: 'DELETE' });
      if (currentUser?.id !== item.owner) return;
      forgetMedia(item.id); closeMediaDelete();
      await loadMedia(); await loadTasks();
      notice('account-notice', '素材及关联记录已删除，文件将在后台清理。');
      $('refresh-media').focus();
    });
  });
  $('media-prev').addEventListener('click', () => { if (mediaPage > 1) { mediaPage--; loadMedia(); } });
  $('media-next').addEventListener('click', () => { if (mediaPage * 10 < mediaTotal) { mediaPage++; loadMedia(); } });

  function selectTool(tool, revealGroup = true) {
    const previousTool = activeTool;
    toolPhases.set(previousTool, activePhase);
    activeTool = tool;
    const group = $(`${tool}-tool`).closest('[data-tool-group]');
    if (revealGroup && group?.dataset.collapsed === 'true') setToolGroupExpanded(group.dataset.toolGroup, true);
    for (const item of document.querySelectorAll('[data-tool-group]')) item.dataset.active = String(item === group);
    $('workspace-tool-title').textContent = toolNames[tool];
    $('detect-editor').hidden = tool !== 'detect';
    const processing = ['convert', 'compress', 'audio', 'trim', 'mute'].includes(tool);
    processingOperation = tool === 'mute' ? 'mute' : tool === 'trim' ? 'trim' : tool === 'audio' ? 'extract_audio' : tool === 'compress' ? 'compress' : 'transcode';
    for (const [id, active] of [['detect-tool', tool === 'detect'], ['convert-tool', tool === 'convert'], ['compress-tool', tool === 'compress'], ['audio-tool', tool === 'audio'], ['trim-tool', tool === 'trim'], ['mute-tool', tool === 'mute'], ['subtitle-tool', tool === 'subtitle'], ['ai-tool', tool === 'ai'], ['find-tool', tool === 'find'], ['join-tool', tool === 'join']]) {
      $(id).classList.toggle('active', active);
      if (active) $(id).setAttribute('aria-current', 'page'); else $(id).removeAttribute('aria-current');
    }
    $('history-tool').classList.toggle('active', tool === 'history');
    if (tool === 'history') $('history-tool').setAttribute('aria-current', 'page'); else $('history-tool').removeAttribute('aria-current');
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
    if (tool !== 'history') selectWorkbenchPhase(toolPhases.get(tool) || (tool === 'detect' ? 'import' : 'edit'), false);
    else {
      for (const phase of phaseOrder) $(`phase-${phase}`).hidden = true;
      document.querySelectorAll('#tool-stage video, #tool-stage audio').forEach(player => player.pause());
    }
    updateToolIndicator();
    if (previousTool !== tool) {
      toolAnimation?.cancel();
      if (!reducedMotion.matches && !$('workbench-panel').hidden && currentUser) {
        const direction = toolOrder.indexOf(tool) > toolOrder.indexOf(previousTool) ? 1 : -1;
        toolAnimation = $('tool-stage').animate([
          { opacity: .45, transform: `translateY(${direction * 18}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 220, easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    }
    if (tool === 'history' && !$('history-plans-panel').hidden) loadPlans();
    if (navigationOpen && (!navigationPreference.pinned || narrowNavigation.matches)) setNavigationOpen(false);
  }

  const toolOrder = ['detect', 'convert', 'compress', 'audio', 'trim', 'join', 'mute', 'subtitle', 'ai', 'find', 'history'];
  const toolNames = { detect: '视频检测', convert: '视频转换', compress: '视频压缩', audio: '提取音频', trim: '视频裁切', join: '片段拼接', mute: '视频静音', subtitle: '字幕处理', ai: 'AI 处理', find: '找片段', history: '处理记录' };

  function syncWorkbenchPhase() {
    const ready = selectedMedia?.status === 'READY';
    $('continue-editing').disabled = busy || !ready;
    $('workspace-file-state').textContent = selectedMedia ? selectedMedia.originalFilename : '未选择素材';
    $('workspace-file-state').title = selectedMedia?.originalFilename || '';
    $('editor-filename').textContent = selectedMedia?.originalFilename || '未选择素材';
    const metadata = selectedMedia?.metadata;
    $('editor-file-info').textContent = metadata ? `${(metadata.durationMs / 1000).toFixed(2)} 秒 · ${metadata.width} × ${metadata.height} · ${sizeText(selectedMedia.sizeBytes)}` : selectedMedia ? statusText(selectedMedia.status) : '等待导入';
    $('editor-preview-empty').hidden = !!$('source-preview').getAttribute('src');
    $('editor-metadata').replaceChildren(...(selectedMedia ? [...$('media-metadata').children].map(row => row.cloneNode(true)) : []));
    const resultVisible = !!selectedTask && selectedTask.kind !== 'TRANSCRIPTION' && !$('conversion-result').hidden;
    $('export-result-empty').hidden = resultVisible;
    const srtReady = activeTool === 'subtitle' && !!subtitle && !subtitleDirty && !$('download-srt').hidden;
    $('export-srt').hidden = !srtReady;
    if (srtReady) { $('export-srt').setAttribute('href', $('download-srt').getAttribute('href')); $('export-srt').setAttribute('download', 'subtitles.srt'); }
    else $('export-srt').removeAttribute('href');
    $('export-empty-title').textContent = srtReady ? '字幕已就绪' : '暂无导出结果';
    $('export-result-summary').textContent = srtReady ? `字幕 v${subtitle.version} · SRT` : selectedTask?.kind === 'TRANSCRIPTION' ? '字幕识别结果保存在编辑区' : '尚未生成文件';
  }
  function selectWorkbenchPhase(phase, animate = true) {
    if (!phaseOrder.includes(phase)) return;
    const previous = activePhase;
    activePhase = phase; toolPhases.set(activeTool, phase);
    for (const name of phaseOrder) {
      const active = name === phase;
      $(`phase-${name}`).hidden = !active;
      $(`phase-${name}-tab`).setAttribute('aria-selected', String(active));
      $(`phase-${name}-tab`).tabIndex = active ? 0 : -1;
    }
    $('workspace-phases').style.setProperty('--phase-index', String(phaseOrder.indexOf(phase)));
    $('tool-stage').dataset.phase = phase;
    for (const id of ['source-preview', 'selected-preview', 'output-preview', 'output-audio', 'find-preview', 'join-preview']) {
      if (!$(id).closest(`#phase-${phase}`)) $(id).pause();
    }
    phaseAnimation?.cancel();
    if (animate && previous !== phase && !reducedMotion.matches) {
      const direction = phaseOrder.indexOf(phase) > phaseOrder.indexOf(previous) ? 1 : -1;
      phaseAnimation = $(`phase-${phase}`).animate([
        { opacity: .35, transform: `translateX(${direction * 12}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 200, easing: 'cubic-bezier(.2,.7,.3,1)' });
    }
    syncWorkbenchPhase();
  }
  function revealTask(task) {
    displayTask(task);
    selectWorkbenchPhase(task.kind === 'TRANSCRIPTION' ? 'edit' : 'export');
  }

  function rememberNavigation() {
    try { localStorage.setItem('amw-navigation', JSON.stringify(navigationPreference)); } catch { /* 导航偏好不影响业务。 */ }
  }
  function syncNavigation() {
    const visible = navigationOpen && !!currentUser && activePanel === 'workbench';
    const drawer = !navigationPreference.pinned || narrowNavigation.matches;
    $('workbench-layout').dataset.navOpen = String(visible);
    $('workbench-layout').dataset.navPinned = String(navigationPreference.pinned);
    $('tool-sidebar').inert = !visible;
    $('tool-content').inert = visible && drawer;
    $('tool-sidebar').setAttribute('role', visible && drawer ? 'dialog' : 'complementary');
    if (visible && drawer) $('tool-sidebar').setAttribute('aria-modal', 'true'); else $('tool-sidebar').removeAttribute('aria-modal');
    $('sidebar-backdrop').hidden = !visible || !drawer;
    document.body.classList.toggle('nav-drawer-open', visible && drawer);
    $('toggle-sidebar').setAttribute('aria-expanded', String(visible));
    $('toggle-sidebar').title = visible ? '收起功能栏' : '展开功能栏';
    $('toggle-sidebar').setAttribute('aria-label', $('toggle-sidebar').title);
    $('pin-sidebar').setAttribute('aria-pressed', String(navigationPreference.pinned));
    $('pin-sidebar').title = navigationPreference.pinned ? '取消固定功能栏' : '固定功能栏';
    $('pin-sidebar').setAttribute('aria-label', $('pin-sidebar').title);
    requestAnimationFrame(updateToolIndicator);
  }
  function setNavigationOpen(value, focus = true) {
    navigationOpen = value;
    if (!narrowNavigation.matches) { navigationPreference.open = value; rememberNavigation(); }
    syncNavigation();
    if (focus) {
      if (value && (!navigationPreference.pinned || narrowNavigation.matches)) requestAnimationFrame(() => {
        if (navigationOpen) {
          const button = $(`${activeTool}-tool`), group = button.closest('[data-tool-group]');
          (group?.dataset.collapsed === 'true' ? $(`${group.dataset.toolGroup}-group-toggle`) : button).focus({ preventScroll: true });
        }
      });
      else if (!value) $('toggle-sidebar').focus({ preventScroll: true });
    }
  }
  function updateToolIndicator() {
    const button = $(`${activeTool}-tool`);
    const navigation = $('tool-navigation'), indicator = $('tool-indicator');
    indicator.hidden = !button || !navigation.getClientRects().length || button.closest('[data-tool-group]')?.dataset.collapsed === 'true';
    if (indicator.hidden) return;
    const top = button.getBoundingClientRect().top - navigation.getBoundingClientRect().top + navigation.scrollTop;
    indicator.style.transform = `translateY(${top}px)`;
    $('tool-indicator').style.height = `${button.offsetHeight}px`;
  }
  function setToolGroupExpanded(name, expanded, remember = true) {
    const group = document.querySelector(`[data-tool-group="${name}"]`), body = $(`${name}-group-body`), toggle = $(`${name}-group-toggle`);
    if (!expanded && body.contains(document.activeElement)) toggle.focus({ preventScroll: true });
    group.dataset.collapsed = String(!expanded); body.inert = !expanded; toggle.setAttribute('aria-expanded', String(expanded));
    toolGroupPreferences[name] = expanded;
    if (remember) {
      try { localStorage.setItem('amw-tool-groups', JSON.stringify(toolGroupPreferences)); } catch { /* 存储受限时仍可切换分组。 */ }
    }
    updateToolIndicator();
  }
  const toolGroupObserver = new ResizeObserver(updateToolIndicator);
  for (const name of Object.keys(toolGroupPreferences)) {
    setToolGroupExpanded(name, toolGroupPreferences[name], false);
    $(`${name}-group-toggle`).addEventListener('click', () => setToolGroupExpanded(name, !toolGroupPreferences[name]));
    toolGroupObserver.observe(document.querySelector(`[data-tool-group="${name}"]`));
  }
  $('toggle-sidebar').addEventListener('click', () => setNavigationOpen(!navigationOpen));
  $('close-sidebar').addEventListener('click', () => setNavigationOpen(false));
  $('sidebar-backdrop').addEventListener('click', () => setNavigationOpen(false));
  $('pin-sidebar').addEventListener('click', () => {
    navigationPreference.pinned = !navigationPreference.pinned;
    navigationPreference.open = true; navigationOpen = true; rememberNavigation(); syncNavigation();
  });
  narrowNavigation.addEventListener('change', () => {
    navigationOpen = !narrowNavigation.matches && navigationPreference.open;
    syncNavigation();
    if (document.activeElement?.closest('#tool-sidebar') && !navigationOpen) $('toggle-sidebar').focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (event) => {
    if (!navigationOpen || !currentUser || activePanel !== 'workbench' || navigationPreference.pinned && !narrowNavigation.matches) return;
    if (event.key === 'Escape') { event.preventDefault(); setNavigationOpen(false); }
    if (event.key === 'Tab') {
      const controls = [...$('tool-sidebar').querySelectorAll('button:not(:disabled)')].filter((button) => button.getClientRects().length && !button.closest('[inert]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  window.addEventListener('resize', updateToolIndicator);
  for (const tool of toolOrder) {
    const button = $(`${tool}-tool`), name = document.createElement('span'), badge = document.createElement('small');
    name.className = 'tool-name'; name.textContent = toolNames[tool];
    for (const child of [...button.childNodes]) if (child.nodeType === Node.TEXT_NODE) child.remove();
    const kind = ['subtitle', 'ai'].includes(tool) ? 'mixed' : tool === 'find' ? 'cloud' : 'local';
    badge.className = 'tool-dependency'; badge.dataset.kind = kind; badge.textContent = { local: '站点', cloud: 'API', mixed: '混合' }[kind]; badge.setAttribute('aria-hidden', 'true');
    button.append(name, badge); button.setAttribute('aria-label', toolNames[tool]);
    button.title = toolNames[tool] + ' · ' + (tool === 'ai' ? '文字输入：所选模型 / 分步填写：站点处理' : { local: '站点处理，无需第三方 API', cloud: 'DeepSeek 文本 API', mixed: '语音识别 API / 所选文字模型' }[kind]);
  }

  function renderToolDependencies() {
    const c = capabilities || {}, subtitleTool = activeTool === 'subtitle', cloudTool = ['ai', 'find'].includes(activeTool);
    const provider = $('asr-provider').value, providers = c.asrProviders || [];
    const localAi = c.textAi?.source === 'SERVER';
    $('ai-model-warning').hidden = !localAi || workflowMode;
    const textService = localAi ? '服务端部署 · 千问 ' + (c.textAi.model || 'Qwen3.5-4B') : 'DeepSeek · 文本对话 API';
    const unavailable = c.textAi?.available === true ? '处理工具暂不可用' : localAi ? messages.LOCAL_AI_UNAVAILABLE : c.textAi?.unavailableReason || '未配置';
    const signature = JSON.stringify([activeTool, workflowMode, provider, c.mediaTool, c.supportedOperations, c.aiPlans, c.semanticSearch, c.clipRecommendations, c.subtitleCorrection, providers, c.textAi]);
    if (dependencySignature === signature) return;
    dependencySignature = signature;
    const kind = activeTool === 'ai' && workflowMode ? 'local' : subtitleTool ? 'mixed' : cloudTool ? localAi ? 'local' : 'cloud' : 'local';
    for (const tool of ['ai', 'find']) {
      const button = $(`${tool}-tool`), badge = button.querySelector('.tool-dependency');
      badge.dataset.kind = localAi ? 'local' : tool === 'ai' ? 'mixed' : 'cloud';
      badge.textContent = localAi ? '站点' : tool === 'ai' ? '混合' : 'API';
      button.title = toolNames[tool] + ' · ' + textService;
    }
    $('dependency-kind').dataset.kind = kind; $('dependency-kind').textContent = { local: localAi && cloudTool && !(activeTool === 'ai' && workflowMode) ? '服务端部署' : '服务端处理', cloud: '云端 API', mixed: '站点 + API' }[kind];
    const textTool = cloudTool && !(activeTool === 'ai' && workflowMode);
    $('dependency-summary').textContent = textTool ? c.textAi?.available === false ? unavailable : textService : subtitleTool ? '语音识别 API / 文字模型' : '站点处理 · 无第三方 AI 调用';
    $('dependency-summary').classList.toggle('unavailable', !!(textTool && c.textAi?.available === false));
    $('dependency-title').textContent = toolNames[activeTool];
    $('dependency-settings').hidden = kind === 'local' && !(cloudTool && !(activeTool === 'ai' && workflowMode));
    const rows = [];
    let detail = '';
    if (subtitleTool) {
      rows.push(['语音转字幕', provider === 'aliyun' ? '阿里云百炼 · Paraformer 语音识别 API' : '腾讯云 · 录音极速版语音识别 API', providers.includes(provider) ? '已配置' : '未配置或工具未就绪', providers.includes(provider)]);
      rows.push(['文字校对', textService, c.subtitleCorrection ? localAi ? '已就绪' : '已配置' : unavailable, !!c.subtitleCorrection]);
      rows.push(['编辑 / SRT', '本站后端 · 无第三方 API', '站点处理', true]);
      rows.push(['已有字幕烧录', '服务端 FFmpeg / libass', c.supportedOperations?.includes('burn_subtitles') ? '工具已就绪' : '工具未就绪', !!c.supportedOperations?.includes('burn_subtitles')]);
      detail = localAi ? '语音识别向选定供应商发送音轨；文字校对使用站点服务端部署的千问，不需要用户自行部署模型。' : '识别向选定供应商发送音轨，校对只发送选中句子的文字；第三方调用可能计费。';
    } else if (cloudTool) {
      if (activeTool === 'ai') {
        if (workflowMode) rows.push(['分步填写', '本站后端 · 无第三方 API', c.supportedOperations?.includes('workflow') ? '工具已就绪' : '工具未就绪', !!c.supportedOperations?.includes('workflow')]);
        else rows.push(['指令理解', textService, c.aiPlans ? localAi ? '已就绪' : '已配置' : unavailable, !!c.aiPlans]);
        rows.push(['确认后执行', '服务端 FFmpeg · 无第三方 API', '站点处理', true]);
        detail = workflowMode ? '参数由站点服务端处理，不调用第三方 AI。' : localAi ? '使用站点服务端部署的千问，仅向模型提供文字和素材参数，不向第三方模型服务上传视频。确认方案后才执行。' : '仅发送处理要求和素材参数，不上传原视频。第三方生成方案可能计费，确认后才由站点执行。';
      } else {
        rows.push(['内容检索', textService, c.semanticSearch ? localAi ? '已就绪' : '已配置' : unavailable, !!c.semanticSearch]);
        rows.push(['片段建议', textService, c.clipRecommendations ? localAi ? '已就绪' : '已配置' : unavailable, !!c.clipRecommendations]);
        detail = localAi ? '站点服务端部署的千问分析已保存字幕，不向第三方模型服务发送字幕或原视频。' : '向 DeepSeek 发送已保存字幕及查找要求，不发送原视频；第三方调用可能计费。';
      }
    } else {
      const operation = { convert: 'transcode', compress: 'compress', audio: 'extract_audio', trim: 'trim', join: 'join_clips', mute: 'mute' }[activeTool];
      const ready = activeTool === 'detect' ? c.mediaTool : c.supportedOperations?.includes(operation);
      rows.push(['处理引擎', activeTool === 'detect' ? '服务端 ffprobe' : '服务端 FFmpeg / ffprobe', ready ? '工具已就绪' : '工具未就绪', !!ready]);
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
  $('asr-provider').addEventListener('change', renderToolDependencies);
  $('dependency-settings').addEventListener('click', () => {
    setNavigationOpen(false, false); selectPanel('account'); selectAccountTab('cloud');
    $('cloud-section').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    $('refresh-cloud').focus({ preventScroll: true });
  });

  const exportCodecMatrix = { mp4: ['h264', 'hevc', 'av1'], mov: ['h264', 'hevc'], mkv: ['h264', 'hevc', 'vp9', 'av1'], webm: ['vp9', 'av1'] };
  function clearExport() {
    exportRevision++; exportPlan = null; exportDirty = false;
    $('export-format').value = 'mp4'; $('export-codec').value = 'h264'; $('export-audio-format').value = 'mp3';
    $('conversion-resolution').value = 'source';
    for (const id of ['export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract']) $(id).checked = false;
    notice('export-plan-state', '');
  }
  function syncExportControls(compressing) {
    const audio = processingOperation === 'extract_audio', combined = $('export-combine').checked && !audio;
    const enabled = capabilities?.supportedOperations?.includes('export');
    $('export-format-field').hidden = audio; $('export-codec-field').hidden = audio;
    $('export-audio-format-field').hidden = !audio; $('export-combine-field').hidden = audio;
    $('export-combination').hidden = !combined;
    $('export-custom-fields').hidden = audio || processingOperation === 'trim' && !combined || $('conversion-resolution').value !== 'custom';
    for (const id of ['export-format', 'export-audio-format']) {
      for (const option of $(id).options) option.disabled = !capabilities?.exportFormats?.includes(option.value);
      $(id).disabled = busy || !enabled;
    }
    const allowed = (exportCodecMatrix[$('export-format').value] || []).filter((codec) => capabilities?.exportVideoCodecs?.includes(codec) && (!compressing || ['h264', 'vp9'].includes(codec)));
    for (const option of $('export-codec').options) option.disabled = !allowed.includes(option.value);
    if (enabled && !allowed.includes($('export-codec').value)) $('export-codec').value = allowed[0] || '';
    $('export-codec').disabled = busy || !enabled;
    for (const id of ['export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract', 'export-width', 'export-height']) $(id).disabled = busy || !enabled;
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
  function exportParameters() {
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
      extractAudio: combined && $('export-extract').checked };
    if (p.targetSizeBytes !== null && (!Number.isSafeInteger(p.targetSizeBytes) || p.targetSizeBytes < 32768 || p.targetSizeBytes >= selectedMedia.sizeBytes)) throw new Error('目标体积需至少32 KB，并小于原文件。');
    if (resolution === 'custom' && (![p.width, p.height].every((n) => Number.isInteger(n) && n >= 2 && n <= 4096) || p.width * p.height > 8847360)) throw new Error('自定义尺寸需为2至4096的整数，总像素不超过8847360。');
    return p;
  }
  function usesExport() {
    return $('export-combine').checked || (processingOperation === 'extract_audio' ? $('export-audio-format').value !== 'mp3'
      : $('export-format').value !== 'mp4' || $('export-codec').value !== 'h264' || !['source', '720p'].includes($('conversion-resolution').value));
  }
  function sameParameters(a, b) { return Object.keys(b).every((key) => a?.[key] === b[key]); }
  async function saveExportPlan(parameters) {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = exportRevision, workspace = workspaceRevision;
    if (!owner || !mediaId) throw new Error('请先选择就绪素材。');
    const editable = exportPlan?.mediaId === mediaId && exportPlan.status === 'READY';
    const plan = await request(editable ? `/api/operation-plans/${exportPlan.id}` : '/api/operation-plans', {
      method: editable ? 'PATCH' : 'POST', body: editable ? { expectedVersion: exportPlan.version, parameters } : { mediaId, parameters } });
    if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || exportRevision !== revision || workspaceRevision !== workspace) return null;
    exportPlan = plan; exportDirty = false; notice('export-plan-state', `已保存 · v${plan.version}`); return plan;
  }
  $('save-export-plan').addEventListener('click', () => operation('conversion-error', async () => { await saveExportPlan(exportParameters()); }));
  $('restore-export-plan').addEventListener('click', () => operation('conversion-error', async () => {
    if (exportDirty && !window.confirm('放弃未保存的导出设置？')) return;
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = exportRevision, workspace = workspaceRevision;
    let found = null, page = 1;
    do {
      const result = await request(`/api/operation-plans?mediaId=${mediaId}&page=${page}&pageSize=50`);
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || exportRevision !== revision || workspaceRevision !== workspace) return;
      found = result.items.find((plan) => plan.parameters?.operation === 'export');
      if (found || page * 50 >= result.total) break;
      page++;
    } while (page <= 20);
    if (!found) { notice('export-plan-state', '暂无已保存的导出方案'); return; }
    restoreExportPlan(found);
  }));
  function restoreExportPlan(found) {
    const p = found.parameters; exportPlan = found; exportDirty = false;
    selectTool(['mp3', 'm4a', 'wav', 'flac'].includes(p.outputFormat) ? 'audio' : 'convert');
    if (p.videoCodec) { $('export-format').value = p.outputFormat; $('export-codec').value = p.videoCodec; }
    else $('export-audio-format').value = p.outputFormat;
    $('conversion-resolution').value = p.resolutionPreset || 'source';
    if (p.width) $('export-width').value = p.width; if (p.height) $('export-height').value = p.height;
    $('export-combine').checked = !!p.videoCodec; $('export-trim').checked = p.startMs !== null; $('export-compress').checked = p.targetSizeBytes !== null;
    $('export-mute').checked = p.audioMode === 'mute'; $('export-extract').checked = p.extractAudio;
    if (p.startMs !== null) { $('trim-start').value = p.startMs / 1000; $('trim-end').value = p.endMs / 1000; }
    if (p.targetSizeBytes !== null) $('compression-target').value = Number((p.targetSizeBytes / 1024 / 1024).toFixed(6));
    notice('export-plan-state', `已恢复 · v${found.version}`); syncMediaControls();
  }
  for (const id of ['export-format', 'export-codec', 'export-audio-format', 'export-combine', 'export-trim', 'export-compress', 'export-mute', 'export-extract', 'export-width', 'export-height', 'conversion-resolution', 'compression-target', 'trim-start', 'trim-end']) {
    $(id).addEventListener('input', () => { exportDirty = true; exportRevision++; notice('export-plan-state', '未保存'); syncMediaControls(); });
  }
  $('detect-tool').addEventListener('click', () => selectTool('detect'));
  $('convert-tool').addEventListener('click', () => {
    selectTool('convert');
    if (!capabilities?.supportedOperations?.includes('transcode')) notice('conversion-error', '视频转换工具暂不可用。', true);
  });
  $('compress-tool').addEventListener('click', () => {
    selectTool('compress');
    if (!capabilities?.supportedOperations?.includes('compress')) notice('conversion-error', '视频压缩工具暂不可用。', true);
  });
  $('compression-target').addEventListener('input', syncMediaControls);
  function trimRange() {
    const parse = (id) => {
      const seconds = Number($(id).value), milliseconds = Math.round(seconds * 1000);
      return $(id).value !== '' && Number.isSafeInteger(milliseconds) && Math.abs(seconds - milliseconds / 1000) < 1e-9 ? milliseconds : NaN;
    };
    const startMs = parse('trim-start'), endMs = parse('trim-end');
    return { startMs, endMs, valid: startMs >= 0 && endMs - startMs >= 500 && endMs <= (selectedMedia?.metadata?.durationMs || 0) };
  }
  for (const id of ['trim-start', 'trim-end']) $(id).addEventListener('input', syncMediaControls);
  $('trim-tool').addEventListener('click', () => {
    selectTool('trim');
    if (!capabilities?.supportedOperations?.includes('trim')) notice('conversion-error', '视频裁切工具暂不可用。', true);
  });
  $('audio-tool').addEventListener('click', () => {
    selectTool('audio');
    if (!capabilities?.supportedOperations?.includes('extract_audio')) notice('conversion-error', 'MP3编码工具暂不可用。', true);
  });
  $('mute-tool').addEventListener('click', () => {
    selectTool('mute');
    if (!capabilities?.supportedOperations?.includes('mute')) notice('conversion-error', '视频静音工具暂不可用。', true);
  });

  function clearJoinPreview() {
    joinPreviewRange = null; $('join-preview').pause(); $('join-preview').removeAttribute('src'); $('join-preview').onloadedmetadata = null;
    $('join-preview').load(); $('join-preview').hidden = true;
  }
  function clearJoin() {
    joinRevision++; joinRows = []; joinSourceId = null; joinLoading = false; joinDirty = false; pendingJoinPlan = null;
    $('join-clips').replaceChildren(); clearJoinPreview(); notice('join-error', '');
  }
  function joinRow(startMs, endMs) { return { id: crypto.randomUUID(), start: String(startMs / 1000), end: String(endMs / 1000) }; }
  function joinParameters() {
    const parse = (value) => /^\d+(?:\.\d{1,3})?$/.test(value) ? Math.round(Number(value) * 1000) : NaN;
    const clips = joinRows.map((row) => ({ startMs: parse(row.start), endMs: parse(row.end) }));
    const total = clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0);
    const valid = clips.length > 0 && clips.length <= 20 && Number.isSafeInteger(total) && total <= 900000
      && clips.every((clip) => Number.isSafeInteger(clip.startMs) && Number.isSafeInteger(clip.endMs) && clip.startMs >= 0
        && clip.endMs - clip.startMs >= 500 && clip.endMs <= (selectedMedia?.metadata?.durationMs || 0));
    return { clips, total, valid };
  }
  function syncJoinControls() {
    const ready = selectedMedia?.status === 'READY', data = joinParameters();
    $('join-source').textContent = ready ? selectedMedia.originalFilename : '未选择就绪素材';
    $('join-total').textContent = `${joinRows.length} 段 · ${Number.isFinite(data.total) ? (data.total / 1000).toFixed(3) : '--'} 秒`;
    $('join-range-error').hidden = !ready || !joinRows.length || data.valid;
    $('join-state').textContent = joinLoading ? '正在读取方案…' : !ready ? '未选择就绪素材'
      : !capabilities?.supportedOperations?.includes('join_clips') ? '片段拼接工具暂不可用。' : joinDirty ? '未导出' : '';
    $('export-join').disabled = busy || joinLoading || !ready || !data.valid || !capabilities?.supportedOperations?.includes('join_clips')
      || (taskActive(selectedTask) && selectedTask.mediaId === selectedMedia?.id);
    $('add-join-clip').disabled = busy || joinLoading || !ready || joinRows.length >= 20;
    $('refresh-join').disabled = busy || joinLoading || !ready;
    $('join-clips').querySelectorAll('input').forEach((input) => { input.disabled = busy || joinLoading; });
    $('join-clips').querySelectorAll('button').forEach((button) => { button.disabled = busy || joinLoading || button.dataset.unavailable === 'true'; });
  }
  function renderJoin() {
    $('join-clips').replaceChildren(...joinRows.map((row, index) => {
      const li = document.createElement('li'); li.className = 'join-row';
      const number = document.createElement('span'); number.textContent = String(index + 1); li.append(number);
      for (const [key, labelText] of [['start', '开始（秒）'], ['end', '结束（秒）']]) {
        const label = document.createElement('label'); label.className = 'field'; label.textContent = labelText;
        const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.step = '0.001'; input.required = true;
        input.setAttribute('aria-label', `片段${index + 1}${key === 'start' ? '开始' : '结束'}时间`); input.value = row[key];
        input.addEventListener('input', () => { row[key] = input.value; joinDirty = true; clearJoinPreview(); syncJoinControls(); });
        label.append(input); li.append(label);
      }
      const actions = document.createElement('div'); actions.className = 'join-row-actions';
      const button = (icon, title, unavailable, action) => {
        const item = document.createElement('button'); item.type = 'button'; item.className = 'icon-button'; item.title = title;
        item.setAttribute('aria-label', `${title} ${index + 1}`); item.dataset.unavailable = String(unavailable);
        const i = document.createElement('i'); i.dataset.lucide = icon; i.setAttribute('aria-hidden', 'true'); item.append(i); item.addEventListener('click', action); actions.append(item);
      };
      const change = (action) => { action(); joinDirty = true; clearJoinPreview(); renderJoin(); };
      button('arrow-up', '上移片段', index === 0, () => change(() => { [joinRows[index - 1], joinRows[index]] = [joinRows[index], joinRows[index - 1]]; }));
      button('arrow-down', '下移片段', index === joinRows.length - 1, () => change(() => { [joinRows[index], joinRows[index + 1]] = [joinRows[index + 1], joinRows[index]]; }));
      button('copy', '复制片段', joinRows.length >= 20, () => change(() => { joinRows.splice(index + 1, 0, { ...row, id: crypto.randomUUID() }); }));
      button('play', '预览片段', !selectedMedia?.previewUrl, () => {
        const clip = joinParameters().clips[index]; if (!Number.isSafeInteger(clip.startMs) || !Number.isSafeInteger(clip.endMs) || clip.endMs <= clip.startMs) return;
        joinPreviewRange = { start: clip.startMs / 1000, end: clip.endMs / 1000 }; const video = $('join-preview'); video.hidden = false;
        const play = () => { if (joinPreviewRange) { video.currentTime = joinPreviewRange.start; video.play().catch(() => notice('join-error', '片段暂时无法播放。', true)); } };
        if (video.getAttribute('src') !== selectedMedia.previewUrl) { video.onloadedmetadata = play; video.src = selectedMedia.previewUrl; video.load(); }
        else if (video.readyState >= 1) play(); else video.onloadedmetadata = play;
      });
      button('trash-2', '移除片段', joinRows.length <= 1, () => change(() => { joinRows.splice(index, 1); }));
      li.append(actions); return li;
    })); syncJoinControls(); icons();
  }
  async function loadJoinPlan() {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision, token = ++joinRevision;
    if (!owner || !mediaId || selectedMedia.status !== 'READY') return;
    joinSourceId = mediaId; joinLoading = true; pendingJoinPlan = null; joinDirty = false; clearJoinPreview();
    joinRows = [joinRow(0, selectedMedia.metadata.durationMs)]; renderJoin();
    try {
      const page = await request(`/api/operation-plans?mediaId=${mediaId}&page=1&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || joinRevision !== token) return;
      const plan = page.items.find((item) => item.parameters?.operation === 'join_clips');
      if (plan) { joinRows = plan.parameters.clips.map((clip) => joinRow(clip.startMs, clip.endMs)); pendingJoinPlan = plan.status === 'READY' ? plan : null; }
      notice('join-error', '');
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || joinRevision !== token) return;
      if (error.status === 401) showAuth(); else notice('join-error', error.message, true);
    } finally { if (joinRevision === token) { joinLoading = false; renderJoin(); } }
  }
  $('join-preview').addEventListener('timeupdate', () => { if (joinPreviewRange && $('join-preview').currentTime >= joinPreviewRange.end) $('join-preview').pause(); });
  $('join-preview').addEventListener('play', () => { const video = $('join-preview'); if (joinPreviewRange && (video.currentTime < joinPreviewRange.start || video.currentTime >= joinPreviewRange.end)) video.currentTime = joinPreviewRange.start; });
  $('join-tool').addEventListener('click', () => selectTool('join'));
  $('refresh-join').addEventListener('click', () => { if (!joinDirty || window.confirm('放弃未导出的修改并恢复最近方案？')) loadJoinPlan(); });
  $('add-join-clip').addEventListener('click', () => {
    if (busy || joinLoading || !selectedMedia || joinRows.length >= 20) return;
    joinRows.push(joinRow(0, Math.min(5000, selectedMedia.metadata.durationMs))); joinDirty = true; renderJoin();
  });
  $('join-form').addEventListener('submit', (event) => {
    event.preventDefault(); const data = joinParameters();
    if (busy || joinLoading || !data.valid || selectedMedia?.status !== 'READY') return;
    if (!window.confirm(`按当前顺序拼接${data.clips.length}段，共${(data.total / 1000).toFixed(3)}秒，生成 MP4？原素材保持不变。`)) return;
    const owner = currentUser?.id, mediaId = selectedMedia.id, revision = workspaceRevision;
    operation('join-error', async () => {
      const parameters = { operation: 'join_clips', outputFormat: 'mp4', clips: data.clips, audioMode: 'keep' };
      const current = () => currentUser?.id === owner && workspaceRevision === revision && selectedMedia?.id === mediaId;
      let plan = pendingJoinPlan?.mediaId === mediaId ? pendingJoinPlan : null;
      if (!plan) {
        plan = await request('/api/operation-plans', { method: 'POST', body: { mediaId, parameters } });
        if (!current()) return; pendingJoinPlan = plan;
      } else if (JSON.stringify(plan.parameters.clips) !== JSON.stringify(data.clips)) {
        plan = await request(`/api/operation-plans/${plan.id}`, { method: 'PATCH', body: { expectedVersion: plan.version, parameters } });
        if (!current()) return; pendingJoinPlan = plan;
      }
      const task = await request(`/api/operation-plans/${plan.id}/execute`, { method: 'POST', body: { expectedVersion: plan.version } });
      if (!current()) return;
      pendingJoinPlan = null; joinDirty = false; revealTask(task); taskPage = 1; await loadTasks();
    });
  });

  function clearFindResults() {
    findResult = null; findPreviewRange = null;
    $('find-results').replaceChildren(); notice('find-result-state', '');
    $('find-preview').pause(); $('find-preview').removeAttribute('src'); $('find-preview').load();
    $('find-preview').onloadedmetadata = null;
    $('find-preview-section').hidden = true; notice('find-preview-error', '');
  }
  function clearFind() {
    findRevision++; findMediaId = null; findTranscript = null; findLoading = false; findRunning = false;
    $('find-query').value = ''; clearFindResults(); notice('find-error', '');
  }
  function findMode() { return document.querySelector('input[name="find-mode"]:checked').value; }
  function syncFindControls() {
    const recommend = findMode() === 'recommend', ready = selectedMedia?.status === 'READY';
    const configured = recommend ? capabilities?.clipRecommendations : capabilities?.semanticSearch;
    const limit = Number($('find-limit').value), budget = Number($('find-budget').value);
    $('find-source').textContent = selectedMedia?.originalFilename || '未选择就绪素材';
    $('find-budget-field').hidden = !recommend; $('find-budget').required = recommend;
    $('find-budget').disabled = busy || findLoading || !recommend;
    $('find-limit').disabled = busy || findLoading;
    document.querySelectorAll('input[name="find-mode"]').forEach((input) => { input.disabled = busy || findLoading; });
    $('find-limit').max = recommend ? '10' : '20';
    $('find-query').disabled = busy || findLoading || !ready;
    $('refresh-find').disabled = busy || findLoading || !ready;
    $('find-submit').disabled = busy || findLoading || !ready || !findTranscript || !configured || !$('find-query').value.trim()
      || !Number.isInteger(limit) || limit < 1 || limit > (recommend ? 10 : 20)
      || (recommend && (!Number.isInteger(budget) || budget < 1 || budget > 900));
    $('find-submit-label').textContent = findRunning ? '分析中…' : recommend ? '生成建议' : '查找片段';
    $('find-state').textContent = findLoading ? '正在读取字幕…' : findRunning ? '正在分析字幕…' : !ready ? '未选择就绪素材'
      : !findTranscript ? '当前素材暂无字幕。' : !configured ? capabilities?.textAi?.source === 'SERVER' ? messages.LOCAL_AI_UNAVAILABLE : capabilities?.textAi?.unavailableReason || 'AI 服务尚未配置。' : `字幕 v${findTranscript.version}`;
    $('find-results').querySelectorAll('button').forEach((button) => { button.disabled = busy || button.dataset.unavailable === 'true'; });
  }
  async function loadFindTranscript() {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia.status !== 'READY') return;
    const token = ++findRevision; findMediaId = mediaId; findLoading = true; syncFindControls();
    try {
      const item = await request(`/api/media/${mediaId}/transcript`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || findRevision !== token) return;
      if (findTranscript?.id !== item.id || findTranscript?.version !== item.version) clearFindResults();
      findTranscript = { id: item.id, version: item.version }; notice('find-error', '');
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || findRevision !== token) return;
      if (error.status === 401) showAuth();
      else if (error.status === 404) { findTranscript = null; clearFindResults(); }
      else notice('find-error', error.message, true);
    } finally { if (findRevision === token) { findLoading = false; syncFindControls(); } }
  }
  function findTime(ms) { return `${(ms / 1000).toFixed(3)} 秒`; }
  function displayFindResults(result, recommend) {
    clearFindResults(); findResult = result;
    const items = recommend ? result.clips : result.matches;
    notice('find-result-state', items.length ? `${items.length} 个结果 · 字幕 v${result.transcriptVersion}` : result.message || '未找到相关片段。');
    $('find-results').replaceChildren(...items.map((item, index) => {
      const row = document.createElement('li'); row.className = 'find-result';
      const heading = document.createElement('div'); heading.className = 'find-result-heading';
      const title = document.createElement('h3'); title.textContent = recommend ? item.title : `片段 ${index + 1}`;
      const actions = document.createElement('div'); actions.className = 'find-result-actions';
      const preview = document.createElement('button'); preview.type = 'button'; preview.className = 'icon-button';
      preview.title = selectedMedia?.previewUrl ? '预览片段' : '当前原视频不支持直接预览'; preview.setAttribute('aria-label', `预览片段 ${index + 1}`);
      preview.dataset.unavailable = String(!selectedMedia?.previewUrl); preview.innerHTML = '<i data-lucide="play" aria-hidden="true"></i>';
      preview.addEventListener('click', () => previewFind(item));
      const trim = document.createElement('button'); trim.type = 'button'; trim.className = 'icon-button'; trim.title = '带入裁切';
      trim.setAttribute('aria-label', `裁切片段 ${index + 1}`); trim.dataset.unavailable = String(item.endMs - item.startMs < 500 || !capabilities?.supportedOperations?.includes('trim'));
      trim.innerHTML = '<i data-lucide="scissors" aria-hidden="true"></i>';
      const useRange = (join) => {
        const snapshot = findResult, owner = currentUser?.id, revision = workspaceRevision, token = findRevision;
        operation('find-error', async () => {
          const current = await request(`/api/media/${snapshot.mediaId}/transcript`);
          if (currentUser?.id !== owner || workspaceRevision !== revision || token !== findRevision || selectedMedia?.id !== snapshot.mediaId) return;
          if (current.id !== snapshot.transcriptId || current.version !== snapshot.transcriptVersion) {
            clearFindResults(); findTranscript = { id: current.id, version: current.version }; throw new ApiError('TRANSCRIPT_VERSION_CONFLICT', 409);
          }
          if (join) {
            if (joinSourceId !== snapshot.mediaId) await loadJoinPlan();
            if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== snapshot.mediaId || token !== findRevision) return;
            const replace = !joinDirty && !pendingJoinPlan && joinRows.length === 1 && joinRows[0].start === '0' && Number(joinRows[0].end) * 1000 === selectedMedia.metadata.durationMs;
            if (!replace && joinRows.length >= 20) throw new Error('最多添加20个片段。');
            if (replace) joinRows = [];
            joinRows.push(joinRow(item.startMs, item.endMs)); joinDirty = true; selectTool('join'); renderJoin(); $('join-section').scrollIntoView({ block: 'start' });
          } else {
            selectTool('trim'); trimSourceId = selectedMedia.id;
            $('trim-start').value = String(item.startMs / 1000); $('trim-end').value = String(item.endMs / 1000);
            syncMediaControls(); $('conversion-section').scrollIntoView({ block: 'start' });
          }
        });
      };
      trim.addEventListener('click', () => useRange(false));
      const join = document.createElement('button'); join.type = 'button'; join.className = 'icon-button'; join.title = '加入拼接';
      join.setAttribute('aria-label', `加入拼接 ${index + 1}`); join.dataset.unavailable = String(item.endMs - item.startMs < 500 || !capabilities?.supportedOperations?.includes('join_clips'));
      join.innerHTML = '<i data-lucide="list-plus" aria-hidden="true"></i>'; join.addEventListener('click', () => useRange(true));
      actions.append(preview, trim, join); heading.append(title, actions);
      const range = document.createElement('p'); range.className = 'muted'; range.textContent = `${findTime(item.startMs)} 至 ${findTime(item.endMs)}`;
      row.append(heading, range);
      if (recommend) { const reason = document.createElement('p'); reason.textContent = item.reason; row.append(reason); }
      const details = document.createElement('details'); details.open = index === 0;
      const summary = document.createElement('summary'); summary.textContent = `原文 · ${item.evidence.length} 段`;
      const quote = document.createElement('blockquote'); quote.textContent = item.evidence.map((entry) => entry.text).join('\n');
      details.append(summary, quote); row.append(details); return row;
    }));
    syncFindControls(); icons();
  }
  function previewFind(item) {
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
  $('find-tool').addEventListener('click', () => selectTool('find'));
  $('refresh-find').addEventListener('click', loadFindTranscript);
  for (const id of ['find-query', 'find-limit', 'find-budget']) $(id).addEventListener('input', () => { findRevision++; clearFindResults(); syncFindControls(); });
  document.querySelectorAll('input[name="find-mode"]').forEach((input) => input.addEventListener('change', () => {
    findRevision++; clearFindResults(); $('find-limit').value = findMode() === 'recommend' ? '3' : '10'; syncFindControls();
  }));
  $('find-form').addEventListener('submit', (event) => {
    event.preventDefault(); if (busy || !findTranscript) return;
    if (capabilities?.textAi?.source !== 'SERVER' && !window.confirm('将向 DeepSeek 发送目标和当前已保存字幕，可能产生服务费用。继续？')) return;
    const owner = currentUser?.id, mediaId = selectedMedia.id, revision = workspaceRevision, token = ++findRevision;
    const snapshot = findTranscript, recommend = findMode() === 'recommend';
    operation('find-error', async () => {
      const query = $('find-query').value.trim(); if (!query || Array.from(query).length > 500) throw new Error('目标内容需要1至500个字符。');
      findRunning = true; clearFindResults(); syncFindControls();
      try {
        const body = { query, transcriptId: snapshot.id, transcriptVersion: snapshot.version, limit: Number($('find-limit').value) };
        if (recommend) body.maxTotalDurationMs = Number($('find-budget').value) * 1000;
        const result = await request(`/api/media/${mediaId}/${recommend ? 'clip-recommendations' : 'search'}`, { method: 'POST', body });
        if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || findRevision !== token) return;
        displayFindResults(result, recommend);
      } finally { findRunning = false; syncFindControls(); }
    });
  });

  function workflowChanged() {
    workflowDirty = true; aiPlanDirty = true; aiRevision++; $('ai-plan').hidden = true; syncAIControls();
  }
  function workflowDefault(operation) {
    const endMs = Math.min(5000, selectedMedia?.metadata?.durationMs || 5000);
    return operation === 'trim' ? { operation, startMs: 0, endMs } : operation === 'resize' ? { operation, resolutionPreset: '360p', width: null, height: null }
      : operation === 'join_clips' ? { operation, clips: [{ startMs: 0, endMs }] } : { operation: 'mute' };
  }
  function workflowIcon(icon, label, action, boundary = false) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-button';
    button.title = label; button.setAttribute('aria-label', label); button.dataset.boundary = String(boundary);
    const image = document.createElement('i'); image.dataset.lucide = icon; image.setAttribute('aria-hidden', 'true'); button.append(image);
    button.addEventListener('click', action); return button;
  }
  function workflowNumber(parent, label, value, change, minimum = 0, step = '0.001') {
    const field = document.createElement('label'); field.className = 'field'; field.append(document.createTextNode(label));
    const input = document.createElement('input'); input.type = 'number'; input.min = String(minimum); input.step = step; input.required = true;
    if (minimum === 2) input.max = '4096';
    input.value = value == null ? '' : String(value); input.addEventListener('input', () => { change(input.value === '' ? NaN : Number(input.value)); workflowChanged(); });
    field.append(input); parent.append(field);
  }
  function renderWorkflowSteps() {
    $('workflow-steps').replaceChildren(...workflowSteps.map((step, index) => {
      const row = document.createElement('li'); row.className = 'workflow-step';
      const head = document.createElement('div'); head.className = 'workflow-step-head';
      const number = document.createElement('span'); number.textContent = String(index + 1);
      const select = document.createElement('select'); select.setAttribute('aria-label', `步骤 ${index + 1} 操作`);
      for (const [value, label] of Object.entries({ trim: '保留区间', join_clips: '选段拼接', resize: '缩放', mute: '静音' })) {
        const option = document.createElement('option'); option.value = value; option.textContent = label; select.append(option);
      }
      select.value = step.operation;
      select.addEventListener('change', () => { workflowSteps[index] = workflowDefault(select.value); workflowChanged(); renderWorkflowSteps(); });
      const move = direction => { [workflowSteps[index], workflowSteps[index + direction]] = [workflowSteps[index + direction], workflowSteps[index]]; workflowChanged(); renderWorkflowSteps(); };
      head.append(number, select,
        workflowIcon('arrow-up', `上移步骤 ${index + 1}`, () => move(-1), index === 0),
        workflowIcon('arrow-down', `下移步骤 ${index + 1}`, () => move(1), index === workflowSteps.length - 1),
        workflowIcon('trash-2', `删除步骤 ${index + 1}`, () => { workflowSteps.splice(index, 1); workflowChanged(); renderWorkflowSteps(); }));
      row.append(head);
      if (step.operation === 'trim') {
        const fields = document.createElement('div'); fields.className = 'conversion-fields';
        workflowNumber(fields, '开始（上一步结果，秒）', step.startMs / 1000, value => { step.startMs = Math.round(value * 1000); });
        workflowNumber(fields, '结束（秒）', step.endMs / 1000, value => { step.endMs = Math.round(value * 1000); }); row.append(fields);
      } else if (step.operation === 'resize') {
        const label = document.createElement('label'); label.className = 'field'; label.append(document.createTextNode('分辨率'));
        const preset = document.createElement('select');
        for (const value of ['source', '360p', '480p', '720p', '1080p', '1440p', '2160p', 'custom']) {
          const option = document.createElement('option'); option.value = value; option.textContent = value === 'source' ? '当前分辨率' : value === 'custom' ? '自定义' : value; preset.append(option);
        }
        preset.value = step.resolutionPreset;
        preset.addEventListener('change', () => { step.resolutionPreset = preset.value; step.width = preset.value === 'custom' ? 1920 : null; step.height = preset.value === 'custom' ? 1080 : null; workflowChanged(); renderWorkflowSteps(); });
        label.append(preset); row.append(label);
        if (step.resolutionPreset === 'custom') {
          const fields = document.createElement('div'); fields.className = 'conversion-fields';
          workflowNumber(fields, '最大宽度', step.width, value => { step.width = value; }, 2, '1');
          workflowNumber(fields, '最大高度', step.height, value => { step.height = value; }, 2, '1'); row.append(fields);
        }
      } else if (step.operation === 'join_clips') {
        step.clips.forEach((clip, clipIndex) => {
          const fields = document.createElement('div'); fields.className = 'workflow-range';
          workflowNumber(fields, `片段 ${clipIndex + 1} 开始（秒）`, clip.startMs / 1000, value => { clip.startMs = Math.round(value * 1000); });
          workflowNumber(fields, '结束（秒）', clip.endMs / 1000, value => { clip.endMs = Math.round(value * 1000); });
          fields.append(workflowIcon('x', `删除步骤 ${index + 1} 的片段 ${clipIndex + 1}`, () => { step.clips.splice(clipIndex, 1); workflowChanged(); renderWorkflowSteps(); }, step.clips.length === 1)); row.append(fields);
        });
        row.append(workflowIcon('plus', `步骤 ${index + 1} 添加区间`, () => { step.clips.push({ startMs: 0, endMs: Math.min(5000, selectedMedia?.metadata?.durationMs || 5000) }); workflowChanged(); renderWorkflowSteps(); }, step.clips.length >= 20));
      }
      return row;
    }));
    icons(); syncAIControls();
  }
  function fillWorkflow(parameters) {
    workflowSteps = structuredClone(parameters.steps.slice(0, -1));
    const last = parameters.steps.at(-1);
    $('workflow-format').value = last.outputFormat; $('workflow-size').value = last.targetSizeBytes == null ? '' : last.targetSizeBytes / 1048576;
    $('workflow-audio').checked = !!last.extractAudio; if (last.videoCodec) $('workflow-codec').value = last.videoCodec;
    workflowDirty = false; renderWorkflowSteps();
  }
  function setWorkflowMode(manual) {
    workflowMode = manual; aiRevision++; aiLoading = false;
    $('ai-form').hidden = manual; $('workflow-form').hidden = !manual;
    $('workflow-text-mode').setAttribute('aria-pressed', String(!manual)); $('workflow-step-mode').setAttribute('aria-pressed', String(manual));
    renderToolDependencies(); syncAIControls();
  }
  $('workflow-text-mode').addEventListener('click', () => {
    if (workflowMode && (!workflowDirty || window.confirm('放弃未保存的步骤？'))) { workflowDirty = false; setWorkflowMode(false); renderAIPlan(null); loadAIPlan(); }
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
  for (const id of ['workflow-format', 'workflow-codec', 'workflow-size', 'workflow-audio']) $(id).addEventListener('input', workflowChanged);
  $('workflow-form').addEventListener('submit', event => {
    event.preventDefault();
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision, token = aiRevision;
    if (busy || aiLoading || !mediaId) return;
    operation('workflow-error', async () => {
      let duration = selectedMedia.metadata.durationMs, muted = !selectedMedia.metadata.hasAudio;
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
      const editable = aiPlan?.parameters?.operation === 'workflow' && aiPlan.status === 'READY' && aiPlan.mediaId === mediaId;
      const plan = await request(editable ? `/api/operation-plans/${aiPlan.id}` : '/api/operation-plans', { method: editable ? 'PATCH' : 'POST',
        body: editable ? { expectedVersion: aiPlan.version, parameters } : { mediaId, parameters } });
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
    $('ai-source').textContent = ready ? selectedMedia.originalFilename : '未选择就绪素材';
    $('ai-instruction').disabled = busy || aiLoading || !ready;
    $('generate-ai-plan').disabled = busy || aiLoading || !ready || !capabilities?.aiPlans || !$('ai-instruction').value.trim();
    $('refresh-ai-plan').disabled = busy || aiLoading || !ready;
    $('execute-ai-plan').disabled = busy || aiLoading || aiPlanDirty || !ready || aiPlan?.mediaId !== selectedMedia?.id || aiPlan?.status !== 'READY';
    $('ai-state').textContent = aiGenerating ? '正在生成方案…' : aiLoading ? '正在读取方案…' : !capabilities?.aiPlans ? capabilities?.textAi?.available === true ? '当前处理工具暂不可用。' : capabilities?.textAi?.source === 'SERVER' ? messages.LOCAL_AI_UNAVAILABLE : capabilities?.textAi?.unavailableReason || 'AI 服务尚未配置。' : '';
    $('generate-ai-label').textContent = aiGenerating ? '生成中…' : '生成方案';
    $('ai-result-slot').hidden = !selectedTask || selectedTask.mediaId !== selectedMedia?.id || selectedTask.kind === 'TRANSCRIPTION';
    $('workflow-source').textContent = ready ? selectedMedia.originalFilename : '未选择就绪素材';
    const workflowUnavailable = busy || aiLoading || !ready || !capabilities?.supportedOperations?.includes('workflow');
    for (const element of $('workflow-form').querySelectorAll('input, select, button')) element.disabled = workflowUnavailable;
    $('workflow-add').disabled ||= workflowSteps.length >= 11;
    $('workflow-text-mode').disabled = busy || aiLoading; $('workflow-step-mode').disabled = busy || aiLoading;
    const format = $('workflow-format').value, audio = ['mp3', 'm4a', 'wav', 'flac'].includes(format);
    $('workflow-codec-field').hidden = audio; $('workflow-size-field').hidden = audio; $('workflow-audio-field').hidden = audio;
    for (const option of $('workflow-format').options) option.disabled = !capabilities?.exportFormats?.includes(option.value);
    const codecs = (exportCodecMatrix[format] || []).filter(codec => capabilities?.exportVideoCodecs?.includes(codec)
      && (!$('workflow-size').value || ['h264', 'vp9'].includes(codec)));
    for (const option of $('workflow-codec').options) option.disabled = !codecs.includes(option.value);
    if (!audio && codecs.length && !codecs.includes($('workflow-codec').value)) $('workflow-codec').value = codecs[0];
    $('workflow-audio').disabled ||= !selectedMedia?.metadata?.hasAudio;
    $('workflow-state').textContent = !capabilities?.supportedOperations?.includes('workflow') ? '顺序处理工具暂不可用。' : workflowDirty ? '未保存' : '';
    for (const button of $('workflow-steps').querySelectorAll('[data-boundary="true"]')) button.disabled = true;
  }
  function renderAIPlan(plan) {
    aiPlan = plan; aiPlanDirty = false; $('ai-plan').hidden = !plan;
    if (!plan) { syncAIControls(); return; }
    $('ai-plan-status').textContent = plan.status === 'NEEDS_INPUT' ? '待补充' : plan.status === 'EXECUTED' ? '已执行' : '待确认';
    $('ai-plan-status').className = 'media-status ' + (plan.status === 'READY' ? 'ready' : '');
    $('ai-plan-summary').textContent = plan.summary;
    const values = [], p = plan.parameters;
    if (p) {
      const rangeText = (start, end) => `${(start / 1000).toFixed(3)} 至 ${(end / 1000).toFixed(3)} 秒`;
      values.push(['操作', p.operation === 'export' ? '组合导出' : taskVerb(p.operation)], ['格式', p.outputFormat.toUpperCase()]);
      if (p.operation === 'join_clips') {
        p.clips.forEach((clip, index) => values.push([`第 ${index + 1} 段`, rangeText(clip.startMs, clip.endMs)]));
        values.push(['拼接总时长', (p.clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0) / 1000).toFixed(3) + ' 秒'], ['分辨率', '原分辨率']);
      }
      if (p.operation === 'workflow') p.steps.forEach((step, index) => {
        let detail = step.operation === 'trim' ? '保留 ' + rangeText(step.startMs, step.endMs)
          : step.operation === 'join_clips' ? '选段拼接：' + step.clips.map(clip => rangeText(clip.startMs, clip.endMs)).join(' → ')
          : step.operation === 'resize' ? '缩放 ' + (step.resolutionPreset === 'custom' ? `${step.width} x ${step.height} 最大边界` : step.resolutionPreset)
          : step.operation === 'mute' ? '静音' : `导出 ${step.outputFormat.toUpperCase()}${step.videoCodec ? ' / ' + step.videoCodec : ''}${step.targetSizeBytes ? ' / 最多 ' + sizeText(step.targetSizeBytes) : ''}${step.extractAudio ? ' / 另存完整原始音轨 MP3' : ''}`;
        values.push([`步骤 ${index + 1}`, detail]);
      });
      if (p.resolutionPreset) values.push(['分辨率', p.resolutionPreset === 'source' ? '原分辨率' : p.resolutionPreset === 'custom' ? `${p.width} x ${p.height} 最大边界` : p.resolutionPreset]);
      if (p.videoCodec) values.push(['视频编码', ({ h264: 'H.264', hevc: 'H.265 / HEVC', vp9: 'VP9', av1: 'AV1' })[p.videoCodec] || p.videoCodec]);
      if (p.targetSizeBytes != null) values.push(['目标体积', sizeText(p.targetSizeBytes)]);
      if (p.startMs != null && p.endMs != null) values.push(['保留区间', rangeText(p.startMs, p.endMs)]);
      values.push(['音轨', p.operation === 'mute' || p.audioMode === 'mute' || p.steps?.some(step => step.operation === 'mute') ? '全部移除' : p.operation === 'extract_audio' || ['mp3', 'm4a', 'wav', 'flac'].includes(p.outputFormat) ? '提取第一条音轨' : '保留']);
      if (p.extractAudio) values.push(['附加文件', '完整原始音轨 MP3（不受裁切影响）']);
    }
    $('ai-plan-parameters').replaceChildren(...values.map(([key, value]) => {
      const row = document.createElement('div'), label = document.createElement('dt'), detail = document.createElement('dd');
      label.textContent = key; detail.textContent = value; row.append(label, detail); return row;
    }));
    $('ai-plan-questions').replaceChildren(...plan.questions.map((question) => {
      const row = document.createElement('li'); row.textContent = question.message; return row;
    }));
    $('workflow-edit').hidden = p?.operation !== 'workflow' || workflowMode;
    syncAIControls();
  }
  async function loadAIPlan() {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia.status !== 'READY') return;
    const token = ++aiRevision; aiSourceId = mediaId; aiLoading = true; syncAIControls();
    try {
      const result = await request(`/api/operation-plans?mediaId=${mediaId}&page=1&pageSize=10`);
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision || aiRevision !== token) return;
      const plan = result.items.find((item) => workflowMode ? item.parameters?.operation === 'workflow' : item.instruction);
      if (workflowMode && plan) fillWorkflow(plan.parameters);
      $('ai-instruction').value = plan?.instruction || ''; renderAIPlan(plan || null); notice('ai-error', '');
      if (plan?.taskId) {
        const task = await request(`/api/tasks/${plan.taskId}`);
        if (currentUser?.id === owner && selectedMedia?.id === mediaId && workspaceRevision === revision && aiRevision === token) displayTask(task);
      }
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || aiRevision !== token) return;
      if (error.status === 401) showAuth(); else notice('ai-error', error.message, true);
    } finally { if (aiRevision === token) { aiLoading = false; syncAIControls(); } }
  }
  $('ai-tool').addEventListener('click', () => selectTool('ai'));
  $('refresh-ai-plan').addEventListener('click', () => {
    if (!(workflowMode ? workflowDirty : $('ai-instruction').value) || window.confirm('恢复最近保存的方案并放弃当前输入？')) { workflowDirty = false; loadAIPlan(); }
  });
  $('ai-instruction').addEventListener('input', () => { aiRevision++; aiPlanDirty = true; $('ai-plan').hidden = true; syncAIControls(); });
  $('ai-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const instruction = $('ai-instruction').value.trim(), owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!instruction || busy) return;
    if (capabilities?.textAi?.source !== 'SERVER' && !window.confirm('将向 DeepSeek 发送处理要求和视频参数，可能产生服务费用。继续？')) return;
    const token = ++aiRevision; aiSourceId = mediaId;
    operation('ai-error', async () => {
      if (Array.from(instruction).length > 2000) throw new Error('处理要求不能超过2000个字符。');
      aiGenerating = true; syncAIControls();
      try {
        const body = aiPlan && aiPlan.status !== 'EXECUTED' ? { expectedVersion: aiPlan.version, instruction } : { mediaId, instruction };
        const plan = await request(aiPlan && aiPlan.status !== 'EXECUTED' ? `/api/operation-plans/${aiPlan.id}` : '/api/operation-plans', {
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
      const task = await request(`/api/operation-plans/${plan.id}/execute`, { method: 'POST', body: { expectedVersion: plan.version } });
      if (currentUser?.id !== owner || workspaceRevision !== revision || aiRevision !== token || selectedMedia?.id !== plan.mediaId) return;
      renderAIPlan({ ...plan, status: 'EXECUTED', taskId: task.id }); revealTask(task); taskPage = 1; await loadTasks();
    });
  });

  function clearSubtitle() {
    subtitleRevision++; subtitle = null; subtitleMediaId = null; subtitleLatestVersion = 0;
    subtitleDirty = false; subtitleLoading = false; subtitleTaskLoaded = null;
    pendingSubtitlePlan = null; $('subtitle-result-slot').hidden = true;
    $('subtitle-editor').hidden = true; $('subtitle-segments').replaceChildren();
    $('download-srt').removeAttribute('href'); $('subtitle-original').checked = false;
    notice('subtitle-error', '');
  }

  function syncSubtitleControls() {
    const providers = capabilities?.asrProviders || [];
    for (const option of $('asr-provider').options) option.disabled = !providers.includes(option.value);
    if (!$('asr-provider').value || !providers.includes($('asr-provider').value)) $('asr-provider').value = providers[0] || '';
    const task = selectedTask?.kind === 'TRANSCRIPTION' && selectedTask.mediaId === selectedMedia?.id ? selectedTask : null;
    $('subtitle-source').textContent = selectedMedia?.originalFilename || '未选择就绪素材';
    $('asr-provider').disabled = busy || !providers.length;
    $('start-transcription').disabled = busy || subtitleLoading || selectedMedia?.status !== 'READY'
      || !selectedMedia?.metadata?.hasAudio || !providers.length || taskActive(task);
    $('transcription-label').textContent = subtitle ? '重新识别' : '识别字幕';
    $('cancel-transcription').hidden = !taskActive(task);
    $('cancel-transcription').disabled = busy || task?.status === 'CANCELLING';
    $('refresh-subtitle').disabled = busy || subtitleLoading || selectedMedia?.status !== 'READY';
    $('subtitle-state').textContent = subtitleLoading ? '正在读取字幕…'
      : taskActive(task) ? taskStatus(task.status, 'transcribe')
      : task?.error ? task.error.message
      : selectedMedia?.status === 'READY' && !selectedMedia.metadata.hasAudio ? '当前素材没有音轨。'
      : !providers.length ? '语音识别服务尚未配置。' : !subtitle ? '暂无字幕' : `${subtitle.segments.length} 段字幕`;
    $('save-subtitle').disabled = busy || !subtitleDirty || !subtitle || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked;
    $('subtitle-version').disabled = busy || subtitleDirty || !subtitle;
    $('subtitle-original').disabled = busy || subtitleDirty || !subtitle;
    $('subtitle-draft-state').textContent = subtitleDirty ? '有未保存的修改' : subtitle ? `已保存 · v${subtitle.version}` : '';
    const readOnly = !subtitle || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked;
    const burnTask = selectedTask?.mediaId === selectedMedia?.id && selectedTask?.parameters?.operation === 'burn_subtitles' ? selectedTask : null;
    $('subtitle-result-slot').hidden = !burnTask;
    $('burn-subtitle').disabled = busy || subtitleLoading || readOnly || subtitleDirty || selectedMedia?.status !== 'READY'
      || !capabilities?.supportedOperations?.includes('burn_subtitles') || taskActive(burnTask);
    $('burn-subtitle').title = !capabilities?.supportedOperations?.includes('burn_subtitles') ? '字幕烧录工具暂不可用' : subtitleDirty ? '请先保存字幕' : '生成字幕视频';
    $('subtitle-segments').querySelectorAll('input, textarea').forEach((element) => { element.disabled = busy || readOnly; });
    $('subtitle-segments').querySelectorAll('[data-correct]').forEach((element) => {
      element.disabled = busy || readOnly || subtitleDirty || !capabilities?.subtitleCorrection;
    });
    $('download-srt').hidden = !subtitle || subtitleDirty;
    if (subtitle) $('download-srt').href = `/api/transcripts/${subtitle.id}/srt?version=${$('subtitle-original').checked ? 1 : subtitle.version}`;
  }

  async function loadSubtitle(version) {
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    if (!owner || !mediaId || selectedMedia.status !== 'READY') return;
    const token = ++subtitleRevision;
    subtitleMediaId = mediaId; subtitleLoading = true; syncSubtitleControls();
    try {
      const result = await request(version && subtitle ? `/api/transcripts/${subtitle.id}?version=${version}` : `/api/media/${mediaId}/transcript`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== mediaId || subtitleRevision !== token) return;
      if (!version) subtitleLatestVersion = result.version;
      subtitle = result; subtitleDirty = false; $('subtitle-original').checked = false;
      $('subtitle-version').replaceChildren(...Array.from({ length: subtitleLatestVersion }, (_, index) => {
        const option = document.createElement('option'); option.value = String(index + 1); option.textContent = `v${index + 1}`; return option;
      }));
      $('subtitle-version').value = String(result.version); renderSubtitle(); notice('subtitle-error', '');
    } catch (error) {
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
    if (!subtitle) return;
    const segments = $('subtitle-original').checked ? subtitle.originalSegments : subtitle.segments;
    $('subtitle-segments').replaceChildren(...segments.map((segment, index) => {
      const row = document.createElement('li'); row.className = 'subtitle-segment'; row.dataset.segmentId = segment.id;
      const number = document.createElement('span'); number.textContent = String(index + 1); row.append(number);
      for (const [key, title] of [['startMs', '开始（秒）'], ['endMs', '结束（秒）'], ['text', '字幕']]) {
        const label = document.createElement('label'); label.textContent = title;
        const input = document.createElement(key === 'text' ? 'textarea' : 'input'); input.dataset.field = key;
        input.setAttribute('aria-label', `第${index + 1}段${title}`);
        if (key !== 'text') { input.type = 'number'; input.min = '0'; input.step = '0.001'; input.max = String(selectedMedia.metadata.durationMs / 1000); }
        else { input.rows = 2; input.maxLength = 4000; }
        input.value = key === 'text' ? segment.text : String(segment[key] / 1000);
        input.addEventListener('input', () => { subtitleDirty = true; syncSubtitleControls(); });
        label.append(input); row.append(label);
      }
      const correct = document.createElement('button'); correct.type = 'button'; correct.className = 'icon-button'; correct.dataset.correct = segment.id;
      correct.title = capabilities?.textAi?.source === 'SERVER' ? '服务端千问校对' : 'DeepSeek 校对'; correct.setAttribute('aria-label', `校对第${index + 1}段`);
      correct.innerHTML = '<i data-lucide="wand-sparkles" aria-hidden="true"></i>';
      correct.addEventListener('click', () => {
        if (capabilities?.textAi?.source !== 'SERVER' && !window.confirm('将向 DeepSeek 发送这段字幕进行校对，可能产生服务费用。继续？')) return;
        const item = subtitle, token = subtitleRevision, owner = currentUser?.id;
        operation('subtitle-error', async () => {
          const suggestion = await request(`/api/transcripts/${item.id}/corrections`, {
            method: 'POST', body: { expectedVersion: item.version, segmentId: segment.id }
          });
          if (currentUser?.id !== owner || subtitleRevision !== token || subtitle !== item) return;
          row.querySelector('.subtitle-suggestion')?.remove();
          const area = document.createElement('div'); area.className = 'subtitle-suggestion';
          const text = document.createElement('p'); text.textContent = suggestion.correctedText;
          const accept = document.createElement('button'); accept.type = 'button'; accept.className = 'button secondary compact';
          accept.innerHTML = '<i data-lucide="check" aria-hidden="true"></i>采用建议';
          accept.addEventListener('click', () => {
            if (busy || subtitle !== item || subtitleRevision !== token) return;
            row.querySelector('textarea').value = suggestion.correctedText; subtitleDirty = true; area.remove(); syncSubtitleControls();
          });
          area.append(text, accept); row.append(area); icons();
        });
      });
      row.append(correct); return row;
    }));
    syncSubtitleControls(); icons();
  }

  $('burn-subtitle').addEventListener('click', () => {
    if (busy || !subtitle || subtitleDirty || subtitleLoading || subtitle.version !== subtitleLatestVersion || $('subtitle-original').checked) return;
    const item = subtitle, owner = currentUser?.id, revision = workspaceRevision;
    if (!window.confirm(`使用已保存的字幕 v${item.version} 生成带字幕的 MP4？原视频保持不变。`)) return;
    operation('subtitle-error', async () => {
      const parameters = { operation: 'burn_subtitles', outputFormat: 'mp4', transcriptId: item.id, transcriptVersion: item.version, resolutionPreset: 'source', audioMode: 'keep' };
      if (!pendingSubtitlePlan || pendingSubtitlePlan.mediaId !== item.mediaId || pendingSubtitlePlan.parameters.transcriptId !== item.id
          || pendingSubtitlePlan.parameters.transcriptVersion !== item.version) {
        pendingSubtitlePlan = await request('/api/operation-plans', { method: 'POST', body: { mediaId: item.mediaId, parameters } });
      }
      const task = await request(`/api/operation-plans/${pendingSubtitlePlan.id}/execute`, { method: 'POST', body: { expectedVersion: pendingSubtitlePlan.version } });
      if (currentUser?.id !== owner || workspaceRevision !== revision || selectedMedia?.id !== item.mediaId) return;
      pendingSubtitlePlan = null; revealTask(task); taskPage = 1; await loadTasks();
    });
  });
  $('subtitle-tool').addEventListener('click', () => selectTool('subtitle'));
  $('refresh-subtitle').addEventListener('click', () => {
    if (!subtitleDirty || window.confirm('放弃未保存的字幕修改并刷新？')) loadSubtitle();
  });
  $('subtitle-version').addEventListener('change', () => loadSubtitle(Number($('subtitle-version').value)));
  $('subtitle-original').addEventListener('change', renderSubtitle);
  $('start-transcription').addEventListener('click', () => {
    const vendor = $('asr-provider').value === 'aliyun' ? '阿里云百炼' : '腾讯云';
    if (!window.confirm(`将向${vendor}发送当前素材的音轨，可能产生服务费用。${subtitle ? '重新识别会创建新字幕，原有版本仍保留。' : ''}继续？`)) return;
    const owner = currentUser?.id, mediaId = selectedMedia?.id, revision = workspaceRevision;
    operation('subtitle-error', async () => {
      const task = await request(`/api/media/${mediaId}/transcriptions`, {
        method: 'POST', body: { language: 'zh-CN', force: !!subtitle, provider: $('asr-provider').value }
      });
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
      displayTask(task); taskPage = 1; await loadTasks();
    });
  });
  $('cancel-transcription').addEventListener('click', () => operation('subtitle-error', async () => {
    if (selectedTask?.kind !== 'TRANSCRIPTION' || selectedTask.mediaId !== selectedMedia?.id) return;
    displayTask(await request(`/api/tasks/${selectedTask.id}/cancel`, { method: 'POST' })); await loadTasks();
  }));
  $('save-subtitle').addEventListener('click', () => {
    const item = subtitle, token = subtitleRevision, owner = currentUser?.id;
    operation('subtitle-error', async () => {
      const segments = [...$('subtitle-segments').children].map((row) => {
        const milliseconds = (field) => {
          const raw = row.querySelector(`[data-field="${field}"]`).value, seconds = Number(raw), ms = Math.round(seconds * 1000);
          if (raw === '' || !Number.isSafeInteger(ms) || Math.abs(seconds - ms / 1000) > 1e-9) throw new Error('时间最多保留三位小数。');
          return ms;
        };
        return { id: row.dataset.segmentId, startMs: milliseconds('startMs'), endMs: milliseconds('endMs'), text: row.querySelector('textarea').value };
      });
      const result = await request(`/api/transcripts/${item.id}`, { method: 'PATCH', body: { expectedVersion: item.version, segments } });
      if (currentUser?.id !== owner || subtitleRevision !== token || subtitle !== item) return;
      subtitleDirty = false; await loadSubtitle();
      notice('subtitle-error', '');
    });
  });
  window.addEventListener('beforeunload', (event) => { if (subtitleDirty || joinDirty || exportDirty || workflowDirty) { event.preventDefault(); event.returnValue = ''; } });

  function taskActive(task) { return task && ['QUEUED', 'RUNNING', 'CANCELLING'].includes(task.status); }
  function taskStatus(status, operation) {
    const verb = taskVerb(operation);
    return ({ QUEUED: '排队中', RUNNING: verb + '中', CANCELLING: '取消中', CANCELLED: '已取消', SUCCEEDED: '已完成', FAILED: verb + '失败' })[status] || status;
  }
  function taskVerb(operation) { return operation === 'workflow' ? '顺序处理' : operation === 'export' ? '导出' : operation === 'join_clips' ? '拼接' : operation === 'burn_subtitles' ? '字幕烧录' : operation === 'transcribe' ? '识别' : operation === 'mute' ? '静音' : operation === 'trim' ? '裁切' : operation === 'extract_audio' ? '提取' : operation === 'compress' ? '压缩' : '转换'; }
  function taskFormat(parameters) {
    if (parameters?.operation === 'workflow') return `${parameters.outputFormat.toUpperCase()} · ${parameters.steps.length} 步`;
    if (parameters?.operation === 'export') return `${parameters.outputFormat.toUpperCase()}${parameters.videoCodec ? ' · ' + parameters.videoCodec : ''}${parameters.startMs !== null ? ' · 裁切' : ''}${parameters.targetSizeBytes !== null ? ' · 压缩' : ''}${parameters.audioMode === 'mute' ? ' · 静音' : ''}`;
    if (parameters?.operation === 'join_clips') return `MP4 · ${parameters.clips.length}段 · ${(parameters.clips.reduce((sum, clip) => sum + clip.endMs - clip.startMs, 0) / 1000).toFixed(3)} 秒`;
    if (parameters?.operation === 'burn_subtitles') return `MP4 · 字幕 v${parameters.transcriptVersion}`;
    if (parameters?.operation === 'trim') return `MP4 · ${(parameters.startMs / 1000).toFixed(3)}-${(parameters.endMs / 1000).toFixed(3)} 秒`;
    return parameters?.operation === 'extract_audio' ? 'MP3' : `MP4 · ${parameters?.resolutionPreset === '720p' ? '720p' : '原分辨率'}`;
  }
  function displayTask(task, preferredOutputId = outputId) {
    selectedTask = task;
    if (task.kind === 'TRANSCRIPTION') {
      $('conversion-result').hidden = true;
      if (task.mediaId === selectedMedia?.id && task.status === 'SUCCEEDED' && task.transcript
          && subtitleTaskLoaded !== task.id && !subtitleDirty && !subtitleLoading) {
        subtitleTaskLoaded = task.id; loadSubtitle();
      }
      syncMediaControls(); return;
    }
    $('conversion-result').hidden = false;
    $('task-status').textContent = taskStatus(task.status, task.parameters?.operation);
    $('task-status').className = 'media-status ' + (task.status === 'SUCCEEDED' ? 'ready' : task.status === 'FAILED' ? 'failed' : '');
    const stage = ({ WAITING: '等待处理', TRANSCODING: '正在' + taskVerb(task.parameters?.operation), VERIFYING: '正在校验文件', DONE: task.outputs.length ? '文件已就绪' : '无可用结果', CANCELLED: '任务已取消', FAILED: '任务未完成' })[task.stage] || task.stage;
    $('task-stage').textContent = `${task.id.slice(0, 8)} · ${taskFormat(task.parameters)} · ${stage}`;
    notice('task-error', task.error?.message || '', true);
    $('cancel-task').hidden = !taskActive(task);
    const result = task.status === 'SUCCEEDED' ? task.outputs.find((item) => item.id === preferredOutputId) || task.outputs[0] : null;
    $('output-selector-field').hidden = task.outputs.length < 2;
    $('output-selector').replaceChildren(...task.outputs.map((item) => { const option = document.createElement('option'); option.value = item.id; option.textContent = item.filename; return option; }));
    if (result) $('output-selector').value = result.id;
    $('output-empty').hidden = task.status !== 'SUCCEEDED' || !!result;
    const audioResult = result?.contentType?.startsWith('audio/');
    $('compression-stats').hidden = !result || task.parameters?.operation !== 'compress';
    $('compression-stats').textContent = result && task.parameters?.operation === 'compress'
      ? `目标 ${sizeText(task.parameters.targetSizeBytes)} · 实际 ${sizeText(result.sizeBytes)}` : '';
    if (outputId !== (result?.id || null)) {
      $('output-preview').pause();
      $('output-audio').pause();
      $('output-preview').removeAttribute('src'); $('output-preview').load();
      $('output-audio').removeAttribute('src'); $('output-audio').load();
      if (result?.previewUrl) $(audioResult ? 'output-audio' : 'output-preview').src = result.previewUrl;
      outputId = result?.id || null;
    }
    $('output-preview').hidden = !result?.previewUrl || audioResult;
    $('output-audio').hidden = !result?.previewUrl || !audioResult;
    notice('output-preview-status', result && !result.previewUrl ? '当前格式请下载后播放。' : '');
    $('audio-stats').hidden = !audioResult;
    $('audio-stats').textContent = audioResult ? `${(result.metadata.durationMs / 1000).toFixed(2)} 秒 · ${sizeText(result.sizeBytes)}` : '';
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
  for (const id of ['output-preview', 'output-audio']) $(id).addEventListener('error', () => {
    if (outputId && $(id).error) notice('output-preview-status', '浏览器无法播放此编码，请下载后播放。');
  });

  function disclosureIcon() {
    const icon = document.createElement('i'); icon.setAttribute('data-lucide', 'chevron-down');
    icon.className = 'disclosure-chevron'; icon.setAttribute('aria-hidden', 'true'); return icon;
  }
  function recordAction(label, icon, action) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-button';
    button.title = label; button.setAttribute('aria-label', label); button.dataset.recordAction = 'true';
    const glyph = document.createElement('i'); glyph.setAttribute('data-lucide', icon); glyph.setAttribute('aria-hidden', 'true');
    button.append(glyph); button.addEventListener('click', action); return button;
  }
  function recordDetails(key, title, parameters, instruction, error) {
    const details = document.createElement('details'); details.className = 'record-details'; details.open = expandedRecords.has(key);
    const summary = document.createElement('summary'), name = document.createElement('span'); name.className = 'record-title'; name.textContent = title;
    summary.append(name, disclosureIcon()); details.append(summary);
    if (instruction) { const text = document.createElement('p'); text.className = 'record-instruction'; text.textContent = instruction; details.append(text); }
    const labels = { operation: '处理方式', outputFormat: '输出格式', videoCodec: '视频编码', resolutionPreset: '分辨率', width: '最大宽度', height: '最大高度', audioMode: '音轨',
      startMs: '开始（毫秒）', endMs: '结束（毫秒）', targetSizeBytes: '目标体积（字节）', extractAudio: '另存音轨', clips: '拼接区间', steps: '处理步骤', transcriptId: '字幕', transcriptVersion: '字幕版本', useOriginal: '保留原文' };
    const values = { source: '原分辨率', keep: '保留音轨', mute: '静音' };
    const list = document.createElement('dl'); list.className = 'record-parameters';
    for (const [key, value] of Object.entries(parameters || {})) {
      if (value === null) continue;
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = labels[key] || key;
      dd.textContent = key === 'operation' ? taskVerb(value) : typeof value === 'boolean' ? value ? '是' : '否'
        : typeof value === 'object' ? JSON.stringify(value, null, 2) : values[value] || String(value);
      row.append(dt, dd); list.append(row);
    }
    details.append(list);
    if (error) { const message = document.createElement('p'); message.className = 'form-error'; message.textContent = error; details.append(message); }
    details.addEventListener('toggle', () => { if (details.open) expandedRecords.add(key); else expandedRecords.delete(key); });
    return details;
  }
  function deleteRecord(kind, record) {
    if (busy || kind === 'task' && taskActive(record)) return;
    const text = kind === 'task' ? '删除这条处理记录？仅从记录列表移除，原素材和生成文件会保留。' : '删除这个保存的方案？已生成的任务和文件不受影响。';
    if (!window.confirm(text)) return;
    const owner = currentUser?.id, revision = workspaceRevision;
    operation(kind === 'task' ? 'task-list-error' : 'plan-list-error', async () => {
      await request(`/api/${kind === 'task' ? 'tasks' : 'operation-plans'}/${record.id}`, { method: 'DELETE' });
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
  async function restoreListedPlan(plan) {
    const dirty = exportDirty || aiPlanDirty || workflowDirty || joinDirty || subtitleDirty;
    if (busy || dirty && !window.confirm('恢复这个方案？当前未保存的编辑可能被替换。')) return;
    const owner = currentUser?.id, revision = workspaceRevision;
    operation('plan-list-error', async () => {
      const source = await request(`/api/media/${plan.mediaId}`);
      if (currentUser?.id !== owner || workspaceRevision !== revision) return;
      displayMedia(source); if (selectedMedia?.id !== source.id) return;
      const p = plan.parameters;
      if (p?.operation === 'export') restoreExportPlan(plan);
      else if (plan.instruction || p?.operation === 'workflow') {
        aiRevision++; aiLoading = false; aiSourceId = source.id;
        selectTool('ai'); setWorkflowMode(p?.operation === 'workflow');
        if (workflowMode) fillWorkflow(p); else $('ai-instruction').value = plan.instruction || '';
        renderAIPlan(plan);
      } else if (p?.operation === 'join_clips') {
        joinRevision++; joinLoading = false; joinSourceId = source.id; selectTool('join');
        joinRows = p.clips.map(clip => joinRow(clip.startMs, clip.endMs)); joinDirty = false; pendingJoinPlan = plan.status === 'READY' ? plan : null; renderJoin();
      } else if (p?.operation === 'burn_subtitles') {
        selectTool('subtitle');
      } else {
        const tool = { transcode: 'convert', compress: 'compress', extract_audio: 'audio', trim: 'trim', mute: 'mute' }[p?.operation];
        if (!tool) throw new Error('这个方案暂不支持恢复编辑。');
        clearExport(); selectTool(tool); $('conversion-resolution').value = p.resolutionPreset || 'source';
        if (p.startMs !== undefined) { $('trim-start').value = p.startMs / 1000; $('trim-end').value = p.endMs / 1000; }
        if (p.targetSizeBytes) $('compression-target').value = p.targetSizeBytes / 1024 / 1024;
        pendingPlan = plan.status === 'READY' ? plan : null;
      }
      selectWorkbenchPhase('edit'); syncMediaControls();
      if (plan.taskId) {
        const task = await request(`/api/tasks/${plan.taskId}`);
        if (currentUser?.id === owner && workspaceRevision === revision && selectedMedia?.id === source.id) displayTask(task);
      }
    });
  }
  async function loadPlans() {
    const owner = currentUser?.id, revision = workspaceRevision, page = planPage, token = ++planListRevision;
    if (!owner) return;
    try {
      const result = await request(`/api/operation-plans?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || workspaceRevision !== revision || token !== planListRevision || page !== planPage) return;
      if (page > 1 && !result.items.length) { planPage = Math.max(1, Math.ceil(result.total / 10)); return loadPlans(); }
      planTotal = result.total; $('plan-total').textContent = `${result.total} 个方案`; $('plan-page').textContent = String(page);
      $('plan-list-empty').hidden = !!result.items.length; notice('plan-list-error', '');
      $('plan-list').replaceChildren(...result.items.map(plan => {
        const row = document.createElement('li'); row.className = 'history-row';
        const state = plan.status === 'EXECUTED' ? '已执行' : plan.status === 'READY' ? '待执行' : '待完善';
        const details = recordDetails('plan:' + plan.id, plan.summary || '未完成方案', plan.parameters, plan.instruction);
        const subtitle = document.createElement('small'); subtitle.textContent = `${state} · v${plan.version} · ${plan.id.slice(0, 8)} · ${new Date(plan.createdAt).toLocaleString('zh-CN')}`;
        details.querySelector('.record-title').append(document.createElement('br'), subtitle);
        const restore = recordAction('恢复这个方案', 'rotate-ccw', () => restoreListedPlan(plan));
        if (plan.parameters?.operation === 'burn_subtitles') {
          restore.dataset.active = 'true'; restore.title = '字幕烧录方案请在字幕处理中重新确认字幕版本';
        }
        const remove = recordAction('删除保存的方案', 'trash-2', () => deleteRecord('plan', plan));
        row.append(details, restore, remove); return row;
      }));
      icons(); syncMediaControls();
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || token !== planListRevision) return;
      if (error.status === 401) showAuth(); else notice('plan-list-error', error.message, true);
    }
  }
  function selectHistoryTab(plans) {
    $('history-tasks-slot').hidden = plans; $('history-plans-panel').hidden = !plans;
    $('history-tasks-tab').setAttribute('aria-selected', String(!plans)); $('history-plans-tab').setAttribute('aria-selected', String(plans));
    $('history-tasks-tab').tabIndex = plans ? -1 : 0; $('history-plans-tab').tabIndex = plans ? 0 : -1;
    if (plans) loadPlans(); else loadTasks();
  }
  $('history-tool').addEventListener('click', () => selectTool('history'));
  $('history-tasks-tab').addEventListener('click', () => selectHistoryTab(false));
  $('history-plans-tab').addEventListener('click', () => selectHistoryTab(true));
  document.querySelector('.history-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const plans = event.key === 'End' || event.key !== 'Home' && $('history-plans-panel').hidden;
    selectHistoryTab(plans); $(plans ? 'history-plans-tab' : 'history-tasks-tab').focus();
  });
  $('refresh-plans').addEventListener('click', loadPlans);
  $('plan-prev').addEventListener('click', () => { if (planPage > 1) { planPage--; loadPlans(); } });
  $('plan-next').addEventListener('click', () => { if (planPage * 10 < planTotal) { planPage++; loadPlans(); } });

  async function loadTasks() {
    clearTimeout(taskTimer); taskTimer = null;
    const token = ++taskListRevision;
    const owner = currentUser?.id;
    const page = taskPage;
    const revision = workspaceRevision;
    if (!owner) return;
    try {
      const result = await request(`/api/tasks?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || taskPage !== page || workspaceRevision !== revision || taskListRevision !== token) return;
      if (page > 1 && !result.items.length) { taskPage = Math.max(1, Math.ceil(result.total / 10)); return loadTasks(); }
      notice('task-list-error', '');
      taskTotal = result.total;
      $('task-total').textContent = `${result.total} 个任务`; $('task-page').textContent = String(page);
      $('task-list-empty').hidden = result.items.length > 0;
      $('task-list').replaceChildren(...result.items.map((task) => {
        const row = document.createElement('li'); row.className = 'media-row task-row';
        const button = document.createElement('button'); button.type = 'button';
        const icon = document.createElement('i'); icon.setAttribute('data-lucide', task.parameters?.operation === 'extract_audio' || task.parameters?.operation === 'export' && !task.parameters.videoCodec ? 'file-audio' : 'file-video'); icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.className = 'file-name';
        const title = document.createElement('span'); title.textContent = task.kind === 'TRANSCRIPTION' ? '语音转字幕' : `${taskVerb(task.parameters?.operation)} ${taskFormat(task.parameters)}`;
        const time = document.createElement('small'); time.textContent = `${task.id.slice(0, 8)} · ${new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(task.createdAt))}`;
        name.append(title, time);
        const size = document.createElement('span'); size.className = 'file-size'; size.textContent = task.outputs[0] ? sizeText(task.outputs[0].sizeBytes) : '';
        const status = document.createElement('span'); status.className = 'media-status ' + (task.status === 'SUCCEEDED' ? 'ready' : task.status === 'FAILED' ? 'failed' : ''); status.textContent = taskStatus(task.status, task.kind === 'TRANSCRIPTION' ? 'transcribe' : task.parameters?.operation);
        button.append(icon, name, size, status); button.addEventListener('click', () => {
          if (task.mediaId) {
            operation('task-list-error', async () => {
              const source = await request(`/api/media/${task.mediaId}`);
              if (currentUser?.id !== owner || workspaceRevision !== revision) return;
              displayMedia(source);
              if (selectedMedia?.id !== source.id) return;
              if (task.parameters?.operation === 'workflow') {
                selectTool('ai'); setWorkflowMode(true); fillWorkflow(task.parameters);
                renderAIPlan({ id: task.planId, mediaId: task.mediaId, version: task.planVersion, status: 'EXECUTED', parameters: task.parameters,
                  summary: taskFormat(task.parameters), questions: [], warnings: [], taskId: task.id });
              } else if (task.parameters?.operation === 'join_clips') {
                selectTool('join'); joinRevision++; joinLoading = false; joinSourceId = task.mediaId;
                joinRows = task.parameters.clips.map((clip) => joinRow(clip.startMs, clip.endMs)); joinDirty = false; pendingJoinPlan = null; renderJoin();
              } else if (task.kind === 'TRANSCRIPTION' || task.parameters?.operation === 'burn_subtitles') selectTool('subtitle');
              else selectTool(task.parameters?.operation === 'export' && !task.parameters.videoCodec || task.parameters?.operation === 'extract_audio' ? 'audio'
                : ({ mute: 'mute', trim: 'trim', compress: 'compress' }[task.parameters?.operation] || 'convert'));
              revealTask(task);
            });
          } else { selectTool(task.parameters?.operation === 'mute' ? 'mute' : task.parameters?.operation === 'trim' ? 'trim' : task.parameters?.operation === 'extract_audio' ? 'audio' : task.parameters?.operation === 'compress' ? 'compress' : 'convert'); revealTask(task); }
        });
        const details = recordDetails('task:' + task.id, `${title.textContent} · ${status.textContent}`, task.parameters, null, task.error?.message);
        details.querySelector('summary').replaceChildren(icon, name, size, status, disclosureIcon());
        const instruction = document.createElement('p'); instruction.className = 'record-instruction';
        details.append(instruction);
        const loadInstruction = async () => {
          if (!task.planId || !details.open) return;
          const key = task.planId + ':' + task.planVersion;
          if (recordInstructions.has(key)) { instruction.textContent = recordInstructions.get(key); return; }
          instruction.textContent = '正在读取处理要求…';
          try {
            const plan = await request(`/api/operation-plans/${task.planId}`);
            if (currentUser?.id !== owner || workspaceRevision !== revision) return;
            const text = plan.instruction || plan.summary || '';
            recordInstructions.set(key, text); instruction.textContent = text;
          } catch (error) {
            if (currentUser?.id !== owner || workspaceRevision !== revision) return;
            instruction.textContent = error.status === 404 ? '原方案已删除，任务参数仍保留。' : '处理要求暂时无法读取。';
          }
        };
        details.addEventListener('toggle', loadInstruction);
        button.className = 'icon-button'; button.title = '打开处理结果'; button.setAttribute('aria-label', '打开处理结果');
        button.dataset.recordAction = 'open'; button.replaceChildren(); button.innerHTML = '<i data-lucide="arrow-up-right" aria-hidden="true"></i>';
        const remove = recordAction('删除处理记录', 'trash-2', () => deleteRecord('task', task));
        remove.dataset.active = String(taskActive(task)); remove.disabled = busy || taskActive(task);
        if (taskActive(task)) remove.title = '任务结束后可删除记录';
        row.className = 'history-row'; row.append(details, button, remove); return row;
      }));
      const chosen = result.items.find((task) => task.id === selectedTask?.id);
      if (chosen) displayTask(chosen);
      else if (!selectedTask && result.items.length) displayTask(result.items[0]);
      else if (selectedTask) {
        const id = selectedTask.id;
        let updated;
        try { updated = await request(`/api/tasks/${id}`); }
        catch (error) {
          if (currentUser?.id !== owner || workspaceRevision !== revision || taskListRevision !== token) return;
          if (error.status !== 404) throw error;
          clearTaskResult(); return;
        }
        if (currentUser?.id !== owner || selectedTask?.id !== id || taskPage !== page || workspaceRevision !== revision || taskListRevision !== token) return;
        displayTask(updated);
      }
      icons(); syncMediaControls();
      if (result.items.some(taskActive) || taskActive(selectedTask)) taskTimer = setTimeout(loadTasks, 2000);
    } catch (error) {
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
      let parameters = processingOperation === 'trim' ? { operation: 'trim', outputFormat: 'mp4', startMs: range.startMs, endMs: range.endMs, audioMode: 'keep' }
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
          : await request('/api/operation-plans', { method: 'POST', body: { mediaId, parameters } });
        if (!plan || currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
        pendingPlan = plan;
      }
      const task = await request(`/api/operation-plans/${pendingPlan.id}/execute`, { method: 'POST', body: { expectedVersion: pendingPlan.version } });
      if (currentUser?.id !== owner || selectedMedia?.id !== mediaId || workspaceRevision !== revision) return;
      if (exportPlan?.id === pendingPlan.id) exportPlan = { ...exportPlan, status: 'EXECUTED' };
      exportDirty = false;
      revealTask(task); pendingPlan = null; taskPage = 1; await loadTasks();
    });
  });
  $('cancel-task').addEventListener('click', () => operation('task-error', async () => {
    if (!selectedTask) return;
    displayTask(await request(`/api/tasks/${selectedTask.id}/cancel`, { method: 'POST' })); await loadTasks();
  }));
  function closeOutputDelete() { $('delete-output-dialog').close(); deletingOutput = null; }
  $('delete-output').addEventListener('click', () => {
    const result = selectedTask?.outputs.find((item) => item.id === outputId);
    if (busy || !result) return;
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
      await request(`/api/outputs/${item.id}`, { method: 'DELETE' });
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
  if (channel) channel.onmessage = () => { if (!busy) restoreSession(); };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !busy && capabilities) restoreSession();
  });

  // 加载系统能力和登录状态，完成页面初始化。
  async function boot() {
    showOnly('loading-view');
    setBusy(true);
    try {
      capabilities = await request('/api/system/capabilities');
      await restoreSession();
    } catch {
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
  for (const phase of phaseOrder) $(`phase-${phase}-tab`).addEventListener('click', () => selectWorkbenchPhase(phase));
  $('workspace-phases').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = phaseOrder.indexOf(activePhase);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    selectWorkbenchPhase(phaseOrder[next]); $(`phase-${phaseOrder[next]}-tab`).focus();
  });
  $('continue-editing').addEventListener('click', () => selectWorkbenchPhase('edit'));
  $('replace-source').addEventListener('click', () => selectWorkbenchPhase('import'));
  $('back-to-editing').addEventListener('click', () => selectWorkbenchPhase('edit'));
  document.querySelectorAll('[data-tool-target]').forEach(button => button.addEventListener('click', () => selectTool(button.dataset.toolTarget)));
  icons();
  // 只刷新状态，不自动重发模型请求；服务停止或恢复后可更新按钮和不可用提示。
  let refreshingCapabilities = false;
  setInterval(async () => {
    if (!currentUser || busy || document.hidden || refreshingCapabilities) return;
    refreshingCapabilities = true;
    try { await refreshUserCapabilities(); } finally { refreshingCapabilities = false; }
  }, 10000);
  boot();
})();
