import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Book, Clock, MapPin, Cross, Lightbulb } from 'lucide-react';
import { Footnote, FootnoteType } from '../../types';
import { footnoteService } from '../../services/FootnoteService';
import { clsx } from 'clsx';

interface FootnotePopupProps {
  footnote: Footnote | null;
  visible: boolean;
  onClose: () => void;
  onNavigate?: (bookId: string, chapter: number, verse: number) => void;
  onStrongsClick?: (number: string) => void;
}

const typeIcons: Record<FootnoteType, React.ReactNode> = {
  textual: <Book className="w-4 h-4" />,
  historical: <Clock className="w-4 h-4" />,
  geographic: <MapPin className="w-4 h-4" />,
  theological: <Cross className="w-4 h-4" />,
  chronological: <Clock className="w-4 h-4" />,
  application: <Lightbulb className="w-4 h-4" />,
};

const typeLabels: Record<FootnoteType, string> = {
  textual: 'Nota Textual',
  historical: 'Contexto Histórico',
  geographic: 'Informação Geográfica',
  theological: 'Nota Teológica',
  chronological: 'Cronologia',
  application: 'Aplicação Prática',
};

const typeColors: Record<FootnoteType, string> = {
  textual: 'bg-blue-100 text-blue-800 border-blue-200',
  historical: 'bg-amber-100 text-amber-800 border-amber-200',
  geographic: 'bg-teal-100 text-teal-800 border-teal-200',
  theological: 'bg-purple-100 text-purple-800 border-purple-200',
  chronological: 'bg-red-100 text-red-800 border-red-200',
  application: 'bg-green-100 text-green-800 border-green-200',
};

export const FootnotePopup: React.FC<FootnotePopupProps> = ({
  footnote,
  visible,
  onClose,
  onNavigate,
  onStrongsClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!footnote) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className={clsx(
            'rounded-xl shadow-2xl border overflow-hidden',
            'bg-white dark:bg-gray-900',
            'border-gray-200 dark:border-gray-700'
          )}>
            <div className={clsx(
              'flex items-center justify-between px-4 py-3',
              'bg-gray-50 dark:bg-gray-800',
              'border-b border-gray-200 dark:border-gray-700'
            )}>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                  typeColors[footnote.type]
                )}>
                  {typeIcons[footnote.type]}
                  {typeLabels[footnote.type]}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {footnote.content}
              </p>

              {footnote.strongsNumber && (
                <button
                  onClick={() => onStrongsClick?.(footnote.strongsNumber!)}
                  className="mt-3 inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {footnote.strongsNumber}
                  </span>
                </button>
              )}

              {footnote.references && footnote.references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 mb-2">Referências:</p>
                  <div className="flex flex-wrap gap-1">
                    {footnote.references.map((ref, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const match = ref.match(/^([A-Z]+)\.(\d+):(\d+)$/);
                          if (match && onNavigate) {
                            onNavigate(match[1], parseInt(match[2]), parseInt(match[3]));
                          }
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {footnote.source && (
                <p className="mt-3 text-xs text-gray-500">
                  Fonte: {footnote.source}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FootnotePopup;