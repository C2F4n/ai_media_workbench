<script setup lang="ts">
import { ChevronsLeftRight, MousePointer2 } from '@lucide/vue';
import { onMounted, onUnmounted, ref } from 'vue';

import { authPhoneOnlyQuery } from '../auth/theme';
import type { AuthEntryServices } from '../auth/types';
import AuthCornerWelcome from '../components/AuthCornerWelcome.vue';
import AuthCubesGrid from '../components/AuthCubesGrid.vue';
import AuthDarkCubes from '../components/AuthDarkCubes.vue';
import AuthGallery from '../components/AuthGallery.vue';
import AuthPhone from '../components/AuthPhone.vue';
import AuthTypewriter from '../components/AuthTypewriter.vue';
import AuthWelcome from '../components/AuthWelcome.vue';

defineProps<{ auth: AuthEntryServices }>();
const phoneViewport = matchMedia(authPhoneOnlyQuery);
const phoneOnly = ref(phoneViewport.matches);
function syncViewport() { phoneOnly.value = phoneViewport.matches; }
onMounted(() => phoneViewport.addEventListener('change', syncViewport));
onUnmounted(() => phoneViewport.removeEventListener('change', syncViewport));
</script>

<template>
  <section id="auth-view" class="auth-phone-page" :class="{ 'auth-phone-only': phoneOnly }" data-theme="light" hidden>
    <AuthCubesGrid v-if="!phoneOnly" />
    <AuthDarkCubes v-if="!phoneOnly" />
    <div class="auth-phone-layout">
      <div v-if="!phoneOnly" class="auth-intro">
        <AuthWelcome />
        <AuthTypewriter />
      </div>
      <AuthPhone :auth="auth" />
      <AuthGallery v-if="!phoneOnly" />
    </div>
    <AuthCornerWelcome v-if="!phoneOnly" />
    <div v-if="!phoneOnly" class="auth-theme-dark" aria-hidden="true"></div>
    <div v-if="!phoneOnly" class="auth-theme-divider" aria-hidden="true"></div>
    <div class="auth-theme-gravity" aria-hidden="true"></div>
    <div id="auth-theme-toggle" class="auth-theme-slider" role="slider" tabindex="0" aria-label="登录页主题"
      aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"
      aria-valuetext="全亮色"
      aria-describedby="auth-theme-hint">
      <span class="auth-dock-tile" aria-hidden="true"><ChevronsLeftRight /></span>
      <span class="auth-dock-follower auth-theme-follower">
        <MousePointer2 aria-hidden="true" />
        <span id="auth-theme-hint" role="tooltip">滑动以切换风格</span>
      </span>
    </div>
  </section>
</template>
