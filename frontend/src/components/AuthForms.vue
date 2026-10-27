<script setup lang="ts">
import { LogIn, Mail, ShieldAlert, UserPlus } from '@lucide/vue';
import AuthField from './AuthField.vue';
import { useAuth } from '../auth/use-auth';
import type { AuthServices, AuthView } from '../auth/types';

const props = defineProps<{ services: AuthServices }>();
const auth = useAuth(props.services);
const { mode, status, values, errors, summaries, message, rememberMe, resetKey, challenge, codeNotice, cooldown, disabled } = auth;
const insecureTransport = location.protocol === 'http:' && !window.isSecureContext;
defineExpose<AuthView>({ update: auth.update, notice: auth.notice, clearPasswords: auth.clearPasswords, switchMode: auth.switchMode, stopAnimation: auth.stopAnimation });
</script>

<template>
  <div class="auth-title">
    <p class="eyebrow">AI音视频工作台</p>
    <h1 id="auth-title">{{ mode === 'login' ? '登录账户' : '创建账户' }}</h1>
  </div>
  <p class="transport-warning" data-transport-warning role="status" :hidden="!insecureTransport"><ShieldAlert aria-hidden="true" /><span>当前连接未加密，请通过 HTTPS 访问后再输入密码或验证码。</span></p>
  <div class="tabs" role="tablist" aria-label="账户操作" @keydown="auth.tabKey">
    <button id="login-tab" role="tab" :aria-selected="mode === 'login'" aria-controls="login-panel" :tabindex="mode === 'login' ? 0 : -1" :disabled="disabled" @click="auth.chooseMode('login')">登录</button>
    <button id="register-tab" role="tab" :aria-selected="mode === 'register'" aria-controls="register-panel" :tabindex="mode === 'register' ? 0 : -1" :disabled="disabled" @click="auth.chooseMode('register')">注册</button>
  </div>
  <div id="auth-form-scroll" class="auth-form-scroll">
    <div id="auth-notice" class="notice" :class="{ error: message.error }" role="status" :hidden="!message.text">{{ message.text }}</div>
    <div id="login-panel" role="tabpanel" aria-labelledby="login-tab" :hidden="mode !== 'login'" :inert="mode !== 'login'">
      <form id="login-form" novalidate @submit.prevent="auth.login">
        <AuthField id="login-username" v-model="values['login-username']" name="username" label="用户名" autocomplete="username" pattern="[a-zA-Z0-9_]{4,32}" help="login-username-help" placeholder="请输入用户名" :disabled="disabled" :error="errors['login-username']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <p id="login-username-help" class="field-help">填写登录用户名，不是昵称或邮箱。</p>
        <AuthField id="login-password" v-model="values['login-password']" name="password" label="密码" type="password" autocomplete="current-password" placeholder="请输入密码" toggle :disabled="disabled" :error="errors['login-password']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <label class="check-field"><input id="remember-me" v-model="rememberMe" name="rememberMe" type="checkbox" :disabled="disabled">保持登录</label>
        <p id="login-error" class="form-error" role="alert" :hidden="!summaries.login">{{ summaries.login }}</p>
        <button class="button primary full-width" type="submit" :disabled="disabled"><LogIn aria-hidden="true" /><span>登录</span></button>
      </form>
    </div>
    <div id="register-panel" role="tabpanel" aria-labelledby="register-tab" :hidden="mode !== 'register'" :inert="mode !== 'register'">
      <p id="register-unavailable" class="notice" role="status" :hidden="status.registration !== false">当前暂未开放注册。</p>
      <form id="register-form" novalidate @submit.prevent="auth.register">
        <AuthField id="register-username" v-model="values['register-username']" name="username" label="用户名" autocomplete="username" pattern="[a-zA-Z0-9_]{4,32}" help="register-username-help" placeholder="4–32位字母、数字或下划线" :disabled="disabled" :error="errors['register-username']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <p id="register-username-help" class="field-help">4–32位英文字母、数字或下划线，不含空格或中文。</p>
        <AuthField id="register-email" v-model="values['register-email']" name="email" label="邮箱" type="email" autocomplete="email" :maxlength="254" placeholder="name@example.com" :disabled="disabled" :error="errors['register-email']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <div class="verification-row">
          <AuthField id="register-email-code" v-model="values['register-email-code']" name="emailCode" label="邮箱验证码" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" :maxlength="6" help="register-code-help" placeholder="6位验证码" :disabled="disabled" :error="errors['register-email-code']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
          <button id="send-email-code" class="button secondary" type="button" :disabled="disabled || !status.registration || cooldown > 0" @click="auth.sendCode"><Mail aria-hidden="true" /><span id="email-code-label">{{ cooldown > 0 ? `${cooldown}秒后重发` : '发送验证码' }}</span></button>
        </div>
        <p id="register-code-help" class="field-help">先发送验证码，再填写邮件中的6位数字，才能创建账户。</p>
        <p id="email-code-notice" class="muted" role="status" :hidden="!codeNotice">{{ codeNotice }}</p>
        <AuthField id="register-name" v-model="values['register-name']" name="displayName" label="昵称" autocomplete="nickname" help="register-name-help" placeholder="如何称呼你" optional :disabled="disabled" :error="errors['register-name']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <p id="register-name-help" class="field-help">最多50个字符；留空则使用用户名，可在账户资料中修改。</p>
        <AuthField id="register-password" v-model="values['register-password']" name="password" label="密码" type="password" autocomplete="new-password" help="register-password-help" placeholder="6–16个字符" toggle :disabled="disabled" :error="errors['register-password']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <p id="register-password-help" class="field-help">6–16个字符，至少3个不同字符，避免常见弱密码。不强制大小写、数字或符号组合。</p>
        <AuthField id="register-confirm-password" v-model="values['register-confirm-password']" name="confirmPassword" label="确认密码" type="password" autocomplete="new-password" placeholder="再次输入密码" :disabled="disabled" :error="errors['register-confirm-password']" :reset-key="resetKey" @changed="auth.changed" @blurred="auth.blurred" />
        <p id="register-error" class="form-error" role="alert" :hidden="!summaries.register">{{ summaries.register }}</p>
        <button id="register-submit" class="button primary full-width" type="submit" :disabled="disabled || !status.registration || !challenge"><UserPlus aria-hidden="true" /><span>创建账户</span></button>
      </form>
    </div>
  </div>
</template>
