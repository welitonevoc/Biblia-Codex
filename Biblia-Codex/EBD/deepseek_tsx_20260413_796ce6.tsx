// EBDPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Calendar, User, Book, X, Download, Loader2 } from 'lucide-react';
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

// ============ COMPONENTE DO LIVRO DINÂMICO ============
const DynamicBook: React.FC<{ data: ExtractedData; onBack: () => void }> = ({ data, onBack }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(100);
  const [showSidebar, setShowSidebar] = useState(false);
  const [modalVerse, setModalVerse] = useState<{ ref: string; text: string } | null>(null);

  // Carregar marcadores salvos
  useEffect(() => {
    const saved = localStorage.getItem('dynamic_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  // Salvar marcadores
  const saveBookmarks = useCallback((newBookmarks: number[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('dynamic_bookmarks', JSON.stringify(newBookmarks));
  }, []);

  const toggleBookmark = () => {
    const index = bookmarks.indexOf(currentPage);
    if (index === -1) {
      saveBookmarks([...bookmarks, currentPage]);
    } else {
      saveBookmarks(bookmarks.filter((_, i) => i !== index));
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.min(Math.max(fontSize + delta, 80), 150);
    setFontSize(newSize);
    document.documentElement.style.setProperty('--reader-font-size', `${newSize}%`);
  };

  // Função para abrir versículo (simulação)
  const openVerse = (ref: string) => {
    setModalVerse({ ref, text: `Texto bíblico de ${ref} - Conteúdo extraído da Bíblia offline.` });
  };

  // Navegação
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  // Total de páginas: capa (1) + apresentação (1) + sumário (1) + 13 lições + livro apoio (13) + devocionais (13) = 42
  const totalPages = 42;

  // Constrói as páginas
  const buildPages = () => {
    const pages: JSX.Element[] = [];

    // Página 0 - Capa
    pages.push(
      <div key="capa" className="magazine-page">
        <img src="https://i.ibb.co/Gf6fWG0q/Capa.jpg" className="w-full rounded-lg shadow-lg" alt="Capa" />
      </div>
    );

    // Página 1 - Apresentação / Palavra da Editora
    pages.push(
      <div key="apresentacao" className="magazine-page">
        <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center text-blue-800">Palavra da Editora</h2>
          <p className="mt-4">Prezado(a) professor(a),</p>
          <p>Este trimestre é um convite à adoração e ao aprendizado mais profundo sobre a natureza de Deus, que se revela como Pai, Filho e Espírito Santo.</p>
          <p className="mt-4 font-bold text-center">Bom trimestre!</p>
        </div>
      </div>
    );

    // Página 2 - Sumário
    pages.push(
      <div key="sumario" className="magazine-page">
        <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center text-red-700">SUMÁRIO</h2>
          <h3 className="text-xl font-bold text-center">{data.title}</h3>
          <p className="text-center text-gray-600">Comentarista: {data.commentator}</p>
          <div className="mt-6 space-y-2">
            {data.lessons.map(lesson => (
              <div key={lesson.number} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                <span className="font-bold text-blue-600 w-12">Lição {lesson.number}</span>
                <span>{lesson.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // Páginas 3 a 15 - Lições
    data.lessons.forEach((lesson, idx) => {
      pages.push(
        <div key={`lesson-${lesson.number}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            {/* Título da Lição */}
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-1 bg-red-700 text-white rounded-full text-sm font-bold">
                Lição {lesson.number}
              </div>
              <h1 className="text-2xl font-bold mt-2">{lesson.title}</h1>
            </div>

            {/* Texto Áureo */}
            <div className="border-l-4 border-red-500 bg-red-50 p-4 mb-6 rounded">
              <h3 className="font-bold text-red-700">TEXTO ÁUREO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.textAureo }} />
            </div>

            {/* Verdade Prática */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-6 rounded">
              <h3 className="font-bold text-blue-700">VERDADE PRÁTICA</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.verdadePratica }} />
            </div>

            {/* Leitura Diária */}
            <div className="bg-gray-100 p-4 mb-6 rounded">
              <h3 className="font-bold text-center text-gray-800">LEITURA DIÁRIA</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.leituraDiaria }} />
            </div>

            {/* Leitura Bíblica */}
            <div className="bg-amber-50 p-4 mb-6 rounded border border-amber-200">
              <h3 className="font-bold text-center text-amber-800">LEITURA BÍBLICA EM CLASSE</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.leituraBiblica }} />
            </div>

            {/* Introdução */}
            <div className="mb-6">
              <h3 className="font-bold text-lg text-blue-800">INTRODUÇÃO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.introducao }} />
            </div>

            {/* Tópicos */}
            {lesson.topicos.map((topico, i) => (
              <div key={i} className="mb-6">
                <h3 className="font-bold text-lg text-blue-800">{topico.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: topico.content }} />
              </div>
            ))}

            {/* Comentário */}
            <div className="bg-gray-50 p-4 mb-6 rounded border border-gray-200">
              <h3 className="font-bold text-lg text-gray-700">COMENTÁRIO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.comentario }} />
            </div>

            {/* Sinopse */}
            <div className="text-center italic text-green-700 mb-6">
              <div dangerouslySetInnerHTML={{ __html: lesson.sinopse }} />
            </div>

            {/* Conclusão */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-700">CONCLUSÃO</h3>
              <div dangerouslySetInnerHTML={{ __html: lesson.conclusao }} />
            </div>
          </div>
        </div>
      );
    });

    // Páginas 16 a 28 - Capítulos do Livro de Apoio (simuladas)
    for (let i = 1; i <= 13; i++) {
      pages.push(
        <div key={`chapter-${i}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center text-purple-800">Capítulo {i}</h2>
            <p className="text-center text-gray-600 mb-6">{data.lessons[i-1]?.title || `Capítulo ${i}`}</p>
            <div className="space-y-4">
              <p>Conteúdo detalhado do capítulo {i} do livro de apoio "{data.title}".</p>
              <p>Este material complementar aprofunda os temas abordados na lição, trazendo reflexões teológicas adicionais.</p>
            </div>
          </div>
        </div>
      );
    }

    // Páginas 29 a 41 - Devocionais (simulados)
    for (let i = 1; i <= 13; i++) {
      pages.push(
        <div key={`devotional-${i}`} className="magazine-page">
          <div className="prose max-w-none p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center text-teal-800">Devocional - Semana {i}</h2>
            <h3 className="text-xl font-bold text-center mb-4">{data.lessons[i-1]?.title || `Lição ${i}`}</h3>
            <div className="space-y-4">
              <p><strong>📖 Leitura do dia:</strong> Salmo {i}.1-10</p>
              <p><strong>💭 Meditação:</strong> Reflexão sobre a importância da Trindade na vida cristã.</p>
              <p><strong>🙏 Oração:</strong> Pai, que possamos viver em comunhão contigo e com teu Filho, pelo Espírito Santo.</p>
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
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface">
      {/* Popup de Versículo */}
      {modalVerse && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setModalVerse(null)}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-blue-800">{modalVerse.ref}</h4>
              <button onClick={() => setModalVerse(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="text-gray-700">{modalVerse.text}</p>
            <button onClick={() => setModalVerse(null)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Fechar</button>
          </div>
        </div>
      )}

      {/* Sidebar de Marcadores */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold">Marcadores</span>
          <button onClick={() => setShowSidebar(false)} className="text-red-600">✕</button>
        </div>
        <div className="p-4 space-y-2">
          {bookmarks.length === 0 && <p className="text-gray-400 text-center">Nenhum marcador</p>}
          {bookmarks.sort((a,b) => a-b).map(page => (
            <button
              key={page}
              onClick={() => { setCurrentPage(page); setShowSidebar(false); }}
              className="w-full text-left px-3 py-2 bg-blue-100 rounded hover:bg-blue-200"
            >
              Página {page + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Header Fixo */}
      <div className="sticky top-0 z-40 bg-white border-b p-3 flex justify-between items-center px-4 shadow-sm">
        <button onClick={() => setShowSidebar(true)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">
          MENU
        </button>
        
        <button onClick={toggleBookmark} className="p-2">
          <svg className="w-6 h-6" fill={isBookmarked ? "#01579B" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        <div className="flex gap-2">
          <button onClick={() => changeFontSize(-10)} className="bg-gray-100 px-3 py-1 rounded font-bold">A-</button>
          <button onClick={() => changeFontSize(10)} className="bg-gray-100 px-3 py-1 rounded font-bold">A+</button>
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="p-4">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Voltar aos trimestres</span>
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center px-6 shadow-md z-40">
        <button onClick={prevPage} disabled={currentPage === 0} className="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Anterior
        </button>
        <span className="text-xs font-bold text-gray-400">Pág. {currentPage + 1} de {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages - 1} className="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50">
          Próxima
        </button>
      </footer>
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL ============
export const EBDPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [showExtractor, setShowExtractor] = useState(false);
  const [sumarioUrl, setSumarioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem('extracted_book_data');
    if (saved) {
      try {
        setExtractedData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleExtract = async () => {
    if (!sumarioUrl) {
      alert('Por favor, insira a URL do sumário');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3333/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sumarioUrl })
      });

      const result = await response.json();
      if (result.success) {
        setExtractedData(result.data);
        localStorage.setItem('extracted_book_data', JSON.stringify(result.data));
        setShowExtractor(false);
      } else {
        alert('Erro na extração: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor. Certifique-se que o backend está rodando na porta 3333.');
    } finally {
      setLoading(false);
    }
  };

  // Se há dados extraídos, mostra o livro dinâmico
  if (extractedData) {
    return <DynamicBook data={extractedData} onBack={() => setExtractedData(null)} />;
  }

  // Dados estáticos dos trimestres (seu array original)
  const quartersData = [
    // ... seus trimestres originais
    {
      id: '2026-q1',
      year: 2026,
      quarter: 1,
      title: '1º Trimestre de 2026',
      theme: 'A Igreja de Cristo: Sal e Luz',
      commentator: 'Comentarista: Elinaldo Renovato',
      color: 'from-blue-600 to-blue-800',
      icon: '⛪',
      lessons: []
    },
    // ... outros trimestres
  ];

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
          <button
            onClick={() => setShowExtractor(!showExtractor)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {showExtractor ? 'Cancelar' : 'Importar da Web'}
          </button>
        </div>

        {/* Extractor UI */}
        {showExtractor && (
          <div className="mb-8 p-6 border rounded-xl bg-white shadow-lg">
            <h3 className="text-lg font-bold mb-4">Extrair Conteúdo do Site CPAD</h3>
            <p className="text-sm text-gray-600 mb-4">
              Insira a URL do sumário do trimestre desejado. Exemplo:<br />
              <code className="bg-gray-100 px-2 py-1 rounded">https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm</code>
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
              <p className="text-sm text-gray-500 mt-3 text-center">
                ⏳ Extraindo as 13 lições... Isso pode levar alguns segundos.
              </p>
            )}
          </div>
        )}

        {/* Grid de Capas dos Trimestres (original) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {quartersData.map((quarter, index) => (
            <motion.div
              key={quarter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
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
            <Book className="h-5 w-5 text-bible-accent mt-0.5" />
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