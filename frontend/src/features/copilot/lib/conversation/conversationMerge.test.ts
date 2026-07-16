import { describe, expect, it } from 'vitest';

import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import type { ConversationDetail } from '../../types/conversation';
import { hydrateConversationDetail, mergeConversationDetails } from './conversationMerge';

function makeAnalysis(
  overrides: Partial<AnalysisResult> & Pick<AnalysisResult, 'analysisId'>,
): AnalysisResult {
  return {
    operation: 'list',
    periodDays: 30,
    answerText: '',
    criteriaSummary: 'Analiza',
    showChart: false,
    showCta: false,
    plan: AnalysisPlanSchema.parse({}),
    summary: { productsAnalyzed: 1, matchedProducts: 0 },
    kpis: [],
    topProducts: [],
    matchedProductIds: [],
    matchedProducts: [],
    groupRows: [],
    aggregations: [],
    chartPoints: [],
    chartCaption: '',
    ...overrides,
  };
}

describe('hydrateConversationDetail', () => {
  it('parses analyses and repairs missing bindings', () => {
    const detail: ConversationDetail = {
      id: 'c1',
      title: 'Test',
      createdAt: 1,
      updatedAt: 2,
      messages: [
        { id: 'u1', role: 'user', content: 'q' },
        { id: 'a1', role: 'assistant', content: 'a' },
      ],
      analysesById: {
        analysis_1: makeAnalysis({
          analysisId: 'analysis_1',
          showCta: true,
          matchedProductIds: ['p-1'],
        }),
      },
      messageAnalysisIds: {},
    };

    const hydrated = hydrateConversationDetail(detail);

    expect(hydrated.analysesById.analysis_1?.analysisId).toBe('analysis_1');
    expect(hydrated.analysesById.analysis_1?.showCta).toBe(true);
    expect(hydrated.analysesById.analysis_1?.matchedProductIds).toEqual(['p-1']);
    expect(hydrated.messageAnalysisIds.a1).toBe('analysis_1');
  });
});

describe('mergeConversationDetails', () => {
  it('prefersRicherAnalysisWhenBothPresent', () => {
    const local: ConversationDetail = {
      id: 'c1',
      title: 'Local',
      createdAt: 1,
      updatedAt: 2,
      messages: [{ id: 'a1', role: 'assistant', content: 'local' }],
      analysesById: {
        analysis_1: makeAnalysis({
          analysisId: 'analysis_1',
          matchedProductIds: ['p-1'],
          showCta: true,
        }),
      },
      messageAnalysisIds: { a1: 'analysis_1' },
    };
    const remote: ConversationDetail = {
      id: 'c1',
      title: 'Remote',
      createdAt: 1,
      updatedAt: 3,
      messages: [{ id: 'a1', role: 'assistant', content: 'remote' }],
      analysesById: {
        analysis_1: makeAnalysis({
          analysisId: 'analysis_1',
          matchedProductIds: [],
          chartPoints: [],
          showCta: false,
        }),
      },
      messageAnalysisIds: { a1: 'analysis_1' },
    };

    const merged = mergeConversationDetails(local, remote);

    expect(merged.analysesById.analysis_1?.matchedProductIds).toEqual(['p-1']);
    expect(merged.analysesById.analysis_1?.showCta).toBe(true);
  });

  it('keepsLocalMessagesWhenRemoteMessagesEmpty', () => {
    const local: ConversationDetail = {
      id: 'c1',
      title: 'Local',
      createdAt: 1,
      updatedAt: 2,
      messages: [
        { id: 'u1', role: 'user', content: 'keep me' },
        { id: 'a1', role: 'assistant', content: 'local answer' },
      ],
      analysesById: {
        analysis_1: makeAnalysis({ analysisId: 'analysis_1', showCta: true }),
      },
      messageAnalysisIds: { a1: 'analysis_1' },
    };
    const remote: ConversationDetail = {
      id: 'c1',
      title: 'Remote',
      createdAt: 1,
      updatedAt: 4,
      messages: [],
      analysesById: {},
      messageAnalysisIds: {},
    };

    const merged = mergeConversationDetails(local, remote);

    expect(merged.messages).toEqual(local.messages);
    expect(merged.title).toBe('Remote');
    expect(merged.messageAnalysisIds.a1).toBe('analysis_1');
  });
});
