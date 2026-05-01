import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MessageSquare, Library, Layers, ChevronRight,
  ExternalLink, Search, Bookmark, Share2, Sparkles,
  Info, BookOpen, History, Users, MapPin, Calendar, ArrowRight
} from 'lucide-react';
import { BibleService } from '../BibleService';
import { Verse, Book, CrossReference, PeopleData, PlacesData, Footnote } from '../types';
import { useAppContext } from '../AppContext';
import { MySwordParser } from '../services/mySwordParser';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GenealogyTree } from './GenealogyTree';
import { PlacesView } from './PlacesView';
import DOMPurify from 'dompurify';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudyToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse;
  book: Book;
  type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes';
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}

export const StudyToolsPanel: React.FC<StudyToolsPanelProps> = React.memo(({
  isOpen,
  onClose,
  verse,
  book,
  type,
  onNavigate
}) => {
  type StudyToolContent = 
    | string
    | CrossReference[]
    | PeopleData[]
    | PlacesData[]
    | Footnote[]
    | Record<string, unknown>
    | null;

  const [content, setContent] = useState<StudyToolContent>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useAppContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (type === 'commentary') {
        const data = await BibleService.getCommentary(book.id, verse.chapter, verse.verse, settings.ai.model);
        setContent(data);
      } else if (type === 'dictionary') {
        const data = await BibleService.getDictionary('Codex');
        setContent(data);
      } else if (type === 'xrefs') {
        const data = await BibleService.getCrossReferences(book.id, verse.chapter, verse.verse, settings.ai.model);
        setContent(data);
      } else if (type === 'people') {
        const data = await BibleService.getPeopleData(book.id, verse.chapter, verse.verse);
        setContent(data);
      } else if (type === 'places') {
        const data = await BibleService.getPlacesData(book.id, verse.chapter, verse.verse);
        setContent(data);
      } else if (type === 'footnotes') {
        const data = await BibleService.getFootnotes(book.id, verse.chapter, verse.verse);
        setContent(data);
      }
      setLoading(false);
    };
    if (isOpen) fetchData();
  }, [isOpen, type, verse, book, settings.ai.model]);

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        if (href.startsWith('b')) {
          const match = href.match(/b(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const [_, b, c, v] = match;
            onNavigate(b, parseInt(c), parseInt(v));
            onClose();
          }
        } else if (href.startsWith('s')) {
          console.log(`Strong's: ${href.substring(1)}`);
        }
      }
    }
  };

  const titles = {
    commentary: 'Comentários Bíblicos',
    dictionary: 'Dicionário Teológico',
    xrefs: 'Referências Cruzadas',
    people: 'Pessoas Bíblicas',
    places: 'Lugares Bíblicos',
    footnotes: 'Notas de Rodapé'
  };

  const iconComponents = {
    commentary: MessageSquare,
    dictionary: Library,
    xrefs: Layers,
    people: Users,
    places: MapPin,
    footnotes: Info
  };

  const IconComponent = iconComponents[type];

  // GenealogyTree has its own full-screen layout, render it separately
  if (type === 'people' && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[300]"
        >
          <GenealogyTree
            bookId={book.id}
            chapter={verse.chapter}
            verse={verse.verse}
            onClose={onClose}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // PlacesView has its own full-screen layout, render it separately
  if (type === 'places' && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[300]"
        >
          <PlacesView
            bookId={book.id}
            chapter={verse.chapter}
            verse={verse.verse}
            places={content as PlacesData[] | undefined}
            onClose={onClose}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[250]"
            onClick={onClose}
          />

          {/* Panel Premium */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-[300] flex w-full max-w-lg flex-col overflow-hidden bg-bible-bg shadow-2xl"
          >
            {/* Background Decorator Premium */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-bible-accent/5 blur-[80px]" />
              <div className="absolute bottom-1/4 -left-20 w-60 h-60 rounded-full bg-bible-accent/5 blur-[60px]" />
            </div>

            {/* Header Premium */}
            <div className="shrink-0 relative z-10 px-4 py-4 backdrop-blur-xl bg-bible-bg/80 border-b border-bible-border/50 sm:px-6 sm:py-6">
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
                <div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
                  <div className="shrink-0 rounded-2xl bg-bible-accent/10 p-2.5 border border-bible-accent/20 shadow-inner sm:p-3">
                    {IconComponent ? (
                      <IconComponent className="w-5 h-5 text-bible-accent" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-bible-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="premium-kicker">Ferramenta de Estudo</span>
                    </div>
                    <h2 className="text-xl font-black text-bible-text tracking-tight leading-tight sm:text-2xl">{titles[type]}</h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="premium-icon-button h-11 w-11 shrink-0"
                  aria-label="Fechar ferramenta de estudo"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Reference Badge Premium */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex max-w-full items-center gap-2.5 rounded-2xl bg-bible-surface-strong/50 px-3 py-2.5 border border-bible-border/50 shadow-inner group sm:px-4"
              >
                <div className="w-2 h-2 rounded-full bg-bible-accent animate-pulse" />
                <span className="flex min-w-0 items-center gap-2 truncate text-[11px] font-black uppercase tracking-wider text-bible-text sm:tracking-widest">
                  {book.name} 
                  <span className="text-bible-accent">{verse.chapter}:{verse.verse}</span>
                </span>
                <div className="w-1 h-1 rounded-full bg-bible-text-subtle/30" />
                <span className="hidden text-[10px] font-bold text-bible-text-muted min-[380px]:inline">ARA</span>
              </motion.div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative z-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 px-10 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-8"
                  >
                    <div className="w-20 h-20 border-2 border-bible-accent/10 border-t-bible-accent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-bible-accent animate-pulse" />
                    </div>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-black text-bible-text mb-2 tracking-tight"
                  >
                    Sincronizando Codex
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-bible-text-muted font-bold uppercase tracking-widest leading-relaxed opacity-60"
                  >
                    Buscando as melhores fontes teológicas para o seu estudo...
                  </motion.p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto custom-scrollbar p-4 sm:p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-6"
                  >
                    {/* Commentary */}
                    {type === 'commentary' && content && typeof content === 'object' && 'content' in content && (
                      <div className="premium-card p-4 border-bible-border/30 bg-bible-bg/40 backdrop-blur-sm sm:p-6">
                        <div
                          onClick={handleLinkClick}
                          className="prose prose-bible max-w-none text-bible-text prose-p:leading-relaxed prose-strong:text-bible-accent prose-strong:font-black"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(MySwordParser.parseHTML((content as { content?: string }).content || (content as { text?: string }).text || '', settings))
                          }}
                        />
                      </div>
                    )}

                    {/* Dictionary */}
                    {type === 'dictionary' && content && typeof content === 'object' && !Array.isArray(content) && (
                      <div className="space-y-4">
                        {Object.entries(content as Record<string, unknown>).slice(0, 20).map(([key, value]) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card p-4 border-bible-border/30 bg-bible-bg/40 backdrop-blur-sm group sm:p-6"
                          >
                            <h3 className="text-base font-black text-bible-text mb-3 flex items-center gap-3 group-hover:text-bible-accent transition-colors">
                              <div className="w-1.5 h-6 bg-bible-accent rounded-full" />
                              {key}
                            </h3>
                            <div
                              onClick={handleLinkClick}
                              className="text-sm text-bible-text leading-relaxed font-serif opacity-90"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(value)) }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Cross References */}
                    {type === 'xrefs' && Array.isArray(content) && content.length > 0 && (
                      <div className="space-y-4">
                        {content.map((ref, i: number) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const r = ref as { bookId?: string; chapter?: number; verse?: number; bookName?: string; text?: string; reason?: string };
                              if (r.bookId) {
                                onNavigate(r.bookId, r.chapter ?? 1, r.verse ?? 1);
                                onClose();
                              }
                            }}
                            className="premium-card relative w-full overflow-hidden p-4 text-left group border-bible-border/30 bg-bible-bg/40 backdrop-blur-sm sm:p-6"
                          >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-bible-accent/5 rounded-full -translate-y-10 translate-x-10 blur-2xl group-hover:bg-bible-accent/10 transition-colors" />
                            
                            <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-bible-accent/10 border border-bible-accent/20">
                                  <BookOpen className="w-3.5 h-3.5 text-bible-accent" />
                                </div>
                                <span className="text-sm font-black text-bible-text tracking-tight group-hover:text-bible-accent transition-colors">
                                  {(ref as { bookName?: string }).bookName || (ref as { bookId?: string }).bookId} {(ref as { chapter?: number }).chapter}:{(ref as { verse?: number }).verse}
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-bible-surface-strong flex items-center justify-center border border-bible-border/50 group-hover:border-bible-accent/30 transition-all">
                                <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </div>
                            {(ref as { text?: string }).text && (
                              <p className="text-sm text-bible-text leading-relaxed font-serif italic relative z-10 opacity-90">
                                "{(ref as { text?: string }).text}"
                              </p>
                            )}
                            {(ref as { reason?: string }).reason && (
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-bible-border/30 relative z-10">
                                <Sparkles className="w-3 h-3 text-bible-accent" />
                                <p className="text-[11px] font-bold text-bible-text-muted uppercase tracking-widest">
                                  {(ref as { reason?: string }).reason}
                                </p>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {!content && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-center"
                      >
                        <div className="w-24 h-24 rounded-full bg-bible-surface-strong/50 flex items-center justify-center mb-6 border border-bible-border/50 shadow-inner">
                          <Info className="w-10 h-10 text-bible-text-subtle" />
                        </div>
                        <h3 className="text-xl font-black text-bible-text mb-2 tracking-tight">
                          Território Inexplorado
                        </h3>
                        <p className="text-sm text-bible-text-muted max-w-[240px] leading-relaxed">
                          Não encontramos registros de {titles[type].toLowerCase()} para este versículo específico.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
