export const healthQueryKeys = {
  all: ['health'] as const,
  detail: () => [...healthQueryKeys.all] as const,
};

export const productQueryKeys = {
  all: ['products'] as const,
  list: () => [...productQueryKeys.all, 'list'] as const,
};

export const conversationQueryKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...conversationQueryKeys.all, 'detail', id] as const,
};
