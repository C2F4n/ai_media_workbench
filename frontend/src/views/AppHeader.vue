<script setup lang="ts">
import { LayoutDashboard } from '@lucide/vue';
import { switchWorkbenchVersion } from '../workbench/version';
</script>

<template>
  <header id="app-header" class="app-header" hidden>
    <div class="header-bar">
      <a class="brand" href="/" aria-label="FrameFlow首页">
        <img :src="'/assets/brand.svg'" width="34" height="34" alt="">
        <span>FrameFlow</span>
      </a>
      <nav class="header-nav" aria-label="主导航">
        <button id="header-workbench" type="button" aria-current="page" aria-controls="workbench-panel" aria-label="工作台" title="工作台">
          <i data-lucide="layout-dashboard" aria-hidden="true"></i><span>工作台</span>
        </button>
        <button id="header-account" type="button" aria-controls="account-panel" aria-label="账户设置" title="账户设置">
          <i data-lucide="settings" aria-hidden="true"></i><span>账户设置</span>
        </button>
      </nav>
      <div class="header-actions">
        <button class="button secondary compact header-new-workbench" type="button" aria-label="返回新版工作台"
          title="返回新版工作台" @click="switchWorkbenchVersion(false)">
          <LayoutDashboard aria-hidden="true" /><span>返回新版</span>
        </button>
        <button id="header-logout" class="button secondary compact" type="button" aria-label="退出登录" title="退出登录">
          <i data-lucide="log-out" aria-hidden="true"></i><span>退出登录</span>
        </button>
      </div>
    </div>
  </header>
</template>
