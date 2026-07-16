import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useCallback, useEffect } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestQueryClient } from '../../../../test/renderWithProviders';
import { server } from '../../../../test/mocks/server';
import { copilotTheme } from '../../../design/mantine-theme';
import { useDeferredChatApply } from '../hooks/session/useDeferredChatApply';
import { AppLayout } from '../layout/AppLayout';
import { DRAFT_CHAT_SESSION_ID } from '../lib/chat/copilotConstants';
import { PA_STORAGE_KEYS } from '../lib/storage/localStorageKeys';
import { CopilotWorkspacePage } from '../pages/CopilotWorkspacePage';
import type { AnalysisResult } from '../types/api';
import { AnalysisPlanSchema } from '../../../contracts/generated/schemas';
import type { ConversationDetail } from '../types/conversation';
import type { ChatStatus } from '../lib/chat/chatStatus';
import { CopilotWorkspaceProvider } from './CopilotWorkspaceProvider';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

const chatMock = vi.hoisted(() => {
  const sessions = new Map<
    string,
    {
      messages: ChatMessage[];
      setMessages: (messages: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => void;
      data: unknown[];
      setData: (data: unknown[]) => void;
      status: ChatStatus;
      setStatus: (status: ChatStatus) => void;
    }
  >();

  return {
    sessions,
    reset() {
      sessions.clear();
    },
    get(id: string) {
      return sessions.get(id);
    },
  };
});

vi.mock('@ai-sdk/react', async () => {
  const React = await import('react');

  return {
    useChat: ({ id }: { id: string }) => {
      const [messages, setMessages] = React.useState<ChatMessage[]>([]);
      const [data, setData] = React.useState<unknown[]>([]);
      const [status, setStatus] = React.useState<ChatStatus>('ready');

      useEffect(() => {
        chatMock.sessions.set(id, {
          messages,
          setMessages,
          data,
          setData,
          status,
          setStatus,
        });
      }, [id, messages, data, status]);

      const reload = useCallback(async () => {
        setStatus('submitted');
        setMessages((current) => [
          ...current,
          {
            id: `a_${current.length}`,
            role: 'assistant',
            content: 'Odpowiedź testowa.',
          },
        ]);
        setStatus('ready');
      }, []);

      return {
        messages,
        setMessages,
        data,
        setData,
        status,
        reload,
        stop: () => undefined,
      };
    },
  };
});

function sampleAnalysis(analysisId: string): AnalysisResult {
  return {
    analysisId,
    operation: 'list',
    periodDays: 30,
    answerText: 'Dopasowano 1 produkt.',
    criteriaSummary: 'profit < 0',
    showChart: true,
    showCta: true,
    plan: AnalysisPlanSchema.parse({}),
    summary: { productsAnalyzed: 1, matchedProducts: 1 },
    kpis: [],
    topProducts: [],
    matchedProductIds: ['p1'],
    matchedProducts: [
      {
        id: 'p1',
        name: 'Produkt test',
        spend: 10,
        revenue: 0,
        profit: -5,
        stock: 1,
        margin: -50,
        segment: 'stop_spending',
        matchReason: 'loss',
      },
    ],
    groupRows: [],
    aggregations: [],
    chartPoints: [],
    chartCaption: '',
  };
}

function seedLocalConversations(details: ConversationDetail[]) {
  localStorage.setItem(
    PA_STORAGE_KEYS.conversations,
    JSON.stringify({
      conversations: details.map((detail) => ({
        id: detail.id,
        title: detail.title,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
      })),
      detailsById: Object.fromEntries(details.map((detail) => [detail.id, detail])),
    }),
  );
}

function seedLocalConversation(detail: ConversationDetail) {
  seedLocalConversations([detail]);
}

function detailFixture(
  id: string,
  title: string,
  messages: ConversationDetail['messages'],
  updatedAt = 2,
): ConversationDetail {
  return {
    id,
    title,
    createdAt: 1,
    updatedAt,
    messages,
    analysesById: {},
    messageAnalysisIds: {},
  };
}

function renderApp(route: string) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            element: <CopilotWorkspaceProvider />,
            children: [
              { path: 'copilot', element: <CopilotWorkspacePage /> },
              { path: 'copilot/c/:conversationId', element: <CopilotWorkspacePage /> },
            ],
          },
          { path: 'products', element: <div>Products page</div> },
        ],
      },
    ],
    { initialEntries: [route] },
  );

  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={copilotTheme} defaultColorScheme="dark">
          <RouterProvider router={router} />
        </MantineProvider>
      </QueryClientProvider>,
    ),
  };
}

describe('copilot session orchestration', () => {
  beforeEach(() => {
    localStorage.clear();
    chatMock.reset();
  });

  it('draft submit creates conversation, upserts, and keeps local messages', async () => {
    const user = userEvent.setup();
    let upsertedId: string | null = null;

    server.use(
      http.put('/api/conversations/:id', async ({ request, params }) => {
        upsertedId = String(params.id);
        const body = (await request.json()) as ConversationDetail;
        return HttpResponse.json({ ...body, id: params.id });
      }),
    );

    const { router } = renderApp('/copilot');

    const composer = await screen.findByPlaceholderText(/zapytaj o przepalony/i);
    await user.type(composer, 'Pokaż ujemny zysk');
    await user.click(screen.getByRole('button', { name: 'Wyślij wiadomość' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/copilot\/c\//);
    });
    await waitFor(() => expect(upsertedId).toBeTruthy());

    expect(screen.getAllByText('Pokaż ujemny zysk').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Odpowiedź testowa.')).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(PA_STORAGE_KEYS.conversations) ?? '{}') as {
      detailsById: Record<string, ConversationDetail>;
    };
    const detail = stored.detailsById[upsertedId!];
    expect(detail?.messages.some((item) => item.content === 'Pokaż ujemny zysk')).toBe(true);
  });

  it('opens existing conversation with local hydrate then remote merge', async () => {
    const localDetail: ConversationDetail = {
      id: 'c_local1',
      title: 'Lokalna',
      createdAt: 1,
      updatedAt: 5,
      messages: [{ id: 'lu1', role: 'user', content: 'Treść lokalna' }],
      analysesById: {},
      messageAnalysisIds: {},
    };
    seedLocalConversation(localDetail);

    server.use(
      http.get('/api/conversations/:id', ({ params }) => {
        return HttpResponse.json({
          id: params.id,
          title: 'Zdalna',
          createdAt: 1,
          updatedAt: 10,
          messages: [
            { id: 'ru1', role: 'user', content: 'Treść zdalna' },
            { id: 'ra1', role: 'assistant', content: 'Odpowiedź zdalna' },
          ],
          analysesById: {},
          messageAnalysisIds: {},
        });
      }),
    );

    renderApp('/copilot/c/c_local1');

    expect(await screen.findByText('Treść zdalna')).toBeInTheDocument();
    expect(screen.getByText('Odpowiedź zdalna')).toBeInTheDocument();
  });

  it('binds streamed analysis and opens insights for that turn', async () => {
    const user = userEvent.setup();
    renderApp('/copilot');

    const composer = await screen.findByPlaceholderText(/zapytaj o przepalony/i);
    await user.type(composer, 'Analiza');
    await user.click(screen.getByRole('button', { name: 'Wyślij wiadomość' }));

    await waitFor(() => {
      expect(screen.getByText('Odpowiedź testowa.')).toBeInTheDocument();
    });

    const session = chatMock.get(DRAFT_CHAT_SESSION_ID);
    expect(session).toBeTruthy();

    await act(async () => {
      session!.setData([
        {
          type: 'analysis',
          analysis: sampleAnalysis('an_stream_1'),
        },
      ]);
    });

    const openInsights = await screen.findByRole('button', { name: /zobacz analizę/i });
    await user.click(openInsights);

    expect(await screen.findByText('Przegląd analizy')).toBeInTheDocument();
  });

  it('deletes active conversation and returns to draft', async () => {
    const user = userEvent.setup();
    const detail: ConversationDetail = {
      id: 'c_del1',
      title: 'Do usunięcia',
      createdAt: 1,
      updatedAt: 2,
      messages: [
        { id: 'u1', role: 'user', content: 'Pytanie' },
        { id: 'a1', role: 'assistant', content: 'Odpowiedź' },
      ],
      analysesById: {},
      messageAnalysisIds: {},
    };
    seedLocalConversation(detail);

    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json([
          {
            id: detail.id,
            title: detail.title,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
          },
        ]);
      }),
      http.get('/api/conversations/:id', () => HttpResponse.json(detail)),
    );

    const { router } = renderApp('/copilot/c/c_del1');

    expect(await screen.findByText('Pytanie')).toBeInTheDocument();

    const historyItem = await screen.findByText('Do usunięcia');
    await user.pointer({ keys: '[MouseRight>]', target: historyItem });

    const deleteItem = await screen.findByRole('menuitem', { name: /usuń/i });
    await user.click(deleteItem);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/copilot');
    });

    const stored = JSON.parse(localStorage.getItem(PA_STORAGE_KEYS.conversations) ?? '{}') as {
      conversations: unknown[];
    };
    expect(stored.conversations ?? []).toHaveLength(0);
  });

  it('applies deferred chat session switch once after id change', async () => {
    const applied: string[] = [];
    const detail: ConversationDetail = {
      id: 'c_def1',
      title: 'Deferred',
      createdAt: 1,
      updatedAt: 1,
      messages: [{ id: 'm1', role: 'user', content: 'Hi' }],
      analysesById: {},
      messageAnalysisIds: {},
    };

    const { result } = renderHook(() =>
      useDeferredChatApply(DRAFT_CHAT_SESSION_ID, (pending) => {
        applied.push(pending.kind === 'conversation' ? pending.detail.id : pending.kind);
      }),
    );

    act(() => {
      result.current.switchToConversation(detail);
    });

    await waitFor(() => {
      expect(applied).toEqual(['c_def1']);
    });
    expect(result.current.chatSessionId).toBe('c_def1');

    act(() => {
      result.current.switchToDraft();
    });

    await waitFor(() => {
      expect(applied).toEqual(['c_def1', DRAFT_CHAT_SESSION_ID]);
    });
  });
});

describe('copilot session edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
    chatMock.reset();
  });

  it('keeps local conversation when remote detail 404s (no bounce to draft)', async () => {
    const local = detailFixture('c_offline', 'Offline cache', [
      { id: 'u1', role: 'user', content: 'Treść tylko lokalna' },
      { id: 'a1', role: 'assistant', content: 'Asystent lokalny' },
    ]);
    seedLocalConversation(local);

    server.use(
      http.get('/api/conversations/:id', () => {
        return HttpResponse.json({ detail: 'missing' }, { status: 404 });
      }),
    );

    const { router } = renderApp('/copilot/c/c_offline');

    expect(await screen.findByText('Treść tylko lokalna')).toBeInTheDocument();
    expect(screen.getByText('Asystent lokalny')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/copilot/c/c_offline');
  });

  it('redirects to draft when remote 404 and there is no local cache', async () => {
    server.use(
      http.get('/api/conversations/:id', () => {
        return HttpResponse.json({ detail: 'missing' }, { status: 404 });
      }),
    );

    const { router } = renderApp('/copilot/c/c_ghost');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/copilot');
    });
    expect(screen.queryByText('Treść tylko lokalna')).not.toBeInTheDocument();
  });

  it('discards a slow stale remote fetch after switching conversations', async () => {
    const slow = detailFixture('c_slow', 'Wolna', [
      { id: 'su1', role: 'user', content: 'Pytanie wolne' },
      { id: 'sa1', role: 'assistant', content: 'Odpowiedź wolna' },
    ]);
    const fast = detailFixture(
      'c_fast',
      'Szybka',
      [
        { id: 'fu1', role: 'user', content: 'Pytanie szybkie' },
        { id: 'fa1', role: 'assistant', content: 'Odpowiedź szybka' },
      ],
      3,
    );
    seedLocalConversations([slow, fast]);

    let slowRemoteResolved = false;
    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json([
          {
            id: slow.id,
            title: slow.title,
            createdAt: slow.createdAt,
            updatedAt: slow.updatedAt,
          },
          {
            id: fast.id,
            title: fast.title,
            createdAt: fast.createdAt,
            updatedAt: fast.updatedAt,
          },
        ]);
      }),
      http.get('/api/conversations/:id', async ({ params }) => {
        if (params.id === 'c_slow') {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 250);
          });
          slowRemoteResolved = true;
          return HttpResponse.json({
            ...slow,
            messages: [
              { id: 'su1', role: 'user', content: 'Pytanie wolne' },
              { id: 'sa1', role: 'assistant', content: 'Odpowiedź wolna ZDALNA' },
            ],
          });
        }
        return HttpResponse.json(fast);
      }),
    );

    const { router } = renderApp('/copilot/c/c_slow');
    expect(await screen.findByText('Pytanie wolne')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/copilot/c/c_fast');
    });

    expect(await screen.findByText('Pytanie szybkie')).toBeInTheDocument();
    expect(screen.getByText('Odpowiedź szybka')).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 350);
      });
    });

    expect(slowRemoteResolved).toBe(true);
    expect(screen.getByText('Pytanie szybkie')).toBeInTheDocument();
    expect(screen.queryByText('Odpowiedź wolna ZDALNA')).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/copilot/c/c_fast');
  });

  it('deleting a non-active history item keeps the open conversation', async () => {
    const user = userEvent.setup();
    const active = detailFixture('c_active', 'Aktywna', [
      { id: 'u1', role: 'user', content: 'Aktywne pytanie' },
      { id: 'a1', role: 'assistant', content: 'Aktywna odpowiedź' },
    ]);
    const other = detailFixture(
      'c_other',
      'Inna rozmowa',
      [{ id: 'u2', role: 'user', content: 'Inne pytanie' }],
      4,
    );
    seedLocalConversations([active, other]);

    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json([
          {
            id: active.id,
            title: active.title,
            createdAt: active.createdAt,
            updatedAt: active.updatedAt,
          },
          {
            id: other.id,
            title: other.title,
            createdAt: other.createdAt,
            updatedAt: other.updatedAt,
          },
        ]);
      }),
      http.get('/api/conversations/:id', ({ params }) => {
        const match = params.id === active.id ? active : other;
        return HttpResponse.json(match);
      }),
    );

    const { router } = renderApp('/copilot/c/c_active');
    expect(await screen.findByText('Aktywne pytanie')).toBeInTheDocument();

    const otherItem = await screen.findByText('Inna rozmowa');
    await user.pointer({ keys: '[MouseRight>]', target: otherItem });
    await user.click(await screen.findByRole('menuitem', { name: /usuń/i }));

    await waitFor(() => {
      expect(screen.queryByText('Inna rozmowa')).not.toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe('/copilot/c/c_active');
    expect(screen.getByText('Aktywne pytanie')).toBeInTheDocument();
    expect(screen.getByText('Aktywna odpowiedź')).toBeInTheDocument();
  });

  it('remount after Products does not wipe chat when draftResetNonce was previously bumped', async () => {
    const user = userEvent.setup();
    const saved = detailFixture('c_keep', 'Do zachowania', [
      { id: 'u1', role: 'user', content: 'Zachowane pytanie' },
      { id: 'a1', role: 'assistant', content: 'Zachowana odpowiedź' },
    ]);
    seedLocalConversation(saved);

    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json([
          {
            id: saved.id,
            title: saved.title,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
          },
        ]);
      }),
      http.get('/api/conversations/:id', () => HttpResponse.json(saved)),
    );

    const { router } = renderApp('/copilot');

    await user.click(screen.getByRole('button', { name: 'Profit Action' }));

    await act(async () => {
      await router.navigate('/copilot/c/c_keep');
    });
    expect(await screen.findByText('Zachowane pytanie')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/products');
    });
    expect(await screen.findByText('Products page')).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/copilot/c/c_keep');
    });

    expect(await screen.findByText('Zachowane pytanie')).toBeInTheDocument();
    expect(screen.getByText('Zachowana odpowiedź')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/copilot/c/c_keep');
  });

  it('startNewConversation from an open chat clears the workspace to a blank draft', async () => {
    const user = userEvent.setup();
    const open = detailFixture('c_open', 'Otwarta', [
      { id: 'u1', role: 'user', content: 'Pytanie do wyczyszczenia' },
      { id: 'a1', role: 'assistant', content: 'Odpowiedź do wyczyszczenia' },
    ]);
    seedLocalConversation(open);

    server.use(
      http.get('/api/conversations', () => {
        return HttpResponse.json([
          {
            id: open.id,
            title: open.title,
            createdAt: open.createdAt,
            updatedAt: open.updatedAt,
          },
        ]);
      }),
      http.get('/api/conversations/:id', () => HttpResponse.json(open)),
    );

    const { router } = renderApp('/copilot/c/c_open');
    expect(await screen.findByText('Pytanie do wyczyszczenia')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Profit Action' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/copilot');
    });
    expect(screen.queryByText('Pytanie do wyczyszczenia')).not.toBeInTheDocument();
    expect(screen.queryByText('Odpowiedź do wyczyszczenia')).not.toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/zapytaj o przepalony/i)).toBeInTheDocument();
  });

  it('skipHydrate after draft submit ignores a conflicting remote detail body', async () => {
    const user = userEvent.setup();
    let createdId: string | null = null;
    let detailGets = 0;

    server.use(
      http.put('/api/conversations/:id', async ({ request, params }) => {
        createdId = String(params.id);
        const body = (await request.json()) as ConversationDetail;
        return HttpResponse.json({ ...body, id: params.id });
      }),
      http.get('/api/conversations/:id', ({ params }) => {
        detailGets += 1;
        return HttpResponse.json({
          id: params.id,
          title: 'Wrogie nadpisanie',
          createdAt: 1,
          updatedAt: 99,
          messages: [
            { id: 'evil-u', role: 'user', content: 'Treść z remote której nie chcemy' },
            { id: 'evil-a', role: 'assistant', content: 'Remote overwrite' },
          ],
          analysesById: {},
          messageAnalysisIds: {},
        });
      }),
    );

    const { router } = renderApp('/copilot');
    const composer = await screen.findByPlaceholderText(/zapytaj o przepalony/i);
    await user.type(composer, 'Optymistyczna treść użytkownika');
    await user.click(screen.getByRole('button', { name: 'Wyślij wiadomość' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toMatch(/^\/copilot\/c\//);
    });
    await waitFor(() => expect(createdId).toBeTruthy());

    expect(screen.getAllByText('Optymistyczna treść użytkownika').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Odpowiedź testowa.')).toBeInTheDocument();
    expect(screen.queryByText('Treść z remote której nie chcemy')).not.toBeInTheDocument();
    expect(screen.queryByText('Remote overwrite')).not.toBeInTheDocument();
    expect(detailGets).toBe(0);
  });
});
