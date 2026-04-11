import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Play, Library, CheckCircle2, Plus, X, ChevronRight, Calendar, Clock, BookOpen, Sparkles, Target, ArrowRight } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

export const ReadingPlans: React.FC<{ onNavigate: (bookId: string, chapter: number, verse?: number) => void }> = ({ onNavigate }) => {
  const { settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'home' | 'custom' | 'explore'>('home');

  const plans = [
    {
      id: 1,
      title: 'Bíblia em 1 Ano',
      description: 'Leia a Bíblia completa em 365 dias',
      progress: 0,
      totalDays: 365,
      icon: BookOpen,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      id: 2,
      title: 'Novo Testamento',
      description: 'Foque nos evangelhos e epístolas',
      progress: 0,
      totalDays: 180,
      icon: Target,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 3,
      title: 'Salmos e Provérbios',
      description: 'Sabedoria e adoração diária',
      progress: 0,
      totalDays: 60,
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-bible-accent" />
                <span className="premium-kicker">Planos de Leitura</span>
              </div>
              <h1 className="premium-title mt-2 mb-1">Jornada Guiada</h1>
              <p className="premium-subtitle text-sm">
                Organize sua leitura bíblica diária
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="premium-button p-3"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Ativos', value: 0, icon: Play, color: 'text-green-600', bg: 'bg-green-500/10' },
            { label: 'Salvos', value: 0, icon: Library, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            { label: 'Concluídos', value: 0, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-500/10' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="premium-card p-4 text-center"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${item.bg} mb-2`}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="text-2xl font-bold text-bible-text">{item.value}</div>
              <div className="text-xs text-bible-text-muted mt-0.5">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Premium */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 p-1 premium-card"
        >
          {['home', 'custom', 'explore'].map(tab => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                activeTab === tab
                  ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong text-white shadow-md'
                  : 'text-bible-text-muted hover:text-bible-text'
              )}
            >
              {tab === 'home' ? 'Início' : tab === 'custom' ? 'Personalizados' : 'Explorar'}
            </motion.button>
          ))}
        </motion.div>

        {/* Plans List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {plans.map((plan, i) => (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigate('GEN', 1)}
              className="premium-card p-5 w-full text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-bible-text mb-1">{plan.title}</h3>
                  <p className="text-xs text-bible-text-muted mb-3">{plan.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-bible-surface overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${plan.gradient}`}
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-bible-text-muted">{plan.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-bible-text-muted" />
                    <span className="text-xs text-bible-text-muted">{plan.totalDays} dias</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-bible-text-muted group-hover:text-bible-accent group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Empty State */}
        {plans.every(p => p.progress === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="premium-card-soft p-12 text-center"
          >
            <div className="inline-flex p-4 rounded-2xl bg-bible-accent/10 mb-4">
              <Calendar className="w-10 h-10 text-bible-accent" />
            </div>
            <h3 className="text-lg font-bold text-bible-text mb-2">Nenhum plano ativo</h3>
            <p className="text-sm text-bible-text-muted mb-4">
              Escolha um plano para começar sua jornada de leitura
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="premium-button px-6 py-3 inline-flex items-center gap-2"
            >
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
