import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const specPath = fileURLToPath(new URL('../../docs/api/openapi.json', import.meta.url));
const target = fileURLToPath(new URL('../src/api/contracts.ts', import.meta.url));
const schemas = JSON.parse(fs.readFileSync(specPath, 'utf8')).components.schemas;
function schema(value) {
  if (!value) return 'unknown';
  let type;
  if (value.$ref) type = value.$ref.split('/').at(-1);
  else if (value.enum) type = value.enum.map(item => JSON.stringify(item)).join(' | ');
  else if (value.oneOf || value.anyOf) type = (value.oneOf || value.anyOf).map(item => '(' + schema(item) + ')').join(' | ');
  else if (value.allOf) type = value.allOf.map(item => '(' + schema(item) + ')').join(' & ');
  else if (value.type === 'array') type = '(' + schema(value.items) + ')[]';
  else if (value.type === 'integer' || value.type === 'number') type = 'number';
  else if (value.type === 'boolean') type = 'boolean';
  else if (value.type === 'string') type = 'string';
  else if (value.properties) type = '{\n' + Object.entries(value.properties).map(([name, item]) => '  ' + JSON.stringify(name) + (value.required?.includes(name) ? '' : '?') + ': ' + schema(item) + ';').join('\n') + '\n}';
  else if (value.type === 'object') type = 'Record<string, unknown>';
  else type = 'unknown';
  return value.nullable ? '(' + type + ') | null' : type;
}
const output = '// Generated from docs/api/openapi.json; do not edit response DTOs independently.\n' + Object.entries(schemas).map(([name, value]) => 'export type ' + name + ' = ' + schema(value) + ';\n').join('\n');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== output) throw new Error('API contracts are stale. Run npm run generate:api in frontend.');
  process.stdout.write(`API contracts match ${Object.keys(schemas).length} OpenAPI schemas.\n`);
} else {
  fs.writeFileSync(target, output);
  process.stdout.write(`Generated ${Object.keys(schemas).length} API contracts.\n`);
}
