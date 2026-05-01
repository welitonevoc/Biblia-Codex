/**
 * Serviço de Text-to-Speech (TTS) para Bible Codex
 * Suporta leitura guiada com highlight e scroll automático
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  lang?: string;
  onVerseChange?: (verseIndex: number, verseText: string) => void;
  onComplete?: () => void;
  onWordHighlight?: (wordIndex: number, word: string, charOffset: number) => void;
  scrollContainer?: HTMLElement | null;
  highlightVerseRef?: (verseNumber: number) => void;
}

export interface TTSVoice {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

export interface TTSVerse {
  verseNumber: number;
  text: string;
}

const PREFERRED_PT_BR_VOICE_NAMES = [
  'pt-BR-AntonioNeural',
  'pt-BR-FranciscaNeural',
  'AntonioNeural',
  'FranciscaNeural',
  'Antonio',
  'Francisca'
];

class TTSService {
  private static instance: TTSService;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;
  
  private verses: TTSVerse[] = [];
  private currentVerseIndex = 0;
  private isPlaying = false;
  private options: TTSOptions = {};
  private words: string[] = [];
  private currentWordIndex = 0;

  private cancelCurrentUtterance() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      this.synth.onvoiceschanged = () => this.loadVoices();
    } else {
      console.warn('[TTS] SpeechSynthesis não disponível neste ambiente');
    }
  }

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices();
      this.isInitialized = this.voices.length > 0;
      console.log('[TTS] Vozes carregadas:', this.voices.length);
    } catch (e) {
      console.error('[TTS] Erro ao carregar vozes:', e);
    }
  }

  getVoices(): TTSVoice[] {
    if (!this.voices) return [];
    const ptBRVoices = this.voices.filter(v => v.lang.startsWith('pt'));
    const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
    
    return [
      ...ptBRVoices.map(v => ({ name: v.name, lang: v.lang, voice: v })),
      ...enVoices.map(v => ({ name: v.name, lang: v.lang, voice: v }))
    ];
  }

  getDefaultPortugueseVoice(): SpeechSynthesisVoice | null {
    if (!this.voices) return null;
    const preferredByName = this.voices.find(v =>
      PREFERRED_PT_BR_VOICE_NAMES.some(name =>
        v.name.toLowerCase().includes(name.toLowerCase())
      )
    );
    if (preferredByName) return preferredByName;

    const ptVoice = this.voices.find(v => 
      v.lang.includes('pt-BR') || v.lang.includes('pt_BR')
    );
    if (ptVoice) return ptVoice;
    
    return this.voices.find(v => v.lang.includes('pt')) || null;
  }

  /**
   * Converte texto em versos numerados
   */
  private parseVerses(text: string): TTSVerse[] {
    const verses: TTSVerse[] = [];
    const verseRegex = /^(\d+)\.?\s*(.+)$/gm;
    let match;
    
    while ((match = verseRegex.exec(text)) !== null) {
      verses.push({
        verseNumber: parseInt(match[1]),
        text: match[2].trim()
      });
    }
    
    if (verses.length === 0) {
      const lines = text.split(/\n+/).filter(l => l.trim());
      lines.forEach((line, idx) => {
        const numMatch = line.match(/^(\d+)\.?\s*/);
        if (numMatch) {
          verses.push({
            verseNumber: parseInt(numMatch[1]),
            text: line.replace(numMatch[0], '').trim()
          });
        } else {
          verses.push({
            verseNumber: idx + 1,
            text: line.trim()
          });
        }
      });
    }
    
    return verses;
  }

  /**
   * Inicia a leitura de um capítulo inteiro com highlight
   */
  async speakChapter(
    verses: { verse: number; text: string }[],
    options: TTSOptions = {}
  ): Promise<void> {
    this.stop();
    this.isPlaying = true;
    this.currentVerseIndex = 0;
    this.options = options;
    
    this.verses = verses.map(v => ({
      verseNumber: v.verse,
      text: v.text.replace(/^[\d]+\.?\s*/, '')
    }));
    
    console.log('[TTS] Iniciando leitura de', this.verses.length, 'versículos');
    
    await this.speakNextVerse();
  }

  /**
   * Lê o próximo versículo
   */
  private async speakNextVerse(): Promise<void> {
    if (!this.isPlaying || this.currentVerseIndex >= this.verses.length) {
      this.isPlaying = false;
      this.options.onComplete?.();
      console.log('[TTS] Leitura concluída');
      return;
    }

    const verse = this.verses[this.currentVerseIndex];
    const fullText = `${verse.verseNumber}. ${verse.text}`;
    
    console.log('[TTS] Lendo versículo', verse.verseNumber);
    
    this.options.highlightVerseRef?.(verse.verseNumber);
    this.options.onVerseChange?.(this.currentVerseIndex, fullText);
    
    await this.speakSingleVerse(verse.text, {
      ...this.options,
      onComplete: () => {
        this.currentVerseIndex++;
        setTimeout(() => this.speakNextVerse(), 300);
      }
    });
  }

  /**
   * Lê um único versículo com callback
   */
  speakSingleVerse(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        console.warn('[TTS] SpeechSynthesis não disponível');
        resolve();
        return;
      }

      this.cancelCurrentUtterance();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options.rate ?? 0.9;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;
      
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        const defaultVoice = this.getDefaultPortugueseVoice();
        if (defaultVoice) {
          utterance.voice = defaultVoice;
        }
      }
      
      if (options.lang) {
        utterance.lang = options.lang;
      }

      console.log('[TTS] Falando com voz:', {
        name: utterance.voice?.name ?? 'default',
        lang: utterance.voice?.lang ?? utterance.lang ?? 'default',
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume
      });

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onComplete?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        console.error('[TTS] Erro:', event);
        options.onComplete?.();
        reject(event);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Método original para compatibilidade
   */
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    this.options = options;
    return this.speakSingleVerse(text, options);
  }

  pause() {
    this.synth.pause();
    this.isPlaying = false;
  }

  resume() {
    this.synth.resume();
    this.isPlaying = true;
  }

  stop() {
    this.cancelCurrentUtterance();
    this.isPlaying = false;
    this.currentVerseIndex = 0;
    this.currentWordIndex = 0;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  isPlayingTTS(): boolean {
    return this.isPlaying;
  }

  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }

  getCurrentVerseIndex(): number {
    return this.currentVerseIndex;
  }

  skipToVerse(index: number) {
    if (index >= 0 && index < this.verses.length) {
      this.currentVerseIndex = index;
    }
  }
}

export const ttsService = TTSService.getInstance();

export const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export const getAvailableVoices = () => ttsService.getVoices();

export const speakText = (text: string, options?: TTSOptions) => 
  ttsService.speak(text, options);

export const speakChapter = (verses: { verse: number; text: string }[], options?: TTSOptions) =>
  ttsService.speakChapter(verses, options);

export const stopSpeaking = () => ttsService.stop();

export const isCurrentlySpeaking = () => ttsService.isSpeaking();

export const isPlayingTTS = () => ttsService.isPlayingTTS();

export const getCurrentVerseIndex = () => ttsService.getCurrentVerseIndex();
