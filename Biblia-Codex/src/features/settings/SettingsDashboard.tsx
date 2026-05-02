import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Palette, Sparkles, Database, HelpCircle,
  Settings2, ChevronRight, Sun, Type, Layout, Navigation2,
  BookOpen, Brain, MessageSquare, Languages, Volume2,
  Download, Globe, Shield, Key, Zap, ChevronLeft, Cloud, RefreshCw,
  X, BookMarked, Map, Calendar, Heart, Tag, Share2, Search,
  Mic, BookOpen as BookOpenIcon, GraduationCap, FileText,
  CloudUpload, Smartphone, Languages as LanguagesIcon
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { cn } from '../utils/cn';
import { AppearanceSettings } from './AppearanceSettings';
import { TTSSettings } from './TTSSettings';
import { SyncSection } from './SyncSection';

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
        "w-full p-5 rounded-2xl premium-card hover:premium-card-strong text-left transition-all duration-300",
        "hover:shadow-lg hover:border-[var(--accent-bible)]/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--accent-bible)]/10 flex-shrink-0 shadow-[0_0_12px_rgba(var(--accent-bible-rgb),0.15)]">
          <Icon className="w-5 h-5 text-[var(--accent-bible)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-[var(--text-bible)] truncate">{title}</h3>
            {badge && (
              <span className="premium-kicker !py-0.5 !px-2 !text-[10px]">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-bible-muted)] leading-relaxed">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--text-bible-subtle)] flex-shrink-0 mt-1 group-hover:text-[var(--accent-bible)] transition-colors" />
      </div>
    </motion.button>
  );

export const SettingsDashboard: React.FC = () => {
  const { setActiveTab, settings } = useAppContext();
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Go back to main reader view
  const handleClose = () => setActiveTab('bible');

  // Render sub-section if active
  const handleBack = () => setActiveSubSection(null);
  
  if (activeSubSection === 'appearance') {
    return (
      <div>
        <button onClick={handleBack} className="flex items-center gap-2 text-bible-accent mb-4">
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <AppearanceSettings />
      </div>
    );
  }
  if (activeSubSection === 'tts') {
    return (
      <div className="h-full overflow-hidden">
        <button onClick={handleBack} className="flex items-center gap-2 text-bible-accent mb-2 px-4 pt-4">
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <div className="h-[calc(100%-40px)] overflow-y-auto">
          <TTSSettings />
        </div>
      </div>
    );
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
    // Sync section is rendered separately below
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
          className="flex items-start justify-between mb-8"
        >
          <div className="flex-1" />
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-bible-surface transition-colors">
            <X className="w-5 h-5 text-bible-text-muted" />
          </button>
          <div className="flex flex-col items-center gap-4 mb-4 flex-1">
            <div className="p-4 rounded-2xl bg-[var(--accent-bible)]/10 shadow-inner-glow">
              <Settings2 className="w-8 h-8 text-[var(--accent-bible)]" />
            </div>
            <div className="text-center">
              <span className="premium-kicker mb-2">Painel de Controle</span>
              <h1 className="text-3xl font-bold text-[var(--text-bible)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Configurações</h1>
              <p className="text-sm text-[var(--text-bible-muted)]">Ajuste cada detalhe da sua experiência</p>
            </div>
          </div>
          <div className="flex-1" />
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

        {/* Sync Section - Separate component with full functionality */}
        <SyncSection />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-8 border-t border-bible-border"
        >
          <button
            onClick={() => setShowVersionModal(true)}
            className="text-xs text-bible-text-muted hover:text-[var(--accent-bible)] transition-colors cursor-pointer"
          >
            Versão 1.0.0 • Bíblia Codex
          </button>
        </motion.div>
      </div>

      {/* Version Modal */}
      <AnimatePresence>
        {showVersionModal && <VersionModal onClose={() => setShowVersionModal(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

const VersionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const features = [
    {
      category: 'Leitura Bíblica',
      icon: BookOpenIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      items: [
        '66 livros completos (AT + NT)',
        'Múltiplas traduções (ACF, ARA com Strong\'s)',
        'Modo parágrafo e versículo por versículo',
        'Palavras de Jesus em vermelho',
        'Notas de rodapé categorizadas',
        'Strong\'s Hebraico e Grego inline',
        'Tags morfológicas e modo interlinear',
        'Transliteração de palavras originais'
      ]
    },
    {
      category: 'Áudio e TTS',
      icon: Mic,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      items: [
        'Leitura por voz (Text-to-Speech)',
        'Avanço automático versículo por versículo',
        'Auto-scroll sincronizado',
        'Velocidade configurável (0.5x a 2.0x)',
        'Seleção de voz PT-BR',
        'Controles de volume e pitch'
      ]
    },
    {
      category: 'Navegação',
      icon: Navigation2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      items: [
        'Floating Dock com 8 itens',
        'Layout adaptativo (mobile/tablet/desktop)',
        'Menu Bíblico (versão/testamento/livro/capítulo)',
        'Book Jump Menu para salto rápido',
        'Sidebar desktop com contexto de estudo',
        'Menu hamburger para mobile'
      ]
    },
    {
      category: 'Ferramentas de Estudo',
      icon: GraduationCap,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      items: [
        'Painel de estudo com IA por versículo',
        'Comentários, dicionários e referências cruzadas',
        'Enciclopédia Merrill integrada',
        'Dicionário Vine (Hebraico & Grego)',
        'Quem é Quem na Bíblia (biografias)',
        'Mapas bíblicos interativos com camadas',
        'Busca de lugares e pessoas'
      ]
    },
    {
      category: 'Inteligência Artificial',
      icon: Brain,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      items: [
        'Google Gemini (2.0 Flash, 3 Flash, Pro)',
        'OpenRouter, Groq, Hugging Face',
        'Análise teológica de versículos',
        'Planos de leitura personalizados via IA',
        'Perfil teológico Assembleia de Deus',
        'Cache de respostas no Firestore'
      ]
    },
    {
      category: 'Marcadores e Notas',
      icon: BookMarked,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      items: [
        'Marcadores com cores e rótulos customizados',
        'Editor de texto rico para notas',
        'Notas vinculadas a referências bíblicas',
        '45+ tags pré-instaladas',
        'Tags customizadas com cores automáticas',
        'Fixar notas para acesso rápido'
      ]
    },
    {
      category: 'Exportação',
      icon: Share2,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      items: [
        'Cards de versículo para redes sociais',
        '6 temas visuais para cards',
        'Exportar como imagem (PNG)',
        'Exportar notas: PDF, DOCX, DOC, HTML',
        'Integração com Google Docs',
        'Compartilhar via Web Share API'
      ]
    },
    {
      category: 'Planos de Leitura',
      icon: Calendar,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      items: [
        'Bíblia em 365 dias',
        'Planos canônicos, cronológicos e temáticos',
        'Planos gerados por IA',
        'Rastreamento de progresso e streak',
        'Sistema de XP e níveis (gamificação)',
        'Livros completados e histórico'
      ]
    },
    {
      category: 'Devocionais',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      items: [
        'Bom Dia (Max Lucado) - 365 dias',
        'Gratidão Cada Dia (GCPA)',
        'João Paulo Avante (JPAV)',
        'Spurgeon Daily',
        'Words of Christ (Inglês)',
        'Navegação por dia com links bíblicos'
      ]
    },
    {
      category: 'EBD e Mapas',
      icon: Map,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      items: [
        'Revista EBD trimestral',
        'Lições com texto áureo e verdade prática',
        'Mapa interativo da Terra Santa (SVG)',
        'Camadas históricas (Êxodo, Reino, Jesus, Paulo)',
        'Lugares bíblicos com coordenadas',
        'Jornadas bíblicas com rotas'
      ]
    },
    {
      category: 'Personalização',
      icon: Palette,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      items: [
        '9 temas (Light, Dark OLED, Sepia, etc.)',
        '4 famílias de fontes',
        '14 estilos de UI (Sharp, Soft, Glass, Neon...)',
        '9 estilos de navegação',
        'Animações com 8 estilos e 3 intensidades',
        'Controle de contraste e cor de destaque'
      ]
    },
    {
      category: 'Módulos',
      icon: Database,
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
      items: [
        'Bíblias, comentários, dicionários',
        'Referências cruzadas e livros',
        'Mapas e dados de pessoas',
        'Devocionais em ZIP',
        'Formatos: MyBible, MySword, Sword, EPUB',
        'Importação e gerenciamento de módulos'
      ]
    },
    {
      category: 'Sincronização',
      icon: CloudUpload,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      items: [
        'Sync bidirecional com Firestore',
        'Marcadores e notas na nuvem',
        'Resolução de conflitos por timestamp',
        'Configurações sincronizadas',
        'Cache de respostas IA no cloud',
        'Sync em tempo real'
      ]
    },
    {
      category: 'PWA e Android',
      icon: Smartphone,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      items: [
        'Progressive Web App instalável',
        'Service Worker com cache offline',
        'Funciona offline (texto, dicionário, devocionais)',
        'Android nativo via Capacitor',
        'Permissões Android 13+',
        'Filesystem nativo para módulos'
      ]
    },
    {
      category: 'Internacionalização',
      icon: LanguagesIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-600/10',
      items: [
        'Português (Brasil) - idioma principal',
        'Inglês - idioma secundário',
        'Troca de idioma em runtime',
        'Traduções em arquivos JSON'
      ]
    },
    {
      category: 'Busca',
      icon: Search,
      color: 'text-lime-500',
      bg: 'bg-lime-500/10',
      items: [
        'Busca full-text no texto bíblico',
        'Busca na enciclopédia (cross-source)',
        'Busca no dicionário local e IA',
        'Busca em notas e notas de rodapé',
        'Resultados com contexto do versículo'
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[85vh] bg-[var(--surface-bible)] rounded-3xl shadow-2xl border border-[var(--border-bible)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-bible)] bg-gradient-to-r from-[var(--accent-bible)]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[var(--accent-bible)]/10 shadow-[0_0_20px_rgba(var(--accent-bible-rgb),0.2)]">
              <Settings2 className="w-6 h-6 text-[var(--accent-bible)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-bible)]" style={{ fontFamily: 'var(--font-display)' }}>
                Bíblia Codex
              </h2>
              <p className="text-sm text-[var(--text-bible-muted)]">Versão 1.0.0 - Todas as Funcionalidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--text-bible)]/10 transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-bible-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((section, index) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-2xl border border-[var(--border-bible)] bg-[var(--surface-bible)]/50 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${section.bg}`}>
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-bible)]">{section.category}</h3>
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-bible-muted)]">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${section.color.replace('text-', 'bg-')}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-6 border-t border-[var(--border-bible)]"
          >
            <h3 className="text-sm font-bold text-[var(--text-bible)] mb-3">Tecnologias</h3>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'Vite 8', 'TypeScript 6', 'Tailwind CSS v4', 'Capacitor', 'Firebase', 'Zustand', 'i18next', 'sql.js', 'Framer Motion'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-bible)]/10 text-[var(--accent-bible)] border border-[var(--accent-bible)]/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-bible)] bg-[var(--surface-bible)]/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[var(--accent-bible)] text-white font-semibold hover:bg-[var(--accent-bible)]/90 transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};