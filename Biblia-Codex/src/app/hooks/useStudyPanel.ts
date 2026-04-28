import { useState, useCallback } from 'react';

export function useStudyPanel() {
  const [selectedVersesForStudy, setSelectedVersesForStudy] = useState<{ verse: number; text: string }[]>([]);
  const [isStudyOpen, setIsStudyOpen] = useState(false);

  const openStudyPanel = useCallback((verses: { verse: number; text: string }[]) => {
    setSelectedVersesForStudy(verses);
    setIsStudyOpen(true);
  }, []);

  const closeStudyPanel = useCallback(() => {
    setIsStudyOpen(false);
  }, []);

  return {
    selectedVersesForStudy,
    isStudyOpen,
    openStudyPanel,
    closeStudyPanel,
  };
}
