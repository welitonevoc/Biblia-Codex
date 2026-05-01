import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, Settings2, ChevronLeft, Play, Pause, SkipBack, SkipForward,
  VolumeX, Volume1, Mic, Speaker, Languages, Zap, Check, AlertCircle,
  Loader2, Volume, Radio, Waves
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { cn } from '../../utils/cn';
import { ttsService, TTSOptions } from '../../services/ttsService';

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  langCode: string;
  gender: 'male' | 'female';
  quality: 'standard' | 'premium' | 'neural';
  flag: string;
}

export const TTSSettings: React.FC = () => {
  const { setActiveTab, settings, updateSettings } = useAppContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [ttsSettings, setTtsSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsService.getVoices();
      const mappedVoices: VoiceOption[] = availableVoices.map(v => ({
        id: v.voice.name,
        name: v.voice.name.split(' ')[0] || v.voice.name,
        language: getLanguageName(v.lang),
        langCode: v.lang,
        gender: detectGender(v.voice.name),
        quality: detectQuality(v.voice.name),
        flag: getFlag(v.lang)
      }));

      // If no voices loaded yet, use defaults
      if (mappedVoices.length === 0) {
        setVoices([
          { id: 'pt-BR-Female', name: 'Maria', language: 'Português (Brasil)', langCode: 'pt-BR', gender: 'female', quality: 'neural', flag: '🇧🇷' },
          { id: 'pt-BR-Male', name: 'João', language: 'Português (Brasil)', langCode: 'pt-BR', gender: 'male', quality: 'neural', flag: '🇧🇷' },
          { id: 'en-US-Female', name: 'Emma', language: 'English (US)', langCode: 'en-US', gender: 'female', quality: 'standard', flag: '🇺🇸' },
        ]);
      } else {
        setVoices(mappedVoices);
        // Auto-select PT-BR voice
        const ptVoice = mappedVoices.find(v => v.langCode.startsWith('pt'));
        if (ptVoice && !selectedVoice) {
          setSelectedVoice(ptVoice);
        }
      }
      setIsLoadingVoices(false);
    };

    loadVoices();
    const interval = setInterval(loadVoices, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLanguageName = (lang: string): string => {
    const langs: Record<string, string> = {
      'pt': 'Português',
      'pt-BR': 'Português (Brasil)',
      'en': 'English',
      'en-US': 'English (US)',
      'es': 'Español',
      'fr': 'Français',
    };
    return langs[lang] || lang;
  };

  const getFlag = (lang: string): string => {
    if (lang.startsWith('pt')) return '🇧🇷';
    if (lang.startsWith('en')) return '🇺🇸';
    if (lang.startsWith('es')) return '🇪🇸';
    if (lang.startsWith('fr')) return '🇫🇷';
    return '🌐';
  };

  const detectGender = (name: string): 'male' | 'female' => {
    const femaleKeywords = ['female', 'maria', 'emma', 'sofia', 'francisca', 'alice', 'ana'];
    return femaleKeywords.some(k => name.toLowerCase().includes(k)) ? 'female' : 'male';
  };

  const detectQuality = (name: string): 'standard' | 'premium' | 'neural' => {
    if (name.toLowerCase().includes('neural')) return 'neural';
    if (name.toLowerCase().includes('premium')) return 'premium';
    return 'standard';
  };

  const handlePlaySample = useCallback(async () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      const text = "João 3:16 - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.";

      const options: TTSOptions = {
        rate: ttsSettings.rate,
        pitch: ttsSettings.pitch,
        volume: ttsSettings.volume,
      };

      if (selectedVoice) {
        const voiceObj = ttsService.getVoices().find(v => v.voice.name === selectedVoice.id);
        if (voiceObj) {
          options.voice = voiceObj.voice;
        }
      }

      await ttsService.speak(text, {
        ...options,
        onComplete: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, selectedVoice, ttsSettings]);

  const handleSave = () => {
    updateSettings({
      tts: {
        enabled: true,
        voice: selectedVoice?.id || 'default',
        rate: ttsSettings.rate,
        pitch: ttsSettings.pitch,
        volume: ttsSettings.volume,
        language: selectedVoice?.langCode || 'pt-BR'
      }
    });
    setActiveTab('settings');
  };

  const getVolumeIcon = () => {
    if (ttsSettings.volume === 0) return VolumeX;
    if (ttsSettings.volume < 0.5) return Volume1;
    return Volume;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-lg bg-[var(--surface-bible)] hover:bg-[var(--surface-bible-strong)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text-bible)]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--accent-bible)]/10 shadow-[0_0_20px_rgba(var(--accent-bible-rgb),0.2)]">
              <Volume2 className="w-6 h-6 text-[var(--accent-bible)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-bible)]" style={{ fontFamily: 'var(--font-display)' }}>Text-to-Speech</h1>
              <p className="text-sm text-[var(--text-bible-muted)]">Configure a leitura por voz da Bíblia</p>
            </div>
          </div>
        </motion.div>

        {/* Voice Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 overflow-hidden"
        >
          <div className="p-5 border-b border-[var(--border-bible)]/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-[var(--accent-bible)]/10">
                <Mic className="w-4 h-4 text-[var(--accent-bible)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-bible)]">Seleção de Voz</h2>
                <p className="text-xs text-[var(--text-bible-muted)]">Escolha a voz para leitura</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {isLoadingVoices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-bible)]" />
                <span className="ml-2 text-sm text-[var(--text-bible-muted)]">Carregando vozes...</span>
              </div>
            ) : (
              voices.map((voice) => (
                <motion.button
                  key={voice.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedVoice(voice)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                    "flex items-center gap-4 cursor-pointer",
                    selectedVoice?.id === voice.id
                      ? "border-[var(--accent-bible)] bg-[var(--accent-bible)]/5 shadow-[0_0_20px_rgba(var(--accent-bible-rgb),0.15)]"
                      : "border-[var(--border-bible)] bg-[var(--surface-bible)] hover:border-[var(--accent-bible)]/30"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl",
                    selectedVoice?.id === voice.id
                      ? "bg-[var(--accent-bible)]/20"
                      : "bg-[var(--surface-bible-strong)]"
                  )}>
                    <Mic className={cn(
                      "w-5 h-5",
                      selectedVoice?.id === voice.id
                        ? "text-[var(--accent-bible)]"
                        : "text-[var(--text-bible-muted)]"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{voice.flag}</span>
                      <span className="font-semibold text-[var(--text-bible)]">{voice.name}</span>
                      {selectedVoice?.id === voice.id && (
                        <Check className="w-4 h-4 text-[var(--accent-bible)] flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-bible-muted)]">{voice.language}</span>
                      <span className="text-[var(--text-bible-subtle)]">•</span>
                      <span className="text-xs text-[var(--text-bible-muted)]">
                        {voice.gender === 'male' ? 'Masculino' : 'Feminino'}
                      </span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        voice.quality === 'neural' && "bg-purple-500/10 text-purple-500",
                        voice.quality === 'premium' && "bg-amber-500/10 text-amber-500",
                        voice.quality === 'standard' && "bg-slate-500/10 text-slate-500"
                      )}>
                        {voice.quality === 'neural' ? 'Neural' : voice.quality === 'premium' ? 'Premium' : 'Padrão'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))
            )}

            {/* Sample Playback */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[var(--text-bible)]">Testar Voz</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlaySample}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                    "flex items-center gap-2 cursor-pointer",
                    isPlaying
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible)]/90 shadow-[0_0_20px_rgba(var(--accent-bible-rgb),0.3)]"
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Parar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Ouvir Amostra
                    </>
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-[var(--text-bible-muted)] italic">
                "João 3:16 - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."
              </p>
            </div>
          </div>
        </motion.section>

        {/* Audio Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 overflow-hidden"
        >
          <div className="p-5 border-b border-[var(--border-bible)]/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-[var(--accent-bible)]/10">
                <Settings2 className="w-4 h-4 text-[var(--accent-bible)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-bible)]">Configurações de Áudio</h2>
                <p className="text-xs text-[var(--text-bible-muted)]">Ajuste velocidade, tom e volume</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-[var(--accent-bible)]" />
                  <span className="text-sm font-medium text-[var(--text-bible)]">Velocidade</span>
                </div>
                <span className="text-sm font-bold text-[var(--accent-bible)] bg-[var(--accent-bible)]/10 px-3 py-1 rounded-lg">
                  {ttsSettings.rate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsSettings.rate}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-[var(--surface-bible-strong)] rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, var(--accent-bible) ${(ttsSettings.rate - 0.5) / 1.5 * 100}%, var(--surface-bible-strong) ${(ttsSettings.rate - 0.5) / 1.5 * 100}%)`
                }}
              />
              <div className="flex justify-between text-xs text-[var(--text-bible-muted)]">
                <span>Lento</span>
                <span>Normal</span>
                <span>Rápido</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[var(--accent-bible)]" />
                  <span className="text-sm font-medium text-[var(--text-bible)]">Tom de Voz</span>
                </div>
                <span className="text-sm font-bold text-[var(--accent-bible)] bg-[var(--accent-bible)]/10 px-3 py-1 rounded-lg">
                  {ttsSettings.pitch.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsSettings.pitch}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-[var(--surface-bible-strong)] rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, var(--accent-bible) ${(ttsSettings.pitch - 0.5) / 1.5 * 100}%, var(--surface-bible-strong) ${(ttsSettings.pitch - 0.5) / 1.5 * 100}%)`
                }}
              />
              <div className="flex justify-between text-xs text-[var(--text-bible-muted)]">
                <span>Grave</span>
                <span>Normal</span>
                <span>Agudo</span>
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VolumeIcon className="w-4 h-4 text-[var(--accent-bible)]" />
                  <span className="text-sm font-medium text-[var(--text-bible)]">Volume</span>
                </div>
                <span className="text-sm font-bold text-[var(--accent-bible)] bg-[var(--accent-bible)]/10 px-3 py-1 rounded-lg">
                  {Math.round(ttsSettings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ttsSettings.volume}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-[var(--surface-bible-strong)] rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, var(--accent-bible) ${ttsSettings.volume * 100}%, var(--surface-bible-strong) ${ttsSettings.volume * 100}%)`
                }}
              />
              <div className="flex justify-between text-xs text-[var(--text-bible-muted)]">
                <span>Mudo</span>
                <span>Médio</span>
                <span>Máximo</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 overflow-hidden"
        >
          <div className="p-5 border-b border-[var(--border-bible)]/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-[var(--accent-bible)]/10">
                <Zap className="w-4 h-4 text-[var(--accent-bible)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-bible)]">Recursos Disponíveis</h2>
                <p className="text-xs text-[var(--text-bible-muted)]">Funcionalidades da leitura por voz</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {[
              {
                icon: Play,
                title: 'Leitura Automática',
                description: 'Avança automaticamente versículo por versículo',
                color: 'text-green-500',
                bg: 'bg-green-500/10'
              },
              {
                icon: SkipForward,
                title: 'Controles de Navegação',
                description: 'Pule versículos ou capítulos facilmente',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                icon: Speaker,
                title: 'Funciona Offline',
                description: 'Leitura disponível mesmo sem internet',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10'
              },
              {
                icon: Waves,
                title: 'Múltiplos Idiomas',
                description: 'Suporte a português, inglês, espanhol e mais',
                color: 'text-amber-500',
                bg: 'bg-amber-500/10'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30 hover:border-[var(--accent-bible)]/20 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-bible)]">{feature.title}</div>
                  <div className="text-xs text-[var(--text-bible-muted)] mt-0.5">{feature.description}</div>
                </div>
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-10 py-3.5 rounded-2xl bg-[var(--accent-bible)] text-white font-semibold shadow-[0_0_30px_rgba(var(--accent-bible-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--accent-bible-rgb),0.4)] transition-all duration-200 cursor-pointer"
          >
            Salvar Configurações
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
