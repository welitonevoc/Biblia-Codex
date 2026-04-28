import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Book } from '../../types';
import { getAudioTracksForChapter } from '../../data';
import type { AudioTrack } from '../../services/audioService';

export function useAudioTracks(book: Book, chapter: number) {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [hasAudioSupport, setHasAudioSupport] = useState(false);

  useEffect(() => {
    const tracks = getAudioTracksForChapter(book.id, chapter);
    setAudioTracks(tracks);
    setHasAudioSupport(tracks.length > 0);
  }, [book.id, chapter]);

  const audioData = useMemo(() => ({
    tracks: audioTracks,
    hasSupport: hasAudioSupport,
  }), [audioTracks, hasAudioSupport]);

  return audioData;
}
