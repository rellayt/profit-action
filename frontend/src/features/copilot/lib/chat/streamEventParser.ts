import {
  StreamDataPartSchema,
  type AnalysisResult,
} from '../../../../contracts/generated/schemas';
import { StreamPartType } from './streamPartType';

export interface StreamUiState {
  statusMessage: string | null;
  analysis: AnalysisResult | null;
  unsupported: boolean;
}

export const initialStreamState: StreamUiState = {
  statusMessage: null,
  analysis: null,
  unsupported: false,
};

export function applyDataPart(state: StreamUiState, part: unknown): StreamUiState {
  const parsed = StreamDataPartSchema.safeParse(part);
  if (!parsed.success) {
    return state;
  }

  const data = parsed.data;
  if (data.type === StreamPartType.Status) {
    return { ...state, statusMessage: data.message };
  }

  if (data.type === StreamPartType.Unsupported) {
    return {
      ...state,
      unsupported: true,
      analysis: null,
      statusMessage: null,
    };
  }

  if (data.type === StreamPartType.Analysis) {
    return {
      ...state,
      analysis: data.analysis,
      unsupported: false,
      statusMessage: null,
    };
  }

  return state;
}
