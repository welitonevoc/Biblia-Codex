/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader } from 'lucide-react';
import { cn } from '../utils/cn';
import { Capacitor } from '@capacitor/core';

import { AppProvider, useAppContext } from './AppContext';
import { useReaderState, useAudioTracks, useUIState, useStudyPanel, useShare } from './hooks';
import { TopBar, HamburgerMenu } from '../features/navigation';
import { Navigation, ReaderWithAudio } from '../features/bible';
import { StudyPanel, StudyToolsPanel } from '../features/study';
import { SearchView } from '../features/search';
import { VerseCardGenerator, ErrorBoundary } from '../components/common';
import { FloatingDock } from '../components/nav/FloatingDock';
import { BIBLE_BOOKS } from '../data';
import { Onboarding } from '../features/onboarding';
import { Settings } from '../features/settings';
import type { Verse, Book } from '../types';

const HomePage = lazy(() => import('../features/home').then((m) => ({ default: m.HomePage })));
const DevotionalPage = lazy(() => import('../features/devotional').then((m) => ({ default: m.DevotionalPage })));
const ReadingPlansPage = lazy(() => import('../features/reading-plans').then((m) => ({ default: m.ReadingPlansPage })));
const BookmarksPage = lazy(() => import('../features/bookmarks').then((m) => ({ default: m.BookmarksPage })));
const MapsPage = lazy(() => import('../features/maps').then((m) => ({ default: m.MapsPage })));
const XRefsPage = lazy(() => import('../features/study').then((m) => ({ default: m.XRefsPage })));
const AISettingsPage = lazy(() => import('../features/settings').then((m) => ({ default: m.AISettingsPage })));
const SettingsPage = lazy(() => import('../features/settings').then((m) => ({ default: m.SettingsPage })));
const SettingsDashboardPage = lazy(() => import('../features/settings').then((m) => ({ default: m.SettingsDashboard })));
const NotesPage = lazy(() => import('../features/notes').then((m) => ({ default: m.NotesPage })));
const HelpPage = lazy(() => import('../features/help').then((m) => ({ default: m.HelpPage })));
const DictionaryViewPage = lazy(() => import('../features/study').then((m) => ({ default: m.DictionaryViewPage })));
const ModuleManagementPage = lazy(() => import('../features/modules').then((m) => ({ default: m.ModuleManagementPage })));
const TagsPage = lazy(() => import('../features/tags').then((m) => ({ default: m.TagsPage })));
const EBDPage = lazy(() => import('../features/ebd').then((m) => ({ default: m.EBDPage })));
const ProfilePage = lazy(() => import('../features/settings').then((m) => ({ default: m.ProfilePage })));

type TabType =
  | 'bible'
  | 'study'
  | 'navigation'
  | 'settings'
  | 'search'
  | 'bookmarks'
  | 'reading-plans'
  | 'tags'
  | 'tts'
  | 'support'
  | 'dictionaries'
  | 'modules'
  | 'profile'
  | 'devocional'
  | 'maps'
  | 'xrefs'
  | 'ebd'
  | 'ai-assistant'
  | 'home'
  | 'notes';

type ReadingMode = 'text' | 'audio' | 'both';
type ToolType = 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes';

function PageLoader() {
  return (
    <div className="flex h-full min-h-48 items-center justify-center gap-3 text-[var(--text-bible-muted)]">
      <Loader className="h-5 w-5 animate-spin" />
      <span>Carregando...</span>
    </div>
  );
}

function AppContent() {
  const { settings, activeTab: contextActiveTab, setActiveTab: contextSetActiveTab } = useAppContext();
  const useAnimations = settings?.navigation?.navAnimation ?? true;
  const [showOnboarding, setShowOnboarding] = useState(false);
  const activeTab = contextActiveTab as TabType;
  const setActiveTab = (tab: TabType | string) => contextSetActiveTab(tab);
  const [readingMode, setReadingMode] = useState<ReadingMode>('text');
  const [toolVerse, setToolVerse] = useState<Verse | null>(null);
  const [toolType, setToolType] = useState<ToolType>('commentary');

  const { currentBook, currentChapter, targetVerse, setTargetVerse, handleSelect } = useReaderState();
  const { tracks: audioTracks, hasSupport: hasAudioSupport } = useAudioTracks(currentBook, currentChapter);
  const { isNavOpen, isSettingsOpen, isStudyOpen, isHamburgerOpen, isShareOpen, isToolOpen, setIsNavOpen, setIsSettingsOpen, setIsStudyOpen, setIsHamburgerOpen, setIsShareOpen, setIsToolOpen, closeNav, closeSettings, closeStudy, closeHamburger, closeShare, closeTool } = useUIState();
  const { selectedVersesForStudy, setIsStudyOpen: setStudyOpen, openStudyPanel } = useStudyPanel();
  const { shareData, setIsShareOpen: setShareOpen, openShare } = useShare();

  const availableVersions = useMemo(() => [
    { id: '1', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA' }
  ], []);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('codex-onboarded');
    setShowOnboarding(!hasOnboarded);
  }, []);

  const handleStudyOpen = (verses: { verse: number; text: string }[]) => {
    openStudyPanel(verses);
  };

  const handleShare = (verses: { verse: number; text: string }[], reference: string) => {
    openShare(verses, reference);
  };

  const handleToolOpen = (verse: Verse, type: ToolType) => {
    setToolVerse(verse);
    setToolType(type);
  };

  return (
    <div
      className="app-shell flex h-[100dvh] w-full overflow-hidden text-bible-text selection:bg-bible-accent/20"
      style={{ minHeight: '100svh' }}
      role="application"
      aria-label="Bíblia Codex - Aplicativo de estudo bíblico"
      data-platform={Capacitor.getPlatform()}
    >
      <a
        href="#main-content"
        className="sr-only rounded focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-bible-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para conteúdo principal
      </a>

      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab as TabType);
          setIsHamburgerOpen(false);
        }}
      />

      <div className="app-frame relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Navigation via FloatingDock */}

        <main id="main-content" className={cn('flex-1 overflow-auto')}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={useAnimations ? { opacity: 0, y: 10 } : {}}
                animate={{ opacity: 1, y: 0 }}
                exit={useAnimations ? { opacity: 0, y: -10 } : {}}
                className="h-full w-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'bible' && (
              <motion.div
                key="bible"
                initial={useAnimations ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={useAnimations ? { opacity: 0 } : {}}
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
                  onNavigate={(bookId: string, chapter: number, verse?: number) => {
                    const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }}
                  audioTracks={audioTracks}
                  hasAudioSupport={hasAudioSupport}
                  readingMode={readingMode}
                  onReadingModeChange={setReadingMode}
                />
              </motion.div>
            )}

            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={useAnimations ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                exit={useAnimations ? { opacity: 0 } : {}}
                className="h-full"
              >
                <Suspense fallback={<PageLoader />}>
                  <HomePage
                    onNavigate={(book: Book, chapter: number) => handleSelect(book, chapter)}
                    goToReadingPlans={() => setActiveTab('reading-plans')}
                    goToDevocional={() => setActiveTab('devocional')}
                    goToAI={() => setActiveTab('ai-assistant')}
                    goToNotes={() => setActiveTab('notes')}
                    goToBookmarks={() => setActiveTab('bookmarks')}
                    goToTags={() => setActiveTab('tags')}
                    goToSearch={() => setActiveTab('search')}
                    goToEBD={() => setActiveTab('ebd')}
                    goToMaps={() => setActiveTab('maps')}
                    goToDictionaries={() => setActiveTab('dictionaries')}
                    goToSettings={() => setActiveTab('settings')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div key="notes" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <NotesPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <SettingsDashboardPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'tts' && (
              <motion.div key="tts" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <SettingsPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div key="support" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <HelpPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'dictionaries' && (
              <motion.div key="dictionaries" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <DictionaryViewPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'modules' && (
              <motion.div key="modules" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <ModuleManagementPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'tags' && (
              <motion.div key="tags" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <TagsPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'devocional' && (
              <motion.div key="devocional" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <DevotionalPage
                    onNavigate={(bookId: string | number, chapter: number, verse?: number) => {
                      const book = BIBLE_BOOKS.find((candidate) => candidate.id === String(bookId));
                      if (book) handleSelect(book, chapter, verse);
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'reading-plans' && (
              <motion.div key="reading-plans" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <ReadingPlansPage
                    onNavigate={(bookId: string, chapter: number, verse?: number) => {
                      const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                      if (book) handleSelect(book, chapter, verse);
                    }}
                    availableVersions={availableVersions}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'bookmarks' && (
              <motion.div key="bookmarks" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <BookmarksPage
                    onNavigate={(bookId: string, chapter: number, verse?: number) => {
                      const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                      if (book) handleSelect(book, chapter, verse);
                    }}
                    onBack={() => setActiveTab('bible')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div key="search" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <SearchView
                  onNavigate={(bookId: string, chapter: number, verse?: number) => {
                    setActiveTab('bible');
                    const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                    if (book) handleSelect(book, chapter, verse);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'maps' && (
              <motion.div key="maps" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <MapsPage
                    onNavigate={(bookId: string, chapter: number, verse?: number) => {
                      const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                      if (book) handleSelect(book, chapter, verse);
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'xrefs' && (
              <motion.div key="xrefs" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <XRefsPage
                    onNavigate={(bookId: string, chapter: number, verse?: number) => {
                      const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
                      if (book) handleSelect(book, chapter, verse);
                    }}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'ebd' && (
              <motion.div key="ebd" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <EBDPage />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'ai-assistant' && (
              <motion.div key="ai-assistant" initial={useAnimations ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={useAnimations ? { opacity: 0 } : {}} className="h-full">
                <Suspense fallback={<PageLoader />}>
                  <AISettingsPage />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <FloatingDock activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabType)} />
      </div>

      <Navigation
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelect={handleSelect}
        currentBook={currentBook}
        currentChapter={currentChapter}
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
          onNavigate={(bookId: string, chapter: number, verse?: number) => {
            const book = BIBLE_BOOKS.find((candidate) => candidate.id === bookId);
            if (book) handleSelect(book, chapter, verse);
          }}
        />
      )}

      <VerseCardGenerator
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        verses={shareData?.verses ?? []}
        reference={shareData?.reference ?? ''}
      />

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
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
