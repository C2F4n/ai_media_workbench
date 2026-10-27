<template>
<section id="conversion-section" class="conversion-section" hidden aria-labelledby="conversion-title">
          <h2 id="conversion-title">视频转换</h2>
          <div id="conversion-layout" class="conversion-layout">
            <form id="conversion-form">
              <label class="field">当前素材<output id="conversion-source" class="conversion-source">未选择就绪素材</output></label>
              <div id="processing-fields" class="conversion-fields"><label class="field">输出<output id="processing-format">MP4 · H.264</output></label><label id="resolution-field" class="field">分辨率<select id="conversion-resolution"><option value="source">原分辨率</option><option value="360p">360p</option><option value="480p">480p</option><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="2160p">2160p</option><option value="custom">自定义</option></select></label><label class="field">音轨<output id="processing-audio-mode">保留音轨</output></label></div>
              <div class="export-settings">
                <div class="conversion-fields">
                  <label id="export-format-field" class="field">视频格式<select id="export-format"><option value="mp4">MP4</option><option value="mkv">MKV</option><option value="mov">MOV</option><option value="webm">WebM</option></select></label>
                  <label id="export-codec-field" class="field">视频编码<select id="export-codec"><option value="h264">H.264</option><option value="hevc">H.265 / HEVC</option><option value="vp9">VP9</option><option value="av1">AV1</option></select></label>
                  <label id="export-audio-format-field" class="field" hidden>音频格式<select id="export-audio-format"><option value="mp3">MP3</option><option value="m4a">M4A / AAC</option><option value="wav">WAV / PCM</option><option value="flac">FLAC</option></select></label>
                </div>
                <div id="export-custom-fields" class="conversion-fields" hidden><label class="field">最大宽度<input id="export-width" type="number" min="2" max="4096" step="1" value="1920"></label><label class="field">最大高度<input id="export-height" type="number" min="2" max="4096" step="1" value="1080"></label></div>
                <label id="export-combine-field" class="checkbox-field"><input id="export-combine" type="checkbox">组合处理</label>
                <div id="export-combination" class="export-combination" hidden>
                  <label class="checkbox-field"><input id="export-trim" type="checkbox">裁切</label><label class="checkbox-field"><input id="export-compress" type="checkbox">目标体积压缩</label><label class="checkbox-field"><input id="export-mute" type="checkbox">静音</label><label class="checkbox-field"><input id="export-extract" type="checkbox">另存原始音轨 MP3</label>
                </div>
              </div>
              <label id="compression-target-field" class="field compression-target-field" hidden>目标体积（MB）<input id="compression-target" type="number" min="0.03125" step="any" inputmode="decimal"></label>
              <div id="trim-fields" class="conversion-fields trim" hidden><label class="field">开始时间（秒）<input id="trim-start" type="number" min="0" step="0.001" inputmode="decimal"></label><label class="field">结束时间（秒）<input id="trim-end" type="number" min="0.5" step="0.001" inputmode="decimal"></label></div>
              <p id="trim-range-error" class="form-error" role="status" hidden>区间需至少0.5秒，且不超过素材时长。</p>
              <p id="compression-small" class="form-error" role="status" hidden>当前素材体积过小，无法进行目标体积压缩。</p>
              <p id="audio-missing" class="form-error" role="status" hidden>当前素材没有可提取的音轨。</p>
              <p id="conversion-error" class="form-error" role="alert" hidden></p>
              <p id="export-plan-state" class="muted" role="status"></p>
              <div class="export-actions"><button id="start-conversion" class="button primary" type="submit" disabled><i data-lucide="play" aria-hidden="true"></i><span id="start-processing-label">开始转换</span></button><button id="save-export-plan" class="icon-button" type="button" title="保存导出方案" aria-label="保存导出方案"><i data-lucide="save" aria-hidden="true"></i></button><button id="restore-export-plan" class="icon-button" type="button" title="恢复最近导出方案" aria-label="恢复最近导出方案"><i data-lucide="rotate-ccw" aria-hidden="true"></i></button></div>
            </form>
            <div id="conversion-result" hidden aria-live="polite">
              <div class="section-heading"><h2>处理结果</h2><span id="task-status" class="media-status"></span></div>
              <p id="task-stage" class="muted"></p><p id="compression-stats" class="muted" hidden></p><p id="task-error" class="form-error" role="alert" hidden></p>
              <label id="output-selector-field" class="field" hidden>结果文件<select id="output-selector"></select></label><p id="output-preview-status" class="muted" role="status" hidden></p>
              <video id="output-preview" controls preload="metadata" hidden></video>
              <audio id="output-audio" controls preload="metadata" hidden></audio><p id="audio-stats" class="muted" hidden></p>
              <p id="output-empty" class="muted" role="status" hidden>暂无可用结果</p>
              <div class="conversion-actions"><button id="cancel-task" class="button secondary compact" type="button" hidden><i data-lucide="square" aria-hidden="true"></i>取消任务</button><a id="download-output" class="button primary compact" hidden><i data-lucide="download" aria-hidden="true"></i><span id="download-label">下载 MP4</span></a><button id="delete-output" class="icon-button danger-outline" type="button" title="删除结果" aria-label="删除结果" hidden><i data-lucide="trash-2" aria-hidden="true"></i></button></div>
            </div>
          </div>
        </section>
</template>
