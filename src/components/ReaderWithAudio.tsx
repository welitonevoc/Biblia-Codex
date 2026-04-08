import React, { useState, useEffect } from 'react';
import { Verse, Book } from '../types';
import { Reader } from './Reader';
import { AudioPlayer } from './AudioPlayer';
import { ReadingModeSelector, ReadingMode } from './ReadingModeSelector';
import { AudioSpeedSelector } from './AudioSpeedSelector';
import { AudioTrack } from '../services/audioService';
import audioService from '../services/audioService';
import { AlertCircle } from 'lucide-react';

interface ReaderWithAudioProps {
  book: Book;
  chapter: number;
  targetVerse?: number;
  onTargetVerseReached?: () => void;
  onVerseSelect?: (verse: Verse) => void;
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
  onStudyOpen: (selectedVerses: { verse: number, text: string }[]) => void;
  onToolOpen: (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs') => void;
  audioTracks?: AudioTrack[];
  hasAudioSupport?: boolean;
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
}) => {
  const [readingMode, setReadingMode] = useState<ReadingMode>('text');
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioTrack | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAudioError, setShowAudioError] = useState(false);

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

  // Atualizar velocidade de reprodução
  useEffect(() => {
    audioService.setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  const handleAudioError = () => {
    setShowAudioError(true);
    setTimeout(() => setShowAudioError(false), 5000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de modo de leitura */}
      <ReadingModeSelector
        mode={readingMode}
        onModeChange={setReadingMode}
        hasAudio={hasAudioSupport && audioTracks.length > 0}
        className="sticky top-0 z-40 bg-white dark:bg-slate-950 p-2 rounded-lg shadow-sm"
      />

      {/* Reprodutor de áudio */}
      {(readingMode === 'audio' || readingMode === 'both') && currentAudioTrack && (
        <div className="space-y-3">
          <AudioPlayer
            track={currentAudioTrack}
            onTrackChange={(trackId) => {
              const track = audioTracks.find(t => t.id === trackId);
              if (track) setCurrentAudioTrack(track);
            }}
          />

          {/* Controles de velocidade */}
          <AudioSpeedSelector
            currentSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
          />
        </div>
      )}

      {/* Mensagem de erro de áudio */}
      {showAudioError && (
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Não foi possível carregar o áudio. Verifique sua conexão de internet.
          </p>
        </div>
      )}

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
