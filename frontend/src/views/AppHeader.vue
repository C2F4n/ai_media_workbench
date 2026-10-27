<template>
<header class="app-header" hidden>
    <a class="brand" href="/" aria-label="AI音视频工作台首页">
      <img :src="'/assets/brand.svg'" width="34" height="34" alt="">
      <span>AI音视频工作台</span>
    </a>
    <span id="header-location" class="header-label">工作台</span>
    <button id="header-account" class="icon-button" type="button" title="账户设置" aria-label="账户设置" hidden><i data-lucide="settings" aria-hidden="true"></i></button>
    <button id="header-logout" class="button secondary compact" title="退出登录" hidden>
      <i data-lucide="log-out" aria-hidden="true"></i>退出登录
    </button>
  </header>
</template>
