import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MessageSquare, Library, Layers, ChevronRight,
  ExternalLink, Search, Bookmark, Share2, Sparkles,
  Info, BookOpen, History, Users, MapPin, Calendar, ArrowRight
} from 'lucide-react';
import { BibleService } from '../BibleService';
import { Verse, Book } from '../types';
import { useAppContext } from '../AppContext';
import { MySwordParser } from '../services/mySwordParser';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GenealogyTree } from './GenealogyTree';
import { PlacesView } from './PlacesView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudyToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse;
  book: Book;
  type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places';
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}

export const StudyToolsPanel: React.FC<StudyToolsPanelProps> = ({
  isOpen,
  onClose,
  verse,
  book,
  type,
  onNavigate
}) => {
  const [content, setContent] = useState<any>(null);
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
    places: 'Lugares Bíblicos'
  };

  const iconComponents = {
    commentary: MessageSquare,
    dictionary: Library,
    xrefs: Layers,
    people: Users,
    places: MapPin
  };

  const IconComponent = iconComponents[type];

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
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-bible-bg shadow-2xl flex flex-col z-[300]"
          >
            {/* Header Premium */}
            <div className="shrink-0 px-6 py-5 border-b border-bible-border/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-bible-accent/10">
                    {IconComponent ? (
                      <IconComponent className="w-5 h-5 text-bible-accent" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-bible-accent" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="premium-kicker">Estudo</span>
                    </div>
                    <h2 className="text-xl font-bold text-bible-text">{titles[type]}</h2>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="premium-icon-button"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Reference Badge Premium */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-bible-accent/10 to-bible-accent/5 border border-bible-accent/20"
              >
                <BookOpen className="w-3.5 h-3.5 text-bible-accent" />
                <span className="text-xs font-bold text-bible-accent">
                  {book.name} {verse.chapter}:{verse.verse}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-bible-accent/50" />
              </motion.div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {type === 'people' && Array.isArray(content) && content.length > 0 ? (
                <GenealogyTree
                  bookId={book.id}
                  chapter={verse.chapter}
                  verse={verse.verse}
                />
              ) : type === 'places' && Array.isArray(content) && content.length > 0 ? (
                <PlacesView
                  bookId={book.id}
                  chapter={verse.chapter}
                  verse={verse.verse}
                  places={content}
                />
              ) : (
                /* Content for other types */
                <div className="h-full overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                      >
                        <div className="w-12 h-12 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-bible-accent animate-pulse" />
                        </div>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-bible-text-muted mt-4 font-medium"
                      >
                        Carregando conteúdo...
                      </motion.p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-5 space-y-4"
                    >
                      {/* Commentary */}
                      {type === 'commentary' && content && (
                        <div className="premium-card p-5">
                          <div
                            onClick={handleLinkClick}
                            className="prose prose-bible max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: MySwordParser.parseHTML(content.content || content.text || '', settings)
                            }}
                          />
                        </div>
                      )}

                      {/* Dictionary */}
                      {type === 'dictionary' && content && (
                        <div className="space-y-3">
                          {Object.entries(content).slice(0, 20).map(([key, value]: [string, any]) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="premium-card p-5"
                            >
                              <h3 className="text-sm font-bold text-bible-text mb-2 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-bible-accent" />
                                {key}
                              </h3>
                              <div
                                onClick={handleLinkClick}
                                className="text-sm text-bible-text leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: value }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Cross References */}
                      {type === 'xrefs' && Array.isArray(content) && content.length > 0 && (
                        <div className="space-y-3">
                          {content.map((ref: any, i: number) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ scale: 1.01, y: -2 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => {
                                if (ref.bookId) {
                                  onNavigate(ref.bookId, ref.chapter, ref.verse);
                                  onClose();
                                }
                              }}
                              className="premium-card p-5 w-full text-left group"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-bible-accent" />
                                  <span className="text-xs font-semibold text-bible-accent">
                                    {ref.bookName || ref.bookId} {ref.chapter}:{ref.verse}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all" />
                              </div>
                              {ref.text && (
                                <p className="text-sm text-bible-text line-clamp-2 leading-relaxed font-serif">
                                  {ref.text}
                                </p>
                              )}
                              {ref.reason && (
                                <p className="text-xs text-bible-text-muted mt-2">
                                  {ref.reason}
                                </p>
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
                          className="text-center py-16 px-4"
                        >
                          <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
                            <Info className="w-8 h-8 text-bible-accent" />
                          </div>
                          <h3 className="text-sm font-bold text-bible-text mb-1">
                            Nenhum conteúdo disponível
                          </h3>
                          <p className="text-xs text-bible-text-muted">
                            Não há {titles[type].toLowerCase()} para este versículo
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
