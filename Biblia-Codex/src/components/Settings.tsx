import React, { useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sun, Moon, Coffee, Smartphone, Minus, Plus, Book, Cpu,
  Check, AlertCircle, Upload, Loader2, Layout, Zap,
  Eye, GraduationCap, BookOpen, Type, PanelsTopLeft, Sparkles,
  ZapOff, Flame, Lightbulb, CircleDot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createAiModule } from '../services/dictionaryService';
import { Capacitor } from '@capacitor/core';
import { ensureStoragePermission } from '../services/permissionsService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_EXTENSIONS = ['.mybible', '.sqlite3', '.sqlite', '.mybl', '.mybls', '.twm', '.conf', '.dat', '.epub'];

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Toggle — no border row ── */
const Toggle: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label, active, onClick
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-[var(--radius-lg)] px-4 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-hover)]"
  >
    <span className="ui-text text-sm font-medium text-bible-text/85">{label}</span>
    <div className={cn(
      'relative h-[22px] w-10 rounded-full transition-colors duration-200 shrink-0',
      active ? 'bg-bible-accent' : 'bg-[var(--surface-3)]'
    )}>
      <div className={cn(
        'absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200',
        active ? 'left-[calc(100%-19px)]' : 'left-[3px]'
      )} />
    </div>
  </button>
);

/* ── Section group — no card border ── */
const SettingsSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-2 px-4 py-2">
      <Icon className="h-3.5 w-3.5 text-bible-accent" strokeWidth={2} />
      <span className="text-xs font-medium uppercase tracking-wider text-bible-text">{title}</span>
    </div>
    <div className="overflow-hidden rounded bg-bible-surface">
      {children}
    </div>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const {
    config, settings, setMode, setFontSize, setLineHeight,
    setLetterSpacing, setFontFamily, setAccentColor, updateSettings,
    toggleSetting, refreshModules, availableVersions, availableDictionaries,
    selectedDictionaryModule, setSelectedDictionaryModule,
    setAnimationStyle, setAnimationIntensity, setAnimationSpeed,
    setLightingEffect, setPageTransition, toggleGlow, toggleParticles
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState<string>('');
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  const installedCount = availableVersions.length + availableDictionaries.length;
  const accentColors = ['#5a5a40', '#8c6d46', '#3f6b5b', '#7a3e3e', '#3b5f8a', '#5a6b8a'];
  const lineHeights = [1.4, 1.5, 1.6, 1.8, 2.0];
  const fontSizes = [14, 16, 18, 20, 22, 24];

  const animationStyles = [
    { id: 'suave' as const, label: 'Suave', icon: Sparkles },
    { id: 'elastica' as const, label: 'Elástica', icon: Flame },
    { id: 'fade' as const, label: 'Fade', icon: ZapOff },
    { id: 'slide' as const, label: 'Slide', icon: Zap },
    { id: 'scale' as const, label: 'Scale', icon: Plus },
    { id: 'glow' as const, label: 'Glow', icon: Lightbulb },
    { id: 'neon' as const, label: 'Neon', icon: CircleDot },
    { id: 'fluid' as const, label: 'Fluid', icon: Sparkles },
  ];

  const animationIntensities = [
    { id: 'leve' as const, label: 'Leve' },
    { id: 'moderada' as const, label: 'Moderada' },
    { id: 'intensa' as const, label: 'Intensa' },
  ];

  const animationSpeeds = [
    { id: 'lento' as const, label: 'Lento' },
    { id: 'normal' as const, label: 'Normal' },
    { id: 'rapido' as const, label: 'Rápido' },
  ];

  const lightingEffects = [
    { id: 'none' as const, label: 'Nenhum', icon: ZapOff },
    { id: 'brilho' as const, label: 'Brilho', icon: Lightbulb },
    { id: 'glow' as const, label: 'Glow', icon: Flame },
    { id: 'shadow' as const, label: 'Shadow', icon: Moon },
    { id: 'particles' as const, label: 'Particles', icon: Sparkles },
    { id: 'aurora' as const, label: 'Aurora', icon: Sun },
  ];

  const pageTransitions = [
    { id: 'fade' as const, label: 'Fade' },
    { id: 'slide' as const, label: 'Slide' },
    { id: 'flip' as const, label: 'Flip' },
    { id: 'cube' as const, label: 'Cube' },
    { id: 'cover' as const, label: 'Cover' },
    { id: 'zoom' as const, label: 'Zoom' },
  ];

  const getModuleDisplayName = (value: string) =>
    value.replace(/\.(mybible|sqlite3|sqlite|mybl|mybls|twm|epub|conf|dat)$/i, '')
      .replace(/\.(dct|dict|cmt|comment|xref|ref|xrefs|bok|book|devot)$/i, '').trim();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus('idle');
    setImportError('');

    const normalizedName = file.name.toLowerCase();
    const supportedFile = SUPPORTED_EXTENSIONS.some((ext) => normalizedName.endsWith(ext));

    if (!supportedFile) {
      setImportStatus('error');
      setImportError('Formato não suportado.');
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isAndroidNative) {
      const hasPermission = await ensureStoragePermission();
      if (!hasPermission) {
        setImportStatus('error');
        setImportError('Permissão negada.');
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    try {
      const { importModule } = await import('../services/moduleService');
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => { const r = reader.result as string; resolve(r.split(',')[1].replace(/\s/g, '')); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await importModule(fileData, file.name);
      await refreshModules();
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportError(error instanceof Error ? error.message : 'Falha ao importar.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const themes = [
    { id: 'linen', icon: Sun, label: 'Linho' },
    { id: 'sepia', icon: Coffee, label: 'Sépia' },
    { id: 'night', icon: Moon, label: 'Vigília' },
    { id: 'eclipse', icon: Smartphone, label: 'Eclipse' },
  ];

  const fonts = [
    { id: 'Untitled Serif', label: 'Clássica' },
    { id: 'Serif', label: 'Serif' },
    { id: 'Sans Serif', label: 'Moderna' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[150] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-[200] flex flex-col w-full max-w-sm"
            style={{
              background: 'var(--surface-overlay)',
              backdropFilter: 'blur(24px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
              boxShadow: 'var(--shadow-float)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ paddingTop: 'var(--sat)' }}
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-bible-text">Ajustes</h2>
                <p className="ui-text text-xs text-bible-text/45 mt-0.5">Personalize sua experiência</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-bible-surface rounded" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-20">

              {/* ── Tema ── */}
              <SettingsSection title="Tema de Leitura" icon={Eye}>
                <div className="grid grid-cols-4 gap-2 p-3">
                  {themes.map((theme) => {
                    const isActive = config.mode === theme.id;
                    return (
                      <motion.button
                        key={theme.id}
                        onClick={() => setMode(theme.id as typeof config.mode)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] py-3 transition-all duration-150',
                          isActive ? 'text-bible-bg' : 'text-bible-text/60 hover:text-bible-text'
                        )}
                        style={{
                          background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                          boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                        }}
                      >
                        <theme.icon className="h-4 w-4" strokeWidth={2} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">{theme.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </SettingsSection>

              {/* ── Tamanho e fonte ── */}
              <SettingsSection title="Tipografia" icon={Type}>
                {/* Font family */}
                <div className="flex gap-2 p-3">
                  {fonts.map((font) => {
                    const isActive = config.fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => setFontFamily(font.id as typeof config.fontFamily)}
                        className={cn(
                          'flex-1 rounded-[var(--radius-md)] py-2.5 text-xs font-bold transition-all duration-150',
                          isActive ? 'text-bible-bg' : 'text-bible-text/60 hover:text-bible-text'
                        )}
                        style={{
                          background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                          boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                        }}
                      >
                        {font.label}
                      </button>
                    );
                  })}
                </div>

                <div className="divider-bible mx-4" />

                {/* Font size */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="ui-text text-sm text-bible-text/60">Tamanho</span>
                  <div
                    className="flex items-center gap-3 rounded-[var(--radius-full)] px-1"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <button
                      onClick={() => setFontSize(Math.max(9, config.fontSize - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-3)]"
                    >
                      <Minus className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                    <span className="ui-text min-w-8 text-center text-sm font-bold">{config.fontSize}</span>
                    <button
                      onClick={() => setFontSize(Math.min(36, config.fontSize + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-3)]"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Line height */}
                <div className="px-4 py-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Altura da Linha</div>
                  <div className="flex gap-1.5">
                    {lineHeights.map((value) => {
                      const isActive = config.lineHeight === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setLineHeight(value)}
                          className={cn(
                            'flex-1 rounded-[var(--radius-md)] py-2 text-xs font-bold transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/55'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          {value.toFixed(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Accent color */}
                <div className="px-4 py-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-3">Cor de destaque</div>
                  <div className="flex gap-2">
                    {accentColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className="relative h-7 w-7 rounded-full transition-all duration-150 hover:scale-110"
                        style={{ backgroundColor: color }}
                      >
                        {config.accentColor === color && (
                          <motion.div
                            layoutId="colorActive"
                            className="absolute inset-0 rounded-full"
                            style={{ boxShadow: `0 0 0 2px var(--bg-bible), 0 0 0 4px ${color}` }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsSection>

              {/* ── Exibição ── */}
              <SettingsSection title="Exibição" icon={BookOpen}>
                <Toggle label="Modo Parágrafo" active={settings.textDisplay.paragraphMode} onClick={() => toggleSetting('textDisplay', 'paragraphMode')} />
                <Toggle label="Números de Versículo" active={settings.textDisplay.verseNumbers} onClick={() => toggleSetting('textDisplay', 'verseNumbers')} />
                <Toggle label="Palavras de Jesus" active={settings.textDisplay.wordsOfJesusRed} onClick={() => toggleSetting('textDisplay', 'wordsOfJesusRed')} />
                <Toggle label="Títulos de Capítulos" active={settings.textDisplay.chapterTitles} onClick={() => toggleSetting('textDisplay', 'chapterTitles')} />
              </SettingsSection>

              {/* ── Estudo ── */}
              <SettingsSection title="Estudo" icon={GraduationCap}>
                <div className="p-3 space-y-1.5">
                  <div className="text-xs font-medium text-bible-text-muted mb-2">Dicionário</div>
                  <button
                    onClick={() => setSelectedDictionaryModule(createAiModule('dictionary'))}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-all duration-150',
                      selectedDictionaryModule?.id === 'ai_assistant'
                        ? 'text-bible-bg'
                        : 'text-bible-text/70 hover:bg-[var(--surface-hover)]'
                    )}
                    style={{
                      background: selectedDictionaryModule?.id === 'ai_assistant' ? 'var(--accent-bible)' : undefined,
                      boxShadow: selectedDictionaryModule?.id === 'ai_assistant' ? 'var(--shadow-accent)' : undefined,
                    }}
                  >
                    <Cpu className="h-4 w-4" strokeWidth={2} />
                    <span className="ui-text text-sm font-semibold">Assistente IA</span>
                    {selectedDictionaryModule?.id === 'ai_assistant' && (
                      <Check className="ml-auto h-4 w-4" strokeWidth={2.5} />
                    )}
                  </button>
                  {availableDictionaries.slice(0, 2).map((dict) => (
                    <button
                      key={dict.id}
                      onClick={() => setSelectedDictionaryModule(dict as any)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-all duration-150',
                        selectedDictionaryModule?.id === dict.id
                          ? 'text-bible-bg'
                          : 'text-bible-text/70 hover:bg-[var(--surface-hover)]'
                      )}
                      style={{
                        background: selectedDictionaryModule?.id === dict.id ? 'var(--accent-bible)' : undefined,
                        boxShadow: selectedDictionaryModule?.id === dict.id ? 'var(--shadow-accent)' : undefined,
                      }}
                    >
                      <Book className="h-4 w-4" strokeWidth={1.8} />
                      <span className="ui-text text-sm font-semibold truncate">{getModuleDisplayName(dict.name)}</span>
                      {selectedDictionaryModule?.id === dict.id && (
                        <Check className="ml-auto h-4 w-4 shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="divider-bible mx-4" />

                <Toggle
                  label="Sugestões de IA"
                  active={settings.ai.autoSuggest}
                  onClick={() => updateSettings({ ai: { ...settings.ai, autoSuggest: !settings.ai.autoSuggest } })}
                />
              </SettingsSection>

              {/* ── Navegação ── */}
              <SettingsSection title="Navegação" icon={PanelsTopLeft}>
                <Toggle label="Animações" active={settings.navigation.navAnimation} onClick={() => toggleSetting('navigation', 'navAnimation')} />
                <Toggle label="Popup de Referência" active={settings.behavior.bibleLinkPopup} onClick={() => toggleSetting('behavior', 'bibleLinkPopup')} />
              </SettingsSection>

              {/* ── Animação (Premium) ── */}
              <SettingsSection title="Animação" icon={Sparkles}>
                {/* Estilo de Animação */}
                <div className="p-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Estilo</div>
                  <div className="grid grid-cols-4 gap-2">
                    {animationStyles.map((style) => {
                      const isActive = settings.animation.style === style.id;
                      return (
                        <motion.button
                          key={style.id}
                          onClick={() => setAnimationStyle(style.id)}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] py-2.5 transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/60 hover:text-bible-text'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          <style.icon className="h-3.5 w-3.5" strokeWidth={2} />
                          <span className="text-[9px] font-bold">{style.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Intensidade */}
                <div className="px-4 py-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Intensidade</div>
                  <div className="flex gap-1.5">
                    {animationIntensities.map((intensity) => {
                      const isActive = settings.animation.intensity === intensity.id;
                      return (
                        <button
                          key={intensity.id}
                          onClick={() => setAnimationIntensity(intensity.id)}
                          className={cn(
                            'flex-1 rounded-[var(--radius-md)] py-2 text-xs font-bold transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/55'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          {intensity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Velocidade */}
                <div className="px-4 py-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Velocidade</div>
                  <div className="flex gap-1.5">
                    {animationSpeeds.map((speed) => {
                      const isActive = settings.animation.speed === speed.id;
                      return (
                        <button
                          key={speed.id}
                          onClick={() => setAnimationSpeed(speed.id)}
                          className={cn(
                            'flex-1 rounded-[var(--radius-md)] py-2 text-xs font-bold transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/55'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          {speed.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Efeito de Iluminação */}
                <div className="p-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Iluminação</div>
                  <div className="grid grid-cols-3 gap-2">
                    {lightingEffects.map((effect) => {
                      const isActive = settings.animation.lighting === effect.id;
                      return (
                        <motion.button
                          key={effect.id}
                          onClick={() => setLightingEffect(effect.id)}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5 transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/60 hover:text-bible-text'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          <effect.icon className="h-3.5 w-3.5" strokeWidth={2} />
                          <span className="text-[10px] font-bold">{effect.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Transição de Página */}
                <div className="px-4 py-3">
                  <div className="ui-text text-xs text-bible-text/45 mb-2">Transição de Página</div>
                  <div className="flex gap-1.5">
                    {pageTransitions.map((transition) => {
                      const isActive = settings.animation.pageTransition === transition.id;
                      return (
                        <button
                          key={transition.id}
                          onClick={() => setPageTransition(transition.id)}
                          className={cn(
                            'flex-1 rounded-[var(--radius-md)] py-2 text-xs font-bold transition-all duration-150',
                            isActive ? 'text-bible-bg' : 'text-bible-text/55'
                          )}
                          style={{
                            background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                            boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                          }}
                        >
                          {transition.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="divider-bible mx-4" />

                {/* Toggles de efeitos */}
                <Toggle label="Brilho (Glow)" active={settings.animation.enableGlow} onClick={toggleGlow} />
                <Toggle label="Partículas" active={settings.animation.enableParticles} onClick={toggleParticles} />
              </SettingsSection>

              {/* ── Biblioteca ── */}
              <SettingsSection title="Biblioteca" icon={Layout}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="ui-text text-sm text-bible-text/60">Módulos instalados</span>
                  <span
                    className="ui-text text-sm font-bold rounded-full px-3 py-1"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    {installedCount}
                  </span>
                </div>

                <div className="px-3 pb-3">
                  <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      disabled={isImporting}
                      className={cn(
                        'w-full py-3.5 flex items-center justify-center gap-2 ui-text text-sm font-bold rounded-[var(--radius-lg)] transition-all',
                        isImporting ? 'opacity-60 cursor-wait' : ''
                      )}
                      style={{
                        background: 'var(--accent-bible)',
                        color: 'var(--accent-bible-contrast)',
                        boxShadow: 'var(--shadow-accent)',
                      }}
                    >
                      {isImporting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Upload className="h-4 w-4" strokeWidth={2} />
                      }
                      {isImporting ? 'Importando...' : 'Adicionar módulo'}
                    </motion.button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isImporting}
                      className={cn(
                        'absolute inset-0 h-full w-full cursor-pointer opacity-0',
                        isImporting && 'pointer-events-none'
                      )}
                      accept={isAndroidNative ? '*/*' : '.mybible,.sqlite3,.sqlite,.mybl,.mybls,.twm,.conf,.dat,.epub'}
                    />
                  </div>

                  <AnimatePresence>
                    {importStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-xs font-semibold text-green-600"
                        style={{ background: 'rgba(34,197,94,0.10)' }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Módulo importado com sucesso.
                      </motion.div>
                    )}
                    {importStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-xs font-semibold text-red-500"
                        style={{ background: 'rgba(239,68,68,0.10)' }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {importError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SettingsSection>

              {/* ── Sistema ── */}
              <SettingsSection title="Sistema" icon={Zap}>
                <div className="flex gap-2 p-3">
                  {[
                    { id: 'pt-BR', label: 'Português' },
                    { id: 'en', label: 'English' },
                  ].map((lang) => {
                    const isActive = settings.language === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => updateSettings({ language: lang.id as 'pt-BR' | 'en' })}
                        className={cn(
                          'flex-1 rounded-[var(--radius-md)] py-2.5 text-xs font-bold transition-all duration-150',
                          isActive ? 'text-bible-bg' : 'text-bible-text/60'
                        )}
                        style={{
                          background: isActive ? 'var(--accent-bible)' : 'var(--surface-2)',
                          boxShadow: isActive ? 'var(--shadow-accent)' : undefined,
                        }}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </SettingsSection>
            </div>

            {/* Footer */}
            <div className="px-4 py-4 text-center">
              <div className="divider-bible mb-3" />
              <span className="ui-text text-[10px] text-bible-text/30 uppercase tracking-widest">Bíblia Codex v2.5</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};