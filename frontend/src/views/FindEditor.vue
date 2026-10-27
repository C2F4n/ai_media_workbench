<template>
<section id="find-section" class="find-section" hidden aria-labelledby="find-title">
          <div class="section-heading"><h2 id="find-title">找片段</h2><button id="refresh-find" class="icon-button" type="button" title="刷新字幕版本" aria-label="刷新字幕版本"><i data-lucide="refresh-cw" aria-hidden="true"></i></button></div>
          <p id="find-source" class="result-filename">未选择就绪素材</p>
          <form id="find-form">
            <fieldset class="find-modes"><legend class="sr-only">查找方式</legend><label><input type="radio" name="find-mode" value="search" checked><span>按内容查找</span></label><label><input type="radio" name="find-mode" value="recommend"><span>片段建议</span></label></fieldset>
            <label class="field">目标内容<textarea id="find-query" rows="2" maxlength="1000" required placeholder="产品使用限制"></textarea></label>
            <div class="find-options"><label class="field">最多结果<input id="find-limit" type="number" min="1" max="20" step="1" value="10" required></label><label id="find-budget-field" class="field" hidden>建议总时长（秒）<input id="find-budget" type="number" min="1" max="900" step="1" value="60"></label></div>
            <p id="find-state" class="muted" role="status"></p><p id="find-error" class="form-error" role="alert" hidden></p>
            <button id="find-submit" class="button primary" type="submit"><i data-lucide="search" aria-hidden="true"></i><span id="find-submit-label">查找片段</span></button>
          </form>
          <p id="find-result-state" class="muted" role="status" hidden></p>
          <div id="find-preview-section" hidden><div class="section-heading"><h3>片段预览</h3><span id="find-preview-range" class="muted"></span></div><video id="find-preview" controls preload="metadata" aria-label="片段预览"></video><p id="find-preview-error" class="form-error" role="alert" hidden></p></div>
          <div id="find-results-view"></div>
        </section>
</template>
