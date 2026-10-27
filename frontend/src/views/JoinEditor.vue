<template>
<section id="join-section" class="join-section" hidden aria-labelledby="join-title">
          <div class="section-heading"><h2 id="join-title">片段拼接</h2><button id="refresh-join" class="icon-button" type="button" title="恢复最近拼接方案" aria-label="恢复最近拼接方案"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
          <p id="join-source" class="result-filename">未选择就绪素材</p>
          <form id="join-form"><ol id="join-clips" class="join-clips"></ol>
            <div class="join-actions"><button id="add-join-clip" class="icon-button" type="button" title="添加片段" aria-label="添加片段"><i data-lucide="plus" aria-hidden="true"></i></button><span id="join-total" class="muted" role="status"></span></div>
            <p id="join-state" class="muted" role="status"></p><p id="join-range-error" class="form-error" role="status" hidden>每段至少0.5秒且不能超出素材，最多20段、总时长最多15分钟。</p><p id="join-error" class="form-error" role="alert" hidden></p>
            <button id="export-join" class="button primary" type="submit"><i data-lucide="film" aria-hidden="true"></i>导出拼接视频</button>
          </form>
          <video id="join-preview" controls preload="metadata" aria-label="拼接片段预览" hidden></video>
          <div id="join-result-slot"></div>
        </section>
</template>
