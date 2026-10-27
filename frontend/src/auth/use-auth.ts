import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue';
import { existingPasswordIssue, newPasswordIssue, usernameIssue } from './validation';
import type { AuthFieldId, AuthMode, AuthServices, AuthStatus, RegistrationChallenge } from './types';

const fields: Record<AuthMode, AuthFieldId[]> = {
  login: ['login-username', 'login-password'],
  register: ['register-username', 'register-email', 'register-email-code', 'register-name', 'register-password', 'register-confirm-password']
};
const fieldNames: Record<AuthFieldId, string> = {
  'login-username': 'username', 'login-password': 'password', 'register-username': 'username', 'register-email': 'email',
  'register-email-code': 'emailCode', 'register-name': 'displayName', 'register-password': 'password', 'register-confirm-password': 'confirmPassword'
};
interface AuthError { code?: string; message?: string; retryAfter?: number; details?: { field: string; message: string }[] }

export function useAuth(services: AuthServices) {
  const mode = ref<AuthMode>('login');
  const status = reactive<AuthStatus>({ busy: false, registration: null });
  const pending = ref(false), rememberMe = ref(false), resetKey = ref(0);
  const values = reactive(Object.fromEntries(Object.keys(fieldNames).map(id => [id, ''])) as Record<AuthFieldId, string>);
  const errors = reactive<Partial<Record<AuthFieldId, string>>>({});
  const touched = new Set<AuthFieldId>(), serverErrors = new Set<AuthFieldId>();
  const summaries = reactive({ login: '', register: '' });
  const message = reactive({ text: '', error: false });
  const challenge = ref<(RegistrationChallenge & { email: string }) | null>(null);
  const codeNotice = ref(''), now = ref(Date.now());
  const cooldowns = reactive(new Map<string, number>());
  let timer: ReturnType<typeof setInterval> | null = null;
  let animation: Animation | null = null, transition = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const email = computed(() => values['register-email'].trim().toLowerCase());
  const disabled = computed(() => status.busy || pending.value);
  const cooldown = computed(() => Math.max(0, Math.ceil(((cooldowns.get(email.value) ?? 0) - now.value) / 1000)));
  const input = (id: string) => document.getElementById(id) as HTMLInputElement | null;

  function notice(text: string, error = false) { Object.assign(message, { text, error }); }
  function issue(id: AuthFieldId): string {
    const value = values[id];
    switch (id) {
      case 'login-username': case 'register-username': return usernameIssue(value);
      case 'login-password': return existingPasswordIssue(value, '密码');
      case 'register-email':
        if (!value.trim()) return '请输入邮箱。';
        if (!/^[\x00-\x7f]+$/.test(value)) return '邮箱只支持英文字符，请检查是否使用了中文或全角符号。';
        if (value.trim().length > 254) return '邮箱最多254个字符。';
        return input(id)?.validity.typeMismatch ? '请输入有效的邮箱地址，例如 name@example.com。' : '';
      case 'register-email-code':
        if (!challenge.value || challenge.value.email !== email.value) return '请先获取当前邮箱的验证码。';
        if (Date.parse(challenge.value.expiresAt) <= Date.now()) return '验证码已过期，请重新获取。';
        return /^[0-9]{6}$/.test(value) ? '' : '邮箱验证码需要6位数字。';
      case 'register-name': return Array.from(value.trim()).length > 50 ? '昵称最多50个字符。' : '';
      case 'register-password': return newPasswordIssue(value);
      case 'register-confirm-password': return !value ? '请再次输入密码。' : value !== values['register-password'] ? '两次输入的密码不一致。' : '';
    }
  }
  function summary(ids: AuthFieldId[]) {
    return ids.length > 1 ? `有${ids.length}项需要修改，请查看标红输入框下方的提示。` : errors[ids[0]] || '';
  }
  function changed(id: AuthFieldId) {
    summaries[id.startsWith('login-') ? 'login' : 'register'] = '';
    serverErrors.delete(id);
    if (touched.has(id) || errors[id]) errors[id] = issue(id);
    if (id === 'register-password' && (touched.has('register-confirm-password') || errors['register-confirm-password'])) errors['register-confirm-password'] = issue('register-confirm-password');
    if (id === 'register-email') {
      challenge.value = null; values['register-email-code'] = ''; errors['register-email-code'] = ''; serverErrors.delete('register-email-code'); codeNotice.value = '';
    }
  }
  function blurred(id: AuthFieldId, event: FocusEvent) {
    touched.add(id);
    const target = event.relatedTarget;
    if (target instanceof Element && target.closest('button') && input(id)?.form?.contains(target)) return;
    if (!serverErrors.has(id)) errors[id] = issue(id);
  }
  function validate(form: AuthMode, ids = fields[form]): boolean {
    for (const id of ids) { errors[id] = issue(id); serverErrors.delete(id); }
    const invalid = ids.filter(id => errors[id]);
    summaries[form] = summary(invalid);
    // Wait for error rows to render before focus scrolls the first invalid input.
    if (invalid[0]) void nextTick(() => input(invalid[0])?.focus());
    return !invalid.length;
  }
  function serverIssues(form: AuthMode, error: AuthError): AuthFieldId[] {
    let details = ['INVALID_PARAMETERS', 'INVALID_REQUEST'].includes(error.code ?? '') ? error.details ?? [] : [];
    const field = error.code === 'WEAK_PASSWORD' ? 'password' : error.code === 'EMAIL_VERIFICATION_INVALID' ? 'emailCode' : null;
    if (field) details = [{ field, message: error.message || '输入有误，请检查后重试。' }];
    const invalid: AuthFieldId[] = [];
    for (const id of fields[form]) {
      const detail = details.find(item => item.field === fieldNames[id] || item.field === 'emailChallengeId' && fieldNames[id] === 'emailCode');
      if (detail) { errors[id] = detail.message; serverErrors.add(id); invalid.push(id); }
    }
    return invalid;
  }
  async function run(form: AuthMode, action: () => Promise<void>, successFocus?: string) {
    if (disabled.value) return;
    pending.value = true; summaries[form] = ''; services.setBusy(true);
    let focus: string | undefined;
    try { await action(); focus = successFocus; }
    catch (caught) {
      const error = (caught instanceof Error || typeof caught === 'object' && caught !== null ? caught : {}) as AuthError;
      if (error.code === 'UNAUTHENTICATED') await services.expired(error.message || '登录已失效，请重新登录。');
      else {
        const invalid = serverIssues(form, error);
        summaries[form] = invalid.length ? summary(invalid) : error.message || '请求失败，请稍后重试。';
        focus = invalid[0];
      }
    } finally {
      pending.value = false; services.setBusy(false);
      await nextTick();
      if (focus) input(focus)?.focus();
    }
  }
  function tick() {
    now.value = Date.now();
    for (const [key, until] of cooldowns) if (until <= now.value) cooldowns.delete(key);
    if (!cooldowns.size && timer !== null) { clearInterval(timer); timer = null; }
  }
  function startCooldown(key: string, seconds: number) {
    // The server's Retry-After is authoritative; delivery failures do not start a countdown.
    cooldowns.set(key, Date.now() + Math.max(1, Number.isFinite(seconds) ? seconds : 20) * 1000);
    tick();
    if (timer === null) timer = setInterval(tick, 250);
  }
  async function sendCode() {
    if (disabled.value || !status.registration || cooldown.value > 0 || !validate('register', ['register-email'])) return;
    const requestedEmail = email.value;
    await run('register', async () => {
      let result: RegistrationChallenge;
      try { result = await services.sendCode(requestedEmail); }
      catch (caught) {
        const error = caught as AuthError;
        if (error?.code === 'RATE_LIMITED') startCooldown(requestedEmail, error.retryAfter ?? 20);
        throw caught;
      }
      startCooldown(requestedEmail, 20);
      if (email.value !== requestedEmail) return;
      challenge.value = { ...result, email: requestedEmail };
      values['register-email-code'] = ''; errors['register-email-code'] = ''; serverErrors.delete('register-email-code');
      codeNotice.value = '验证码已发送，请查看邮箱。';
    });
  }
  async function login() {
    if (disabled.value || !validate('login')) return;
    await run('login', () => services.login({ username: values['login-username'], password: values['login-password'], rememberMe: rememberMe.value }));
  }
  async function register() {
    if (disabled.value || !status.registration || !challenge.value || !validate('register')) return;
    const body = {
      username: values['register-username'], email: values['register-email'].trim(), emailCode: values['register-email-code'],
      emailChallengeId: challenge.value.challengeId, password: values['register-password'],
      ...(values['register-name'].trim() ? { displayName: values['register-name'].trim() } : {})
    };
    await run('register', async () => {
      const user = await services.register(body);
      for (const id of fields.register) values[id] = '';
      challenge.value = null; codeNotice.value = '';
      services.registered();
      values['login-username'] = user.username;
    }, 'login-password');
  }
  function clearPasswords() {
    for (const id of ['login-password', 'register-password', 'register-confirm-password'] as const) values[id] = '';
    for (const id of Object.keys(fieldNames) as AuthFieldId[]) errors[id] = '';
    touched.clear(); serverErrors.clear(); resetKey.value++;
  }
  function stopAnimation() { transition++; animation?.cancel(); animation = null; }
  function switchMode(next: AuthMode, animate = false) {
    const changed = mode.value !== next;
    stopAnimation(); mode.value = next;
    document.getElementById('auth-view')!.dataset.mode = next;
    summaries.login = ''; summaries.register = '';
    if (!changed) return;
    const token = transition;
    void nextTick(() => {
      if (token !== transition) return;
      const scroll = document.getElementById('auth-form-scroll'); if (scroll) scroll.scrollTop = 0;
      if (!animate || reducedMotion.matches || document.getElementById('auth-view')?.hidden) return;
      const panel = document.getElementById(`${next}-panel`);
      if (!panel) return;
      const current = panel.animate([{ opacity: 0, transform: `translateX(${next === 'login' ? -24 : 24}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 300, easing: 'cubic-bezier(.22,.75,.22,1)' });
      animation = current;
      void current.finished.then(() => { if (animation === current) stopAnimation(); }).catch(() => {});
    });
  }
  function chooseMode(next: AuthMode) { if (!disabled.value) { switchMode(next, true); notice(''); } }
  function tabKey(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' || event.key === 'End' ? 'register' : 'login';
    chooseMode(next); void nextTick(() => document.getElementById(`${next}-tab`)?.focus());
  }
  function motionChanged() { if (reducedMotion.matches) stopAnimation(); }
  reducedMotion.addEventListener('change', motionChanged);
  window.addEventListener('pagehide', stopAnimation);
  onBeforeUnmount(() => {
    stopAnimation(); if (timer !== null) clearInterval(timer);
    reducedMotion.removeEventListener('change', motionChanged); window.removeEventListener('pagehide', stopAnimation);
    clearPasswords(); cooldowns.clear();
  });
  return {
    mode, status, values, errors, summaries, message, rememberMe, resetKey, challenge, codeNotice, cooldown, disabled,
    changed, blurred, sendCode, login, register, chooseMode, tabKey,
    update(value: AuthStatus) { Object.assign(status, value); }, notice, clearPasswords, switchMode, stopAnimation
  };
}
