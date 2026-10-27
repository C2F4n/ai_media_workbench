<template>
<div id="account-panel" hidden>
      <button id="back-workbench" class="button secondary compact back-workbench" type="button"><i data-lucide="arrow-left" aria-hidden="true"></i>返回工作台</button>
      <div class="account-heading">
        <div>
          <p class="eyebrow">我的账户</p>
          <h1 id="account-greeting"></h1>
        </div>
        <span class="status-badge"><span class="status-dot"></span>已登录</span>
      </div>
      <div class="account-layout">
        <nav class="account-nav" role="tablist" aria-label="账户分区">
          <button id="account-profile-tab" type="button" role="tab" aria-selected="true" aria-controls="profile-section"><i data-lucide="user-round" aria-hidden="true"></i>账户资料</button>
          <button id="account-security-tab" type="button" role="tab" aria-selected="false" aria-controls="security-section" tabindex="-1"><i data-lucide="shield-check" aria-hidden="true"></i>账户安全</button>
          <button id="account-cloud-tab" type="button" role="tab" aria-selected="false" aria-controls="cloud-section" tabindex="-1"><i data-lucide="cpu" aria-hidden="true"></i>AI 服务</button>
        </nav>
        <div class="account-sections">
          <section id="profile-section" class="account-section" role="tabpanel" aria-labelledby="account-profile-tab">
            <h2>账户资料</h2>
            <dl class="profile-info">
              <div><dt>用户名</dt><dd id="profile-username"></dd></div>
              <div><dt>邮箱</dt><dd id="profile-email"></dd></div>
              <div><dt>邮箱状态</dt><dd id="profile-email-status"></dd></div>
              <div><dt>注册时间</dt><dd id="profile-created"></dd></div>
            </dl>
            <form id="profile-form" class="profile-form">
              <label class="field">昵称<input id="profile-name" name="displayName" required autocomplete="nickname"></label>
              <button class="icon-button save-button" type="submit" title="保存昵称" aria-label="保存昵称"><i data-lucide="save" aria-hidden="true"></i></button>
            </form>
            <p id="profile-error" class="form-error" role="alert" hidden></p>
          </section>
          <section id="security-section" class="account-section" role="tabpanel" aria-labelledby="account-security-tab" hidden>
            <h2>账户安全</h2>
            <form id="password-form" novalidate>
              <label class="field">当前密码<input id="current-password" name="currentPassword" type="password" autocomplete="current-password" required></label>
              <p id="new-password-help" class="field-help">新密码需要6–16个字符，至少3个不同字符，避免常见弱密码，且不能与当前密码相同。</p>
              <label class="field">新密码<input id="new-password" name="newPassword" type="password" autocomplete="new-password" required aria-describedby="new-password-help" placeholder="6–16个字符"></label>
              <label class="field">确认新密码<input id="confirm-new-password" name="confirmNewPassword" type="password" autocomplete="new-password" required></label>
              <p id="password-error" class="form-error" role="alert" hidden></p>
              <button class="button secondary" type="submit"><i data-lucide="key-round" aria-hidden="true"></i>修改密码</button>
            </form>
            <div class="session-actions">
              <button id="logout-all" class="button secondary"><i data-lucide="log-out" aria-hidden="true"></i>退出所有设备</button>
            </div>
          </section>
          <section id="cloud-section" class="account-section" role="tabpanel" aria-labelledby="account-cloud-tab" hidden>
            <div class="section-heading"><h2 id="cloud-title">AI 服务</h2><button id="refresh-cloud" class="icon-button" type="button" title="刷新 AI 服务状态" aria-label="刷新 AI 服务状态"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
            <p class="transport-warning" data-transport-warning role="status" hidden><i data-lucide="shield-alert" aria-hidden="true"></i><span>当前连接未加密，请通过 HTTPS 访问后再填写或更新 API 密钥。</span></p>
            <p id="cloud-state" class="muted" role="status"></p><p id="cloud-error" class="form-error" role="alert" hidden></p>
            <div class="cloud-call-preference">
              <label class="check-field"><input id="skip-cloud-confirmation" type="checkbox" aria-describedby="cloud-confirmation-help">本次登录不再提示云端调用</label>
              <p id="cloud-confirmation-help" class="field-help">仅跳过调用前的费用提示，重新登录后恢复。关闭提示不影响供应商计费。</p>
            </div>
            <div class="cloud-categories" role="tablist" aria-label="AI服务分类">
              <button id="cloud-text-tab" type="button" role="tab" aria-selected="true" aria-controls="cloud-text-panel"><i data-lucide="messages-square" aria-hidden="true"></i>文字AI</button>
              <button id="cloud-speech-tab" type="button" role="tab" aria-selected="false" aria-controls="cloud-speech-panel" tabindex="-1"><i data-lucide="audio-lines" aria-hidden="true"></i>语音识别</button>
            </div>
            <div id="cloud-providers" class="cloud-providers">
              <div id="cloud-text-panel" role="tabpanel" aria-labelledby="cloud-text-tab"><div id="cloud-text-providers" class="cloud-provider-grid"></div></div>
              <div id="cloud-speech-panel" role="tabpanel" aria-labelledby="cloud-speech-tab" hidden><div id="cloud-speech-providers" class="cloud-provider-grid"></div></div>
            </div>
          </section>
          <section id="account-danger-section" class="account-section danger-section" hidden>
            <h2>注销账号</h2>
            <p class="muted">注销后无法恢复，素材和文件将被清理，用户名和邮箱将保留占用。</p>
            <button id="open-delete-dialog" class="button danger-outline"><i data-lucide="trash-2" aria-hidden="true"></i>注销账号</button>
          </section>
        </div>
      </div>
      </div>
</template>
