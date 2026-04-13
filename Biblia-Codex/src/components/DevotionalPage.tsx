import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Calendar, ChevronLeft, ChevronRight, X,
  Sun, Moon, Sparkles, BookMarked, Settings, Plus,
  ChevronDown, Play, Pause, Volume2, VolumeX, Loader
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
}

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
}

const AVAILABLE_DEVOTIONALS: DevotionalModule[] = [
  { id: 'bom-dia', name: 'Bom Dia', description: 'Max Lucado - Volume 01', language: 'pt', path: 'Bom dia.365.devotions.zip' },
  { id: 'gcpa', name: 'GCPA', description: 'Gratidão Cada Dia', language: 'pt', path: 'GCPA.365.devotions.zip' },
  { id: 'jpav', name: 'JPAV', description: 'João Paulo Avante', language: 'pt', path: 'JPAV365.devotions.zip' },
  { id: 'wc-pt', name: 'Words of Christ', description: 'Palavras de Cristo', language: 'en', path: 'WC-pt.devotions.zip' },
  { id: 'spurgeon', name: 'Spurgeon', description: 'Charles Spurgeon Daily', language: 'en', path: 'Spurgeon365.devotions.zip' },
];

async function extractSqlFromZip(zipData: Uint8Array): Promise<Uint8Array> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipData);
  
  const dbFile = Object.keys(zip.files).find(f => f.endsWith('.SQLite3'));
  if (!dbFile) {
    throw new Error('No database file found in archive');
  }
  
  const dbData = await zip.file(dbFile).async('arraybuffer');
  return new Uint8Array(dbData);
}

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
      const response = await fetch(`/${module.path}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const zipData = await response.arrayBuffer();
      const dbData = await extractSqlFromZip(zipData);
      
      const initSqlJs = await import('sql.js');
      const SQL = await initSqlJs.default({
        locateFile: () => '/sql-wasm.wasm'
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
        setError('Nenhum devocional encontrado neste módulo');
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
        <button
          key={i}
          onClick={() => goToDay(i)}
          className={cn(
            'w-10 h-10 rounded-lg text-sm font-medium transition-all',
            hasDevotion && 'bg-[var(--accent-bible)]/10 text-[var(--accent-bible)] hover:bg-[var(--accent-bible)]/20',
            !hasDevotion && 'text-[var(--text-bible-subtle)]',
            isToday && 'ring-2 ring-[var(--accent-bible)]',
            isPast && !hasDevotion && 'opacity-30'
          )}
        >
          {i}
        </button>
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

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 relative px-4 py-4 z-10">
        <div className="absolute inset-0 border-b" style={{ borderColor: 'var(--border-bible)' }} />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookMarked className="w-4 h-4" style={{ color: 'var(--accent-bible)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-bible)' }}>Devocional</span>
              </div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-bible)', fontFamily: 'var(--font-display)' }}>
                {selectedModule ? selectedModule.name : 'Escolha um devocional'}
              </h1>
              {selectedModule && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-bible-muted)' }}>{selectedModule.description}</p>
              )}
            </div>
            {onClose && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
              </motion.button>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModuleSelector(!showModuleSelector)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent-bible)', color: 'white' }}>
              <Plus className="w-4 h-4" />
              Módulos
            </motion.button>

            {selectedModule && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => goToDay(new Date().getDate())} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border-bible)', color: 'var(--text-bible)' }}>
                <Sun className="w-4 h-4" />
                Hoje
              </motion.button>
            )}
          </div>
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
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-bible)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-bible-muted)' }}>Calendário</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => goToDay(currentDay - 1)} className="p-1 rounded hover:bg-[var(--surface-2)]">
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
                </button>
                <span className="text-sm font-medium px-2" style={{ color: 'var(--text-bible)' }}>Dia {currentDay}</span>
                <button onClick={() => goToDay(currentDay + 1)} className="p-1 rounded hover:bg-[var(--surface-2)]">
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-bible-muted)' }} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] text-center font-medium" style={{ color: 'var(--text-bible-subtle)' }}>{d}</span>
              ))}
              {renderCalendar()}
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
                  className="p-4 rounded-xl border prose prose-sm max-w-none"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-bible)' }}
                  dangerouslySetInnerHTML={{ __html: currentDevotion.content }}
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