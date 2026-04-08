import React from 'react';
import { useAppContext } from '../AppContext';
import {
  Sun, Type, Layout, GraduationCap, Eye,
  Navigation2, Languages, Settings2, BookOpen,
  Palette, Minus, Plus, Check
} from 'lucide-react';
import { VersionSelector } from './VersionSelector';
import { ModuleManagement } from './ModuleManagement';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { THEME_OPTIONS } from '../theme/presets';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3">
    <div className="premium-icon-button h-10 w-10 min-w-10 rounded-2xl">
      <Icon className="h-4 w-4" />
    </div>
    <h2 className="premium-section-title">{title}</h2>
  </div>
);

const Toggle: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  description?: string;
}> = ({ label, active, onClick, description }) => (
  <button
    onClick={onClick}
    className="premium-card-soft flex w-full items-center justify-between gap-4 rounded-[28px] p-5 text-left transition-all hover:border-bible-accent/25"
  >
    <div className="flex-1">
      <div className="ui-text text-sm font-extrabold text-bible-text">{label}</div>
      {description && <p className="ui-text mt-1 text-xs leading-relaxed text-bible-text/60">{description}</p>}
    </div>
    <div className={cn(
      "flex h-7 w-12 shrink-0 rounded-full p-1 transition-all",
      active ? "bg-bible-accent" : "bg-bible-accent/20"
    )}>
      <div className={cn(
        "h-5 w-5 rounded-full bg-bible-bg transition-transform shadow-sm",
        active ? "translate-x-5" : "translate-x-0"
      )} />
    </div>
  </button>
);

const ChoicePills: React.FC<{
  label: string;
  options: Array<string | number>;
  current: string | number;
  onSelect: (value: any) => void;
  formatter?: (value: string | number) => string;
}> = ({ label, options, current, onSelect, formatter }) => (
  <div className="space-y-3">
    <div className="premium-section-title opacity-80">{label}</div>
    <div className="flex flex-wrap gap-2">
      {options.map((value) => (
        <button
          key={String(value)}
          onClick={() => onSelect(value)}
          className={cn(
            "premium-chip px-4 text-xs font-extrabold uppercase tracking-[0.18em]",
            current === value && "premium-chip-active"
          )}
        >
          {formatter ? formatter(value) : value}
        </button>
      ))}
    </div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const {
    config, settings, setMode, setFontSize, setLineHeight, setLetterSpacing,
    setFontFamily, setHorizontalMargin, updateSettings, toggleSetting
  } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto premium-page premium-scroll"
    >
      <div className="premium-page__content max-w-6xl pb-32">
        <header className="premium-hero space-y-5">
          <span className="premium-kicker">Studio Kerygma</span>
          <h1 className="premium-title">Configurações</h1>
          <p className="premium-subtitle">
            Ajuste o app inteiro a partir de um único sistema visual: leitura, contraste, tipografia, navegação e temas.
          </p>
        </header>

        <section className="space-y-5">
          <SectionHeader icon={BookOpen} title="Versão Bíblica" />
          <div className="premium-card rounded-[36px] p-6 md:p-8">
            <VersionSelector />
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeader icon={Settings2} title="Gerenciamento de Módulos" />
          <div className="premium-card rounded-[36px] p-6 md:p-8">
            <ModuleManagement />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
            <SectionHeader icon={Palette} title="Aparência" />

            <div className="premium-card-soft flex items-center justify-between rounded-[24px] p-2 sm:rounded-[28px]">
              <button onClick={() => setFontSize(Math.max(9, config.fontSize - 1))} className="premium-icon-button rounded-2xl border-0 shadow-none">
                <Minus className="h-4 w-4" />
              </button>
              <div className="text-center">
                <div className="premium-section-title opacity-70">Tamanho da Fonte</div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-gold">{config.fontSize}</div>
              </div>
              <button onClick={() => setFontSize(Math.min(36, config.fontSize + 1))} className="premium-icon-button rounded-2xl border-0 shadow-none">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <ChoicePills
              label="Família Tipográfica"
              options={['Untitled Serif', 'Serif', 'Sans Serif', 'Monospace']}
              current={config.fontFamily}
              onSelect={setFontFamily}
              formatter={(value) => String(value)}
            />

            <ChoicePills
              label="Altura da Linha"
              options={[1.4, 1.5, 1.6, 1.8, 2.0]}
              current={config.lineHeight}
              onSelect={setLineHeight}
              formatter={(value) => Number(value).toFixed(1)}
            />

            <ChoicePills
              label="Espaçamento Entre Letras"
              options={[0, 0.01, 0.02, 0.04]}
              current={config.letterSpacing}
              onSelect={setLetterSpacing}
              formatter={(value) => Number(value).toFixed(2)}
            />

            <ChoicePills
              label="Margens Laterais"
              options={[16, 24, 32, 48, 64]}
              current={config.horizontalMargin}
              onSelect={setHorizontalMargin}
            />
          </section>

          <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
            <SectionHeader icon={Sun} title="12 Temas Premium" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const active = config.mode === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => setMode(theme.id)}
                    className={cn(
                      "relative overflow-hidden rounded-[28px] border p-4 text-left transition-all",
                      active ? "premium-card-strong border-gold/40" : "premium-card border-transparent hover:border-bible-accent/20"
                    )}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.accent }} />
                      <span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.surface }} />
                      <span className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.heroStart }} />
                    </div>
                    <div className="ui-text text-sm font-extrabold uppercase tracking-[0.18em]">{theme.shortName}</div>
                    <div className="ui-text mt-1 text-[11px] leading-relaxed text-bible-text/55">{theme.description}</div>
                    <div className="ui-text mt-3 text-[10px] uppercase tracking-[0.22em] text-bible-text/35">
                      {theme.family === 'dark' ? 'Noite' : 'Claro'}
                    </div>
                    {active && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-bible-bg">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
          <SectionHeader icon={Layout} title="Exibição do Texto" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Toggle label="Modo Parágrafo" active={settings.textDisplay.paragraphMode} onClick={() => toggleSetting('textDisplay', 'paragraphMode')} description="Agrupa versículos em blocos contínuos para uma leitura mais fluida." />
            <Toggle label="Números de Versículo" active={settings.textDisplay.verseNumbers} onClick={() => toggleSetting('textDisplay', 'verseNumbers')} description="Mantém a referência rápida durante a leitura." />
            <Toggle label="Palavras de Jesus em Vermelho" active={settings.textDisplay.wordsOfJesusRed} onClick={() => toggleSetting('textDisplay', 'wordsOfJesusRed')} description="Realça falas de Cristo com contraste visual." />
            <Toggle label="Títulos de Capítulos" active={settings.textDisplay.chapterTitles} onClick={() => toggleSetting('textDisplay', 'chapterTitles')} />
            <Toggle label="Cabeçalhos e Epígrafes" active={settings.textDisplay.headlines} onClick={() => toggleSetting('textDisplay', 'headlines')} />
            <Toggle label="Notas de Rodapé" active={settings.textDisplay.footnotes} onClick={() => toggleSetting('textDisplay', 'footnotes')} />
          </div>
        </section>

        <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
          <SectionHeader icon={GraduationCap} title="Ferramentas de Estudo" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Toggle label="Tags Strong" active={settings.studyTools.strongsTags} onClick={() => toggleSetting('studyTools', 'strongsTags')} />
            <Toggle label="Links de Strong" active={settings.studyTools.strongsLinks} onClick={() => toggleSetting('studyTools', 'strongsLinks')} />
            <Toggle label="Modo Interlinear" active={settings.studyTools.interlinearMode} onClick={() => toggleSetting('studyTools', 'interlinearMode')} />
            <Toggle label="Morfologia" active={settings.studyTools.morphTags} onClick={() => toggleSetting('studyTools', 'morphTags')} />
            <Toggle label="Idiomas Originais" active={settings.studyTools.originalLanguages} onClick={() => toggleSetting('studyTools', 'originalLanguages')} />
            <Toggle label="Transliteração" active={settings.studyTools.transliteration} onClick={() => toggleSetting('studyTools', 'transliteration')} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
            <SectionHeader icon={Eye} title="Recursos Visuais" />
            <div className="grid grid-cols-1 gap-4">
              <Toggle label="Destaques e Realces" active={settings.visualResources.highlights} onClick={() => toggleSetting('visualResources', 'highlights')} />
              <Toggle label="Favoritos e Marcadores" active={settings.visualResources.bookmarks} onClick={() => toggleSetting('visualResources', 'bookmarks')} />
              <Toggle label="Referências Cruzadas" active={settings.visualResources.crossRefs} onClick={() => toggleSetting('visualResources', 'crossRefs')} />
              <Toggle label="Realce Gradiente" active={settings.visualResources.gradientHighlight} onClick={() => toggleSetting('visualResources', 'gradientHighlight')} />
            </div>
          </section>

          <section className="premium-card space-y-6 rounded-[36px] p-5 sm:p-6 md:p-8">
            <SectionHeader icon={Navigation2} title="Navegação" />
            <div className="grid grid-cols-1 gap-4">
              <Toggle label="Animação Fluida" active={settings.navigation.navAnimation} onClick={() => toggleSetting('navigation', 'navAnimation')} />
              <Toggle label="Rolagem Horizontal" active={settings.navigation.horizontalScroll} onClick={() => toggleSetting('navigation', 'horizontalScroll')} />
            </div>

            <SectionHeader icon={Languages} title="Idioma" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pt-BR', name: 'Português' },
                { id: 'en', name: 'English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => updateSettings({ language: lang.id as 'pt-BR' | 'en' })}
                  className={cn(
                    "rounded-[24px] border px-4 py-4 text-center ui-text text-xs font-extrabold uppercase tracking-[0.2em] transition-all",
                    settings.language === lang.id ? "bg-gold text-black border-gold" : "premium-card-soft border-transparent"
                  )}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
