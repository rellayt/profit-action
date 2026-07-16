import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpeechRecognitionLike } from '../lib/voice/speechRecognition';
import { VOICE_UNSUPPORTED } from '../lib/voice/voiceCopy';
import { useVoiceCapture } from './useVoiceCapture';

const { getSpeechRecognitionCtor, isSpeechRecognitionSupported } = vi.hoisted(() => ({
  getSpeechRecognitionCtor: vi.fn(),
  isSpeechRecognitionSupported: vi.fn(() => false),
}));

vi.mock('../lib/voice/speechRecognition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/voice/speechRecognition')>();
  return {
    ...actual,
    getSpeechRecognitionCtor,
    isSpeechRecognitionSupported,
  };
});

function createRecognitionMock() {
  const recognition: SpeechRecognitionLike = {
    continuous: false,
    interimResults: false,
    lang: '',
    onresult: null,
    onerror: null,
    onend: null,
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
  };
  return recognition;
}

function mockAudioPipeline() {
  const track = { stop: vi.fn() };
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [track],
      }),
    },
  });

  class FakeAudioContext {
    createAnalyser() {
      return {
        fftSize: 256,
        smoothingTimeConstant: 0,
        getByteTimeDomainData(buffer: Uint8Array) {
          buffer.fill(128);
        },
      };
    }
    createMediaStreamSource() {
      return { connect: vi.fn() };
    }
    close = vi.fn().mockResolvedValue(undefined);
  }

  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 0) as unknown as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    window.clearTimeout(id);
  });

  return track;
}

describe('useVoiceCapture', () => {
  beforeEach(() => {
    getSpeechRecognitionCtor.mockReset();
    isSpeechRecognitionSupported.mockReset();
    isSpeechRecognitionSupported.mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reports unsupported browser and does not start listening', async () => {
    getSpeechRecognitionCtor.mockReturnValue(null);
    const onError = vi.fn();
    const { result } = renderHook(() => useVoiceCapture({ onTranscript: vi.fn(), onError }));

    await act(async () => {
      await result.current.startListening();
    });

    expect(result.current.listening).toBe(false);
    expect(onError).toHaveBeenCalledWith(expect.stringContaining(VOICE_UNSUPPORTED));
  });

  it('commits final transcript via confirmListening', async () => {
    const recognition = createRecognitionMock();
    getSpeechRecognitionCtor.mockReturnValue(
      vi.fn(function Recognition() {
        return recognition;
      }),
    );
    isSpeechRecognitionSupported.mockReturnValue(true);
    mockAudioPipeline();

    const onTranscript = vi.fn();
    const { result } = renderHook(() => useVoiceCapture({ onTranscript, onError: vi.fn() }));

    await act(async () => {
      await result.current.startListening();
    });

    await waitFor(() => expect(result.current.listening).toBe(true));

    act(() => {
      recognition.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: 'ujemny zysk' },
          },
        ],
      });
    });

    act(() => {
      result.current.confirmListening();
    });

    expect(onTranscript).toHaveBeenCalledWith('ujemny zysk');
    expect(result.current.listening).toBe(false);
    expect(recognition.abort).toHaveBeenCalled();
  });

  it('cancels without committing transcript', async () => {
    const recognition = createRecognitionMock();
    getSpeechRecognitionCtor.mockReturnValue(
      vi.fn(function Recognition() {
        return recognition;
      }),
    );
    isSpeechRecognitionSupported.mockReturnValue(true);
    mockAudioPipeline();

    const onTranscript = vi.fn();
    const { result } = renderHook(() => useVoiceCapture({ onTranscript, onError: vi.fn() }));

    await act(async () => {
      await result.current.startListening();
    });
    await waitFor(() => expect(result.current.listening).toBe(true));

    act(() => {
      recognition.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: 'nie wysyłaj' },
          },
        ],
      });
      result.current.cancelListening();
    });

    expect(onTranscript).not.toHaveBeenCalled();
    expect(result.current.listening).toBe(false);
    expect(recognition.abort).toHaveBeenCalled();
  });
});
