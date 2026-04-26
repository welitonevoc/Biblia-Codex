import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Share2, Palette, Type, 
  Layout, Sparkles, Image as ImageIcon,
  Check, ChevronLeft, ChevronRight, Copy
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '../utils/cn';

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
};

const THEMES: CardTheme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    className: 'bg-white',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
    textColor: '#1f2937',
    accentColor: '#3b82f6'
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    className: 'bg-gray-900',
    gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    textColor: '#f9fafb',
    accentColor: '#60a5fa'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    className: 'bg-orange-500',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    textColor: '#ffffff',
    accentColor: '#fef3c7'
  },
  {
    id: 'midnight-grace',
    name: 'Midnight Grace',
    className: 'bg-indigo-900',
    gradient: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    textColor: '#e0e7ff',
    accentColor: '#818cf8',
    overlay: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'1\' fill=\'white\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")'
  },
  {
    id: 'emerald-peace',
    name: 'Emerald Peace',
    className: 'bg-emerald-800',
    gradient: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
    textColor: '#d1fae5',
    accentColor: '#34d399'
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    className: 'bg-blue-900',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
    textColor: '#dbeafe',
    accentColor: '#60a5fa'
  },
  {
    id: 'sunset-psalms',
    name: 'Sunset',
    className: 'bg-rose-600',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #fb923c 100%)',
    textColor: '#ffffff',
    accentColor: '#ffe4e6'
  }
];

const FONTS = [
  { id: 'serif', name: 'Untitled Serif', className: 'font-serif' },
  { id: 'sans', name: 'Sans Serif', className: 'font-sans' },
  { id: 'mono', name: 'Monospace', className: 'font-mono' },
  { id: 'display', name: 'Display', className: 'font-display' }
];

export const VerseCardGenerator: React.FC<VerseCardGeneratorProps> = ({
  verses,
  reference,
  isOpen,
  onClose
}) => {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [currentFont, setCurrentFont] = useState(FONTS[0]);
  const [showReference, setShowReference] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const fullText = verses.map(v => v.text).join(' ');

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High quality
        backgroundColor: null,
        useCORS: true
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
      const canvas = await html2canvas(cardRef.current, { scale: 2 } as any);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert('Imagem copiada para a área de transferência!');
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-[var(--surface-0)] w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/10"
        >
          {/* Preview Area */}
          <div className="flex-1 p-8 bg-black/20 flex items-center justify-center min-h-[400px]">
            <div 
              ref={cardRef}
              className={cn(
                "relative w-[400px] h-[400px] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-10 text-center",
                currentTheme.className,
                currentFont.className
              )}
              style={{ background: currentTheme.gradient }}
            >
              {currentTheme.overlay && (
                <div className="absolute inset-0 z-0" style={{ backgroundImage: currentTheme.overlay }} />
              )}
              
              <div className="relative z-10 space-y-6 flex flex-col items-center">
                <Sparkles className="w-8 h-8 opacity-40 mb-2" style={{ color: currentTheme.accentColor }} />
                
                <p 
                  className="leading-relaxed font-medium"
                  style={{ color: currentTheme.textColor, fontSize: `${fontSize}px` }}
                >
                  "{fullText}"
                </p>
                
                {showReference && (
                  <div className="pt-6 flex flex-col items-center gap-2">
                    <div className="w-6 h-px opacity-30" style={{ backgroundColor: currentTheme.textColor }} />
                    <span 
                      className="text-sm font-bold uppercase tracking-[0.2em]"
                      style={{ color: currentTheme.accentColor }}
                    >
                      {reference}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-6 opacity-20 text-[10px] uppercase tracking-widest" style={{ color: currentTheme.textColor }}>
                  Codex Bible App
                </div>
              </div>
            </div>
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-80 p-6 space-y-8 bg-[var(--surface-1)] border-l border-white/5 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--text-bible)]">Gerador de Card</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--text-bible-muted)]" />
              </button>
            </div>

            {/* Themes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-bible-accent/70 uppercase tracking-wider">
                <Palette className="w-4 h-4" /> Temas
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={cn(
                      "group p-3 rounded-xl border flex flex-col gap-2 transition-all",
                      currentTheme.id === theme.id 
                        ? "bg-bible-accent/10 border-bible-accent shadow-inner-glow" 
                        : "bg-white/5 border-transparent hover:bg-white/10"
                    )}
                  >
                    <div 
                      className="w-full h-8 rounded-lg shadow-sm"
                      style={{ background: theme.gradient }}
                    />
                    <span className="text-[10px] font-medium text-[var(--text-bible)]">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-bible-accent/70 uppercase tracking-wider">
                <Type className="w-4 h-4" /> Tipografia
              </div>
              <div className="flex flex-wrap gap-2">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setCurrentFont(font)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs transition-all",
                      currentFont.id === font.id
                        ? "bg-bible-accent text-white"
                        : "bg-white/5 text-[var(--text-bible-muted)] hover:bg-white/10"
                    )}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <label className="text-[10px] text-[var(--text-bible-muted)] mb-2 block uppercase tracking-widest">Tamanho da Fonte</label>
                <input 
                  type="range" 
                  min="16" 
                  max="40" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-bible-accent/20 rounded-lg appearance-none cursor-pointer accent-bible-accent"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-bible-accent/70 uppercase tracking-wider">
                <Layout className="w-4 h-4" /> Layout
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showReference} 
                  onChange={(e) => setShowReference(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-bible-accent focus:ring-bible-accent"
                />
                <span className="text-sm text-[var(--text-bible)]">Mostrar Referência</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleCopy}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-[var(--text-bible)] hover:bg-white/10 transition-all font-semibold text-sm disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> Copiar
              </button>
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-bible-accent text-white shadow-lg shadow-bible-accent/25 hover:bg-bible-accent-strong transition-all font-bold text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {isExporting ? 'Salvando...' : 'Salvar PNG'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
