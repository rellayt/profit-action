import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uvicornDevArgs } from './uvicorn-dev-args.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const venvPython =
  process.platform === 'win32'
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python');
const python = existsSync(venvPython)
  ? venvPython
  : process.platform === 'win32'
    ? 'python'
    : 'python3';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let shuttingDown = false;

function killChild(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32' && child.pid) {
    spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: true,
    });
    return;
  }

  child.kill('SIGTERM');
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    killChild(child);
  }

  setTimeout(() => process.exit(exitCode), 500).unref();
}

function startProcess(label, command, args, cwd, { useShell = false } = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: useShell,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown || signal) {
      return;
    }
    console.error(`\n[${label}] zakończony (kod ${code ?? 0}).`);
    shutdown(code ?? 1);
  });

  children.push(child);
  return child;
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const backendReload =
  process.env.PA_BACKEND_RELOAD === '0' ? 'wyłączony (PA_BACKEND_RELOAD=0)' : 'tylko backend/app';

console.log('Profit Action — dev');
console.log('  Backend  → http://127.0.0.1:8000');
console.log('  Frontend → http://localhost:5173 (Vite HMR)');
console.log(`  Reload   → backend: ${backendReload}, frontend: hot reload`);
console.log('Ctrl+C aby zatrzymać oba serwisy.\n');

startProcess('backend', python, uvicornDevArgs(), backendDir);
startProcess('frontend', npm, ['run', 'dev'], frontendDir, { useShell: process.platform === 'win32' });
