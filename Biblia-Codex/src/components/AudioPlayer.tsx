import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import audioService, { AudioPlaybackState, AudioTrack } from '../services/audioService';

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
    // Carregar a faixa de áudio
    audioService.loadAudio(track).catch(error => {
      console.error('Erro ao carregar áudio:', error);
    });

    // Inscrever-se nas mudanças de estado
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
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4 shadow-md ${className}`}>
      {/* Título da faixa */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {track.bookId} {track.chapter}:{track.verse}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {track.language}
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={state.duration || 0}
          value={state.currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
          style={{
            background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${progressPercentage}%, rgb(203, 213, 225) ${progressPercentage}%, rgb(203, 213, 225) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-1">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Controles principais */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={handleSkipBackward}
          className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Retroceder 10 segundos"
        >
          <SkipBack className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg"
          title={state.isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {state.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Avançar 10 segundos"
        >
          <SkipForward className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Controles de volume */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleMute}
          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
          title={isMuted ? 'Desmutecer' : 'Mutecer'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : state.volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <span className="text-xs text-slate-600 dark:text-slate-400 w-8">
          {Math.round((isMuted ? 0 : state.volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;
