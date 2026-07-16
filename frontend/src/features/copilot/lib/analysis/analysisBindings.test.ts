import type { Message } from '@ai-sdk/react';
import { describe, expect, it } from 'vitest';

import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import {
  bindPendingAnalyses,
  resolveAnalysisForMessage,
  resolveAnalysisLookup,
} from './analysisBindings';

function analysis(id: string): AnalysisResult {
  return {
    analysisId: id,
    operation: 'list',
    periodDays: 30,
    answerText: '',
    criteriaSummary: '',
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
  };
}

function message(id: string, role: Message['role']): Message {
  return { id, role, content: '' };
}

describe('bindPendingAnalyses', () => {
  it('binds pending analyses to unbound assistant messages in order', () => {
    const result = bindPendingAnalyses(
      [message('u1', 'user'), message('a1', 'assistant'), message('a2', 'assistant')],
      {},
      ['an1', 'an2'],
    );
    expect(result.bindings).toEqual({ a1: 'an1', a2: 'an2' });
    expect(result.pendingIds).toEqual([]);
  });

  it('skips already bound analyses and messages', () => {
    const result = bindPendingAnalyses(
      [message('a1', 'assistant'), message('a2', 'assistant')],
      { a1: 'an1' },
      ['an1', 'an2'],
    );
    expect(result.bindings).toEqual({ a1: 'an1', a2: 'an2' });
    expect(result.pendingIds).toEqual([]);
  });
});

describe('resolveAnalysisLookup', () => {
  it('prefers snapshot over store and stream', () => {
    const found = resolveAnalysisLookup(
      'an1',
      { an1: analysis('an1') },
      analysis('an1'),
      analysis('snap'),
    );
    expect(found?.analysisId).toBe('snap');
  });
});

describe('resolveAnalysisForMessage', () => {
  it('returns bound analysis when present', () => {
    const found = resolveAnalysisForMessage(
      'a1',
      [message('a1', 'assistant')],
      { an1: analysis('an1') },
      { a1: 'an1' },
      null,
    );
    expect(found?.analysisId).toBe('an1');
  });

  it('falls back to unbound stream analysis for last assistant', () => {
    const stream = analysis('an-stream');
    const found = resolveAnalysisForMessage('a1', [message('a1', 'assistant')], {}, {}, stream);
    expect(found?.analysisId).toBe('an-stream');
  });

  it('falls back to sole stored analysis when bindings are empty', () => {
    const found = resolveAnalysisForMessage(
      'a1',
      [message('a1', 'assistant')],
      { an1: analysis('an1') },
      {},
      null,
    );
    expect(found?.analysisId).toBe('an1');
  });

  it('returns null for non-last assistant without binding', () => {
    const found = resolveAnalysisForMessage(
      'a1',
      [message('a1', 'assistant'), message('a2', 'assistant')],
      { an1: analysis('an1') },
      {},
      null,
    );
    expect(found).toBeNull();
  });
});
