import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Play, Library, CheckCircle2, Plus, X, ChevronRight, Calendar, Clock, BookOpen, Sparkles, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | boolean | undefined)[]) {
  return twMerge(clsx(inputs));
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
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6">
        
        {/* Header Premium */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-2xl p-5",
            "bg-[var(--surface-1)] border border-[var(--border-bible)]",
            "transition-all duration-300 hover:shadow-md"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--accent-bible) 0%, transparent 70%)'
            }}
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-[var(--accent-bible)]" />
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full",
                  "text-[10px] font-bold uppercase tracking-wider",
                  "bg-[var(--accent-bible)]/10 text-[var(--accent-bible)]"
                )}>
                  Planos de Leitura
                </span>
              </div>
              <h1 className={cn(
                "text-3xl font-bold text-[var(--text-bible)]",
                "tracking-tight"
              )} style={{ fontFamily: 'var(--font-display)' }}>
                Jornada Guiada
              </h1>
              <p className="mt-1 text-[var(--text-bible-muted)] text-sm">
                Organize sua leitura bíblica diária
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center justify-center h-11 w-11 rounded-xl",
                "bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)]",
                "shadow-lg shadow-[var(--accent-bible)]/20",
                "hover:bg-[var(--accent-bible-strong)] transition-all duration-200"
              )}
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
            { label: 'Planos ativos', value: '2', icon: Compass, color: 'blue' },
            { label: 'Dias concluídos', value: '12', icon: CheckCircle2, color: 'green' },
            { label: 'Este mês', value: '4d', icon: Calendar, color: 'amber' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              blue: 'bg-blue-500/10 text-blue-500',
              green: 'bg-green-500/10 text-green-500',
              amber: 'bg-amber-500/10 text-amber-500',
            };
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl",
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]"
                )}
              >
                <div className={cn("p-2 rounded-lg mb-2", colorClasses[stat.color])}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-[var(--text-bible)]">{stat.value}</span>
                <span className="text-xs text-[var(--text-bible-muted)] text-center mt-1">{stat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border-bible)]">
          {[
            { id: 'home', label: 'Meus Planos' },
            { id: 'custom', label: 'Personalizados' },
            { id: 'explore', label: 'Explorar' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-[var(--surface-0)] text-[var(--text-bible)] shadow-sm"
                  : "text-[var(--text-bible-muted)] hover:text-[var(--text-bible)]"
              )}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Plans List */}
        <div className="space-y-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {}}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl",
                  "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                  "text-left transition-all duration-200",
                  "hover:border-[var(--accent-bible)]/30 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br", plan.gradient,
                  "text-white shadow-lg"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[var(--text-bible)]">{plan.title}</h3>
                  <p className="text-sm text-[var(--text-bible-muted)] mt-0.5">{plan.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(plan.progress / plan.totalDays) * 100}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={cn("h-full rounded-full bg-gradient-to-r", plan.gradient)}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-bible-muted)] whitespace-nowrap">
                      {plan.progress}/{plan.totalDays}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--text-bible-subtle)]" />
              </motion.button>
            );
          })}
        </div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-[var(--text-bible-muted)] uppercase tracking-wider mb-3">
            Início rápido
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Ler Salmos 23', subtitle: '6 versículos', icon: BookOpen, color: 'green' },
              { title: 'João 3:16', subtitle: 'O amor de Deus', icon: Sparkles, color: 'purple' },
            ].map((item, index) => {
              const colorClasses: Record<string, string> = {
                green: 'bg-green-500/10 text-green-500',
                purple: 'bg-purple-500/10 text-purple-500',
              };
              return (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl",
                    "bg-[var(--surface-1)] border border-[var(--border-bible)]",
                    "text-left transition-all duration-200",
                    "hover:border-[var(--accent-bible)]/30 hover:shadow-sm"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", colorClasses[item.color])}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-bible)]">{item.title}</div>
                    <div className="text-xs text-[var(--text-bible-muted)]">{item.subtitle}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
};