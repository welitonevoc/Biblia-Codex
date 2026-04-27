import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Layers, ChevronRight, ChevronLeft, Search, ArrowUpDown, ThumbsUp, X } from 'lucide-react';
import { loadCrossReferences, getCrossReferences, getReverseReferences, CrossRefEntry } from '../services/CrossReferenceService';
import { BIBLE_BOOKS } from '../data/bibleMetadata';

interface XRefsPageProps {
  onClose?: () => void;
  bookId?: string;
  chapter?: number;
  verse?: number;
  onNavigate?: (bookId: string, chapter: number, verse: number) => void;
}

export function XRefsPage({ onClose, bookId, chapter, verse, onNavigate }: XRefsPageProps) {
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(bookId || 'gn');
  const [selectedChapter, setSelectedChapter] = useState(chapter || 1);
  const [selectedVerse, setSelectedVerse] = useState(verse || 1);
  const [sortByVotes, setSortByVotes] = useState(true);
  const [showReverse, setShowReverse] = useState(false);

  const books = BIBLE_BOOKS.slice(0, 66);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadCrossReferences();
    setLoading(false);
  };

  const refs = useMemo(() => {
    const forwardRefs = getCrossReferences(selectedBook, selectedChapter, selectedVerse);
    const reverseRefs = getReverseReferences(selectedBook, selectedChapter, selectedVerse);
    
    const allRefs = showReverse ? [...forwardRefs, ...reverseRefs] : forwardRefs;
    
    if (sortByVotes) {
      return allRefs.sort((a, b) => b.votes - a.votes);
    }
    return allRefs;
  }, [selectedBook, selectedChapter, selectedVerse, sortByVotes, showReverse]);

  const getBookName = (bookId: string) => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    return book?.name || bookId;
  };

  const handleVerseClick = (ref: CrossRefEntry) => {
    const targetRef = showReverse ? ref.from : ref.to;
    if (onNavigate) {
      onNavigate(targetRef.bookId, targetRef.chapter, targetRef.verse);
    }
  };

  const selectedBookName = getBookName(selectedBook);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-bible)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-[var(--accent-bible)] border-t-transparent"
        />
        <p className="mt-4 text-sm text-[var(--text-bible-muted)]">Carregando referências...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-bible)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.05 }} />
      </div>

      <div className="relative shrink-0 px-4 py-4 z-10">
        <div className="absolute inset-0 border-b" style={{ borderColor: 'var(--border-bible)' }} />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-bible)' }}>Referências Cruzadas</span>
            </div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>
              {selectedBookName} {selectedChapter}:{selectedVerse}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-bible-muted)' }}>
              {refs.length} referências encontradas
            </p>
          </div>
          {onClose && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}>
              <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
            </motion.button>
          )}
        </div>
      </div>

      <div className="relative px-4 py-2 border-b" style={{ borderColor: 'var(--border-bible)' }}>
        <div className="flex gap-2 items-center">
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)', color: 'var(--text-bible)' }}
          >
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="150"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-2 rounded-lg text-sm text-center"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)', color: 'var(--text-bible)' }}
          />
          <span style={{ color: 'var(--text-bible-muted)' }}>:</span>
          <input
            type="number"
            min="1"
            max="176"
            value={selectedVerse}
            onChange={(e) => setSelectedVerse(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-2 rounded-lg text-sm text-center"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)', color: 'var(--text-bible)' }}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setSortByVotes(!sortByVotes)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ 
              backgroundColor: sortByVotes ? 'var(--accent-bible)' : 'var(--surface-2)',
              color: sortByVotes ? 'white' : 'var(--text-bible)'
            }}
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortByVotes ? 'Mais votadas' : 'Ordem'}
          </button>
          <button
            onClick={() => setShowReverse(!showReverse)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
            style={{ 
              backgroundColor: showReverse ? 'var(--accent-bible)' : 'var(--surface-2)',
              color: showReverse ? 'white' : 'var(--text-bible)'
            }}
          >
            <ChevronRight className="w-3 h-3" />
            {showReverse ? 'Todas' : 'Só orig.'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {refs.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <Layers className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">Nenhuma referência cruzada encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {refs.map((ref, idx) => {
              const targetRef = showReverse ? ref.from : ref.to;
              const bookName = getBookName(targetRef.bookId);
              
              return (
                <motion.div
                  key={`${targetRef.bookId}-${targetRef.chapter}-${targetRef.verse}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => handleVerseClick(ref)}
                  className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:border-[var(--accent-bible)]/50"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--text-bible)' }}>
                        {bookName} {targetRef.chapter}:{targetRef.verse}
                      </span>
                      {ref.votes > 100 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-bible)', color: 'white' }}>
                          🔥 Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--text-bible-muted)' }}>
                      <ThumbsUp className="w-3 h-3" />
                      <span>{ref.votes} votos</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-bible-subtle)' }} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}