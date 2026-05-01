import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Share2, Palette, Type, 
  Layout, Sparkles, Image as ImageIcon,
  Check, ChevronLeft, ChevronRight, Copy,
  Maximize2, Smartphone, Monitor, Instagram, Send
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
    name: 'Vibrant Sunset',
    className: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]',
    gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    glass: true
  },
  {
    id: 'whatsapp-dark',
    name: 'WhatsApp Night',
    className: 'bg-[#0b141a]',
    gradient: 'linear-gradient(135deg, #0b141a 0%, #111b21 100%)',
    textColor: '#e9edef',
    accentColor: '#00a884'
  },
  {
    id: 'royal-gold',
    name: 'Obsidian Gold',
    className: 'bg-[#0f172a]',
    gradient: 'radial-gradient(circle at top left, #1e293b 0%, #020617 100%)',
    textColor: '#f8fafc',
    accentColor: '#fbbf24',
    overlay: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'0.5\' fill=\'rgba(251, 191, 36, 0.1)\'/%3E%3C/svg%3E")'
  },
  {
    id: 'ethereal-blue',
    name: 'Ethereal',
    className: 'bg-[#0ea5e9]',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    textColor: '#ffffff',
    accentColor: '#e0f2fe',
    glass: true
  },
  {
    id: 'minimal-noir',
    name: 'Minimal Noir',
    className: 'bg-black',
    gradient: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
    textColor: '#ffffff',
    accentColor: '#525252'
  },
  {
    id: 'soft-sakura',
    name: 'Sakura',
    className: 'bg-[#fdf2f8]',
    gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
    textColor: '#831843',
    accentColor: '#be185d'
  }
];

const FONTS = [
  { id: 'serif', name: 'Premium Serif', className: 'font-serif tracking-tight' },
  { id: 'sans', name: 'Modern Sans', className: 'font-sans font-black' },
  { id: 'display', name: 'Elegant Display', className: 'font-display italic' },
  { id: 'system', name: 'System Bold', className: 'font-sans font-bold' }
];

const FORMATS = [
  { id: 'square', name: '1:1 Square', icon: Smartphone, aspect: '1/1' },
  { id: 'story', name: '9:16 Story', icon: Instagram, aspect: '9/16' },
  { id: 'post', name: '4:5 Portrait', icon: Smartphone, aspect: '4/5' }
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
  const cardRef = useRef<HTMLDivElement>(null);

  const fullText = verses.map(v => stripTags(v.text)).join(' ');
  const versionLabel = currentVersion?.abbreviation || currentVersion?.id || '';
  const referenceWithVersion = versionLabel && !reference.includes(versionLabel)
    ? `${reference} ${versionLabel}`
    : reference;

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
          // Toast feedback would be nice here
        }
      });
    } catch (err) {
      console.error('Copy error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex flex-col md:flex-row items-stretch bg-black overflow-hidden"
      >
        {/* Close Button Floating */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[600] w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Left: Preview Area (Instagram Style) */}
        <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#121212]">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] bg-bible-accent/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-[80%] h-[80%] bg-purple-500/10 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex items-center justify-center w-full h-full max-h-[85vh]"
          >
            <div 
              ref={cardRef}
              className={cn(
                "relative shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center p-12 text-center",
                currentTheme.className,
                currentFont.className
              )}
              style={{ 
                background: currentTheme.gradient,
                aspectRatio: currentFormat.aspect,
                height: '100%',
                maxHeight: '100%',
                width: 'auto'
              }}
            >
              {currentTheme.overlay && (
                <div className="absolute inset-0 z-0" style={{ backgroundImage: currentTheme.overlay }} />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-10 max-w-[80%]">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rotate-12">
                  <Sparkles className="w-6 h-6" style={{ color: currentTheme.accentColor }} />
                </div>
                
                <p 
                  className="leading-[1.4] font-bold"
                  style={{ color: currentTheme.textColor, fontSize: `${fontSize}px` }}
                >
                  “{fullText}”
                </p>
                
                {showReference && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-[2px] rounded-full opacity-40" style={{ backgroundColor: currentTheme.textColor }} />
                    <span 
                      className="text-sm font-black uppercase tracking-[0.3em]"
                      style={{ color: currentTheme.accentColor }}
                    >
                      {referenceWithVersion}
                    </span>
                  </div>
                )}
              </div>

              {/* Branding Footer */}
              <div className="absolute bottom-12 flex items-center gap-3 opacity-30">
                <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: currentTheme.textColor }}>
                  Codex • Biblia Digital
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Controls Panel (Mobile-First Sheet style on small screens) */}
        <div className="w-full md:w-[420px] bg-bible-bg border-l border-white/5 flex flex-col z-[550]">
          {/* Header */}
          <div className="p-8 border-b border-bible-border/50">
            <h2 className="text-2xl font-black text-bible-text tracking-tight flex items-center gap-3">
              <Share2 className="w-6 h-6 text-bible-accent" />
              Compartilhar Versículo
            </h2>
            <p className="text-xs text-bible-text-muted mt-2 font-bold uppercase tracking-widest">Estilize sua mensagem</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Formats */}
            <section className="space-y-4">
              <div className="text-[10px] font-black text-bible-accent uppercase tracking-[0.2em] mb-4">Formato da Rede Social</div>
              <div className="flex gap-3">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentFormat(f)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                      currentFormat.id === f.id 
                        ? "bg-bible-accent/10 border-bible-accent" 
                        : "bg-bible-surface border-transparent hover:bg-bible-surface-strong"
                    )}
                  >
                    <f.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", currentFormat.id === f.id ? "text-bible-accent" : "text-bible-text-muted")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{f.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Themes Grid */}
            <section className="space-y-4">
              <div className="text-[10px] font-black text-bible-accent uppercase tracking-[0.2em] mb-4">Temas & Ambientes</div>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={cn(
                      "aspect-square rounded-2xl border-4 transition-all overflow-hidden relative group",
                      currentTheme.id === theme.id 
                        ? "border-bible-accent scale-105 shadow-xl shadow-bible-accent/20" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className={cn("absolute inset-0", theme.className)} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center pt-2">
                <span className="text-xs font-bold text-bible-text-muted">{currentTheme.name}</span>
              </div>
            </section>

            {/* Typography */}
            <section className="space-y-6">
              <div className="text-[10px] font-black text-bible-accent uppercase tracking-[0.2em] mb-4">Tipografia & Escala</div>
              <div className="grid grid-cols-2 gap-3">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setCurrentFont(font)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-sm font-bold",
                      currentFont.id === font.id
                        ? "bg-bible-text text-bible-bg border-bible-text"
                        : "bg-bible-surface text-bible-text border-transparent hover:bg-bible-surface-strong"
                    )}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
              <div className="bg-bible-surface p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-bible-text-muted">Escala Visual</span>
                  <span className="text-xs font-black text-bible-accent">{fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="16" 
                  max="60" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-bible-bg rounded-lg appearance-none cursor-pointer accent-bible-accent"
                />
              </div>
            </section>

            {/* Layout Options */}
            <section className="space-y-4 pb-20">
              <div className="text-[10px] font-black text-bible-accent uppercase tracking-[0.2em] mb-4">Visibilidade</div>
              <button 
                onClick={() => setShowReference(!showReference)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-bible-surface hover:bg-bible-surface-strong transition-all"
              >
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-bible-accent" />
                  <span className="text-sm font-bold">Mostrar Referência Bíblica</span>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full transition-colors relative flex items-center",
                  showReference ? "bg-bible-accent" : "bg-bible-bg border border-bible-border"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                    showReference ? "translate-x-7" : "translate-x-1"
                  )} />
                </div>
              </button>
            </section>
          </div>

          {/* Action Footer */}
          <div className="p-8 bg-bible-surface/50 backdrop-blur-xl border-t border-bible-border/50 grid grid-cols-2 gap-4">
            <button
              onClick={handleCopy}
              disabled={isExporting}
              className="h-14 rounded-2xl bg-bible-surface border border-bible-border flex items-center justify-center gap-3 font-black text-sm uppercase tracking-tight hover:bg-bible-surface-strong transition-all active:scale-95 disabled:opacity-50"
            >
              <Copy className="w-5 h-5" /> Copiar
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="h-14 rounded-2xl bg-bible-accent text-white flex items-center justify-center gap-3 font-black text-sm uppercase tracking-tight shadow-xl shadow-bible-accent/30 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" /> {isExporting ? 'Salvando...' : 'Salvar PNG'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
