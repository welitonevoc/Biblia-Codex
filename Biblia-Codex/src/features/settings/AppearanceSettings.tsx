import React from 'react';
import { motion } from 'motion/react';
import {
  Sun, Type, Layout, Navigation2, Sparkles, Palette,
  Settings2, ArrowLeft, Check, Minus, Plus
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { THEME_OPTIONS } from '../theme/presets';

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; description?: string }> = ({
  icon: Icon,
  title,
  description
}) => (
  <div className="mb-5">
    <div className="flex items-center gap-2.5 mb-1">
      <div className="p-1.5 rounded-lg bg-bible-accent/10">
        <Icon className="w-4 h-4 text-bible-accent" />
      </div>
      <h2 className="text-sm font-bold text-bible-text">{title}</h2>
    </div>
    {description && <p className="text-xs text-bible-text-muted ml-9">{description}</p>}
  </div>
);

const Toggle: React.FC<{
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, description, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-xl p-4 transition-all bg-bible-surface hover:bg-bible-surface-strong"
  >
    <div className="flex-1 text-left">
      <span className="text-sm font-semibold text-bible-text">{label}</span>
      {description && <p className="text-xs text-bible-text-muted mt-0.5">{description}</p>}
    </div>
    <div className={cn(
      'w-12 h-7 rounded-full p-1 transition-all shadow-inner',
      active ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong' : 'bg-bible-border'
    )}>
      <motion.div
        animate={{ x: active ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-5 h-5 bg-white rounded-full shadow-md"
      />
    </div>
  </motion.button>
);

const ChoicePills: React.FC<{
  label: string;
  options: Array<string | number>;
  current: string | number;
  onSelect: (value: any) => void;
}> = ({ label, options, current, onSelect }) => (
  <div className="space-y-2.5">
    <div className="text-xs font-semibold text-bible-text-muted uppercase tracking-wider">{label}</div>
    <div className="flex flex-wrap gap-2">
      {options.map((value) => (
        <motion.button
          key={String(value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(value)}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-full transition-all",
            current === value
              ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
              : 'bg-bible-surface text-bible-text-muted hover:text-bible-text hover:bg-bible-surface-strong'
          )}
        >
          {String(value)}
        </motion.button>
      ))}
    </div>
  </div>
);

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

export const AppearanceSettings: React.FC = () => {
  const {
    config, settings, setMode, setFontSize, setLineHeight, setLetterSpacing,
    setFontFamily, setHorizontalMargin, updateSettings, toggleSetting,
    setUIGeometry, setNavigationStyle, setFontPreference, setActiveTab
  } = useAppContext();

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
            <ArrowLeft className="w-5 h-5 text-bible-text" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-bible-accent/10">
              <Palette className="w-6 h-6 text-bible-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-bible-text">Aparência</h1>
              <p className="text-sm text-bible-text-muted">Personalize a visualização</p>
            </div>
          </div>
        </motion.div>

        {/* Tema */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Sun} title="Tema" description="Escolha o esquema de cores" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {THEME_OPTIONS.slice(0, 12).map((theme, i) => (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(theme.id as any)}
                className={cn(
                  "relative p-3 rounded-xl border-2 text-xs font-bold transition-all overflow-hidden",
                  config.mode === theme.id
                    ? 'border-bible-accent shadow-lg'
                    : 'border-bible-border hover:border-bible-accent/50'
                )}
              >
                {config.mode === theme.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-bible-accent to-bible-accent-strong opacity-10" />
                )}
                <div className="relative">
                  <div className="flex items-center justify-center mb-1.5 text-2xl">
                    {theme.emoji}
                  </div>
                  <div>{theme.shortName}</div>
                  {config.mode === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      <Check className="w-3 h-3 text-bible-accent" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Tipografia */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Type} title="Tipografia" description="Fonte, tamanho e espaçamento" />

          {/* Font Size Control */}
          <div className="mb-5 p-4 rounded-xl bg-bible-surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-bible-text">Tamanho da Fonte</span>
              <div className="flex items-center gap-1 bg-bible-bg rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFontSize(Math.max(9, config.fontSize - 1))}
                  className="p-2 hover:bg-bible-surface rounded-md transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <motion.span
                  key={config.fontSize}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-sm font-bold min-w-8 text-center text-bible-accent"
                >
                  {config.fontSize}
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFontSize(Math.min(36, config.fontSize + 1))}
                  className="p-2 hover:bg-bible-surface rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            {/* Font Preview */}
            <div className="mt-3 p-3 rounded-lg bg-bible-bg">
              <div className="text-xs text-bible-text-muted mb-2 uppercase tracking-wider">
                {config.fontFamily} · {config.fontSize}px
              </div>
              <p
                style={{
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily === 'Sans Serif' ? 'system-ui, sans-serif' : config.fontFamily === 'Serif' ? 'Georgia, serif' : 'inherit'
                }}
                className="text-bible-text transition-all duration-200"
              >
                João 3:16 - Porque Deus amou o mundo de tanto que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.
              </p>
            </div>
          </div>

          <ChoicePills
            label="Fonte"
            options={['Untitled Serif', 'Serif', 'Sans Serif']}
            current={config.fontFamily}
            onSelect={setFontFamily}
          />
        </motion.section>

        {/* Geometria da Interface */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Layout} title="Geometria da Interface" description="Formas e estilos dos elementos" />

          <ChoicePills
            label="Estilo"
            options={['soft', 'sharp', 'pill', 'minimal', 'geometric', 'premium', 'circle', 'soft-square', 'glass', 'neon', 'brutal', 'elegant', 'cyber', 'vintage']}
            current={config.uiGeometry}
            onSelect={setUIGeometry}
          />
        </motion.section>

        {/* Navegação */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Navigation2} title="Navegação" description="Estilo de navegação e comportamento" />

          <ChoicePills
            label="Estilo"
            options={['bottom', 'floating', 'asymmetric', 'sidebar', 'top', 'hybrid', 'compact', 'dock', 'minimal']}
            current={config.navigationStyle}
            onSelect={setNavigationStyle}
          />

          <div className="mt-4 space-y-2">
            <Toggle
              label="Animações de Navegação"
              description="Transições suaves entre telas"
              active={settings.navigation.navAnimation}
              onClick={() => toggleSetting('navigation', 'navAnimation')}
            />
          </div>
        </motion.section>

        {/* Efeitos Visuais */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Sparkles} title="Efeitos Visuais" description="Animações, transições e efeitos especiais" />

          <div className="space-y-2">
            <Toggle
              label="Animações de Página"
              description="Transições entre seções"
              active={settings.animation.pageTransition !== 'none'}
              onClick={() => updateSettings({
                animation: {
                  ...settings.animation,
                  pageTransition: settings.animation.pageTransition === 'none' ? 'fade' : 'none'
                }
              })}
            />
            <Toggle
              label="Efeitos de Brilho"
              description="Elementos com efeito glow"
              active={settings.animation.enableGlow}
              onClick={() => updateSettings({
                animation: {
                  ...settings.animation,
                  enableGlow: !settings.animation.enableGlow
                }
              })}
            />
            <Toggle
              label="Partículas"
              description="Efeitos de fundo animados"
              active={settings.animation.enableParticles}
              onClick={() => updateSettings({
                animation: {
                  ...settings.animation,
                  enableParticles: !settings.animation.enableParticles
                }
              })}
            />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};