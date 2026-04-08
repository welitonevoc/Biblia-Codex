import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Sunrise, Moon, Sun, Sunset, Sparkles,
  ArrowLeft, BookOpen, PenLine, Heart, Calendar, Clock, User, ChevronRight as ChevronRightIcon,
  Share2, Play, CheckCircle2, Flame, BookMarked,
  Lightbulb, Quote, X
} from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { listDevotionalModules, loadDevotionalModule, getDevotionalForDay, getDayOfYear, DevotionalModuleData } from '../services/devotionalModuleService';
import { ParsedDevotional } from '../services/devotionalParser';
import { useAppContext } from '../AppContext';
import { BibleService } from '../BibleService';
import { Verse } from '../types';
import { myBibleBookIdToStandard } from '../services/devotionalParser';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DevotionalProps {
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
}

function getBookName(id: string): string {
  return BIBLE_BOOKS.find(b => b.id === id)?.name || id;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return { icon: Sunrise, label: 'Manhã', greeting: 'Bom dia', gradient: 'from-amber-500/20 via-orange-400/10 to-transparent', accent: '#f59e0b' };
  if (hour < 18) return { icon: Sun, label: 'Tarde', greeting: 'Boa tarde', gradient: 'from-blue-500/20 via-cyan-400/10 to-transparent', accent: '#0ea5e9' };
  if (hour < 22) return { icon: Sunset, label: 'Noite', greeting: 'Boa noite', gradient: 'from-indigo-500/20 via-purple-400/10 to-transparent', accent: '#6366f1' };
  return { icon: Moon, label: 'Noite', greeting: 'Boa noite', gradient: 'from-slate-600/20 via-slate-500/10 to-transparent', accent: '#94a3b8' };
}

function getMonthName(month: number): string {
  return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][month];
}

function getDayName(day: number): string {
  return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][day];
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return '#10b981';
  if (progress >= 50) return '#f59e0b';
  return '#6366f1';
}

const DAILY_VERSES = [
  { ref: 'Salmos 119:105', text: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.' },
  { ref: 'Provérbios 3:5-6', text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.' },
  { ref: 'Filipenses 4:13', text: 'Tudo posso naquele que me fortalece.' },
  { ref: 'Jeremias 29:11', text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor.' },
  { ref: 'Isaías 41:10', text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.' },
  { ref: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.' },
  { ref: 'Mateus 11:28', text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.' },
];

const REFLECTION_PROMPTS = [
  'O que este texto revela sobre o caráter de Deus?',
  'Como posso aplicar essa verdade na minha vida hoje?',
  'Há algo neste texto que me desafia ou me consola?',
  'Que promessa posso guardar no coração hoje?',
  'Como este texto se conecta com o evangelho?',
];

const DEVOTIONAL_COMPLETED_KEY = 'codex-devocional-completed';
const DEVOTIONAL_FAVORITES_KEY = 'codex-devocional-favorites';
const DEVOTIONAL_REFLECTIONS_KEY = 'codex-devocional-reflections';
const DEVOTIONAL_DAY_SEPARATOR = '::';

type ReferenceInfo = {
  ref: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
};

const buildCompletedDayKey = (moduleId: string, day: number) => `${moduleId}${DEVOTIONAL_DAY_SEPARATOR}${day}`;

function parseCompletedDayKey(entry: string): { moduleId: string; day: number } | null {
  if (typeof entry !== 'string' || !entry.trim()) return null;

  if (entry.includes(DEVOTIONAL_DAY_SEPARATOR)) {
    const [moduleId, dayText] = entry.split(DEVOTIONAL_DAY_SEPARATOR);
    const day = Number.parseInt(dayText, 10);
    return Number.isFinite(day) ? { moduleId, day } : null;
  }

  const legacySeparator = entry.lastIndexOf('-');
  if (legacySeparator <= 0) return null;

  const moduleId = entry.slice(0, legacySeparator);
  const day = Number.parseInt(entry.slice(legacySeparator + 1), 10);
  return Number.isFinite(day) ? { moduleId, day } : null;
}

function loadCompletedDayEntries(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEVOTIONAL_COMPLETED_KEY) || '[]');
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string');
    }
    if (parsed && typeof parsed === 'object') {
      return Object.keys(parsed);
    }
  } catch {}
  return [];
}

function getCompletedDaysByModule(entries: string[]): Record<string, number[]> {
  const byModule: Record<string, number[]> = {};

  entries.forEach((entry) => {
    const parsed = parseCompletedDayKey(entry);
    if (!parsed) return;
    if (!byModule[parsed.moduleId]) byModule[parsed.moduleId] = [];
    if (!byModule[parsed.moduleId].includes(parsed.day)) {
      byModule[parsed.moduleId].push(parsed.day);
    }
  });

  Object.values(byModule).forEach((days) => days.sort((a, b) => a - b));
  return byModule;
}

function getSuggestedDay(moduleData: DevotionalModuleData, completedDays: number[]): number {
  const uniqueDays = [...new Set(completedDays)].filter((day) => day >= 1 && day <= moduleData.totalDays);
  const firstIncomplete = Array.from({ length: moduleData.totalDays }, (_, index) => index + 1).find((day) => !uniqueDays.includes(day));
  return firstIncomplete ?? Math.min(moduleData.totalDays, Math.max(1, getDayOfYear()));
}

function decorateDevotionalHtml(html: string): string {
  return html.replace(
    /<a([^>]*?)href=['"]B:(\d+)\s+(\d+):(\d+)(?:-(\d+):(\d+))?['"]([^>]*)>([\s\S]*?)<\/a>/gi,
    (_match, before, bookNumber, chapter, verse, _rangeChapter, rangeVerse, after, label) => {
      const bookId = myBibleBookIdToStandard(Number.parseInt(bookNumber, 10));
      const safeLabel = label?.trim() || `${bookId} ${chapter}:${verse}`;
      const targetVerse = rangeVerse || verse;

      return `<a href="#" ${before || ''} ${after || ''} data-devotional-ref="true" data-book-id="${bookId}" data-chapter="${chapter}" data-verse="${verse}" data-end-verse="${targetVerse}" class="devo-inline-link">${safeLabel}</a>`;
    }
  );
}

function buildReferenceLabel(reference: ReferenceInfo): string {
  if (!reference.bookId || !reference.chapter) return reference.ref;
  return `${getBookName(reference.bookId)} ${reference.chapter}:${reference.verse ?? 1}`;
}

function resolveReferenceText(text: string): ReferenceInfo | null {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const sortedBooks = [...BIBLE_BOOKS].sort((a, b) => b.name.length - a.name.length);
  for (const book of sortedBooks) {
    const pattern = new RegExp(`^${book.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(\\d+):(\\d+)`, 'i');
    const match = cleanText.match(pattern);
    if (match) {
      return {
        ref: cleanText,
        bookId: book.id,
        chapter: Number.parseInt(match[1], 10),
        verse: Number.parseInt(match[2], 10),
      };
    }
  }

  return null;
}

// ─── Progress Ring Component ───────────────────────────────────────

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const actualColor = color || getProgressColor(progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-bible-accent/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ stroke: actualColor }}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black text-bible-accent">{progress}%</span>
      </div>

    </div>
  );
};

// ─── Day Selector Strip ────────────────────────────────────────────

const DaySelectorStrip: React.FC<{
  totalDays: number;
  currentDay: number;
  onDaySelect: (day: number) => void;
  completedDays?: number[];
}> = ({ totalDays, currentDay, onDaySelect, completedDays = [] }) => {
  const today = getDayOfYear();
  const startDay = Math.max(1, currentDay - 2);
  const endDay = Math.min(totalDays, currentDay + 2);
  const days = [];
  for (let d = startDay; d <= endDay; d++) days.push(d);

  return (
    <div className="flex items-center justify-center gap-2">
      {startDay > 1 && (
        <button
          onClick={() => onDaySelect(1)}
          className="w-10 h-14 rounded-2xl flex items-center justify-center text-[9px] font-bold text-bible-accent/20 hover:bg-bible-accent/5 transition-all"
        >
          1
        </button>
      )}
      {days.map(d => {
        const isCompleted = completedDays.includes(d);
        const isToday = d === today;
        const isCurrent = d === currentDay;

        return (
          <motion.button
            key={d}
            onClick={() => onDaySelect(d)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border",
              isCurrent
                ? "bg-bible-accent text-white border-bible-accent shadow-lg shadow-bible-accent/25 scale-105"
                : isToday
                  ? "border-bible-accent/30 bg-bible-accent/5 text-bible-accent"
                  : "border-bible-accent/5 text-bible-accent/40 hover:bg-bible-accent/5"
            )}
          >
            <span className={cn("text-xs font-bold", isCurrent && "text-white")}>{d}</span>
            {isCompleted && (
              <CheckCircle2 className={cn("w-3 h-3", isCurrent ? "text-white/80" : "text-emerald-500")} />
            )}
            {isToday && !isCurrent && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-bible-accent" />
            )}
          </motion.button>
        );
      })}
      {endDay < totalDays && (
        <button
          onClick={() => onDaySelect(totalDays)}
          className="w-10 h-14 rounded-2xl flex items-center justify-center text-[9px] font-bold text-bible-accent/20 hover:bg-bible-accent/5 transition-all"
        >
          {totalDays}
        </button>
      )}
    </div>
  );
};

// ─── Leitor de Devocional Premium ──────────────────────────────────

const VersePreviewModal: React.FC<{
  isOpen: boolean;
  loading: boolean;
  reference: ReferenceInfo | null;
  verseText: string | null;
  onClose: () => void;
  onOpenChapter: () => void;
}> = ({ isOpen, loading, reference, verseText, onClose, onOpenChapter }) => (
  <AnimatePresence>
    {isOpen && reference && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed inset-x-4 top-1/2 z-[130] mx-auto w-auto max-w-lg -translate-y-1/2"
        >
          <div className="premium-card rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="premium-kicker">Prévia do Versículo</span>
                <h3 className="font-display text-3xl font-semibold tracking-tight text-bible-text">
                  {buildReferenceLabel(reference)}
                </h3>
              </div>
              <button onClick={onClose} className="premium-icon-button rounded-2xl">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[24px] bg-bible-accent/5 p-5">
              {loading ? (
                <div className="flex min-h-[120px] items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-9 w-9 rounded-full border-2 border-bible-accent/15 border-t-bible-accent"
                  />
                </div>
              ) : (
                <p className="bible-text px-0 text-lg italic leading-relaxed text-bible-text/90">
                  {verseText || 'Não foi possível carregar o texto deste versículo.'}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={onClose} className="premium-button-secondary px-5 py-3 ui-text text-[11px] font-bold uppercase tracking-widest">
                Fechar
              </button>
              {reference.bookId && reference.chapter && (
                <button onClick={onOpenChapter} className="premium-button px-5 py-3 ui-text text-[11px] font-bold uppercase tracking-widest">
                  Abrir na Bíblia
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const DevotionalReader: React.FC<{
  moduleData: DevotionalModuleData;
  currentDay: number;
  onDayChange: (day: number) => void;
  onNavigate: (bookId: string, chapter: number, verse?: number) => void;
  onBack: () => void;
  onCompletedDaysChange: (days: number[]) => void;
}> = ({ moduleData, currentDay, onDayChange, onNavigate, onBack, onCompletedDaysChange }) => {
  const { settings, currentVersion } = useAppContext();
  const [parsed, setParsed] = useState<ParsedDevotional | null>(null);
  const [refs, setRefs] = useState<ReferenceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [previewReference, setPreviewReference] = useState<ReferenceInfo | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const reflectionKey = buildCompletedDayKey(moduleData.id, currentDay);
  const legacyReflectionKey = `${moduleData.id}-${currentDay}`;
  const progress = Math.round((new Set(completedDays).size / moduleData.totalDays) * 100);

  // Cores dinâmicas baseadas no módulo
  const colorPalettes = [
    { primary: '#6366f1', secondary: '#8b5cf6', accent: '#a78bfa' },
    { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#22d3ee' },
    { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
    { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
  ];
  const palette = colorPalettes[moduleData.id.length % colorPalettes.length];

  useEffect(() => {
    setLoading(true);
    setShowReflection(false);
    setPreviewReference(null);
    setPreviewText(null);
    getDevotionalForDay(moduleData.path, currentDay).then(result => {
      if (result) {
        setParsed(result.parsed);
        setRefs(result.refs);
      } else {
        setParsed(null);
        setRefs([]);
      }
      setLoading(false);
    });
  }, [moduleData.path, currentDay]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DEVOTIONAL_REFLECTIONS_KEY) || '{}');
      setReflection(saved[reflectionKey]?.text || saved[legacyReflectionKey]?.text || '');
      const favs = JSON.parse(localStorage.getItem(DEVOTIONAL_FAVORITES_KEY) || '[]');
      setFavorited(favs.includes(reflectionKey) || favs.includes(legacyReflectionKey));
      const completedEntries = loadCompletedDayEntries();
      const grouped = getCompletedDaysByModule(completedEntries);
      const nextCompletedDays = grouped[moduleData.id] || [];
      setCompletedDays(nextCompletedDays);
      onCompletedDaysChange(nextCompletedDays);
    } catch {
      setReflection('');
      setFavorited(false);
      setCompletedDays([]);
      onCompletedDaysChange([]);
    }
  }, [legacyReflectionKey, moduleData.id, onCompletedDaysChange, reflectionKey]);

  const handleSaveReflection = () => {
    if (!reflection.trim()) return;
    const saved = JSON.parse(localStorage.getItem(DEVOTIONAL_REFLECTIONS_KEY) || '{}');
    saved[reflectionKey] = { text: reflection, date: new Date().toISOString() };
    localStorage.setItem(DEVOTIONAL_REFLECTIONS_KEY, JSON.stringify(saved));

    // Marcar como completado
    const completed = loadCompletedDayEntries();
    if (!completed.includes(reflectionKey)) {
      completed.push(reflectionKey);
      localStorage.setItem(DEVOTIONAL_COMPLETED_KEY, JSON.stringify(completed));
      setCompletedDays(prev => {
        const next = prev.includes(currentDay) ? prev : [...prev, currentDay];
        onCompletedDaysChange(next);
        return next;
      });
    }
  };

  const handleToggleFavorite = () => {
    const favs: string[] = JSON.parse(localStorage.getItem(DEVOTIONAL_FAVORITES_KEY) || '[]');
    if (favs.includes(reflectionKey) || favs.includes(legacyReflectionKey)) {
      localStorage.setItem(DEVOTIONAL_FAVORITES_KEY, JSON.stringify(favs.filter(f => f !== reflectionKey && f !== legacyReflectionKey)));
      setFavorited(false);
    } else {
      favs.push(reflectionKey);
      localStorage.setItem(DEVOTIONAL_FAVORITES_KEY, JSON.stringify(favs));
      setFavorited(true);
    }
  };

  const handleOpenReferencePreview = useCallback(async (reference: ReferenceInfo) => {
    if (!reference.bookId || !reference.chapter) return;

    setPreviewReference(reference);
    setPreviewLoading(true);
    setPreviewText(null);

    try {
      const verses = await BibleService.getVerses(reference.bookId, reference.chapter, currentVersion || undefined, settings);
      const matchingVerse = verses.find((verse: Verse) => verse.verse === (reference.verse || 1));
      setPreviewText(matchingVerse?.text || null);
    } catch (error) {
      console.error('Erro ao carregar prévia do versículo do devocional:', error);
      setPreviewText(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [currentVersion, settings]);

  const handleBodyReferenceClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('[data-devotional-ref="true"]') as HTMLElement | null;
    if (!anchor) return;

    event.preventDefault();

    const bookId = anchor.getAttribute('data-book-id') || undefined;
    const chapter = Number.parseInt(anchor.getAttribute('data-chapter') || '', 10);
    const verse = Number.parseInt(anchor.getAttribute('data-verse') || '', 10);
    const label = (anchor.textContent || '').trim();

    handleOpenReferencePreview({
      ref: label,
      bookId,
      chapter: Number.isFinite(chapter) ? chapter : undefined,
      verse: Number.isFinite(verse) ? verse : undefined,
    });
  }, [handleOpenReferencePreview]);

  const reflectionPrompt = REFLECTION_PROMPTS[currentDay % REFLECTION_PROMPTS.length];
  const decoratedBody = parsed?.body ? decorateDevotionalHtml(parsed.body) : '';
  const decoratedMorningText = parsed?.morningText ? decorateDevotionalHtml(parsed.morningText) : '';
  const decoratedEveningText = parsed?.eveningText ? decorateDevotionalHtml(parsed.eveningText) : '';
  const uniqueRefs = refs.filter((reference, index, array) =>
    array.findIndex((entry) =>
      entry.bookId === reference.bookId &&
      entry.chapter === reference.chapter &&
      entry.verse === reference.verse &&
      entry.ref === reference.ref
    ) === index
  );

  return (
    <div className="min-h-full bg-gradient-to-b from-bible-bg to-bible-bg/50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-bible-bg/80 border-b border-bible-accent/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <motion.button
            onClick={onBack}
            whileTap={{ scale: 0.95 }}
            className="p-2 -ml-2 rounded-full hover:bg-bible-accent/5 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-bible-accent/60" />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleToggleFavorite}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2 rounded-full transition-all",
                favorited ? "text-red-500 bg-red-500/10" : "text-bible-accent/40 hover:text-bible-accent/60 hover:bg-bible-accent/5"
              )}
            >
              <Heart className="w-5 h-5" fill={favorited ? "currentColor" : "none"} />
            </motion.button>
            <button className="p-2 rounded-full text-bible-accent/40 hover:text-bible-accent/60 hover:bg-bible-accent/5">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 bg-bible-accent/5 mx-4">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: palette.primary, width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-bible-accent/10 border-t-bible-accent"
            />
            <p className="text-xs font-medium text-bible-accent/40 uppercase tracking-widest">Carregando devocional...</p>
          </div>
        ) : parsed ? (
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto space-y-8 pt-6"
          >
            {/* Hero Card with Date */}
            <motion.div
              className="relative overflow-hidden rounded-3xl p-6"
              style={{ background: `linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}08)` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: palette.primary }} />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: palette.secondary }} />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${palette.primary}20` }}>
                      <BookOpen className="w-4 h-4" style={{ color: palette.primary }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-bible-accent/40">{moduleData.author}</p>
                      <p className="text-xs font-semibold text-bible-accent/60 truncate max-w-[200px]">{moduleData.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-bible-accent/30">Dia</p>
                    <p className="text-2xl font-black text-bible-accent">{currentDay}</p>
                  </div>
                </div>

                {parsed.date && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bible-accent/30">{parsed.date}</p>
                  </div>
                )}

                {parsed.title && (
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-bible-accent leading-tight">
                    {parsed.title}
                  </h1>
                )}
              </div>
            </motion.div>

            {/* Day Selector Strip */}
            <DaySelectorStrip
              totalDays={moduleData.totalDays}
              currentDay={currentDay}
              onDaySelect={onDayChange}
              completedDays={completedDays}
            />

            {/* Scripture Card */}
            {parsed.verseText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-3xl p-6 md:p-8"
                style={{ background: `linear-gradient(135deg, ${palette.primary}08, ${palette.secondary}03)` }}
              >
                <div className="absolute top-4 left-6 text-6xl font-serif leading-none opacity-[0.04]" style={{ color: palette.primary }}>&ldquo;</div>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-bible-accent/30" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-bible-accent/40">Versículo</span>
                  </div>
                  <p className="text-lg md:text-xl font-serif italic text-bible-accent/80 leading-relaxed">
                    {parsed.verseText}
                  </p>
                  {parsed.verseRef && (
                    <button
                      onClick={() => {
                        const resolvedReference = uniqueRefs[0]
                          ? { ...uniqueRefs[0], ref: parsed.verseRef! }
                          : resolveReferenceText(parsed.verseRef!) || { ref: parsed.verseRef! };
                        handleOpenReferencePreview(resolvedReference);
                      }}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-bible-accent/40 hover:text-bible-accent transition-colors"
                    >
                      {parsed.verseRef}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Devotional Content */}
            {parsed.morningText ? (
              <div className="space-y-8">
                {/* Morning */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 flex items-center justify-center">
                      <Sunrise className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bible-accent/40">Meditação Matinal</span>
                  </div>
                  <div
                    onClick={handleBodyReferenceClick}
                    className="devo-body prose prose-bible max-w-none"
                    dangerouslySetInnerHTML={{ __html: decoratedMorningText }}
                  />
                </motion.div>

                {/* Evening */}
                {parsed.eveningText && (
                  <>
                    <div className="flex items-center gap-4 py-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-bible-accent/10 to-transparent" />
                      <Moon className="w-4 h-4 text-bible-accent/20" />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-bible-accent/10 to-transparent" />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bible-accent/40">Meditação Vespertina</span>
                      </div>
                      <div
                        onClick={handleBodyReferenceClick}
                        className="devo-body prose prose-bible max-w-none"
                        dangerouslySetInnerHTML={{ __html: decoratedEveningText }}
                      />
                    </motion.div>
                  </>
                )}
              </div>
            ) : parsed.body ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleBodyReferenceClick}
                className="devo-body prose prose-bible max-w-none"
                dangerouslySetInnerHTML={{ __html: decoratedBody }}
              />
            ) : null}

            {/* Bible References */}
            {refs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 pt-4"
              >
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-bible-accent/30" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-bible-accent/40">Referências Bíblicas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueRefs
                    .slice(0, 8)
                    .map((r, i) => (
                      <motion.button
                        key={`${r.ref}-${i}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenReferencePreview(r)}
                        disabled={!r.bookId}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all",
                          r.bookId
                            ? "bg-bible-accent/5 text-bible-accent/60 hover:bg-bible-accent/10 hover:text-bible-accent"
                            : "bg-bible-accent/3 text-bible-accent/25 cursor-not-allowed"
                        )}
                      >
                        <BookOpen className="w-3 h-3 opacity-50" />
                        {r.bookId ? `${getBookName(r.bookId)} ${r.chapter}:${r.verse}` : r.ref}
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Reflection Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 pt-6 border-t border-bible-accent/5"
            >
              <button
                onClick={() => setShowReflection(!showReflection)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-bible-accent/3 hover:bg-bible-accent/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    reflection ? "bg-amber-500/10" : "bg-bible-accent/5 group-hover:bg-bible-accent/10"
                  )}>
                    <PenLine className={cn("w-5 h-5", reflection ? "text-amber-500" : "text-bible-accent/40")} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-bible-accent">Minhas Reflexões</p>
                    <p className="text-[10px] text-bible-accent/40">
                      {reflection ? 'Reflexão salva' : 'Escreva suas impressões'}
                    </p>
                  </div>
                </div>
                <ChevronRightIcon className={cn("w-5 h-5 text-bible-accent/30 transition-transform", showReflection && "rotate-90")} />
              </button>

              <AnimatePresence>
                {showReflection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl border border-bible-accent/8 p-5 space-y-4 bg-bible-accent/3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500/60" />
                        <p className="text-[13px] italic text-bible-accent/50 leading-relaxed">&ldquo;{reflectionPrompt}&rdquo;</p>
                      </div>
                      <textarea
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="O que Deus tem falado com você hoje?"
                        className="w-full bg-transparent border-0 border-b border-bible-accent/10 pb-3 text-[15px] leading-relaxed text-bible-text/80 focus:outline-none focus:border-bible-accent/20 resize-none placeholder:text-bible-accent/15 transition-colors"
                        rows={5}
                      />
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveReflection}
                          disabled={!reflection.trim()}
                          className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-20 text-white shadow-lg shadow-bible-accent/20"
                          style={{ backgroundColor: palette.primary }}
                        >
                          Salvar Reflexão
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-bible-accent/5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDayChange(Math.max(1, currentDay - 1))}
                disabled={currentDay <= 1}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-bible-accent/40 hover:text-bible-accent/60 hover:bg-bible-accent/5 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Anterior</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDayChange(Math.min(moduleData.totalDays, currentDay + 1))}
                disabled={currentDay >= moduleData.totalDays}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-bible-accent/40 hover:text-bible-accent/60 hover:bg-bible-accent/5 disabled:opacity-20 transition-all"
              >
                <span className="text-sm font-semibold">Próximo</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-bible-accent/5 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-bible-accent/15" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-bold text-bible-accent/50">Devocional não disponível</p>
              <p className="text-sm text-bible-accent/30 max-w-[280px]">Este dia não contém conteúdo no módulo selecionado.</p>
            </div>
          </div>
        )}
      </div>

      <VersePreviewModal
        isOpen={!!previewReference}
        loading={previewLoading}
        reference={previewReference}
        verseText={previewText}
        onClose={() => {
          setPreviewReference(null);
          setPreviewText(null);
        }}
        onOpenChapter={() => {
          if (previewReference?.bookId && previewReference.chapter) {
            onNavigate(previewReference.bookId, previewReference.chapter, previewReference.verse);
            setPreviewReference(null);
            setPreviewText(null);
          }
        }}
      />
    </div>
  );
};

// ─── Componente Principal ──────────────────────────────────────

export const Devotional: React.FC<DevotionalProps> = ({ onNavigate }) => {
  const timeInfo = getTimeOfDay();
  const dailyVerse = DAILY_VERSES[new Date().getDay()];
  const now = new Date();

  const [devotionalModules, setDevotionalModules] = useState<DevotionalModuleData[]>([]);
  const [selectedModule, setSelectedModule] = useState<DevotionalModuleData | null>(null);
  const [moduleDay, setModuleDay] = useState(getDayOfYear());
  const [modulesLoading, setModulesLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<Record<string, number[]>>({});

  useEffect(() => {
    let cancelled = false;
    const loadModules = async () => {
      try {
        const modules = await listDevotionalModules();
        const loaded: DevotionalModuleData[] = [];
        for (const mod of modules) {
          try {
            const data = await loadDevotionalModule(mod.path);
            if (!cancelled) loaded.push(data);
          } catch (e) {
            console.error('Erro ao carregar módulo devocional:', mod.name, e);
          }
        }
        if (!cancelled) {
          setDevotionalModules(loaded);
        }
      } catch (e) {
        console.error('Erro ao listar módulos devocionais:', e);
      } finally {
        if (!cancelled) setModulesLoading(false);
      }
    };
    loadModules();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setCompletedDays(getCompletedDaysByModule(loadCompletedDayEntries()));
  }, []);

  // If a module is selected, show reader
  if (selectedModule) {
    return (
      <div className="h-full overflow-y-auto bg-bible-bg">
        <DevotionalReader
          moduleData={selectedModule}
          currentDay={moduleDay}
          onDayChange={setModuleDay}
          onNavigate={onNavigate}
          onBack={() => setSelectedModule(null)}
          onCompletedDaysChange={(days) => {
            setCompletedDays(prev => ({ ...prev, [selectedModule.id]: days }));
          }}
        />
      </div>
    );
  }

  // Main landing
  return (
    <div className="h-full overflow-y-auto bg-bible-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-b", timeInfo.gradient)} />

        <div className="relative max-w-lg mx-auto px-6 pt-12 pb-8 space-y-6">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bible-accent/10 flex items-center justify-center">
                <timeInfo.icon className="w-4 h-4 text-bible-accent" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-bible-accent/50">{timeInfo.greeting}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-bible-accent tracking-tight leading-[1.1]">
              Devocional
            </h1>
            <p className="text-sm text-bible-accent/40 font-medium">
              {getDayName(now.getDay())}, {now.getDate()} de {getMonthName(now.getMonth())}
            </p>
          </motion.div>

          {/* Daily Verse Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl p-6"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-indigo-500/20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl bg-purple-500/15" />
            <Sparkles className="absolute top-4 right-4 w-16 h-16 text-white/5" />

            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">Versículo do Dia</span>
              </div>
              <p className="text-lg font-serif italic text-white/90 leading-relaxed">&ldquo;{dailyVerse.text}&rdquo;</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{dailyVerse.ref}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 pb-12 space-y-8">
        {/* Loading */}
        {modulesLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-bible-accent/10 border-t-bible-accent"
            />
            <p className="text-xs font-medium text-bible-accent/40 uppercase tracking-widest">Carregando...</p>
          </div>
        )}

        {/* Empty State */}
        {!modulesLoading && devotionalModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center py-16 space-y-6"
          >
            <div className="w-24 h-24 rounded-3xl mx-auto bg-gradient-to-br from-bible-accent/10 to-bible-accent/5 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-bible-accent/30" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-bible-accent/60">Nenhum devocional</h2>
              <p className="text-sm text-bible-accent/30 max-w-[280px] mx-auto leading-relaxed">
                Importe arquivos <code className="bg-bible-accent/10 px-2 py-1 rounded-lg text-[11px]">.devotions.SQLite3</code> na tela de Módulos
              </p>
            </div>
          </motion.div>
        )}

        {/* Module List */}
        {!modulesLoading && devotionalModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-bible-accent/40">Seus Devocionais</h2>
                <p className="text-xs text-bible-accent/30 mt-0.5">{devotionalModules.length} {devotionalModules.length === 1 ? 'módulo' : 'módulos'} disponível{devotionalModules.length !== 1 ? 'is' : ''}</p>
              </div>
            </div>

            <div className="space-y-3">
              {devotionalModules.map((mod, idx) => {
                const colors = [
                  { from: '#6366f1', to: '#8b5cf6' },
                  { from: '#0ea5e9', to: '#06b6d4' },
                  { from: '#f59e0b', to: '#d97706' },
                  { from: '#10b981', to: '#059669' },
                  { from: '#ec4899', to: '#db2777' },
                ];
                const gradient = colors[idx % colors.length];
                const moduleCompleted = completedDays[mod.id] || [];
                const progress = Math.round((moduleCompleted.length / mod.totalDays) * 100);
                return (
                  <motion.button
                    key={mod.path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedModule(mod);
                      setModuleDay(getSuggestedDay(mod, moduleCompleted));
                    }}
                    className="w-full text-left rounded-3xl border border-bible-accent/6 hover:border-bible-accent/12 p-5 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}10)` }}
                      >
                        <BookOpen className="w-7 h-7" style={{ color: gradient.from }} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-bible-accent leading-tight truncate">{mod.name}</h3>
                            {mod.author && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <User className="w-3 h-3 text-bible-accent/30" />
                                <span className="text-[10px] text-bible-accent/40">{mod.author}</span>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            <ProgressRing progress={progress} size={48} strokeWidth={4} color={getProgressColor(progress)} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-bible-accent/30">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {mod.totalDays} dias
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {moduleCompleted.length} completos
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: `${gradient.from}10`, color: gradient.from }}
                          >
                            <Clock className="w-3 h-3" />
                            Continuar no dia {getSuggestedDay(mod, moduleCompleted)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedModule(mod);
                              setModuleDay(getSuggestedDay(mod, moduleCompleted));
                            }}
                            className="premium-button px-4 py-2 ui-text text-[10px] font-bold uppercase tracking-widest"
                          >
                            Continuar
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedModule(mod);
                              setModuleDay(1);
                            }}
                            className="premium-button-secondary px-4 py-2 ui-text text-[10px] font-bold uppercase tracking-widest"
                          >
                            Iniciar do dia 1
                          </button>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-bible-accent/10 group-hover:text-bible-accent/25 group-hover:translate-x-1 transition-all shrink-0 mt-6" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
