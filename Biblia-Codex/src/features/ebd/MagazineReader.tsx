import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { getDataUrl } from '../../utils/dataAssets';

interface MagazineReaderProps {
  onBack: () => void;
  magazineUrl: string;
  initialPageIndex?: number;
}

export const MagazineReader: React.FC<MagazineReaderProps> = ({
  onBack,
  magazineUrl,
  initialPageIndex,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPageIndex || 0);
  const [totalPages, setTotalPages] = useState(48);

  const loadMagazine = useCallback(async (url: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const resolvedUrl = getDataUrl(url);
      const response = await fetch(resolvedUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      if (controller.signal.aborted) return;

      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      if (!iframe || !doc) return;

      doc.open();
      doc.write(html);
      doc.close();

      iframe.onload = () => {
        try {
          const iframeWin = iframe.contentWindow as (Window & { showPage?: (page: number) => void; onPageChange?: (page: number) => void }) | null;
          const pageElements = doc.querySelectorAll('[id^="page-"]');
          if (pageElements.length > 0) {
            setTotalPages(pageElements.length);
          }

          if (initialPageIndex !== undefined && iframeWin?.showPage) {
            iframeWin.showPage(initialPageIndex);
            setCurrentPage(initialPageIndex);
          }

          if (iframeWin) {
            iframeWin.onPageChange = (page: number) => setCurrentPage(page);
          }
        } finally {
          setIsLoading(false);
        }
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message || 'Erro ao carregar revista');
      setIsLoading(false);
    }
  }, [initialPageIndex]);

  const navigatePage = useCallback((direction: 'prev' | 'next') => {
    const iframeWin = iframeRef.current?.contentWindow as (Window & { showPage?: (page: number) => void }) | null;
    if (!iframeWin?.showPage) return;

    const nextPage =
      direction === 'next'
        ? Math.min(currentPage + 1, totalPages - 1)
        : Math.max(currentPage - 1, 0);

    iframeWin.showPage(nextPage);
    setCurrentPage(nextPage);
  }, [currentPage, totalPages]);

  useEffect(() => {
    loadMagazine(magazineUrl);
    return () => abortRef.current?.abort();
  }, [loadMagazine, magazineUrl]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'EBD_PAGE_CHANGE') {
        setCurrentPage(event.data.page);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <div className="z-10 flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigatePage('prev')}
            disabled={currentPage === 0}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            title="Página anterior"
          >
            ◀
          </button>
          <span className="min-w-[80px] text-center text-sm font-medium text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => navigatePage('next')}
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
            title="Próxima página"
          >
            ▶
          </button>
        </div>

        <div className="w-20" />
      </div>

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Carregando revista digital...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50">
            <div className="mb-4 text-4xl text-red-500">⚠️</div>
            <p className="mb-2 font-semibold text-gray-700">Erro ao carregar</p>
            <p className="mb-4 max-w-sm px-4 text-center text-sm text-gray-500">{error}</p>
            <button
              onClick={() => loadMagazine(magazineUrl)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className="h-full w-full border-0"
          title="Revista Digital EBD"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
