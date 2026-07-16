export function createConversationId(): string {
  const time = Date.now().toString(36).slice(-4);
  const rand = Math.random().toString(36).slice(2, 8);
  return `c_${time}${rand}`;
}

export const DEFAULT_CONVERSATION_TITLE = 'Nowa rozmowa';

export function titleFromQuestion(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, ' ');
  return trimmed.slice(0, 72) || DEFAULT_CONVERSATION_TITLE;
}
