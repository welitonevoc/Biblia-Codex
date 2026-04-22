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
import audioService, { AudioPlaybackState, AudioTrack } from '../services/audioService';

interface AudioPlayerProps {
  track: AudioTrack;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  onShare?: () => void;
  translationInfo?: {
    name: string;
    description: string;
  };
  className?: string;
  // Mantida para compatibilidade, mas não usada no novo design
  onTrackChange?: (trackId: string) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onPreviousChapter,
  onNextChapter,
  onShare,
  translationInfo,
  className = '',
  onTrackChange
}) => {
  const [state, setState] = useState<AudioPlaybackState>(audioService.getState());
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    audioService.loadAudio(track).catch(error => {
      console.error('Erro ao carregar áudio:', error);
    });
    const unsubscribe = audioService.subscribe(setState);
    return () => unsubscribe();
  }, [track]);

  const handlePlayPause = () => {
    audioService.togglePlayPause();
  };

  const handleSkipBackward = () => {
    audioService.skipBackward(10);
  };

  const handleSkipForward = () => {
    audioService.skipForward(10);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    audioService.seek(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    audioService.setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = state.duration > 0 
    ? (state.currentTime / state.duration) * 100 
    : 0;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Áudio da Bíblia
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {track.title || 'Capítulo de Áudio'}
            </h1>
          </div>
          
          {onShare && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-lg shadow-rose-500/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </motion.button>
          )}
        </div>
      </div>

      {/* Audio Player Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        {/* Progress Bar Section */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Track */}
            <input
              type="range"
              min="0"
              max={state.duration || 100}
              step="0.1"
              value={state.currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-gray-900
                [&::-webkit-slider-thumb]:dark:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-gray-900
                [&::-moz-range-thumb]:dark:bg-white
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, 
                  rgb(17 24 39) 0%, 
                  rgb(17 24 39) ${progressPercentage}%, 
                  rgb(229 231 235) ${progressPercentage}%, 
                  rgb(229 231 235) 100%)`
              }}
            />
          </div>

          {/* Time Display and Speed Selector */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">
              {formatTime(state.currentTime)}
            </span>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                {formatTime(state.duration)}
              </span>
              
              {/* Speed Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600"
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
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
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

          {/* Skip Backward 10s */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkipBackward}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Voltar 10 segundos"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl hover:shadow-2xl transition-shadow"
            aria-label={state.isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {state.isPlaying ? (
              <Pause className="w-7 h-7" fill="currentColor" />
            ) : (
              <Play className="w-7 h-7 ml-1" fill="currentColor" />
            )}
          </motion.button>

          {/* Skip Forward 10s */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkipForward}
            className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            aria-label="Avançar 10 segundos"
          >
            <RotateCw className="w-5 h-5" />
          </motion.button>

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
