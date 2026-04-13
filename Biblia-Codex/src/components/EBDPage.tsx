import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Calendar, User, Book, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  lessons: Lesson[];
}

interface Lesson {
  number: number;
  title: string;
  date: string;
  text: string;
}

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
      { number: 1, title: 'Abraão: Seu Chamado e Sua Jornada de Fé', date: 'Abril', text: 'Conteúdo completo da Lição 1 sobre Abraão...' },
      { number: 2, title: 'Isaque: O Filho da Promessa', date: 'Abril', text: 'Conteúdo completo da Lição 2 sobre Isaque...' },
      { number: 3, title: 'Jacó: Transformado por Deus', date: 'Maio', text: 'Conteúdo completo da Lição 3 sobre Jacó...' },
      { number: 4, title: 'José: Da Cova ao Palácio', date: 'Maio', text: 'Conteúdo completo da Lição 4 sobre José...' },
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
      { number: 1, title: 'Oseias: O Amor de Deus', date: 'Julho', text: 'Conteúdo da Lição 1...' },
      { number: 2, title: 'Joel: O Dia do Senhor', date: 'Julho', text: 'Conteúdo da Lição 2...' },
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
      { number: 1, title: 'As Bem-Aventuranças', date: 'Outubro', text: 'Conteúdo da Lição 1...' },
      { number: 2, title: 'Sal e Luz', date: 'Outubro', text: 'Conteúdo da Lição 2...' },
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
      { number: 1, title: 'As Visões de Daniel', date: 'Outubro', text: 'Conteúdo da Lição 1...' },
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
      { number: 1, title: 'A Saudação Apostólica', date: 'Julho', text: 'Conteúdo da Lição 1...' },
    ]
  },
];

interface EBDPageProps {
  onBack?: () => void;
}

export const EBDPage: React.FC<EBDPageProps> = ({ onBack }) => {
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  if (selectedLesson && selectedQuarter) {
    return (
      <LessonView 
        quarter={selectedQuarter}
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
      />
    );
  }

  if (selectedQuarter) {
    return (
      <QuarterView 
        quarter={selectedQuarter}
        onBack={() => setSelectedQuarter(null)}
        onSelectLesson={setSelectedLesson}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-bible-text mb-2">
            Escola Bíblica Dominical
          </h1>
          <p className="text-bible-text-muted text-sm md:text-base">
            Lições Bíblicas - Trimestres e Lições
          </p>
        </div>

        {/* Grid de Capas de Livros */}
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
              {/* Capa do Livro */}
              <div className={cn(
                "relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg",
                "bg-gradient-to-br", quarter.color
              )}>
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                
                {/* Conteúdo da capa */}
                <div className="relative h-full flex flex-col justify-between p-4 md:p-6 text-white">
                  {/* Topo */}
                  <div>
                    <div className="text-4xl md:text-5xl mb-2">{quarter.icon}</div>
                    <div className="text-xs md:text-sm font-medium opacity-90">
                      {quarter.title}
                    </div>
                  </div>

                  {/* Centro */}
                  <div className="space-y-2">
                    <h3 className="text-base md:text-lg font-bold leading-tight">
                      {quarter.theme}
                    </h3>
                    <p className="text-xs opacity-80">
                      {quarter.commentator}
                    </p>
                  </div>

                  {/* Rodapé */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <BookOpen className="h-3 w-3" />
                      <span>{quarter.lessons.length} lições</span>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Borda decorativa */}
                <div className="absolute inset-2 border-2 border-white/20 rounded-lg pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Informações */}
        <div className="mt-8 p-4 bg-bible-surface/50 rounded-lg border border-bible-border">
          <div className="flex items-start gap-3">
            <Book className="h-5 w-5 text-bible-accent mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-bible-text mb-1">
                Como usar
              </h3>
              <p className="text-xs text-bible-text-muted">
                Clique em uma capa de trimestre para visualizar as lições disponíveis. 
                Cada trimestre contém lições completas com comentários, planos de aula e material de apoio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuarterViewProps {
  quarter: Quarter;
  onBack: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

const QuarterView: React.FC<QuarterViewProps> = ({ quarter, onBack, onSelectLesson }) => {
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header com botão voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-bible-text-muted hover:text-bible-text mb-6 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-sm">Voltar aos trimestres</span>
        </button>

        {/* Banner do Trimestre */}
        <div className={cn(
          "relative rounded-xl overflow-hidden mb-8 p-6 md:p-8 text-white",
          "bg-gradient-to-br", quarter.color
        )}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          <div className="relative">
            <div className="text-5xl mb-4">{quarter.icon}</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{quarter.theme}</h1>
            <p className="text-sm md:text-base opacity-90">{quarter.title}</p>
            <p className="text-sm opacity-80 mt-1">{quarter.commentary}</p>
          </div>
          <div className="absolute inset-2 border-2 border-white/20 rounded-lg pointer-events-none" />
        </div>

        {/* Lista de Lições */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-bible-text mb-4">
            Lições Disponíveis
          </h2>
          
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
                <p className="text-xs text-bible-text-muted mt-1">
                  {lesson.date}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-bible-text-muted group-hover:text-bible-accent transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface LessonViewProps {
  quarter: Quarter;
  lesson: Lesson;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ quarter, lesson, onBack }) => {
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-bible-bg to-bible-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header com botão voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-bible-text-muted hover:text-bible-text mb-6 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="text-sm">Voltar às lições</span>
        </button>

        {/* Título da Lição */}
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
          <h1 className="text-2xl md:text-3xl font-bold text-bible-text">
            {lesson.title}
          </h1>
          <p className="text-sm text-bible-text-muted mt-1">
            {quarter.theme} - {quarter.commentary}
          </p>
        </div>

        {/* Conteúdo da Lição */}
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
              <h3 className="text-lg font-bold text-bible-text mb-3">LEITURA DIÁRIA</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-bible-bg rounded"><strong>Seg:</strong> Gn 1.1</div>
                <div className="p-2 bg-bible-bg rounded"><strong>Ter:</strong> Jo 1.1-3</div>
                <div className="p-2 bg-bible-bg rounded"><strong>Qua:</strong> Sl 19.1</div>
                <div className="p-2 bg-bible-bg rounded"><strong>Qui:</strong> Rm 1.20</div>
                <div className="p-2 bg-bible-bg rounded"><strong>Sex:</strong> Hb 11.3</div>
                <div className="p-2 bg-bible-bg rounded"><strong>Sáb:</strong> 2 Pe 3.5-7</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">INTRODUÇÃO</h3>
              <p className="text-bible-text leading-relaxed mb-4">
                {lesson.text}
              </p>
              <p className="text-bible-text leading-relaxed mb-4">
                A cada novo trimestre, temos a oportunidade de aprofundar nosso conhecimento na Palavra de Deus. 
                Este material foi preparado com cuidado para auxiliar no seu estudo pessoal e na preparação para a Escola Bíblica Dominical.
              </p>
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

            <div className="mb-6">
              <h3 className="text-lg font-bold text-bible-text mb-3">III - TERCEIRO TÓPICO</h3>
              <p className="text-bible-text leading-relaxed mb-4">
                O terceiro ponto conclui o desenvolvimento do tema, preparando o caminho 
                para a conclusão e aplicação prática.
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
