<script setup lang="ts">
import { BatteryFull, Signal, Wifi } from '@lucide/vue';
import { onMounted, onUnmounted, ref } from 'vue';

import type { AuthEntryServices, AuthPanel } from '../auth/types';
import AuthDock from './AuthDock.vue';
import AuthEntryForms from './AuthEntryForms.vue';
import AuthMatrixTrail from './AuthMatrixTrail.vue';
import AuthPhoneName from './AuthPhoneName.vue';

defineProps<{ auth: AuthEntryServices }>();

const time = ref('');
const activePanel = ref<AuthPanel>('home');
let clockTimer: ReturnType<typeof setTimeout> | undefined;

function updateTime() {
  clearTimeout(clockTimer);
  if (document.hidden) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  time.value = `${hours}:${minutes}`;
  clockTimer = setTimeout(updateTime, 60000 - (now.getTime() % 60000));
}

onMounted(() => {
  updateTime();
  document.addEventListener('visibilitychange', updateTime);
});
onUnmounted(() => {
  clearTimeout(clockTimer);
  document.removeEventListener('visibilitychange', updateTime);
});
</script>

<template>
  <section class="auth-phone" aria-label="手机界面">
    <div class="auth-phone-screen">
      <AuthMatrixTrail />
      <div class="auth-phone-status" aria-hidden="true">
        <span class="auth-phone-time">{{ time }}</span>
        <span class="auth-phone-notch"></span>
        <span class="auth-phone-indicators"><Signal /><Wifi /><BatteryFull /></span>
      </div>
      <div class="auth-phone-content">
        <p id="auth-notice" class="notice" role="status" hidden></p>
        <div id="auth-phone-home-panel" role="tabpanel" aria-labelledby="home-tab" :hidden="activePanel !== 'home'">
          <AuthPhoneName v-if="activePanel === 'home'" />
        </div>
        <AuthEntryForms :auth="auth" :panel="activePanel" @select="activePanel = $event" />
      </div>
      <div class="auth-phone-dock"><AuthDock :active="activePanel" @select="activePanel = $event" /></div>
      <div class="auth-phone-home" aria-hidden="true"></div>
    </div>
  </section>
</template>
