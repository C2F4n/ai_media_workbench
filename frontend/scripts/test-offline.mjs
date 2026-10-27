import fs from 'node:fs';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const live = new Set(['auth.spec.js', 'workbench.spec.js', 'cloud-credentials.spec.js', 'registration-closed.spec.js']);
const specs = fs.readdirSync(new URL('../tests/', import.meta.url)).filter(name => name.endsWith('.spec.js') && !live.has(name)).map(name => 'tests/' + name);
const result = spawnSync(process.execPath, [require.resolve('@playwright/test/cli'), 'test', ...specs, ...process.argv.slice(2)], { stdio: 'inherit', cwd: new URL('../', import.meta.url), windowsHide: true });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
