import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Share2, Palette, Type, 
  Layout, Sparkles, Image as ImageIcon,
  Check, ChevronLeft, ChevronRight, Copy,
  Maximize2, Smartphone, Monitor, Instagram, Send,
  Layers, Hexagon, Wand2
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
    id: 'divine-light',
    name: 'Divine Light',
    className: 'bg-white',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    textColor: '#0f172a',
    accentColor: '#2563eb'
  }
];

const FONTS = [
  { id: 'serif', name: 'Premium Serif', className: 'font-serif tracking-tight' },
  { id: 'sans', name: 'Modern Sans', className: 'font-sans font-black' },
  { id: 'display', name: 'Elegant Display', className: 'font-display italic' },
  { id: 'mono', name: 'Codex Mono', className: 'font-mono' }
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
      // We don't have toast here, but we can use alert or just rely on the UI feedback
      // Actually, let's just make it work for now.
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
        className="fixed inset-0 z-[500] flex flex-col md:flex-row items-stretch bg-black overflow-hidden"
      >
        {/* Background Decorative Blur */}
        <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-[80%] h-[80%] bg-bible-accent/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 -right-1/4 w-[80%] h-[80%] bg-purple-500/10 blur-[150px] rounded-full" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[600] w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:rotate-90 transition-all duration-500 active:scale-90"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Left: Preview Area */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <motion.div 
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex items-center justify-center w-full h-full max-h-[85vh] drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          >
            <div 
              ref={cardRef}
              className={cn(
                "relative overflow-hidden flex flex-col items-center justify-center p-12 text-center transition-all duration-700",
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
                <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: currentTheme.overlay }} />
              )}
              
              {/* Glassmorphism Elements if theme supports */}
              {currentTheme.glass && (
                <>
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 blur-[60px] rounded-full" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[60px] rounded-full" />
                </>
              )}

              <div className="relative z-10 flex flex-col items-center gap-10 max-w-[85%]">
                <motion.div 
                  animate={{ rotate: [0, 12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-7 h-7" style={{ color: currentTheme.accentColor }} />
                </motion.div>
                
                <p 
                  className="leading-[1.5] font-black"
                  style={{ color: currentTheme.textColor, fontSize: `${fontSize}px` }}
                >
                  “{fullText}”
                </p>
                
                {showReference && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-[2px] rounded-full opacity-30" style={{ backgroundColor: currentTheme.textColor }} />
                    <span 
                      className="text-sm font-black uppercase tracking-[0.4em]"
                      style={{ color: currentTheme.accentColor }}
                    >
                      {referenceWithVersion}
                    </span>
                  </div>
                )}
              </div>

              {/* Minimal Branding */}
              <div className="absolute bottom-12 flex items-center gap-3 opacity-40">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: currentTheme.textColor }}>
                  Codex • Biblia Digital
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Controls Panel */}
        <div className="w-full md:w-[460px] bg-[#0a0a0a]/80 backdrop-blur-3xl border-l border-white/5 flex flex-col z-[550] shadow-2xl">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-bible-accent/10">
                <Wand2 className="w-5 h-5 text-bible-accent" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-bible-accent">Codex Studio</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Estilizar</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-12 custom-scrollbar">
            {/* Formats */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tamanho da Tela</span>
              </div>
              <div className="flex gap-3">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentFormat(f)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                      currentFormat.id === f.id 
                        ? "bg-bible-accent/20 border-bible-accent text-white" 
                        : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                    )}
                  >
                    <f.icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{f.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Themes Selection */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Esquema de Cores</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {THEMES.map(theme => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentTheme(theme)}
                    className={cn(
                      "aspect-square rounded-[24px] border-4 transition-all relative overflow-hidden",
                      currentTheme.id === theme.id 
                        ? "border-bible-accent shadow-lg shadow-bible-accent/40" 
                        : "border-white/5 opacity-70 hover:opacity-100"
                    )}
                  >
                    <div className={cn("absolute inset-0", theme.className)} />
                    {currentTheme.id === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-bible-accent/20 backdrop-blur-[2px]">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tipografia & Estilo</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setCurrentFont(font)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest",
                      currentFont.id === font.id
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white/60 border-transparent hover:bg-white/10"
                    )}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
              <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tamanho da Fonte</span>
                  <span className="text-sm font-black text-bible-accent">{fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="16" 
                  max="72" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-bible-accent"
                />
              </div>
            </section>

            {/* Layout Toggles */}
            <section className="pb-32">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Opções de Layout</span>
              </div>
              <button 
                onClick={() => setShowReference(!showReference)}
                className="w-full flex items-center justify-between p-5 rounded-[28px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl transition-colors", showReference ? "bg-bible-accent/20 text-bible-accent" : "bg-white/5 text-white/40")}>
                    <Hexagon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-white/80">Referência Bíblica</span>
                </div>
                <div className={cn(
                  "w-14 h-7 rounded-full transition-all duration-500 relative flex items-center px-1",
                  showReference ? "bg-bible-accent" : "bg-white/10"
                )}>
                  <motion.div 
                    animate={{ x: showReference ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-white shadow-xl" 
                  />
                </div>
              </button>
            </section>
          </div>

          {/* Actions Bottom Bar */}
          <div className="p-8 bg-black/60 backdrop-blur-2xl border-t border-white/10 grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareText}
              className="h-16 rounded-[24px] bg-white/5 border border-white/10 text-white flex flex-col items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Send className="w-4 h-4" /> Texto
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              disabled={isExporting}
              className="h-16 rounded-[24px] bg-white/5 border border-white/10 text-white flex flex-col items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <Copy className="w-5 h-5" /> Imagem
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={isExporting}
              className="h-16 rounded-[24px] bg-bible-accent text-white flex flex-col items-center justify-center gap-1 font-black text-[9px] uppercase tracking-widest shadow-2xl shadow-bible-accent/40 hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5" /> {isExporting ? '...' : 'Salvar'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
