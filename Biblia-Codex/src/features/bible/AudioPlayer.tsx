import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Share2,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ttsService, TTSVoice, isTTSSupported } from '../../services/ttsService';
import { useAppContext } from '../../app/AppContext';

interface AudioPlayerProps {
  track: {
    id: string;
    title?: string;
    artist?: string;
    verses?: { verse: number; text: string }[];
    chapter?: number;
    bookId?: string;
  };
  verses?: { verse: number; text: string }[];
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  onShare?: (verses: { verse: number, text: string }[], reference: string) => void;
  translationInfo?: {
    name: string;
    description: string;
  };
  className?: string;
  onTrackChange?: (trackId: string) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  verses,
  onPreviousChapter,
  onNextChapter,
  onShare,
  translationInfo,
  className = '',
  onTrackChange
}) => {
  const { settings } = useAppContext();
  const ttsConfig = settings.tts;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(ttsConfig?.rate || 1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isTTSSupported);
    if (!isTTSSupported) {
      return;
    }

    const updateVoices = () => {
      const voices = ttsService.getVoices();
      setAvailableVoices(voices);

      // Selecionar voz padrão em português, priorizando as vozes enviadas
      const defaultVoice = ttsService.getDefaultPortugueseVoice();
      if (defaultVoice) {
        setSelectedVoice({
          name: defaultVoice.name,
          lang: defaultVoice.lang,
          voice: defaultVoice
        });
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handlePlayPause = async () => {
    const versesToUse = verses || track.verses || [];
    if (!versesToUse || versesToUse.length === 0) return;

    if (isPlaying) {
      ttsService.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        await ttsService.speakChapter(versesToUse, {
          rate: playbackSpeed,
          voice: selectedVoice?.voice,
          onVerseChange: (verseIndex: number, verseText: string) => {
            setCurrentVerse(verseIndex);
          },
          onComplete: () => {
            setIsPlaying(false);
            setCurrentVerse(0);
          }
        });
      } catch (error) {
        console.error('Erro ao reproduzir TTS:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setCurrentVerse(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleVoiceChange = (voice: TTSVoice) => {
    setSelectedVoice(voice);
    if (isPlaying) {
      handleStop();
    }
  };

  const versesToUse = verses || track.verses || [];
  const progressPercentage = versesToUse.length > 0
    ? ((currentVerse + 1) / versesToUse.length) * 100
    : 0;

  if (!isSupported) {
    return (
      <div className={`w-full max-w-2xl mx-auto ${className}`}>
        <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            TTS não suportado neste navegador
          </div>
          <p className="text-sm text-red-500 dark:text-red-300">
            Use Chrome, Edge ou Safari para suporte completo ao Text-to-Speech.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`} role="region" aria-label="Player de áudio" aria-live="polite">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Text-to-Speech
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {track.title || 'Capítulo da Bíblia'}
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Versículo {currentVerse + 1} de {versesToUse.length}
            </div>
          </div>

          {onShare && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onShare(versesToUse, track.title || '')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-lg shadow-rose-500/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </motion.button>
          )}
        </div>
      </div>

      {/* TTS Player Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        {/* Progress Bar Section */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Track */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Voice and Speed Selector */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {/* Voice Selector */}
              <div className="relative">
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    if (voice) handleVoiceChange(voice);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableVoices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600"
                >
                  {playbackSpeed}x
                </button>

                <AnimatePresence>
                  {showSpeedMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[120px] z-10"
                    >
                      {SPEED_OPTIONS.map(speed => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-left transition-colors
                            ${Math.abs(playbackSpeed - speed) < 0.01
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Previous Chapter */}
          {onPreviousChapter && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPreviousChapter}
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}

          {/* Stop */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            aria-label="Parar"
          >
            <div className="w-4 h-4 border-2 border-current rounded-sm" />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            disabled={versesToUse.length === 0}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white shadow-xl hover:shadow-2xl transition-all disabled:cursor-not-allowed"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7 ml-1" fill="currentColor" />
            )}
          </motion.button>

          {/* Resume */}
          {!isPlaying && ttsService.isPaused() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                ttsService.resume();
                setIsPlaying(true);
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
              aria-label="Continuar"
            >
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            </motion.button>
          )}

          {/* Next Chapter */}
          {onNextChapter && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextChapter}
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Próximo capítulo"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Status Message */}
        {versesToUse.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nenhum versículo disponível para leitura
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPlaying ? 'Reproduzindo...' : 'Pronto para reproduzir'}
            </p>
          </div>
        )}
      </div>

      {/* Translation Info Section */}
      {translationInfo && (
        <div className="mt-8 text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            {translationInfo.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
            {translationInfo.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
