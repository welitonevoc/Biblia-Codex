import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import audioService, { AudioPlaybackState, AudioTrack } from '../services/audioService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface AudioPlayerProps {
  track: AudioTrack;
  onTrackChange?: (trackId: string) => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onTrackChange,
  className = ''
}) => {
  const [state, setState] = useState<AudioPlaybackState>(audioService.getState());
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    audioService.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioService.setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(state.volume);
      audioService.setVolume(0);
      setIsMuted(true);
    }
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
    <div className={cn(
      "relative overflow-hidden rounded-2xl",
      "bg-gradient-to-br from-[var(--accent-bible)]/5 via-[var(--surface-1)] to-[var(--accent-bible)]/10",
      "border border-[var(--border-bible)]",
      "shadow-lg shadow-black/5",
      className
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent-bible)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-[var(--accent-bible)]/10 rounded-full blur-2xl" />
      </div>

      <div className="relative p-4 md:p-5">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div 
            animate={{ rotate: state.isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-bible-strong)]",
              "text-white shadow-lg"
            )}
          >
            <Disc className="w-5 h-5" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-3.5 h-3.5 text-[var(--accent-bible)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-bible)]">
                Audiocast
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-bible)] truncate">
              {track.title || 'Capítulo de Áudio'}
            </h3>
            <p className="text-xs text-[var(--text-bible-muted)] truncate">
              {track.artist || 'Bíblia Codex'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)]"
              style={{ width: `${progressPercentage}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium text-[var(--text-bible-muted)]">
              {formatTime(state.currentTime)}
            </span>
            <span className="text-xs font-medium text-[var(--text-bible-muted)]">
              {formatTime(state.duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleMute}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]",
                "hover:bg-[var(--surface-2)] transition-all duration-200"
              )}
            >
              {isMuted || state.volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : state.volume}
              onChange={handleVolumeChange}
              className={cn(
                "w-20 h-1 rounded-full appearance-none cursor-pointer",
                "bg-[var(--surface-3)]",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-3",
                "[&::-webkit-slider-thumb]:h-3",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-[var(--accent-bible)]"
              )}
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipBackward}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-[var(--surface-1)] text-[var(--text-bible-muted)]",
                "hover:bg-[var(--surface-2)] hover:text-[var(--text-bible)]",
                "transition-all duration-200"
              )}
            >
              <SkipBack className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-xl",
                "bg-gradient-to-br from-[var(--accent-bible)] to-[var(--accent-bible-strong)]",
                "text-white shadow-lg shadow-[var(--accent-bible)]/30",
                "hover:shadow-xl hover:shadow-[var(--accent-bible)]/40",
                "transition-all duration-200"
              )}
            >
              {state.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSkipForward}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                "bg-[var(--surface-1)] text-[var(--text-bible-muted)]",
                "hover:bg-[var(--surface-2)] hover:text-[var(--text-bible)]",
                "transition-all duration-200"
              )}
            >
              <SkipForward className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Seek Display */}
          <div className="hidden md:block w-20 text-right">
            <input
              type="range"
              min="0"
              max={state.duration || 100}
              step="0.1"
              value={state.currentTime}
              onChange={handleSeek}
              className={cn(
                "w-full h-1 rounded-full appearance-none cursor-pointer",
                "bg-[var(--surface-3)]",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-3",
                "[&::-webkit-slider-thumb]:h-3",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-[var(--accent-bible)]",
                "[&::-webkit-slider-thumb]:opacity-0",
                "hover:[&::-webkit-slider-thumb]:opacity-100",
                "transition-opacity duration-200"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};