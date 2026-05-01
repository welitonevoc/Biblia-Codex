import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { Verse, Book, Bookmark as BookmarkType, Tag as TagType } from '../../types';
import { BibleService } from '../../BibleService';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';
import { useAppContext } from '../../app/AppContext';
import { storage } from '../../StorageService';
import { MySwordParser } from '../../services/mySwordParser';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'dompurify';
import {
  Bookmark, Share2, MessageSquare,
  Sparkles, Library, Layers, X, Volume2, Trash2, Tag, Copy, GitCompare, Highlighter,
  ChevronLeft, ChevronRight, Users, MapPin, FileText, BookOpen
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Toast, ToastType } from '../../components/ui/toast';
import { stripTags } from '../../utils/textUtils';

export const ReaderTooltip = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 px-3 py-1.5 rounded-lg bg-bible-surface-strong/90 backdrop-blur-md border border-white/10 shadow-xl z-50 pointer-events-none whitespace-nowrap"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{label}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-bible-surface-strong/90 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, active, danger, highlight }: any) => (
  <ReaderTooltip label={label}>
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 min-w-[56px] relative group",
        active ? "bg-bible-accent text-white shadow-lg shadow-bible-accent/30 scale-105" : "hover:bg-bible-surface-strong text-bible-text-muted",
        danger && "hover:text-red-500 hover:bg-red-500/10",
        highlight && !active && "text-bible-accent bg-bible-accent/10 hover:bg-bible-accent/20"
      )}
    >
      {highlight && !active && (
        <div className="absolute inset-0 rounded-xl bg-bible-accent/5 animate-pulse" />
      )}
      <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", active ? "stroke-[2.5px]" : "stroke-[1.8px]")} />
      <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100">{label}</span>
    </button>
  </ReaderTooltip>
);

const Plus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

import { DictionaryBottomSheet } from '../study/DictionaryBottomSheet';
import { useReaderSelection } from '../../hooks/useReaderSelection';
import { useReaderTTS } from '../../hooks/useReaderTTS';
import { StrongsBottomSheet } from '../study/StrongsBottomSheet';
import { CommentaryBottomSheet } from '../study/CommentaryBottomSheet';
import { CrossReferencesBottomSheet } from '../study/CrossReferencesBottomSheet';

interface ReaderProps {
  book: Book;
  chapter: number;
  targetVerse?: number;
  onTargetVerseReached?: () => void;
  onVerseSelect?: (verse: Verse) => void;
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
  onStudyOpen: (selectedVerses: { verse: number, text: string }[]) => void;
  onToolOpen: (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes') => void;
  onShare: (verses: { verse: number, text: string }[], reference: string) => void;
  onBottomChange?: (isAtBottom: boolean) => void;
}

  const VerseItem = React.memo(({ 
    v, 
    headingsHtml, 
    bodyHtml, 
    bookmark, 
    showHighlight, 
    isChapterHeader, 
    chapterHeaderHtml, 
    hasHeadingBlock,
    selectedVerses,
    currentHighlightedVerse,
    settings,
    allTags,
    toggleVerseSelection,
    onToolOpen,
    handleRemoveTag,
    onShare,
    verseRef
  }: {
    v: Verse;
    headingsHtml: string;
    bodyHtml: string;
    bookmark: BookmarkType | undefined;
    showHighlight: boolean;
    isChapterHeader: boolean;
    chapterHeaderHtml: string;
    hasHeadingBlock: boolean;
    selectedVerses: number[];
    currentHighlightedVerse: number | null;
    settings: any;
    allTags: TagType[];
    toggleVerseSelection: (verseNum: number) => void;
    onToolOpen: (verse: Verse, type: any) => void;
    handleRemoveTag: (bmId: string, tagId: string) => void;
    onShare: (v: Verse) => void;
    verseRef: (el: HTMLDivElement | null) => void;
  }) => {
    const isSelected = selectedVerses.includes(v.verse);
    const isHighlighted = currentHighlightedVerse === v.verse;
    
    if (isChapterHeader) {
      return (
        <div
          ref={verseRef}
          className={cn(
            "w-full",
            settings.textDisplay.paragraphMode ? "mb-4" : "mb-6"
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapterHeaderHtml) }}
        />
      );
    }

    return (
      <div
        ref={verseRef}
        className={cn(
          "group relative",
          hasHeadingBlock && "basis-full w-full",
          !settings.textDisplay.paragraphMode && "block w-full mb-1"
        )}
      >
        {headingsHtml && (
          <div
            className={cn(
              "w-full mb-3",
              settings.textDisplay.paragraphMode && "mt-4"
            )}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(headingsHtml) }}
          />
        )}

        {settings.textDisplay.paragraphMode ? (
          // Modo Parágrafo: inline com destaque sutil
          <span
            id={`verse-${v.verse}`}
            onClick={(e) => toggleVerseSelection(v.verse, e)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVerseSelection(v.verse, e); } }}
            role="button"
            tabIndex={0}
            aria-label={`Versículo ${v.verse}`}
            className={cn(
              "relative cursor-pointer transition-all duration-200 rounded-lg px-1 -mx-1",
              isSelected && "bg-bible-accent/15 shadow-[0_0_0_2px_rgba(var(--accent-bible-rgb),0.1)]",
              isHighlighted && "bg-yellow-400/30 ring-2 ring-yellow-400/40",
              showHighlight && settings.visualResources.gradientHighlight && "bg-gradient-to-r from-transparent via-bible-accent/8 to-transparent"
            )}
            style={showHighlight && bookmark ? {
              backgroundColor: `${bookmark.color}4D`,
              borderBottom: settings.visualResources.gradientHighlight ? 'none' : `2px solid ${bookmark.color}`
            } : {}}
          >
            {settings.textDisplay.verseNumbers && (
              <sup className="premium-kicker !text-[10px] !py-0.5 !px-1.5 mr-1.5">
                {v.verse}
              </sup>
            )}
            <span
              className={cn(
                settings.textDisplay.wordsOfJesusRed && v.text.includes("Jesus") && "words-of-jesus"
              )}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }}
            />
          </span>
        ) : (
          // Modo Versículo: Card Premium vibrante
          <div
            id={`verse-${v.verse}`}
            onClick={(e) => toggleVerseSelection(v.verse, e)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVerseSelection(v.verse, e); } }}
            role="button"
            tabIndex={0}
            aria-label={`Versículo ${v.verse}`}
            className={cn(
              "premium-card-soft p-3 sm:p-4 cursor-pointer transition-all duration-300",
              "hover:shadow-md hover:bg-[var(--surface-2)]",
              isSelected && "ring-2 ring-[var(--accent-bible)] bg-[var(--accent-bible)]/8 shadow-md",
              isHighlighted && "ring-2 ring-yellow-400/50 bg-yellow-400/20",
              showHighlight && settings.visualResources.gradientHighlight && "bg-gradient-to-r from-transparent via-[var(--accent-bible)]/5 to-transparent"
            )}
            style={showHighlight && bookmark ? {
              backgroundColor: `${bookmark.color}4D`,
              borderBottom: settings.visualResources.gradientHighlight ? 'none' : `2px solid ${bookmark.color}`
            } : {}}
          >
            <div className="flex items-start gap-3">
              {settings.textDisplay.verseNumbers && (
                <span className="premium-kicker shrink-0 !text-[11px] !py-1 !px-2.5 mt-0.5">
                  {v.verse}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "bible-text block",
                    settings.textDisplay.wordsOfJesusRed && v.text.includes("Jesus") && "words-of-jesus"
                  )}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }}
                />
                
                {bookmark && bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {bookmark.tags.map(tId => {
                      const tag = allTags.find(t => t.id === tId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tId}
                          className="group/tag inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight relative"
                          style={{ backgroundColor: tag.background, color: tag.textColor }}
                        >
                          {tag.name}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveTag(bookmark.id, tId); }}
                            className="hidden group-hover/tag:inline-flex items-center justify-center min-w-11 min-h-11 rounded-full hover:bg-black/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]"
                            aria-label="Remover tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--border-bible)]/30">
              {settings.modules.commentary && (
                <ReaderTooltip label="Comentário">
                  <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'commentary'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Abrir comentário">
                    <MessageSquare className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
              )}
              {settings.modules.dictionary && (
                <ReaderTooltip label="Dicionário">
                  <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'dictionary'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Abrir dicionário">
                    <Library className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
              )}
              {settings.modules.xrefs && settings.visualResources.crossRefs && (
                <ReaderTooltip label="Ref. Cruzadas">
                  <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'xrefs'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Ver referências cruzadas">
                    <Layers className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
              )}
              <ReaderTooltip label="Pessoas">
                <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'people'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Ver pessoas">
                  <Users className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                </button>
              </ReaderTooltip>
              <ReaderTooltip label="Lugares">
                <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'places'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Ver lugares">
                  <MapPin className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                </button>
              </ReaderTooltip>
              {settings.textDisplay.footnotes && (
                <ReaderTooltip label="Notas">
                  <button onClick={(e) => { e.stopPropagation(); onToolOpen(v, 'footnotes'); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool" aria-label="Ver notas de rodapé">
                    <FileText className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
              )}
              <ReaderTooltip label="Compartilhar">
                <button onClick={(e) => { e.stopPropagation(); onShare(v); }} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)] group/tool ml-auto" aria-label="Compartilhar versículo">
                  <Share2 className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                </button>
              </ReaderTooltip>
            </div>
          </div>
        )}

            {settings.textDisplay.paragraphMode && (
              <div className={cn(
                "inline-flex items-center ml-2 space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-bible-accent/7 backdrop-blur-sm rounded-full px-2 py-1 border border-bible-accent/10",
              )}>
                {settings.modules.commentary && (
                  <ReaderTooltip label="Comentário">
                    <button onClick={() => onToolOpen(v, 'commentary')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Abrir comentário">
                      <MessageSquare className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                    </button>
                  </ReaderTooltip>
                )}
                {settings.modules.dictionary && (
                  <ReaderTooltip label="Dicionário">
                    <button onClick={() => onToolOpen(v, 'dictionary')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Abrir dicionário">
                      <Library className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                    </button>
                  </ReaderTooltip>
                )}
                {settings.modules.xrefs && settings.visualResources.crossRefs && (
                  <ReaderTooltip label="Ref. Cruzadas">
                    <button onClick={() => onToolOpen(v, 'xrefs')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Ver referências cruzadas">
                      <Layers className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                    </button>
                  </ReaderTooltip>
                )}
                <ReaderTooltip label="Pessoas">
                  <button onClick={() => onToolOpen(v, 'people')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Ver pessoas">
                    <Users className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
                <ReaderTooltip label="Lugares">
                  <button onClick={() => onToolOpen(v, 'places')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Ver lugares">
                    <MapPin className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
                {settings.textDisplay.footnotes && (
                  <ReaderTooltip label="Notas">
                    <button onClick={() => onToolOpen(v, 'footnotes')} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Ver notas de rodapé">
                      <FileText className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                    </button>
                  </ReaderTooltip>
                )}
                <ReaderTooltip label="Compartilhar">
                  <button onClick={() => onShare(v)} className="min-w-10 min-h-10 p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bible)]" aria-label="Compartilhar versículo">
                    <Share2 className="w-4 h-4 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                  </button>
                </ReaderTooltip>
              </div>
            )}
      </div>
    );
  });

export const Reader: React.FC<ReaderProps> = React.memo(({
  book,
  chapter,
  targetVerse,
  onTargetVerseReached,
  onVerseSelect,
  onNavigate,
  onStudyOpen,
  onToolOpen,
  onShare,
  onBottomChange
}) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [selectedStrongs, setSelectedStrongs] = useState<string>('');
  const [isStrongsOpen, setIsStrongsOpen] = useState(false);
  const [selectedCommentaryVerse, setSelectedCommentaryVerse] = useState<Verse | null>(null);
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isXrefsOpen, setIsXrefsOpen] = useState(false);
  const { config, settings, currentVersion } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [navHighlight, setNavHighlight] = useState<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const checkIfAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const threshold = 50;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
    
    if (atBottom !== isAtBottom) {
      setIsAtBottom(atBottom);
    }
  }, [isAtBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(checkIfAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    // Verificação inicial
    checkIfAtBottom();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  useEffect(() => {
    onBottomChange?.(isAtBottom);
  }, [isAtBottom, onBottomChange]);

  const {
    selectedVerses,
    setSelectedVerses,
    showColorPicker,
    setShowColorPicker,
    showTagEditor,
    setShowTagEditor,
    currentTags,
    setCurrentTags,
    bookmarkMap,
    toggleVerseSelection,
    handleStudy,
    handleBookmark,
    handleDeleteBookmarks,
    handleRemoveTag,
    handleSaveTags
  } = useReaderSelection({
    book,
    chapter,
    verses,
    bookmarks,
    setBookmarks,
    onStudyOpen,
    setAllTags
  });

  const {
    isSpeakingTTS,
    currentHighlightedVerse,
    toggleTTS,
    isTTSSupported
  } = useReaderTTS({ verses });

  const selectedVerseData = selectedVerses
    .map((vNum) => verses.find((v) => v.verse === vNum))
    .filter(Boolean) as Verse[];

  const selectedReference = useMemo(() => {
    if (selectedVerses.length === 0) return `${book.name} ${chapter}`;

    const ordered = [...selectedVerses].sort((a, b) => a - b);
    const segments: string[] = [];
    let start = ordered[0];
    let prev = ordered[0];

    for (let i = 1; i < ordered.length; i++) {
      const current = ordered[i];
      if (current === prev + 1) {
        prev = current;
        continue;
      }
      segments.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = current;
      prev = current;
    }
    segments.push(start === prev ? `${start}` : `${start}-${prev}`);

    return `${book.name} ${chapter}:${segments.join(',')}`;
  }, [selectedVerses, book.name, chapter, currentVersion]);

  const handleCopySelected = useCallback(async () => {
    if (selectedVerseData.length === 0) return;
    const text = `"${selectedVerseData.map((v) => stripTags(v.text)).join(' ')}" ${selectedReference} - ${currentVersion?.abbreviation || 'ARA'}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: 'Copiado para a área de transferência', type: 'success' });
      setSelectedVerses([]);
    } catch (error) {
      console.error('Erro ao copiar versículos selecionados:', error);
      setToast({ message: 'Erro ao copiar texto', type: 'error' });
    }
  }, [selectedVerseData, selectedReference, setSelectedVerses]);

  const handleToolOpen = useCallback((v: Verse, type: string) => {
    if (type === 'commentary') {
      setSelectedCommentaryVerse(v);
      setIsCommentaryOpen(true);
      return;
    }
    if (type === 'xrefs') {
      setSelectedCommentaryVerse(v);
      setIsXrefsOpen(true);
      return;
    }
    onToolOpen(v, type as any);
  }, [onToolOpen]);

  useEffect(() => {
    let cancelled = false;
    const fetchVerses = async () => {
      setLoading(true);
      try {
        const data = await BibleService.getVerses(book.id, chapter, currentVersion || undefined, settings.textDisplay);
        if (!cancelled) setVerses(data);
      } catch (error) {
        if (!cancelled) console.error("Erro ao carregar versículos:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }

      const [savedBookmarks, savedTags] = await Promise.all([
        storage.getBookmarks(),
        storage.getTags()
      ]);
      if (!cancelled) {
        setBookmarks(savedBookmarks);
        setAllTags(savedTags);
      }
    };
    fetchVerses();
    return () => { cancelled = true; };
  }, [book.id, chapter, currentVersion?.id, settings.textDisplay]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTop = 0;

    // Pequeno delay para garantir que o scroll ocorra após a renderização
    const raf = requestAnimationFrame(() => {
      container.scrollTop = 0;
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [book.id, chapter]);

  useEffect(() => {
    if (!targetVerse || !verseRefs.current[targetVerse]) return;
    
    const verseElement = verseRefs.current[targetVerse];
    if (verseElement) {
      setTimeout(() => {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setNavHighlight(targetVerse);
        onTargetVerseReached?.();
        
        // Clear highlight after 3 seconds
        setTimeout(() => setNavHighlight(null), 3000);
      }, 150);
    }
  }, [targetVerse, book.id, chapter, onTargetVerseReached]);

  const splitVerseHtml = useCallback((text: string, verseNumber: number, isChapterHeader?: boolean) => {
    const normalizedText = text.replace(/\r\n?/g, '\n').trim();
    let workingText = normalizedText;
    let fallbackHeading = '';

    if (!isChapterHeader) {
      const plainHeadingParts = workingText.split(/\n\s*\n+/);
      if (plainHeadingParts.length > 1) {
        const candidateHeading = plainHeadingParts[0]?.trim() ?? '';
        const remainingBody = plainHeadingParts.slice(1).join('\n\n').trim();
        const hasStructuredTags = /<TS\d*>|<WG\d+>|<WH\d+>|<S\d+>|<S>\d+<\/S>|<RF|<RX|<CM>|<FI>|<FR>|<FO>|<FU>/i.test(candidateHeading);
        if (candidateHeading && !hasStructuredTags && remainingBody.length > 0) {
          fallbackHeading = candidateHeading;
          workingText = remainingBody;
        }
      }
    }

    workingText = workingText.replace(new RegExp(`^\\s*${verseNumber}\\s*[.:)\\-]+\\s*`), '');
    const parsedHtml = MySwordParser.parseBibleText(workingText, settings, book.numericId >= 40);
    const titleRegex = /<span class="bible-title[^"]*">.*?<\/span>/gi;
    let headings = parsedHtml.match(titleRegex) ?? [];
    let body = parsedHtml.replace(titleRegex, '').trim();

    const fallbackHeadingHtml = fallbackHeading ? `<span class="bible-title bible-title-1">${fallbackHeading}</span>` : '';
    return {
      headingsHtml: `${fallbackHeadingHtml}${headings.join('')}`,
      bodyHtml: body,
      parsedHtml
    };
  }, [settings, book.numericId]);

  const processedVerses = useMemo(() => {
    if (!verses || verses.length === 0) return [];
    return verses.map((v) => {
      const { headingsHtml, bodyHtml, parsedHtml } = splitVerseHtml(v.text, v.verse, v.isChapterHeader);
      return { verse: v, headingsHtml, bodyHtml, parsedHtml };
    });
  }, [verses, splitVerseHtml]);

  const handleLinkClickOrig = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        if (href.startsWith('b')) {
          const match = href.match(/b(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const [_, bNum, c, v] = match;
            const targetBook = BIBLE_BOOKS.find(book => book.numericId === parseInt(bNum));
            if (targetBook && onNavigate) onNavigate(targetBook.id, parseInt(c), parseInt(v));
          }
        } else if (href.startsWith('s')) {
          const term = href.substring(1);
          if (/^[HG]\d+/i.test(term)) {
            setSelectedStrongs(term);
            setSelectedContext(`${book.name} ${chapter}`);
            setIsStrongsOpen(true);
          } else {
            setSelectedTerm(term);
            setSelectedContext(`${book.name} ${chapter}`);
            setIsDictionaryOpen(true);
          }
        }
      }
    }
  }, [book.name, chapter, onNavigate]);

  return (
    <div
      key={`${book.id}-${chapter}`}
      ref={containerRef}
      onClick={handleLinkClickOrig}
      className={cn(
        "h-full overflow-y-auto",
        settings.navigation.horizontalScroll && "flex overflow-x-auto snap-x snap-mandatory"
      )}
      style={{
        backgroundColor: 'var(--bg-bible)',
        color: 'var(--text-bible)',
        letterSpacing: `${config.letterSpacing}em`,
        paddingLeft: !settings.navigation.horizontalScroll ? `clamp(16px, 6vw, ${config.horizontalMargin}px)` : undefined,
        paddingRight: !settings.navigation.horizontalScroll ? `clamp(16px, 6vw, ${config.horizontalMargin}px)` : undefined,
      }}
    >
        <div 
          className={cn("max-w-4xl mx-auto pb-36", settings.navigation.horizontalScroll && "min-w-full flex-shrink-0 snap-center")}
          role="region" 
          aria-label={`Leitura de ${book.name} capítulo ${chapter}`}
          aria-live="polite"
          aria-atomic="false"
        >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24" role="status" aria-live="polite" aria-atomic="true">
            <div className="w-16 h-16 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
            <p className="text-sm text-bible-text-muted mt-4 font-medium">Carregando capítulo...</p>
          </div>
        ) : (
          <motion.div
            initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            className={cn(settings.textDisplay.paragraphMode ? "flex flex-wrap items-baseline gap-x-1.5" : "flex flex-col space-y-2")}
            style={{ fontSize: `${config.fontSize}px`, lineHeight: config.lineHeight, fontFamily: 'var(--font-bible-family)' }}
          >
            {processedVerses.map(({ verse: v, headingsHtml, bodyHtml }) => {
              const bookmark = bookmarkMap[v.verse];
              const showHighlight = settings.visualResources.highlights && !!bookmark;
              const isChapterHeader = v.isChapterHeader || v.verse === 0;
              const chapterHeaderHtml = headingsHtml || `<span class="bible-title bible-title-1">${bodyHtml}</span>`;
              const hasHeadingBlock = Boolean(headingsHtml) || isChapterHeader;

              return (
                <VerseItem
                  key={`verse-${book.id}-${chapter}-${v.verse}`}
                  v={v}
                  headingsHtml={headingsHtml}
                  bodyHtml={bodyHtml}
                  bookmark={bookmark}
                  showHighlight={showHighlight}
                  isChapterHeader={isChapterHeader}
                  chapterHeaderHtml={chapterHeaderHtml}
                  hasHeadingBlock={hasHeadingBlock}
                  selectedVerses={selectedVerses}
                  currentHighlightedVerse={currentHighlightedVerse || navHighlight}
                  settings={settings}
                  allTags={allTags}
                  toggleVerseSelection={toggleVerseSelection}
                  onToolOpen={handleToolOpen}
                  handleRemoveTag={handleRemoveTag}
                  onShare={(v) => onShare([{ verse: v.verse, text: v.text }], `${book.name} ${chapter}:${v.verse}`)}
                  verseRef={(el) => { verseRefs.current[v.verse] = el; }}
                />
              );
            })}
          </motion.div>
        )}

        {!loading && verses.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-bible)]/50">
            <button
              onClick={() => onNavigate?.(book.id, Math.max(1, chapter - 1), 1)}
              disabled={chapter <= 1}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                'text-[var(--text-bible)] hover:bg-[var(--surface-1)]',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <span className="text-sm font-semibold text-[var(--text-bible-muted)]">
              {book.name} {chapter}
            </span>

            <button
              onClick={() => onNavigate?.(book.id, Math.min(book.chapters, chapter + 1), 1)}
              disabled={chapter >= book.chapters}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                'text-[var(--text-bible)] hover:bg-[var(--surface-1)]',
                'disabled:opacity-30 disabled:cursor-not-allowed'
              )}
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-8 z-[100] w-[min(calc(100vw-2rem),40rem)]"
          >
            <div className="bg-bible-surface/95 backdrop-blur-2xl p-3 shadow-2xl rounded-[2.5rem] border border-bible-border/50">
              {/* Header Info */}
              <div className="px-4 py-2 flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-bible-accent/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-bible-accent" />
                  </div>
                  <div>
                    <div className="text-[10px] text-bible-text-muted font-bold uppercase tracking-widest">Selecionados</div>
                    <div className="text-sm font-extrabold text-bible-text leading-tight">{selectedReference}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedVerses(verses.map(v => v.verse).filter(n => n > 0))}
                    className="px-2 py-1 text-[10px] font-bold text-bible-accent hover:bg-bible-accent/10 rounded-lg transition-colors uppercase tracking-tight"
                  >
                    Tudo
                  </button>
                  <button 
                    onClick={() => setSelectedVerses([])}
                    className="p-2 hover:bg-bible-surface-strong rounded-full transition-colors text-bible-text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-around gap-1 p-1 bg-bible-surface/50 rounded-2xl border border-bible-border/30">
                <ActionButton 
                  icon={Highlighter} 
                  label="Marcar" 
                  onClick={() => setShowColorPicker(!showColorPicker)} 
                  active={showColorPicker}
                />
                <ActionButton 
                  icon={Copy} 
                  label="Copiar" 
                  onClick={handleCopySelected} 
                />
                <ActionButton 
                  icon={Sparkles} 
                  label="Codex" 
                  onClick={handleStudy} 
                  highlight
                />
                <ActionButton 
                  icon={Share2} 
                  label="Enviar" 
                  onClick={() => onShare(selectedVerseData.map(v => ({ verse: v.verse, text: stripTags(v.text) })), selectedReference)} 
                />
                <ActionButton 
                  icon={Tag} 
                  label="Etiquetas" 
                  onClick={() => setShowTagEditor(!showTagEditor)} 
                  active={showTagEditor}
                />
                {isTTSSupported && (
                  <ActionButton 
                    icon={Volume2} 
                    label="Ouvir" 
                    onClick={() => toggleTTS(selectedVerses)}
                    active={isSpeakingTTS}
                  />
                )}
                <ActionButton 
                  icon={Trash2} 
                  label="Limpar" 
                  onClick={handleDeleteBookmarks} 
                  danger
                />
              </div>

              {/* Expanded Pickers */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 px-2 pb-2">
                      <div className="flex flex-wrap justify-center gap-2.5 p-3 rounded-2xl bg-bible-surface/30 border border-bible-border/20">
                        {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff', '#fed7aa', '#99f6e4', '#e2e8f0'].map(c => (
                          <motion.button 
                            key={c} 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleBookmark(c)} 
                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm transition-transform" 
                            style={{ backgroundColor: c }} 
                          />
                        ))}
                        <div className="w-px h-8 bg-bible-border/30 mx-1" />
                        <label className="w-9 h-9 rounded-full border-2 border-dashed border-bible-border flex items-center justify-center cursor-pointer hover:bg-bible-surface transition-colors relative">
                          <Plus className="w-4 h-4 text-bible-text-muted" />
                          <input 
                            type="color" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleBookmark(e.target.value)}
                          />
                        </label>
                        <button 
                          onClick={() => handleBookmark(null)} 
                          className="w-9 h-9 rounded-full border-2 border-bible-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                        >
                          <X className="w-4 h-4 text-bible-text-muted group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showTagEditor && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 px-2 pb-2">
                      <div className="p-3 rounded-2xl bg-bible-surface/30 border border-bible-border/20 space-y-3">
                        <input 
                          type="text" 
                          value={currentTags} 
                          onChange={(e) => setCurrentTags(e.target.value)} 
                          placeholder="Digite etiquetas separadas por vírgula..." 
                          className="w-full h-11 px-4 rounded-xl border border-bible-border bg-bible-surface text-sm focus:ring-2 focus:ring-bible-accent outline-none placeholder:text-bible-text-muted/50" 
                        />
                        <button 
                          onClick={handleSaveTags} 
                          className="w-full h-11 bg-bible-accent text-white text-sm font-bold rounded-xl shadow-lg shadow-bible-accent/20 active:scale-[0.98] transition-transform"
                        >
                          Salvar Etiquetas
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DictionaryBottomSheet term={selectedTerm} context={selectedContext} isOpen={isDictionaryOpen} onClose={() => setIsDictionaryOpen(false)} />
      <StrongsBottomSheet strongsNumber={selectedStrongs} context={selectedContext} isOpen={isStrongsOpen} onClose={() => setIsStrongsOpen(false)} />
      <CommentaryBottomSheet 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        bookId={selectedCommentaryVerse?.bookId || ''}
        chapter={selectedCommentaryVerse?.chapter || 0}
        verse={selectedCommentaryVerse?.verse || 0}
      />
      <CrossReferencesBottomSheet
        isOpen={isXrefsOpen}
        onClose={() => setIsXrefsOpen(false)}
        bookId={selectedCommentaryVerse?.bookId || ''}
        chapter={selectedCommentaryVerse?.chapter || 0}
        verse={selectedCommentaryVerse?.verse || 0}
        onNavigate={onNavigate}
      />

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type || 'success'} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
});
