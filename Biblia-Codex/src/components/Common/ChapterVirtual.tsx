import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Verse {
  id: string;
  verseNumber: number;
  text: string;
}

interface ChapterVirtualProps {
  verses: Verse[];
  fontSize?: number;
  lineHeight?: number;
  showVerseNumbers?: boolean;
  onVerseClick?: (verse: Verse) => void;
}

export function ChapterVirtual({
  verses,
  fontSize = 18,
  lineHeight = 1.6,
  showVerseNumbers = true,
  onVerseClick,
}: ChapterVirtualProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => fontSize * lineHeight + 16,
    overscan: 10,
  });

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const verse = verses[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                padding: `${fontSize * 0.5}px ${fontSize}px`,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
            >
              {showVerseNumbers && (
                <sup className="text-primary opacity-70 mr-1 select-none">
                  {verse.verseNumber}
                </sup>
              )}
              <span
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => onVerseClick?.(verse)}
              >
                {verse.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook para virtualização de listas simples
export function useVerseVirtual(verses: Verse[], itemHeight = 40) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 20,
  });

  return { parentRef, virtualizer };
}