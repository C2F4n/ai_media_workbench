const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { parse: sfc } = require('@vue/compiler-sfc');
const { parse: template } = require('@vue/compiler-dom');

const root = path.resolve(__dirname, '../src');
function files(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]); }

test('application code is typed and the HTML shell has one bundled application entry', () => {
  const source = files(root);
  expect(source.filter(file => /\.(?:js|jsx)$/.test(file))).toEqual([]);
  for (const file of source.filter(file => /\.(?:ts|vue)$/.test(file))) {
    const text = fs.readFileSync(file, 'utf8');
    expect(text, file).not.toMatch(/@ts-(?:ignore|nocheck|expect-error)/);
    const descriptor = file.endsWith('.vue') ? sfc(text).descriptor : null;
    const code = descriptor ? [descriptor.script, descriptor.scriptSetup].filter(Boolean).map(script => { expect(script.lang, file).toBe('ts'); return script.content; }).join('\n') : text;
    const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
    const unsafe = [];
    function check(node) { if (node.kind === ts.SyntaxKind.AnyKeyword) unsafe.push(node.pos); ts.forEachChild(node, check); }
    check(ast);
    expect(unsafe, file).toEqual([]);
  }
  const html = fs.readFileSync(path.resolve(__dirname, '../../src/main/resources/static/index.html'), 'utf8');
  expect(html).toContain('id="app"'); expect(html).toContain('/assets/ui/components.js');
  expect(html).not.toContain('/assets/app.js'); expect(html).not.toMatch(/<script[^>]+https?:/);
  expect(fs.existsSync(path.resolve(__dirname, '../../src/main/resources/static/assets/app.js'))).toBe(false);
});

test('typed coordinator references existing component IDs and does not overwrite Vue-owned editor lists', () => {
  const ids = new Set();
  for (const file of files(root).filter(file => file.endsWith('.vue'))) {
    const source = fs.readFileSync(file, 'utf8'), content = sfc(source).descriptor.template?.content;
    if (!content) continue;
    function visit(node) {
      if (node.type === 1) {
        const id = node.props.find(property => property.type === 6 && property.name === 'id')?.value?.content;
        if (id) { expect(ids.has(id), `Duplicate component ID: ${id}`).toBe(false); ids.add(id); }
      }
      for (const child of node.children || []) visit(child);
    }
    visit(template(content));
  }
  const coordinator = fs.readFileSync(path.join(root, 'runtime/workbench.ts'), 'utf8');
  for (const [, id] of coordinator.matchAll(/\$\('([^']+)'\)/g)) expect(ids.has(id), id).toBe(true);
  for (const id of ['media-list', 'task-list', 'plan-list', 'join-clips', 'workflow-steps', 'subtitle-segments', 'translation-segments', 'cloud-text-providers', 'cloud-speech-providers']) expect(coordinator).not.toContain(`$('${id}').replaceChildren`);
});
