<script setup lang="ts">
import AccountArea from './views/AccountArea.vue';
import AuthScreen from './views/AuthScreen.vue';
import AppHeader from './views/AppHeader.vue';
import ConfirmationDialogs from './views/ConfirmationDialogs.vue';
</script>
<template>
<AppHeader />

  <main>
    <section id="loading-view" class="loading-view" aria-live="polite">
      <i data-lucide="loader-circle" class="spinning" aria-hidden="true"></i>
      <span>正在加载账户…</span>
    </section>
    <section id="unavailable-view" class="auth-shell" hidden>
      <h1>暂时无法连接</h1>
      <p id="unavailable-message" class="muted">服务暂时不可用，请稍后重试。</p>
      <button id="retry-connection" class="button primary">
        <i data-lucide="refresh-cw" aria-hidden="true"></i>重新连接
      </button>
    </section>

    <AuthScreen />

    <AccountArea />
  </main>

  <ConfirmationDialogs />
</template>
