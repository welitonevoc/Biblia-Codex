import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, History, Bookmark, Calendar, Flame, ChevronRight, Play,
  BookMarked, Clock, Star, Sparkles, ArrowRight
} from 'lucide-react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface HomeProps {
  onNavigate: (book: Book, chapter: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAppContext();
  const [streak] = useState(7);
  const [planDay] = useState(4);
  const [isReadToday, setIsReadToday] = useState(false);

  const lastVerses = [
    { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
    { bookId: 'PSA', chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    { bookId: 'JHN', chapter: 3, verse: 16, text: 'Porque Deus amou o mundo de tal maneira...' },
  ];

  const weekDays = [
    { label: 'S', state: 'read' },
    { label: 'T', state: 'read' },
    { label: 'Q', state: 'read' },
    { label: 'Q', state: 'freeze' },
    { label: 'S', state: 'miss' },
    { label: 'S', state: 'read' },
    { label: 'D', state: isReadToday ? 'read' : 'today' },
  ];

  const handleVerseClick = (verse: typeof lastVerses[number]) => {
    const book = BIBLE_BOOKS.find((entry) => entry.id === verse.bookId);
    if (book) onNavigate(book, verse.chapter);
  };

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Ler a Bíblia',
      subtitle: 'Iniciar leitura',
      action: () => onNavigate(BIBLE_BOOKS[0], 1),
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Flame,
      title: 'Devocional',
      subtitle: 'Dia a dia',
      action: () => { },
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: BookMarked,
      title: 'Planos de Leitura',
      subtitle: 'Organize sua leitura',
      action: () => { },
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Sparkles,
      title: 'Estudo com IA',
      subtitle: 'Aprofunde seu conhecimento',
      action: () => { },
      gradient: 'from-purple-500 to-violet-600',
    },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-6",
            "bg-[var(--surface-1)] border border-[var(--border-bible)]",
            "transition-all duration-300",
            "hover:shadow-lg hover:shadow-[var(--accent-bible)]/5"
          )}
          style={{
            boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.05)'
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
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                  "hover:border-[var(--accent-bible)]/30 hover:shadow-md"
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

        {/* Reading Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl p-5",
            "bg-[var(--surface-1)] border border-[var(--border-bible)]"
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
            <h2 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider">
              Continuar lendo
            </h2>
            <button className="text-xs font-medium text-[var(--accent-bible)] flex items-center gap-1">
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
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                  "text-left transition-all duration-200",
                  "hover:border-[var(--accent-bible)]/30 hover:shadow-sm"
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
            "bg-gradient-to-br from-[var(--accent-bible)]/5 to-[var(--accent-bible)]/10",
            "border border-[var(--accent-bible)]/20"
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
      </div>
    </div>
  );
};