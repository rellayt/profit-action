import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const openapiPath = path.join(root, 'contracts', 'openapi.json');
const schemasPath = path.join(root, 'frontend', 'src', 'contracts', 'generated', 'schemas.ts');
const backendPython =
  process.platform === 'win32'
    ? path.join(root, 'backend', '.venv', 'Scripts', 'python.exe')
    : path.join(root, 'backend', '.venv', 'bin', 'python');
const python = existsSync(backendPython)
  ? backendPython
  : process.platform === 'win32'
    ? 'python'
    : 'python3';

function run(script) {
  const result = spawnSync(python, [path.join(root, 'scripts', script)], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readOptional(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
}

const mode = process.argv[2] ?? 'generate';
if (mode === 'export') {
  run('export_openapi.py');
} else if (mode === 'generate') {
  run('export_openapi.py');
  run('generate_zod_schemas.py');
} else if (mode === 'check') {
  const beforeOpenapi = readOptional(openapiPath);
  const beforeSchemas = readOptional(schemasPath);
  run('export_openapi.py');
  run('generate_zod_schemas.py');
  const afterOpenapi = readFileSync(openapiPath, 'utf8');
  const afterSchemas = readFileSync(schemasPath, 'utf8');
  if (beforeOpenapi !== afterOpenapi || beforeSchemas !== afterSchemas) {
    console.error('contracts drift detected — run npm run contracts:generate and commit outputs');
    process.exit(1);
  }
} else {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}
