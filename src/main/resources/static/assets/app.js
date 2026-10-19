(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  // 登录令牌不是 JWT：AMW_SESSION HttpOnly Cookie 携带服务端会话 ID，JS 不读取或写入 localStorage。
  let currentUser = null;
  let csrfToken = null;
  let capabilities = null;
  let busy = false;
  let registrationChallenge = null;
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
  let pendingPlan = null;
  let outputId = null;
  let processingOperation = 'transcode';
  let compressionSourceId = null;
  let deletingMedia = null;
  let workspaceRevision = 0;
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
    TRANSCODE_UNAVAILABLE: '视频转换工具暂不可用。',
    COMPRESSION_TARGET_UNREACHABLE: '目标体积无法达成，请增大目标或降低分辨率。',
    SOURCE_HAS_NO_AUDIO: '素材没有可提取的音轨。',
    AUDIO_EXTRACTION_UNAVAILABLE: 'MP3编码工具暂不可用。',
    AUDIO_EXTRACTION_FAILED: '提取音频失败，请检查素材后重试。',
    AI_UNAVAILABLE: '自然语言处理尚未开放。',
    QUEUE_FULL: '处理队列已满，请稍后重试。',
    PLAN_VERSION_CONFLICT: '转换参数已变化，请重新提交。',
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
        : (messages[code] || '请求未完成，请稍后重试。'));
      this.code = code;
      this.status = status;
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
    $('send-email-code').disabled = busy || !capabilities?.registration;
    $('register-submit').disabled = busy || !capabilities?.registration || !registrationChallenge;
    $('register-unavailable').hidden = !capabilities || capabilities.registration;
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
    if (first) { selectPanel('workbench'); loadMedia(); loadTasks(); }
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
      const challenge = await request('/api/auth/registration-email-code', { method: 'POST', body: { email } });
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
    $('workbench-panel').hidden = panel !== 'workbench';
    $('account-panel').hidden = panel !== 'account';
    $('header-location').textContent = panel === 'workbench' ? '工作台' : '账户';
    $('header-account').setAttribute('aria-expanded', String(panel === 'account'));
  }

  function syncMediaControls() {
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
    $('compression-target').disabled = busy || processingOperation !== 'compress';
    const invalidTarget = processingOperation === 'compress' && (!Number.isSafeInteger(target) || target < 32768 || target >= (selectedMedia?.sizeBytes || 0));
    $('start-conversion').disabled = busy || selectedMedia?.status !== 'READY' || invalidTarget
      || (processingOperation === 'extract_audio' && !selectedMedia.metadata?.hasAudio)
      || !capabilities?.supportedOperations?.includes(processingOperation)
      || (taskActive(selectedTask) && selectedTask.mediaId === selectedMedia?.id);
    $('compression-small').hidden = processingOperation !== 'compress' || selectedMedia?.status !== 'READY' || selectedMedia.sizeBytes > 32768;
    $('conversion-resolution').disabled = busy || processingOperation === 'extract_audio';
    $('audio-missing').hidden = processingOperation !== 'extract_audio' || selectedMedia?.status !== 'READY' || selectedMedia.metadata?.hasAudio;
    $('conversion-source').textContent = selectedMedia?.status === 'READY' ? selectedMedia.originalFilename : '未选择就绪素材';
    $('cancel-task').disabled = busy || !taskActive(selectedTask) || selectedTask?.status === 'CANCELLING';
    $('task-prev').disabled = busy || taskPage <= 1;
    $('task-next').disabled = busy || taskPage * 10 >= taskTotal;
  }

  function resetWorkbench() {
    workspaceRevision++;
    deletingMedia = null; $('delete-media-dialog').close();
    clearTimeout(probeTimer); probeTimer = null;
    mediaPage = 1; mediaTotal = 0; selectedMedia = null;
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
    $('compression-target').value = '';
    $('task-list').replaceChildren();
    $('conversion-result').hidden = true;
    $('output-preview').pause(); $('output-preview').removeAttribute('src'); $('output-preview').load();
    $('output-preview').hidden = true; $('download-output').hidden = true; $('download-output').removeAttribute('href');
    $('output-audio').pause(); $('output-audio').removeAttribute('src'); $('output-audio').load(); $('output-audio').hidden = true;
    selectTool('detect');
  }

  function clearMediaResult() {
    clearTimeout(probeTimer); probeTimer = null; selectedMedia = null;
    $('media-result').hidden = true; $('media-result-empty').hidden = false; $('media-status').hidden = true;
    compressionSourceId = null; $('compression-target').value = '';
    syncMediaControls();
  }

  function clearTaskResult() {
    selectedTask = null; outputId = null;
    $('conversion-result').hidden = true;
    for (const id of ['output-preview', 'output-audio']) {
      $(id).pause(); $(id).removeAttribute('src'); $(id).load(); $(id).hidden = true;
    }
    $('download-output').hidden = true; $('download-output').removeAttribute('href');
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

  function displayMedia(item) {
    clearTimeout(probeTimer); probeTimer = null;
    selectedMedia = item;
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
        button.append(icon, name, size, status); button.addEventListener('click', () => displayMedia(item));
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

  function selectTool(tool) {
    const processing = tool !== 'detect';
    processingOperation = tool === 'audio' ? 'extract_audio' : tool === 'compress' ? 'compress' : 'transcode';
    for (const [id, active] of [['detect-tool', !processing], ['convert-tool', tool === 'convert'], ['compress-tool', tool === 'compress'], ['audio-tool', tool === 'audio']]) {
      $(id).classList.toggle('active', active);
      if (active) $(id).setAttribute('aria-current', 'page'); else $(id).removeAttribute('aria-current');
    }
    $('conversion-section').hidden = !processing;
    $('task-section').hidden = !processing;
    $('compression-target-field').hidden = processingOperation !== 'compress';
    $('compression-target').required = processingOperation === 'compress';
    $('compression-target').disabled = processingOperation !== 'compress';
    $('conversion-title').textContent = tool === 'audio' ? '提取音频' : tool === 'compress' ? '视频压缩' : '视频转换';
    $('start-processing-label').textContent = tool === 'audio' ? '开始提取' : tool === 'compress' ? '开始压缩' : '开始转换';
    $('resolution-field').hidden = tool === 'audio';
    $('processing-fields').classList.toggle('audio', tool === 'audio');
    $('processing-format').textContent = tool === 'audio' ? 'MP3 · 192 kbps' : 'MP4 · H.264';
    $('processing-audio-mode').textContent = tool === 'audio' ? '第一条音轨' : '保留音轨';
    notice('conversion-error', '');
    syncMediaControls();
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
  $('audio-tool').addEventListener('click', () => {
    selectTool('audio');
    if (!capabilities?.supportedOperations?.includes('extract_audio')) notice('conversion-error', 'MP3编码工具暂不可用。', true);
  });

  function taskActive(task) { return task && ['QUEUED', 'RUNNING', 'CANCELLING'].includes(task.status); }
  function taskStatus(status, operation) {
    const verb = taskVerb(operation);
    return ({ QUEUED: '排队中', RUNNING: verb + '中', CANCELLING: '取消中', CANCELLED: '已取消', SUCCEEDED: '已完成', FAILED: verb + '失败' })[status] || status;
  }
  function taskVerb(operation) { return operation === 'extract_audio' ? '提取' : operation === 'compress' ? '压缩' : '转换'; }
  function taskFormat(parameters) { return parameters?.operation === 'extract_audio' ? 'MP3' : `MP4 · ${parameters?.resolutionPreset === '720p' ? '720p' : '原分辨率'}`; }
  function displayTask(task) {
    selectedTask = task;
    $('conversion-result').hidden = false;
    $('task-status').textContent = taskStatus(task.status, task.parameters?.operation);
    $('task-status').className = 'media-status ' + (task.status === 'SUCCEEDED' ? 'ready' : task.status === 'FAILED' ? 'failed' : '');
    const stage = ({ WAITING: '等待处理', TRANSCODING: '正在' + taskVerb(task.parameters?.operation), VERIFYING: '正在校验文件', DONE: '文件已就绪', CANCELLED: '任务已取消', FAILED: '任务未完成' })[task.stage] || task.stage;
    $('task-stage').textContent = `${task.id.slice(0, 8)} · ${taskFormat(task.parameters)} · ${stage}`;
    notice('task-error', task.error?.message || '', true);
    $('cancel-task').hidden = !taskActive(task);
    const result = task.status === 'SUCCEEDED' ? task.outputs[0] : null;
    const audioResult = result?.contentType === 'audio/mpeg';
    $('compression-stats').hidden = !result || task.parameters?.operation !== 'compress';
    $('compression-stats').textContent = result && task.parameters?.operation === 'compress'
      ? `目标 ${sizeText(task.parameters.targetSizeBytes)} · 实际 ${sizeText(result.sizeBytes)}` : '';
    if (outputId !== (result?.id || null)) {
      $('output-preview').pause();
      $('output-audio').pause();
      $('output-preview').removeAttribute('src'); $('output-preview').load();
      $('output-audio').removeAttribute('src'); $('output-audio').load();
      if (result) $(audioResult ? 'output-audio' : 'output-preview').src = result.previewUrl;
      outputId = result?.id || null;
    }
    $('output-preview').hidden = !result || audioResult;
    $('output-audio').hidden = !audioResult;
    $('audio-stats').hidden = !audioResult;
    $('audio-stats').textContent = audioResult ? `${(result.metadata.durationMs / 1000).toFixed(2)} 秒 · ${sizeText(result.sizeBytes)}` : '';
    $('download-label').textContent = audioResult ? '下载 MP3' : '下载 MP4';
    $('download-output').hidden = !result;
    if (result) { $('download-output').href = result.downloadUrl; $('download-output').setAttribute('download', result.filename); }
    else $('download-output').removeAttribute('href');
    syncMediaControls();
  }

  async function loadTasks() {
    clearTimeout(taskTimer); taskTimer = null;
    const owner = currentUser?.id;
    const page = taskPage;
    const revision = workspaceRevision;
    if (!owner) return;
    try {
      const result = await request(`/api/tasks?page=${page}&pageSize=10`);
      if (currentUser?.id !== owner || taskPage !== page || workspaceRevision !== revision) return;
      if (page > 1 && !result.items.length) { taskPage = Math.max(1, Math.ceil(result.total / 10)); return loadTasks(); }
      notice('task-list-error', '');
      taskTotal = result.total;
      $('task-total').textContent = `${result.total} 个任务`; $('task-page').textContent = String(page);
      $('task-list-empty').hidden = result.items.length > 0;
      $('task-list').replaceChildren(...result.items.map((task) => {
        const row = document.createElement('li'); row.className = 'media-row task-row';
        const button = document.createElement('button'); button.type = 'button';
        const icon = document.createElement('i'); icon.setAttribute('data-lucide', task.parameters?.operation === 'extract_audio' ? 'file-audio' : 'file-video'); icon.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span'); name.className = 'file-name';
        const title = document.createElement('span'); title.textContent = `${taskVerb(task.parameters?.operation)} ${taskFormat(task.parameters)}`;
        const time = document.createElement('small'); time.textContent = `${task.id.slice(0, 8)} · ${new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(task.createdAt))}`;
        name.append(title, time);
        const size = document.createElement('span'); size.className = 'file-size'; size.textContent = task.outputs[0] ? sizeText(task.outputs[0].sizeBytes) : '';
        const status = document.createElement('span'); status.className = 'media-status ' + (task.status === 'SUCCEEDED' ? 'ready' : task.status === 'FAILED' ? 'failed' : ''); status.textContent = taskStatus(task.status, task.parameters?.operation);
        button.append(icon, name, size, status); button.addEventListener('click', () => { selectTool(task.parameters?.operation === 'extract_audio' ? 'audio' : task.parameters?.operation === 'compress' ? 'compress' : 'convert'); displayTask(task); });
        row.append(button); return row;
      }));
      const chosen = result.items.find((task) => task.id === selectedTask?.id);
      if (chosen) displayTask(chosen);
      else if (!selectedTask && result.items.length) displayTask(result.items[0]);
      else if (selectedTask) {
        const id = selectedTask.id;
        let updated;
        try { updated = await request(`/api/tasks/${id}`); }
        catch (error) {
          if (currentUser?.id !== owner || workspaceRevision !== revision) return;
          if (error.status !== 404) throw error;
          clearTaskResult(); return;
        }
        if (currentUser?.id !== owner || selectedTask?.id !== id || taskPage !== page || workspaceRevision !== revision) return;
        displayTask(updated);
      }
      icons(); syncMediaControls();
      if (result.items.some(taskActive) || taskActive(selectedTask)) taskTimer = setTimeout(loadTasks, 2000);
    } catch (error) {
      if (currentUser?.id !== owner || workspaceRevision !== revision || taskPage !== page) return;
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
      const parameters = processingOperation === 'extract_audio' ? { operation: 'extract_audio', outputFormat: 'mp3' }
        : { operation: processingOperation, outputFormat: 'mp4', resolutionPreset: resolution, audioMode: 'keep' };
      if (processingOperation === 'extract_audio' && !selectedMedia.metadata?.hasAudio) throw new Error('素材没有可提取的音轨。');
      if (processingOperation === 'compress') {
        parameters.targetSizeBytes = Math.floor(Number($('compression-target').value) * 1024 * 1024);
        if (!Number.isSafeInteger(parameters.targetSizeBytes) || parameters.targetSizeBytes < 32768 || parameters.targetSizeBytes >= selectedMedia.sizeBytes)
          throw new Error('目标体积需至少32 KB，并小于原文件。');
      }
      // Retain the plan on an uncertain execute response so another click cannot enqueue a duplicate task.
      if (!pendingPlan || pendingPlan.mediaId !== mediaId || pendingPlan.parameters.resolutionPreset !== parameters.resolutionPreset
          || pendingPlan.parameters.operation !== parameters.operation || pendingPlan.parameters.targetSizeBytes !== parameters.targetSizeBytes) {
        pendingPlan = await request('/api/operation-plans', { method: 'POST', body: { mediaId,
          parameters } });
      }
      const task = await request(`/api/operation-plans/${pendingPlan.id}/execute`, { method: 'POST', body: { expectedVersion: pendingPlan.version } });
      displayTask(task); pendingPlan = null; taskPage = 1; await loadTasks();
    });
  });
  $('cancel-task').addEventListener('click', () => operation('task-error', async () => {
    if (!selectedTask) return;
    displayTask(await request(`/api/tasks/${selectedTask.id}/cancel`, { method: 'POST' })); await loadTasks();
  }));
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

  icons();
  boot();
})();
