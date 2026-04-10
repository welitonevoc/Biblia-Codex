# Funcionalidade de Bíblia em Áudio

## Visão Geral

A Bíblia Codex agora inclui suporte completo para leitura de Bíblia em áudio, permitindo que os usuários ouçam os versículos enquanto leem o texto ou apenas escutem o áudio.

## Componentes Implementados

### 1. AudioService (`src/services/audioService.ts`)
Serviço central que gerencia toda a reprodução de áudio.

**Funcionalidades:**
- Carregamento de faixas de áudio
- Controles de playback (play, pause, seek)
- Ajuste de velocidade de reprodução (0.5x a 2.0x)
- Controle de volume
- Skip forward/backward (10 segundos)
- Sistema de listeners para sincronização de estado

**Uso:**
```typescript
import audioService from '../services/audioService';

// Carregar uma faixa de áudio
await audioService.loadAudio({
  id: 'gen-1-1',
  bookId: 'GEN',
  chapter: 1,
  verse: 1,
  url: 'https://example.com/audio/gen-1-1.mp3',
  duration: 45,
  language: 'pt-BR'
});

// Controlar reprodução
audioService.play();
audioService.pause();
audioService.seek(30); // Ir para 30 segundos
audioService.setPlaybackRate(1.5); // 1.5x velocidade
audioService.setVolume(0.8); // 80% de volume
```

### 2. AudioPlayer (`src/components/AudioPlayer.tsx`)
Componente visual para reprodução de áudio com controles completos.

**Funcionalidades:**
- Botões de play/pause
- Barra de progresso interativa
- Controles de volume
- Botões de skip forward/backward
- Exibição de tempo atual e duração
- Indicador de mute

**Uso:**
```typescript
import { AudioPlayer } from '../components/AudioPlayer';

<AudioPlayer
  track={audioTrack}
  onTrackChange={(trackId) => console.log('Faixa alterada:', trackId)}
/>
```

### 3. useAudio Hook (`src/hooks/useAudio.ts`)
Hook customizado para gerenciar áudio em componentes React.

**Funcionalidades:**
- Gerenciamento de estado de reprodução
- Métodos para controlar áudio
- Tratamento de erros
- Carregamento assíncrono

**Uso:**
```typescript
import { useAudio } from '../hooks/useAudio';

const MyComponent = () => {
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
    skipBackward,
    loadTrack
  } = useAudio(initialTrack);

  return (
    <>
      {isLoading && <p>Carregando áudio...</p>}
      {error && <p>Erro: {error}</p>}
      <button onClick={togglePlayPause}>
        {state.isPlaying ? 'Pausar' : 'Reproduzir'}
      </button>
    </>
  );
};
```

### 4. ReadingModeSelector (`src/components/ReadingModeSelector.tsx`)
Componente para selecionar o modo de leitura.

**Modos disponíveis:**
- `text`: Apenas texto
- `audio`: Apenas áudio
- `both`: Texto e áudio simultaneamente

**Uso:**
```typescript
import { ReadingModeSelector } from '../components/ReadingModeSelector';

<ReadingModeSelector
  mode={readingMode}
  onModeChange={(mode) => setReadingMode(mode)}
  hasAudio={true}
/>
```

### 5. AudioSpeedSelector (`src/components/AudioSpeedSelector.tsx`)
Componente para ajustar a velocidade de reprodução.

**Velocidades disponíveis:** 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x

**Uso:**
```typescript
import { AudioSpeedSelector } from '../components/AudioSpeedSelector';

<AudioSpeedSelector
  currentSpeed={playbackSpeed}
  onSpeedChange={(speed) => setPlaybackSpeed(speed)}
/>
```

### 6. ReaderWithAudio (`src/components/ReaderWithAudio.tsx`)
Componente integrado que combina leitura de texto com áudio.

**Funcionalidades:**
- Seletor de modo de leitura
- Reprodutor de áudio integrado
- Controles de velocidade
- Tratamento de erros
- Sincronização entre texto e áudio

**Uso:**
```typescript
import { ReaderWithAudio } from '../components/ReaderWithAudio';

<ReaderWithAudio
  book={book}
  chapter={chapter}
  audioTracks={audioTracks}
  hasAudioSupport={true}
  onStudyOpen={handleStudyOpen}
  onToolOpen={handleToolOpen}
/>
```

## Integração com o Aplicativo

### Passo 1: Adicionar dados de áudio
Você precisa fornecer faixas de áudio com as seguintes informações:

```typescript
interface AudioTrack {
  id: string;              // ID único (ex: 'gen-1-1')
  bookId: string;          // ID do livro (ex: 'GEN')
  chapter: number;         // Número do capítulo
  verse: number;           // Número do versículo
  url: string;             // URL do arquivo de áudio
  duration: number;        // Duração em segundos
  language: string;        // Idioma (ex: 'pt-BR')
}
```

### Passo 2: Substituir o Reader pelo ReaderWithAudio
No componente principal, substitua:

```typescript
// Antes
<Reader {...readerProps} />

// Depois
<ReaderWithAudio
  {...readerProps}
  audioTracks={audioTracks}
  hasAudioSupport={true}
/>
```

### Passo 3: Fornecer URLs de áudio
Você pode usar:
- Serviços de hospedagem de áudio (AWS S3, Google Cloud Storage, etc.)
- APIs de síntese de fala (Google Text-to-Speech, Azure Speech, etc.)
- Arquivos de áudio pré-gravados

## Formatos Suportados
- MP3
- WAV
- OGG
- M4A
- WebM

## Considerações de Performance

1. **Lazy Loading**: Carregue áudios apenas quando necessário
2. **Cache**: Use cache do navegador para áudios frequentemente acessados
3. **Compressão**: Comprima arquivos de áudio para reduzir tamanho
4. **Streaming**: Use streaming progressivo em vez de download completo

## Acessibilidade

A funcionalidade de áudio melhora significativamente a acessibilidade:
- Usuários com deficiência visual podem ouvir o texto
- Usuários com dificuldades de leitura podem acompanhar o áudio
- Múltiplas velocidades de reprodução para diferentes preferências

## Troubleshooting

### Áudio não está reproduzindo
- Verifique se a URL do áudio está acessível
- Verifique se o navegador suporta o formato de áudio
- Verifique o console do navegador para mensagens de erro

### Áudio está atrasado
- Reduza a qualidade do áudio
- Verifique a velocidade da conexão de internet
- Use um servidor CDN para melhor performance

### Volume está muito baixo/alto
- Use o controle de volume do AudioPlayer
- Verifique as configurações de volume do sistema

## Próximas Melhorias

- [ ] Sincronização automática de texto com áudio (highlight de versículos)
- [ ] Suporte a múltiplos idiomas de áudio
- [ ] Download de áudios para uso offline
- [ ] Histórico de reprodução
- [ ] Favoritos de áudio
- [ ] Integração com assistentes de voz

## Referências

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [WCAG 2.1 - Audio and Video](https://www.w3.org/WAI/WCAG21/Understanding/audio-and-video)
