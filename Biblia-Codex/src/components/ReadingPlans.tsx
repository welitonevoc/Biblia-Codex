import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Play, Library, CheckCircle2, Plus, X, ChevronRight, Calendar, Clock, BookOpen, Sparkles, Target, ArrowRight, ArrowLeft, Flame, Trophy, Star, Zap, Crown, ChevronDown, Settings, Users, Globe, Heart, Sun, Moon, BookText } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalDays: number;
  currentDay: number;
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  icon: React.ElementType;
  gradient: string;
  type: 'canonical' | 'chronological' | 'thematic' | 'devotional' | 'custom';
  color: string;
  completedBooks: string[];
  startDate?: string;
  lastReadDate?: string;
}

const BIBLE_BOOKS = [
  { name: 'Gênesis', abbrev: 'gn', chapters: 50 },
  { name: 'Êxodo', abbrev: 'ex', chapters: 40 },
  { name: 'Levítico', abbrev: 'lv', chapters: 27 },
  { name: 'Números', abbrev: 'nm', chapters: 36 },
  { name: 'Deuteronômio', abbrev: 'dt', chapters: 34 },
  { name: 'Josué', abbrev: 'js', chapters: 24 },
  { name: 'Juízes', abbrev: 'jz', chapters: 21 },
  { name: 'Rute', abbrev: 'rt', chapters: 4 },
  { name: '1 Samuel', abbrev: '1sm', chapters: 31 },
  { name: '2 Samuel', abbrev: '2sm', chapters: 24 },
  { name: '1 Reis', abbrev: '1rs', chapters: 22 },
  { name: '2 Reis', abbrev: '2rs', chapters: 25 },
  { name: '1 Crônicas', abbrev: '1cr', chapters: 29 },
  { name: '2 Crônicas', abbrev: '2cr', chapters: 36 },
  { name: 'Esdras', abbrev: 'ed', chapters: 10 },
  { name: 'Neemias', abbrev: 'ne', chapters: 13 },
  { name: 'Ester', abbrev: 'et', chapters: 10 },
  { name: 'Jó', abbrev: 'job', chapters: 42 },
  { name: 'Salmos', abbrev: 'sl', chapters: 150 },
  { name: 'Provérbios', abbrev: 'pv', chapters: 31 },
  { name: 'Eclesiastes', abbrev: 'ec', chapters: 12 },
  { name: 'Cânticos', abbrev: 'ct', chapters: 8 },
  { name: 'Isaías', abbrev: 'is', chapters: 66 },
  { name: 'Jeremias', abbrev: 'jr', chapters: 52 },
  { name: 'Lamentações', abbrev: 'lm', chapters: 5 },
  { name: 'Ezequiel', abbrev: 'ez', chapters: 48 },
  { name: 'Daniel', abbrev: 'dn', chapters: 12 },
  { name: 'Oséias', abbrev: 'os', chapters: 14 },
  { name: 'Joel', abbrev: 'jl', chapters: 3 },
  { name: 'Amós', abbrev: 'am', chapters: 9 },
  { name: 'Obadias', abbrev: 'ob', chapters: 1 },
  { name: 'Jonas', abbrev: 'jn', chapters: 4 },
  { name: 'Miquéias', abbrev: 'mq', chapters: 7 },
  { name: 'Naum', abbrev: 'na', chapters: 3 },
  { name: 'Habacuque', abbrev: 'hc', chapters: 3 },
  { name: 'Sofonias', abbrev: 'sf', chapters: 3 },
  { name: 'Ageu', abbrev: 'ag', chapters: 2 },
  { name: 'Zacarias', abbrev: 'zc', chapters: 14 },
  { name: 'Malaquias', abbrev: 'ml', chapters: 4 },
  { name: 'Mateus', abbrev: 'mt', chapters: 28 },
  { name: 'Marcos', abbrev: 'mc', chapters: 16 },
  { name: 'Lucas', abbrev: 'lc', chapters: 24 },
  { name: 'João', abbrev: 'jo', chapters: 21 },
  { name: 'Atos', abbrev: 'at', chapters: 28 },
  { name: 'Romanos', abbrev: 'rm', chapters: 16 },
  { name: '1 Coríntios', abbrev: '1co', chapters: 16 },
  { name: '2 Coríntios', abbrev: '2co', chapters: 13 },
  { name: 'Gálatas', abbrev: 'gl', chapters: 6 },
  { name: 'Efésios', abbrev: 'ef', chapters: 6 },
  { name: 'Filipenses', abbrev: 'fp', chapters: 4 },
  { name: 'Colossenses', abbrev: 'cl', chapters: 4 },
  { name: '1 Tessalonicenses', abbrev: '1ts', chapters: 5 },
  { name: '2 Tessalonicenses', abbrev: '2ts', chapters: 3 },
  { name: '1 Timóteo', abbrev: '1tm', chapters: 6 },
  { name: '2 Timóteo', abbrev: '2tm', chapters: 4 },
  { name: 'Tito', abbrev: 'tt', chapters: 3 },
  { name: 'Filemom', abbrev: 'fm', chapters: 1 },
  { name: 'Hebreus', abbrev: 'hb', chapters: 13 },
  { name: 'Tiago', abbrev: 'tg', chapters: 5 },
  { name: '1 Pedro', abbrev: '1pe', chapters: 5 },
  { name: '2 Pedro', abbrev: '2pe', chapters: 3 },
  { name: '1 João', abbrev: '1jo', chapters: 5 },
  { name: '2 João', abbrev: '2jo', chapters: 1 },
  { name: '3 João', abbrev: '3jo', chapters: 1 },
  { name: 'Judas', abbrev: 'jd', chapters: 1 },
  { name: 'Apocalipse', abbrev: 'ap', chapters: 22 },
];

const PRESET_PLANS: Omit<ReadingPlan, 'streak' | 'longestStreak' | 'xp' | 'level' | 'currentDay' | 'completedBooks'>[] = [
  {
    id: 'canonical-365',
    title: 'Bíblia em 1 Ano',
    description: 'Leia a Bíblia completa em 365 dias - ordem canônica',
    totalDays: 365,
    progress: 0,
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    type: 'canonical',
    color: 'blue',
  },
  {
    id: 'chronological-365',
    title: 'Bíblia Cronológica',
    description: 'Leia na ordem histórica dos eventos',
    totalDays: 365,
    progress: 0,
    icon: Clock,
    gradient: 'from-amber-500 to-orange-600',
    type: 'chronological',
    color: 'amber',
  },
  {
    id: 'thematic-365',
    title: 'Plano Temático',
    description: 'VT + NT + Salmosdiariamente - varietygarantido',
    totalDays: 365,
    progress: 0,
    icon: Compass,
    gradient: 'from-emerald-500 to-teal-600',
    type: 'thematic',
    color: 'emerald',
  },
  {
    id: 'devotional-90',
    title: 'Devocionais 90 Dias',
    description: 'Reflexões diárias com aplicação prática',
    totalDays: 90,
    progress: 0,
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    type: 'devotional',
    color: 'rose',
  },
  {
    id: 'nt-180',
    title: 'Novo Testamento 180 Dias',
    description: 'Foque nos evangelhos e epístolas',
    totalDays: 180,
    progress: 0,
    icon: Target,
    gradient: 'from-violet-500 to-purple-600',
    type: 'canonical',
    color: 'violet',
  },
  {
    id: 'psalms-proverbs-60',
    title: 'Salmos e Provérbios',
    description: 'Sabedoria e adoração diária em 60 dias',
    totalDays: 60,
    progress: 0,
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-600',
    type: 'thematic',
    color: 'cyan',
  },
  {
    id: 'gospels-40',
    title: '4 Evangelhos em 40 Dias',
    description: 'Mateus, Marcos, Lucas e João',
    totalDays: 40,
    progress: 0,
    icon: Sun,
    gradient: 'from-yellow-500 to-orange-500',
    type: 'canonical',
    color: 'yellow',
  },
  {
    id: 'pauls-letters-60',
    title: 'Cartas de Paulo',
    description: 'Todas as epístolas de Paulo em 60 dias',
    totalDays: 60,
    progress: 0,
    icon: Crown,
    gradient: 'from-indigo-500 to-violet-600',
    type: 'canonical',
    color: 'indigo',
  },
];

const LEVELS = [
  { name: 'Iniciante', minXp: 0, icon: '🌱' },
  { name: 'Leitor', minXp: 500, icon: '📖' },
  { name: 'Estudioso', minXp: 1500, icon: '📚' },
  { name: 'Discípulo', minXp: 3500, icon: '✝️' },
  { name: 'Mestre', minXp: 7000, icon: '⭐' },
  { name: 'Evangelista', minXp: 12000, icon: '🌟' },
  { name: 'Campeão', minXp: 20000, icon: '👑' },
];

const getLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return { ...LEVELS[i], level: i + 1 };
  }
  return { ...LEVELS[0], level: 1 };
};

const getXpForNextLevel = (currentLevel: number) => {
  if (currentLevel >= LEVELS.length) return LEVELS[LEVELS.length - 1].minXp;
  return LEVELS[currentLevel].minXp;
};

export const ReadingPlans: React.FC<{ 
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
  availableVersions?: { id: string; name: string; abbreviation: string }[];
}> = ({ onNavigate, availableVersions = [] }) => {
  const { settings, currentVersion } = useAppContext();
  const [activeTab, setActiveTab] = useState<'home' | 'custom' | 'explore'>('home');
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(currentVersion?.id || 'ARC');
  const [pendingPlan, setPendingPlan] = useState<typeof PRESET_PLANS[0] | null>(null);
  
  const [userPlans, setUserPlans] = useState<ReadingPlan[]>(() => {
    const saved = localStorage.getItem('codex-reading-plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('codex-reading-plans', JSON.stringify(userPlans));
  }, [userPlans]);

  const startPlan = (preset: typeof PRESET_PLANS[0]) => {
    console.log('startPlan called with:', preset.id);
    setPendingPlan(preset);
    setShowVersionPicker(true);
  };

  const confirmStartPlan = () => {
    if (!pendingPlan) return;
    
    const newPlan: ReadingPlan = {
      ...pendingPlan,
      id: `${pendingPlan.id}-${Date.now()}`,
      currentDay: 1,
      streak: 0,
      longestStreak: 0,
      xp: 0,
      level: 1,
      completedBooks: [],
      startDate: new Date().toISOString(),
      lastReadDate: undefined,
    };
    setUserPlans(prev => [...prev, newPlan]);
    setSelectedPlan(newPlan);
    setShowPlanDetail(true);
    setShowVersionPicker(false);
    setPendingPlan(null);
  };

  const markDayComplete = (planId: string) => {
    setUserPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      
      const today = new Date().toDateString();
      const lastRead = plan.lastReadDate ? new Date(plan.lastReadDate).toDateString() : null;
      
      let newStreak = plan.streak;
      if (lastRead) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastRead === yesterday.toDateString()) {
          newStreak = plan.streak + 1;
        } else if (lastRead !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const xpGained = 10 + Math.min(plan.streak, 50);
      const newXp = plan.xp + xpGained;
      const newLevel = getLevel(newXp);

      return {
        ...plan,
        progress: plan.progress + 1,
        currentDay: plan.currentDay + 1,
        streak: newStreak,
        longestStreak: Math.max(plan.longestStreak, newStreak),
        xp: newXp,
        level: newLevel.level,
        lastReadDate: new Date().toISOString(),
      };
    }));
  };

  const getTodayReading = (plan: ReadingPlan) => {
    const dayOfYear = Math.floor((Date.now() - new Date(plan.startDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const adjustedDay = ((dayOfYear % plan.totalDays) + 1);
    
    switch (plan.type) {
      case 'canonical':
        const totalChapters = BIBLE_BOOKS.reduce((acc, b) => acc + b.chapters, 0);
        const chaptersPerDay = Math.ceil(totalChapters / plan.totalDays);
        let accumulated = 0;
        for (const book of BIBLE_BOOKS) {
          if (accumulated + book.chapters >= (adjustedDay - 1) * chaptersPerDay) {
            const chapterStart = Math.max(1, (adjustedDay - 1) * chaptersPerDay - accumulated + 1);
            const chapterEnd = Math.min(book.chapters, adjustedDay * chaptersPerDay - accumulated);
            return `${book.name} ${chapterStart}${chapterEnd > chapterStart ? `-${chapterEnd}` : ''}`;
          }
          accumulated += book.chapters;
        }
        return BIBLE_BOOKS[BIBLE_BOOKS.length - 1].name + ' 1';
      
      case 'thematic':
        const otPerDay = Math.ceil(39 / plan.totalDays);
        const ntPerDay = Math.ceil(27 / plan.totalDays);
        const otBookIndex = Math.min(Math.floor((adjustedDay - 1) / otPerDay), 38);
        const ntBookIndex = Math.min(Math.floor((adjustedDay - 1) / ntPerDay), 26);
        return `${BIBLE_BOOKS[otBookIndex].name} + ${BIBLE_BOOKS[39 + ntBookIndex].name}`;
      
      case 'devotional':
        return `Reflexão do Dia ${adjustedDay}`;
      
      default:
        return `Dia ${adjustedDay}`;
    }
  };

  const stats = useMemo(() => ({
    activePlans: userPlans.length,
    totalDaysCompleted: userPlans.reduce((acc, p) => acc + p.progress, 0),
    currentStreak: Math.max(...userPlans.map(p => p.streak), 0),
    totalXp: userPlans.reduce((acc, p) => acc + p.xp, 0),
    currentLevel: getLevel(userPlans.reduce((acc, p) => acc + p.xp, 0)),
  }), [userPlans]);

  const activePlan = userPlans[0];

  const allVersions = availableVersions.length > 0 
    ? availableVersions 
    : [
        { id: 'ARC', name: 'ARC 2009', abbreviation: 'ARC' },
        { id: 'ARA', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA' },
        { id: 'NVI', name: 'Nova Versão Internacional', abbreviation: 'NVI' },
      ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <AnimatePresence mode="wait">
        {showVersionPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowVersionPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[var(--surface-1)] rounded-2xl p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--text-bible)]">Escolha a Versão</h3>
                <button
                  onClick={() => setShowVersionPicker(false)}
                  className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--text-bible-muted)]" />
                </button>
              </div>
              
              <p className="text-sm text-[var(--text-bible-muted)] mb-4 bg-[var(--surface-2)] p-3 rounded-lg">
                Selecione a tradução bíblica para este plano de leitura:
              </p>

              <div className="space-y-2 mb-6">
                {allVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                      selectedVersion === version.id
                        ? "bg-[var(--accent-bible)]/20 border-2 border-[var(--accent-bible)]"
                        : "bg-[var(--surface-2)]/80 border-2 border-[var(--border-bible)] hover:bg-[var(--surface-2)] hover:border-[var(--border-bible)]"
                    )}
                  >
                    <BookText className="w-5 h-5 text-[var(--accent-bible)]" />
                    <div className="text-left">
                      <div className="font-medium text-[var(--text-bible)]">{version.name}</div>
                      <div className="text-xs text-[var(--text-bible-muted)]">{version.abbreviation}</div>
                    </div>
                    {selectedVersion === version.id && (
                      <CheckCircle2 className="w-5 h-5 text-[var(--accent-bible)] ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmStartPlan}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold",
                  "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]",
                  "shadow-lg hover:opacity-90 transition-opacity"
                )}
              >
                Iniciar Plano
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showPlanDetail && selectedPlan && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-50 bg-[var(--surface-0)] overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowPlanDetail(false)}
                  className="p-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[var(--text-bible)]" />
                </button>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br", selectedPlan.gradient,
                  "text-white shadow-lg"
                )}>
                  <selectedPlan.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-bible)]">{selectedPlan.title}</h2>
                  <p className="text-sm text-[var(--text-bible-muted)]">Dia {selectedPlan.currentDay} de {selectedPlan.totalDays}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-center">
                  <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <div className="text-xl font-bold text-[var(--text-bible)]">{selectedPlan.streak}</div>
                  <div className="text-xs text-[var(--text-bible-muted)]">Dias seguidos</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-center">
                  <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <div className="text-xl font-bold text-[var(--text-bible)]">{selectedPlan.longestStreak}</div>
                  <div className="text-xs text-[var(--text-bible-muted)]">Recorde</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-center">
                  <Zap className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <div className="text-xl font-bold text-[var(--text-bible)]">{selectedPlan.xp}</div>
                  <div className="text-xs text-[var(--text-bible-muted)]">XP</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-center">
                  <Crown className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                  <div className="text-xl font-bold text-[var(--text-bible)]">Nív {selectedPlan.level}</div>
                  <div className="text-xs text-[var(--text-bible-muted)]">{getLevel(selectedPlan.xp).name}</div>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-3">
                  Leitura de Hoje ({selectedVersion})
                </h3>
                <div className="text-lg font-semibold text-[var(--text-bible)] mb-4">
                  {getTodayReading(selectedPlan)}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r", selectedPlan.gradient)}
                      style={{ width: `${(selectedPlan.progress / selectedPlan.totalDays) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--text-bible-muted)]">
                    {Math.round((selectedPlan.progress / selectedPlan.totalDays) * 100)}%
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => markDayComplete(selectedPlan.id)}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold",
                    "bg-gradient-to-r", selectedPlan.gradient,
                    "text-white shadow-lg",
                    "hover:opacity-90 transition-opacity"
                  )}
                >
                  Marcar como Lido
                </motion.button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-3">
                  Progresso por Livro
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {BIBLE_BOOKS.slice(0, 40).map((book) => {
                    const isCompleted = selectedPlan.completedBooks.includes(book.abbrev);
                    return (
                      <div
                        key={book.abbrev}
                        className={cn(
                          "aspect-square rounded-sm",
                          isCompleted ? "bg-[var(--accent-bible)]" : "bg-[var(--surface-2)]"
                        )}
                        title={book.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        
        {/* Header Premium com Streak e Level */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5",
            "bg-[var(--surface-1)] border border-[var(--border-bible)]",
            "transition-all duration-300 hover:shadow-md"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--accent-bible) 0%, transparent 70%)'
            }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-[var(--accent-bible)]" />
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full",
                  "text-[10px] font-bold uppercase tracking-wider",
                  "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
                )}>
                  Planos de Leitura
                </span>
              </div>
              <h1 className={cn(
                "text-3xl font-bold text-[var(--text-bible)]",
                "tracking-tight"
              )} style={{ fontFamily: 'var(--font-display)' }}>
                Jornada Guiada
              </h1>
              <p className="mt-1 text-[var(--text-bible-muted)] text-sm">
                Organize sua leitura bíblica diária
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold text-orange-500">{stats.currentStreak}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10">
                <Star className="w-5 h-5 text-purple-500" />
                <span className="text-lg font-bold text-purple-500">{stats.currentLevel.name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards com XPe Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { label: 'Planos ativos', value: stats.activePlans.toString(), icon: Compass, color: 'blue' },
            { label: 'Dias lidos', value: stats.totalDaysCompleted.toString(), icon: CheckCircle2, color: 'green' },
            { label: 'Total XP', value: stats.totalXp.toString(), icon: Zap, color: 'amber' },
            { label: 'Nível', value: `Nív ${stats.currentLevel.level}`, icon: Crown, color: 'purple' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              blue: 'bg-blue-500/10 text-blue-500',
              green: 'bg-green-500/10 text-green-500',
              amber: 'bg-amber-500/10 text-amber-500',
              purple: 'bg-purple-500/10 text-purple-500',
            };
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl",
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]"
                )}
              >
                <div className={cn("p-2 rounded-lg mb-2", colorClasses[stat.color])}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-[var(--text-bible)]">{stat.value}</span>
                <span className="text-xs text-[var(--text-bible-muted)] text-center mt-1">{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Active Plan Card se houver */}
        {activePlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => {
              setSelectedPlan(activePlan);
              setShowPlanDetail(true);
            }}
            className={cn(
              "p-5 rounded-2xl cursor-pointer",
              "bg-gradient-to-br", activePlan.gradient,
              "text-white shadow-xl",
              "hover:scale-[1.02] transition-transform"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur">
                  <activePlan.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activePlan.title}</h3>
                  <p className="text-white/80 text-sm">Dia {activePlan.currentDay} de {activePlan.totalDays}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{activePlan.streak}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-white"
                  style={{ width: `${(activePlan.progress / activePlan.totalDays) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round((activePlan.progress / activePlan.totalDays) * 100)}%</span>
            </div>
            <div className="text-sm font-medium text-white/90">
              📖 Leitura de hoje: {getTodayReading(activePlan)}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
          {[
            { id: 'home', label: 'Meus Planos' },
            { id: 'custom', label: 'Personalizados' },
            { id: 'explore', label: 'Explorar' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-[var(--surface-0)] text-[var(--text-bible)] shadow-sm"
                  : "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]"
              )}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Plans List - based on active tab */}
        {activeTab === 'home' && (
          <div className="space-y-3">
            {userPlans.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-bible-muted)]">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum plano ativo ainda.</p>
                <p className="text-sm mt-1">Explore os planos disponíveis e escolha um para começar!</p>
              </div>
            ) : (
              userPlans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.button
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlanDetail(true);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl",
                      "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                      "text-left transition-all duration-200",
                      "hover:border-[var(--accent-bible)]/30 hover:shadow-md"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      "bg-gradient-to-br", plan.gradient,
                      "text-white shadow-lg"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[var(--text-bible)]">{plan.title}</h3>
                        {plan.streak > 0 && (
                          <span className="flex items-center gap-1 text-xs text-orange-500">
                            <Flame className="w-3 h-3" />
                            {plan.streak}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-bible-muted)] mt-0.5">{plan.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(plan.progress / plan.totalDays) * 100}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                            className={cn("h-full rounded-full bg-gradient-to-r", plan.gradient)}
                          />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-bible-muted)] whitespace-nowrap">
                          {plan.progress}/{plan.totalDays} dias
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-bible-subtle)]" />
                  </motion.button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => alert('Funcionalidade de criar plano personalizado em breve!')}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-6 rounded-xl",
                "border-2 border-dashed border-[var(--border-bible)]",
                "text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)]",
                "hover:border-[var(--accent-bible)] transition-all"
              )}
            >
              <Plus className="w-6 h-6" />
              <span className="font-medium">Criar Plano Personalizado</span>
            </motion.button>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-3">
            {PRESET_PLANS.map((preset, index) => {
              const Icon = preset.icon;
              const isActive = userPlans.some(p => p.id.startsWith(preset.id));
              
              return (
                <motion.button
                  key={preset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    console.log('Button clicked, isActive:', isActive);
                    if (!isActive) startPlan(preset);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl",
                    "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                    "text-left transition-all duration-200",
                    isActive 
                      ? "opacity-60 cursor-not-allowed" 
                      : "hover:border-[var(--accent-bible)]/30 hover:shadow-md active:scale-[0.99]"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br", preset.gradient,
                    "text-white shadow-lg"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--text-bible)]">{preset.title}</h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-bible-muted)] mt-0.5">{preset.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--text-bible-subtle)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {preset.totalDays} dias
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        preset.type === 'canonical' && 'bg-blue-500/10 text-blue-500',
                        preset.type === 'chronological' && 'bg-amber-500/10 text-amber-500',
                        preset.type === 'thematic' && 'bg-emerald-500/10 text-emerald-500',
                        preset.type === 'devotional' && 'bg-rose-500/10 text-rose-500',
                      )}>
                        {preset.type === 'canonical' && 'Canônico'}
                        {preset.type === 'chronological' && 'Cronológico'}
                        {preset.type === 'thematic' && 'Temático'}
                        {preset.type === 'devotional' && 'Devocional'}
                      </span>
                    </div>
                  </div>
                  {!isActive && <ChevronRight className="w-5 h-5 text-[var(--text-bible-subtle)]" />}
                </motion.button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};