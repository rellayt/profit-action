import { useEffect, useRef } from 'react';

interface VoiceListeningSurfaceProps {
  bars: number[];
  onCapacityChange?: (count: number) => void;
}

const MAX_BAR_PX = 14;
const MIN_BAR_PX = 2;
const BAR_WIDTH_PX = 2;
const BAR_GAP_PX = 3;

export function VoiceListeningSurface({ bars, onCapacityChange }: VoiceListeningSurfaceProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !onCapacityChange) {
      return;
    }

    const updateCapacity = () => {
      const width = track.clientWidth;
      if (width <= 0) {
        return;
      }
      const count = Math.floor((width + BAR_GAP_PX) / (BAR_WIDTH_PX + BAR_GAP_PX));
      onCapacityChange(count);
    };

    updateCapacity();
    const observer = new ResizeObserver(updateCapacity);
    observer.observe(track);
    return () => observer.disconnect();
  }, [onCapacityChange]);

  return (
    <div className="copilot-voice-surface" aria-hidden>
      <div className="copilot-voice-bars" ref={trackRef}>
        {bars.map((level, index) => {
          const height = MIN_BAR_PX + level * (MAX_BAR_PX - MIN_BAR_PX);
          return <span key={`bar-${index}`} className="copilot-voice-bar" style={{ height }} />;
        })}
      </div>
    </div>
  );
}
