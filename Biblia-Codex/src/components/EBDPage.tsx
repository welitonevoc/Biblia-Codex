import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ============ COMPONENTE DO LIVRO DINÂMICO (HTML PURO) ============
const DynamicBook: React.FC<{ onBack: () => void; magazineUrl?: string }> = ({ onBack, magazineUrl }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar o conteúdo do HTML gerado
  useEffect(() => {
    const url = magazineUrl || '/EBD/page.txt';
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
          }
        }
      })
      .catch(err => {
        console.error('Erro ao carregar revista:', err);
        setIsLoaded(true);
      });
  }, [magazineUrl]);

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
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Quarter['lessons'][0] | null>(null);
  const [showDynamicBook, setShowDynamicBook] = useState(false);

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
        setMagazineUrl(result.magazineUrl || '/EBD/page.txt');
        localStorage.setItem('extracted_ebd_data', JSON.stringify(result.data));
        setShowExtractor(false);
        setSumarioUrl('');
        setLoadingProgress('Extração concluída com sucesso!');
        // Abre a revista dinamicamente
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
    localStorage.removeItem('extracted_ebd_data');
    setShowDynamicBook(false);
  };

  // Se há dados extraídos e deve mostrar o livro dinâmico
  if (showDynamicBook) {
    return <DynamicBook onBack={clearExtractedData} magazineUrl={magazineUrl || undefined} />;
  }

  // Dados estáticos dos trimestres (1º Trimestre de 2026 com conteúdo real)
  const quartersData: Quarter[] = [
    {
      id: '2026-q1',
      year: 2026,
      quarter: 1,
      title: '1º Trimestre de 2026',
      theme: 'Deus Trino e a Natureza Humana',
      commentator: 'Comentarista: Douglas Baptista',
      color: 'from-blue-600 to-blue-800',
      icon: '✝️',
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
      lessons: [
        { number: 1, title: 'Abraão: Seu Chamado e Sua Jornada de Fé', date: 'Abril', text: 'Conteúdo sobre Abraão...' },
        { number: 2, title: 'Isaque: O Filho da Promessa', date: 'Abril', text: 'Conteúdo sobre Isaque...' },
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
