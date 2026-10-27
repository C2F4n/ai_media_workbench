<template>
<section id="subtitle-section" class="subtitle-section" hidden aria-labelledby="subtitle-title">
          <div class="section-heading"><h2 id="subtitle-title">字幕处理</h2><button id="refresh-subtitle" class="icon-button" type="button" title="刷新字幕" aria-label="刷新字幕"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
          <p id="subtitle-source" class="result-filename">未选择就绪素材</p>
          <div class="subtitle-toolbar"><label class="field">识别服务<select id="asr-provider"><option value="tencent">腾讯云</option><option value="aliyun">阿里云百炼</option></select></label><label class="field asr-model-field">语音识别模型<select id="asr-model" aria-describedby="asr-model-note"></select></label><button id="start-transcription" class="button primary" type="button"><i data-lucide="captions" aria-hidden="true"></i><span id="transcription-label">识别字幕</span></button><button id="cancel-transcription" class="button secondary compact" type="button" hidden><i data-lucide="square" aria-hidden="true"></i>取消识别</button></div>
          <p id="asr-model-note" class="muted asr-model-note" hidden></p>
          <p id="subtitle-state" class="muted" role="status"></p><p id="subtitle-error" class="form-error" role="alert" hidden></p>
          <div id="subtitle-editor" hidden>
            <div class="subtitle-toolbar"><label class="field">版本<select id="subtitle-version"></select></label><label class="checkbox-field"><input id="subtitle-original" type="checkbox">识别原文</label><span id="subtitle-draft-state" class="muted" role="status"></span><button id="save-subtitle" class="icon-button save-button" type="button" title="保存字幕" aria-label="保存字幕"><i data-lucide="save" aria-hidden="true"></i></button><a id="download-srt" class="button secondary compact"><i data-lucide="download" aria-hidden="true"></i>下载 SRT</a></div>
            <div class="subtitle-toolbar translation-toolbar"><label class="field">翻译目标语言<select id="translation-language"><option value="en">英语</option><option value="zh-CN">简体中文</option><option value="zh-TW">繁体中文</option><option value="ja">日语</option><option value="ko">韩语</option><option value="fr">法语</option><option value="de">德语</option><option value="es">西班牙语</option><option value="ru">俄语</option><option value="pt">葡萄牙语</option></select></label><button id="translate-subtitle" class="button secondary compact" type="button"><i data-lucide="languages" aria-hidden="true"></i>翻译字幕</button><button id="cancel-translation" class="icon-button" type="button" title="停止后续翻译，已发出的请求仍可能计费" aria-label="停止翻译" hidden><i data-lucide="square" aria-hidden="true"></i></button><span id="translation-state" class="muted" role="status"></span></div>
            <section id="translation-preview" class="translation-preview" aria-labelledby="translation-title" hidden>
              <div class="section-heading"><h3 id="translation-title">翻译预览</h3><button id="discard-translation" class="icon-button danger-outline" type="button" title="放弃译文" aria-label="放弃译文"><i data-lucide="trash-2" aria-hidden="true"></i></button></div>
              <div class="subtitle-toolbar"><label class="field">字幕内容<select id="translation-layout"><option value="bilingual">双语 · 原文在上</option><option value="translated">仅译文</option></select></label><button id="save-translation" class="button primary compact" type="button"><i data-lucide="save" aria-hidden="true"></i>保存为新版本</button></div>
              <ol id="translation-segments" class="translation-segments"></ol>
            </section>
            <ol id="subtitle-segments" class="subtitle-segments"></ol>
            <button id="burn-subtitle" class="button primary" type="button"><i data-lucide="film" aria-hidden="true"></i>生成字幕视频</button>
          </div>
          <div id="subtitle-result-slot" hidden></div>
        </section>
</template>
