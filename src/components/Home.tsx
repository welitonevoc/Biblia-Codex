import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, History, Sparkles, Bookmark,
  ChevronRight, Play, Calendar, Flame,
  CheckCircle2, Snowflake, Share2, Sunrise, Library
} from 'lucide-react';
import { Book } from '../types';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { useAppContext } from '../AppContext';

interface HomeProps {
  onNavigate: (book: Book, chapter: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user } = useAppContext();
  const [streak, setStreak] = useState(7);
  const [freezes] = useState(2);
  const [planDay] = useState(4);
  const [isReadToday, setIsReadToday] = useState(false);

  const lastVerses = [
    { bookId: 'GEN', chapter: 1, verse: 1, text: 'No princípio criou Deus os céus e a terra.' },
    { bookId: 'PSA', chapter: 23, verse: 1, text: 'O Senhor é o meu pastor, nada me faltará.' },
    { bookId: 'JHN', chapter: 3, verse: 16, text: 'Porque Deus amou o mundo de tal maneira...' },
  ];

  const readingPlans = [
    { id: 'chrono', name: 'Plano Cronológico', progress: 45, total: 365 },
    { id: 'nt', name: 'Novo Testamento em 90 dias', progress: 12, total: 90 },
    { id: 'psalms', name: 'Salmos para a alma', progress: 8, total: 30 },
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

  const handleLastVerseClick = (verse: typeof lastVerses[number]) => {
    const book = BIBLE_BOOKS.find((entry) => entry.id === verse.bookId);
    if (book) onNavigate(book, verse.chapter);
  };

  const handleReadToday = () => {
    if (!isReadToday) {
      setIsReadToday(true);
      setStreak((current) => current + 1);
    }
  };

  return (
    <div className="h-full overflow-y-auto premium-page premium-scroll">
      <div className="premium-page__content max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-hero"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-5">
              <span className="premium-kicker">
                <Sunrise className="h-4 w-4" />
                Jornada Devocional
              </span>
              <div className="space-y-3">
                <h1 className="premium-title">
                  Bom dia, {user?.displayName ? user.displayName.split(' ')[0] : 'leitor'}.
                </h1>
                <p className="premium-subtitle">
                  Continue sua rotina com uma leitura mais serena, bonita e consistente. Sua sequência está viva e o app inteiro agora gira em torno da Palavra.
                </p>
              </div>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <div className="premium-card-soft rounded-[28px] p-4">
                <div className="premium-section-title opacity-75">Sequência</div>
                <div className="mt-3 flex items-end gap-2">
                  <Flame className="h-5 w-5 text-gold" />
                  <span className="font-display text-4xl font-semibold">{streak}</span>
                </div>
                <div className="ui-text mt-2 text-xs text-bible-text/55">dias seguidos</div>
              </div>
              <div className="premium-card-soft rounded-[28px] p-4">
                <div className="premium-section-title opacity-75">Plano</div>
                <div className="mt-3 font-display text-4xl font-semibold">{planDay}</div>
                <div className="ui-text mt-2 text-xs text-bible-text/55">dia atual</div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="premium-card space-y-6 rounded-[36px] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="premium-icon-button rounded-2xl">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="premium-section-title">Ritmo da Semana</div>
                  <p className="ui-text mt-1 text-sm text-bible-text/55">Acompanhe constância, pausas e recuperação.</p>
                </div>
              </div>
              <div className="premium-chip">{freezes} congelamentos</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const stateClasses =
                  day.state === 'read'
                    ? 'bg-bible-accent text-bible-bg shadow-[0_18px_34px_-24px_rgba(var(--accent-bible-rgb),0.9)]'
                    : day.state === 'today'
                      ? 'border border-bible-accent/30 bg-bible-accent/10 text-bible-accent'
                      : day.state === 'freeze'
                        ? 'bg-[rgba(82,145,255,0.12)] text-[rgb(82,145,255)]'
                        : day.state === 'miss'
                          ? 'bg-[rgba(204,93,93,0.12)] text-[rgb(204,93,93)]'
                          : 'bg-bible-accent/5 text-bible-text/45';

                return (
                  <div key={`${day.label}-${index}`} className={`flex aspect-square flex-col items-center justify-center rounded-[22px] ${stateClasses}`}>
                    <span className="ui-text text-[10px] font-extrabold opacity-75">{day.label}</span>
                    {day.state === 'read' && <CheckCircle2 className="h-4 w-4" />}
                    {day.state === 'freeze' && <Snowflake className="h-4 w-4" />}
                    {day.state === 'miss' && <span className="text-xs font-black">×</span>}
                    {day.state === 'today' && <span className="h-1.5 w-1.5 rounded-full bg-bible-accent" />}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Capítulos lidos', value: planDay + 12, icon: BookOpen },
                { label: 'Versículos salvos', value: 28, icon: Bookmark },
                { label: 'Sessões recentes', value: 5, icon: History },
              ].map((item) => (
                <div key={item.label} className="premium-card-soft rounded-[28px] p-4">
                  <item.icon className="h-5 w-5 text-gold" />
                  <div className="mt-4 font-display text-3xl font-semibold">{item.value}</div>
                  <div className="ui-text mt-1 text-xs text-bible-text/55">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="premium-card-strong flex min-h-[420px] flex-col justify-between rounded-[36px] p-6 md:p-8">
            <div className="space-y-4">
              <span className="premium-kicker">Versículo do Dia</span>
              <blockquote className="bible-text px-0 text-[1.25rem] italic leading-relaxed md:text-[1.55rem]">
                "Bem-aventurado o homem que não anda no conselho dos ímpios, mas medita na sua lei dia e noite."
              </blockquote>
              <div className="ui-text text-xs font-extrabold uppercase tracking-[0.22em] text-bible-text/55">Salmos 1:1-2</div>
            </div>

            <div className="space-y-3 pt-8">
              <button
                onClick={handleReadToday}
                disabled={isReadToday}
                className={cn(
                  "premium-button w-full px-5 py-4 ui-text text-[11px] font-extrabold uppercase tracking-[0.22em]",
                  isReadToday && "opacity-65"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {isReadToday ? <CheckCircle2 className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                  {isReadToday ? 'Lido Hoje' : 'Marcar como Lido'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="premium-button-secondary px-4 py-3">
                  <Share2 className="mx-auto h-4 w-4" />
                </button>
                <button className="premium-button-secondary px-4 py-3">
                  <Bookmark className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="premium-card space-y-6 rounded-[36px] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="premium-section-title">Planos de Leitura</div>
                <p className="ui-text mt-1 text-sm text-bible-text/55">Continue de onde parou, sem ruído visual.</p>
              </div>
              <div className="premium-icon-button rounded-2xl">
                <Calendar className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-4">
              {readingPlans.map((plan) => (
                <div key={plan.id} className="premium-card-soft rounded-[28px] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bible-accent/10 text-bible-accent">
                        <Library className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="ui-text text-sm font-bold">{plan.name}</div>
                        <div className="ui-text mt-1 text-xs text-bible-text/50">{plan.progress}/{plan.total} dias</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-bible-text/35" />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-bible-accent/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(plan.progress / plan.total) * 100}%` }}
                      className="h-full rounded-full bg-bible-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="premium-card space-y-6 rounded-[36px] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="premium-section-title">Histórico Recente</div>
                <p className="ui-text mt-1 text-sm text-bible-text/55">Retome rapidamente seus últimos pontos de leitura.</p>
              </div>
              <div className="premium-icon-button rounded-2xl">
                <History className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              {lastVerses.map((verse) => (
                <button
                  key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
                  onClick={() => handleLastVerseClick(verse)}
                  className="premium-card-soft flex w-full items-center gap-4 rounded-[26px] p-4 text-left transition-all hover:border-bible-accent/20"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bible-accent/10 text-bible-accent">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="ui-text text-sm font-bold">{verse.bookId} {verse.chapter}:{verse.verse}</div>
                    <div className="ui-text mt-1 truncate text-xs text-bible-text/50">{verse.text}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-bible-text/30" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ');
}
