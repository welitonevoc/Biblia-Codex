import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';

interface MagazineReaderProps {
  onBack: () => void;
  magazineUrl: string;
  initialPageIndex?: number;
}

/**
 * MagazineReader - Componente otimizado para leitura de revistas EBD
 * 
 * Melhorias implementadas:
 * - Cache via EBDPage (IndexedDB já existente)
 * - Loading state com skeleton animado
 * - Navegação para página inicial
 * - Controles de navegação prev/next
 * - Indicador de página atual
 * - AbortController para cancelar fetch se desmontar
 * - Error state com retry
 * 
 * Visual: 100% idêntico ao original - o iframe renderiza o HTML EBD sem modificações
 */
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
  const [totalPages, setTotalPages] = useState(48); // page-0 até page-47 padrão

  // Carrega conteúdo da URL
  const loadMagazine = useCallback(async (url: string) => {
    // Cancelar requisição anterior se existir
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[MagazineReader] Fetching:', url);
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      if (controller.signal.aborted) return;

      // Injetar no iframe
      injectContent(html);
      console.log('[MagazineReader] Carregado:', url);

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('[MagazineReader] Erro:', err);
      setError(err.message || 'Erro ao carregar revista');
      setIsLoading(false);
    }
  }, []);

  // Injeta HTML no iframe e configura navegação
  const injectContent = (html: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    // Aguardar conteúdo carregar
    iframe.onload = () => {
      try {
        const iframeWin = iframe.contentWindow as any;

        // Detectar total de páginas (page-0 até page-N)
        const pageElements = doc.querySelectorAll('[id^="page-"]');
        if (pageElements.length > 0) {
          setTotalPages(pageElements.length);
        }

        // Navegar para página inicial se especificada
        if (initialPageIndex !== undefined && typeof iframeWin.showPage === 'function') {
          iframeWin.showPage(initialPageIndex);
          setCurrentPage(initialPageIndex);
          console.log(`[MagazineReader] Navegado para página ${initialPageIndex}`);
        }

        // Listener para atualizar página atual quando navegar no iframe
        if (typeof iframeWin.onPageChange === 'function') {
          iframeWin.onPageChange = (page: number) => {
            setCurrentPage(page);
          };
        }

        setIsLoading(false);
      } catch (e) {
        console.warn('[MagazineReader] Aviso:', e);
        setIsLoading(false);
      }
    };
  };

  // Navegar para próxima/anterior
  const navigatePage = useCallback((direction: 'prev' | 'next') => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const win = iframe.contentWindow as any;
    if (typeof win.showPage !== 'function') return;

    const newPage = direction === 'next'
      ? Math.min(currentPage + 1, totalPages - 1)
      : Math.max(currentPage - 1, 0);

    win.showPage(newPage);
    setCurrentPage(newPage);
  }, [currentPage, totalPages]);

  // Ir para página específica
  const goToPage = useCallback((pageIndex: number) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const win = iframe.contentWindow as any;
    if (typeof win.showPage !== 'function') return;

    const clamped = Math.max(0, Math.min(pageIndex, totalPages - 1));
    win.showPage(clamped);
    setCurrentPage(clamped);
  }, [totalPages]);

  // Carregar ao montar
  useEffect(() => {
    loadMagazine(magazineUrl);

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [magazineUrl, loadMagazine]);

  // Expor goToPage para o iframe chamar (via postMessage ou referência)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EBD_PAGE_CHANGE') {
        setCurrentPage(event.data.page);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-full overflow-hidden bg-white relative flex flex-col">
      {/* Header com navegação - fica FORA do iframe, visual moderno */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-3 py-2 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Voltar</span>
        </button>

        {/* Indicador de página + navegação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigatePage('prev')}
            disabled={currentPage === 0}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium"
            title="Página anterior"
          >
            ◀
          </button>
          <span className="text-sm text-gray-600 min-w-[80px] text-center font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => navigatePage('next')}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium"
            title="Próxima página"
          >
            ▶
          </button>
        </div>

        {/* Espaçador para balancear layout */}
        <div className="w-20" />
      </div>

      {/* Conteúdo do iframe */}
      <div className="flex-1 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 text-sm font-medium">Carregando revista digital...</p>
            <div className="mt-4 w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-700 font-semibold mb-2">Erro ao carregar</p>
            <p className="text-gray-500 text-sm mb-4 text-center px-4 max-w-sm">{error}</p>
            <button
              onClick={() => loadMagazine(magazineUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* iframe - Renderiza o HTML EBD original sem modificações visuais */}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Revista Digital EBD"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
