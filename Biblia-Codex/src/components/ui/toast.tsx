import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    error: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] w-max max-w-[90vw]"
        >
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl",
            bgColors[type]
          )}>
            {icons[type]}
            <span className="text-sm font-bold text-bible-text tracking-tight">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
