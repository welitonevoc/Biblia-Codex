/**
 * Serviço de Text-to-Speech (TTS) para Bible Codex
 * Usa a API nativa do navegador (Web Speech API)
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  lang?: string;
}

export interface TTSVoice {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

class TTSService {
  private static instance: TTSService;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    this.isInitialized = this.voices.length > 0;
  }

  getVoices(): TTSVoice[] {
    const ptBRVoices = this.voices.filter(v => v.lang.startsWith('pt'));
    const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
    
    return [
      ...ptBRVoices.map(v => ({ name: v.name, lang: v.lang, voice: v })),
      ...enVoices.map(v => ({ name: v.name, lang: v.lang, voice: v }))
    ];
  }

  getDefaultPortugueseVoice(): SpeechSynthesisVoice | null {
    const ptVoice = this.voices.find(v => 
      v.lang.includes('pt-BR') || v.lang.includes('pt_BR')
    );
    if (ptVoice) return ptVoice;
    
    return this.voices.find(v => v.lang.includes('pt')) || null;
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

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

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(event);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  speakVerse(bookName: string, chapter: number, verse: number, text: string, options: TTSOptions = {}): Promise<void> {
    const formattedText = `${bookName} capítulo ${chapter}, versículo ${verse}. ${text}`;
    return this.speak(formattedText, options);
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }

  isAvailable(): boolean {
    return 'speechSynthesis' in window;
  }
}

export const ttsService = TTSService.getInstance();

export const isTTSSupported = 'speechSynthesis' in window;

export const getAvailableVoices = () => ttsService.getVoices();

export const speakText = (text: string, options?: TTSOptions) => 
  ttsService.speak(text, options);

export const speakVerse = (bookName: string, chapter: number, verse: number, text: string, options?: TTSOptions) =>
  ttsService.speakVerse(bookName, chapter, verse, text, options);

export const stopSpeaking = () => ttsService.stop();

export const isCurrentlySpeaking = () => ttsService.isSpeaking();
