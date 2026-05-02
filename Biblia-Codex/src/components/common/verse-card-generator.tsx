import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Share2, Palette, Type, 
  Layout, Sparkles, Image as ImageIcon,
  Check, ChevronLeft, ChevronRight, Copy,
  Maximize2, Smartphone, Monitor, Send,
  Layers, Hexagon, Wand2, Sliders, Sun,
  Moon, Contrast, Droplets, FlaskConical
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '../../utils/cn';
import { useAppContext } from '../../app/AppContext';
import { stripTags } from '../../utils/textUtils';

interface VerseCardGeneratorProps {
  verses: { verse: number; text: string }[];
  reference: string;
  isOpen: boolean;
  onClose: () => void;
}

type CardTheme = {
  id: string;
  name: string;
  className: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  overlay?: string;
  glass?: boolean;
};

const THEMES: CardTheme[] = [
  {
    id: 'insta-gradient-1',
    name: 'Sunset',
    className: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]',
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    glass: true
  },
  {
    id: 'insta-gradient-2',
    name: 'Purple Haze',
    gradient: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    className: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    glass: true
  },
  {
    id: 'insta-gradient-3',
    name: 'Ocean',
    gradient: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)',
    className: 'bg-gradient-to-br from-cyan-500 to-teal-400',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    glass: true
  },
  {
    id: 'whatsapp-dark',
    name: 'Noite',
    className: 'bg-[#0b141a]',
    gradient: 'linear-gradient(135deg, #0b141a 0%, #111b21 100%)',
    textColor: '#e9edef',
    accentColor: '#00a884'
  },
  {
    id: 'royal-gold',
    name: 'Ouro',
    className: 'bg-[#0f172a]',
    gradient: 'radial-gradient(circle at top left, #1e293b 0%, #020617 100%)',
    textColor: '#f8fafc',
    accentColor: '#fbbf24',
    overlay: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'0.5\' fill=\'rgba(251, 191, 36, 0.1)\'/%3E%3C/svg%3E")'
  },
  {
    id: 'ethereal-blue',
    name: 'Celeste',
    className: 'bg-[#0ea5e9]',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    textColor: '#ffffff',
    accentColor: '#e0f2fe',
    glass: true
  },
  {
    id: 'minimal-noir',
    name: 'Preto',
    className: 'bg-black',
    gradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
    textColor: '#ffffff',
    accentColor: '#525252'
  },
  {
    id: 'divine-light',
    name: 'Branco',
    className: 'bg-white',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    textColor: '#0f172a',
    accentColor: '#2563eb'
  },
  {
    id: 'rose-garden',
    name: 'Rosa',
    gradient: 'linear-gradient(135deg, #fdf4ff 0%, #f0abfc 50%, #e879f9 100%)',
    className: 'bg-gradient-to-br from-pink-100 to-fuchsia-300',
    textColor: '#86198f',
    accentColor: '#c026d3',
    glass: true
  },
  {
    id: 'forest-deep',
    name: 'Floresta',
    gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    className: 'bg-gradient-to-br from-green-950 to-green-700',
    textColor: '#dcfce7',
    accentColor: '#4ade80'
  },
  {
    id: 'midnight',
    name: 'Meia-Noite',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    className: 'bg-gradient-to-br from-indigo-950 to-indigo-700',
    textColor: '#e0e7ff',
    accentColor: '#818cf8'
  },
  {
    id: 'sunrise-gold',
    name: 'Aurora',
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #fdba74 50%, #f97316 100%)',
    className: 'bg-gradient-to-br from-orange-50 to-orange-300',
    textColor: '#7c2d12',
    accentColor: '#ea580c'
  }
];

const FONTS = [
  { id: 'serif', name: 'Serif Clássico', className: 'font-serif tracking-tight', family: '"Libre Baskerville", serif' },
  { id: 'sans', name: 'Sans Moderno', className: 'font-sans font-black', family: '"Manrope", sans-serif' },
  { id: 'display', name: 'Display Elegante', className: 'font-display italic', family: '"Cormorant Garamond", serif' },
  { id: 'mono', name: 'Mono Código', className: 'font-mono', family: '"JetBrains Mono", monospace' },
  { id: 'lora', name: 'Lora', className: '', family: '"Lora", serif' },
  { id: 'playfair', name: 'Playfair', className: '', family: '"Playfair Display", serif' },
  { id: 'raleway', name: 'Raleway', className: 'font-sans', family: '"Raleway", sans-serif' },
  { id: 'outfit', name: 'Outfit', className: 'font-sans', family: '"Outfit", sans-serif' }
];

const FORMATS = [
  { id: 'story', name: 'Story', icon: Smartphone, aspect: '9/16' },
  { id: 'square', name: 'Quadrado', icon: Smartphone, aspect: '1/1' },
  { id: 'post', name: 'Retrato', icon: Smartphone, aspect: '4/5' }
];

const BG_COLORS = [
  { id: 'transparent', name: 'Transparente', value: 'transparent' },
  { id: 'white', name: 'Branco', value: '#ffffff' },
  { id: 'black', name: 'Preto', value: '#000000' },
  { id: 'cream', name: 'Creme', value: '#fef3c7' },
  { id: 'light-blue', name: 'Azul Claro', value: '#dbeafe' },
  { id: 'light-green', name: 'Verde Claro', value: '#dcfce7' },
  { id: 'light-pink', name: 'Rosa Claro', value: '#fce7f3' },
  { id: 'light-purple', name: 'Roxo Claro', value: '#f3e8ff' },
  { id: 'light-orange', name: 'Laranja Claro', value: '#ffedd5' },
  { id: 'gray', name: 'Cinza', value: '#f3f4f6' }
];

const TEXT_COLORS = [
  { id: 'white', name: 'Branco', value: '#ffffff' },
  { id: 'black', name: 'Preto', value: '#000000' },
  { id: 'dark-gray', name: 'Cinza Escuro', value: '#1f2937' },
  { id: 'gray', name: 'Cinza', value: '#4b5563' },
  { id: 'gold', name: 'Dourado', value: '#fbbf24' },
  { id: 'blue', name: 'Azul', value: '#3b82f6' },
  { id: 'green', name: 'Verde', value: '#10b981' },
  { id: 'purple', name: 'Roxo', value: '#8b5cf6' },
  { id: 'pink', name: 'Rosa', value: '#ec4899' },
  { id: 'red', name: 'Vermelho', value: '#ef4444' }
];

export const VerseCardGenerator: React.FC<VerseCardGeneratorProps> = ({
  verses,
  reference,
  isOpen,
  onClose
}) => {
  const { currentVersion } = useAppContext();
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [currentFont, setCurrentFont] = useState(FONTS[0]);
  const [currentFormat, setCurrentFormat] = useState(FORMATS[0]);
  const [showReference, setShowReference] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'fonts' | 'custom'>('themes');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [useCustomColors, setUseCustomColors] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fullText = verses.map(v => stripTags(v.text)).join(' ');
  const versionLabel = currentVersion?.abbreviation || currentVersion?.id || '';
  const referenceWithVersion = versionLabel && !reference.includes(versionLabel)
    ? `${reference} ${versionLabel}`
    : reference;

  const currentBgColor = useCustomColors ? customBgColor : currentTheme.gradient;
  const currentTextColor = useCustomColors ? customTextColor : currentTheme.textColor;
  const currentAccentColor = useCustomColors ? customTextColor : currentTheme.accentColor;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, 
        backgroundColor: null,
        useCORS: true,
        logging: false
      } as any);
      const link = document.createElement('a');
      link.download = `Codex-${reference.replace(/\s/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3 } as any);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      });
    } catch (err) {
      console.error('Copy error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareText = async () => {
    const text = `"${fullText}" ${reference} - ${versionLabel || 'ARA'}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Share text error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex flex-col bg-black overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[80%] h-[60%] bg-bible-accent/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 -right-1/4 w-[80%] h-[60%] bg-purple-500/20 blur-[120px] rounded-full" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[600] w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex items-center justify-center w-full h-full"
            >
              <div 
                ref={cardRef}
                className={cn(
                  "relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-10 text-center transition-all duration-500",
                  currentFont.className
                )}
                style={{ 
                  background: currentBgColor,
                  aspectRatio: currentFormat.aspect,
                  height: '100%',
                  maxHeight: 'calc(100vh - 220px)',
                  width: 'auto',
                  maxWidth: '400px',
                  fontFamily: currentFont.family
                }}
              >
                {currentTheme.overlay && !useCustomColors && (
                  <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: currentTheme.overlay }} />
                )}
                
                {currentTheme.glass && !useCustomColors && (
                  <>
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 blur-[40px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[40px] rounded-full" />
                  </>
                )}

                <div className="relative z-10 flex flex-col items-center gap-6 max-w-[85%]">
                  <motion.div 
                    animate={{ rotate: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5" style={{ color: currentAccentColor }} />
                  </motion.div>
                  
                  <p 
                    className="leading-[1.6] font-semibold"
                    style={{ color: currentTextColor, fontSize: `${fontSize}px` }}
                  >
                    "{fullText}"
                  </p>
                  
                  {showReference && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-[1px] rounded-full opacity-30" style={{ backgroundColor: currentTextColor }} />
                      <span 
                        className="text-xs font-bold uppercase tracking-[0.3em]"
                        style={{ color: currentAccentColor }}
                      >
                        {referenceWithVersion}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 flex items-center gap-2 opacity-50">
                  <div className="w-5 h-5 rounded-md bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: currentTextColor }}>
                    Codex
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 flex flex-col max-h-[45vh]">
            <div className="flex items-center gap-1 p-2 border-b border-white/5">
              {[
                { id: 'themes', icon: Palette, label: 'Temas' },
                { id: 'fonts', icon: Type, label: 'Fontes' },
                { id: 'custom', icon: Sliders, label: 'Personalizar' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    activeTab === tab.id 
                      ? "bg-bible-accent/20 text-bible-accent" 
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'themes' && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map(theme => (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCurrentTheme(theme); setUseCustomColors(false); }}
                        className={cn(
                          "aspect-square rounded-2xl border-4 transition-all relative overflow-hidden",
                          currentTheme.id === theme.id && !useCustomColors
                            ? "border-bible-accent shadow-lg shadow-bible-accent/40" 
                            : "border-white/10 opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className={cn("absolute inset-0", theme.className)} />
                        {currentTheme.id === theme.id && !useCustomColors && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-xs font-bold text-white/60 uppercase">Formato</span>
                    <div className="flex gap-2">
                      {FORMATS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setCurrentFormat(f)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                            currentFormat.id === f.id 
                              ? "bg-bible-accent text-white" 
                              : "bg-white/5 text-white/40 hover:bg-white/10"
                          )}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'fonts' && (
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => setCurrentFont(font)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center",
                        currentFont.id === font.id
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-white/60 border-transparent hover:bg-white/10"
                      )}
                      style={{ fontFamily: font.family }}
                    >
                      <span className="text-sm font-bold">{font.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-bible-accent" />
                      <span className="text-xs font-bold text-white/60 uppercase">Cores Personalizadas</span>
                    </div>
                    <button
                      onClick={() => setUseCustomColors(!useCustomColors)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                        useCustomColors ? "bg-bible-accent" : "bg-white/10"
                      )}
                    >
                      <motion.div 
                        animate={{ x: useCustomColors ? 24 : 0 }}
                        className="w-4 h-4 rounded-full bg-white shadow-lg" 
                      />
                    </button>
                  </div>

                  {useCustomColors && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-white/40" />
                          <span className="text-xs font-bold text-white/40 uppercase">Cor de Fundo</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {BG_COLORS.map(color => (
                            <button
                              key={color.id}
                              onClick={() => setCustomBgColor(color.value)}
                              className={cn(
                                "aspect-square rounded-xl border-2 transition-all",
                                customBgColor === color.value 
                                  ? "border-bible-accent scale-110" 
                                  : "border-white/10 hover:border-white/30"
                              )}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Type className="w-4 h-4 text-white/40" />
                          <span className="text-xs font-bold text-white/40 uppercase">Cor do Texto</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {TEXT_COLORS.map(color => (
                            <button
                              key={color.id}
                              onClick={() => setCustomTextColor(color.value)}
                              className={cn(
                                "aspect-square rounded-xl border-2 transition-all",
                                customTextColor === color.value 
                                  ? "border-bible-accent scale-110" 
                                  : "border-white/10 hover:border-white/30"
                              )}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/40 uppercase">Tamanho</span>
                      <span className="text-sm font-black text-bible-accent">{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="14" 
                      max="48" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-bible-accent"
                    />
                  </div>

                  <button 
                    onClick={() => setShowReference(!showReference)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                  >
                    <span className="text-sm font-bold text-white/80">Referência Bíblica</span>
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                      showReference ? "bg-bible-accent" : "bg-white/10"
                    )}>
                      <motion.div 
                        animate={{ x: showReference ? 24 : 0 }}
                        className="w-4 h-4 rounded-full bg-white shadow-lg" 
                      />
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShareText}
                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Texto</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                disabled={isExporting}
                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copiar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={isExporting}
                className="h-14 rounded-2xl bg-bible-accent text-white flex flex-col items-center justify-center gap-1 font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-bible-accent/30 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{isExporting ? '...' : 'Salvar'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};