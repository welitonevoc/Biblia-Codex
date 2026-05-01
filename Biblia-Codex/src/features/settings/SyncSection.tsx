import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, RefreshCw, CheckCircle, AlertCircle, Clock, Database, BookMarked, FileText, X, HardDrive, CloudOff } from 'lucide-react';
import { useAppContext } from '../../app/AppContext';
import { useNotesStore } from '../../stores/notesStore';
import { cn } from '../../utils/cn';

export const SyncSection: React.FC = () => {
  const { user, syncNow, settings } = useAppContext();
  const { bookmarks, notes, loadBookmarks, loadNotes } = useNotesStore();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(settings.syncConfig?.lastSyncedAt ?? null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadBookmarks();
    loadNotes();
  }, [loadBookmarks, loadNotes]);

  useEffect(() => {
    if (settings.syncConfig?.lastSyncedAt) {
      setLastSyncTime(settings.syncConfig.lastSyncedAt);
    }
  }, [settings.syncConfig?.lastSyncedAt]);

  const handleSync = useCallback(async () => {
    if (!user) return;

    setSyncStatus('syncing');
    setSyncMessage('');

    try {
      await syncNow();
      setSyncStatus('success');
      setSyncMessage('Sincronização concluída com sucesso!');
      setLastSyncTime(Date.now());

      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 3000);
    } catch (error: any) {
      setSyncStatus('error');
      setSyncMessage(error.message || 'Erro durante a sincronização');
    }
  }, [user, syncNow]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--text-bible-muted)]" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'success':
        return 'Sincronizado';
      case 'error':
        return 'Erro na sincronização';
      default:
        return lastSyncTime ? `Última: ${formatTime(lastSyncTime)}` : 'Não sincronizado';
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[var(--accent-bible)]/10">
            <CloudOff className="w-5 h-5 text-[var(--accent-bible)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-bible)]">Sincronização</h3>
            <p className="text-xs text-[var(--text-bible-muted)]">Faça login para sincronizar dados</p>
          </div>
        </div>
        <div className="text-center py-4">
          <Cloud className="w-12 h-12 text-[var(--text-bible-subtle)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-bible-muted)] mb-1">Sincronização em nuvem</p>
          <p className="text-xs text-[var(--text-bible-subtle)]">Seus marcadores e notas serão salvos na nuvem</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-bible)]/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-bible)]/10 shadow-[0_0_12px_rgba(var(--accent-bible-rgb),0.15)]">
              <Cloud className="w-5 h-5 text-[var(--accent-bible)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-bible)]">Sincronização</h3>
              <p className="text-xs text-[var(--text-bible-muted)]">Mantenha seus dados seguros na nuvem</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-[var(--accent-bible)] hover:underline cursor-pointer"
          >
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30">
          {getStatusIcon()}
          <span className="text-xs text-[var(--text-bible-muted)] flex-1">{getStatusText()}</span>
          {syncStatus === 'syncing' && (
            <span className="text-[10px] text-blue-500 animate-pulse">Processando...</span>
          )}
        </div>
      </div>

      {/* Sync Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-3 border-b border-[var(--border-bible)]/50">
              {/* Local Data Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30">
                  <BookMarked className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-xs text-[var(--text-bible-muted)]">Marcadores</p>
                    <p className="text-sm font-bold text-[var(--text-bible)]">{bookmarks.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-[var(--text-bible-muted)]">Notas</p>
                    <p className="text-sm font-bold text-[var(--text-bible)]">{notes.length}</p>
                  </div>
                </div>
              </div>

              {/* Cloud Status */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-bible)] border border-[var(--border-bible)]/30">
                <HardDrive className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-xs text-[var(--text-bible-muted)]">Armazenamento</p>
                  <p className="text-xs text-[var(--text-bible)]">Firestore (Firebase)</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                  Conectado
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Message */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "px-5 py-3 text-xs flex items-center gap-2",
              syncStatus === 'success' && "bg-green-500/10 text-green-600",
              syncStatus === 'error' && "bg-red-500/10 text-red-600"
            )}
          >
            {syncStatus === 'success' ? (
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            {syncMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="p-5">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200",
            "flex items-center justify-center gap-2",
            "cursor-pointer",
            syncStatus === 'syncing'
              ? "bg-[var(--surface-bible)] text-[var(--text-bible-muted)] cursor-not-allowed"
              : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible)]/90 shadow-[0_0_20px_rgba(var(--accent-bible-rgb),0.3)]"
          )}
          aria-label="Sincronizar agora dados com a nuvem"
        >
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sincronizar Agora
            </>
          )}
        </motion.button>

        <p className="text-[10px] text-[var(--text-bible-subtle)] text-center mt-3">
          Sincroniza marcadores, notas e configurações
        </p>
      </div>
    </motion.div>
  );
};
