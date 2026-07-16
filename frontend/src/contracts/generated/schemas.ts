/**
 * AUTO-GENERATED from Pydantic models via scripts/generate_zod_schemas.py
 * Do not edit by hand. Run: npm run contracts:generate
 */
import { z } from 'zod';

const ProductSegmentSchema = z.enum(['stop_spending', 'rescue', 'scale', 'neutral']);
const AnalysisOperationSchema = z.enum(['list', 'aggregate', 'group']);
const KpiFormatSchema = z.enum(['currency', 'number', 'text']);

export const AnalysisKpiSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.union([z.number(), z.string()]),
  format: KpiFormatSchema.default('number'),
});

export const AnalysisTopProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  spend: z.number(),
  revenue: z.number(),
  profit: z.number(),
});

export const ChartPointSchema = z.object({
  productId: z.string(),
  name: z.string(),
  spend: z.number(),
  revenue: z.number(),
  profit: z.number(),
  stock: z.number(),
  segment: ProductSegmentSchema,
  recommendation: z.string(),
});

export const AnalysisSummaryCountsSchema = z.object({
  productsAnalyzed: z.number(),
  matchedProducts: z.number(),
});

export const MatchedProductRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  spend: z.number(),
  revenue: z.number(),
  profit: z.number(),
  stock: z.number(),
  margin: z.number(),
  segment: ProductSegmentSchema,
  matchReason: z.string(),
});

export const GroupRowSchema = z.object({
  key: z.string(),
  count: z.number(),
  spend: z.number(),
  revenue: z.number(),
  profit: z.number(),
  avgMargin: z.number(),
});

export const AggregationRowSchema = z.object({
  fn: z.string(),
  field: z.string().nullable().optional(),
  value: z.number(),
  label: z.string(),
});

export const AnalysisPlanSchema = z.object({
  operation: AnalysisOperationSchema.default('list'),
  scopeAnalysisId: z.string().nullable().optional(),
  filterLogic: z.enum(['and', 'or']).default('and'),
  filters: z
    .array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.unknown(),
      }),
    )
    .default([]),
  sort: z
    .object({
      field: z.enum(['spend', 'revenue', 'profit', 'margin', 'stock']),
      direction: z.enum(['asc', 'desc']).default('desc'),
    })
    .nullable()
    .optional(),
  limit: z.number().nullable().optional().default(25),
  aggregations: z
    .array(
      z.object({
        fn: z.enum(['count', 'sum', 'avg', 'min', 'max']),
        field: z.enum(['spend', 'revenue', 'profit', 'margin', 'stock']).nullable().optional(),
      }),
    )
    .default([]),
  groupBy: z.enum(['category', 'brand', 'segment']).nullable().optional(),
  criteriaSummary: z.string().default(''),
  interpretationNote: z.string().nullable().optional(),
});
export type AnalysisPlan = z.output<typeof AnalysisPlanSchema>;

export const AnalysisResultSchema = z.object({
  analysisId: z.string(),
  operation: AnalysisOperationSchema.default('list'),
  periodDays: z.number().default(30),
  answerText: z.string().default(''),
  criteriaSummary: z.string().default(''),
  interpretationNote: z.string().nullable().optional(),
  showChart: z.boolean().default(false),
  showCta: z.boolean().default(false),
  plan: AnalysisPlanSchema.default({}),
  summary: AnalysisSummaryCountsSchema,
  kpis: z.array(AnalysisKpiSchema).default([]),
  topProducts: z.array(AnalysisTopProductSchema).default([]),
  matchedProductIds: z.array(z.string()).default([]),
  matchedProducts: z.array(MatchedProductRowSchema).default([]),
  groupRows: z.array(GroupRowSchema).default([]),
  aggregations: z.array(AggregationRowSchema).default([]),
  chartPoints: z.array(ChartPointSchema).default([]),
  chartCaption: z.string().default(''),
});
export type AnalysisResult = z.output<typeof AnalysisResultSchema>;
const DataSourceIdSchema = z.enum(['ga4', 'google_ads', 'inventory', 'shop']);

export const DataFreshnessSchema = z.object({
  source: DataSourceIdSchema,
  label: z.string(),
  updatedAt: z.string(),
});

export const ClassifiedProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  googleAdsSpend: z.number(),
  netRevenue: z.number(),
  marginPercent: z.number(),
  addToCartRate: z.number(),
  conversionRate: z.number(),
  impressions: z.number(),
  stock: z.number(),
  profit: z.number(),
  freshness: z.array(DataFreshnessSchema),
  segment: ProductSegmentSchema,
  recommendation: z.string(),
  evidence: z.array(z.string()),
});
export type ClassifiedProduct = z.infer<typeof ClassifiedProductSchema>;

export const ProductsResponseSchema = z.object({
  items: z.array(ClassifiedProductSchema),
  total: z.number(),
  segmentCounts: z.record(z.number()),
});
export type ProductsResponse = z.output<typeof ProductsResponseSchema>;
export const ConversationMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const ConversationSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

export const ConversationDetailWireSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  messages: z.array(ConversationMessageSchema).default([]),
  analysesById: z.record(AnalysisResultSchema).default({}),
  messageAnalysisIds: z.record(z.string()).default({}),
});
export type ConversationDetailWire = z.output<typeof ConversationDetailWireSchema>;
export const HealthResponseSchema = z.object({
  status: z.string(),
  service: z.string(),
  demoMode: z.boolean(),
  openaiConfigured: z.boolean(),
  liveAiAvailable: z.boolean(),
});
export type HealthResponse = z.output<typeof HealthResponseSchema>;

export const StatusDataPartSchema = z.object({
  type: z.literal('status'),
  message: z.string(),
});

export const AnalysisDataPartSchema = z.object({
  type: z.literal('analysis'),
  analysis: AnalysisResultSchema,
});

export const UnsupportedDataPartSchema = z.object({
  type: z.literal('unsupported'),
});

export const StreamDataPartSchema = z.discriminatedUnion('type', [
  StatusDataPartSchema,
  AnalysisDataPartSchema,
  UnsupportedDataPartSchema,
]);
