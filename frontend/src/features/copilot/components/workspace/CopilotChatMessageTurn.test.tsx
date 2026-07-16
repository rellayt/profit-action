import type { Message } from '@ai-sdk/react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { MessageRole } from '../../lib/chat/messageRole';
import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { CopilotChatMessageTurn } from './CopilotChatMessageTurn';

const analysis: AnalysisResult = {
  analysisId: 'a1',
  operation: 'list',
  periodDays: 30,
  answerText: '',
  criteriaSummary: '',
  showChart: true,
  showCta: true,
  plan: AnalysisPlanSchema.parse({}),
  summary: { productsAnalyzed: 10, matchedProducts: 2 },
  kpis: [],
  topProducts: [],
  matchedProductIds: ['p1', 'p2'],
  matchedProducts: [],
  groupRows: [],
  aggregations: [],
  chartPoints: [],
  chartCaption: '',
};

const assistantMessage = {
  id: 'a1',
  role: MessageRole.Assistant,
  content: 'Odpowiedź',
} as Message;

describe('CopilotChatMessageTurn', () => {
  it('shows insights CTA when analysis is ready', async () => {
    const user = userEvent.setup();
    const onOpenInsights = vi.fn();
    renderWithProviders(
      <CopilotChatMessageTurn
        message={assistantMessage}
        messageId="a1"
        isTurnAssistant
        isFailedUserTurn={false}
        isStreaming={false}
        statusMessage={null}
        analysis={analysis}
        showUnsupportedChips={false}
        showStreamCursor
        isBusy={false}
        onReplay={vi.fn()}
        onOpenInsights={onOpenInsights}
        onDemoChip={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Zobacz analizę/i }));
    expect(onOpenInsights).toHaveBeenCalled();
  });

  it('shows starter chips when unsupported', async () => {
    const user = userEvent.setup();
    const onDemoChip = vi.fn();
    renderWithProviders(
      <CopilotChatMessageTurn
        message={assistantMessage}
        messageId="a1"
        isTurnAssistant
        isFailedUserTurn={false}
        isStreaming={false}
        statusMessage={null}
        analysis={null}
        showUnsupportedChips
        showStreamCursor
        isBusy={false}
        onReplay={vi.fn()}
        onOpenInsights={vi.fn()}
        onDemoChip={onDemoChip}
      />,
    );
    const chips = screen.getAllByRole('button');
    await user.click(chips[0]!);
    expect(onDemoChip).toHaveBeenCalled();
  });
});
