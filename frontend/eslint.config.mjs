import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['node_modules/**', 'test-results*/**', 'playwright-report/**', 'coverage/**', 'src/api/contracts.ts'] },
  js.configs.recommended,
  ...ts.configs.recommended.map(config => ({ ...config, files: ['**/*.ts', '**/*.mts', '**/*.vue'] })),
  ...vue.configs['flat/essential'],
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser, parserOptions: { parser: ts.parser } },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-inferrable-types': 'error',
      'simple-import-sort/imports': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'vue/no-unused-refs': 'error',
      'vue/no-unused-vars': 'error',
      // 编辑器共享父级创建的响应式草稿；允许改内容，禁止替换传入的 prop 引用。
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
      'vue/no-setup-props-reactivity-loss': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart']
    }
  },
  {
    files: ['src/**/*.vue'],
    // ESLint 核心规则不了解模板引用；SFC 的未使用变量由 vue-tsc 检查。
    rules: { 'no-useless-assignment': 'off' }
  },
  {
    files: ['scripts/**/*.mjs', '*.{js,mjs,mts}', 'tests/**/*.{js,cjs}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  }
);
