import { matchPath } from 'react-router-dom';

export function matchCopilotConversationId(pathname: string): string | null {
  return matchPath('/copilot/c/:conversationId', pathname)?.params.conversationId ?? null;
}

export function isCopilotDraftRoute(pathname: string): boolean {
  return pathname === '/copilot' || pathname === '/copilot/';
}
