import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Calendar, ChevronLeft, ChevronRight, X,
  Sun, Moon, Sparkles, BookMarked, Settings, Plus,
  ChevronDown, Play, Pause, Volume2, VolumeX, Loader
} from 'lucide-react';
import { cn } from '../utils/cn';
import DOMPurify from 'dompurify';
import initSqlJs from 'sql.js';
import { getDataUrl } from '../../utils/dataAssets';

interface DevotionalModule {
  id: string;
  name: string;
  description: string;
  language: string;
  path: string;
}

interface Devotion {
  day: number;
  title: string;
  content: string;
  verse?: string;
}

interface DevotionalPageProps {
  onClose?: () => void;
  onNavigate?: (bookId: number, chapter: number, verse?: number) => void;
}

const AVAILABLE_DEVOTIONALS: DevotionalModule[] = [
  { id: 'bom-dia', name: 'Bom Dia', description: 'Max Lucado - Volume 01', language: 'pt', path: 'Bom dia.365.devotions.zip' },
  { id: 'gcpa', name: 'GCPA', description: 'Gratidão Cada Dia', language: 'pt', path: 'GCPA.365.devotions.zip' },
  { id: 'jpav', name: 'JPAV', description: 'João Paulo Avante', language: 'pt', path: 'JPAV365.devotions.zip' },
  { id: 'wc-pt', name: 'Words of Christ', description: 'Palavras de Cristo', language: 'en', path: 'WC-pt.devotions.zip' },
  { id: 'spurgeon', name: 'Spurgeon', description: 'Charles Spurgeon Daily', language: 'en', path: 'Spurgeon365.devotions.zip' },
];

export function DevotionalPage({ onClose }: DevotionalPageProps) {
  const [modules] = useState<DevotionalModule[]>(AVAILABLE_DEVOTIONALS);
  const [selectedModule, setSelectedModule] = useState<DevotionalModule | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [currentDevotion, setCurrentDevotion] = useState<Devotion | null>(null);

  useEffect(() => {
    const today = new Date();
    setCurrentDay(today.getDate());
  }, []);

  const loadModule = async (module: DevotionalModule) => {
    setLoading(true);
    setError(null);
    setSelectedModule(module);
    setShowModuleSelector(false);

    try {
      const JSZip = (await import('jszip')).default;
      
      const url = getDataUrl(module.path);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      const zipData = await response.arrayBuffer();
      
      const zip = await JSZip.loadAsync(zipData);
      const dbFile = Object.keys(zip.files).find(f => f.endsWith('.SQLite3'));
      if (!dbFile) throw new Error('Arquivo SQLite não encontrado no ZIP');
      
      const file = zip.file(dbFile);
      if (!file) throw new Error('Erro ao acessar arquivo no ZIP');
      const dbBuffer = await file.async('arraybuffer');
      const dbData = new Uint8Array(dbBuffer);
      
      const SQL = await initSqlJs({
        locateFile: () => new URL('sql-wasm.wasm', import.meta.url).pathname
      }).catch(async () => {
        const response = await fetch('sql-wasm.wasm');
        if (!response.ok) throw new Error('Falha ao carregar sql-wasm.wasm');
        const wasmBinary = await response.arrayBuffer();
        return initSqlJs({ wasmBinary });
      });
      const db = new SQL.Database(dbData);

      const result = db.exec('SELECT day, devotion FROM devotions ORDER BY day');
      if (result.length > 0) {
        const parsedDevotions: Devotion[] = result[0].values.map((row: any[]) => {
          const html = row[1] as string;
          const titleMatch = html.match(/<p class="cap1">([^<]+)<\/p>/);
          const verseMatch = html.match(/<p class="Versiculo"><i>([^<]+)<\/i>/);
          return {
            day: row[0] as number,
            title: titleMatch ? titleMatch[1] : `Dia ${row[0]}`,
            content: html,
            verse: verseMatch ? verseMatch[1] : undefined
          };
        });
        setDevotions(parsedDevotions);
      } else {
        setError('Nenhum devocional encontrado');
      }
      db.close();
    } catch (err: any) {
      console.error('Error loading devotional:', err);
      setError(err.message || 'Erro ao carregar devocional');
    }

    setLoading(false);
  };

  const goToDay = (day: number) => {
    if (day < 1) day = 365;
    if (day > 365) day = 1;
    setCurrentDay(day);
  };

  useEffect(() => {
    if (devotions.length > 0) {
      const devotion = devotions.find(d => d.day === currentDay);
      setCurrentDevotion(devotion || devotions[0] || null);
    }
  }, [currentDay, devotions]);

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      const hasDevotion = devotions.some(d => d.day === i);
      const isToday = i === currentDay;
      const isPast = i < currentDay;

      days.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goToDay(i)}
          className={cn(
            'w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center',
            'border shadow-sm',
            isToday && 'bg-[var(--accent-bible)] text-white border-[var(--accent-bible)] shadow-float',
            !isToday && hasDevotion && 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)] border-[var(--accent-bible)]/20',
            !isToday && !hasDevotion && 'bg-[var(--surface-1)] text-[var(--text-bible-muted)] border-[var(--border-bible)]',
            isPast && !hasDevotion && 'opacity-40'
          )}
        >
          {i}
        </motion.button>
      );
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-[var(--bg-bible)]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--accent-bible)]/5 blur-3xl" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl border border-[var(--border-bible)] flex items-center justify-center bg-[var(--surface-1)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Loader className="w-6 h-6 text-[var(--accent-bible)]" />
            </motion.div>
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-sm font-medium text-[var(--text-bible-muted)]">
          Carregando devocional...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--bg-bible)]">
        <div className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: '#ef4444', opacity: 0.1 }}>
          <X className="w-8 h-8" style={{ color: '#ef4444' }} />
        </div>
        <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-bible)' }}>Erro ao carregar</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-bible-muted)' }}>{error}</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedModule(null)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent-bible)', color: 'white' }}>
          Voltar
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: 'var(--bg-bible)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.05 }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#8b5cf6', opacity: 0.05 }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="shrink-0 relative px-6 py-6 z-10"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="premium-kicker">Devocional Diário</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>
              {selectedModule ? selectedModule.name : 'Escolha sua Jornada'}
            </h1>
            {selectedModule && (
              <p className="text-sm mt-2 text-[var(--text-bible-muted)] max-w-sm">{selectedModule.description}</p>
            )}
          </div>
          {onClose && (
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={onClose} 
              className="p-3 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)] shadow-sm"
            >
              <X className="w-5 h-5 text-[var(--text-bible-muted)]" />
            </motion.button>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => setShowModuleSelector(!showModuleSelector)} 
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--accent-bible)] text-white shadow-lg shadow-[var(--accent-bible)]/20"
          >
            <Plus className="w-5 h-5" />
            Mudar Módulo
          </motion.button>

          {selectedModule && (
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => goToDay(new Date().getDate())} 
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[var(--surface-1)] border border-[var(--border-bible)] text-[var(--text-bible)] hover:shadow-md transition-shadow"
            >
              <Sun className="w-5 h-5 text-amber-500" />
              Retornar ao Hoje
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModuleSelector && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-4 mb-4 p-4 rounded-xl border z-20" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-bible)' }}>Selecione um devocional</h3>
            <div className="space-y-2">
              {modules.map(module => (
                <button key={module.id} onClick={() => loadModule(module)} className="w-full flex items-center justify-between p-3 rounded-lg transition-all" style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-bible)' }}>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-bible)' }}>{module.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-bible-muted)' }}>{module.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-bible-subtle)' }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedModule && !loading && (
        <>
          <div className="px-4 py-2 border-b overflow-x-auto" style={{ borderColor: 'var(--border-bible)' }}>
            <div className="flex items-center gap-1">
              <button onClick={() => goToDay(currentDay - 1)} className="p-1 rounded shrink-0 hover:bg-[var(--surface-2)]">
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
              </button>
              <div className="flex gap-1 overflow-x-auto py-1">
                {devotions.slice(0, 365).map(d => (
                  <button
                    key={d.day}
                    onClick={() => setCurrentDay(d.day)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-xs font-medium shrink-0 transition-all',
                      d.day === currentDay && 'bg-[var(--accent-bible)] text-white',
                      d.day !== currentDay && 'bg-[var(--surface-2)] hover:bg-[var(--accent-bible)]/20',
                      d.day !== currentDay && 'text-[var(--text-bible)]'
                    )}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
              <button onClick={() => goToDay(currentDay + 1)} className="p-1 rounded shrink-0 hover:bg-[var(--surface-2)]">
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentDevotion && (
              <motion.div key={currentDay} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.15 }}>
                    <Calendar className="w-6 h-6" style={{ color: 'var(--accent-bible)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-bible-muted)' }}>Dia {currentDay}</p>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>{currentDevotion.title}</h2>
                  </div>
                </div>

                {currentDevotion.verse && (
                  <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.1, borderColor: 'var(--accent-bible)' }}>
                    <p className="text-sm italic" style={{ color: 'var(--accent-bible)' }}>"{currentDevotion.verse}"</p>
                  </div>
                )}

                <div 
                  className="p-4 rounded-xl border prose prose-sm max-w-none bible-text-content"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentDevotion.content) }}
                />
              </motion.div>
            )}
          </div>
        </>
      )}

      {!selectedModule && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-bible)', opacity: 0.1 }}>
            <BookMarked className="w-10 h-10" style={{ color: 'var(--accent-bible)' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-bible)' }}>Bem-vindo aos Devocionais</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-bible-muted)' }}>Escolha um devocional para começar sua leitura diária</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => loadModule(modules[0])} className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium" style={{ backgroundColor: 'var(--accent-bible)', color: 'white' }}>
            <BookOpen className="w-5 h-5" />
            Começar com "Bom Dia"
          </motion.button>
        </div>
      )}
    </div>
  );
}