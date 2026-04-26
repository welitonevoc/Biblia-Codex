import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, Palette, Sparkles, Database, HelpCircle,
  Settings2, ChevronRight, Sun, Type, Layout, Navigation2,
  BookOpen, Brain, MessageSquare, Languages, Volume2,
  Download, Globe, Shield, Key, Zap, ArrowLeft
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { cn } from '../utils/cn';
import { AppearanceSettings } from './AppearanceSettings';
import { TTSSettings } from './TTSSettings';

const SettingCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}> = ({ icon: Icon, title, description, onClick, badge, disabled }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-bible)] text-left transition-all",
      "hover:bg-[var(--surface-2)] hover:border-[var(--accent-bible)]/30 hover:shadow-md",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-bible-accent/10 flex-shrink-0">
        <Icon className="w-5 h-5 text-bible-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-bible-text truncate">{title}</h3>
          {badge && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-bible-accent text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-bible-text-muted leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-bible-text-muted flex-shrink-0 mt-1" />
    </div>
  </motion.button>
);

export const SettingsDashboard: React.FC = () => {
  const { setActiveTab } = useAppContext();
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  // Render sub-section if active
  if (activeSubSection === 'appearance') {
    return <AppearanceSettings />;
  }
  if (activeSubSection === 'tts') {
    return <TTSSettings />;
  }

  const settingsSections = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: User,
      description: 'Gerencie seu perfil, avatar, conta e progresso',
      items: [
        {
          id: 'profile',
          title: 'Perfil do Usuário',
          description: 'Nome, avatar, nível e estatísticas',
          icon: User,
          onClick: () => setActiveTab('profile')
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Aparência',
      icon: Palette,
      description: 'Personalize cores, fontes e interface visual',
      items: [
        {
          id: 'theme',
          title: 'Tema',
          description: 'Modo claro/escuro e esquema de cores',
          icon: Sun,
          onClick: () => setActiveSubSection('appearance')
        },
        {
          id: 'typography',
          title: 'Tipografia',
          description: 'Fonte, tamanho e espaçamento do texto',
          icon: Type,
          onClick: () => setActiveSubSection('appearance')
        },
        {
          id: 'ui-geometry',
          title: 'Geometria da Interface',
          description: 'Formas e estilos dos elementos visuais',
          icon: Layout,
          onClick: () => setActiveSubSection('appearance')
        },
        {
          id: 'navigation',
          title: 'Navegação',
          description: 'Estilo de navegação e animações',
          icon: Navigation2,
          onClick: () => setActiveSubSection('appearance')
        },
        {
          id: 'effects',
          title: 'Efeitos Visuais',
          description: 'Animações, transições e efeitos especiais',
          icon: Sparkles,
          onClick: () => setActiveSubSection('appearance')
        }
      ]
    },
    {
      id: 'modules',
      title: 'Módulos',
      icon: Database,
      description: 'Gerencie comentários, dicionários e recursos',
      items: [
        {
          id: 'modules',
          title: 'Gerenciar Módulos',
          description: 'Instalar, atualizar e organizar módulos',
          icon: Database,
          onClick: () => setActiveTab('modules')
        }
      ]
    },
    {
      id: 'tts',
      title: 'Text-to-Speech',
      icon: Volume2,
      description: 'Configurações de leitura por voz',
      items: [
        {
          id: 'tts',
          title: 'Configurações TTS',
          description: 'Voz, velocidade e idioma da síntese',
          icon: Volume2,
          onClick: () => setActiveSubSection('tts')
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'Assistente IA',
      icon: Brain,
      description: 'Configure IA para estudo bíblico personalizado',
      items: [
        {
          id: 'ai-provider',
          title: 'Provedor de API',
          description: 'Escolha provedor e configure chaves',
          icon: Key,
          onClick: () => setActiveTab('ai-assistant')
        },
        {
          id: 'ai-functions',
          title: 'Funções de IA',
          description: 'Ativar/desativar recursos de IA',
          icon: Zap,
          onClick: () => setActiveTab('ai-assistant')
        },
        {
          id: 'theological-profile',
          title: 'Perfil Teológico',
          description: 'Perspectiva teológica para respostas',
          icon: BookOpen,
          onClick: () => setActiveTab('ai-assistant')
        },
        {
          id: 'study-ai',
          title: 'Estudo com IA',
          description: 'Configurações específicas para estudo',
          icon: MessageSquare,
          onClick: () => setActiveTab('ai-assistant')
        }
      ]
    },
    {
      id: 'support',
      title: 'Suporte',
      icon: HelpCircle,
      description: 'Ajuda, documentação e contato',
      items: [
        {
          id: 'support',
          title: 'Centro de Suporte',
          description: 'Ajuda, tutoriais e contato',
          icon: HelpCircle,
          onClick: () => setActiveTab('support')
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-[var(--accent-bible)]/10 shadow-inner-glow">
              <Settings2 className="w-8 h-8 text-[var(--accent-bible)]" />
            </div>
            <div className="text-center">
              <span className="premium-kicker mb-2">Painel de Controle</span>
              <h1 className="text-3xl font-bold text-[var(--text-bible)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Configurações</h1>
              <p className="text-sm text-[var(--text-bible-muted)]">Ajuste cada detalhe da sua experiência</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="space-y-4"
          >
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--accent-bible)]/10">
                <section.icon className="w-5 h-5 text-[var(--accent-bible)]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-bible)]/60">Seção</span>
                <h2 className="text-xl font-bold text-[var(--text-bible)]">{section.title}</h2>
              </div>
            </div>

            {/* Section Items */}
            <div className="grid gap-3">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                >
                  <SettingCard
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onClick={item.onClick}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-8 border-t border-bible-border"
        >
          <p className="text-xs text-bible-text-muted">
            Versão 1.0.0 • Bíblia Codex
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};