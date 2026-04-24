import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Play, Library, CheckCircle2, Plus, X, ChevronRight, ChevronLeft, Calendar, Clock, BookOpen, Sparkles, Target, ArrowRight, ArrowLeft, Flame, Trophy, Star, Zap, Crown, ChevronDown, Settings, Users, Globe, Heart, Sun, Moon, BookText, Wand2, Loader2, Sparkle, MessageSquare, Loader } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { generateReadingPlan } from '../services/geminiService';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import biblia365Data from '../../plano_biblia365.json';

const renderIcon = (icon: React.ElementType | undefined, props: { className?: string }) => {
  if (!icon) return <BookOpen className={props.className} />;
  if (typeof icon === 'function') {
    return React.createElement(icon, props);
  }
  return <BookOpen className={props.className} />;
};

interface ReadingPlanAI {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  readings: {
    day: number;
    title: string;
    type: 'scripture' | 'devotional';
    passages: string[];
    devotionalContent?: string;
  }[];
}
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
  dayReadings?: {
    day: number;
    title: string;
    passages: string[];
    completed: boolean;
  }[];
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

const DAY_READINGS = {
  'encontrando-deus': [
    { day: 1, title: 'A Criação e o Jardim', passages: ['Gênesis 1:1-2', 'Gênesis 2:4-15'] },
    { day: 2, title: 'O Pecado e a Queda', passages: ['Gênesis 3:1-24'] },
    { day: 3, title: 'Abraão e a Promise', passages: ['Gênesis 12:1-9', 'Gênesis 15:1-6'] },
    { day: 4, title: 'Moisés e o Exodo', passages: ['Êxodo 3:1-15', 'Êxodo 14:1-31'] },
    { day: 5, title: 'A Terra Prometida', passages: ['Josué 1:1-9', 'Josué 6:1-20'] },
    { day: 6, title: 'Exílio e Esperança', passages: ['Isaías 40:1-11', 'Isaías 55:1-13'] },
    { day: 7, title: 'Jesus no Deserto', passages: ['Mateus 4:1-11', 'Hebreus 4:14-16'] },
  ],
  'salmos-oracao': [
    { day: 1, title: 'Salmo 1', passages: ['Salmo 1'] },
    { day: 2, title: 'Salmo 23', passages: ['Salmo 23'] },
    { day: 3, title: 'Salmo 27', passages: ['Salmo 27'] },
    { day: 4, title: 'Salmo 51', passages: ['Salmo 51'] },
    { day: 5, title: 'Salmo 63', passages: ['Salmo 63'] },
    { day: 6, title: 'Salmo 91', passages: ['Salmo 91'] },
    { day: 7, title: 'Salmo 103', passages: ['Salmo 103'] },
    { day: 8, title: 'Salmo 121', passages: ['Salmo 121'] },
    { day: 9, title: 'Salmo 139', passages: ['Salmo 139'] },
    { day: 10, title: 'Salmo 150', passages: ['Salmo 150'] },
  ],
  'vida-jesus': [
    { day: 1, title: 'O Nascimento', passages: ['Lucas 2:1-20'] },
    { day: 2, title: 'Jesus no Templo', passages: ['Lucas 2:41-52'] },
    { day: 3, title: 'O Batismo', passages: ['Mateus 3:13-17'] },
    { day: 4, title: 'As Tentações', passages: ['Mateus 4:1-11'] },
    { day: 5, title: 'Chamando Discípulos', passages: ['Lucas 5:1-11'] },
    { day: 6, title: 'Sermão do Monte', passages: ['Mateus 5:1-20'] },
    { day: 7, title: 'O Bom Samaritano', passages: ['Lucas 10:25-37'] },
    { day: 8, title: 'O Filho Pródigo', passages: ['Lucas 15:11-32'] },
    { day: 9, title: 'Alimentando 5000', passages: ['João 6:1-15'] },
    { day: 10, title: 'Lázaro Ressuscitado', passages: ['João 11:1-44'] },
    { day: 11, title: 'A Última Ceia', passages: ['João 13:1-17'] },
    { day: 12, title: 'A Crucificação', passages: ['João 19:16-30'] },
    { day: 13, title: 'A Ressurreição', passages: ['João 20:1-18'] },
    { day: 14, title: 'A Grande Comissão', passages: ['Mateus 28:16-20'] },
  ],
  'canonical-365': Array.from({ length: 365 }, (_, i) => {
    const books = BIBLE_BOOKS.slice(0, 39);
    let acc = 0;
    for (const book of books) {
      if (acc + book.chapters > i * 3) {
        const start = Math.max(1, i * 3 - acc + 1);
        const end = Math.min(book.chapters, (i + 1) * 3 - acc);
        return { day: i + 1, title: `${book.name} ${start}${end > start ? '-' + end : ''}`, passages: [`${book.name} ${start}:${end}`] };
      }
      acc += book.chapters;
    }
    return { day: i + 1, title: 'Apocalipse 1', passages: ['Apocalipse 1'] };
  }),
  'devotional-90': Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    title: `Devocional Dia ${i + 1}`,
    passages: ['Salmo 1', 'Provérbios 3:5-6']
  })),
  'nt-180': Array.from({ length: 180 }, (_, i) => {
    const books = BIBLE_BOOKS.slice(39);
    let acc = 0;
    for (const book of books) {
      if (acc + book.chapters > i * 1.5) {
        const start = Math.max(1, Math.ceil(i * 1.5 - acc + 1));
        const end = Math.min(book.chapters, Math.ceil((i + 1) * 1.5 - acc));
        return { day: i + 1, title: `${book.name} ${start}`, passages: [`${book.name} ${start}:${end}`] };
      }
      acc += book.chapters;
    }
    return { day: i + 1, title: 'Apocalipse 1', passages: ['Apocalipse 1'] };
  }),
  'psalms-proverbs-60': Array.from({ length: 60 }, (_, i) => {
    const psalm = i % 150 + 1;
    const prov = i % 31 + 1;
    return { day: i + 1, title: `Salmo ${psalm} + Provérbios ${prov}`, passages: [`Salmo ${psalm}`, `Provérbios ${prov}`] };
  }),
  'gospels-40': Array.from({ length: 40 }, (_, i) => {
    const gospelDays = [
      { book: 'Mateus', chapters: 28, start: 0 },
      { book: 'Marcos', chapters: 16, start: 28 },
      { book: 'Lucas', chapters: 24, start: 44 },
      { book: 'João', chapters: 21, start: 68 }
    ];
    let acc = 0;
    for (const g of gospelDays) {
      if (acc + g.chapters > i) {
        const chapter = i - acc + 1;
        return { day: i + 1, title: `${g.book} ${chapter}`, passages: [`${g.book} ${chapter}`] };
      }
      acc += g.chapters;
    }
    return { day: i + 1, title: 'João 1', passages: ['João 1'] };
  }),
  'pauls-letters-60': Array.from({ length: 60 }, (_, i) => {
    const letters = ['Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus'];
    const letter = letters[i % letters.length];
    return { day: i + 1, title: letter, passages: [letter] };
  }),
};

const addReadingsToPreset = (plan: Omit<ReadingPlan, 'streak' | 'longestStreak' | 'xp' | 'level' | 'currentDay' | 'completedBooks'>): Omit<ReadingPlan, 'streak' | 'longestStreak' | 'xp' | 'level' | 'currentDay' | 'completedBooks'> & { dayReadings: { day: number; title: string; passages: string[]; completed: boolean; }[] } => {
  const readings = plan.id === biblia365Data.id 
    ? biblia365Data.dayReadings 
    : DAY_READINGS[plan.id] || [];
  return { ...plan, dayReadings: readings.map(r => ({ ...r, completed: false })) };
};

const PRESET_PLANS: (Omit<ReadingPlan, 'streak' | 'longestStreak' | 'xp' | 'level' | 'currentDay' | 'completedBooks'> & { dayReadings: { day: number; title: string; passages: string[]; completed: boolean; }[] })[] = [
  addReadingsToPreset({
    id: biblia365Data.id,
    title: biblia365Data.title,
    description: biblia365Data.description,
    totalDays: biblia365Data.totalDays,
    progress: 0,
    icon: BookOpen,
    gradient: biblia365Data.gradient,
    type: biblia365Data.type,
    color: biblia365Data.color,
  }),
  addReadingsToPreset({
    id: 'chronological-365',
    title: 'Bíblia Cronológica',
    description: 'Leia na ordem histórica dos eventos',
    totalDays: 365,
    progress: 0,
    icon: Clock,
    gradient: 'from-amber-500 to-orange-600',
    type: 'chronological',
    color: 'amber',
  }),
  addReadingsToPreset({
    id: 'thematic-365',
    title: 'Plano Temático',
    description: 'VT + NT + Salmosdiariamente - varietygarantido',
    totalDays: 365,
    progress: 0,
    icon: Compass,
    gradient: 'from-emerald-500 to-teal-600',
    type: 'thematic',
    color: 'emerald',
  }),
  addReadingsToPreset({
    id: 'devotional-90',
    title: 'Devocionais 90 Dias',
    description: 'Reflexões diárias com aplicação prática',
    totalDays: 90,
    progress: 0,
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    type: 'devotional',
    color: 'rose',
  }),
  addReadingsToPreset({
    id: 'nt-180',
    title: 'Novo Testamento 180 Dias',
    description: 'Foque nos evangelhos e epístolas',
    totalDays: 180,
    progress: 0,
    icon: Target,
    gradient: 'from-violet-500 to-purple-600',
    type: 'canonical',
    color: 'violet',
  }),
  addReadingsToPreset({
    id: 'psalms-proverbs-60',
    title: 'Salmos e Provérbios',
    description: 'Sabedoria e adoração diária em 60 dias',
    totalDays: 60,
    progress: 0,
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-600',
    type: 'thematic',
    color: 'cyan',
  }),
  addReadingsToPreset({
    id: 'gospels-40',
    title: '4 Evangelhos em 40 Dias',
    description: 'Mateus, Marcos, Lucas e João',
    totalDays: 40,
    progress: 0,
    icon: Sun,
    gradient: 'from-yellow-500 to-orange-500',
    type: 'canonical',
    color: 'yellow',
  }),
  addReadingsToPreset({
    id: 'pauls-letters-60',
    title: 'Cartas de Paulo',
    description: 'Todas as epístolas de Paulo em 60 dias',
    totalDays: 60,
    progress: 0,
    icon: Crown,
    gradient: 'from-indigo-500 to-violet-600',
    type: 'canonical',
    color: 'indigo',
  }),
  addReadingsToPreset({
    id: 'encontrando-deus',
    title: 'Encontrando Deus no Deserto',
    description: 'Uma jornada de 7 dias explorando as experiências no deserto',
    totalDays: 7,
    progress: 0,
    icon: Flame,
    gradient: 'from-orange-500 to-amber-600',
    type: 'devotional',
    color: 'orange',
  }),
  addReadingsToPreset({
    id: 'salmos-oracao',
    title: 'Salmos de Oração',
    description: 'Descubra a beleza da oração através dos Salmos',
    totalDays: 10,
    progress: 0,
    icon: Heart,
    gradient: 'from-slate-500 to-gray-600',
    type: 'devotional',
    color: 'slate',
  }),
  addReadingsToPreset({
    id: 'vida-jesus',
    title: 'A Vida de Jesus',
    description: 'Conheça Jesus através dos quatro evangelhos',
    totalDays: 14,
    progress: 0,
    icon: Sun,
    gradient: 'from-amber-500 to-yellow-600',
    type: 'canonical',
    color: 'amber',
  }),
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

const QUIT_PHRASES = [
  "O importante é recomeçar. Deus siempre te dá uma nova chance!",
  "Cada jornada tem seus obstáculos. Volte quando estiver pronto!",
  "Você não falhou - apenas fez uma pausa. A porta siempre está aberta!",
  "O primeiro passo é o mais difícil. Você ja deu varios!",
  "Nem sempre completamos, mas sempre aprendemos.下次会更好!",
  "Sua história com Deus não terminó. Um novo capítulo awaits!",
  "Desistir não é vergonha - mas tentar de novo é coragem!",
  "O que importa não é a velocidade, mas a perseverança.",
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
  const [viewingDay, setViewingDay] = useState<number | null>(null);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [dayVerses, setDayVerses] = useState<Record<string, Verse[]>>({});
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(currentVersion?.id || 'ARC');
  const [pendingPlan, setPendingPlan] = useState<typeof PRESET_PLANS[0] | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedPlan, setCompletedPlan] = useState<ReadingPlan | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [quittedPlan, setQuittedPlan] = useState<ReadingPlan | null>(null);
  const [showUnmarkOption, setShowUnmarkOption] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDays, setAiDays] = useState<number | undefined>(undefined);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ReadingPlanAI | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [userTrophies, setUserTrophies] = useState<{ id: string; name: string; icon: string; date: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('codex-trophies');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const parseBookReference = (passage: string): { bookId: string; chapter: number; startVerse?: number; endVerse?: number } | null => {
    const bookMapping: Record<string, string> = {
      'genesis': 'GEN', 'gen': 'GEN', 'gn': 'GEN',
      'exodo': 'EXO', 'ex': 'EXO',
      'levitico': 'LEV', 'lv': 'LEV',
      'numeros': 'NUM', 'nm': 'NUM',
      'deuteronomio': 'DEU', 'dt': 'DEU',
      'salmos': 'PSA', 'sl': 'PSA', 'salmo': 'PSA',
      'proverbios': 'PRO', 'pv': 'PRO',
      'mateus': 'MAT', 'mt': 'MAT',
      'marcos': 'MRK', 'mc': 'MRK',
      'lucas': 'LUK', 'lc': 'LUK',
      'joao': 'JHN', 'jo': 'JHN',
      'atos': 'ACT', 'at': 'ACT',
      'romanos': 'ROM', 'rm': 'ROM',
      '1corintios': '1CO', '2corintios': '2CO',
      'galatas': 'GAL', 'gl': 'GAL',
      'efesios': 'EPH', 'ef': 'EPH',
      'filipenses': 'PHP', 'fp': 'PHP',
      'colossenses': 'COL', 'cl': 'COL',
      '1tssalonicenses': '1TH', '2tes': '2TH',
      '1timoteo': '1TI', '2timoteo': '2TI',
      'tito': 'TIT', 'filemon': 'PHM',
      'hebreus': 'HEB', 'hb': 'HEB',
      'tiago': 'JAS', 'tg': 'JAS',
      '1pedro': '1PE', '2pedro': '2PE',
      '1joao': '1JN', '2joao': '2JN', '3joao': '3JN',
      'judas': 'JUD', 'jd': 'JUD',
      'apocalipse': 'REV', 'ap': 'REV',
    };
    
    const match = passage.match(/^([A-Za-zãéíóúâêôûáéíóú]+)\s*(\d+):?(\d+)?-?(\d+)?$/i);
    if (!match) return null;
    
    const bookName = match[1].toLowerCase().replace(/ã/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/â/g, 'a').replace(/ê/g, 'e').replace(/ô/g, 'o').replace(/û/g, 'u');
    const chapter = parseInt(match[2]);
    const startVerse = match[3] ? parseInt(match[3]) : 1;
    const endVerse = match[4] ? parseInt(match[4]) : startVerse;
    
    const bookId = bookMapping[bookName] || bookName.substring(0, 3).toUpperCase();
    
    return { bookId, chapter, startVerse, endVerse };
  };

  const cleanStrongCodes = (text: string): string => {
    return text.replace(/<[A-Z]\d+>/g, '').replace(/<WH\d+>/g, '').trim();
  };
  
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

  useEffect(() => {
    localStorage.setItem('codex-trophies', JSON.stringify(userTrophies));
  }, [userTrophies]);

  useEffect(() => {
    if (!selectedPlan || !currentVersion) return;
    
    const loadVersesForDay = async () => {
      const readings = selectedPlan.dayReadings?.filter(r => r.day === selectedPlan.currentDay) || [];
      if (readings.length === 0) return;
      
      const key = `day-${selectedPlan.currentDay}`;
      if (dayVerses[key]) return;
      
      setLoadingVerses(true);
      const versesMap: Record<string, Verse[]> = {};
      
      for (const reading of readings) {
        for (const passage of reading.passages) {
          const parsed = parseBookReference(passage);
          if (parsed) {
            try {
              const verses = await BibleService.getVerses(parsed.bookId, parsed.chapter, currentVersion);
              versesMap[passage] = verses
                .filter(v => v.verse >= (parsed.startVerse || 1))
                .filter(v => !parsed.endVerse || v.verse <= parsed.endVerse)
                .map(v => ({ ...v, text: cleanStrongCodes(v.text) }));
            } catch (e) {
              console.error('Erro ao buscar versículos:', e);
              versesMap[passage] = [];
            }
          }
        }
      }
      
      setDayVerses(prev => ({ ...prev, [key]: Object.values(versesMap).flat() }));
      setLoadingVerses(false);
    };
    
    loadVersesForDay();
  }, [selectedPlan?.currentDay, currentVersion]);

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

  const markDayComplete = (planId: string, forceUnmark: boolean = false) => {
    const currentPlan = userPlans.find(p => p.id === planId);
    if (!currentPlan) return;
    
    const dayReading = currentPlan.dayReadings?.find(r => r.day === currentPlan.currentDay);
    const isAlreadyCompleted = dayReading?.completed === true;
    
    if (!forceUnmark && isAlreadyCompleted) {
      setShowUnmarkOption(true);
      return;
    }
    
    setUserPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;
      
      const targetDay = plan.currentDay - 1;
      if (forceUnmark && targetDay >= 1) {
        const newReadings = plan.dayReadings?.map(r => 
          r.day === targetDay ? { ...r, completed: false } : r
        ) || [];
        
        const completedCount = newReadings.filter(r => r.completed).length;
        
        return {
          ...plan,
          progress: completedCount,
          currentDay: targetDay,
          dayReadings: newReadings,
        };
      }
      
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

      const newReadings = plan.dayReadings?.map(r => 
        r.day === plan.currentDay ? { ...r, completed: true } : r
      ) || [];

      const newCurrentDay = plan.currentDay + 1;
      const newProgress = plan.progress + 1;
      const isFinished = newCurrentDay > plan.totalDays;
      
      if (isFinished) {
        setCompletedPlan(plan);
        setShowCompletionModal(true);
        const newTrophies = [
          ...userTrophies,
          {
            id: `trophy-${plan.id}-${Date.now()}`,
            name: plan.title,
            icon: '🏆',
            date: new Date().toISOString(),
          },
        ];
        setUserTrophies(newTrophies);
      }

      return {
        ...plan,
        progress: newProgress,
        currentDay: isFinished ? plan.currentDay : newCurrentDay,
        streak: newStreak,
        longestStreak: Math.max(plan.longestStreak, newStreak),
        xp: newXp,
        level: newLevel.level,
        lastReadDate: new Date().toISOString(),
        dayReadings: newReadings,
      };
    }));
  };

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    setCompletedPlan(null);
    setSelectedPlan(null);
    setShowPlanDetail(false);
  };

  const handleQuitPlan = (planId: string) => {
    const plan = userPlans.find(p => p.id === planId);
    if (!plan) return;

    setQuittedPlan(plan);
    
    const newTrophies = [
      ...userTrophies,
      {
        id: `quit-trophy-${plan.id}-${Date.now()}`,
        name: plan.title,
        icon: '💔',
        date: new Date().toISOString(),
      },
    ];
    setUserTrophies(newTrophies);

    setUserPlans(prev => prev.filter(p => p.id !== planId));
    setShowQuitModal(true);
  };

  const handleCloseQuitModal = () => {
    setShowQuitModal(false);
    setQuittedPlan(null);
    setSelectedPlan(null);
    setShowPlanDetail(false);
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
    <>
      {showCompletionModal && completedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[var(--surface-0)] rounded-2xl p-6 shadow-xl border border-[var(--border-bible)]"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--text-bible)] mb-2">Parabéns!</h2>
              <p className="text-[var(--text-bible-muted)] mb-4">Você completou o plano de leitura!</p>
              <p className="text-lg font-semibold text-[var(--accent-bible)] mb-4">{completedPlan.title}</p>
              <div className="p-3 rounded-xl bg-amber-500/10 mb-6">
                <span className="text-xl font-bold text-amber-500">+1 🏆</span>
                <p className="text-sm text-amber-600">Troféu conquistado!</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseCompletionModal}
                className="w-full py-3 rounded-xl font-semibold bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-lg hover:opacity-90 transition-opacity"
              >
                Voltar aos Planos
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showQuitModal && quittedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[var(--surface-0)] rounded-2xl p-6 shadow-xl border border-[var(--border-bible)]"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                💔
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--text-bible)] mb-2">Poxa...</h2>
              <p className="text-[var(--text-bible-muted)] mb-4">Você começou mas não completou...</p>
              <p className="text-lg font-semibold text-[var(--accent-bible)] mb-4">{quittedPlan.title}</p>
              <div className="p-3 rounded-xl bg-red-500/10 mb-6">
                <span className="text-xl font-bold text-red-500">+1 💔</span>
                <p className="text-sm text-red-600">Tentar novamente é coragem!</p>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-[var(--text-bible-muted)] italic mb-6 px-4"
              >
                "{QUIT_PHRASES[Math.floor(Math.random() * QUIT_PHRASES.length)]}"
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCloseQuitModal}
                className="w-full py-3 rounded-xl font-semibold bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-lg hover:opacity-90 transition-opacity"
              >
                Voltar aos Planos
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showUnmarkOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowUnmarkOption(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-[var(--surface-0)] rounded-2xl p-6 shadow-xl border border-[var(--border-bible)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-bible)]">Este dia já foi concluído</h2>
              <p className="text-[var(--text-bible-muted)] mt-2">
                Deseja desfazer a conclusão do dia {selectedPlan?.currentDay}?
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUnmarkOption(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-[var(--surface-2)] text-[var(--text-bible)] hover:bg-[var(--surface-3)] transition-all"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (selectedPlan) {
                    markDayComplete(selectedPlan.id, true);
                  }
                  setShowUnmarkOption(false);
                }}
                className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Desfazer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

    <div className="h-full overflow-y-auto scrollbar-thin">
      <AnimatePresence mode="wait">
         {showVersionPicker && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
             onClick={() => setShowVersionPicker(false)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
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
              
               <p className="text-sm text-[var(--text-bible)] mb-4 bg-white p-3 rounded-lg">
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
                  {renderIcon(selectedPlan.icon, { className: "w-6 h-6" })}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[var(--text-bible)]">{selectedPlan.title}</h2>
                  <p className="text-sm text-[var(--text-bible-muted)]">Dia {selectedPlan.currentDay} de {selectedPlan.totalDays}</p>
                </div>
                <button
                  onClick={() => setShowVersionPicker(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
                >
                  <BookText className="w-4 h-4 text-[var(--accent-bible)]" />
                  <span className="text-sm font-medium text-[var(--text-bible)]">{selectedVersion}</span>
                </button>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider">
                    Selecione o Dia
                  </h3>
                </div>
                
                <div className="flex gap-1 overflow-x-auto pb-3 mb-3">
                  {Array.from({ length: Math.min(selectedPlan.totalDays, 60) }, (_, i) => i + 1).map(day => {
                    const isCompleted = day <= selectedPlan.progress;
                    const isCurrent = day === selectedPlan.currentDay;
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setDayVerses(prev => { const n = {...prev}; delete n[`day-${selectedPlan.currentDay}`]; return n; });
                          setUserPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, currentDay: day } : p));
                          const updated = userPlans.map(p => p.id === selectedPlan.id ? { ...p, currentDay: day } : p);
                          setSelectedPlan(updated.find(p => p.id === selectedPlan.id) || null);
                        }}
                        className={cn(
                          "w-9 h-9 rounded-lg flex-shrink-0 text-sm font-medium transition-all",
                          isCurrent 
                            ? "bg-[var(--accent-bible)] text-white shadow-md" 
                            : isCompleted 
                              ? "bg-green-500 text-white" 
                              : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
                        )}
                        title={`Dia ${day}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                  {selectedPlan.totalDays > 60 && (
                    <span className="text-xs text-[var(--text-bible-muted)] self-center">
                      +{selectedPlan.totalDays - 60}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider">
                    Leitura de Hoje
                  </h3>
                  <button 
                    onClick={() => {
                      const nextVersion = allVersions.find(v => v.id === selectedVersion) 
                        ? allVersions[(allVersions.findIndex(v => v.id === selectedVersion) + 1) % allVersions.length]
                        : allVersions[0];
                      if (nextVersion) setSelectedVersion(nextVersion.id);
                    }}
                    className="text-xs text-[var(--accent-bible)] hover:underline flex items-center gap-1"
                  >
                    <BookText className="w-3 h-3" />
                    {selectedVersion}
                  </button>
                </div>
                <div className="text-lg font-semibold text-[var(--text-bible)] mb-2">
                  {getTodayReading(selectedPlan)}
                </div>
                
                <div className="space-y-2 mb-4">
                  {selectedPlan.dayReadings?.filter(r => r.day === selectedPlan.currentDay).map((reading, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        reading.completed 
                          ? "bg-green-500/10 border-green-500/30" 
                          : "bg-[var(--surface-2)] border-[var(--border-bible)]"
                      )}
                      onClick={() => {
                        const newReadings = selectedPlan.dayReadings?.map(r => 
                          r.day === reading.day && r.title === reading.title ? { ...r, completed: !r.completed } : r
                        ) || [];
                        setUserPlans(prev => prev.map(p => 
                          p.id === selectedPlan.id ? { ...p, dayReadings: newReadings } : p
                        ));
                      }}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                        reading.completed 
                          ? "bg-green-500" 
                          : "border-2 border-[var(--border-bible)]"
                      )}>
                        {reading.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text-bible)]">{reading.title}</div>
                        <div className="text-xs text-[var(--text-bible-muted)]">{reading.passages.join(', ')}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-sm text-[var(--text-bible-muted)] p-2">
                      {getTodayReading(selectedPlan)}
                    </div>
                  )}
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
                {loadingVerses ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-[var(--text-bible-muted)]">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Carregando texto...</span>
                  </div>
                ) : dayVerses[`day-${selectedPlan.currentDay}`]?.length > 0 ? (
                  <div className="mb-4 p-4 rounded-xl bg-[var(--surface-0)] border border-[var(--border-bible)] max-h-64 overflow-y-auto">
                    <h4 className="text-xs font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-2">
                      Texto Bíblico
                    </h4>
                    {dayVerses[`day-${selectedPlan.currentDay}`].map((verse, idx) => (
                      <p key={idx} className="text-sm text-[var(--text-bible)] leading-relaxed mb-2">
                        <span className="text-[var(--accent-bible)] font-bold">{verse.verse}</span> {verse.text}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-bible)]">
                    <p className="text-sm text-[var(--text-bible-muted)]">
                      Selecione uma passagem para ver o texto aqui
                    </p>
                  </div>
                )}

                {selectedPlan.currentDay <= selectedPlan.totalDays && selectedPlan.progress > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markDayComplete(selectedPlan.id)}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold mb-3",
                      "bg-gradient-to-r", selectedPlan.gradient,
                      "text-white shadow-lg",
                      "hover:opacity-90 transition-opacity"
                    )}
                  >
                    {selectedPlan.progress > 0 && selectedPlan.currentDay > 1 ? 'Recomeçar Leitura' : 'Continuar Leitura'}
                  </motion.button>
                )}

                {selectedPlan.progress === 0 && selectedPlan.currentDay <= selectedPlan.totalDays && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => markDayComplete(selectedPlan.id)}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold mb-3",
                      "bg-gradient-to-r", selectedPlan.gradient,
                      "text-white shadow-lg",
                      "hover:opacity-90 transition-opacity"
                    )}
                  >
                    Começar Leitura
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuitPlan(selectedPlan.id)}
                  className="w-full py-3 rounded-xl font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                >
                  Desistir da Leitura
                </motion.button>
              </div>

              <div className="flex items-center justify-between gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newDay = selectedPlan.currentDay - 1;
                    setDayVerses(prev => { const n = {...prev}; delete n[`day-${selectedPlan.currentDay}`]; return n; });
                    setUserPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, currentDay: newDay } : p));
                    const updated = userPlans.map(p => p.id === selectedPlan.id ? { ...p, currentDay: newDay } : p);
                    setSelectedPlan(updated.find(p => p.id === selectedPlan.id) || null);
                  }}
                  disabled={selectedPlan.currentDay <= 1}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2",
                    "bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors",
                    selectedPlan.currentDay <= 1 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Dia Anterior
                </motion.button>
                <div className="px-3 py-2 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
                  <span className="text-sm font-semibold text-[var(--text-bible)]">
                    {selectedPlan.currentDay} / {selectedPlan.totalDays}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedPlan.currentDay >= selectedPlan.totalDays) return;
                    const newDay = selectedPlan.currentDay + 1;
                    setDayVerses(prev => { const n = {...prev}; delete n[`day-${selectedPlan.currentDay}`]; return n; });
                    setUserPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, currentDay: newDay } : p));
                    const updated = userPlans.map(p => p.id === selectedPlan.id ? { ...p, currentDay: newDay } : p);
                    setSelectedPlan(updated.find(p => p.id === selectedPlan.id) || null);
                  }}
                  disabled={selectedPlan.currentDay >= selectedPlan.totalDays}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2",
                    "bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors",
                    selectedPlan.currentDay >= selectedPlan.totalDays && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Próximo Dia
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
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
                  {renderIcon(Icon, { className: "w-4 h-4" })}
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
                  {renderIcon(activePlan.icon, { className: "w-5 h-5" })}
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
                      {renderIcon(Icon, { className: "w-6 h-6" })}
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
              onClick={() => setShowAIModal(true)}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-6 rounded-xl",
                "bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)]",
                "text-white font-semibold",
                "hover:shadow-lg hover:scale-[1.02] transition-all"
              )}
            >
              <Wand2 className="w-6 h-6" />
              <span>Criar Plano com IA</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => alert('Funcionalidade de criar plano manualmente em breve!')}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-6 rounded-xl",
                "border-2 border-dashed border-[var(--border-bible)]",
                "text-[var(--text-bible-muted)] hover:text-[var(--accent-bible)]",
                "hover:border-[var(--accent-bible)] transition-all"
              )}
            >
              <Plus className="w-6 h-6" />
              <span className="font-medium">Criar Plano Manual</span>
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
                    {renderIcon(Icon, { className: "w-6 h-6" })}
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

      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--surface-0)] rounded-2xl border border-[var(--border-bible)] shadow-xl overflow-hidden"
            >
              <div className="p-5 border-b border-[var(--border-bible)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] text-white">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-bible)]">Criar Plano com IA</h2>
                      <p className="text-xs text-[var(--text-bible-muted)]">Descreva seu plano ideal</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAIModal(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-1)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-2)]"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-bible-muted)] block mb-2">
                    <MessageSquare className="w-3 h-3 inline mr-1" />
                    Descrição do Plano
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Quero um plano de 7 dias sobre o loving kindness de Deus, misturando Salmos e Provérbios..."
                    className="w-full h-28 px-4 py-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible)] text-sm resize-none placeholder:text-[var(--text-bible-muted)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text-bible-muted)] block mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Duração (opcional)
                  </label>
                  <div className="flex gap-2">
                    {[7, 14, 30, 60].map((days) => (
                      <motion.button
                        key={days}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAiDays(aiDays === days ? undefined : days)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                          aiDays === days
                            ? "bg-[var(--accent-bible)] text-white"
                            : "bg-[var(--surface-2)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-3)]"
                        )}
                      >
                        {days} dias
                      </motion.button>
                    ))}
                  </div>
                </div>

                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm"
                  >
                    {aiError}
                  </motion.div>
                )}

                {generatedPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-500">Plano Criado!</span>
                    </div>
                    <h3 className="font-bold text-[var(--text-bible)]">{generatedPlan.title}</h3>
                    <p className="text-sm text-[var(--text-bible-muted)]">{generatedPlan.description}</p>
                    <p className="text-xs text-[var(--text-bible-subtle)] mt-1">{generatedPlan.readings.length} leituras</p>
                  </motion.div>
                )}
              </div>

              <div className="p-5 border-t border-[var(--border-bible)] flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-[var(--surface-2)] text-[var(--text-bible)] hover:bg-[var(--surface-3)] transition-all"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!aiPrompt.trim() || isGeneratingPlan}
                  onClick={async () => {
                    if (!aiPrompt.trim()) return;
                    setIsGeneratingPlan(true);
                    setAiError(null);
                    setGeneratedPlan(null);
                    
                    const result = await generateReadingPlan(aiPrompt, aiDays);
                    
                    setIsGeneratingPlan(false);
                    if (result.success && result.plan) {
                      setGeneratedPlan(result.plan);
                    } else {
                      setAiError(result.error || 'Erro ao gerar plano');
                    }
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                    isGeneratingPlan
                      ? "bg-[var(--surface-3)] text-[var(--text-bible-muted)] cursor-not-allowed"
                      : "bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] text-white hover:shadow-lg"
                  )}
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkle className="w-4 h-4" />
                      Gerar Plano
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
    </>
  );
};
