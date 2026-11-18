<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Check, LoaderCircle, Send } from '@lucide/vue';
import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue';

import type { AuthEntryServices, AuthPanel } from '../auth/types';
import { existingPasswordIssue, newPasswordIssue, usernameIssue } from '../auth/validation';
import { errorInfo } from '../runtime/types';
import AuthEntryInput from './AuthEntryInput.vue';

const props = defineProps<{ auth: AuthEntryServices; panel: AuthPanel }>();
const emit = defineEmits<{ select: [panel: AuthPanel] }>();

type Action = 'login' | 'code' | 'register';
type SignUpField = 'username' | 'email' | 'emailCode' | 'displayName' | 'password' | 'confirmation';
const login = reactive({ username: '', password: '', rememberMe: false });
const registration = reactive({ username: '', email: '', emailCode: '', displayName: '', password: '', confirmation: '' });
const loginErrors = reactive<Partial<Record<keyof typeof login, string>>>({});
const registerErrors = reactive<Partial<Record<SignUpField, string>>>({});
const pending = ref<Action>();
const loginMessage = ref('');
const registrationError = ref('');
const registrationNotice = ref('');
const signedUp = ref(false);
const challenge = ref<{ email: string; id: string; expiry: number }>();
const email = computed(() => registration.email.trim().toLowerCase());
const now = ref(Date.now());
const cooldowns = reactive(new Map<string, number>());
const waitSeconds = computed(() => Math.max(0, Math.ceil(((cooldowns.get(email.value) ?? 0) - now.value) / 1000)));
const canSend = computed(() => props.auth.registrationAllowed && !pending.value && !waitSeconds.value);
let clock: ReturnType<typeof setTimeout> | undefined;
const onUnencryptedLink = location.protocol === 'http:' && !window.isSecureContext;

function updateClock() {
  now.value = Date.now();
  for (const [address, deadline] of cooldowns) if (deadline <= now.value) cooldowns.delete(address);
  if (cooldowns.size) clock = setTimeout(updateClock, 500);
}

function beginCooldown(address: string, seconds: number) {
  cooldowns.set(address, Date.now() + seconds * 1000);
  clearTimeout(clock);
  updateClock();
}

onUnmounted(() => clearTimeout(clock));

watch(email, () => {
  challenge.value = undefined;
  registration.emailCode = '';
  registrationNotice.value = '';
  registerErrors.emailCode = '';
});

watch(() => props.auth.visible, visible => {
  if (visible) return;
  login.password = '';
  registration.password = registration.confirmation = '';
  registration.emailCode = '';
  login.rememberMe = false;
});

function clearLogin(field: 'username' | 'password') {
  loginErrors[field] = '';
  loginMessage.value = '';
  signedUp.value = false;
}

function clearRegistration(field: SignUpField) {
  registerErrors[field] = '';
  if (field === 'password' && registerErrors.confirmation) {
    registerErrors.confirmation = confirmationIssue();
  }
  registrationError.value = '';
}

function confirmationIssue() {
  if (!registration.confirmation) return '请再次输入密码。';
  return registration.confirmation === registration.password ? '' : '两次输入的密码不一致。';
}

function emailIssue() {
  if (!email.value) return '请输入邮箱。';
  return email.value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) && /^[\x21-\x7e]+$/.test(email.value)
    ? '' : '请输入有效的邮箱地址。';
}

function focusField(id: string) {
  void nextTick(() => document.getElementById(id)?.focus());
}

async function submitLogin() {
  if (pending.value) return;
  signedUp.value = false;
  loginMessage.value = '';
  loginErrors.username = usernameIssue(login.username);
  loginErrors.password = existingPasswordIssue(login.password, '密码');
  if (loginErrors.username || loginErrors.password) {
    focusField(loginErrors.username ? 'login-username' : 'login-password');
    return;
  }
  pending.value = 'login';
  try {
    await props.auth.login({ ...login });
    login.password = '';
    login.rememberMe = false;
    registration.password = registration.confirmation = '';
  } catch (value) {
    const error = errorInfo(value);
    loginMessage.value = error.message;
    if (error.code === 'INVALID_CREDENTIALS' && props.panel === 'login') {
      focusField('login-password');
    }
  } finally {
    pending.value = undefined;
  }
}

async function sendCode() {
  if (!canSend.value) return;
  registrationError.value = '';
  registerErrors.email = emailIssue();
  if (registerErrors.email) {
    focusField('register-email');
    return;
  }
  const address = email.value;
  pending.value = 'code';
  try {
    const response = await props.auth.sendCode(address);
    beginCooldown(address, 20);
    if (email.value !== address) return;
    challenge.value = { email: address, id: response.challengeId, expiry: Date.parse(response.expiresAt) };
    registration.emailCode = '';
    registerErrors.emailCode = '';
    registrationNotice.value = '验证码已发送，请查看邮箱。';
    if (props.panel === 'register') focusField('register-code');
  } catch (value) {
    const error = errorInfo(value);
    if (error.status === 429) beginCooldown(address, error.retryAfter ?? 60);
    if (email.value === address) registrationError.value = error.message;
  } finally {
    pending.value = undefined;
  }
}

const signupFields = ['username', 'email', 'emailCode', 'displayName', 'password', 'confirmation'] as const;
const signupIds: Record<SignUpField, string> = {
  username: 'register-username', email: 'register-email', emailCode: 'register-code',
  displayName: 'register-name', password: 'register-password', confirmation: 'register-confirmation'
};

async function submitRegistration() {
  if (pending.value || !props.auth.registrationAllowed) return;
  registrationError.value = '';
  const currentChallenge = challenge.value;
  const challengeId = currentChallenge?.id;
  const validChallenge = currentChallenge && currentChallenge.email === email.value && currentChallenge.expiry > Date.now();
  Object.assign(registerErrors, {
    username: usernameIssue(registration.username),
    email: emailIssue(),
    emailCode: !validChallenge ? '请先获取当前邮箱的验证码。' :
      /^\d{6}$/.test(registration.emailCode) ? '' : '请输入 6 位数字验证码。',
    displayName: Array.from(registration.displayName.trim()).length > 50 ? '昵称最多 50 个字符。' : '',
    password: newPasswordIssue(registration.password),
    confirmation: confirmationIssue()
  });
  const firstError = signupFields.find(field => registerErrors[field]);
  if (firstError || !challengeId) {
    if (firstError) focusField(signupIds[firstError]);
    return;
  }

  const displayName = registration.displayName.trim();
  pending.value = 'register';
  try {
    await props.auth.register({
      username: registration.username,
      email: email.value,
      emailChallengeId: challengeId,
      emailCode: registration.emailCode,
      password: registration.password,
      ...(displayName ? { displayName } : {})
    });
    login.username = registration.username;
    login.password = '';
    loginMessage.value = '';
    loginErrors.username = loginErrors.password = '';
    Object.assign(registration, { username: '', email: '', emailCode: '', displayName: '', password: '', confirmation: '' });
    signedUp.value = true;
    emit('select', 'login');
    focusField('login-password');
  } catch (value) {
    const error = errorInfo(value);
    for (const detail of error.details ?? []) {
      const field = signupFields.find(name => name === detail.field);
      if (field) registerErrors[field] = detail.message;
    }
    registrationError.value = error.message;
    if (error.code === 'EMAIL_VERIFICATION_INVALID') registerErrors.emailCode = error.message;
    const firstField = signupFields.find(field => registerErrors[field]);
    if (firstField && props.panel === 'register') focusField(signupIds[firstField]);
  } finally {
    pending.value = undefined;
  }
}

function goHome() {
  emit('select', 'home');
  focusField('home-tab');
}
</script>

<template>
  <div class="auth-entry-header" :hidden="panel === 'home'">
    <button type="button" class="auth-entry-back" aria-label="返回主界面" @click="goHome"><ArrowLeft aria-hidden="true" /></button>
    <h2>{{ panel === 'register' ? '创建账号' : '登录' }}</h2>
  </div>
  <p v-if="onUnencryptedLink && panel !== 'home'" class="auth-entry-warning" role="status">
    当前连接未加密，请通过 HTTPS 输入密码和验证码。
  </p>
  <div class="auth-entry-scroll" :hidden="panel === 'home'">
    <section id="login-panel" role="tabpanel" aria-labelledby="login-tab" :hidden="panel !== 'login'" :inert="panel !== 'login'">
      <p v-if="signedUp" class="auth-entry-success" role="status">注册成功，请登录。</p>
      <form id="login-form" class="auth-entry-form" novalidate @submit.prevent="submitLogin">
        <fieldset :disabled="pending === 'login'">
          <AuthEntryInput id="login-username" v-model="login.username" label="用户名" name="username"
            autocomplete="username" placeholder="请输入用户名" :error="loginErrors.username" @update:model-value="clearLogin('username')" />
          <AuthEntryInput id="login-password" v-model="login.password" label="密码" name="password" kind="password"
            autocomplete="current-password" placeholder="请输入密码" :masked="panel !== 'login'"
            :error="loginErrors.password" @update:model-value="clearLogin('password')" />
          <label class="auth-entry-remember">
            <input id="remember-me" v-model="login.rememberMe" type="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="8" />
              <polyline points="1 9 7 14 15 4" />
            </svg>
            <span>保持登录</span>
          </label>
          <p v-if="loginMessage" class="auth-entry-error" role="alert">{{ loginMessage }}</p>
          <button class="auth-entry-submit" type="submit" :disabled="!!pending" :aria-busy="pending === 'login'">
            <span>{{ pending === 'login' ? '登录中…' : '登录' }}</span>
            <span class="auth-entry-arrow"><LoaderCircle v-if="pending === 'login'" class="spinning" aria-hidden="true" /><ArrowUpRight v-else aria-hidden="true" /></span>
          </button>
        </fieldset>
      </form>
      <button type="button" class="auth-entry-link" @click="emit('select', 'register')">没有账号？去注册</button>
    </section>
    <section id="register-panel" role="tabpanel" aria-labelledby="register-tab" :hidden="panel !== 'register'" :inert="panel !== 'register'">
      <p v-if="!auth.registrationAllowed" class="auth-entry-warning" role="status">当前暂未开放注册。</p>
      <form v-else id="register-form" class="auth-entry-form" novalidate @submit.prevent="submitRegistration">
        <fieldset :disabled="pending === 'register'">
          <AuthEntryInput id="register-username" v-model="registration.username" label="用户名" name="username"
            autocomplete="username" placeholder="4–32 位字母、数字或下划线"
            :error="registerErrors.username" @update:model-value="clearRegistration('username')" />
          <AuthEntryInput id="register-email" v-model="registration.email" label="邮箱" name="email" kind="email"
            autocomplete="email" placeholder="name@example.com" :error="registerErrors.email" @update:model-value="clearRegistration('email')" />
          <div class="auth-entry-code-row">
            <AuthEntryInput id="register-code" v-model="registration.emailCode" label="邮箱验证码" name="emailCode"
              inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位数字"
              :error="registerErrors.emailCode" @update:model-value="clearRegistration('emailCode')" />
            <button id="send-email-code" class="auth-entry-send" type="button" :disabled="!canSend"
              :aria-busy="pending === 'code'" @click="sendCode">
              <LoaderCircle v-if="pending === 'code'" class="spinning" aria-hidden="true" />
              <Check v-else-if="waitSeconds && registrationNotice" aria-hidden="true" />
              <Send v-else aria-hidden="true" />
              <span>{{ pending === 'code' ? '发送中…' : waitSeconds ? waitSeconds + ' 秒后重发' : '发送验证码' }}</span>
            </button>
          </div>
          <p v-if="registrationNotice" class="auth-entry-success" role="status">{{ registrationNotice }}</p>
          <AuthEntryInput id="register-password" v-model="registration.password" label="密码" name="password" kind="password"
            autocomplete="new-password" placeholder="6–16 个字符" hint="至少使用 3 个不同字符，避开常见弱密码。" :masked="panel !== 'register'"
            :error="registerErrors.password" @update:model-value="clearRegistration('password')" />
          <AuthEntryInput id="register-confirmation" v-model="registration.confirmation" label="确认密码" kind="password"
            autocomplete="new-password" placeholder="请再输一次密码" :masked="panel !== 'register'"
            :error="registerErrors.confirmation" @update:model-value="clearRegistration('confirmation')" />
          <AuthEntryInput id="register-name" v-model="registration.displayName" label="昵称（选填）" name="displayName"
            autocomplete="nickname" placeholder="留空时使用用户名"
            :error="registerErrors.displayName" @update:model-value="clearRegistration('displayName')" />
          <p v-if="registrationError" class="auth-entry-error" role="alert">{{ registrationError }}</p>
          <button class="auth-entry-submit" type="submit" :disabled="!!pending" :aria-busy="pending === 'register'">
            <span>{{ pending === 'register' ? '注册中…' : '注册' }}</span>
            <span class="auth-entry-arrow"><LoaderCircle v-if="pending === 'register'" class="spinning" aria-hidden="true" /><ArrowUpRight v-else aria-hidden="true" /></span>
          </button>
        </fieldset>
      </form>
      <button type="button" class="auth-entry-link" @click="emit('select', 'login')">已有账号？去登录</button>
    </section>
  </div>
</template>
