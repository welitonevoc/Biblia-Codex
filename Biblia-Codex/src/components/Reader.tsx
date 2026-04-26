import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Verse, Book, Bookmark as BookmarkType, Tag as TagType } from '../types';
import { BibleService } from '../BibleService';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';
import { storage } from '../StorageService';
import { MySwordParser } from '../services/mySwordParser';
import { motion, AnimatePresence } from 'motion/react';
import DOMPurify from 'dompurify';
import {
  Bookmark, Share2, MessageSquare,
  Sparkles, Library, Layers, X, BookOpen, Volume2, Trash2, Tag
} from 'lucide-react';
import { cn } from '../utils/cn';
import { DictionaryBottomSheet } from './DictionaryBottomSheet';
import { useReaderSelection } from '../hooks/useReaderSelection';
import { useReaderTTS } from '../hooks/useReaderTTS';

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
  return (
    <div
      ref={verseRef}
      className={cn(
        "group relative",
        hasHeadingBlock && "basis-full w-full",
        !settings.textDisplay.paragraphMode && "block w-full"
      )}
    >
      {isChapterHeader ? (
        <div
          className={cn(
            "w-full basis-full",
            settings.textDisplay.paragraphMode ? "mb-2" : "mb-4"
          )}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapterHeaderHtml) }}
        />
      ) : (
        <>
          {headingsHtml && (
            <div
              className={cn(
                "w-full",
                settings.textDisplay.paragraphMode ? "mb-2 basis-full" : "mb-3"
              )}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(headingsHtml) }}
            />
          )}
          <span
            id={`verse-${v.verse}`}
            onClick={() => toggleVerseSelection(v.verse)}
            className={cn(
              "relative inline transition-all duration-200 cursor-pointer rounded-xl px-1.5 -mx-1.5",
              selectedVerses.includes(v.verse) ? "bg-bible-accent/20 shadow-[0_0_0_2px_rgba(var(--accent-bible-rgb),0.12)]" : "hover:bg-bible-accent/7",
              currentHighlightedVerse === v.verse && "bg-yellow-400/40 ring-2 ring-yellow-400/50",
              showHighlight && !settings.visualResources.gradientHighlight && `border-b-2`,
              showHighlight && settings.visualResources.gradientHighlight && "bg-gradient-to-r from-transparent via-bible-accent/10 to-transparent"
            )}
            style={showHighlight && bookmark ? {
              backgroundColor: `${bookmark.color}4D`,
              borderBottom: settings.visualResources.gradientHighlight ? 'none' : `2px solid ${bookmark.color}`
            } : {}}
          >
            {settings.textDisplay.verseNumbers && (
              <sup className="text-[0.6em] font-bold mr-1 opacity-50 select-none">
                {v.verse}
              </sup>
            )}
            <span
              className={cn(
                settings.textDisplay.wordsOfJesusRed && v.text.includes("Jesus") && "words-of-jesus"
              )}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bodyHtml) }}
            />

            {bookmark && bookmark.tags && bookmark.tags.length > 0 && (
              <span className="ml-2 inline-flex gap-1 align-middle">
                {bookmark.tags.map(tId => {
                  const tag = allTags.find(t => t.id === tId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tId}
                      className="group/tag text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter relative"
                      style={{ backgroundColor: tag.background, color: tag.textColor }}
                    >
                      {tag.name}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveTag(bookmark.id, tId); }}
                        className="hidden group-hover/tag:inline-flex items-center justify-center ml-0.5 -mr-0.5 w-3 h-3 rounded-full hover:bg-black/10 align-middle"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </span>
            )}
          </span>

          <div className={cn(
            "inline-flex items-center ml-3 space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 bg-bible-accent/7 backdrop-blur-sm rounded-full px-2 py-1 border border-bible-accent/10",
            !settings.textDisplay.paragraphMode && "absolute right-0 top-0 mt-1"
          )}>
            {settings.modules.commentary && (
              <button onClick={() => onToolOpen(v, 'commentary')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Comentário">
                <MessageSquare className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
              </button>
            )}
            {settings.modules.dictionary && (
              <button onClick={() => onToolOpen(v, 'dictionary')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Dicionário">
                <Library className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
              </button>
            )}
            {settings.modules.xrefs && settings.visualResources.crossRefs && (
              <button onClick={() => onToolOpen(v, 'xrefs')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Ref. Cruzadas">
                <Layers className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
              </button>
            )}
            <button onClick={() => onToolOpen(v, 'people')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Pessoas">
              <span className="w-3.5 h-3.5 flex items-center justify-center text-bible-accent opacity-60 group-hover/tool:opacity-100">👥</span>
            </button>
            <button onClick={() => onToolOpen(v, 'places')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Lugares">
              <span className="w-3.5 h-3.5 flex items-center justify-center text-bible-accent opacity-60 group-hover/tool:opacity-100">📍</span>
            </button>
            {settings.textDisplay.footnotes && (
              <button onClick={() => onToolOpen(v, 'footnotes')} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Notas de Rodapé">
                <span className="w-3.5 h-3.5 flex items-center justify-center text-bible-accent opacity-60 group-hover/tool:opacity-100">📝</span>
              </button>
            )}
            <button onClick={() => onShare(v)} className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool" title="Compartilhar">
              <Share2 className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
            </button>
          </div>
        </>
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
  onShare
}) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const { config, settings, currentVersion } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

      if (containerRef.current && !targetVerse) {
        containerRef.current.scrollTop = 0;
      }
    };
    fetchVerses();
    return () => { cancelled = true; };
  }, [book.id, chapter, currentVersion?.id, settings.textDisplay]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!loading && targetVerse && verseRefs.current[targetVerse]) {
      verseRefs.current[targetVerse]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedVerses([targetVerse]);
      if (onTargetVerseReached) onTargetVerseReached();
    }
  }, [loading, targetVerse, onTargetVerseReached, setSelectedVerses]);

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

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
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
          setSelectedTerm(term);
          setSelectedContext(`${book.name} ${chapter}`);
          setIsDictionaryOpen(true);
        }
      }
    }
  }, [book.name, chapter, onNavigate]);

  return (
    <div
      ref={containerRef}
      onClick={handleLinkClick}
      className={cn(
        "h-full overflow-y-auto scroll-smooth",
        settings.navigation.horizontalScroll && "flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
      )}
      style={{
        backgroundColor: 'var(--bg-bible)',
        color: 'var(--text-bible)',
        letterSpacing: `${config.letterSpacing}em`,
        paddingLeft: !settings.navigation.horizontalScroll ? `${config.horizontalMargin}px` : undefined,
        paddingRight: !settings.navigation.horizontalScroll ? `${config.horizontalMargin}px` : undefined,
      }}
    >
      <div className={cn("max-w-4xl mx-auto", settings.navigation.horizontalScroll && "min-w-full flex-shrink-0 snap-center")}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
            <p className="text-sm text-bible-text-muted mt-4 font-medium">Carregando capítulo...</p>
          </div>
        ) : (
          <motion.div
            initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            className={cn("space-y-4", settings.textDisplay.paragraphMode ? "flex flex-wrap items-baseline gap-x-1.5" : "flex flex-col")}
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
                  currentHighlightedVerse={currentHighlightedVerse}
                  settings={settings}
                  allTags={allTags}
                  toggleVerseSelection={toggleVerseSelection}
                  onToolOpen={onToolOpen}
                  handleRemoveTag={handleRemoveTag}
                  onShare={(v) => onShare([{ verse: v.verse, text: v.text }], `${book.name} ${chapter}:${v.verse}`)}
                  verseRef={(el) => { verseRefs.current[v.verse] = el; }}
                />
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedVerses([])} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed left-1/2 z-50 w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 bottom-8">
              <div className="glass-panel px-3 py-3 shadow-2xl sm:px-6 sm:py-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-bible-border/50">
                  <span className="text-xs font-bold text-bible-text">{selectedVerses.length} versículos selecionados</span>
                  <button onClick={() => setSelectedVerses([])} className="p-1 hover:bg-bible-surface rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex flex-col items-center gap-1.5"><div className="h-10 w-10 flex items-center justify-center rounded-xl bg-bible-accent/10"><Bookmark className="h-5 w-5 text-bible-accent" /></div><span className="text-[8px] font-bold uppercase">Marcador</span></button>
                  <button onClick={() => setShowTagEditor(!showTagEditor)} className="flex flex-col items-center gap-1.5"><div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10"><Tag className="h-5 w-5 text-blue-500" /></div><span className="text-[8px] font-bold uppercase">Etiquetas</span></button>
                  <button onClick={handleStudy} className="flex flex-col items-center gap-1.5"><div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10"><Sparkles className="h-5 w-5 text-purple-500" /></div><span className="text-[8px] font-bold uppercase">Estudar</span></button>
                  {isTTSSupported && (
                    <button onClick={() => toggleTTS(selectedVerses)} className="flex flex-col items-center gap-1.5"><div className={cn("h-10 w-10 flex items-center justify-center rounded-xl transition-colors", isSpeakingTTS ? "bg-orange-500/20" : "bg-orange-500/10")}><Volume2 className={cn("h-5 w-5 text-orange-500", isSpeakingTTS && "animate-pulse")} /></div><span className="text-[8px] font-bold uppercase">{isSpeakingTTS ? 'Parar' : 'Ouvir'}</span></button>
                  )}
                  <button onClick={handleDeleteBookmarks} className="flex flex-col items-center gap-1.5"><div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10"><Trash2 className="h-5 w-5 text-red-500" /></div><span className="text-[8px] font-bold uppercase">Remover</span></button>
                </div>
                {showColorPicker && (
                  <div className="flex justify-center gap-2 mt-4 p-2 glass-panel">
                    {['#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fbcfe8'].map(c => (
                      <button key={c} onClick={() => handleBookmark(c)} className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c }} />
                    ))}
                    <button onClick={() => handleBookmark(null)} className="w-8 h-8 rounded-full border-2 border-bible-border flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </div>
                )}
                {showTagEditor && (
                  <div className="mt-4 p-2">
                    <input type="text" value={currentTags} onChange={(e) => setCurrentTags(e.target.value)} placeholder="Etiquetas..." className="w-full p-2 rounded-lg border border-bible-border bg-bible-surface text-xs focus:ring-2 focus:ring-bible-accent outline-none" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSaveTags} className="flex-1 p-2 bg-bible-accent text-white text-xs font-bold rounded-lg">Salvar</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DictionaryBottomSheet term={selectedTerm} context={selectedContext} isOpen={isDictionaryOpen} onClose={() => setIsDictionaryOpen(false)} />
    </div>
  );
});
