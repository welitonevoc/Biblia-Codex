import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Calendar, User, Book, X, Download, Loader2, Bookmark, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  lessons: Array<{
    number: number;
    title: string;
    date: string;
    text: string;
  }>;
}

// ============ COMPONENTE DO LIVRO DINÂMICO ============
const DynamicBook: React.FC<{ data: ExtractedData; onBack: () => void }> = ({ data, onBack }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(100);
  const [showSidebar, setShowSidebar] = useState(false);
  const [modalVerse, setModalVerse] = useState<{ ref: string; text: string } | null>(null);

  // Carregar marcadores salvos
  useEffect(() => {
    const saved = localStorage.getItem('ebd_dynamic_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  // Salvar marcadores
  const saveBookmarks = useCallback((newBookmarks: number[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('ebd_dynamic_bookmarks', JSON.stringify(newBookmarks));
  }, []);

  const toggleBookmark = () => {
    const index = bookmarks.indexOf(currentPage);
    if (index === -1) {
      saveBookmarks([...bookmarks, currentPage]);
    } else {
      saveBookmarks(bookmarks.filter(b => b !== currentPage));
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.min(Math.max(fontSize + delta, 80), 150);
    setFontSize(newSize);
  };

  // Navegação
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  // Total de páginas: capa (1) + apresentação (1) + sumário (1) + 13 lições + capítulos (13) + devocionais (13) = 42
  const totalPages = 42;

  // Constrói as páginas dinamicamente
  const buildPages = () => {
    const pages: JSX.Element[] = [];

    // Página 0 - Capa
    pages.push(
      <div key="capa" className="magazine-page">
        <div className="relative rounded-lg overflow-hidden shadow-xl">
          <img
            src={`https://via.placeholder.com/600x800/1e40af/ffffff?text=${encodeURIComponent(data.title)}`}
            className="w-full rounded-lg shadow-lg"
            alt="Capa"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{data.title}</h1>
            <p className="text-white/90">{data.commentator}</p>
          </div>
        </div>
      </div>
    );

    // Página 1 - Apresentação / Palavra da Editora
    pages.push(
      <div key="apresentacao" className="magazine-page">
        <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center text-blue-800">Palavra da Editora</h2>
          <p className="mt-4">Prezado(a) professor(a),</p>
          <p className="mt-2">Este trimestre é um convite à adoração e ao aprendizado mais profundo sobre a natureza de Deus, que se revela como Pai, Filho e Espírito Santo.</p>
          <p className="mt-2">Cada lição foi preparada com cuidado para auxiliar no crescimento espiritual e no conhecimento teológico. Que este material seja uma bênção em sua jornada de fé.</p>
          <p className="mt-4 font-bold text-center text-blue-600">Bom trimestre!</p>
        </div>
      </div>
    );

    // Página 2 - Sumário
    pages.push(
      <div key="sumario" className="magazine-page">
        <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center text-red-700">SUMÁRIO</h2>
          <h3 className="text-xl font-bold text-center mt-2">{data.title}</h3>
          <p className="text-center text-gray-600">{data.commentator}</p>
          <div className="mt-6 space-y-2">
            {data.lessons.map(lesson => (
              <div key={lesson.number} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition">
                <span className="font-bold text-blue-600 w-16 text-center bg-blue-50 py-1 rounded">
                  {lesson.number}
                </span>
                <span className="flex-1">{lesson.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // Páginas 3 a 15 - Lições (13 lições)
    data.lessons.forEach((lesson, idx) => {
      pages.push(
        <div key={`lesson-${lesson.number}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            {/* Título da Lição */}
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 bg-red-700 text-white rounded-full text-sm font-bold">
                Lição {lesson.number}
              </div>
              <h1 className="text-2xl font-bold mt-3 text-gray-800">{lesson.title}</h1>
            </div>

            {/* Texto Áureo */}
            <div className="border-l-4 border-red-500 bg-red-50 p-4 mb-6 rounded">
              <h3 className="font-bold text-red-700 mb-2">TEXTO ÁUREO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.textAureo }} />
            </div>

            {/* Verdade Prática */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-6 rounded">
              <h3 className="font-bold text-blue-700 mb-2">VERDADE PRÁTICA</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.verdadePratica }} />
            </div>

            {/* Leitura Diária */}
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <h3 className="font-bold text-center text-gray-800 mb-3">📖 LEITURA DIÁRIA</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.leituraDiaria }} />
            </div>

            {/* Leitura Bíblica */}
            <div className="bg-amber-50 p-4 mb-6 rounded border border-amber-200">
              <h3 className="font-bold text-center text-amber-800 mb-3">📜 LEITURA BÍBLICA EM CLASSE</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.leituraBiblica }} />
            </div>

            {/* Introdução */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-blue-800 mb-2">INTRODUÇÃO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.introducao }} />
            </div>

            {/* Tópicos */}
            {lesson.topicos.map((topico, i) => (
              <div key={i} className="mb-6">
                <h3 className="font-bold text-lg text-blue-800 mb-2">{topico.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: topico.content }} />
              </div>
            ))}

            {/* Comentário */}
            <div className="bg-gray-50 p-4 mb-6 rounded border border-gray-200">
              <h3 className="font-bold text-lg text-gray-700 mb-2">💡 COMENTÁRIO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.comentario }} />
            </div>

            {/* Sinopse */}
            <div className="text-center italic text-green-700 mb-6 bg-green-50 p-4 rounded">
              <strong>Sinopse:</strong>
              <div dangerouslySetInnerHTML={{ __html: lesson.sinopse }} />
            </div>

            {/* Conclusão */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-700 mb-2">CONCLUSÃO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.conclusao }} />
            </div>
          </div>
        </div>
      );
    });

    // Páginas 16 a 28 - Capítulos do Livro de Apoio (13 capítulos)
    for (let i = 0; i < 13; i++) {
      const lesson = data.lessons[i];
      pages.push(
        <div key={`chapter-${i + 1}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center text-purple-800">
              Capítulo {i + 1}
            </h2>
            <p className="text-center text-gray-600 mb-6 font-medium">
              {lesson?.title || `Lição ${i + 1}`}
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                Conteúdo detalhado do capítulo {i + 1} do livro de apoio.
                Este material complementar aprofunda os temas abordados na lição,
                trazendo reflexões teológicas adicionais e aplicações práticas.
              </p>
              {lesson && (
                <div className="bg-purple-50 p-4 rounded border border-purple-200 mt-4">
                  <h4 className="font-bold text-purple-800 mb-2">Relacionado à Lição {i + 1}</h4>
                  <div dangerouslySetInnerHTML={{ __html: lesson.sinopse }} />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Páginas 29 a 41 - Devocionais (13 devocionais)
    for (let i = 0; i < 13; i++) {
      const lesson = data.lessons[i];
      pages.push(
        <div key={`devotional-${i + 1}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center text-teal-800">
              🙏 Devocional - Semana {i + 1}
            </h2>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-700">
              {lesson?.title || `Lição ${i + 1}`}
            </h3>
            <div className="space-y-4">
              <div className="bg-teal-50 p-4 rounded">
                <p><strong>📖 Leitura do dia:</strong> Salmo {i + 1}.1-10</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p><strong>💭 Meditação:</strong> Reflexão sobre a importância da Trindade na vida cristã.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p><strong>🙏 Oração:</strong> Pai, que possamos viver em comunhão contigo e com teu Filho, pelo Espírito Santo.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return pages;
  };

  const pages = buildPages();
  const isBookmarked = bookmarks.includes(currentPage);

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Popup de Versículo */}
      {modalVerse && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setModalVerse(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-blue-800">{modalVerse.ref}</h4>
              <button onClick={() => setModalVerse(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700">{modalVerse.text}</p>
            <button onClick={() => setModalVerse(null)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Sidebar de Marcadores */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Marcadores
          </span>
          <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-60px)]">
          {bookmarks.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum marcador salvo</p>}
          {bookmarks.sort((a, b) => a - b).map(page => (
            <button
              key={page}
              onClick={() => { setCurrentPage(page); setShowSidebar(false); }}
              className="w-full text-left px-3 py-2 bg-blue-50 rounded hover:bg-blue-100 transition text-sm"
            >
              Página {page + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Header Fixo */}
      <div className="sticky top-0 z-40 bg-white border-b p-3 flex justify-between items-center px-4 shadow-sm">
        <button onClick={() => setShowSidebar(true)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 transition">
          MENU
        </button>

        <div className="flex items-center gap-2">
          <button onClick={toggleBookmark} className="p-2 hover:bg-gray-100 rounded transition" title={isBookmarked ? "Remover marcador" : "Adicionar marcador"}>
            <svg className="w-6 h-6" fill={isBookmarked ? "#01579B" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <div className="flex gap-1">
            <button onClick={() => changeFontSize(-10)} className="bg-gray-100 px-3 py-1 rounded font-bold hover:bg-gray-200 transition text-sm">A-</button>
            <button onClick={() => changeFontSize(10)} className="bg-gray-100 px-3 py-1 rounded font-bold hover:bg-gray-200 transition text-sm">A+</button>
          </div>
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="p-4">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition">
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-sm font-medium">Voltar aos trimestres</span>
        </button>
      </div>

      {/* Conteúdo do Livro */}
      <div
        className="max-w-4xl mx-auto px-4 pb-24"
        style={{ fontSize: `${fontSize}%` }}
      >
        {pages[currentPage]}
      </div>

      {/* Footer de Navegação */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center px-6 shadow-lg z-40">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-gray-200 transition disabled:hover:bg-gray-100"
        >
          ← Anterior
        </button>
        <span className="text-xs font-bold text-gray-500">
          Pág. {currentPage + 1} de {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-gray-200 transition disabled:hover:bg-gray-100"
        >
          Próxima →
        </button>
      </footer>
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
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Quarter['lessons'][0] | null>(null);

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
      // Usa o servidor local (mesma porta do Vite/server.ts)
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
        setShowExtractor(false);
        setSumarioUrl('');
        setLoadingProgress('Extração concluída com sucesso!');
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
    localStorage.removeItem('extracted_ebd_data');
  };

  // Se há dados extraídos, mostra o livro dinâmico
  if (extractedData) {
    return <DynamicBook data={extractedData} onBack={clearExtractedData} />;
  }

  // Dados estáticos dos trimestres
  const quartersData: Quarter[] = [
    {
      id: '2026-q1',
      year: 2026,
      quarter: 1,
      title: '1º Trimestre de 2026',
      theme: 'A Igreja de Cristo: Sal e Luz',
      commentator: 'Comentarista: Elinaldo Renovato',
      color: 'from-blue-600 to-blue-800',
      icon: '⛪',
      lessons: [
        { number: 1, title: 'A Igreja: Sal da Terra', date: 'Janeiro', text: 'Conteúdo da Lição 1...' },
        { number: 2, title: 'A Igreja: Luz do Mundo', date: 'Janeiro', text: 'Conteúdo da Lição 2...' },
        { number: 3, title: 'A Igreja e o Reino de Deus', date: 'Fevereiro', text: 'Conteúdo da Lição 3...' },
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
      lessons: [
        { number: 1, title: 'Abraão: Seu Chamado e Sua Jornada de Fé', date: 'Abril', text: 'Conteúdo sobre Abraão...' },
        { number: 2, title: 'Isaque: O Filho da Promessa', date: 'Abril', text: 'Conteúdo sobre Isaque...' },
        { number: 3, title: 'Jacó: Transformado por Deus', date: 'Maio', text: 'Conteúdo sobre Jacó...' },
        { number: 4, title: 'José: Da Cova ao Palácio', date: 'Maio', text: 'Conteúdo sobre José...' },
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
        { number: 2, title: 'Joel: O Dia do Senhor', date: 'Julho', text: 'Conteúdo sobre Joel...' },
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
        { number: 2, title: 'Sal e Luz', date: 'Outubro', text: 'Conteúdo sobre Sal e Luz...' },
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
                onClick={() => setExtractedData(extractedData)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
              >
                <BookOpen className="h-4 w-4" />
                Revista Salva
              </button>
            )}
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
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onClick={() => setSelectedQuarter(quarter)}
              className="cursor-pointer group"
            >
              <div className={cn(
                "relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg",
                "bg-gradient-to-br", quarter.color
              )}>
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
                Clique em "Importar da Web", cole a URL do sumário do trimestre desejado e aguarde a extração das 13 lições.
                O conteúdo será salvo automaticamente e você poderá navegar pela revista digital completa.
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
}

const QuarterView: React.FC<QuarterViewProps> = ({ quarter, onBack, onSelectLesson }) => {
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
              onClick={() => onSelectLesson(lesson)}
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
                "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." - João 3:16
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded">
              <h3 className="text-sm font-bold text-blue-600 mb-2">VERDADE PRÁTICA</h3>
              <p className="text-bible-text">
                Deus demonstrou seu amor supremo ao entregar seu Filho para a salvação da humanidade.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">INTRODUÇÃO</h3>
              <p className="text-bible-text leading-relaxed mb-4">{lesson.text}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">I - PRIMEIRO TÓPICO</h3>
              <p className="text-bible-text leading-relaxed mb-4">
                Aqui será desenvolvido o primeiro ponto principal da lição, com referências bíblicas,
                explicações teológicas e aplicações práticas para a vida cristã.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">II - SEGUNDO TÓPICO</h3>
              <p className="text-bible-text leading-relaxed mb-4">
                O segundo ponto aprofunda ainda mais o tema, trazendo insights importantes
                para o crescimento espiritual e intelectual do estudante.
              </p>
            </div>

            <div className="mb-6 p-4 bg-green-500/10 border-l-4 border-green-500 rounded">
              <h3 className="text-sm font-bold text-green-600 mb-2">CONCLUSÃO</h3>
              <p className="text-bible-text">
                Que possamos aplicar estes ensinamentos em nossas vidas, crescendo na graça
                e no conhecimento de nosso Senhor Jesus Cristo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
