import React from 'react';
import { useAppContext } from '../AppContext';
import { ChevronDown, BookOpen, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

export const VersionSelector: React.FC = () => {
  const { availableVersions, currentVersion, selectVersion } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(false);

  if (availableVersions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded border border-bible-border bg-bible-surface p-4 text-left hover:border-bible-accent/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-bible-accent/10 text-bible-accent">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-bible-text-muted">Versão</div>
            <div className="text-sm font-medium text-bible-text mt-0.5">
              {currentVersion ? currentVersion.name : 'Selecione'}
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-10 mt-2 w-full rounded border border-bible-border bg-bible-bg p-2"
          >
            {availableVersions.map((version) => (
              <button
                key={version.id}
                onClick={() => {
                  selectVersion(version);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm",
                  currentVersion?.id === version.id
                    ? "bg-bible-accent text-bible-bg"
                    : "hover:bg-bible-surface text-bible-text"
                )}
              >
                <span className="font-medium">{version.name}</span>
                {currentVersion?.id === version.id && <Check className="h-3 w-3" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};