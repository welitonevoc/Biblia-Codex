import React, { useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sun, Moon, Coffee, Smartphone, Minus, Plus, Book, Cpu, Cloud,
  RefreshCw, Check, AlertCircle, Upload, Loader2, Layout, Zap,
  Languages, Eye, GraduationCap, BookOpen, Type, Palette, PanelsTopLeft,
  MousePointer2, Wand2
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

const Toggle: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  description?: string;
}> = ({ label, active, onClick, description }) => (
  <button
    onClick={onClick}
    className="premium-card-soft w-full flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-bible-accent/20 transition-all text-left"
  >
    <div className="flex-1 pr-4">
      <h4 className="ui-text font-bold text-sm">{label}</h4>
      {description && <p className="ui-text text-[11px] opacity-40 leading-tight mt-0.5">{description}</p>}
    </div>
    <div className={cn(
      'w-10 h-6 rounded-full p-1 transition-all shrink-0',
      active ? 'bg-bible-accent' : 'bg-bible-accent/20'
    )}>
      <div className={cn(
        'w-4 h-4 bg-bible-bg rounded-full transition-all',
        active ? 'translate-x-4' : 'translate-x-0'
      )} />
    </div>
  </button>
);

const SettingsCard: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="premium-card rounded-[32px] p-6 space-y-6"
  >
    <div className="flex items-center space-x-3 opacity-50 px-2">
      <Icon className="w-4 h-4" />
      <h3 className="ui-text text-[10px] uppercase tracking-[0.2em] font-black">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

const NumberControl: React.FC<{
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
}> = ({ label, value, onDecrease, onIncrease }) => (
  <div className="flex items-center justify-between px-2">
    <span className="ui-text text-xs font-bold opacity-60">{label}</span>
    <div className="flex items-center space-x-3 bg-bible-accent/5 p-1 rounded-xl">
      <button onClick={onDecrease} className="p-1.5 hover:bg-bible-accent/10 rounded-lg transition-colors">
        <Minus className="w-3 h-3" />
      </button>
      <span className="ui-text text-sm font-black min-w-10 text-center">{value}</span>
      <button onClick={onIncrease} className="p-1.5 hover:bg-bible-accent/10 rounded-lg transition-colors">
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const {
    config,
    settings,
    setMode,
    setFontSize,
    setLineHeight,
    setLetterSpacing,
    setFontFamily,
    setHorizontalMargin,
    setAccentColor,
    updateSettings,
    toggleSetting,
    syncNow,
    refreshModules,
    availableVersions,
    availableDictionaries,
    selectedDictionaryModule,
    setSelectedDictionaryModule
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  const installedCount = availableVersions.length + availableDictionaries.length;
  const accentColors = ['#5a5a40', '#8c6d46', '#3f6b5b', '#7a3e3e', '#3b5f8a', '#6b4d7a'];
  const lineHeights = [1.4, 1.5, 1.6, 1.8, 2.0];
  const letterSpacings = [0, 0.01, 0.02, 0.04];
  const margins = [16, 24, 32, 48, 64];
  const getModuleDisplayName = (value: string) => value
    .replace(/\.(mybible|sqlite3|sqlite|mybl|mybls|twm|epub|conf|dat)$/i, '')
    .replace(/\.(dct|dict|cmt|comment|xref|ref|xrefs|bok|book|devot)$/i, '')
    .trim();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus('idle');

    const normalizedName = file.name.toLowerCase();
    const supportedFile = SUPPORTED_EXTENSIONS.some((ext) => normalizedName.endsWith(ext));

    if (!supportedFile) {
      setImportStatus('error');
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isAndroidNative) {
      const hasPermission = await ensureStoragePermission();
      if (!hasPermission) {
        setImportStatus('error');
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    try {
      const { importModule } = await import('../services/moduleService');
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1].replace(/\s/g, ''));
        };
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
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bible-bg border-l border-bible-accent/10 z-[200] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-8 pt-10">
              <div className="flex flex-col">
                <h2 className="text-3xl font-display font-black tracking-tight">Ajustes</h2>
                <p className="ui-text text-[10px] opacity-40 uppercase font-bold tracking-widest mt-1">Personalize sua experiência</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-bible-accent/5 hover:bg-bible-accent/10 rounded-2xl transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
              <SettingsCard title="Leitura" icon={BookOpen} delay={0.05}>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'linen', icon: Sun, label: 'Linho' },
                    { id: 'sepia', icon: Coffee, label: 'Sépia' },
                    { id: 'night', icon: Moon, label: 'Vigília' },
                    { id: 'eclipse', icon: Smartphone, label: 'Eclipse' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setMode(theme.id as typeof config.mode)}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all space-y-1',
                        config.mode === theme.id ? 'bg-bible-accent/10 border-bible-accent/40 text-bible-accent' : 'bg-transparent border-transparent opacity-40'
                      )}
                    >
                      <theme.icon className="w-4 h-4" />
                      <span className="ui-text text-[9px] font-black uppercase">{theme.label}</span>
                    </button>
                  ))}
                </div>

                <NumberControl
                  label="Tamanho da Fonte"
                  value={`${config.fontSize}`}
                  onDecrease={() => setFontSize(Math.max(9, config.fontSize - 1))}
                  onIncrease={() => setFontSize(Math.min(36, config.fontSize + 1))}
                />

                <div className="space-y-2 pt-1">
                  <span className="ui-text text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Família Tipográfica</span>
                  <div className="flex flex-wrap gap-2">
                    {['Untitled Serif', 'Serif', 'Sans Serif', 'Monospace'].map(font => (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font as typeof config.fontFamily)}
                        className={cn(
                          'px-4 py-2 rounded-xl border text-[11px] font-bold transition-all',
                          config.fontFamily === font ? 'bg-bible-accent text-bible-bg border-bible-accent' : 'bg-bible-accent/5 border-transparent opacity-60'
                        )}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="ui-text text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Altura da Linha</span>
                  <div className="grid grid-cols-5 gap-2">
                    {lineHeights.map(value => (
                      <button
                        key={value}
                        onClick={() => setLineHeight(value)}
                        className={cn(
                          'py-2 rounded-xl border text-[11px] font-bold transition-all',
                          config.lineHeight === value ? 'bg-bible-accent text-bible-bg border-bible-accent' : 'bg-bible-accent/5 border-transparent opacity-60'
                        )}
                      >
                        {value.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="ui-text text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Espaçamento</span>
                  <div className="grid grid-cols-4 gap-2">
                    {letterSpacings.map(value => (
                      <button
                        key={value}
                        onClick={() => setLetterSpacing(value)}
                        className={cn(
                          'py-2 rounded-xl border text-[11px] font-bold transition-all',
                          config.letterSpacing === value ? 'bg-bible-accent text-bible-bg border-bible-accent' : 'bg-bible-accent/5 border-transparent opacity-60'
                        )}
                      >
                        {value.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="ui-text text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Margens Laterais</span>
                  <div className="grid grid-cols-5 gap-2">
                    {margins.map(value => (
                      <button
                        key={value}
                        onClick={() => setHorizontalMargin(value)}
                        className={cn(
                          'py-2 rounded-xl border text-[11px] font-bold transition-all',
                          config.horizontalMargin === value ? 'bg-bible-accent text-bible-bg border-bible-accent' : 'bg-bible-accent/5 border-transparent opacity-60'
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="ui-text text-[10px] uppercase tracking-widest font-black opacity-40 px-2">Cor de Destaque</span>
                  <div className="flex flex-wrap gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-transform hover:scale-105',
                          config.accentColor === color ? 'border-bible-text' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Exibição do Texto" icon={Type} delay={0.1}>
                <Toggle label="Modo Parágrafo" active={settings.textDisplay.paragraphMode} onClick={() => toggleSetting('textDisplay', 'paragraphMode')} />
                <Toggle label="Números de Versículo" active={settings.textDisplay.verseNumbers} onClick={() => toggleSetting('textDisplay', 'verseNumbers')} />
                <Toggle label="Palavras de Jesus em Vermelho" active={settings.textDisplay.wordsOfJesusRed} onClick={() => toggleSetting('textDisplay', 'wordsOfJesusRed')} />
                <Toggle label="Títulos de Capítulos" active={settings.textDisplay.chapterTitles} onClick={() => toggleSetting('textDisplay', 'chapterTitles')} />
                <Toggle
                  label="Títulos, Epígrafes e Cabeçalhos"
                  active={settings.textDisplay.headlines}
                  onClick={() => toggleSetting('textDisplay', 'headlines')}
                  description="Mostra ou oculta os títulos temáticos inseridos no texto bíblico."
                />
                <Toggle label="Notas de Rodapé" active={settings.textDisplay.footnotes} onClick={() => toggleSetting('textDisplay', 'footnotes')} />
              </SettingsCard>

              <SettingsCard title="Estudo & IA" icon={GraduationCap} delay={0.15}>
                <div className="p-4 rounded-3xl bg-bible-accent/5 border border-bible-accent/10 space-y-3">
                  <span className="ui-text text-[10px] font-black opacity-30 uppercase">Dicionário Principal</span>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDictionaryModule(createAiModule('dictionary'))}
                      className={cn(
                        'w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between',
                        selectedDictionaryModule?.id === 'ai_assistant'
                          ? 'bg-bible-accent text-bible-bg border-bible-accent shadow-lg shadow-bible-accent/20'
                          : 'bg-bible-accent/5 border-transparent opacity-60'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Cpu className="w-4 h-4" />
                        <span className="ui-text text-xs font-bold">Assistente IA</span>
                      </div>
                      {selectedDictionaryModule?.id === 'ai_assistant' && <Check className="w-3 h-3" />}
                    </button>

                    {availableDictionaries.map(dict => (
                      <button
                        key={dict.id}
                        onClick={() => setSelectedDictionaryModule(dict as any)}
                        className={cn(
                          'w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between',
                          selectedDictionaryModule?.id === dict.id
                            ? 'bg-bible-accent text-bible-bg border-bible-accent shadow-lg shadow-bible-accent/20'
                            : 'bg-bible-accent/5 border-transparent opacity-60'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Book className="w-4 h-4" />
                          <div className="flex flex-col">
                            <span className="ui-text text-xs font-bold">{getModuleDisplayName(dict.name)}</span>
                            <span className="ui-text text-[10px] opacity-50">{dict.abbreviation}</span>
                          </div>
                        </div>
                        {selectedDictionaryModule?.id === dict.id && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Toggle label="Tags Strong (G/H)" active={settings.studyTools.strongsTags} onClick={() => toggleSetting('studyTools', 'strongsTags')} />
                <Toggle label="Links de Strong" active={settings.studyTools.strongsLinks} onClick={() => toggleSetting('studyTools', 'strongsLinks')} />
                <Toggle label="Modo Interlinear" active={settings.studyTools.interlinearMode} onClick={() => toggleSetting('studyTools', 'interlinearMode')} />
                <Toggle label="Morfologia" active={settings.studyTools.morphTags} onClick={() => toggleSetting('studyTools', 'morphTags')} />
                <Toggle label="Idiomas Originais" active={settings.studyTools.originalLanguages} onClick={() => toggleSetting('studyTools', 'originalLanguages')} />
                <Toggle label="Transliteração" active={settings.studyTools.transliteration} onClick={() => toggleSetting('studyTools', 'transliteration')} />
                <Toggle label="Notas do Tradutor" active={settings.studyTools.translatorNotes} onClick={() => toggleSetting('studyTools', 'translatorNotes')} />
                <Toggle
                  label="Sugestões Automáticas de IA"
                  active={settings.ai.autoSuggest}
                  onClick={() => updateSettings({ ai: { ...settings.ai, autoSuggest: !settings.ai.autoSuggest } })}
                />

                <div className="grid grid-cols-2 gap-2">
                  {[
                    'gemini-3-flash-latest',
                    'gemini-2.0-flash'
                  ].map(model => (
                    <button
                      key={model}
                      onClick={() => updateSettings({ ai: { ...settings.ai, model } })}
                      className={cn(
                        'p-3 rounded-2xl border transition-all ui-text text-[10px] font-black',
                        settings.ai.model === model ? 'bg-bible-accent text-bible-bg border-bible-accent' : 'bg-bible-accent/5 border-transparent opacity-60'
                      )}
                    >
                      {model.replace('gemini-', 'Gemini ')}
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard title="Recursos Visuais" icon={Eye} delay={0.2}>
                <Toggle label="Destaques e Realces" active={settings.visualResources.highlights} onClick={() => toggleSetting('visualResources', 'highlights')} />
                <Toggle label="Favoritos e Marcadores" active={settings.visualResources.bookmarks} onClick={() => toggleSetting('visualResources', 'bookmarks')} />
                <Toggle label="Referências Cruzadas" active={settings.visualResources.crossRefs} onClick={() => toggleSetting('visualResources', 'crossRefs')} />
                <Toggle label="Mesclar Referências Próximas" active={settings.visualResources.mergeAdjacentRefs} onClick={() => toggleSetting('visualResources', 'mergeAdjacentRefs')} />
                <Toggle label="Realce em Gradiente" active={settings.visualResources.gradientHighlight} onClick={() => toggleSetting('visualResources', 'gradientHighlight')} />
              </SettingsCard>

              <SettingsCard title="Comportamento & Navegação" icon={PanelsTopLeft} delay={0.25}>
                <Toggle label="Popup de Referência Bíblica" active={settings.behavior.bibleLinkPopup} onClick={() => toggleSetting('behavior', 'bibleLinkPopup')} />
                <Toggle label="Menu Sempre Visível" active={settings.behavior.alwaysVisible} onClick={() => toggleSetting('behavior', 'alwaysVisible')} />
                <Toggle label="Animações de Navegação" active={settings.navigation.navAnimation} onClick={() => toggleSetting('navigation', 'navAnimation')} />
                <Toggle label="Rolagem Horizontal" active={settings.navigation.horizontalScroll} onClick={() => toggleSetting('navigation', 'horizontalScroll')} />
              </SettingsCard>

              <SettingsCard title="Biblioteca" icon={Layout} delay={0.3}>
                <div className="flex items-center justify-between p-4 rounded-3xl bg-bible-accent/5 border border-bible-accent/10">
                  <div className="flex flex-col">
                    <span className="ui-text text-xs font-bold">Conteúdo Instalado</span>
                    <span className="ui-text text-[10px] opacity-40">Bíblias e dicionários prontos para uso</span>
                  </div>
                  <span className="ui-text text-xs font-black text-bible-accent">{installedCount}</span>
                </div>

                <div className="relative">
                <button
                  type="button"
                  disabled={isImporting}
                  className={cn(
                    'w-full py-4 rounded-[24px] flex items-center justify-center space-x-3 transition-all active:scale-95 font-black ui-text text-[10px] tracking-widest uppercase',
                    isImporting ? 'bg-bible-accent/20 text-bible-accent cursor-not-allowed' : 'bg-bible-accent text-bible-bg shadow-lg shadow-bible-accent/30'
                  )}
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{isImporting ? 'Importando...' : 'Adicionar Conteúdo'}</span>
                </button>

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

                {importStatus === 'success' && (
                  <div className="flex items-center space-x-2 p-3 rounded-2xl bg-green-500/10 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="ui-text text-xs font-bold">Módulo importado com sucesso.</span>
                  </div>
                )}

                {importStatus === 'error' && (
                  <div className="flex items-center space-x-2 p-3 rounded-2xl bg-red-500/10 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="ui-text text-xs font-bold">Falha ao importar o módulo.</span>
                  </div>
                )}
              </SettingsCard>

              <SettingsCard title="Sistema" icon={Zap} delay={0.35}>
                <button
                  onClick={() => syncNow()}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-bible-accent/5 hover:bg-bible-accent/10 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Cloud className="w-4 h-4 opacity-40" />
                    <span className="ui-text text-xs font-bold">Sincronização em Nuvem</span>
                  </div>
                  <RefreshCw className="w-3 h-3 opacity-20" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ language: 'pt-BR' })}
                    className={cn(
                      'p-3 rounded-2xl border transition-all ui-text text-[10px] font-black uppercase',
                      settings.language === 'pt-BR' ? 'bg-bible-accent/10 border-bible-accent/40' : 'bg-transparent border-transparent opacity-40'
                    )}
                  >
                    Português
                  </button>
                  <button
                    onClick={() => updateSettings({ language: 'en' })}
                    className={cn(
                      'p-3 rounded-2xl border transition-all ui-text text-[10px] font-black uppercase',
                      settings.language === 'en' ? 'bg-bible-accent/10 border-bible-accent/40' : 'bg-transparent border-transparent opacity-40'
                    )}
                  >
                    English
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'commentary', label: 'Comentários' },
                    { key: 'dictionary', label: 'Dicionário' },
                    { key: 'xrefs', label: 'Refs.' }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => updateSettings({
                        modules: {
                          ...settings.modules,
                          [item.key]: !settings.modules[item.key as keyof typeof settings.modules]
                        }
                      })}
                      className={cn(
                        'p-3 rounded-2xl border transition-all ui-text text-[10px] font-black',
                        settings.modules[item.key as keyof typeof settings.modules]
                          ? 'bg-bible-accent text-bible-bg border-bible-accent'
                          : 'bg-bible-accent/5 border-transparent opacity-60'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SettingsCard>
            </div>

            <div className="p-8 border-t border-bible-accent/10 bg-bible-bg/80 backdrop-blur-md flex flex-col items-center space-y-2">
              <p className="ui-text text-[10px] uppercase tracking-[0.3em] opacity-40 font-black">Bíblia Kerygma</p>
              <div className="px-3 py-1 rounded-full bg-bible-accent/10">
                <span className="ui-text text-[9px] font-bold text-bible-accent">PREMIUM EDITION v2.5.0</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
