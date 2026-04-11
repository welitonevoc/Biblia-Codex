import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, History, Bookmark, Calendar, Flame, ChevronRight, Play,
  BookMarked, Clock, Star, Sparkles, ArrowRight
} from 'lucide-react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="premium-kicker">
                  <Sparkles className="w-3 h-3" />
                  Bem-vindo
                </span>
              </div>
              <h1 className="premium-title mt-2 mb-1">
                Olá, {user?.displayName?.split(' ')[0] || 'leitor'}
              </h1>
              <p className="premium-subtitle text-sm">
                Continue sua jornada de fé e conhecimento
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-600">{streak}</div>
                <div className="text-[10px] font-medium text-orange-600/70 uppercase tracking-wider">dias</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-bible-accent/10">
                <Calendar className="w-5 h-5 text-bible-accent mx-auto mb-1" />
                <div className="text-lg font-bold text-bible-accent">{planDay}</div>
                <div className="text-[10px] font-medium text-bible-accent/70 uppercase tracking-wider">dia</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Week Streak Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-bible-text">Progresso semanal</h3>
              <p className="text-xs text-bible-text-muted mt-0.5">Mantenha sua sequência!</p>
            </div>
            <div className="premium-chip">
              <Star className="w-3 h-3" />
              {Math.round((weekDays.filter(d => d.state === 'read').length / 7) * 100)}%
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const colors = {
                read: 'bg-gradient-to-br from-bible-accent to-bible-accent-strong text-white shadow-md',
                today: 'border-2 border-bible-accent text-bible-accent bg-bible-accent/5',
                freeze: 'bg-blue-500/15 text-blue-600',
                miss: 'bg-red-500/15 text-red-600',
                empty: 'bg-bible-surface',
              };
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${colors[day.state as keyof typeof colors]}`}
                >
                  {day.label}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Continue Reading Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-bible-text">Continue lendo</h3>
              <p className="text-xs text-bible-text-muted mt-0.5">Retome de onde parou</p>
            </div>
            <button className="premium-chip">
              Ver tudo
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {lastVerses.map((verse, i) => {
              const book = BIBLE_BOOKS.find(b => b.id === verse.bookId);
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => handleVerseClick(verse)}
                  className="w-full premium-card p-4 hover:bg-bible-surface-strong transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-bible-accent" />
                        <span className="text-xs font-semibold text-bible-accent">{book?.name} {verse.chapter}:{verse.verse}</span>
                      </div>
                      <p className="text-sm text-bible-text line-clamp-2 leading-relaxed font-serif">{verse.text}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions Premium Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-bible-text mb-4">Ações rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="premium-card p-4 text-left group hover:shadow-lg transition-all overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white mb-3 shadow-lg`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-bible-text mb-0.5">{action.title}</div>
                <div className="text-xs text-bible-text-muted">{action.subtitle}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Links Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-2"
        >
          {['Notas', 'Marcadores', 'Planos', 'Mapas', 'Dicionário', 'Comentários'].map((item, i) => (
            <motion.button
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="premium-chip px-4 py-2 text-xs font-semibold"
            >
              {item}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};