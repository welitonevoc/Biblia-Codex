import React, { useState, useEffect } from 'react';
import { Verse, Book } from '../../types';
import { Reader } from './Reader';
import { AudioPlayer } from './AudioPlayer';
import { ReadingMode } from './ReadingModeSelector';
import type { AudioTrack } from '../../services/audioService';
import audioService from '../../services/audioService';
import { useTranslation } from 'react-i18next';

interface ReaderWithAudioProps {
  book: Book;
  chapter: number;
  targetVerse?: number;
  onTargetVerseReached?: () => void;
  onVerseSelect?: (verse: Verse) => void;
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
  onStudyOpen: (selectedVerses: { verse: number, text: string }[]) => void;
  onToolOpen: (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes') => void;
  audioTracks?: AudioTrack[];
  hasAudioSupport?: boolean;
  readingMode?: ReadingMode;
  onReadingModeChange?: (mode: ReadingMode) => void;
  onShare: (verses: { verse: number, text: string }[], reference: string) => void;
  verses?: Verse[];
  onBottomChange?: (isAtBottom: boolean) => void;
}

export const ReaderWithAudio: React.FC<ReaderWithAudioProps> = ({
  book,
  chapter,
  targetVerse,
  onTargetVerseReached,
  onVerseSelect,
  onNavigate,
  onStudyOpen,
  onToolOpen,
  audioTracks = [],
  hasAudioSupport = true,
  readingMode = 'text',
  onReadingModeChange,
  onShare,
  verses = [],
  onBottomChange,
}) => {
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioTrack | null>(null);
  const { t } = useTranslation();

  // Encontrar faixa de áudio para o capítulo atual
  useEffect(() => {
    if (hasAudioSupport && audioTracks.length > 0) {
      const track = audioTracks.find(
        t => t.bookId === book.id && t.chapter === chapter && t.verse === 1
      );
      if (track) {
        setCurrentAudioTrack(track);
      }
    }
  }, [book.id, chapter, audioTracks, hasAudioSupport]);

  const handlePreviousChapter = () => {
    if (onNavigate) {
      onNavigate(book.id, chapter - 1, 1);
    }
  };

  const handleNextChapter = () => {
    if (onNavigate) {
      onNavigate(book.id, chapter + 1, 1);
    }
  };

  // Preparar informações da tradução (exemplo)
  const translationInfo = {
    name: book.name || 'Bíblia',
    description: `Áudio do livro ${book.name || ''} capítulo ${chapter}. Tradução: ${currentAudioTrack?.language || 'NTLH'}.`
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Reprodutor de áudio */}
      {(readingMode === 'audio' || readingMode === 'both') && (
        <div className="space-y-3">
          <AudioPlayer
            track={{
              id: `${book.id}-${chapter}`,
              title: `${book.name} ${chapter}`,
              chapter,
              bookId: book.id
            }}
            verses={verses.map(v => ({ verse: v.verse, text: v.text }))}
            onPreviousChapter={handlePreviousChapter}
            onNextChapter={handleNextChapter}
            onShare={onShare}
            translationInfo={translationInfo}
          />
        </div>
      )}

      {/* Mensagem de erro de áudio */}
      {/* Removida temporariamente ou pode ser integrada ao player no futuro */}

      {/* Leitor de texto */}
      {(readingMode === 'text' || readingMode === 'both') && (
        <Reader
          book={book}
          chapter={chapter}
          targetVerse={targetVerse}
          onTargetVerseReached={onTargetVerseReached}
          onVerseSelect={onVerseSelect}
          onNavigate={onNavigate}
          onStudyOpen={onStudyOpen}
          onToolOpen={onToolOpen}
          onShare={onShare}
          onBottomChange={onBottomChange}
        />
      )}

      {/* Mensagem quando apenas áudio está ativo */}
      {readingMode === 'audio' && !currentAudioTrack && (
        <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            Áudio não disponível para este capítulo
          </p>
        </div>
      )}
    </div>
  );
};

export default ReaderWithAudio;
