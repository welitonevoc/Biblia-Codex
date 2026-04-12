/**
 * Serviço de Reprodução de Áudio para Bíblia
 * Gerencia reprodução de áudio de versículos bíblicos com sincronização de texto
 */

export interface AudioTrack {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  url: string;
  duration: number;
  language: string;
  title?: string;
  artist?: string;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  currentTrackId: string | null;
}

export class AudioService {
  private static instance: AudioService;
  private audio: HTMLAudioElement | null = null;
  private playbackState: AudioPlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    currentTrackId: null,
  };
  private listeners: Set<(state: AudioPlaybackState) => void> = new Set();
  private audioTracks: Map<string, AudioTrack> = new Map();

  private constructor() {
    this.initializeAudio();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initializeAudio() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.addEventListener('play', () => this.updateState({ isPlaying: true }));
      this.audio.addEventListener('pause', () => this.updateState({ isPlaying: false }));
      this.audio.addEventListener('timeupdate', () => {
        this.updateState({ currentTime: this.audio?.currentTime || 0 });
      });
      this.audio.addEventListener('loadedmetadata', () => {
        this.updateState({ duration: this.audio?.duration || 0 });
      });
      this.audio.addEventListener('ratechange', () => {
        this.updateState({ playbackRate: this.audio?.playbackRate || 1 });
      });
      this.audio.addEventListener('volumechange', () => {
        this.updateState({ volume: this.audio?.volume || 1 });
      });
    }
  }

  /**
   * Carrega um áudio de um URL
   */
  async loadAudio(track: AudioTrack): Promise<void> {
    if (!this.audio) return;

    try {
      this.audio.src = track.url;
      this.audioTracks.set(track.id, track);
      this.updateState({ currentTrackId: track.id, currentTime: 0 });
      await new Promise((resolve, reject) => {
        this.audio!.addEventListener('canplay', resolve, { once: true });
        this.audio!.addEventListener('error', reject, { once: true });
      });
    } catch (error) {
      console.error('Erro ao carregar áudio:', error);
      throw error;
    }
  }

  /**
   * Inicia a reprodução de áudio
   */
  play(): void {
    if (this.audio) {
      this.audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  }

  /**
   * Pausa a reprodução de áudio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Alterna entre reprodução e pausa
   */
  togglePlayPause(): void {
    if (this.playbackState.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Define o tempo de reprodução (em segundos)
   */
  seek(time: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }

  /**
   * Define a velocidade de reprodução (0.5 a 2.0)
   */
  setPlaybackRate(rate: number): void {
    if (this.audio) {
      const clampedRate = Math.max(0.5, Math.min(2.0, rate));
      this.audio.playbackRate = clampedRate;
    }
  }

  /**
   * Define o volume (0 a 1)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audio.volume = clampedVolume;
    }
  }

  /**
   * Avança 10 segundos
   */
  skipForward(seconds: number = 10): void {
    if (this.audio) {
      this.seek(this.audio.currentTime + seconds);
    }
  }

  /**
   * Retrocede 10 segundos
   */
  skipBackward(seconds: number = 10): void {
    if (this.audio) {
      this.seek(this.audio.currentTime - seconds);
    }
  }

  /**
   * Para a reprodução e limpa o áudio
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateState({ isPlaying: false, currentTime: 0 });
    }
  }

  /**
   * Obtém o estado atual de reprodução
   */
  getState(): AudioPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Formata tempo em minutos:segundos
   */
  static formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Registra um listener para mudanças de estado
   */
  subscribe(listener: (state: AudioPlaybackState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Atualiza o estado e notifica listeners
   */
  private updateState(partial: Partial<AudioPlaybackState>): void {
    this.playbackState = { ...this.playbackState, ...partial };
    this.listeners.forEach(listener => listener(this.playbackState));
  }

  /**
   * Obtém uma faixa de áudio pelo ID
   */
  getTrack(trackId: string): AudioTrack | undefined {
    return this.audioTracks.get(trackId);
  }

  /**
   * Registra uma faixa de áudio
   */
  registerTrack(track: AudioTrack): void {
    this.audioTracks.set(track.id, track);
  }

  /**
   * Limpa todos os dados
   */
  destroy(): void {
    this.stop();
    if (this.audio) {
      this.audio.src = '';
    }
    this.listeners.clear();
    this.audioTracks.clear();
  }
}

export default AudioService.getInstance();
