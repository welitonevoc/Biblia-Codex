import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Download,
  BookOpen,
  Cloud,
  Check,
  AlertCircle,
  Settings
} from 'lucide-react';
import {
  ensureStoragePermission,
  openAppSettings,
  getPermissionErrorMessage
} from '../services/permissionsService';
import { Capacitor } from '@capacitor/core';

interface PermissionScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface BenefitItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

const benefits: BenefitItem[] = [
  {
    icon: Download,
    title: 'Importar Módulos',
    description: 'Comentários, dicionários e mapas bíblicos',
  },
  {
    icon: BookOpen,
    title: 'Leitura Offline',
    description: 'Acesse seus módulos sem internet',
  },
  {
    icon: Cloud,
    title: 'Backup Automático',
    description: 'Salve seu progresso na nuvem',
  },
];

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);

  const isAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  const handleGrant = async () => {
    setLoading(true);
    setError(null);

    try {
      const granted = await ensureStoragePermission();

      if (granted) {
        // Sucesso!
        onComplete();
      } else {
        // Permissão negada
        setError(
          'Permissão negada. Você pode conceder nas configurações.'
        );
        setShowSettingsPrompt(true);
      }
    } catch (err: any) {
      console.error('Erro ao solicitar permissão:', err);
      setError(getPermissionErrorMessage({
        storage: 'denied',
        canAccessStorage: false,
      }));
      setShowSettingsPrompt(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await openAppSettings();
      // Após abrir configurações, verificar se usuário concedeu
      setTimeout(async () => {
        const granted = await ensureStoragePermission();
        if (granted) {
          onComplete();
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao abrir configurações:', err);
    }
  };

  const handleSkip = () => {
    // Usuário escolheu "Depois"
    if (onSkip) {
      onSkip();
    } else {
      // Se não tem onSkip, completa mesmo assim
      onComplete();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-auto premium-scroll">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Ícone */}
        <div className="w-24 h-24 bg-bible-accent rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-bible-accent/20">
          <Lock className="w-12 h-12 text-bible-bg" />
        </div>

        {/* Título e Descrição */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold text-bible-text">
            Permissões Necessárias
          </h2>
          <p className="ui-text text-bible-text/60 leading-relaxed">
            Para sua experiência completa no app
          </p>
        </div>

        {/* Benefícios */}
        <div className="space-y-4 py-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 bg-bible-accent/5 border border-bible-accent/10 rounded-3xl p-5"
            >
              <div className="w-12 h-12 bg-bible-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                <benefit.icon className="w-6 h-6 text-bible-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-bible-text text-base">
                  {benefit.title}
                </h3>
                <p className="ui-text text-bible-text/50 text-sm mt-1">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="ui-text text-red-400 text-sm font-bold">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* Prompt para abrir configurações */}
        {showSettingsPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-amber-500" />
              <span className="ui-text text-amber-500 text-xs font-bold uppercase tracking-widest">
                Configurações Necessárias
              </span>
            </div>
            <p className="ui-text text-bible-text/70 text-sm">
              Toque abaixo para abrir as configurações e conceder permissão manualmente.
            </p>
            <button
              onClick={handleOpenSettings}
              className="w-full bg-amber-500 text-bible-bg py-3 rounded-xl font-bold ui-text text-xs uppercase tracking-widest"
            >
              Abrir Configurações
            </button>
          </motion.div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3 pt-4">
          {isAndroid ? (
            <>
              <button
                onClick={handleGrant}
                disabled={loading}
                className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20 hover:shadow-2xl hover:shadow-bible-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-4 h-4 border-2 border-bible-bg/30 border-t-bible-bg rounded-full animate-spin" />
                    <span>Concedendo...</span>
                  </span>
                ) : (
                  'Conceder Permissões'
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full ui-text text-xs font-bold uppercase tracking-widest text-bible-text/40 hover:text-bible-text/60 transition-colors disabled:opacity-50"
              >
                Depois
              </button>
            </>
          ) : (
            // Web ou outras plataformas - pula automaticamente
            <button
              onClick={onComplete}
              className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20"
            >
              Continuar
            </button>
          )}
        </div>

        {/* Nota informativa */}
        {isAndroid && (
          <p className="ui-text text-[10px] text-bible-text/30 text-center leading-relaxed">
            Você pode alterar isso nas configurações a qualquer momento
          </p>
        )}
      </motion.div>
    </div>
  );
};
