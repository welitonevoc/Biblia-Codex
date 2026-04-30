import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Volume2, Settings2, ChevronLeft, Play, Pause, SkipBack, SkipForward,
  VolumeX, Volume1, Volume2 as VolumeIcon, Mic, Speaker,
  Languages, Zap, Check, AlertCircle
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

const TTSVoiceCard: React.FC<{
  name: string;
  language: string;
  gender: 'male' | 'female';
  quality: 'standard' | 'premium';
  selected: boolean;
  onSelect: () => void;
}> = ({ name, language, gender, quality, selected, onSelect }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onSelect}
    className={cn(
      "w-full p-4 rounded-xl border-2 text-left transition-all",
      selected
        ? "border-bible-accent bg-amber-100"
        : "border-bible-border bg-bible-surface hover:border-bible-accent"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-bible-accent/10">
          <Mic className="w-4 h-4 text-bible-accent" />
        </div>
        <div>
          <div className="font-medium text-bible-text">{name}</div>
          <div className="text-xs text-bible-text-muted">
            {language} • {gender === 'male' ? 'Masculino' : 'Feminino'} • {quality === 'premium' ? 'Premium' : 'Padrão'}
          </div>
        </div>
      </div>
      {selected && <Check className="w-5 h-5 text-bible-accent" />}
    </div>
  </motion.button>
);

export const TTSSettings: React.FC = () => {
  const { setActiveTab, settings, updateSettings } = useAppContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('pt-BR-Female-1');
  const [ttsSettings, setTtsSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    language: 'pt-BR'
  });

  const voices = [
    { id: 'pt-BR-Female-1', name: 'Maria', language: 'Português (BR)', gender: 'female' as const, quality: 'premium' as const },
    { id: 'pt-BR-Male-1', name: 'João', language: 'Português (BR)', gender: 'male' as const, quality: 'premium' as const },
    { id: 'en-US-Female-1', name: 'Emma', language: 'English (US)', gender: 'female' as const, quality: 'standard' as const },
    { id: 'es-ES-Female-1', name: 'Sofia', language: 'Español (ES)', gender: 'female' as const, quality: 'standard' as const },
  ];

  const handlePlaySample = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      // Stop TTS
      return;
    }

    setIsPlaying(true);

    try {
      const utterance = new SpeechSynthesisUtterance(
        "João 3:16 - Porque Deus amou o mundo de tanto que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna."
      );

      // Configure voice
      const voices = speechSynthesis.getVoices();
      const selectedVoiceObj = voices.find(voice =>
        voice.name.toLowerCase().includes(selectedVoice.toLowerCase().split('-')[1] || 'female')
      );
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      utterance.rate = ttsSettings.rate;
      utterance.pitch = ttsSettings.pitch;
      utterance.volume = ttsSettings.volume;
      utterance.lang = ttsSettings.language;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, selectedVoice, ttsSettings]);

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
            className="p-2 rounded-lg bg-bible-surface hover:bg-bible-surface-strong transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-bible-text" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-bible-accent/10">
              <Volume2 className="w-6 h-6 text-bible-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bible-text">Text-to-Speech</h1>
              <p className="text-sm text-bible-text-muted">Configure a leitura por voz</p>
            </div>
          </div>
        </motion.div>

        {/* Voice Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-5"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-bible-accent/10">
                <Mic className="w-4 h-4 text-bible-accent" />
              </div>
              <h2 className="text-sm font-bold text-bible-text">Voz</h2>
            </div>
            <p className="text-xs text-bible-text-muted ml-9">Escolha uma voz para leitura</p>
          </div>

          <div className="space-y-3">
            {voices.map((voice) => (
              <TTSVoiceCard
                key={voice.id}
                name={voice.name}
                language={voice.language}
                gender={voice.gender}
                quality={voice.quality}
                selected={selectedVoice === voice.id}
                onSelect={() => setSelectedVoice(voice.id)}
              />
            ))}
          </div>

          {/* Sample Playback */}
          <div className="mt-6 p-4 rounded-xl bg-bible-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-bible-text">Testar Voz</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlaySample}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  isPlaying
                    ? "bg-red-500 text-white"
                    : "bg-bible-accent text-white hover:bg-bible-accent-strong"
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 inline mr-2" />
                    Parar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-2" />
                    Ouvir Amostra
                  </>
                )}
              </motion.button>
            </div>
            <p className="text-xs text-bible-text-muted">
              "João 3:16 - Porque Deus amou o mundo de tanto que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna."
            </p>
          </div>
        </motion.section>

        {/* Audio Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-5"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-bible-accent/10">
                <Settings2 className="w-4 h-4 text-bible-accent" />
              </div>
              <h2 className="text-sm font-bold text-bible-text">Configurações de Áudio</h2>
            </div>
            <p className="text-xs text-bible-text-muted ml-9">Ajuste velocidade, tom e volume</p>
          </div>

          <div className="space-y-6">
            {/* Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-bible-text">Velocidade</span>
                <span className="text-sm text-bible-accent font-bold">{ttsSettings.rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsSettings.rate}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-bible-surface rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-bible-text-muted">
                <span>0.5x</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-bible-text">Tom</span>
                <span className="text-sm text-bible-accent font-bold">{ttsSettings.pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsSettings.pitch}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-bible-surface rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-bible-text-muted">
                <span>Grave</span>
                <span>Agudo</span>
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-bible-text">Volume</span>
                <span className="text-sm text-bible-accent font-bold">{Math.round(ttsSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={ttsSettings.volume}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-bible-surface rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-bible-text-muted">
                <span>Mudo</span>
                <span>Máximo</span>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-bible-text">Idioma</span>
              <select
                value={ttsSettings.language}
                onChange={(e) => setTtsSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text focus:outline-none focus:ring-2 focus:ring-bible-accent"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español (España)</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card p-5"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-bible-accent/10">
                <Zap className="w-4 h-4 text-bible-accent" />
              </div>
              <h2 className="text-sm font-bold text-bible-text">Recursos</h2>
            </div>
            <p className="text-xs text-bible-text-muted ml-9">Funcionalidades da leitura por voz</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bible-surface">
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-bible-text">Reprodução Automática</div>
                  <div className="text-xs text-bible-text-muted">Continue lendo automaticamente</div>
                </div>
              </div>
              <div className={cn(
                'w-12 h-7 rounded-full p-1 transition-all shadow-inner',
                true ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong' : 'bg-bible-border'
              )}>
                <motion.div
                  animate={{ x: true ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-bible-surface">
              <div className="flex items-center gap-3">
                <SkipForward className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-bible-text">Controles de Avanço</div>
                  <div className="text-xs text-bible-text-muted">Pule versículos ou capítulos</div>
                </div>
              </div>
              <div className={cn(
                'w-12 h-7 rounded-full p-1 transition-all shadow-inner',
                true ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong' : 'bg-bible-border'
              )}>
                <motion.div
                  animate={{ x: true ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-bible-surface">
              <div className="flex items-center gap-3">
                <Speaker className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-sm font-medium text-bible-text">Modo Offline</div>
                  <div className="text-xs text-bible-text-muted">Funciona sem conexão</div>
                </div>
              </div>
              <div className={cn(
                'w-12 h-7 rounded-full p-1 transition-all shadow-inner',
                true ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong' : 'bg-bible-border'
              )}>
                <motion.div
                  animate={{ x: true ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              updateSettings({
                tts: {
                  enabled: true,
                  voice: selectedVoice,
                  rate: ttsSettings.rate,
                  pitch: ttsSettings.pitch,
                  volume: ttsSettings.volume,
                  language: ttsSettings.language
                }
              });
              setActiveTab('settings');
            }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Salvar Configurações
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};