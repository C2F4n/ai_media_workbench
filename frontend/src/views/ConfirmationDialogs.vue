<template>
<dialog id="action-confirm-dialog" data-kind="warning" aria-labelledby="action-confirm-title" aria-describedby="action-confirm-description">
    <div class="dialog-heading">
      <div class="dialog-title-group"><span id="action-confirm-icon" class="dialog-icon"><i data-lucide="triangle-alert" aria-hidden="true"></i></span><h2 id="action-confirm-title">确认操作</h2></div>
      <button id="close-action-confirm" class="icon-button" type="button" title="取消操作" aria-label="取消操作"><i data-lucide="x" aria-hidden="true"></i></button>
    </div>
    <p id="action-confirm-description" class="dialog-description"></p>
    <div class="dialog-actions">
      <button id="cancel-action-confirm" class="button secondary" type="button" autofocus>取消</button>
      <button id="accept-action-confirm" class="button primary" type="button"><i data-lucide="check" aria-hidden="true"></i><span>继续</span></button>
    </div>
  </dialog>

  <dialog id="cloud-confirm-dialog" aria-labelledby="cloud-confirm-title" aria-describedby="cloud-confirm-description cloud-confirm-fee">
    <div class="dialog-heading">
      <div class="cloud-confirm-heading"><span class="cloud-confirm-icon"><i data-lucide="cloud-upload" aria-hidden="true"></i></span><h2 id="cloud-confirm-title">确认调用云端服务</h2></div>
      <button id="close-cloud-confirm" class="icon-button" type="button" title="取消调用" aria-label="取消调用"><i data-lucide="x" aria-hidden="true"></i></button>
    </div>
    <p id="cloud-confirm-description" class="muted">本次操作将使用以下服务处理数据。</p>
    <dl class="cloud-confirm-details">
      <div><dt>服务商</dt><dd id="cloud-confirm-provider"></dd></div>
      <div><dt>发送内容</dt><dd id="cloud-confirm-content"></dd></div>
    </dl>
    <p id="cloud-confirm-detail" class="muted" hidden></p>
    <p id="cloud-confirm-fee" class="cloud-confirm-fee"><i data-lucide="badge-dollar-sign" aria-hidden="true"></i><span>可能产生服务费用，按供应商的计费规则结算。</span></p>
    <label id="cloud-confirm-skip-row" class="check-field"><input id="cloud-confirm-skip" type="checkbox">本次登录不再提示</label>
    <div class="dialog-actions">
      <button id="cancel-cloud-confirm" class="button secondary" type="button" autofocus>取消</button>
      <button id="accept-cloud-confirm" class="button primary" type="button"><i data-lucide="arrow-right" aria-hidden="true"></i><span>继续调用</span></button>
    </div>
  </dialog>

  <dialog id="delete-output-dialog" aria-labelledby="delete-output-title" aria-describedby="delete-output-description">
    <div class="dialog-heading"><div class="dialog-title-group"><span class="dialog-icon danger-icon"><i data-lucide="trash-2" aria-hidden="true"></i></span><h2 id="delete-output-title">删除结果</h2></div><button id="close-delete-output" class="icon-button" type="button" title="取消" aria-label="取消删除结果"><i data-lucide="x" aria-hidden="true"></i></button></div>
    <p id="delete-output-name" class="result-filename"></p>
    <p id="delete-output-description" class="muted">仅删除此结果文件，原素材、参数和处理记录保留。此操作不可恢复。</p>
    <form id="delete-output-form">
      <p id="delete-output-error" class="form-error" role="alert" hidden></p>
      <div class="dialog-actions"><button id="cancel-delete-output" class="button secondary" type="button">取消</button><button class="button danger" type="submit"><i data-lucide="trash-2" aria-hidden="true"></i>确认删除结果</button></div>
    </form>
  </dialog>

  <dialog id="delete-media-dialog" aria-labelledby="delete-media-title" aria-describedby="delete-media-description">
    <div class="dialog-heading"><div class="dialog-title-group"><span class="dialog-icon danger-icon"><i data-lucide="trash-2" aria-hidden="true"></i></span><h2 id="delete-media-title">删除素材</h2></div><button id="close-delete-media" class="icon-button" type="button" title="取消" aria-label="取消删除素材"><i data-lucide="x" aria-hidden="true"></i></button></div>
    <p id="delete-media-name" class="result-filename"></p>
    <p id="delete-media-description" class="muted">关联的处理记录和结果也会删除，正在进行的任务将停止。此操作不可恢复。</p>
    <form id="delete-media-form">
      <p id="delete-media-error" class="form-error" role="alert" hidden></p>
      <div class="dialog-actions"><button id="cancel-delete-media" class="button secondary" type="button">取消</button><button class="button danger" type="submit"><i data-lucide="trash-2" aria-hidden="true"></i>确认删除</button></div>
    </form>
  </dialog>

  <dialog id="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description">
    <div class="dialog-heading">
      <div class="dialog-title-group"><span class="dialog-icon danger-icon"><i data-lucide="user-round-x" aria-hidden="true"></i></span><h2 id="delete-title">确认注销账号</h2></div>
      <button id="close-delete-dialog" class="icon-button" type="button" title="取消" aria-label="取消"><i data-lucide="x" aria-hidden="true"></i></button>
    </div>
    <p id="delete-description" class="muted">所有设备将退出登录。账号与素材将无法访问，此操作不可恢复。</p>
    <form id="delete-form">
      <label class="field">当前密码<input id="delete-password" name="currentPassword" type="password" autocomplete="current-password" required></label>
      <label class="field">输入用户名以确认<input id="delete-username" name="confirmUsername" required autocomplete="off" spellcheck="false"></label>
      <p id="delete-error" class="form-error" role="alert" hidden></p>
      <div class="dialog-actions">
        <button id="cancel-delete" class="button secondary" type="button">取消</button>
        <button class="button danger" type="submit"><i data-lucide="trash-2" aria-hidden="true"></i>确认注销</button>
      </div>
    </form>
  </dialog>
</template>
