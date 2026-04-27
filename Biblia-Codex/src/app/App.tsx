/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AppProvider, useAppContext } from './app-context';
// Componentes que são carregados imediatamente (não lazy)
import TopBar from '../features/navigation/TopBar';
import Reader from '../features/bible/Reader';
import ReaderWithAudio from '../features/bible/ReaderWithAudio';
import HamburgerMenu from '../features/navigation/HamburgerMenu';
import Navigation from '../features/bible/Navigation';
import Settings from '../features/settings/Settings';
import StudyPanel from '../features/study/StudyPanel';
import StudyToolsPanel from '../features/study/StudyToolsPanel';
import SearchView from '../features/search/SearchView';
import { AudioTrack } from '../../services/audioService';
import { getAudioTracksForChapter, hasAudioForChapter } from '../../data/audioData';
import { BIBLE_BOOKS } from '../../data/bibleMetadata';
import { Book, Verse } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Loader } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Onboarding } from '../features/onboarding/Onboarding';
import { PermissionScreen } from '../features/permissions/PermissionScreen';
import { ProfilePage } from '../features/settings/ProfilePage';
import { VerseCardGenerator } from '../components/common/verse-card-generator';

// Lazy loading for heavy pages (Phase 5: Performance)
const DevotionalPage = lazy(() => import('../features/devotional/DevotionalPage').then(m => ({ default: m.DevotionalPage })));
const MapsPage = lazy(() => import('../features/maps/MapsPage').then(m => ({ default: m.MapsPage })));
const XRefsPage = lazy(() => import('../features/study/XRefsPage').then(m => ({ default: m.XRefsPage })));
const EBDPage = lazy(() => import('../features/ebd/EBDPage').then(m => ({ default: m.EBDPage })));

// Additional lazy loading for performance optimization
const NotesPage = lazy(() => import('../features/notes/Notes').then(m => ({ default: m.Notes })));
const BookmarksPage = lazy(() => import('../features/bookmarks/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const ReadingPlansPage = lazy(() => import('../features/reading-plans/ReadingPlans').then(m => ({ default: m.ReadingPlans })));
const TagsPage = lazy(() => import('../features/tags/TagsView').then(m => ({ default: m.TagsView })));
const DictionaryViewPage = lazy(() => import('../features/study/DictionaryView').then(m => ({ default: m.DictionaryView })));
const ModuleManagementPage = lazy(() => import('../features/modules/ModuleManagement').then(m => ({ default: m.ModuleManagement })));
const HelpPage = lazy(() => import('../features/help/HelpPage').then(m => ({ default: m.HelpPage })));
const AISettingsPage = lazy(() => import('../features/settings/AISettingsPage').then(m => ({ default: m.AISettingsPage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SettingsDashboardPage = lazy(() => import('../features/settings/SettingsDashboard').then(m => ({ default: m.SettingsDashboard })));
const ProfilePage = lazy(() => import('../features/settings/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
import { ensureStoragePermission } from './services/permissionsService';
import { Capacitor } from '@capacitor/core';
import { FloatingDock } from './components/nav/FloatingDock';
import { AsymmetricThumbBar } from './components/nav/AsymmetricThumbBar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AppContent() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const {
    settings, activeTab, setActiveTab, config, availableVersions
  } = useAppContext();
  const [currentBook, setCurrentBook] = useState<Book>(BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(undefined);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [selectedVersesForStudy, setSelectedVersesForStudy] = useState<{ verse: number, text: string }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Verse Card Generator State
  const [shareData, setShareData] = useState<{ verses: { verse: number; text: string }[]; reference: string } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('codex-onboarded');
    if (!hasOnboarded) setShowOnboarding(true);
  }, []);

  // Verificar permissões após onboarding
  useEffect(() => {
    const checkPermissions = async () => {
      // Só verifica se não é primeira vez (já completou onboarding)
      const hasOnboarded = localStorage.getItem('codex-onboarded');
      const hasRequestedPermission = localStorage.getItem('permissionRequested');

      if (hasOnboarded && !hasRequestedPermission &&
        Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        // Primeira vez após onboarding: verificar permissões
        const hasPermission = await ensureStoragePermission();

        if (!hasPermission) {
          setShowPermissionRequest(true);
        }

        // Marcar que já solicitamos permissão
        localStorage.setItem('permissionRequested', 'true');
      }
    };

    // Esperar onboarding fechar antes de verificar
    if (!showOnboarding) {
      checkPermissions();
    }
  }, [showOnboarding]);

  // Study Tools State
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [toolVerse, setToolVerse] = useState<Verse | null>(null);
  const [toolType, setToolType] = useState<'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes'>('commentary');

  // Audio State
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [hasAudioSupport, setHasAudioSupport] = useState(false);
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text');

  // Permission State
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  const handleSelect = (book: Book, chapter: number, verse?: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setTargetVerse(verse);
    setActiveTab('bible');

    // Carregar áudios para o capítulo selecionado
    const tracks = getAudioTracksForChapter(book.id, chapter);
    setAudioTracks(tracks);
    setHasAudioSupport(tracks.length > 0);
  };

  const handleStudyOpen = (verses: { verse: number, text: string }[]) => {
    setSelectedVersesForStudy(verses);
    setIsStudyOpen(true);
  };

  const handleShare = (verses: { verse: number; text: string }[], reference: string) => {
    setShareData({ verses, reference });
    setIsShareOpen(true);
  };

  const handleToolOpen = (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes') => {
    setToolVerse(verse);
    setToolType(type);
    setIsToolOpen(true);
  };

  return (
    <div
      className="app-shell flex h-[100dvh] w-full overflow-hidden text-bible-text selection:bg-bible-accent/20"
      style={{ minHeight: '100svh' }}
      role="application"
      aria-label="Bíblia Codex - Aplicativo de estudo bíblico"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-bible-accent focus:text-white rounded"
      >
        Pular para conteúdo principal
      </a>

      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsHamburgerOpen(false);
        }}
      />

      <div className="app-frame flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar
          currentBook={currentBook}
          currentChapter={currentChapter}
          onNavOpen={() => setIsNavOpen(true)}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          onSearchOpen={() => setActiveTab('search')}
          onToggleSidebar={() => setIsHamburgerOpen(!isHamburgerOpen)}
          readingMode={readingMode}
          onReadingModeChange={setReadingMode}
          hasAudio={hasAudioSupport}
          onNavigate={(bookId, chapter) => {
            const book = BIBLE_BOOKS.find(b => b.id === bookId);
            if (book) handleSelect(book, chapter);
          }}
        />

        <main className={cn(
          "flex-1 overflow-auto",
          config.navigationStyle === 'asymmetric' && "pl-14 md:pl-16"
        )}>
          <AnimatePresence mode="wait">
{activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={settings.navigation.navAnimation ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  exit={settings.navigation.navAnimation ? { opacity: 0, y: -10 } : {}}
                  className="h-full w-full"
                >
                  <Home 
                    onNavigate={handleSelect} 
                    goToReadingPlans={() => setActiveTab('reading-plans')} 
                    goToDevocional={() => setActiveTab('devocional')}
                    goToAI={() => setActiveTab('ai-assistant')} 
                  />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={settings.navigation.navAnimation ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  exit={settings.navigation.navAnimation ? { opacity: 0, y: -10 } : {}}
                  className="h-full w-full"
                >
                  <ProfilePage />
                </motion.div>
              )}
            {activeTab === 'bible' && (
              <motion.div
                key="bible"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full w-full"
              >
                <ReaderWithAudio
                  book={currentBook}
                  chapter={currentChapter}
                  targetVerse={targetVerse}
                  onTargetVerseReached={() => setTargetVerse(undefined)}
                  onStudyOpen={handleStudyOpen}
                  onToolOpen={handleToolOpen}
                  onShare={handleShare}
                  onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }}
                  audioTracks={audioTracks}
                  hasAudioSupport={hasAudioSupport}
                  readingMode={readingMode}
                  onReadingModeChange={setReadingMode}
                />
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <NotesPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <SettingsDashboardPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'tts' && (
              <motion.div
                key="tts"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <HelpPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'dictionaries' && (
              <motion.div
                key="dictionaries"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <DictionaryViewPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'modules' && (
              <motion.div
                key="modules"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <ModuleManagementPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'tags' && (
              <motion.div
                key="tags"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <TagsPage />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'devocional' && (
              <motion.div
                key="devocional"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <DevotionalPage onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === String(bookId));
                    if (book) handleSelect(book, chapter, verse);
                  }} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'reading-plans' && (
              <motion.div
                key="reading-plans"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <ReadingPlansPage onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }} availableVersions={availableVersions.map(v => ({ id: v.id, name: v.name, abbreviation: v.abbreviation }))} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <BookmarksPage onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }} onBack={() => setActiveTab('home')} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <SearchView onNavigate={(bookId, chapter, verse) => {
                  setActiveTab('bible');
                  const book = BIBLE_BOOKS.find(b => b.id === bookId);
                  if (book) handleSelect(book, chapter, verse);
                }} />
              </motion.div>
            )}
            {activeTab === 'maps' && (
              <motion.div
                key="maps"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <MapsPage onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'xrefs' && (
              <motion.div
                key="xrefs"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <XRefsPage onNavigate={(bookId, chapter, verse) => {
                    const book = BIBLE_BOOKS.find(b => b.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }} />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'ebd' && (
              <motion.div
                key="ebd"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <EBDPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'ai-assistant' && (
              <motion.div
                key="ai-assistant"
                initial={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={settings.navigation.navAnimation ? { opacity: 0 } : {}}
                className="h-full"
              >
                <AISettingsPage />
              </motion.div>
            )}

            {!['home', 'bible', 'notes', 'settings', 'tts', 'support', 'dictionaries', 'tags', 'modules', 'sync', 'epub', 'reading-plans', 'commentaries', 'maps', 'xrefs', 'ai-assistant', 'bookmarks', 'devocional', 'search', 'ebd', 'profile'].includes(activeTab) && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="opacity-20 flex flex-col items-center space-y-4">
                  <BookOpen className="w-16 h-16" />
                  <h2 className="text-2xl font-display font-bold uppercase tracking-widest">Em Construção</h2>
                  <p className="ui-text max-w-xs">Esta funcionalidade estará disponível em breve para aprimorar seus estudos.</p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-bible-accent text-bible-bg px-8 py-3 rounded-2xl font-bold ui-text text-sm shadow-lg active:scale-95 transition-transform"
                >
                  Voltar ao Início
                </button>
              </div>
            )}
          </AnimatePresence>
        </main>

        {config.navigationStyle === 'floating' && (
          <FloatingDock
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'settings') setIsSettingsOpen(false);
            }}
          />
        )}

        {config.navigationStyle === 'asymmetric' && (
          <AsymmetricThumbBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'settings') setIsSettingsOpen(false);
            }}
          />
        )}
      </div>

      <Navigation
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelect={handleSelect}
        currentBook={currentBook}
        currentChapter={currentChapter}
      />

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <StudyPanel
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        selectedVerses={selectedVersesForStudy}
        bookName={currentBook.name}
        chapter={currentChapter}
      />

      {toolVerse && (
        <StudyToolsPanel
          isOpen={isToolOpen}
          onClose={() => setIsToolOpen(false)}
          verse={toolVerse}
          book={currentBook}
          type={toolType}
          onNavigate={(bookId, chapter, verse) => {
            const book = BIBLE_BOOKS.find(b => b.id === bookId);
            if (book) handleSelect(book, chapter, verse);
          }}
        />
      )}

      <VerseCardGenerator
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        verses={shareData?.verses || []}
        reference={shareData?.reference || ''}
      />

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding
            onComplete={() => {
              localStorage.setItem('codex-onboarded', 'true');
              setShowOnboarding(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Permission Request Overlay (para usuários que já completaram onboarding) */}
      <AnimatePresence>
        {showPermissionRequest && (
          <PermissionScreen
            onComplete={() => {
              setShowPermissionRequest(false);
            }}
            onSkip={() => {
              setShowPermissionRequest(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { ErrorBoundary } from '../components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
