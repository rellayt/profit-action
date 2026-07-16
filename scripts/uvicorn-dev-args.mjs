/**
 * Shared uvicorn dev arguments — reload only backend/app so edits to tests,
 * scripts, data, or egg-info do not restart the API during frontend work.
 *
 * Set PA_BACKEND_RELOAD=0 for a stable backend (no auto-reload).
 */
export function uvicornDevArgs() {
  const args = ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'];

  if (process.env.PA_BACKEND_RELOAD === '0') {
    return args;
  }

  args.push('--reload', '--reload-dir', 'app', '--reload-delay', '0.5');

  return args;
}
