import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, History, Bookmark, Calendar, Flame, ChevronRight, Play,
  BookMarked, Clock, Star, Sparkles, ArrowRight,
  PenLine, Search, Map, Languages, GraduationCap, Tags, Settings
} from 'lucide-react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';
import { cn } from '../utils/cn';

interface HomeProps {
  onNavigate: (book: Book, chapter: number, verse?: number) => void;
  goToReadingPlans?: () => void;
  goToDevocional?: () => void;
  goToAI?: () => void;
  goToNotes?: () => void;
  goToBookmarks?: () => void;
  goToTags?: () => void;
  goToSearch?: () => void;
  goToEBD?: () => void;
  goToMaps?: () => void;
  goToDictionaries?: () => void;
  goToSettings?: () => void;
  goToBible?: () => void;
}

export const Home: React.FC<HomeProps> = React.memo(({ 
  onNavigate, 
  goToReadingPlans, 
  goToDevocional, 
  goToAI,
  goToNotes,
  goToBookmarks,
  goToTags,
  goToSearch,
  goToEBD,
  goToMaps,
  goToDictionaries,
  goToSettings,
  goToBible,
}) => {
  const { user } = useAppContext();
  const [streak] = useState(7);
  const [planDay] = useState(4);
  const [isReadToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verse of the Day Data
  const dailyVerses = useMemo(() => [
    { bookId: 'JHN', chapter: 3, verse: 16, text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.', ref: 'João 3:16' },
    { bookId: 'ROM', chapter: 8, verse: 28, text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.', ref: 'Romanos 8:28' },
    { bookId: 'PHL', chapter: 4, verse: 13, text: 'Posso todas as coisas naquele que me fortalece.', ref: 'Filipenses 4:13' },
    { bookId: 'PSA', chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.', ref: 'Salmos 23:1' },
    { bookId: 'ISA', chapter: 41, verse: 10, text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.', ref: 'Isaías 41:10' }
  ], []);

  const dailyVerse = useMemo(() => {
    const day = new Date().getDate();
    return dailyVerses[day % dailyVerses.length];
  }, [dailyVerses]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const lastVerses = useMemo(() => [
    { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
    { bookId: 'PSA', chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    { bookId: 'JHN', chapter: 3, verse: 16, text: 'Porque Deus amou o mundo de tal maneira...' },
  ], []);

  const weekDays = useMemo(() => [
    { label: 'S', state: 'read' },
    { label: 'T', state: 'read' },
    { label: 'Q', state: 'read' },
    { label: 'Q', state: 'freeze' },
    { label: 'S', state: 'miss' },
    { label: 'S', state: 'read' },
    { label: 'D', state: isReadToday ? 'read' : 'today' },
  ], [isReadToday]);

  const handleVerseClick = useCallback((verse: { bookId: string, chapter: number, verse?: number }) => {
    const book = BIBLE_BOOKS.find((entry) => entry.id === verse.bookId);
    if (book) onNavigate(book, verse.chapter, verse.verse || 1);
  }, [onNavigate]);

  const quickActions = useMemo(() => [
    {
      icon: BookOpen,
      title: 'Ler a Bíblia',
      subtitle: 'Iniciar leitura',
      action: () => goToBible?.() || onNavigate(BIBLE_BOOKS[0], 1, 1),
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Flame,
      title: 'Devocional',
      subtitle: 'Dia a dia',
      action: () => goToDevocional?.(),
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: BookMarked,
      title: 'Planos de Leitura',
      subtitle: 'Organize sua leitura',
      action: () => goToReadingPlans?.(),
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Sparkles,
      title: 'Estudo com IA',
      subtitle: 'Aprofunde seu conhecimento',
      action: () => goToAI?.(),
      gradient: 'from-purple-500 to-violet-600',
    },
  ], [onNavigate, goToDevocional, goToReadingPlans, goToAI]);

  const secondaryActions = useMemo(() => [
    {
      icon: PenLine,
      title: 'Notas',
      subtitle: 'Suas anotações',
      action: () => goToNotes?.(),
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: Bookmark,
      title: 'Marcadores',
      subtitle: 'Versículos salvos',
      action: () => goToBookmarks?.(),
      gradient: 'from-teal-500 to-cyan-600',
    },
    {
      icon: Tags,
      title: 'Tags',
      subtitle: 'Organizar versículos',
      action: () => goToTags?.(),
      gradient: 'from-yellow-500 to-amber-600',
    },
    {
      icon: Search,
      title: 'Buscar',
      subtitle: 'Pesquisar na Bíblia',
      action: () => goToSearch?.(),
      gradient: 'from-sky-500 to-blue-600',
    },
  ], [goToNotes, goToBookmarks, goToTags, goToSearch]);

  const explorerActions = useMemo(() => [
    {
      icon: GraduationCap,
      title: 'EBD',
      subtitle: 'Escola Bíblica',
      action: () => goToEBD?.(),
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      icon: Map,
      title: 'Mapas Bíblicos',
      subtitle: 'Lugares sagrados',
      action: () => goToMaps?.(),
      gradient: 'from-cyan-500 to-sky-600',
    },
    {
      icon: Languages,
      title: 'Dicionários',
      subtitle: 'Hebraico e Grego',
      action: () => goToDictionaries?.(),
      gradient: 'from-fuchsia-500 to-purple-600',
    },
    {
      icon: Settings,
      title: 'Configurações',
      subtitle: 'Preferências do app',
      action: () => goToSettings?.(),
      gradient: 'from-slate-500 to-gray-600',
    },
  ], [goToEBD, goToMaps, goToDictionaries, goToSettings]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-[var(--bg-bible)]">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-8">
        
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-[var(--surface-2)] rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[var(--surface-1)] rounded-xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Header Premium */}
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={cn(
                   "relative overflow-hidden rounded-2xl p-6",
                   "premium-card-strong transition-all duration-300",
                   "hover:shadow-xl hover:border-[var(--accent-bible)]/20"
                 )}
                 style={{
                   boxShadow: 'var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.05)'
                 }}
               >
              {/* Decorative gradient */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(ellipse at top right, var(--accent-bible) 0%, transparent 60%)'
                }}
              />
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                      "text-[10px] font-bold uppercase tracking-wider",
                      "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
                    )}>
                      <Sparkles className="w-3 h-3" />
                      Bem-vindo
                    </span>
                  </div>
                  <h1 className={cn(
                    "text-3xl md:text-4xl font-bold text-[var(--text-bible)]",
                    "leading-tight tracking-tight"
                  )} style={{ fontFamily: 'var(--font-display)' }}>
                    Olá, {user?.displayName?.split(' ')[0] || 'leitor'}
                  </h1>
                  <p className="mt-2 text-[var(--text-bible-muted)] text-sm max-w-xs">
                    Continue sua jornada de fé e conhecimento
                  </p>
                </div>
                
                <div className="hidden sm:flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "text-center px-4 py-3 rounded-xl",
                      "bg-gradient-to-br from-orange-500/10 to-amber-500/10",
                      "border border-orange-500/20"
                    )}
                  >
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-orange-600">{streak}</div>
                    <div className="text-[10px] font-medium text-orange-400/80">dias</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "text-center px-4 py-3 rounded-xl",
                      "bg-gradient-to-br from-blue-500/10 to-indigo-500/10",
                      "border border-blue-500/20"
                    )}
                  >
                    <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-blue-600">{planDay}</div>
                    <div className="text-[10px] font-medium text-blue-400/80">dia</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Verse of the Day - Premium Card */}
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.1 }}
                 className={cn(
                   "relative overflow-hidden rounded-3xl p-8 text-center",
                   "premium-card-strong border border-[var(--border-bible-strong)]/20",
                   "shadow-xl hover:shadow-2xl transition-all duration-300"
                 )}
               >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-20 h-20 text-[var(--accent-bible)]" />
              </div>
              
              <span className="premium-kicker mb-4 mx-auto">Versículo do Dia</span>
              <blockquote className="relative">
                <p className="text-xl md:text-2xl font-serif text-[var(--text-bible)] leading-relaxed italic mb-6">
                  "{dailyVerse.text}"
                </p>
                <cite className="not-italic block mt-4">
                  <button 
                    onClick={() => {
                      const book = BIBLE_BOOKS.find(b => b.id === dailyVerse.bookId);
                      if (book) onNavigate(book, dailyVerse.chapter);
                    }}
                    className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-bible)]/10 text-[var(--accent-bible)] font-bold text-sm hover:bg-[var(--accent-bible)] hover:text-white transition-all"
                  >
                    {dailyVerse.ref}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </cite>
              </blockquote>
            </motion.div>

            {/* Quick Actions */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {quickActions.map((action, index) => {
                   const Icon = action.icon;
                   return (
                     <motion.button
                       key={action.title}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.05 }}
                       whileHover={{ scale: 1.02, y: -2 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={action.action}
                       className={cn(
                         "group relative overflow-hidden rounded-xl p-4",
                         "text-left transition-all duration-300",
                         "premium-card hover:premium-card-strong",
                         "hover:shadow-lg hover:border-[var(--accent-bible)]/30"
                       )}
                     >
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-br", action.gradient
                    )} />
                    <div className="relative">
                      <div className={cn(
                        "w-10 h-10 rounded-xl mb-3 flex items-center justify-center",
                        "bg-gradient-to-br", action.gradient,
                        "text-white shadow-lg"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-bible)]">
                        {action.title}
                      </h3>
                      <p className="text-xs text-[var(--text-bible-muted)]">
                        {action.subtitle}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

             {/* Ferramentas de Estudo */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.15 }}
             >
               <h2 className="premium-section-title !text-[11px] mb-3">
                 Ferramentas de Estudo
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {secondaryActions.map((action, index) => {
                   const Icon = action.icon;
                   return (
                     <motion.button
                       key={action.title}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 + index * 0.05 }}
                       whileHover={{ scale: 1.02, y: -2 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={action.action}
                       className={cn(
                         'group relative overflow-hidden rounded-xl p-4',
                         'text-left transition-all duration-300',
                         'premium-card hover:premium-card-strong',
                         'hover:shadow-lg'
                       )}
                     >
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                        'bg-gradient-to-br', action.gradient
                      )} />
                      <div className="relative">
                        <div className={cn(
                          'w-10 h-10 rounded-xl mb-3 flex items-center justify-center',
                          'bg-gradient-to-br', action.gradient,
                          'text-white shadow-lg'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-bible)]">{action.title}</h3>
                        <p className="text-xs text-[var(--text-bible-muted)]">{action.subtitle}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

             {/* Explorar */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
               <h2 className="premium-section-title !text-[11px] mb-3">
                 Explorar
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {explorerActions.map((action, index) => {
                   const Icon = action.icon;
                   return (
                     <motion.button
                       key={action.title}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 + index * 0.05 }}
                       whileHover={{ scale: 1.02, y: -2 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={action.action}
                       className={cn(
                         'group relative overflow-hidden rounded-xl p-4',
                         'text-left transition-all duration-300',
                         'premium-card hover:premium-card-strong',
                         'hover:shadow-lg'
                       )}
                     >
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                        'bg-gradient-to-br', action.gradient
                      )} />
                      <div className="relative">
                        <div className={cn(
                          'w-10 h-10 rounded-xl mb-3 flex items-center justify-center',
                          'bg-gradient-to-br', action.gradient,
                          'text-white shadow-lg'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-bible)]">{action.title}</h3>
                        <p className="text-xs text-[var(--text-bible-muted)]">{action.subtitle}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

             {/* Reading Progress */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className={cn(
                 "rounded-2xl p-5",
                 "premium-card-strong"
               )}
             >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[var(--text-bible)]">
                  Semana de Leitura
                </h2>
                <span className="text-xs font-medium text-[var(--text-bible-muted)]">
                  4 de 7 dias
                </span>
              </div>
              
              <div className="flex justify-between gap-2">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                        day.state === 'read' && "bg-[var(--success-bible)] text-white",
                        day.state === 'today' && "bg-[var(--accent-bible)] text-white animate-pulse",
                        day.state === 'freeze' && "bg-blue-400/20 text-blue-400 border border-blue-400/30",
                        day.state === 'miss' && "bg-red-400/20 text-red-400 border border-red-400/30"
                      )}
                    >
                      {day.label}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>

             {/* Last Read Verses */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               <div className="flex items-center justify-between mb-3">
                 <h2 className="premium-section-title !text-[11px]">
                   Continuar lendo
                 </h2>
                 <button className="text-xs font-medium text-[var(--accent-bible)] flex items-center gap-1 cursor-pointer" aria-label="Ver todos os versículos lidos">
                   Ver todos <ChevronRight className="w-3 h-3" />
                 </button>
               </div>
               
               <div className="space-y-2">
                 {lastVerses.map((verse, index) => (
                   <motion.button
                     key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.35 + index * 0.05 }}
                     whileHover={{ scale: 1.01, x: 4 }}
                     onClick={() => handleVerseClick(verse)}
                     className={cn(
                       "w-full flex items-center gap-4 p-4 rounded-xl",
                       "premium-card text-left transition-all duration-200",
                       "hover:premium-card-strong hover:shadow-md"
                     )}
                   >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
                    )}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--accent-bible)] uppercase tracking-wide">
                        {BIBLE_BOOKS.find(b => b.id === verse.bookId)?.abbreviation} {verse.chapter}:{verse.verse}
                      </div>
                      <p className="text-sm text-[var(--text-bible)] truncate mt-0.5">
                        {verse.text}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-bible-muted)]" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

             {/* Continue from where you left off */}
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className={cn(
                 "relative overflow-hidden rounded-2xl p-6",
                 "premium-card-strong border-[var(--accent-bible)]/20",
                 "hover:shadow-xl transition-all duration-300"
               )}
             >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-bible)] mb-1">
                    Continuar Salmos 23
                  </h3>
                  <p className="text-sm text-[var(--text-bible-muted)]">
                    Você parou no versículo 4 • 5 min restantes
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl",
                    "bg-[var(--accent-bible)] text-white font-medium text-sm",
                    "shadow-lg shadow-[var(--accent-bible)]/30",
                    "hover:bg-[var(--accent-bible-strong)] transition-all duration-200"
                  )}
                >
                  <Play className="w-4 h-4" />
                  Continuar
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
});