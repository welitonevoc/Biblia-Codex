import React from 'react';
import { Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface AudioSpeedSelectorProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const AudioSpeedSelector: React.FC<AudioSpeedSelectorProps> = ({
  currentSpeed,
  onSpeedChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Zap className="w-4 h-4 text-slate-600 dark:text-slate-400" />
      <div className="flex gap-1 flex-wrap">
        {SPEED_OPTIONS.map(speed => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={clsx(
              'px-3 py-1 rounded text-sm font-medium transition-all',
              Math.abs(currentSpeed - speed) < 0.01
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            )}
            title={`Velocidade: ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioSpeedSelector;
