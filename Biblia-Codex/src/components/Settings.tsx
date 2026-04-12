import React, { useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sun, Moon, Coffee, Smartphone, Minus, Plus, Book, Cpu,
  Check, AlertCircle, Upload, Loader2, Layout, Zap,
  Eye, GraduationCap, BookOpen, Type, PanelsTopLeft, Sparkles,
  ZapOff, Flame, Lightbulb, CircleDot, Settings2, Palette
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createAiModule } from '../services/dictionaryService';
import { Capacitor } from '@capacitor/core';
import { ensureStoragePermission } from '../services/permissionsService';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_EXTENSIONS = ['.mybible', '.sqlite3', '.sqlite', '.mybl', '.mybls', '.twm', '.conf', '.dat', '.epub'];

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Toggle premium ── */
const Toggle: React.FC<{ label: string; active: boolean; onClick: () => void; description?: string }> = ({
  label, active, onClick, description
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between rounded-xl px-4 py-3.5",
      "transition-all duration-200",
      "hover:bg-[var(--surface-hover)]"
    )}
  >
    <div className="text-left">
      <span className="text-sm font-medium text-[var(--text-bible)]">{label}</span>
      {description && (
        <p className="text-xs text-[var(--text-bible-muted)] mt-0.5">{description}</p>
      )}
    </div>
    <div className={cn(
      'relative h-[22px] w-10 rounded-full transition-all duration-300 shrink-0',
      active 
        ? 'bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)]' 
        : 'bg-[var(--surface-3)]'
    )}>
      <motion.div 
        animate={{ x: active ? 18 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          'absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-md',
          'flex items-center justify-center'
        )}
      >
        {active && <Check className="w-2.5 h-2.5 text-[var(--accent-bible)]" />}
      </motion.div>
    </div>
  </motion.button>
);

/* ── Section group premium ── */
const SettingsSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="h-4 w-4 text-[var(--accent-bible)]" strokeWidth={2} />
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-bible-muted)]">{title}</span>
    </div>
    <div className={cn(
      "overflow-hidden rounded-xl",
      "bg-[var(--surface-1)] border border-[var(--border-bible)]"
    )}>
      {children}
    </div>
  </div>
);

/* ── Color Picker premium ── */
const ColorPicker: React.FC<{
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}> = ({ colors, selected, onSelect }) => (
  <div className="flex gap-2 p-1">
    {colors.map((color) => (
      <motion.button
        key={color}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(color)}
        className={cn(
          "w-8 h-8 rounded-full transition-all duration-200",
          selected === color 
            ? "ring-2 ring-offset-2 ring-[var(--accent-bible)] ring-offset-[var(--surface-1)]" 
            : "hover:scale-110"
        )}
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
);

/* ── Option Pills premium ── */
const OptionPills: React.FC<{
  options: { id: string; label: string; icon?: React.ElementType }[];
  selected: string;
  onSelect: (id: string) => void;
}> = ({ options, selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 p-1">
    {options.map((opt) => {
      const Icon = opt.icon;
      const isSelected = selected === opt.id;
      return (
        <motion.button
          key={opt.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(opt.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
            "transition-all duration-200",
            isSelected
              ? "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-md shadow-[var(--accent-bible)]/20"
              : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)] hover:bg-[var(--surface-3)]"
          )}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {opt.label}
        </motion.button>
      );
    })}
  </div>
);

/* ── Slider premium ── */
const PremiumSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}> = ({ label, value, min, max, step = 1, onChange, formatValue }) => (
  <div className="px-4 py-3">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-[var(--text-bible)]">{label}</span>
      <span className="text-sm font-bold text-[var(--accent-bible)]">
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full h-2 rounded-full appearance-none cursor-pointer",
          "bg-[var(--surface-3)]",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-5",
          "[&::-webkit-slider-thumb]:h-5",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-[var(--accent-bible)]",
          "[&::-webkit-slider-thumb]:shadow-lg",
          "[&::-webkit-slider-thumb]:shadow-[var(--accent-bible)]/30",
          "[&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-110",
          "[&::-webkit-slider-thumb]:active:scale-95"
        )}
      />
      <div 
        className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] pointer-events-none"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex h-[85vh] w-full max-w-md flex-col overflow-hidden",
          "rounded-2xl border border-[var(--border-bible)]",
          "bg-[var(--surface-0)] shadow-xl"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-5",
          "border-b border-[var(--border-bible)]"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
            )}>
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-bible)]">Configurações</h2>
              <p className="text-xs text-[var(--text-bible-muted)]">{installedCount} módulos instalados</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              "bg-[var(--surface-1)] text-[var(--text-bible-muted)]",
              "hover:bg-[var(--surface-2)] hover:text-[var(--text-bible)]",
              "transition-all duration-200"
            )}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          
          {/* Theme Mode */}
          <SettingsSection title="Aparência" icon={Palette}>
            <div className="p-1 flex gap-1">
              {[
                { id: 'day', icon: Sun, label: 'Dia' },
                { id: 'dusk', icon: Coffee, label: 'Entardecer' },
                { id: 'night', icon: Moon, label: 'Noite' },
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode(mode.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg",
                      "text-xs font-medium transition-all duration-200",
                      config.mode === mode.id
                        ? "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-md"
                        : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </motion.button>
                );
              })}
            </div>
            <div className="px-4 py-2 border-t border-[var(--border-bible)]">
              <span className="text-xs font-medium text-[var(--text-bible-muted)]">Cor de destaque</span>
              <ColorPicker 
                colors={accentColors}
                selected={settings.accentColor || accentColors[0]}
                onSelect={(color) => setAccentColor(color)}
              />
            </div>
          </SettingsSection>

          {/* Typography */}
          <SettingsSection title="Tipografia" icon={Type}>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-bible)]">Tamanho</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFontSize(Math.max(12, config.fontSize - 2))}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      "bg-[var(--surface-2)] text-[var(--text-bible-muted)]",
                      "hover:bg-[var(--surface-3)] hover:text-[var(--text-bible)]",
                      "transition-all duration-200"
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="w-12 text-center font-bold text-[var(--accent-bible)]">{config.fontSize}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFontSize(Math.min(32, config.fontSize + 2))}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      "bg-[var(--surface-2)] text-[var(--text-bible-muted)]",
                      "hover:bg-[var(--surface-3)] hover:text-[var(--text-bible)]",
                      "transition-all duration-200"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <OptionPills
                options={[
                  { id: 'Untitled Serif', label: 'Serifada' },
                  { id: 'Serif', label: 'Serif' },
                  { id: 'Sans Serif', label: 'Sans' },
                ]}
                selected={config.fontFamily}
                onSelect={setFontFamily}
              />
            </div>
          </SettingsSection>

          {/* Animations */}
          <SettingsSection title="Animações" icon={Sparkles}>
            <div className="p-1 space-y-2">
              <OptionPills
                options={animationStyles}
                selected={settings.animationStyle || 'suave'}
                onSelect={(id) => setAnimationStyle(id as any)}
              />
              <OptionPills
                options={animationIntensities}
                selected={settings.animationIntensity || 'moderada'}
                onSelect={(id) => setAnimationIntensity(id as any)}
              />
              <OptionPills
                options={animationSpeeds}
                selected={settings.animationSpeed || 'normal'}
                onSelect={(id) => setAnimationSpeed(id as any)}
              />
            </div>
          </SettingsSection>

          {/* Effects */}
          <SettingsSection title="Efeitos Visuais" icon={Flame}>
            <div className="space-y-0.5">
              <Toggle 
                label="Brilho" 
                description="Efeito de brilho sutil"
                active={settings.glowEnabled || false} 
                onClick={toggleGlow} 
              />
              <Toggle 
                label="Partículas" 
                description="Partículas animadas no fundo"
                active={settings.particlesEnabled || false} 
                onClick={toggleParticles} 
              />
            </div>
            <div className="p-1 border-t border-[var(--border-bible)]">
              <span className="text-xs font-medium text-[var(--text-bible-muted)] px-3 block pt-3">Efeito de luz</span>
              <OptionPills
                options={lightingEffects.map(e => ({ id: e.id, label: e.label, icon: e.icon }))}
                selected={settings.lightingEffect || 'none'}
                onSelect={(id) => setLightingEffect(id as any)}
              />
            </div>
          </SettingsSection>

          {/* Import Module */}
          <SettingsSection title="Módulos" icon={Book}>
            <div className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_EXTENSIONS.join(',')}
                onChange={handleFileChange}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 p-4 rounded-xl",
                  "bg-[var(--surface-2)] border border-[var(--border-bible)]",
                  "text-sm font-medium text-[var(--text-bible)]",
                  "hover:bg-[var(--surface-3)] hover:border-[var(--accent-bible)]/30",
                  "transition-all duration-200",
                  isImporting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar módulo
                  </>
                )}
              </motion.button>
              
              {importStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-3 p-3 rounded-xl text-sm font-medium",
                    "bg-[var(--success-bible)]/10 text-[var(--success-bible)]",
                    "flex items-center gap-2"
                  )}
                >
                  <Check className="w-4 h-4" />
                  Módulo importado com sucesso!
                </motion.div>
              )}
              
              {importStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-3 p-3 rounded-xl text-sm font-medium",
                    "bg-[var(--danger-bible)]/10 text-[var(--danger-bible)]",
                    "flex items-center gap-2"
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  {importError || 'Erro ao importar'}
                </motion.div>
              )}
            </div>
          </SettingsSection>

        </div>
      </motion.div>
    </motion.div>
  );
};