<template>
<section id="auth-view" class="auth-shell" data-theme="light" data-mode="login" hidden>
      <button id="auth-theme-toggle" class="icon-button" type="button" title="切换到暗色模式" aria-label="切换到暗色模式" aria-pressed="false"><i data-lucide="moon" aria-hidden="true"></i></button>
      <aside id="auth-gallery" class="auth-gallery" aria-hidden="true" data-slide="0">
        <div id="auth-gallery-stage" class="auth-gallery-stage">
          <figure class="auth-slide">
            <img data-src="/assets/auth/studio-desk.webp" width="1600" height="2399" alt="现代影视工作室中的数字摄影机、监视器与剪辑设备" fetchpriority="high" decoding="async">
            <div class="auth-image-fallback"><i data-lucide="film" aria-hidden="true"></i></div>
          </figure>
          <figure class="auth-slide" hidden>
            <img data-src="/assets/auth/studio-lighting.webp" width="1600" height="1067" alt="拍摄现场的彩色灯光与现代布光设备" decoding="async">
            <div class="auth-image-fallback"><i data-lucide="film" aria-hidden="true"></i></div>
          </figure>
          <figure class="auth-slide" hidden>
            <img data-src="/assets/auth/studio-editing.webp" width="1600" height="2395" alt="显示音频波形与视频时间线的双屏剪辑工作台" decoding="async">
            <div class="auth-image-fallback"><i data-lucide="film" aria-hidden="true"></i></div>
          </figure>
        </div>
      </aside>
      <div class="auth-form-pane"><div id="auth-form-content" class="auth-form-content"></div></div>
    </section>
</template>
