import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Calendar, User, Book, X, Download, Loader2, Bookmark, Globe } from 'lucide-react';
import { getDataUrl } from '../../utils/dataAssets';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MagazineReader } from './MagazineReader';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============ TIPOS ============
interface Lesson {
  number: number;
  title: string;
  textAureo: string;
  verdadePratica: string;
  leituraDiaria: string;
  leituraBiblica: string;
  introducao: string;
  topicos: Array<{ title: string; content: string }>;
  conclusao: string;
  comentario: string;
  sinopse: string;
}

interface ExtractedData {
  year: number;
  quarter: number;
  title: string;
  commentator: string;
  lessons: Lesson[];
}

interface Quarter {
  id: string;
  year: number;
  quarter: number;
  title: string;
  theme: string;
  commentator: string;
  color: string;
  icon: string;
  coverImage?: string;
  lessons: Array<{
    number: number;
    title: string;
    date: string;
    text: string;
  }>;
}

// ============ COMPONENTE DO LIVRO DINÂMICO (HTML PURO) ============
const DynamicBook: React.FC<{ onBack: () => void; magazineUrl?: string; magazineHTML?: string; initialPageIndex?: number }> = ({ onBack, magazineUrl, magazineHTML, initialPageIndex }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar o conteúdo do HTML gerado ou URL
  useEffect(() => {
    if (magazineHTML) {
      // Usa HTML direto retornado pela Vercel
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(magazineHTML);
          doc.close();
          setIsLoaded(true);
        }
      }
    } else {
      // Carrega de URL (servidor local)
      const url = getDataUrl(magazineUrl || 'EBD/page.txt');
      fetch(url)
        .then(res => res.text())
        .then(html => {
          if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument;
            if (doc) {
              doc.open();
              doc.write(html);
              doc.close();
              setIsLoaded(true);

              // Navegar para página inicial se especificada
              if (initialPageIndex) {
                // Aguardar renderização do conteúdo
                setTimeout(() => {
                  try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc && iframe.contentWindow) {
                      // Chamar função showPage se existir no iframe
                      const win = iframe.contentWindow as any;
                      const showPageFn = win.showPage;
                      if (typeof showPageFn === 'function') {
                        showPageFn(initialPageIndex);
                        console.log(`[DynamicBook] Navegado para página ${initialPageIndex}`);
                      }
                    }
                  } catch (e) {
                    console.warn('[DynamicBook] Não foi possível navegar para página:', e);
                  }
                }, 500);
              }
            }
          }
        })
        .catch(err => {
          console.error('Erro ao carregar revista:', err);
          setIsLoaded(true);
        });
    }
  }, [magazineUrl, magazineHTML, initialPageIndex]);

  return (
    <div className="h-full overflow-hidden bg-white relative">
      {/* Botão Voltar Flutuante */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-40">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-gray-600">Carregando revista digital...</p>
          </div>
        </div>
      )}

      {/* iframe com o conteúdo HTML completo */}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Revista Digital EBD"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL EBDPage ============
export const EBDPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [showExtractor, setShowExtractor] = useState(false);
  const [sumarioUrl, setSumarioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [magazineUrl, setMagazineUrl] = useState<string | null>(null);
  const [magazineHTML, setMagazineHTML] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Quarter['lessons'][0] | null>(null);
  const [showDynamicBook, setShowDynamicBook] = useState(false);
  const [initialPageIndex, setInitialPageIndex] = useState<number | undefined>(undefined);

  // Detectar se está em produção (Vercel) ou desenvolvimento local
  const isProduction = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('biblia-codex'));

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const saved = localStorage.getItem('extracted_ebd_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExtractedData(parsed);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }, []);

  const handleExtract = async () => {
    if (!sumarioUrl) {
      alert('Por favor, insira a URL do sumário');
      return;
    }

    setLoading(true);
    setLoadingProgress('Conectando ao servidor...');

    try {
      // Tenta Vercel API (produção) ou servidor local (dev)
      const response = await fetch('/api/ebd/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sumarioUrl })
      });

      setLoadingProgress('Processando extração...');
      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data);
        localStorage.setItem('extracted_ebd_data', JSON.stringify(result.data));

        // Vercel retorna HTML direto, servidor local retorna URL
        if (result.magazineHTML) {
          setMagazineHTML(result.magazineHTML);
          setMagazineUrl(null);
        } else {
          setMagazineUrl(result.magazineUrl || 'EBD/page.txt');
          setMagazineHTML(null);
        }

        setShowExtractor(false);
        setSumarioUrl('');
        setLoadingProgress('Extração concluída com sucesso!');
        setShowDynamicBook(true);
      } else {
        alert('Erro na extração: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor. Certifique-se de que o servidor está rodando (npm run dev).');
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(''), 2000);
    }
  };

  const clearExtractedData = () => {
    setExtractedData(null);
    setMagazineUrl(null);
    setMagazineHTML(null);
    setInitialPageIndex(undefined);
    localStorage.removeItem('extracted_ebd_data');
    setShowDynamicBook(false);
  };

  // Se há dados extraídos e deve mostrar o livro dinâmico
  if (showDynamicBook && magazineUrl) {
    return <MagazineReader onBack={clearExtractedData} magazineUrl={magazineUrl} initialPageIndex={initialPageIndex} />;
  }

  // Fallback para HTML direto (extração Vercel)
  if (showDynamicBook && magazineHTML) {
    return <DynamicBook onBack={clearExtractedData} magazineHTML={magazineHTML} />;
  }

  // Dados estáticos dos trimestres (1º Trimestre de 2026 com conteúdo real)
  const quartersData: Quarter[] = [
    {
      id: '2026-q1',
      year: 2026,
      quarter: 1,
      title: '1º Trimestre de 2026',
      theme: 'A Santíssima Trindade',
      commentator: 'Comentarista: Douglas Baptista',
      color: 'from-blue-600 to-blue-800',
      icon: '✝️',
      coverImage: 'https://i.ibb.co/Gf6fWG0q/Capa.jpg',
      lessons: [
        { number: 1, title: 'O Deus Trino e a Criação do Homem', date: 'Janeiro', text: 'Estudo sobre a Trindade na criação...' },
        { number: 2, title: 'O Deus Pai', date: 'Janeiro', text: 'Conhecemos a identidade, os atributos e a glória do Deus Pai...' },
        { number: 3, title: 'O Deus Filho', date: 'Fevereiro', text: 'A pessoa e obra de Jesus Cristo...' },
      ]
    },
    {
      id: '2026-q2',
      year: 2026,
      quarter: 2,
      title: '2º Trimestre de 2026',
      theme: 'A Fé dos Patriarcas',
      commentator: 'Comentarista: Elinaldo Renovato',
      color: 'from-amber-600 to-amber-800',
      icon: '📖',
      coverImage: 'https://www.estudantesdabiblia.com.br/images/lb_202602_200.jpg',
      lessons: [
        { number: 1, title: 'Abraão: O Pai da Fé', date: '05 Abr', text: 'A fé de Abraão é o modelo para todos os crentes. Chamado por Deus para deixar sua terra natal, ele demonstrou obediência radical e confiança absoluta nas promessas divinas. Estudo sobre Gn 12.1-9 e Hb 11.8.' },
        { number: 2, title: 'A Promessa de Deus', date: '12 Abr', text: 'As promessas de Deus são o fundamento da nossa fé. Ele prometeu a Abraão descendência, terra e bênção universal. Estudo sobre Gn 15.1-21 e as alianças divinas.' },
        { number: 3, title: 'Isaque: O Filho da Promessa', date: '19 Abr', text: 'Isaque nasceu como cumprimento da promessa divina. Sua vida nos ensina sobre paciência, fé e o perfeito timing de Deus. Estudo sobre Gn 21.1-21.' },
        { number: 4, title: 'Jacó: O Lutador', date: '26 Abr', text: 'Jacó representa a luta humana com Deus. De enganador a Israel, seu caráter foi transformado pelo encontro divino. Estudo sobre Gn 25.19-34 e Gn 28.10-22.' },
        { number: 5, title: 'O Encontro com Deus em Betel', date: '03 Mai', text: 'O sonho da escada que tocava os céus mudou a vida de Jacó. Em Betel, ele teve um encontro transformador com Deus. Estudo sobre Gn 28.10-22.' },
        { number: 6, title: 'A Aliança Renovada', date: '10 Mai', text: 'Jacó lutou com Deus e prevaleceu. A aliança foi renovada e seu nome mudou para Israel. Estudo sobre Gn 32.22-32 e a transformação do caráter.' },
        { number: 7, title: 'José: Provisão Divina', date: '17 Mai', text: 'José foi vendido como escravo, mas Deus o levantou como governador do Egito. A providência divina em meio às adversidades. Estudo sobre Gn 37.1-36.' },
        { number: 8, title: 'Fé em Meio às Provas', date: '24 Mai', text: 'José permaneceu fiel mesmo na prisão. Sua fé foi provada e ele saiu vitorioso. Estudo sobre Gn 39.1-23 e a fidelidade em tempos difíceis.' },
        { number: 9, title: 'O Caráter Transformado', date: '31 Mai', text: 'De sonhador a governador, José demonstrou caráter maduro e perdoador. Deus transforma nosso caráter através das provas. Estudo sobre Gn 41.1-57.' },
        { number: 10, title: 'Promessas Eternas', date: '07 Jun', text: 'José revelou seus irmãos e trouxe perdão e reconciliação. As promessas de Deus se cumprem de maneira surpreendente. Estudo sobre Gn 45.1-28.' },
        { number: 11, title: 'Peregrinos neste Mundo', date: '14 Jun', text: 'Jacó desceu ao Egito e reencontrou José. Os patriarcas eram peregrinos buscando a pátria celestial. Estudo sobre Gn 46.1-34.' },
        { number: 12, title: 'Herdeiros da Fé', date: '21 Jun', text: 'As bênçãos de Jacó sobre seus filhos revelam o plano de Deus para as doze tribos. Estudo sobre Gn 47.1-31 e a herança da fé.' },
        { number: 13, title: 'O Legado dos Patriarcas', date: '28 Jun', text: 'As profecias finais de Jacó e o legado deixado pelos patriarcas para todas as gerações. Estudo sobre Gn 49.1-33 e o cumprimento das promessas.' },
      ]
    },
    {
      id: '2026-q3',
      year: 2026,
      quarter: 3,
      title: '3º Trimestre de 2026',
      theme: 'Os Profetas Menores',
      commentator: 'Comentarista: Antônio Gilberto',
      color: 'from-purple-600 to-purple-800',
      icon: '📜',
      lessons: [
        { number: 1, title: 'Oseias: O Amor de Deus', date: 'Julho', text: 'Conteúdo sobre Oseias...' },
      ]
    },
    {
      id: '2026-q4',
      year: 2026,
      quarter: 4,
      title: '4º Trimestre de 2026',
      theme: 'O Sermão do Monte',
      commentator: 'Comentarista: Luciano de Paula Lourenço',
      color: 'from-emerald-600 to-emerald-800',
      icon: '🏔️',
      lessons: [
        { number: 1, title: 'As Bem-Aventuranças', date: 'Outubro', text: 'Conteúdo sobre Bem-Aventuranças...' },
      ]
    },
    {
      id: '2025-q4',
      year: 2025,
      quarter: 4,
      title: '4º Trimestre de 2025',
      theme: 'Daniel e Apocalipse',
      commentator: 'Comentarista: José Gonçalves',
      color: 'from-red-600 to-red-800',
      icon: '👁️',
      lessons: [
        { number: 1, title: 'As Visões de Daniel', date: 'Outubro', text: 'Conteúdo sobre Daniel...' },
      ]
    },
    {
      id: '2025-q3',
      year: 2025,
      quarter: 3,
      title: '3º Trimestre de 2025',
      theme: 'Romanos: O Evangelho da Graça',
      commentator: 'Comentarista: Dr. Caramuru Afonso Francisco',
      color: 'from-teal-600 to-teal-800',
      icon: '✉️',
      lessons: [
        { number: 1, title: 'A Saudação Apostólica', date: 'Julho', text: 'Conteúdo sobre Romanos...' },
      ]
    },
  ];

  // View: Lesson Details
  if (selectedLesson && selectedQuarter) {
    return (
      <LessonView
        quarter={selectedQuarter}
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  // View: Quarter Lessons List
  if (selectedQuarter) {
    return (
      <QuarterView
        quarter={selectedQuarter}
        onBack={() => setSelectedQuarter(null)}
        onSelectLesson={setSelectedLesson}
        onOpenDynamicBook={(url, pageIndex) => {
          setMagazineUrl(url);
          setMagazineHTML(null);
          setInitialPageIndex(pageIndex);
          setShowDynamicBook(true);
        }}
      />
    );
  }

  // View: Main Quarters Grid
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão de extração */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-bible-text mb-2">
              Escola Bíblica Dominical
            </h1>
            <p className="text-bible-text-muted text-sm md:text-base">
              Lições Bíblicas - Trimestres e Lições
            </p>
          </div>
          <div className="flex gap-2">
            {extractedData && (
              <button
                onClick={() => setShowDynamicBook(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
              >
                <BookOpen className="h-4 w-4" />
                Revista Completa
              </button>
            )}
            {!isProduction && (
              <button
                onClick={() => setShowExtractor(!showExtractor)}
                className={cn(
                  "text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm",
                  showExtractor
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <Globe className="h-4 w-4" />
                {showExtractor ? 'Cancelar' : 'Importar da Web'}
              </button>
            )}
          </div>
        </div>

        {/* Extractor UI */}
        {showExtractor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 border rounded-xl bg-white shadow-lg"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Extrair Conteúdo do Site
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Insira a URL do sumário do trimestre desejado. Exemplo:<br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm
              </code>
            </p>
            <div className="flex gap-3">
              <input
                type="url"
                placeholder="URL do sumário..."
                value={sumarioUrl}
                onChange={(e) => setSumarioUrl(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
              />
              <button
                onClick={handleExtract}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {loading ? 'Extraindo...' : 'Extrair 13 Lições'}
              </button>
            </div>
            {loading && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ⏳ {loadingProgress}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Grid de Capas dos Trimestres */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {quartersData.map((quarter, index) => (
            <motion.div
              key={quarter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Para o 1º Trimestre de 2026, mostrar diretamente o conteúdo da página.txt
                if (quarter.id === '2026-q1') {
                  setMagazineUrl('EBD/page.txt');
                  setMagazineHTML(null);
                  setShowDynamicBook(true);
                }
                // Para o 2º Trimestre de 2026, mostrar diretamente o conteúdo da page2.txt
                else if (quarter.id === '2026-q2') {
                  setMagazineUrl('EBD/page2.txt');
                  setMagazineHTML(null);
                  setShowDynamicBook(true);
                }
                // Para o 3º Trimestre de 2026, mostrar diretamente o conteúdo da page3.txt
                else if (quarter.id === '2026-q3') {
                  setMagazineUrl('EBD/page3.txt');
                  setMagazineHTML(null);
                  setShowDynamicBook(true);
                } else {
                  setSelectedQuarter(quarter);
                }
              }}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                {quarter.coverImage ? (
                  <>
                    <img src={quarter.coverImage} alt={quarter.theme} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        <span className="font-semibold drop-shadow-lg">{quarter.lessons.length} lições</span>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className={cn("h-full bg-gradient-to-br", quarter.color)}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                    <div className="relative h-full flex flex-col justify-between p-4 md:p-6 text-white">
                      <div>
                        <div className="text-4xl md:text-5xl mb-2">{quarter.icon}</div>
                        <div className="text-xs md:text-sm font-medium opacity-90">{quarter.title}</div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base md:text-lg font-bold leading-tight">{quarter.theme}</h3>
                        <p className="text-xs opacity-80">{quarter.commentator}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs opacity-80">
                          <BookOpen className="h-3 w-3" />
                          <span>{quarter.lessons.length} lições</span>
                        </div>
                        <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-2 border-2 border-white/20 rounded-lg pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Informações de como usar */}
        <div className="mt-8 p-4 bg-bible-surface/50 rounded-lg border border-bible-border">
          <div className="flex items-start gap-3">
            <Book className="h-5 w-5 text-bible-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-bible-text mb-1">Como usar</h3>
              <p className="text-xs text-bible-text-muted">
                Clique em um trimestre para ver as lições disponíveis ou em "Importar da Web" para extrair conteúdo completo.
                A revista digital do 1º Trimestre de 2026 está disponível com todo o conteúdo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ QuarterView Component ============
interface QuarterViewProps {
  quarter: Quarter;
  onBack: () => void;
  onSelectLesson: (lesson: Quarter['lessons'][0]) => void;
  onOpenDynamicBook?: (url: string, pageIndex?: number) => void;
}

const QuarterView: React.FC<QuarterViewProps> = ({ quarter, onBack, onSelectLesson, onOpenDynamicBook }) => {
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-bible-text-muted hover:text-bible-text mb-6 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-sm">Voltar aos trimestres</span>
        </button>

        <div className={cn(
          "relative rounded-xl overflow-hidden mb-8 p-6 md:p-8 text-white",
          "bg-gradient-to-br", quarter.color
        )}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          <div className="relative">
            <div className="text-5xl mb-4">{quarter.icon}</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{quarter.theme}</h1>
            <p className="text-sm md:text-base opacity-90">{quarter.title}</p>
            <p className="text-sm opacity-80 mt-1">{quarter.commentator}</p>
          </div>
          <div className="absolute inset-2 border-2 border-white/20 rounded-lg pointer-events-none" />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-bible-text mb-4">Lições Disponíveis</h2>
          {quarter.lessons.map((lesson, index) => (
            <motion.button
              key={lesson.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                // Para 1º, 2º e 3º trimestre 2026, abrir revista completa na página da lição
                if (onOpenDynamicBook && (quarter.id === '2026-q1' || quarter.id === '2026-q2' || quarter.id === '2026-q3')) {
                  const url = quarter.id === '2026-q1' ? 'EBD/page.txt' : quarter.id === '2026-q2' ? 'EBD/page2.txt' : 'EBD/page3.txt';
                  // Calcular página: lição 1 = page 3, lição 2 = page 4, etc.
                  const pageIndex = lesson.number + 2; // +2 porque page 0=capa, page 1=editora, page 2=sumário
                  onOpenDynamicBook(url, pageIndex);
                } else {
                  onSelectLesson(lesson);
                }
              }}
              className="w-full flex items-center gap-4 p-4 bg-bible-surface rounded-lg border border-bible-border hover:border-bible-accent/50 hover:bg-bible-surface/80 transition-all text-left group"
            >
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                "bg-gradient-to-br", quarter.color
              )}>
                {lesson.number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-bible-text truncate group-hover:text-bible-accent transition-colors">
                  Lição {lesson.number}: {lesson.title}
                </h3>
                <p className="text-xs text-bible-text-muted mt-1">{lesson.date}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-bible-text-muted group-hover:text-bible-accent transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ LessonView Component ============
interface LessonViewProps {
  quarter: Quarter;
  lesson: Quarter['lessons'][0];
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ quarter, lesson, onBack }) => {
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-bible-text-muted hover:text-bible-text mb-6 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-sm">Voltar às lições</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-white text-xs font-bold",
              "bg-gradient-to-br", quarter.color
            )}>
              Lição {lesson.number}
            </div>
            <div className="flex items-center gap-1 text-xs text-bible-text-muted">
              <Calendar className="h-3 w-3" />
              <span>{lesson.date}</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-bible-text">{lesson.title}</h1>
          <p className="text-sm text-bible-text-muted mt-1">{quarter.theme} - {quarter.commentator}</p>
        </div>

        <div className="bg-bible-surface rounded-xl border border-bible-border p-6 md:p-8">
          <div className="prose prose-sm md:prose-base max-w-none">
            <div className="mb-6 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded">
              <h3 className="text-sm font-bold text-amber-600 mb-2">TEXTO ÁUREO</h3>
              <p className="text-bible-text italic">
                "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..." - João 3:16
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">INTRODUÇÃO</h3>
              <p className="text-bible-text leading-relaxed mb-4">{lesson.text}</p>
            </div>

            <div className="mb-6 p-4 bg-green-500/10 border-l-4 border-green-500 rounded">
              <h3 className="text-sm font-bold text-green-600 mb-2">CONCLUSÃO</h3>
              <p className="text-bible-text">
                Que possamos aplicar estes ensinamentos em nossas vidas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
