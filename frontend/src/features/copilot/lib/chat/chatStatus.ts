export const ChatStatus = {
  Submitted: 'submitted',
  Streaming: 'streaming',
  Ready: 'ready',
  Error: 'error',
} as const;

export type ChatStatus = (typeof ChatStatus)[keyof typeof ChatStatus];

export function isChatBusy(status: ChatStatus): boolean {
  return status === ChatStatus.Streaming || status === ChatStatus.Submitted;
}
