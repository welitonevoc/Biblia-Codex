import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../AppContext';
import { 
  User, Star, Diamond, Zap, Heart, Trophy, BookOpen, Map, 
  Shield, Crown, Flame, Target, Award, Lock, ChevronRight,
  X, Edit3, Camera, Mail, Bell, Moon, Globe, Settings,
  LogOut, Cloud, Smartphone, Download, Share2, Check,
  AlertTriangle, Plus, Minus, Sparkles, ArrowLeft
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  level: number;
  rank: string;
  xp: number;
  xpToNext: number;
  stars: number;
  diamonds: number;
  bolts: number;
  lives: number;
  maxLives: number;
  streak: number;
  booksRead: number;
  trophies: number;
  isPremium: boolean;
  premiumUntil?: string;
  googleLinked: boolean;
}

interface TrophyData {
  id: string;
  icon: string;
  name: string;
  desc: string;
  xp: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  unlocked: boolean;
  lockedHint?: string;
}

interface BookProgress {
  abbr: string;
  icon: string;
  xp: number;
  done: boolean;
  testament: 'AT' | 'NT';
}

interface ReadingPlan {
  id: string;
  icon: string;
  name: string;
  days: number;
  current: number;
  xp: number;
  reward: string;
  rewardTier: string;
  bonusXp: number;
  active: boolean;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'José Menezes',
  email: 'jose@gmail.com',
  avatar: '🙏',
  level: 12,
  rank: 'Discípulo',
  xp: 6800,
  xpToNext: 10000,
  stars: 3240,
  diamonds: 18,
  bolts: 57,
  lives: 4,
  maxLives: 5,
  streak: 14,
  booksRead: 11,
  trophies: 4,
  isPremium: true,
  premiumUntil: 'jan/2026',
  googleLinked: true,
};

const TROPHIES: TrophyData[] = [
  { id: 'shield', icon: '🛡️', name: 'Escudo da Fé', desc: '7 dias consecutivos', xp: 500, tier: 'bronze', unlocked: true },
  { id: 'warrior', icon: '⚔️', name: 'Guerreiro da Fé', desc: '30 dias consecutivos', xp: 2000, tier: 'silver', unlocked: true },
  { id: 'paladin', icon: '🛡️', name: 'Paladino Eterno', desc: '365 dias consecutivos', xp: 50000, tier: 'diamond', unlocked: false, lockedHint: '365 dias de leitura' },
  { id: 'lamp', icon: '🕯️', name: 'Lâmpada dos Pés', desc: '1 plano de estudo', xp: 1000, tier: 'gold', unlocked: true },
  { id: 'sword', icon: '⚔️', name: 'Espada do Espírito', desc: '10 versículos memorizados', xp: 800, tier: 'silver', unlocked: true },
  { id: 'anchor', icon: '⚓', name: 'Âncora da Esperança', desc: 'Plano esperança/sofrimento', xp: 1500, tier: 'gold', unlocked: true },
  { id: 'harp', icon: '🎵', name: 'Harpa de Davi', desc: 'Ler todos os Salmos', xp: 3000, tier: 'gold', unlocked: true },
  { id: 'crown', icon: '👑', name: 'Coroa da Vitória', desc: 'Ler Apocalipse completo', xp: 5000, tier: 'diamond', unlocked: false, lockedHint: 'Concluir Apocalipse' },
  { id: 'bread', icon: '🍞', name: 'Pão da Vida', desc: '30 devocionais seguidos', xp: 2000, tier: 'silver', unlocked: false, lockedHint: '30 dias de devocional' },
  { id: 'key', icon: '🔑', name: 'Chave do Saber', desc: 'Plano escatologia', xp: 2500, tier: 'gold', unlocked: false, lockedHint: 'Concluir plano escatologia' },
  { id: 'shepherd', icon: '🐑', name: 'Bom Pastor', desc: 'Salmo 23 + plano liderança', xp: 1200, tier: 'silver', unlocked: false, lockedHint: 'Ler Salmo 23' },
  { id: 'fire', icon: '🔥', name: 'Fogo do Pentecostes', desc: 'Ler Atos completo', xp: 2800, tier: 'gold', unlocked: false, lockedHint: 'Concluir Atos' },
  { id: 'dove', icon: '🕊️', name: 'Pomba da Paz', desc: 'NT completo', xp: 15000, tier: 'diamond', unlocked: false, lockedHint: 'Ler todo Novo Testamento' },
  { id: 'scroll', icon: '📜', name: 'Rolo do Profeta', desc: 'Todos os profetas do AT', xp: 20000, tier: 'diamond', unlocked: false, lockedHint: 'Profetas do AT' },
  { id: 'bible', icon: '✝️', name: 'Bíblia Completa', desc: 'Todos os 66 livros', xp: 100000, tier: 'legendary', unlocked: false, lockedHint: '66 livros completa' },
];

const AT_BOOKS: BookProgress[] = [
  { abbr: 'Gn', icon: '📜', xp: 800, done: true, testament: 'AT' },
  { abbr: 'Ex', icon: '🔥', xp: 700, done: true, testament: 'AT' },
  { abbr: 'Lv', icon: '🕊️', xp: 300, done: false, testament: 'AT' },
  { abbr: 'Nm', icon: '🗺️', xp: 400, done: false, testament: 'AT' },
  { abbr: 'Dt', icon: '📋', xp: 500, done: false, testament: 'AT' },
  { abbr: 'Js', icon: '⚔️', xp: 400, done: false, testament: 'AT' },
  { abbr: 'Jz', icon: '🛡️', xp: 350, done: false, testament: 'AT' },
  { abbr: 'Rt', icon: '🌾', xp: 100, done: true, testament: 'AT' },
  { abbr: '1Sm', icon: '👑', xp: 400, done: false, testament: 'AT' },
  { abbr: '2Sm', icon: '🎵', xp: 350, done: false, testament: 'AT' },
  { abbr: '1Rs', icon: '🔥', xp: 400, done: false, testament: 'AT' },
  { abbr: '2Rs', icon: '📯', xp: 350, done: false, testament: 'AT' },
  { abbr: '1Cr', icon: '📜', xp: 350, done: false, testament: 'AT' },
  { abbr: '2Cr', icon: '🏛️', xp: 400, done: false, testament: 'AT' },
  { abbr: 'Ed', icon: '🔑', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Ne', icon: '🧱', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Et', icon: '👸', xp: 150, done: false, testament: 'AT' },
  { abbr: 'Jó', icon: '⚓', xp: 350, done: false, testament: 'AT' },
  { abbr: 'Sl', icon: '🎵', xp: 800, done: true, testament: 'AT' },
  { abbr: 'Pv', icon: '💡', xp: 500, done: false, testament: 'AT' },
  { abbr: 'Ec', icon: '🌀', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Ct', icon: '🌹', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Is', icon: '📜', xp: 700, done: false, testament: 'AT' },
  { abbr: 'Jr', icon: '💧', xp: 600, done: false, testament: 'AT' },
  { abbr: 'Lm', icon: '💔', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Ez', icon: '👁️', xp: 600, done: false, testament: 'AT' },
  { abbr: 'Dn', icon: '🦁', xp: 300, done: false, testament: 'AT' },
  { abbr: 'Os', icon: '❤️', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Jl', icon: '⚡', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Am', icon: '⚖️', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Ob', icon: '🗻', xp: 50, done: false, testament: 'AT' },
  { abbr: 'Jn', icon: '🐋', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Mq', icon: '⚖️', xp: 150, done: false, testament: 'AT' },
  { abbr: 'Na', icon: '💥', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Hc', icon: '🗼', xp: 100, done: false, testament: 'AT' },
  { abbr: ' Sf', icon: '📯', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Ag', icon: '🏛️', xp: 100, done: false, testament: 'AT' },
  { abbr: 'Zc', icon: '🕊️', xp: 200, done: false, testament: 'AT' },
  { abbr: 'Ml', icon: '✉️', xp: 100, done: false, testament: 'AT' },
];

const NT_BOOKS: BookProgress[] = [
  { abbr: 'Mt', icon: '⭐', xp: 600, done: true, testament: 'NT' },
  { abbr: 'Mc', icon: '⚡', xp: 400, done: true, testament: 'NT' },
  { abbr: 'Lc', icon: '🕊️', xp: 600, done: true, testament: 'NT' },
  { abbr: 'Jo', icon: '❤️', xp: 500, done: true, testament: 'NT' },
  { abbr: 'At', icon: '🔥', xp: 500, done: false, testament: 'NT' },
  { abbr: 'Rm', icon: '⚖️', xp: 400, done: false, testament: 'NT' },
  { abbr: '1Co', icon: '🙏', xp: 350, done: false, testament: 'NT' },
  { abbr: '2Co', icon: '💪', xp: 300, done: false, testament: 'NT' },
  { abbr: 'Gl', icon: '🕊️', xp: 200, done: false, testament: 'NT' },
  { abbr: 'Ef', icon: '🛡️', xp: 200, done: false, testament: 'NT' },
  { abbr: 'Fp', icon: '😊', xp: 150, done: false, testament: 'NT' },
  { abbr: 'Cl', icon: '👑', xp: 150, done: false, testament: 'NT' },
  { abbr: '1Ts', icon: '📯', xp: 150, done: false, testament: 'NT' },
  { abbr: '2Ts', icon: '⏰', xp: 100, done: false, testament: 'NT' },
  { abbr: '1Tm', icon: '🔑', xp: 150, done: false, testament: 'NT' },
  { abbr: '2Tm', icon: '⚔️', xp: 150, done: false, testament: 'NT' },
  { abbr: 'Tt', icon: '📋', xp: 100, done: false, testament: 'NT' },
  { abbr: 'Fm', icon: '🤝', xp: 50, done: false, testament: 'NT' },
  { abbr: 'Hb', icon: '🛡️', xp: 300, done: false, testament: 'NT' },
  { abbr: 'Tg', icon: '⚖️', xp: 150, done: false, testament: 'NT' },
  { abbr: '1Pe', icon: '🪨', xp: 150, done: false, testament: 'NT' },
  { abbr: '2Pe', icon: '⚠️', xp: 100, done: false, testament: 'NT' },
  { abbr: '1Jo', icon: '❤️', xp: 150, done: false, testament: 'NT' },
  { abbr: '2Jo', icon: '✉️', xp: 50, done: false, testament: 'NT' },
  { abbr: '3Jo', icon: '✉️', xp: 50, done: false, testament: 'NT' },
  { abbr: 'Jd', icon: '⚔️', xp: 50, done: false, testament: 'NT' },
  { abbr: 'Ap', icon: '👑', xp: 400, done: false, testament: 'NT' },
];

const READING_PLANS: ReadingPlan[] = [
  { id: 'warrior', icon: '⚔️', name: 'Guerreiro da Palavra', days: 30, current: 13, xp: 60, reward: '🥈 Prata', rewardTier: 'silver', bonusXp: 2000, active: true },
  { id: 'lamp', icon: '🕯️', name: 'Lâmpada para os Meus Pés', days: 7, current: 5, xp: 50, reward: '🥉 Bronze', rewardTier: 'bronze', bonusXp: 500, active: true },
  { id: 'david', icon: '🎵', name: 'Coração de Davi', days: 90, current: 7, xp: 25, reward: '🥇 Ouro', rewardTier: 'gold', bonusXp: 8000, active: true },
  { id: 'year', icon: '✝️', name: 'Bíblia em 1 Ano', days: 365, current: 0, xp: 100, reward: '💎 Diamante', rewardTier: 'diamond', bonusXp: 50000, active: false },
  { id: 'eschatology', icon: '🔑', name: 'Guardião da Escatologia', days: 60, current: 0, xp: 80, reward: '🔑 Ouro', rewardTier: 'gold', bonusXp: 6000, active: false },
];

const EMOJIS = ['🙏', '✝️', '📖', '🕊️', '⭐', '🌟', '🔥', '💎', '🌿', '🕯️', '🐑', '⚓', '🛡️', '👑', '🎵', '🕊️', '✝️', '👑', '🌈', '⭐'];

const TABS = [
  { id: 'perfil', icon: User, label: 'Perfil' },
  { id: 'recompensas', icon: Trophy, label: 'Recompensas' },
  { id: 'livros', icon: BookOpen, label: 'Livros' },
  { id: 'planos', icon: Map, label: 'Planos' },
  { id: 'vidas', icon: Heart, label: 'Vidas' },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function ProfilePage() {
  const { setActiveTab } = useAppContext();
  const [activeTab, setActiveTabState] = useState('perfil');
  
  const handleBack = () => setActiveTab('settings');
  const handleInnerTab = (tab: string) => setActiveTabState(tab);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [books, setBooks] = useState<BookProgress[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(profile.avatar);
  const [xpFloat, setXpFloat] = useState<string | null>(null);
  const [heartAnimating, setHeartAnimating] = useState<number | null>(null);
  const [lives, setLives] = useState(profile.lives);

  useEffect(() => {
    setBooks([...AT_BOOKS, ...NT_BOOKS]);
  }, []);

  const xpPercent = Math.min((profile.xp / profile.xpToNext) * 100, 100);
  const booksDone = books.filter(b => b.done).length;
  const totalBooksXp = books.reduce((sum, b) => sum + (b.done ? b.xp : 0), 0);
  const unlockedTrophies = TROPHIES.filter(t => t.unlocked).length;

  const handleSaveName = () => {
    if (editName.trim()) {
      setProfile(p => ({ ...p, name: editName.trim() }));
    }
    setShowNameModal(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setProfile(p => ({ ...p, avatar: emoji }));
  };

  const toggleBook = (index: number) => {
    const newBooks = [...books];
    newBooks[index] = { ...newBooks[index], done: !newBooks[index].done };
    setBooks(newBooks);
  };

  const handleHeartClick = (index: number) => {
    if (heartAnimating !== null) return;
    
    const currentLives = lives;
    if (currentLives > 0) {
      setLives(currentLives - 1);
      setHeartAnimating(index);
      setXpFloat('-50 XP');
      
      setTimeout(() => {
        setHeartAnimating(null);
        setXpFloat(null);
      }, 1200);
    }
  };

  const restoreHeart = (index: number) => {
    const currentLives = lives;
    if (currentLives < profile.maxLives && heartAnimating === null) {
      setLives(currentLives + 1);
    }
  };

  const renderTierBadge = (tier: TrophyData['tier']) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-slate-200 text-slate-700',
      gold: 'bg-yellow-100 text-yellow-800',
      diamond: 'bg-purple-100 text-purple-800',
      legendary: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      diamond: '💎',
      legendary: '✝️',
    };
    return (
      <span className={cn('inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium', colors[tier])}>
        {labels[tier]}
      </span>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <TabPerfil profile={profile} xpPercent={xpPercent} />;
      case 'recompensas':
        return <TabRecompensas />;
      case 'livros':
        return <TabLivros books={books} booksDone={booksDone} totalXp={totalBooksXp} onToggle={toggleBook} />;
      case 'planos':
        return <TabPlanos />;
      case 'vidas':
        return <TabVidas 
          lives={lives} 
          maxLives={profile.maxLives} 
          onHeartClick={handleHeartClick}
          onRestoreHeart={restoreHeart}
          heartAnimating={heartAnimating}
          xpFloat={xpFloat}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg-bible)]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--surface-overlay)] backdrop-blur-xl border-b border-[var(--border-bible)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="p-1.5 -ml-1.5 rounded-lg text-[var(--text-bible-muted)] hover:bg-[var(--surface-1)]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--text-bible)]">Meu Perfil</h1>
          </div>
          <button className="p-2 rounded-lg bg-[var(--surface-1)] text-[var(--text-bible-muted)]">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex gap-1 px-2 pb-2 overflow-x-auto scrollbar-thin">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleInnerTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-[var(--accent-bible)] text-[var(--accent-bible-contrast)] shadow-sm'
                  : 'bg-[var(--surface-1)] text-[var(--text-bible-muted)] hover:bg-[var(--surface-2)]'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Name Modal */}
      <AnimatePresence>
        {showNameModal && (
          <Modal onClose={() => setShowNameModal(false)}>
            <h3 className="text-base font-semibold text-[var(--text-bible)] mb-2">Editar nome</h3>
            <p className="text-sm text-[var(--text-bible-muted)] mb-4">
              Este nome aparece no seu perfil e no ranking de leitores.
            </p>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-2)] text-[var(--text-bible)] border-none outline-none mb-4"
              placeholder="Seu nome"
              maxLength={30}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 py-3 rounded-xl border border-[var(--border-bible)] text-[var(--text-bible)] font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveName}
                className="flex-1 py-3 rounded-xl bg-[var(--accent-bible)] text-white font-medium"
              >
                Salvar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <Modal onClose={() => setShowPhotoModal(false)}>
            <h3 className="text-base font-semibold text-[var(--text-bible)] mb-2">Foto de perfil</h3>
            <p className="text-sm text-[var(--text-bible-muted)] mb-4">
              Escolha um emoji para representar você na jornada bíblica.
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    'text-2xl p-2 rounded-xl border-2 transition-all',
                    selectedEmoji === emoji
                      ? 'border-[var(--accent-bible)] bg-[var(--surface-1)]'
                      : 'border-transparent bg-[var(--surface-2)]'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 py-3 rounded-xl border border-[var(--border-bible)] text-[var(--text-bible)] font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--accent-bible)] text-white font-medium"
              >
                Confirmar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--surface-0)] rounded-2xl p-5 shadow-lg"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function TabPerfil({ profile, xpPercent }: { profile: UserProfile; xpPercent: number }) {
  return (
    <div className="space-y-4">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-1)] p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-bible)]/10 to-transparent" />
        
        <div className="relative flex gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-2)] border-3 border-[var(--accent-bible)] flex items-center justify-center text-3xl animate-pulse-slow">
              {profile.avatar}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--text-bible)]">{profile.name}</h2>
            <p className="text-sm text-[var(--text-bible-muted)]">{profile.email}</p>
            {profile.isPremium && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                <Diamond className="w-3 h-3" /> Premium — {profile.rank}
              </span>
            )}
          </div>
        </div>

        {/* Level Block */}
        <div className="relative mt-4 p-3 rounded-xl bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-1)] border-2 border-[var(--accent-bible)] flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[var(--accent-bible)]">{profile.level}</span>
              <span className="text-[8px] text-[var(--accent-bible)]">NÍV.</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--text-bible)]">🕯️ {profile.rank}</div>
              <div className="text-xs text-[var(--text-bible-muted)]">
                {formatNumber(profile.xp)} XP para {profile.rank === 'Discípulo' ? 'Profeta' : 'Apóstolo'} (Nível {profile.level + 3})
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-[var(--text-bible-muted)] mt-2 mb-1">
            <span>{formatNumber(profile.xp)} XP acumulados</span>
            <span>{formatNumber(profile.xpToNext)} XP</span>
          </div>
          <div className="h-2 bg-[var(--surface-1)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Flame} value={profile.streak} label="Dias seg" color="text-orange-500" />
        <StatCard icon={BookOpen} value={profile.booksRead} label="Livros" color="text-[var(--accent-bible)]" />
        <StatCard icon={Trophy} value={profile.trophies} label="Troféus" color="text-yellow-600" />
        <StatCard icon={Diamond} value={profile.diamonds} label="Diamantes" color="text-purple-500" />
      </div>

      {/* Coins */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[var(--surface-1)]">
        <CoinDisplay icon={Star} value={profile.stars} label="Estrelas" />
        <CoinDisplay icon={Diamond} value={profile.diamonds} label="Diamantes" />
        <CoinDisplay icon={Zap} value={profile.bolts} label="Raios" />
        <CoinDisplay icon={Heart} value={`${profile.lives}/${profile.maxLives}`} label="Vidas" />
      </div>

      {/* Account Section */}
      <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Conta
        </div>
        <MenuRow icon={User} title="Nome de exibição" value={profile.name} />
        <MenuRow icon={Camera} title="Foto de perfil" value="Alterar avatar" />
        <MenuRow icon={Mail} title="Conta Google" value={profile.googleLinked ? 'Conectado' : 'Vincular'} connected={profile.googleLinked} />
        <MenuRow icon={Bell} title="Notificações" value="Ativo" />
        <MenuRow icon={Moon} title="Tema" value="Claro" />
        <MenuRow icon={Globe} title="Idioma" value="Português" />
      </div>

      {/* Premium & Rewards */}
      <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Premium & Recompensas
        </div>
        <MenuRow icon={Trophy} title="Recompensas e troféus" value={`${profile.trophies} novos`} />
        <MenuRow icon={Star} title="Loja de estrelas" value={formatNumber(profile.stars)} />
        <MenuRow icon={Diamond} title="Plano Premium" value={`Ativo até ${profile.premiumUntil}`} premium />
      </div>

      {/* Backup */}
      <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Backup & Sincronização
        </div>
        <MenuRow icon={Cloud} title="Backup na nuvem" value="OK" ok />
        <MenuRow icon={Smartphone} title="Sincronizar dispositivos" value="2 dispositivos" />
        <MenuRow icon={Download} title="Exportar progresso" value="PDF" />
      </div>

      {/* Logout */}
      <button className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-medium flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> Sair da conta
      </button>
    </div>
  );
}

function TabRecompensas() {
  const xpPercent = Math.min((INITIAL_PROFILE.xp / INITIAL_PROFILE.xpToNext) * 100, 100);
  
  const renderTierBadgeInternal = (tier: TrophyData['tier']) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-slate-200 text-slate-700',
      gold: 'bg-yellow-100 text-yellow-800',
      diamond: 'bg-purple-100 text-purple-800',
      legendary: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      diamond: '💎',
      legendary: '✝️',
    };
    return (
      <span className={cn('inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium', colors[tier])}>
        {labels[tier]}
      </span>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Level Card */}
      <div className="rounded-2xl bg-[var(--surface-1)] p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border-2 border-[var(--accent-bible)] flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[var(--accent-bible)]">{INITIAL_PROFILE.level}</span>
            <span className="text-[8px] text-[var(--accent-bible)]">NÍVEL</span>
          </div>
          <div>
            <div className="text-base font-semibold text-[var(--text-bible)]">{INITIAL_PROFILE.rank}</div>
            <div className="text-xs text-[var(--text-bible-muted)]">
              {formatNumber(INITIAL_PROFILE.xp)} / {formatNumber(INITIAL_PROFILE.xpToNext)} XP
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-[var(--text-bible-muted)] mb-1">
          <span>Nível {INITIAL_PROFILE.level} — {INITIAL_PROFILE.rank}</span>
          <span>{formatNumber(INITIAL_PROFILE.xp)} XP</span>
        </div>
        <div className="h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] rounded-full"
          />
        </div>
      </div>

      {/* Coins */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[var(--surface-1)]">
        <CoinDisplay icon={Star} value={INITIAL_PROFILE.stars} label="Estrelas" />
        <CoinDisplay icon={Diamond} value={INITIAL_PROFILE.diamonds} label="Diamantes" />
        <CoinDisplay icon={Zap} value={INITIAL_PROFILE.bolts} label="Raios" />
        <CoinDisplay icon={Heart} value={`${INITIAL_PROFILE.lives}/${INITIAL_PROFILE.maxLives}`} label="Vidas" />
      </div>

      {/* How to Earn XP */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Como ganhar XP
        </div>
        <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
          <XPRule
            icon="📖"
            title="Leitura diária"
            desc="Por cada sessão de leitura"
            value="+25 XP"
            items={[
              { text: 'Versículo completo lido', value: '+5 XP' },
              { text: 'Capítulo completo lido', value: '+30 XP' },
              { text: 'Quiz de versículos acertado', value: '+15 XP' },
            ]}
          />
          <XPRule
            icon="📜"
            title="Livro da Bíblia concluído"
            desc="Varia conforme o tamanho"
            value="+50–800 XP"
            items={[
              { text: 'Livros curtos (Rute, Obadias…)', value: '+50–100 XP' },
              { text: 'Livros médios (Gálatas, Jonas…)', value: '+150–300 XP' },
              { text: 'Livros longos (Isaías, Mateus…)', value: '+500–700 XP' },
              { text: 'Livros extensos (Gênesis, Salmos…)', value: '+800 XP' },
            ]}
          />
          <XPRule
            icon="🏆"
            title="Plano de leitura concluído"
            desc="Troféu + XP ao finalizar"
            value="+500–50k XP"
            items={[
              { text: 'Plano curto (7 dias) — Bronze', value: '+500 XP' },
              { text: 'Plano médio (30 dias) — Prata', value: '+2.000 XP' },
              { text: 'Plano longo (90 dias) — Ouro', value: '+8.000 XP' },
              { text: 'Plano anual (365 dias) — Diamante', value: '+50.000 XP' },
            ]}
          />
        </div>
      </div>

      {/* Level Progression */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Progressão de níveis
        </div>
        <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
          <LevelRow level={1} rank="🌱 Leitor" range="0–2.000 XP" />
          <LevelRow level={6} rank="🕯️ Discípulo" range="2.001–10.000 XP" />
          <LevelRow level={12} rank="🕯️ Discípulo" range="6.800 XP" current />
          <LevelRow level={16} rank="📜 Profeta" range="10.001–50.000 XP" />
          <LevelRow level={26} rank="⚡ Apóstolo" range="50.001–150.000 XP" />
          <LevelRow level={36} rank="🛡️ Guardião" range="150.001–400.000 XP" />
          <LevelRow level={46} rank="👑 Ancião" range="400.001–900.000 XP" />
          <LevelRow level={56} rank="⚓ Patriarca" range="900.001–2M XP" />
          <LevelRow level={66} rank="🔑 Mestre Sábio" range="2M a 5M XP" />
          <LevelRow level={99} rank="✝️ Sumo Sacerdote" range="10M+ XP" legendary />
        </div>
      </div>

      {/* Trophies */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Troféus conquistados
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TROPHIES.slice(0, 12).map((trophy, i) => (
            <motion.div
              key={trophy.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: trophy.unlocked ? 1 : 0.4, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'relative p-3 rounded-xl bg-[var(--surface-1)] text-center',
                !trophy.unlocked && 'opacity-40'
              )}
            >
              {!trophy.unlocked && (
                <Lock className="absolute top-1 right-1 w-3 h-3 text-[var(--text-bible-subtle)]" />
              )}
              <span className="block text-2xl mb-1">{trophy.icon}</span>
              <div className="text-xs font-medium text-[var(--text-bible)] leading-tight">{trophy.name}</div>
              <div className="text-[10px] text-[var(--text-bible-muted)]">{trophy.desc}</div>
              <div className="text-[10px] text-[var(--accent-bible)] font-medium">+{trophy.xp} XP</div>
              {renderTierBadgeInternal(trophy.tier)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabLivros({ books, booksDone, totalXp, onToggle }: { 
  books: BookProgress[]; 
  booksDone: number; 
  totalXp: number;
  onToggle: (index: number) => void;
}) {
  const atBooks = books.filter(b => b.testament === 'AT');
  const ntBooks = books.filter(b => b.testament === 'NT');
  const progress = (booksDone / 66) * 100;

  return (
    <div className="space-y-4">
      {/* XP Info */}
      <div className="rounded-xl bg-[var(--surface-1)] p-4">
        <div className="text-sm font-medium text-[var(--text-bible)] mb-3">XP por livro concluído</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-bible-muted)]">Livros muito curtos</span>
            <span className="text-[var(--accent-bible)] font-medium">+50 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-bible-muted)]">Livros curtos</span>
            <span className="text-[var(--accent-bible)] font-medium">+100 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-bible-muted)]">Livros médios</span>
            <span className="text-[var(--accent-bible)] font-medium">+200–350 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-bible-muted)]">Livros longos</span>
            <span className="text-[var(--accent-bible)] font-medium">+400–600 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-bible-muted)]">Livros extensos</span>
            <span className="text-[var(--accent-bible)] font-medium">+700–800 XP</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[var(--border-bible)]">
            <span className="text-[var(--text-bible)] font-medium">🏆 Bônus: 66 livros</span>
            <span className="text-[var(--accent-bible)] font-bold">+100.000 XP</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--accent-bible)]/20 border border-[var(--accent-bible)]" />
          <span className="text-[var(--text-bible-muted)]">Concluído</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--surface-1)] border border-[var(--border-bible)]" />
          <span className="text-[var(--text-bible-muted)]">Não lido</span>
        </div>
      </div>

      {/* AT Books */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Antigo Testamento (39 livros)
        </div>
        <div className="grid grid-cols-6 gap-1">
          {atBooks.map((book, i) => (
            <motion.button
              key={book.abbr}
              onClick={() => onToggle(i)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-1.5 rounded-lg bg-[var(--surface-1)] text-center transition-all',
                book.done && 'bg-[var(--accent-bible)]/20 border border-[var(--accent-bible)]'
              )}
            >
              <span className="block text-sm">{book.icon}</span>
              <span className={cn('text-[8px]', book.done ? 'text-[var(--accent-bible)]' : 'text-[var(--text-bible-muted)]')}>
                {book.abbr}
              </span>
              <span className="block text-[7px] text-[var(--accent-bible)]">{book.xp}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* NT Books */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Novo Testamento (27 livros)
        </div>
        <div className="grid grid-cols-6 gap-1">
          {ntBooks.map((book, i) => (
            <motion.button
              key={book.abbr}
              onClick={() => onToggle(i + atBooks.length)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-1.5 rounded-lg bg-[var(--surface-1)] text-center transition-all',
                book.done && 'bg-[var(--accent-bible)]/20 border border-[var(--accent-bible)]'
              )}
            >
              <span className="block text-sm">{book.icon}</span>
              <span className={cn('text-[8px]', book.done ? 'text-[var(--accent-bible)]' : 'text-[var(--text-bible-muted)]')}>
                {book.abbr}
              </span>
              <span className="block text-[7px] text-[var(--accent-bible)]">{book.xp}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-[var(--surface-1)] p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-[var(--text-bible)]">Progresso total</span>
          <span className="text-[var(--accent-bible)] font-bold">{booksDone} / 66 livros</span>
        </div>
        <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[var(--accent-bible)] to-[var(--accent-bible-strong)] rounded-full"
          />
        </div>
        <div className="text-xs text-[var(--text-bible-muted)] mt-2">
          XP total acumulado em livros: <span className="text-[var(--accent-bible)] font-bold">{formatNumber(totalXp)} XP</span>
        </div>
      </div>
    </div>
  );
}

function TabPlanos() {
  const activePlans = READING_PLANS.filter(p => p.active);
  const availablePlans = READING_PLANS.filter(p => !p.active);

  return (
    <div className="space-y-4">
      {/* Active Plans */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Planos ativos
        </div>
        {activePlans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Available Plans */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Planos disponíveis
        </div>
        {availablePlans.map(plan => (
          <PlanCard key={plan.id} plan={plan} premium />
        ))}
      </div>
    </div>
  );
}

function TabVidas({ 
  lives, 
  maxLives, 
  onHeartClick, 
  onRestoreHeart,
  heartAnimating,
  xpFloat 
}: { 
  lives: number; 
  maxLives: number;
  onHeartClick: (index: number) => void;
  onRestoreHeart: (index: number) => void;
  heartAnimating: number | null;
  xpFloat: string | null;
}) {
  const heartArray = Array.from({ length: maxLives }, (_, i) => i < lives);

  return (
    <div className="space-y-4">
      {/* Hearts Card */}
      <div className="relative rounded-2xl bg-[var(--surface-1)] p-5 text-center">
        {xpFloat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500"
          >
            {xpFloat}
          </motion.div>
        )}
        
        <h3 className="text-base font-semibold text-[var(--text-bible)] mb-2">Vidas & Corações</h3>
        <p className="text-xs text-[var(--text-bible-muted)] mb-4">
          Você tem {lives} de {maxLives} vidas. Clique em um coração quebrado para recuperar.
        </p>
        
        <div className="flex justify-center gap-3 mb-2">
          {heartArray.map((active, i) => (
            <motion.button
              key={i}
              onClick={() => active ? onHeartClick(i) : onRestoreHeart(i)}
              whileTap={{ scale: 0.9 }}
              className={cn('text-3xl transition-all', !active && 'opacity-50')}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {active ? '❤️' : '💔'}
            </motion.button>
          ))}
        </div>
        
        <p className="text-xs text-[var(--text-bible-muted)]">
          Toque num coração 💔 para ver a animação de coração quebrado
        </p>
      </div>

      {/* Loss/Gain */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
          <div className="text-xs font-semibold text-red-600 mb-2">💔 Perde vida & XP</div>
          <div className="space-y-1.5 text-xs text-[var(--text-bible-muted)]">
            <div>🚫 Abandona plano: <strong className="text-[var(--text-bible)]">−50 XP</strong></div>
            <div>⏳ 3 dias sem app: <strong className="text-[var(--text-bible)]">−25 XP</strong></div>
            <div>📅 7 dias sem ler: <strong className="text-[var(--text-bible)]">−100 XP</strong></div>
            <div>💀 30 dias inativo: <strong className="text-[var(--text-bible)]">−250 XP</strong></div>
            <div>❌ Quiz errado: <strong className="text-[var(--text-bible)]">−1 vida</strong></div>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
          <div className="text-xs font-semibold text-green-600 mb-2">❤️ Ganha vida & XP</div>
          <div className="space-y-1.5 text-xs text-[var(--text-bible-muted)]">
            <div>📖 Leitura diária: <strong className="text-[var(--text-bible)]">+1 vida</strong></div>
            <div>✅ Devocional do dia: <strong className="text-[var(--text-bible)]">+1 vida</strong></div>
            <div>⭐ 500 estrelas = 1 vida</div>
            <div>💎 2 diamantes = recarga</div>
            <div>🌅 Recarga 00:00</div>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Regras do sistema
        </div>
        <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
          <RuleRow icon="📖" text="Leitura diária — Cada sessão +25 XP. Versículo +5 XP. Capítulo +30 XP." />
          <RuleRow icon="🏆" text="Troféu de plano — 1 troféu permanente + XP proporcional." />
          <RuleRow icon="📕" text="Livro concluído — XP 50-800. Os 66 livros = +100.000 XP." />
          <RuleRow icon="⚡" text="Raios — Usados para 'escudos de proteção' contra perda de XP." />
          <RuleRow icon="💎" text="Diamantes — Usados para recarregar vidas ou planos premium." />
          <RuleRow icon="💔" text="Coração quebrado — Recupera-se lendo por 3 dias seguidos." />
          <RuleRow icon="🛡️" text="Escudo — Gasto 3 raios para proteger o streak por 1 dia." />
          <RuleRow icon="📊" text="Perda máx — Nunca mais de 10% do XP total." />
        </div>
      </div>

      {/* Coins Usage */}
      <div>
        <div className="px-1 py-2 text-[10px] font-medium text-[var(--text-bible-subtle)] uppercase tracking-wider">
          Moedas e para que servem
        </div>
        <div className="rounded-xl bg-[var(--surface-1)] overflow-hidden">
          <RuleRow icon="⭐" text="Estrelas — Moeda comum. Ganha ao ler, quiz, tarefas. Troca por vidas." />
          <RuleRow icon="💎" text="Diamantes — Premium. Conquistados em troféus Ouro/Diamante." />
          <RuleRow icon="⚡" text="Raios — Ganha mantendo sequências. Usados como 'seguro'." />
          <RuleRow icon="❤️" text="Vidas — Máximo 5. Perdem por erro, inatividade, abandono." />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number; label: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--surface-1)] text-center">
      <div className={cn('text-base font-bold', color)}>{value}</div>
      <div className="text-[9px] text-[var(--text-bible-muted)]">{label}</div>
    </div>
  );
}

function CoinDisplay({ icon: Icon, value, label }: { icon: React.ElementType; value: number | string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="w-5 h-5 mx-auto mb-1 text-[var(--accent-bible)]" />
      <div className="text-sm font-bold text-[var(--text-bible)]">{value}</div>
      <div className="text-[9px] text-[var(--text-bible-muted)]">{label}</div>
    </div>
  );
}

function MenuRow({ icon: Icon, title, value, connected, ok, premium }: { 
  icon: React.ElementType; 
  title: string; 
  value?: string;
  connected?: boolean;
  ok?: boolean;
  premium?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--border-bible)]">
      <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[var(--text-bible-muted)]" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-bible)]">{title}</div>
        {value && <div className="text-xs text-[var(--text-bible-muted)]">{value}</div>}
      </div>
      {connected && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓</span>}
      {ok && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">OK</span>}
      {premium && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Premium</span>}
      <ChevronRight className="w-4 h-4 text-[var(--text-bible-subtle)]" />
    </div>
  );
}

function XPRule({ icon, title, desc, value, items }: { 
  icon: string; 
  title: string; 
  desc: string; 
  value: string;
  items: { text: string; value: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-lg">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-[var(--text-bible)]">{title}</div>
          <div className="text-xs text-[var(--text-bible-muted)]">{desc}</div>
        </div>
        <span className="text-xs font-bold text-green-600">{value}</span>
        <ChevronRight className={cn('w-4 h-4 text-[var(--text-bible-subtle)] transition-transform', expanded && 'rotate-90')} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {items.map((item, i) => (
              <div key={i} className="flex justify-between px-4 py-2 text-xs border-t border-[var(--border-bible)]">
                <span className="text-[var(--text-bible-muted)]">{item.text}</span>
                <span className="text-green-600 font-medium">{item.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LevelRow({ level, rank, range, current, legendary }: { 
  level: number; 
  rank: string; 
  range: string; 
  current?: boolean;
  legendary?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 border-t border-[var(--border-bible)]',
      current && 'bg-[var(--accent-bible)]/10',
      legendary && 'bg-yellow-50 dark:bg-yellow-950/30'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
        current ? 'bg-[var(--accent-bible)] text-white' :
        legendary ? 'bg-yellow-500 text-white' :
        'bg-[var(--surface-2)] text-[var(--accent-bible)]'
      )}>
        {level}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-bible)]">{rank}</div>
        <div className="text-xs text-[var(--text-bible-muted)]">{range}</div>
      </div>
      {current && <span className="text-xs text-[var(--accent-bible)]">você</span>}
    </div>
  );
}

function PlanCard({ plan, premium }: { plan: ReadingPlan; premium?: boolean }) {
  const progress = (plan.current / plan.days) * 100;
  
  return (
    <div className={cn(
      'rounded-xl bg-[var(--surface-1)] p-4',
      premium && 'border border-[var(--accent-bible)]/30'
    )}>
      <div className="flex gap-3 mb-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          premium ? 'bg-purple-100 dark:bg-purple-950/30' : 'bg-[var(--surface-2)]'
        )}>
          {plan.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--text-bible)]">{plan.name}</div>
          <div className="text-xs text-[var(--text-bible-muted)]">
            {plan.days} dias • {plan.xp} XP/dia
          </div>
        </div>
      </div>
      
      <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-[var(--accent-bible)] rounded-full"
        />
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-[var(--text-bible-muted)]">
          {plan.current} / {plan.days} dias • {plan.current * plan.xp} XP
        </span>
        <div className="flex gap-1.5">
          <span className={cn(
            'px-2 py-0.5 rounded-full',
            plan.rewardTier === 'bronze' && 'bg-amber-100 text-amber-700',
            plan.rewardTier === 'silver' && 'bg-slate-100 text-slate-700',
            plan.rewardTier === 'gold' && 'bg-yellow-100 text-yellow-700',
            plan.rewardTier === 'diamond' && 'bg-purple-100 text-purple-700'
          )}>
            {plan.reward}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-bible)]">
            +{plan.bonusXp} XP
          </span>
        </div>
      </div>
    </div>
  );
}

function RuleRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-t border-[var(--border-bible)]">
      <span className="text-lg">{icon}</span>
      <p className="flex-1 text-xs text-[var(--text-bible-muted)] leading-relaxed">{text}</p>
    </div>
  );
}

export default ProfilePage;