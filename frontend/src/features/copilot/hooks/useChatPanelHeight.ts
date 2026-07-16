import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import {
  CHAT_PANEL_EMPTY_HEIGHT,
  CHAT_PANEL_MAX_HEIGHT,
  CHAT_PANEL_MAX_VH_RATIO,
  CHAT_PANEL_MIN_HEIGHT,
  CHAT_PANEL_VERTICAL_PADDING,
} from '../lib/chat/copilotConstants';

function getMaxPanelHeight() {
  if (typeof window === 'undefined') {
    return CHAT_PANEL_MAX_HEIGHT;
  }
  return Math.min(window.innerHeight * CHAT_PANEL_MAX_VH_RATIO, CHAT_PANEL_MAX_HEIGHT);
}

export function useChatPanelHeight(
  isEmpty: boolean,
  contentRef: RefObject<HTMLElement | null>,
  composerRef: RefObject<HTMLElement | null>,
  contentRevision: string | number,
  freezeAnimation = false,
) {
  const [height, setHeight] = useState(() =>
    isEmpty ? CHAT_PANEL_EMPTY_HEIGHT : CHAT_PANEL_MIN_HEIGHT,
  );
  const [maxHeight, setMaxHeight] = useState(getMaxPanelHeight);
  const [animateHeight, setAnimateHeight] = useState(false);
  const measuredOnceRef = useRef(false);
  const atCapRef = useRef(false);

  const enableHeightAnimation = useCallback(() => {
    if (measuredOnceRef.current || freezeAnimation) {
      return;
    }
    measuredOnceRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateHeight(true);
      });
    });
  }, [freezeAnimation]);

  const measure = useCallback(() => {
    setMaxHeight(getMaxPanelHeight());

    if (isEmpty) {
      atCapRef.current = false;
      setHeight(CHAT_PANEL_EMPTY_HEIGHT);
      enableHeightAnimation();
      return;
    }

    const content = contentRef.current;
    const composer = composerRef.current;
    if (!content || !composer) {
      return;
    }

    const cap = getMaxPanelHeight();
    const desired = content.scrollHeight + composer.offsetHeight + CHAT_PANEL_VERTICAL_PADDING;
    const next = Math.min(Math.max(desired, CHAT_PANEL_MIN_HEIGHT), cap);
    atCapRef.current = next >= cap - 2;
    setHeight(next);
    enableHeightAnimation();
  }, [isEmpty, contentRef, composerRef, enableHeightAnimation]);

  useLayoutEffect(() => {
    if (freezeAnimation && atCapRef.current) {
      return;
    }
    measure();
  }, [measure, contentRevision, freezeAnimation]);

  useEffect(() => {
    if (isEmpty) {
      return;
    }

    const content = contentRef.current;
    if (!content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (freezeAnimation && atCapRef.current) {
        return;
      }
      measure();
    });
    observer.observe(content);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isEmpty, measure, contentRef, freezeAnimation]);

  return {
    height,
    maxHeight,
    animateHeight: animateHeight && !freezeAnimation,
    atMaxCapacity: !isEmpty && height >= maxHeight - 2,
  };
}
