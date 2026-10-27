<template>
<section id="history-panel" hidden aria-label="处理记录与方案">
          <div class="history-tabs" role="tablist" aria-label="记录分类"><button id="history-tasks-tab" type="button" role="tab" aria-selected="true" aria-controls="history-tasks-slot">处理任务</button><button id="history-plans-tab" type="button" role="tab" aria-selected="false" aria-controls="history-plans-panel" tabindex="-1">保存的方案</button></div>
          <div id="history-tasks-slot" role="tabpanel" aria-labelledby="history-tasks-tab"></div>
          <section id="history-plans-panel" role="tabpanel" aria-labelledby="history-plans-tab" hidden>
            <div class="section-heading"><h2>保存的方案</h2><button id="refresh-plans" class="icon-button" type="button" title="刷新方案" aria-label="刷新方案"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
            <p id="plan-list-error" class="form-error" role="alert" hidden></p><p id="plan-list-empty" class="empty-state">暂无保存的方案</p><ul id="plan-list" class="media-list"></ul>
            <div class="pagination"><span id="plan-total" class="muted">0 个方案</span><button id="plan-prev" class="icon-button" type="button" title="上一页方案" aria-label="上一页方案" disabled><i data-lucide="chevron-left" aria-hidden="true"></i></button><span id="plan-page">1</span><button id="plan-next" class="icon-button" type="button" title="下一页方案" aria-label="下一页方案" disabled><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>
          </section>
        </section>
</template>
