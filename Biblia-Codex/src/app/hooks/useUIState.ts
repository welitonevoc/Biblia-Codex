import { useState, useCallback } from 'react';
import type { Verse } from '../../types';

export type ToolType = 'commentary' | 'dictionary' | 'xrefs' | 'people' | 'places' | 'footnotes';

interface UseUIStateReturn {
  isNavOpen: boolean;
  isSettingsOpen: boolean;
  isStudyOpen: boolean;
  isHamburgerOpen: boolean;
  isShareOpen: boolean;
  isToolOpen: boolean;
  setIsNavOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsStudyOpen: (open: boolean) => void;
  setIsHamburgerOpen: (open: boolean) => void;
  setIsShareOpen: (open: boolean) => void;
  setIsToolOpen: (open: boolean) => void;
  toggleNav: () => void;
  toggleSettings: () => void;
  toggleStudy: () => void;
  toggleHamburger: () => void;
  closeNav: () => void;
  closeSettings: () => void;
  closeStudy: () => void;
  closeHamburger: () => void;
  openShare: () => void;
  closeShare: () => void;
  openTool: (verse: Verse, type: ToolType) => void;
  closeTool: () => void;
}

export function useUIState(): UseUIStateReturn {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isToolOpen, setIsToolOpen] = useState(false);

  const toggleNav = useCallback(() => setIsNavOpen((prev) => !prev), []);
  const toggleSettings = useCallback(() => setIsSettingsOpen((prev) => !prev), []);
  const toggleStudy = useCallback(() => setIsStudyOpen((prev) => !prev), []);
  const toggleHamburger = useCallback(() => setIsHamburgerOpen((prev) => !prev), []);

  const closeNav = useCallback(() => setIsNavOpen(false), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const closeStudy = useCallback(() => setIsStudyOpen(false), []);
  const closeHamburger = useCallback(() => setIsHamburgerOpen(false), []);

  const openShare = useCallback(() => setIsShareOpen(true), []);
  const closeShare = useCallback(() => setIsShareOpen(false), []);

  const openTool = useCallback((verse: Verse, _type: ToolType) => {
    setIsToolOpen(true);
  }, []);
  const closeTool = useCallback(() => setIsToolOpen(false), []);

  return {
    isNavOpen,
    isSettingsOpen,
    isStudyOpen,
    isHamburgerOpen,
    isShareOpen,
    isToolOpen,
    setIsNavOpen,
    setIsSettingsOpen,
    setIsStudyOpen,
    setIsHamburgerOpen,
    setIsShareOpen,
    setIsToolOpen,
    toggleNav,
    toggleSettings,
    toggleStudy,
    toggleHamburger,
    closeNav,
    closeSettings,
    closeStudy,
    closeHamburger,
    openShare,
    closeShare,
    openTool,
    closeTool,
  };
}
