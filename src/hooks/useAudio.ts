import { useState, useEffect, useCallback } from 'react';
import audioService, { AudioPlaybackState, AudioTrack } from '../services/audioService';

export const useAudio = (initialTrack?: AudioTrack) => {
  const [state, setState] = useState<AudioPlaybackState>(audioService.getState());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialTrack) {
      setIsLoading(true);
      audioService.loadAudio(initialTrack)
        .catch(err => {
          setError(err.message || 'Erro ao carregar áudio');
          console.error('Erro ao carregar áudio:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialTrack]);

  const play = useCallback(() => {
    audioService.play();
  }, []);

  const pause = useCallback(() => {
    audioService.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    audioService.togglePlayPause();
  }, []);

  const seek = useCallback((time: number) => {
    audioService.seek(time);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    audioService.setPlaybackRate(rate);
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioService.setVolume(volume);
  }, []);

  const skipForward = useCallback((seconds?: number) => {
    audioService.skipForward(seconds);
  }, []);

  const skipBackward = useCallback((seconds?: number) => {
    audioService.skipBackward(seconds);
  }, []);

  const stop = useCallback(() => {
    audioService.stop();
  }, []);

  const loadTrack = useCallback(async (track: AudioTrack) => {
    setIsLoading(true);
    setError(null);
    try {
      await audioService.loadAudio(track);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar áudio:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    state,
    error,
    isLoading,
    play,
    pause,
    togglePlayPause,
    seek,
    setPlaybackRate,
    setVolume,
    skipForward,
    skipBackward,
    stop,
    loadTrack,
  };
};

export default useAudio;
