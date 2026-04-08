import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MessageSquare, Library, Layers, ChevronRight, 
  ExternalLink, Search, Bookmark, Share2, Sparkles,
  Info, BookOpen, History
} from 'lucide-react';
import { BibleService } from '../BibleService';
import { Verse, Book } from '../types';
import { useAppContext } from '../AppContext';
import { MySwordParser } from '../services/mySwordParser';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudyToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse;
  book: Book;
  type: 'commentary' | 'dictionary' | 'xrefs';
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
        // Handle MySword links
        if (href.startsWith('b')) {
          // Bible link
          const match = href.match(/b(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const [_, b, c, v] = match;
            onNavigate(b, parseInt(c), parseInt(v));
            onClose();
          }
        } else if (href.startsWith('s')) {
          // Strong's link
          console.log(`Strong's: ${href.substring(1)}`);
        }
      }
    }
  };

  const titles = {
    commentary: 'Comentários Bíblicos',
    dictionary: 'Dicionário Teológico',
    xrefs: 'Referências Cruzadas'
  };

  const icons = {
    commentary: MessageSquare,
    dictionary: Library,
    xrefs: Layers
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[250]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-bible-bg border-l border-bible-accent/20 z-[300] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-bible-accent/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-bible-accent" />
                <h2 className="text-xl font-display font-bold">{titles[type]}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bible-accent/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-bible-accent/5 border-b border-bible-accent/10">
              <p className="ui-text text-xs font-bold uppercase tracking-widest opacity-40">Referência</p>
              <p className="font-display font-bold text-lg">{book.name} {verse.chapter}:{verse.verse}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                  <div className="w-10 h-10 border-2 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
                  <p className="ui-text text-sm italic">Consultando módulos instalados...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {type === 'xrefs' ? (
                    <div className="grid grid-cols-1 gap-4">
                      {(content as any[]).map((ref, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            onNavigate(ref.bookId, ref.chapter, ref.verse);
                            onClose();
                          }}
                          className="w-full text-left p-5 rounded-2xl bg-bible-accent/5 border border-bible-accent/10 hover:bg-bible-accent/10 transition-all group space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-bold text-lg">{ref.bookName} {ref.chapter}:{ref.verse}</span>
                            <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all" />
                          </div>
                          <p className="bible-text text-base opacity-80 leading-relaxed italic">"{ref.text}"</p>
                          <div className="pt-2 border-t border-bible-accent/10">
                            <p className="ui-text text-[11px] font-medium opacity-50 uppercase tracking-wider mb-1">Por que está relacionado:</p>
                            <p className="ui-text text-sm opacity-70">{ref.reason}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-bible max-w-none">
                      <div 
                        onClick={handleLinkClick}
                        className="ui-text text-base leading-relaxed space-y-4"
                      >
                        {typeof content === 'string' && (content.includes('<') && content.includes('>')) ? (
                          <div dangerouslySetInnerHTML={{ __html: MySwordParser.parseContent(content) }} />
                        ) : (
                          <ReactMarkdown>{content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-bible-accent/10 bg-bible-accent/5">
              <div className="flex items-center justify-between opacity-40">
                <p className="ui-text text-[10px] uppercase tracking-widest font-bold">Módulo: MySword Standard</p>
                <button className="flex items-center space-x-1 hover:opacity-100 transition-opacity">
                  <span className="ui-text text-[10px] font-bold">Alterar Módulo</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
