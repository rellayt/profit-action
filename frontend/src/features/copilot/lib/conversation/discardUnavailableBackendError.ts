/**
 * Offline-first demo: persistence failures must not break the chat UX.
 * Local conversation state remains the working copy (ADR-002).
 * Log so API/network regressions stay visible in the console.
 */
export function discardUnavailableBackendError(error: unknown): void {
  console.warn('[conversations] backend sync failed; keeping local copy', error);
}
