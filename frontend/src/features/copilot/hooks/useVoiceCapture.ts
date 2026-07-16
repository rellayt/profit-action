import { useCallback, useEffect, useRef, useState } from 'react';

import {
  abortRecognitionSafely,
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  type SpeechRecognitionLike,
} from '../lib/voice/speechRecognition';
import {
  DEFAULT_BAR_COUNT,
  amplitudeFromRms,
  createIdleBars,
  resizeBars,
} from '../lib/voice/voiceBars';
import {
  IGNORED_SPEECH_ERRORS,
  SPEECH_LANG,
  VOICE_BAR_COUNT_MAX,
  VOICE_BAR_COUNT_MIN,
  VOICE_SCROLL_INTERVAL_MS,
} from '../lib/voice/voiceConstants';
import { VOICE_CAPTURE_FAILED, VOICE_MIC_DENIED, VOICE_UNSUPPORTED } from '../lib/voice/voiceCopy';

interface UseVoiceCaptureOptions {
  disabled?: boolean;
  onTranscript: (transcript: string) => void;
  onError?: (message: string | null) => void;
}

export function useVoiceCapture({ disabled, onTranscript, onError }: UseVoiceCaptureOptions) {
  const [listening, setListening] = useState(false);
  const [bars, setBars] = useState<number[]>(() => createIdleBars(DEFAULT_BAR_COUNT));

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const stopRequestedRef = useRef(false);
  const sessionClosedRef = useRef(false);
  const lastScrollAtRef = useRef(0);
  const listeningRef = useRef(false);
  const barCountRef = useRef(DEFAULT_BAR_COUNT);

  const setBarCapacity = useCallback((count: number) => {
    const next = Math.max(VOICE_BAR_COUNT_MIN, Math.min(VOICE_BAR_COUNT_MAX, Math.floor(count)));
    if (next === barCountRef.current) {
      return;
    }
    barCountRef.current = next;
    setBars((previous) => resizeBars(previous, next));
  }, []);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const endSession = useCallback(
    (commit: boolean) => {
      if (sessionClosedRef.current) {
        return;
      }
      sessionClosedRef.current = true;

      const text = (finalTranscriptRef.current || interimTranscriptRef.current).trim();

      abortRecognitionSafely(recognitionRef.current);
      recognitionRef.current = null;
      cleanupAudio();
      listeningRef.current = false;
      setListening(false);
      setBars(createIdleBars(barCountRef.current));
      interimTranscriptRef.current = '';
      finalTranscriptRef.current = '';
      onError?.(null);

      if (commit && text) {
        onTranscript(text);
      }
    },
    [cleanupAudio, onError, onTranscript],
  );

  const cancelListening = useCallback(() => {
    if (!listeningRef.current) {
      return;
    }
    stopRequestedRef.current = true;
    endSession(false);
  }, [endSession]);

  const confirmListening = useCallback(() => {
    if (!listeningRef.current) {
      return;
    }
    stopRequestedRef.current = true;
    endSession(true);
  }, [endSession]);

  const startListening = useCallback(async () => {
    if (disabled || listeningRef.current) {
      return;
    }

    const Recognition = getSpeechRecognitionCtor();
    if (!Recognition) {
      onError?.(VOICE_UNSUPPORTED);
      return;
    }

    try {
      onError?.(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stopRequestedRef.current = false;
      sessionClosedRef.current = false;
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      lastScrollAtRef.current = 0;
      setBars(createIdleBars(barCountRef.current));

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG;
      recognition.onresult = (event) => {
        let interim = '';
        let finalChunk = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (!result) {
            continue;
          }
          const piece = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalChunk += `${piece} `;
          } else {
            interim += piece;
          }
        }
        if (finalChunk) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalChunk}`.trim();
        }
        interimTranscriptRef.current = interim;
      };
      recognition.onerror = (event) => {
        if (IGNORED_SPEECH_ERRORS.has(event.error) || stopRequestedRef.current) {
          return;
        }
        onError?.(VOICE_CAPTURE_FAILED);
        stopRequestedRef.current = true;
        endSession(false);
      };
      recognition.onend = () => {
        if (sessionClosedRef.current) {
          return;
        }
        if (!stopRequestedRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            endSession(false);
            return;
          }
        }
        endSession(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      listeningRef.current = true;
      setListening(true);

      const timeBuffer = new Uint8Array(analyser.fftSize);

      const tick = () => {
        const analyserNode = analyserRef.current;
        if (!analyserNode) {
          return;
        }

        analyserNode.getByteTimeDomainData(timeBuffer);
        let sum = 0;
        for (let index = 0; index < timeBuffer.length; index += 1) {
          const normalized = ((timeBuffer[index] ?? 128) - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / timeBuffer.length);
        const sample = amplitudeFromRms(rms);
        const now = performance.now();

        if (now - lastScrollAtRef.current >= VOICE_SCROLL_INTERVAL_MS) {
          lastScrollAtRef.current = now;
          const count = barCountRef.current;
          setBars((previous) => {
            const sized = resizeBars(previous, count);
            return [...sized.slice(1), sample];
          });
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      cleanupAudio();
      listeningRef.current = false;
      onError?.(VOICE_MIC_DENIED);
    }
  }, [cleanupAudio, disabled, endSession, onError]);

  useEffect(
    () => () => {
      stopRequestedRef.current = true;
      abortRecognitionSafely(recognitionRef.current);
      cleanupAudio();
    },
    [cleanupAudio],
  );

  return {
    listening,
    bars,
    setBarCapacity,
    startListening,
    cancelListening,
    confirmListening,
    speechSupported: isSpeechRecognitionSupported(),
  };
}
