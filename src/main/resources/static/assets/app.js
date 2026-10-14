(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let currentUser = null;
  let csrfToken = null;
  let capabilities = null;
  let busy = false;
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
    WEAK_PASSWORD: '密码过于简单，请换用更长的密码短语。',
    REGISTRATION_DISABLED: '当前暂未开放注册。',
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

  async function refreshCsrf() {
    const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('暂时无法连接服务，请稍后重试。');
    csrfToken = (await response.json()).token;
  }

  async function request(path, options = {}, retried = false) {
    const method = options.method || 'GET';
    const writes = method !== 'GET';
    if (writes && !csrfToken) await refreshCsrf();
    const headers = { Accept: 'application/json' };
    if (writes) headers['X-CSRF-Token'] = csrfToken;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(path, {
        method, headers, credentials: 'same-origin', cache: 'no-store',
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
      });
    } catch {
      throw new Error('暂时无法连接服务，请稍后重试。');
    }
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 403 && data.code === 'CSRF_INVALID' && !retried) {
        await refreshCsrf();
        return request(path, options, true);
      }
      throw new ApiError(data.code, response.status, response.headers.get('Retry-After'));
    }
    return data;
  }

  function icons() { window.lucide?.createIcons(); }

  function notice(id, text, error = false) {
    const element = $(id);
    element.textContent = text;
    element.hidden = !text;
    element.classList.toggle('error', error);
  }

  function showOnly(view) {
    for (const id of ['loading-view', 'unavailable-view', 'auth-view', 'account-view']) {
      $(id).hidden = id !== view;
    }
    $('header-logout').hidden = view !== 'account-view';
  }

  function setBusy(value) {
    busy = value;
    document.querySelectorAll('button, form input').forEach((element) => { element.disabled = value; });
    $('register-submit').disabled = value || !capabilities?.registration;
    document.body.setAttribute('aria-busy', String(value));
  }

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

  function showAuth(message = '') {
    currentUser = null;
    $('delete-dialog').close();
    clearPasswords();
    switchMode('login');
    showOnly('auth-view');
    notice('auth-notice', message);
    notice('account-notice', '');
  }

  function showAccount(user) {
    currentUser = user;
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
  }

  async function restoreSession() {
    try {
      await refreshCsrf();
      const user = await request('/api/users/me');
      showAccount(user);
    } catch (error) {
      if (error.status === 401) showAuth();
      else showOnly('unavailable-view');
    }
  }

  async function operation(errorId, action) {
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

  function validateNewPassword(password, confirmation) {
    const length = Array.from(password).length;
    if (length < 15 || length > 128) throw new Error('密码需要15–128个字符。');
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

  $('register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    operation('register-error', async () => {
      validateNewPassword(body.password, body.confirmPassword);
      delete body.confirmPassword;
      body.email = body.email.trim();
      body.displayName = body.displayName.trim();
      if (!body.displayName) delete body.displayName;
      if (body.displayName && Array.from(body.displayName).length > 50) throw new Error('昵称最多50个字符。');
      const user = await request('/api/auth/register', { method: 'POST', body });
      $('login-username').value = user.username;
      $('register-form').reset();
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
      csrfToken = data.csrfToken;
      showAccount(data.user);
      notice('account-notice', '');
      channel?.postMessage('account-changed');
    });
  });

  async function signOut(allDevices) {
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
  if (channel) channel.onmessage = () => { if (!busy) restoreSession(); };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !busy && capabilities) restoreSession();
  });

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
