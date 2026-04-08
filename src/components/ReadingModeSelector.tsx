import React from 'react';
import { BookOpen, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

export type ReadingMode = 'text' | 'audio' | 'both';

interface ReadingModeSelectorProps {
  mode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
  hasAudio?: boolean;
  className?: string;
}

export const ReadingModeSelector: React.FC<ReadingModeSelectorProps> = ({
  mode,
  onModeChange,
  hasAudio = true,
  className = ''
}) => {
  return (
    <div className={`flex gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`}>
      <button
        onClick={() => onModeChange('text')}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm',
          mode === 'text'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        )}
        title="Modo de leitura em texto"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Texto</span>
      </button>

      {hasAudio && (
        <>
          <button
            onClick={() => onModeChange('audio')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm',
              mode === 'audio'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
            title="Modo de leitura em áudio"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Áudio</span>
          </button>

          <button
            onClick={() => onModeChange('both')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium text-sm',
              mode === 'both'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
            title="Modo de leitura em texto e áudio"
          >
            <BookOpen className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Ambos</span>
          </button>
        </>
      )}
    </div>
  );
};

export default ReadingModeSelector;
