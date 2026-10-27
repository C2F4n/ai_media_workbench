<template>
<section id="ai-section" class="ai-section" hidden aria-labelledby="ai-title">
          <div class="section-heading"><h2 id="ai-title">AI 处理</h2><button id="refresh-ai-plan" class="icon-button" type="button" title="恢复最近方案" aria-label="恢复最近方案"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
          <div id="workflow-mode" class="workflow-mode" role="group" aria-label="方案输入方式" data-mode="text"><span class="workflow-mode-indicator" aria-hidden="true"></span><button id="workflow-text-mode" type="button" aria-pressed="true" aria-controls="ai-form"><i data-lucide="text-cursor-input" aria-hidden="true"></i>文字输入</button><button id="workflow-step-mode" type="button" aria-pressed="false" aria-controls="workflow-form"><i data-lucide="list-ordered" aria-hidden="true"></i>分步填写</button></div>
          <div class="ai-layout">
            <div id="workflow-viewport" class="workflow-viewport">
            <form id="ai-form">
              <label class="field">当前素材<output id="ai-source" class="conversion-source">未选择就绪素材</output></label>
              <label class="field">处理要求<textarea id="ai-instruction" rows="4" maxlength="4000" required placeholder="保留前5秒，转成360p并导出"></textarea></label>
              <p id="ai-model-warning" class="model-warning" hidden><i data-lucide="info" aria-hidden="true"></i><span>服务端使用轻量模型，理解能力有限，复杂要求可能解析不准确，请核对方案后再执行。</span></p>
              <p id="ai-state" class="muted" role="status"></p><p id="ai-error" class="form-error" role="alert" hidden></p>
              <button id="generate-ai-plan" class="button primary" type="submit"><i data-lucide="sparkles" aria-hidden="true"></i><span id="generate-ai-label">生成方案</span></button>
            </form>
            <form id="workflow-form" hidden inert>
              <label class="field">当前素材<output id="workflow-source" class="conversion-source">未选择就绪素材</output></label>
              <ol id="workflow-steps" class="workflow-steps"></ol>
              <button id="workflow-add" class="button secondary compact" type="button"><i data-lucide="plus" aria-hidden="true"></i>添加步骤</button>
              <h3 class="workflow-export-heading">最终导出</h3>
              <div class="conversion-fields"><label class="field">格式<select id="workflow-format"><option value="mp4">MP4</option><option value="mov">MOV</option><option value="mkv">MKV</option><option value="webm">WebM</option><option value="mp3">MP3</option><option value="m4a">M4A</option><option value="wav">WAV</option><option value="flac">FLAC</option></select></label><label id="workflow-codec-field" class="field">视频编码<select id="workflow-codec"><option value="h264">H.264</option><option value="hevc">H.265 / HEVC</option><option value="vp9">VP9</option><option value="av1">AV1</option></select></label></div>
              <label id="workflow-size-field" class="field">目标体积（MB，可留空）<input id="workflow-size" type="number" min="0.03125" step="any" inputmode="decimal"></label>
              <label id="workflow-audio-field" class="checkbox-field"><input id="workflow-audio" type="checkbox">另存完整原始音轨 MP3</label>
              <p id="workflow-state" class="muted" role="status"></p><p id="workflow-error" class="form-error" role="alert" hidden></p>
              <button id="workflow-save" class="button primary" type="submit"><i data-lucide="list-checks" aria-hidden="true"></i>生成方案</button>
            </form>
            </div>
            <div id="ai-plan" hidden>
              <div class="section-heading"><h3>处理方案</h3><span id="ai-plan-status" class="media-status"></span></div>
              <p id="ai-plan-summary" class="result-filename"></p><div id="ai-plan-details"></div>
              <button id="workflow-edit" class="icon-button" type="button" title="编辑步骤" aria-label="编辑步骤" hidden><i data-lucide="list-ordered" aria-hidden="true"></i></button>
              <button id="execute-ai-plan" class="button primary" type="button"><i data-lucide="play" aria-hidden="true"></i>确认执行</button>
            </div>
          </div>
          <div id="ai-result-slot"></div>
        </section>
</template>
