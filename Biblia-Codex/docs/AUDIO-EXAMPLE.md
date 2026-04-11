# Exemplo de Uso - Funcionalidade de Áudio

## Exemplo 1: Usar ReaderWithAudio no App.tsx

```typescript
import { ReaderWithAudio } from './components/ReaderWithAudio';
import { AudioTrack } from './services/audioService';

// Dados de exemplo de áudios
const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'gen-1-1',
    bookId: 'GEN',
    chapter: 1,
    verse: 1,
    url: 'https://example.com/audio/pt-br/genesis/01/001.mp3',
    duration: 45,
    language: 'pt-BR'
  },
  {
    id: 'gen-1-2',
    bookId: 'GEN',
    chapter: 1,
    verse: 2,
    url: 'https://example.com/audio/pt-br/genesis/01/002.mp3',
    duration: 38,
    language: 'pt-BR'
  },
  // ... mais áudios
];

function App() {
  const [book, setBook] = useState(BIBLE_BOOKS[0]);
  const [chapter, setChapter] = useState(1);

  return (
    <ReaderWithAudio
      book={book}
      chapter={chapter}
      audioTracks={AUDIO_TRACKS}
      hasAudioSupport={true}
      onStudyOpen={(verses) => console.log('Estudo:', verses)}
      onToolOpen={(verse, type) => console.log('Ferramenta:', type)}
    />
  );
}
```

## Exemplo 2: Usar AudioPlayer isoladamente

```typescript
import { AudioPlayer } from './components/AudioPlayer';
import { AudioTrack } from './services/audioService';

function MyAudioComponent() {
  const audioTrack: AudioTrack = {
    id: 'john-3-16',
    bookId: 'JOH',
    chapter: 3,
    verse: 16,
    url: 'https://example.com/audio/john-3-16.mp3',
    duration: 52,
    language: 'pt-BR'
  };

  return (
    <div>
      <h2>João 3:16</h2>
      <AudioPlayer track={audioTrack} />
    </div>
  );
}
```

## Exemplo 3: Usar useAudio Hook

```typescript
import { useAudio } from './hooks/useAudio';
import { AudioTrack } from './services/audioService';

function AudioControlComponent() {
  const audioTrack: AudioTrack = {
    id: 'psalm-23-1',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    url: 'https://example.com/audio/psalm-23-1.mp3',
    duration: 60,
    language: 'pt-BR'
  };

  const {
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
    skipBackward
  } = useAudio(audioTrack);

  if (isLoading) return <p>Carregando áudio...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={skipBackward}>⏮ -10s</button>
        <button onClick={togglePlayPause}>
          {state.isPlaying ? '⏸ Pausar' : '▶ Reproduzir'}
        </button>
        <button onClick={skipForward}>+10s ⏭</button>
      </div>

      <div>
        <label>Velocidade: {state.playbackRate}x</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          value={state.playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
        />
      </div>

      <div>
        <label>Volume: {Math.round(state.volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={state.volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>

      <p>
        {Math.floor(state.currentTime / 60)}:{String(Math.floor(state.currentTime % 60)).padStart(2, '0')} / 
        {Math.floor(state.duration / 60)}:{String(Math.floor(state.duration % 60)).padStart(2, '0')}
      </p>
    </div>
  );
}
```

## Exemplo 4: Usar AudioService diretamente

```typescript
import audioService, { AudioTrack } from './services/audioService';

async function playBibleAudio() {
  const track: AudioTrack = {
    id: 'matt-5-3',
    bookId: 'MAT',
    chapter: 5,
    verse: 3,
    url: 'https://example.com/audio/matthew-5-3.mp3',
    duration: 45,
    language: 'pt-BR'
  };

  try {
    // Carregar áudio
    await audioService.loadAudio(track);
    
    // Reproduzir
    audioService.play();

    // Após 10 segundos, aumentar velocidade
    setTimeout(() => {
      audioService.setPlaybackRate(1.5);
    }, 10000);

    // Inscrever-se em mudanças de estado
    const unsubscribe = audioService.subscribe((state) => {
      console.log('Estado de reprodução:', state);
      
      // Parar quando terminar
      if (state.currentTime === state.duration) {
        console.log('Áudio terminado');
        unsubscribe();
      }
    });
  } catch (error) {
    console.error('Erro ao reproduzir áudio:', error);
  }
}
```

## Exemplo 5: Integração com Contexto Global

```typescript
import { createContext, useContext, useState } from 'react';
import { AudioTrack } from './services/audioService';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  setCurrentTrack: (track: AudioTrack | null) => void;
  readingMode: 'text' | 'audio' | 'both';
  setReadingMode: (mode: 'text' | 'audio' | 'both') => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        readingMode,
        setReadingMode,
        playbackSpeed,
        setPlaybackSpeed
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext deve ser usado dentro de AudioProvider');
  }
  return context;
}
```

## Exemplo 6: Carregar áudios de uma API

```typescript
import { useEffect, useState } from 'react';
import { AudioTrack } from './services/audioService';

function useAudioTracks(bookId: string, chapter: number) {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await fetch(
          `/api/audio/tracks?book=${bookId}&chapter=${chapter}`
        );
        if (!response.ok) throw new Error('Erro ao carregar áudios');
        const data = await response.json();
        setTracks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [bookId, chapter]);

  return { tracks, loading, error };
}

// Uso
function ReaderComponent() {
  const { tracks, loading, error } = useAudioTracks('GEN', 1);

  if (loading) return <p>Carregando áudios...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <ReaderWithAudio
      book={BIBLE_BOOKS[0]}
      chapter={1}
      audioTracks={tracks}
      hasAudioSupport={tracks.length > 0}
      onStudyOpen={() => {}}
      onToolOpen={() => {}}
    />
  );
}
```

## Exemplo 7: Estrutura de dados para API de áudio

```typescript
// Backend - Exemplo com Express.js

app.get('/api/audio/tracks', async (req, res) => {
  const { book, chapter } = req.query;

  try {
    // Buscar áudios do banco de dados
    const tracks = await AudioTrack.find({
      bookId: book,
      chapter: parseInt(chapter as string)
    });

    // Formatar resposta
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      bookId: track.bookId,
      chapter: track.chapter,
      verse: track.verse,
      url: `${process.env.CDN_URL}/audio/${track.filename}`,
      duration: track.duration,
      language: track.language
    }));

    res.json(formattedTracks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar áudios' });
  }
});
```

## Dicas de Implementação

1. **Otimização de Banda**: Comprima áudios em diferentes qualidades e carregue a apropriada baseado na velocidade da conexão

2. **Cache**: Implemente cache de áudios no IndexedDB para uso offline

3. **Pré-carregamento**: Carregue áudios do próximo capítulo enquanto o usuário lê o atual

4. **Análise**: Rastreie quais áudios são mais ouvidos para otimizar entrega

5. **Acessibilidade**: Sempre forneça transcrições dos áudios

6. **Sincronização**: Implemente sincronização automática de texto com áudio para melhor experiência
