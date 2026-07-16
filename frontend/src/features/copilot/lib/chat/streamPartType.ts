export const StreamPartType = {
  Status: 'status',
  Analysis: 'analysis',
  Unsupported: 'unsupported',
} as const;

export type StreamPartType = (typeof StreamPartType)[keyof typeof StreamPartType];
