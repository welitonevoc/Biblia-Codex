import React from 'react';
import { useAppContext } from '../AppContext';
import { ChevronDown, BookOpen, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VersionSelector: React.FC = () => {
  const { availableVersions, currentVersion, selectVersion } = useAppContext();
  const [isOpen, setIsOpen] = React.useState(false);

  if (availableVersions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="premium-card-soft flex w-full items-center justify-between rounded-[28px] p-5 text-left transition-all hover:border-bible-accent/20"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-bible-accent/10 text-bible-accent">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="premium-section-title opacity-75">Versão Bíblica</div>
            <div className="ui-text mt-2 text-sm font-bold text-bible-text">
              {currentVersion ? currentVersion.name : 'Selecione uma versão'}
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="premium-card absolute z-10 mt-3 w-full rounded-[28px] p-2"
          >
            {availableVersions.map((version) => (
              <button
                key={version.id}
                onClick={() => {
                  selectVersion(version);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left transition-all",
                  currentVersion?.id === version.id
                    ? "bg-bible-accent text-bible-bg"
                    : "hover:bg-bible-accent/8 text-bible-text"
                )}
              >
                <span className="ui-text text-sm font-bold">{version.name}</span>
                {currentVersion?.id === version.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
