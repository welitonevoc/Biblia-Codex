import React, { useState, useEffect, useRef } from 'react';
import { Verse, Book, Bookmark as BookmarkType, Tag as TagType } from '../types';
import { BibleService } from '../BibleService';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';
import { storage } from '../StorageService';
import { MySwordParser } from '../services/mySwordParser';
import { TagService } from '../services/TagService';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark, Highlighter, Share2, Info, MessageSquare,
  Sparkles, Library, Layers, ChevronRight, ChevronLeft, Plus,
  Check, X, Palette, Tag, Trash2, BookOpen, ChevronDown
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DictionaryBottomSheet } from './DictionaryBottomSheet';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReaderProps {
  book: Book;
  chapter: number;
  targetVerse?: number;
  onTargetVerseReached?: () => void;
  onVerseSelect?: (verse: Verse) => void;
  onNavigate?: (bookId: string, chapter: number, verse?: number) => void;
  onStudyOpen: (selectedVerses: { verse: number, text: string }[]) => void;
  onToolOpen: (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places') => void;
}

export const Reader: React.FC<ReaderProps> = ({
  book,
  chapter,
  targetVerse,
  onTargetVerseReached,
  onVerseSelect,
  onNavigate,
  onStudyOpen,
  onToolOpen
}) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(book.id);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [currentTags, setCurrentTags] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const { config, settings, currentVersion } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const colors = [
    { id: 'yellow', hex: '#fef08a', name: 'Amarelo' },
    { id: 'green', hex: '#bbf7d0', name: 'Verde' },
    { id: 'blue', hex: '#bfdbfe', name: 'Azul' },
    { id: 'purple', hex: '#e9d5ff', name: 'Roxo' },
    { id: 'pink', hex: '#fbcfe8', name: 'Rosa' },
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchVerses = async () => {
      setLoading(true);
      try {
        const data = await BibleService.getVerses(book.id, chapter, currentVersion || undefined, settings);
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
  }, [
    book.id,
    chapter,
    currentVersion?.id
  ]);


  useEffect(() => {
    if (!loading && targetVerse && verseRefs.current[targetVerse]) {
      verseRefs.current[targetVerse]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedVerses([targetVerse]);
      if (onTargetVerseReached) onTargetVerseReached();
    }
  }, [loading, targetVerse]);

  useEffect(() => {
    setSelectedBookId(book.id);
  }, [book.id, chapter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showBookSelector || showChapterSelector) {
        const target = e.target as HTMLElement;
        if (!target.closest('.book-selector') && !target.closest('.chapter-selector')) {
          setShowBookSelector(false);
          setShowChapterSelector(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showBookSelector, showChapterSelector]);

  const handleChapterSelect = (chapter: number) => {
    if (onNavigate) {
      onNavigate(book.id, chapter);
    }
  };

  const handleBookChange = (newBookId: string) => {
    const newBook = BIBLE_BOOKS.find(b => b.id === newBookId);
    if (newBook && onNavigate) {
      onNavigate(newBook.id, 1);
    }
  };

  const handleVerseClick = (verseNum: number) => {
    if (onVerseSelect && verses[verseNum - 1]) {
      onVerseSelect(verses[verseNum - 1]);
    }
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum)
        ? prev.filter(v => v !== verseNum)
        : [...prev, verseNum]
    );
  };

  const handleStudy = () => {
    const selected = verses
      .filter(v => selectedVerses.includes(v.verse))
      .map(v => ({ verse: v.verse, text: v.text }));
    onStudyOpen(selected);
  };

  const handleBookmark = async (color: string | null) => {
    if (selectedVerses.length === 0) return;

    const updatedBookmarks: BookmarkType[] = [];
    const newBookmarks: BookmarkType[] = [];

    for (const vNum of selectedVerses) {
      const existing = bookmarks.find(b => b.bookId === book.id && b.chapter === chapter && b.verse === vNum);
      const verse = verses.find(v => v.verse === vNum);

      if (existing) {
        // Update existing bookmark color
        const updated = { ...existing, color: color || undefined };
        await storage.saveBookmark(updated);
        updatedBookmarks.push(updated);
      } else if (color) {
        // Create new bookmark only if color is provided
        const newItem: BookmarkType = {
          id: `${book.id}-${chapter}-${vNum}-${Date.now()}`,
          bookId: book.id,
          chapter,
          verse: vNum,
          text: verse?.text || '',
          color,
          tags: [],
          createdAt: Date.now()
        };
        await storage.saveBookmark(newItem);
        newBookmarks.push(newItem);
      }
    }

    setBookmarks(prev => {
      const filtered = prev.filter(b =>
        !updatedBookmarks.some(ub => ub.id === b.id)
      );
      return [...filtered, ...updatedBookmarks, ...newBookmarks];
    });

    setSelectedVerses([]);
    setShowColorPicker(false);
  };

  const handleDeleteBookmarks = async () => {
    if (selectedVerses.length === 0) return;
    for (const vNum of selectedVerses) {
      const existing = bookmarks.find(b => b.bookId === book.id && b.chapter === chapter && b.verse === vNum);
      if (existing) {
        await storage.deleteBookmark(existing.id);
      }
    }
    setBookmarks(prev => prev.filter(b => {
      if (b.bookId !== book.id || b.chapter !== chapter) return true;
      return !selectedVerses.includes(b.verse);
    }));
    setSelectedVerses([]);
  };

  const handleRemoveTag = async (bookmarkId: string, tagId: string) => {
    const bm = bookmarks.find(b => b.id === bookmarkId);
    if (!bm) return;
    const updated = { ...bm, tags: bm.tags.filter(t => t !== tagId) };
    await storage.saveBookmark(updated);
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? updated : b));
  };

  const handleSaveTags = async () => {
    if (selectedVerses.length === 0) return;

    const tagNames = currentTags.split(',').map(t => t.trim()).filter(t => t !== '');
    const tagIds: string[] = [];

    // Create or get tags
    for (const name of tagNames) {
      const tag = await TagService.createTag(name);
      tagIds.push(tag.id);
    }

    const updatedBookmarks: BookmarkType[] = [];
    const newBookmarks: BookmarkType[] = [];

    for (const vNum of selectedVerses) {
      const verse = verses.find(v => v.verse === vNum);
      const existing = bookmarks.find(b => b.bookId === book.id && b.chapter === chapter && b.verse === vNum);

      if (existing) {
        const updated = { ...existing, tags: Array.from(new Set([...existing.tags, ...tagIds])) };
        await storage.saveBookmark(updated);
        updatedBookmarks.push(updated);
      } else {
        // Create new bookmark for tags
        const newItem: BookmarkType = {
          id: `${book.id}-${chapter}-${vNum}-${Date.now()}`,
          bookId: book.id,
          chapter,
          verse: vNum,
          text: verse?.text || '',
          tags: tagIds,
          createdAt: Date.now()
        };
        await storage.saveBookmark(newItem);
        newBookmarks.push(newItem);
      }
    }

    setBookmarks(prev => {
      const filtered = prev.filter(b => !updatedBookmarks.some(ub => ub.id === b.id));
      return [...filtered, ...updatedBookmarks, ...newBookmarks];
    });

    // Update tags state
    const freshTags = await storage.getTags();
    setAllTags(freshTags);

    setCurrentTags('');
    setShowTagEditor(false);
    setSelectedVerses([]);
  };

  const isBookmarked = (verseNum: number) => {
    return bookmarks.find(b => b.bookId === book.id && b.chapter === chapter && b.verse === verseNum);
  };

  const splitVerseHtml = (text: string, verseNumber: number, isChapterHeader?: boolean) => {
    const normalizedText = text.replace(/\r\n?/g, '\n').trim();
    let workingText = normalizedText;
    let fallbackHeading = '';

    if (!isChapterHeader) {
      const plainHeadingParts = workingText.split(/\n\s*\n+/);
      if (plainHeadingParts.length > 1) {
        const candidateHeading = plainHeadingParts[0]?.trim() ?? '';
        const remainingBody = plainHeadingParts.slice(1).join('\n\n').trim();
        const hasStructuredTags = /<TS\d*>|<WG\d+>|<WH\d+>|<S\d+>|<S>\d+<\/S>|<RF|<RX|<CM>|<FI>|<FR>|<FO>|<FU>/i.test(candidateHeading);
        const bodyLooksLikeVerse = remainingBody.length > 0;

        if (candidateHeading && !hasStructuredTags && bodyLooksLikeVerse) {
          fallbackHeading = candidateHeading;
          workingText = remainingBody;
        }
      }
    }

    if (!isChapterHeader && !fallbackHeading && verseNumber > 0) {
      const inlineTitleMatch = workingText.match(
        new RegExp(`^([\\s\\S]{5,220}?)\\s*(?:<CM>|\\n\\s*\\n+)?\\s*${verseNumber}\\s*[.:)\\-]+\\s*([\\s\\S]+)$`, 'i')
      );

      if (inlineTitleMatch) {
        const candidateHeading = inlineTitleMatch[1].trim();
        const candidateBody = inlineTitleMatch[2].trim();
        const hasStructuredContent = /<WG\d+>|<WH\d+>|<S\d+>|<S>\d+<\/S>|<RF|<RX|<FI>|<FR>|<FO>|<FU>|<Q>|<E>|<T>|<X>|<H>|<G>/i.test(candidateHeading);
        const headingWordCount = candidateHeading.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

        if (candidateHeading && candidateBody && !hasStructuredContent && headingWordCount >= 4) {
          fallbackHeading = candidateHeading.replace(/<CM>$/i, '').trim();
          workingText = candidateBody;
        }
      }
    }

    workingText = workingText.replace(
      new RegExp(`^\\s*${verseNumber}\\s*[.:)\\-]+\\s*`),
      ''
    );

    const parsedHtml = MySwordParser.parseBibleText(workingText, settings, book.numericId >= 40);
    const titleRegex = /<span class="bible-title[^"]*">.*?<\/span>/gi;
    let headings = parsedHtml.match(titleRegex) ?? [];
    let body = parsedHtml.replace(titleRegex, '').trim();

    if (!headings.length && !isChapterHeader) {
      const htmlBreakMatch = body.match(/^([\s\S]{5,260}?)((?:<br\s*\/?>\s*){2,})([\s\S]+)$/i);
      if (htmlBreakMatch) {
        const candidateHeading = htmlBreakMatch[1].replace(/<[^>]+>/g, ' ').trim();
        const candidateBody = htmlBreakMatch[3].trim();
        const headingWordCount = candidateHeading.split(/\s+/).filter(Boolean).length;

        if (candidateHeading && candidateBody && headingWordCount >= 4) {
          fallbackHeading = fallbackHeading || candidateHeading;
          body = candidateBody.replace(
            new RegExp(`^\\s*${verseNumber}\\s*[.:)\\-]+\\s*`),
            ''
          ).trim();
        }
      }
    }

    const fallbackHeadingHtml = fallbackHeading
      ? `<span class="bible-title bible-title-1">${fallbackHeading}</span>`
      : '';

    return {
      headingsHtml: `${fallbackHeadingHtml}${headings.join('')}`,
      bodyHtml: body,
      parsedHtml
    };
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        // Handle MySword links
        if (href.startsWith('b')) {
          // Bible link: b43.3.16
          const match = href.match(/b(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const [_, bNum, c, v] = match;
            const targetBook = BIBLE_BOOKS.find(book => book.numericId === parseInt(bNum));
            if (targetBook && onNavigate) {
              onNavigate(targetBook.id, parseInt(c), parseInt(v));
            }
          }
        } else if (href.startsWith('s')) {
          // Strong's link: sG5485 or sH2617
          const term = href.substring(1);
          setSelectedTerm(term);
          setSelectedContext(`${book.name} ${chapter}`);
          setIsDictionaryOpen(true);
        } else if (href.startsWith('r')) {
          // Popup note: rNote text
          alert(href.substring(1));
        }
      }
    }
  };

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
      <div className={cn(
        "max-w-4xl mx-auto",
        settings.navigation.horizontalScroll && "min-w-full flex-shrink-0 snap-center"
      )}
        style={settings.navigation.horizontalScroll ? {
          paddingLeft: `${config.horizontalMargin}px`,
          paddingRight: `${config.horizontalMargin}px`,
        } : {}}
      >
        {settings.textDisplay.chapterTitles && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="h-2"
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-16 h-16 border-4 border-bible-accent/20 border-t-bible-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-bible-accent animate-pulse" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-bible-text-muted mt-4 font-medium"
            >
              Carregando capítulo...
            </motion.p>
          </div>
        ) : (
          <motion.div
            initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
            animate={{ opacity: 1 }}
            className={cn(
              "space-y-4",
              settings.textDisplay.paragraphMode ? "flex flex-wrap items-baseline gap-x-1.5" : "flex flex-col"
            )}
            style={{
              fontSize: `${config.fontSize}px`,
              lineHeight: config.lineHeight,
              fontFamily: 'var(--font-bible-family)'
            }}
          >
            {verses.map((v) => {
              const bookmark = isBookmarked(v.verse);
              const showHighlight = settings.visualResources.highlights && bookmark;
              const { headingsHtml, bodyHtml, parsedHtml } = splitVerseHtml(v.text, v.verse, v.isChapterHeader);
              const isChapterHeader = v.isChapterHeader || v.verse === 0;
              const chapterHeaderHtml = headingsHtml || `<span class="bible-title bible-title-1">${bodyHtml || parsedHtml}</span>`;
              const hasHeadingBlock = Boolean(headingsHtml) || isChapterHeader;

              return (
                <div
                  key={`${v.verse}-${v.text.slice(0, 40)}`}
                  ref={(el) => { verseRefs.current[v.verse] = el; }}
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
                      dangerouslySetInnerHTML={{ __html: chapterHeaderHtml }}
                    />
                  ) : (
                    <>
                      {headingsHtml && (
                        <div
                          className={cn(
                            "w-full",
                            settings.textDisplay.paragraphMode ? "mb-2 basis-full" : "mb-3"
                          )}
                          dangerouslySetInnerHTML={{ __html: headingsHtml }}
                        />
                      )}
                      <span
                        onClick={() => toggleVerseSelection(v.verse)}
                        className={cn(
                          "relative inline transition-all duration-200 cursor-pointer rounded-xl px-1.5 -mx-1.5",
                          selectedVerses.includes(v.verse) ? "bg-bible-accent/20 shadow-[0_0_0_2px_rgba(var(--accent-bible-rgb),0.12)]" : "hover:bg-bible-accent/7",
                          showHighlight && !settings.visualResources.gradientHighlight && `border-b-2`,
                          showHighlight && settings.visualResources.gradientHighlight && "bg-gradient-to-r from-transparent via-bible-accent/10 to-transparent"
                        )}
                        style={showHighlight ? {
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
                          dangerouslySetInnerHTML={{ __html: bodyHtml }}
                        />

                        {/* Tags Pills Inline */}
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

                      {/* Study Icons - Premium Inline Access */}
                      <div className={cn(
                        "inline-flex items-center ml-3 space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 bg-bible-accent/7 backdrop-blur-sm rounded-full px-2 py-1 border border-bible-accent/10",
                        !settings.textDisplay.paragraphMode && "absolute right-0 top-0 mt-1"
                      )}>
                        {settings.modules.commentary && (
                          <button
                            onClick={() => onToolOpen(v, 'commentary')}
                            className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool"
                            title="Comentário"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                          </button>
                        )}
                        {settings.modules.dictionary && (
                          <button
                            onClick={() => onToolOpen(v, 'dictionary')}
                            className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool"
                            title="Dicionário"
                          >
                            <Library className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                          </button>
                        )}
                        {settings.modules.xrefs && settings.visualResources.crossRefs && (
                          <button
                            onClick={() => onToolOpen(v, 'xrefs')}
                            className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool"
                            title="Ref. Cruzadas"
                          >
                            <Layers className="w-3.5 h-3.5 text-bible-accent opacity-60 group-hover/tool:opacity-100" />
                          </button>
                        )}
                        <button
                          onClick={() => onToolOpen(v, 'people')}
                          className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool"
                          title="Pessoas"
                        >
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-bible-accent opacity-60 group-hover/tool:opacity-100">👥</span>
                        </button>
                        <button
                          onClick={() => onToolOpen(v, 'places')}
                          className="p-1.5 hover:bg-bible-accent/20 rounded-full transition-colors group/tool"
                          title="Lugares"
                        >
                          <span className="w-3.5 h-3.5 flex items-center justify-center text-bible-accent opacity-60 group-hover/tool:opacity-100">📍</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Floating Action Menu for selected verses - Premium */}
      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedVerses([])}
            />

            {/* Menu Premium */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 z-50 -translate-x-1/2"
              style={{ bottom: 'calc(1rem + var(--sab))' }}
            >
              <div className="glass-panel px-6 py-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-bible-border/50">
                  <span className="text-xs font-bold text-bible-text">
                    {selectedVerses.length} {selectedVerses.length === 1 ? 'versículo selecionado' : 'versículos selecionados'}
                  </span>
                  <button
                    onClick={() => setSelectedVerses([])}
                    className="p-1 hover:bg-bible-surface rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-bible-text-muted" />
                  </button>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {/* Bookmark with Color */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-bible-accent/10 flex items-center justify-center group-hover:bg-bible-accent/20 transition-colors">
                        <Bookmark className="w-5 h-5 text-bible-accent" />
                      </div>
                      <span className="text-[9px] font-bold text-bible-text-muted uppercase tracking-wider">Marcador</span>
                    </motion.button>

                    {/* Color Picker Dropdown */}
                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass-panel p-3 shadow-xl"
                        >
                          <div className="text-[10px] font-bold text-bible-text-muted mb-2 text-center">Cor do Marcador</div>
                          <div className="flex gap-2">
                            {[
                              { id: 'yellow', hex: '#fef08a', name: 'Amarelo' },
                              { id: 'green', hex: '#bbf7d0', name: 'Verde' },
                              { id: 'blue', hex: '#bfdbfe', name: 'Azul' },
                              { id: 'purple', hex: '#e9d5ff', name: 'Roxo' },
                              { id: 'pink', hex: '#fbcfe8', name: 'Rosa' },
                            ].map(color => (
                              <motion.button
                                key={color.id}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleBookmark(color.hex)}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleBookmark(null)}
                              className="w-8 h-8 rounded-full border-2 border-bible-border bg-bible-surface flex items-center justify-center"
                              title="Remover"
                            >
                              <X className="w-4 h-4 text-bible-text-muted" />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tags */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTagEditor(!showTagEditor)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Tag className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[9px] font-bold text-bible-text-muted uppercase tracking-wider">Etiquetas</span>
                  </motion.button>

                  {/* Share */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      const selectedText = selectedVerses
                        .map(v => {
                          const verse = verses.find(vers => vers.verse === v);
                          return verse ? `${verse.verse}. ${verse.text}` : '';
                        })
                        .filter(Boolean)
                        .join('\n\n');

                      if (navigator.share) {
                        await navigator.share({
                          title: `${book.name} ${selectedVerses.join(', ')}`,
                          text: selectedText,
                        });
                      } else {
                        await navigator.clipboard.writeText(selectedText);
                        alert('Versículo(s) copiado(s)!');
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Share2 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-[9px] font-bold text-bible-text-muted uppercase tracking-wider">Compartilhar</span>
                  </motion.button>

                  {/* Study */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleStudy}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-[9px] font-bold text-bible-text-muted uppercase tracking-wider">Estudar</span>
                  </motion.button>

                  {/* Delete Bookmarks */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDeleteBookmarks}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-[9px] font-bold text-bible-text-muted uppercase tracking-wider">Remover</span>
                  </motion.button>
                </div>

                {/* Tag Editor Inline */}
                <AnimatePresence>
                  {showTagEditor && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-bible-border/50 mt-3 pt-3"
                    >
                      <div className="text-[10px] font-bold text-bible-text-muted mb-2">Adicionar Etiquetas</div>
                      <input
                        type="text"
                        value={currentTags}
                        onChange={(e) => setCurrentTags(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTags()}
                        placeholder="Separe por vírgulas..."
                        className="w-full px-3 py-2 rounded-lg border border-bible-border bg-bible-surface text-xs mb-2"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveTags}
                          className="flex-1 px-3 py-2 rounded-lg bg-bible-accent text-white text-xs font-bold"
                        >
                          Salvar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowTagEditor(false);
                            setCurrentTags('');
                          }}
                          className="px-3 py-2 rounded-lg bg-bible-surface text-bible-text text-xs font-bold"
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DictionaryBottomSheet
        term={selectedTerm}
        context={selectedContext}
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />
    </div>
  );
};
