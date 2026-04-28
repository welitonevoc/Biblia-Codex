import { useState, useCallback } from 'react';

interface ShareData {
  verses: { verse: number; text: string }[];
  reference: string;
}

export function useShare() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const openShare = useCallback((verses: { verse: number; text: string }[], reference: string) => {
    setShareData({ verses, reference });
    setIsShareOpen(true);
  }, []);

  const closeShare = useCallback(() => {
    setIsShareOpen(false);
  }, []);

  return {
    shareData,
    isShareOpen,
    setIsShareOpen,
    openShare,
    closeShare,
  };
}
