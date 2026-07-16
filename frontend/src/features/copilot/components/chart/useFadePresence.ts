import { useEffect, useRef, useState } from 'react';

export function useFadePresence<T>(activeValue: T | null, durationMs: number) {
  const [value, setValue] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);
  const clearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (clearTimerRef.current != null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    if (activeValue != null) {
      setValue(activeValue);
      requestAnimationFrame(() => {
        setVisible(true);
      });
      return;
    }

    setVisible(false);
    clearTimerRef.current = window.setTimeout(() => {
      setValue(null);
      clearTimerRef.current = null;
    }, durationMs);
  }, [activeValue, durationMs]);

  useEffect(
    () => () => {
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current);
      }
    },
    [],
  );

  return { value, visible };
}
