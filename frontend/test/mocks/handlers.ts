import { http, HttpResponse } from 'msw';

import { sampleProduct } from './fixtures/product';

export const handlers = [
  http.get('/health', () => {
    return HttpResponse.json({
      status: 'ok',
      service: 'profit-action-backend',
      demoMode: true,
      openaiConfigured: false,
      liveAiAvailable: false,
    });
  }),
  http.get('/api/products', () => {
    return HttpResponse.json({
      items: [sampleProduct],
      total: 1,
      segmentCounts: {
        all: 1,
        stop_spending: 1,
        rescue: 0,
        scale: 0,
        neutral: 0,
      },
    });
  }),
  http.get('/api/conversations', () => {
    return HttpResponse.json([
      {
        id: 'c_demo1',
        title: 'Ujemny zysk',
        createdAt: 1,
        updatedAt: 2,
      },
    ]);
  }),
  http.get('/api/conversations/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Ujemny zysk',
      createdAt: 1,
      updatedAt: 2,
      messages: [
        { id: 'u1', role: 'user', content: 'Pokaż ujemny zysk' },
        { id: 'a1', role: 'assistant', content: 'Dopasowano 2 produkty.' },
      ],
      analysesById: {},
      messageAnalysisIds: {},
    });
  }),
  http.put('/api/conversations/:id', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...body, id: params.id });
  }),
  http.delete('/api/conversations/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
