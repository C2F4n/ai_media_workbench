<template>
<section id="phase-export" class="phase-panel" role="tabpanel" aria-labelledby="phase-export-tab" hidden>
          <div class="phase-heading"><div><p class="eyebrow">输出</p><h2>导出结果</h2></div><div class="phase-export-actions"><a id="export-srt" class="button primary compact" hidden><i data-lucide="download" aria-hidden="true"></i>下载 SRT</a><button id="back-to-editing" class="button secondary compact" type="button"><i data-lucide="arrow-left" aria-hidden="true"></i>返回编辑</button></div></div>
          <div id="export-result-slot"></div>
          <div id="export-result-empty" class="export-result-empty"><i data-lucide="film" aria-hidden="true"></i><h3 id="export-empty-title">暂无导出结果</h3><span id="export-result-summary" class="muted">尚未生成文件</span></div>
        </section>
</template>
