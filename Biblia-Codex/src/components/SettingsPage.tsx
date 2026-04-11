import React from 'react';
import { useAppContext } from '../AppContext';
import {
  Sun, BookOpen, Type, Layout, GraduationCap, Eye,
  Navigation2, Languages, Settings2, Palette, Minus, Plus, Check,
  Sparkles, Moon, Palette as PaletteIcon, Monitor, BookMarked
} from 'lucide-react';
import { VersionSelector } from './VersionSelector';
import { ModuleManagement } from './ModuleManagement';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { THEME_OPTIONS } from '../theme/presets';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; description?: string }> = ({ icon: Icon, title, description }) => (
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

export const SettingsPage: React.FC = () => {
  const {
    config, settings, setMode, setFontSize, setLineHeight, setLetterSpacing,
    setFontFamily, setHorizontalMargin, updateSettings, toggleSetting,
    setUIGeometry, setNavigationStyle, setFontPreference
  } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-bible-accent" />
                <span className="premium-kicker">Configurações</span>
              </div>
              <h1 className="premium-title mt-2 mb-1">Personalize</h1>
              <p className="premium-subtitle text-sm">
                Ajuste a aparência e comportamento do seu app
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bible-accent/10">
              <Settings2 className="w-6 h-6 text-bible-accent" />
            </div>
          </div>
        </motion.div>

        {/* Appearance Quick Controls */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Palette} title="Aparência" description="Ajustes rápidos de visualização" />

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
            {/* Font Preview - shows all current settings */}
            <div className="mt-3 p-3 rounded-lg bg-bible-bg">
              <div className="text-xs text-bible-text-muted mb-2 uppercase tracking-wider">
                {config.fontFamily} · {config.uiGeometry} · {config.navigationStyle}
              </div>
              <p 
                style={{ 
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily === 'Sans Serif' ? 'system-ui, sans-serif' : config.fontFamily === 'Serif' ? 'Georgia, serif' : 'inherit'
                }} 
                className={cn(
                  "text-bible-text transition-all duration-200",
                  config.uiGeometry === 'pill' && "rounded-full px-4 py-1 bg-bible-surface",
                  config.uiGeometry === 'minimal' && "text-sm tracking-tight",
                  config.uiGeometry === 'geometric' && "font-bold tracking-wider uppercase",
                  config.uiGeometry === 'soft' && "rounded-xl",
                  config.uiGeometry === 'premium' && "rounded-2xl border border-bible-accent/20 shadow-lg",
                  config.uiGeometry === 'circle' && "rounded-full text-center",
                  config.uiGeometry === 'soft-square' && "rounded-lg",
                  config.uiGeometry === 'glass' && "rounded-xl bg-white/30 backdrop-blur border border-white/20",
                  config.uiGeometry === 'neon' && "rounded-lg shadow-[0_0_15px_var(--accent-bible)] text-bible-accent",
                  config.uiGeometry === 'brutal' && "rounded-none border-2 border-black font-black uppercase",
                  config.uiGeometry === 'elegant' && "rounded-2xl italic font-serif",
                  config.uiGeometry === 'cyber' && "rounded-sm border border-bible-accent font-mono text-xs",
                  config.uiGeometry === 'vintage' && "rounded-sm font-serif italic"
                )}
              >
                João 3:16 - Porque Deus amou o mundo de tanto que deu o seu Filho unigênito, para que todo o que nele/crë não pereça, mas tenha a vida eterna.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ChoicePills
              label="Fonte"
              options={['Untitled Serif', 'Serif', 'Sans Serif']}
              current={config.fontFamily}
              onSelect={setFontFamily}
            />

            <ChoicePills
              label="Geometria"
              options={['soft', 'sharp', 'pill', 'minimal', 'geometric', 'premium', 'circle', 'soft-square', 'glass', 'neon', 'brutal', 'elegant', 'cyber']}
              current={config.uiGeometry}
              onSelect={setUIGeometry}
            />

            <ChoicePills
              label="Navegação"
              options={['bottom', 'floating', 'asymmetric', 'sidebar', 'top', 'hybrid', 'compact', 'dock', 'minimal']}
              current={config.navigationStyle}
              onSelect={setNavigationStyle}
            />
          </div>
        </motion.section>

        {/* Version */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={BookOpen} title="Versão Bíblica" description="Escolha sua tradução preferida" />
          <VersionSelector />
        </motion.section>

        {/* Modules */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Settings2} title="Módulos" description="Gerencie comentários, dicionários e mais" />
          <ModuleManagement />
        </motion.section>

        {/* Theme Selection */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Sun} title="Tema" description="Escolha o esquema de cores" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {THEME_OPTIONS.slice(0, 12).map((theme, i) => (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
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

        {/* Display Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Type} title="Exibição" description="Configurações de leitura" />
          <div className="space-y-2">
            <Toggle
              label="Modo Parágrafo"
              description="Exibe texto em formato de parágrafo"
              active={settings.textDisplay.paragraphMode}
              onClick={() => toggleSetting('textDisplay', 'paragraphMode')}
            />
            <Toggle
              label="Números de Versículo"
              description="Mostra os números dos versículos"
              active={settings.textDisplay.verseNumbers}
              onClick={() => toggleSetting('textDisplay', 'verseNumbers')}
            />
            <Toggle
              label="Palavras de Jesus em Vermelho"
              description="Destaca as palavras de Jesus"
              active={settings.textDisplay.wordsOfJesusRed}
              onClick={() => toggleSetting('textDisplay', 'wordsOfJesusRed')}
            />
            <Toggle
              label="Títulos de Capítulos"
              description="Exibe títulos dos capítulos"
              active={settings.textDisplay.chapterTitles}
              onClick={() => toggleSetting('textDisplay', 'chapterTitles')}
            />
            <Toggle
              label="Notas de Rodapé"
              description="Mostra notas de rodapé"
              active={settings.textDisplay.footnotes}
              onClick={() => toggleSetting('textDisplay', 'footnotes')}
            />
          </div>
        </motion.section>

        {/* Study Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={GraduationCap} title="Estudo" description="Ferramentas de estudo" />
          <div className="space-y-2">
            <Toggle
              label="Tags Strong"
              description="Exibe referências Strong"
              active={settings.studyTools.strongsTags}
              onClick={() => toggleSetting('studyTools', 'strongsTags')}
            />
            <Toggle
              label="Sugestões de IA"
              description="Ativa sugestões automáticas"
              active={settings.ai.autoSuggest}
              onClick={() => updateSettings({ ai: { ...settings.ai, autoSuggest: !settings.ai.autoSuggest } })}
            />
          </div>
        </motion.section>

        {/* Navigation Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Navigation2} title="Navegação" description="Comportamento de navegação" />
          <div className="space-y-2">
            <Toggle
              label="Animações"
              description="Ativa animações de transição"
              active={settings.navigation.navAnimation}
              onClick={() => toggleSetting('navigation', 'navAnimation')}
            />
            <Toggle
              label="Popup de Referência"
              description="Mostra popup ao clicar em referências"
              active={settings.behavior.bibleLinkPopup}
              onClick={() => toggleSetting('behavior', 'bibleLinkPopup')}
            />
          </div>
        </motion.section>

        {/* Language Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="premium-card p-5"
        >
          <SectionHeader icon={Languages} title="Idioma" description="Escolha o idioma do app" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'pt-BR', name: 'Português', flag: '🇧🇷' },
              { id: 'en', name: 'English', flag: '🇺🇸' },
            ].map((lang) => (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ language: lang.id as 'pt-BR' | 'en' })}
                className={cn(
                  "p-4 rounded-xl border-2 text-sm font-bold transition-all",
                  settings.language === lang.id
                    ? 'bg-gradient-to-br from-bible-accent to-bible-accent-strong text-white border-bible-accent shadow-md'
                    : 'bg-bible-surface text-bible-text border-bible-border hover:border-bible-accent/50'
                )}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div>{lang.name}</div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};