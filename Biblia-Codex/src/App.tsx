/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { TopBar } from './components/TopBar';
import { Reader } from './components/Reader';
import { ReaderWithAudio } from './components/ReaderWithAudio';
import { AudioTrack } from './services/audioService';
import { getAudioTracksForChapter, hasAudioForChapter } from './data/audioData';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Navigation } from './components/Navigation';
import { Settings } from './components/Settings';
import { StudyPanel } from './components/StudyPanel';
import { Home } from './components/Home';
import { Notes } from './components/Notes';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { DictionaryView } from './components/DictionaryView';
import { ModuleManagement } from './components/ModuleManagement';
import { TagsView } from './components/TagsView';
import { StudyToolsPanel } from './components/StudyToolsPanel';
import { Devotional } from './components/Devotional';
import { ReadingPlans } from './components/ReadingPlans';
import { MapsPage } from './components/MapsPage';
import { SearchView } from './components/SearchView';
import { BIBLE_BOOKS } from './data/bibleMetadata';
import { Book, Verse } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Onboarding } from './components/Onboarding';
import { PermissionScreen } from './components/PermissionScreen';
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
    settings, activeTab, setActiveTab, config
  } = useAppContext();
  const [currentBook, setCurrentBook] = useState<Book>(BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(undefined);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [selectedVersesForStudy, setSelectedVersesForStudy] = useState<{ verse: number, text: string }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('codex-onboarded'));
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [hasAudioSupport, setHasAudioSupport] = useState(false);
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text');

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
  const [toolType, setToolType] = useState<'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places'>('commentary');

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

  const handleToolOpen = (verse: Verse, type: 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places') => {
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
                <Home onNavigate={handleSelect} />
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
                <Notes />
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
                <SettingsPage />
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
                <HelpPage />
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
                <DictionaryView />
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
                <ModuleManagement />
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
                <TagsView />
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
                <Devotional onNavigate={(bookId, chapter, verse) => {
                  const book = BIBLE_BOOKS.find(b => b.id === bookId);
                  if (book) handleSelect(book, chapter, verse);
                }} />
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
                <ReadingPlans onNavigate={(bookId, chapter, verse) => {
                  const book = BIBLE_BOOKS.find(b => b.id === bookId);
                  if (book) handleSelect(book, chapter, verse);
                }} />
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
                <MapsPage onNavigate={(bookId, chapter, verse) => {
                  const book = BIBLE_BOOKS.find(b => b.id === bookId);
                  if (book) handleSelect(book, chapter, verse);
                }} />
              </motion.div>
            )}

            {!['home', 'bible', 'notes', 'settings', 'support', 'dictionaries', 'tags', 'modules', 'sync', 'epub', 'reading-plans', 'commentaries', 'maps', 'xrefs', 'ai-assistant', 'bookmarks', 'devocional', 'search'].includes(activeTab) && (
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

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
