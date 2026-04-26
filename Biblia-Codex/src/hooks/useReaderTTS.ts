import { useState, useCallback } from 'react';
import { Verse } from '../types';
import { speakChapter, stopSpeaking, isTTSSupported } from '../services/ttsService';

export interface UseReaderTTSProps {
  verses: Verse[];
}

export const useReaderTTS = ({ verses }: UseReaderTTSProps) => {
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [currentHighlightedVerse, setCurrentHighlightedVerse] = useState<number | null>(null);

  const toggleTTS = useCallback(async (selectedVerses: number[]) => {
    if (isSpeakingTTS) {
      stopSpeaking();
      setIsSpeakingTTS(false);
      setCurrentHighlightedVerse(null);
    } else {
      setIsSpeakingTTS(true);
      setCurrentHighlightedVerse(null);
      try {
        const versesToRead = selectedVerses.length > 0
          ? selectedVerses
              .map(v => {
                const verse = verses.find(vers => vers.verse === v);
                return verse ? { verse: v, text: verse.text } : null;
              })
              .filter(Boolean) as { verse: number; text: string }[]
          : verses.map(v => ({ verse: v.verse, text: v.text }));
        
        if (versesToRead.length > 0) {
          await speakChapter(versesToRead, {
            rate: 0.9,
            lang: 'pt-BR',
            onVerseChange: (idx, text) => {
              console.log('[TTS] Versículo:', idx, text);
            },
            highlightVerseRef: (verseNum) => {
              setCurrentHighlightedVerse(verseNum);
              const verseEl = document.getElementById(`verse-${verseNum}`);
              if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            },
            onComplete: () => {
              setIsSpeakingTTS(false);
              setCurrentHighlightedVerse(null);
            }
          });
        }
      } catch (e) {
        console.error('Erro TTS:', e);
        setIsSpeakingTTS(false);
        setCurrentHighlightedVerse(null);
      }
    }
  }, [isSpeakingTTS, verses]);

  return {
    isSpeakingTTS,
    currentHighlightedVerse,
    toggleTTS,
    isTTSSupported
  };
};
