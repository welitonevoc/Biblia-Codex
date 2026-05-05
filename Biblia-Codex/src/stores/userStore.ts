import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
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

export interface TrophyData {
  id: string;
  icon: string;
  name: string;
  desc: string;
  xp: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  unlocked: boolean;
  unlockedAt?: number;
  lockedHint?: string;
}

export interface BookProgress {
  abbr: string;
  icon: string;
  xp: number;
  done: boolean;
  testament: 'AT' | 'NT';
}

export interface ReadingPlan {
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

interface UserState {
  profile: UserProfile;
  trophies: TrophyData[];
  bookProgress: BookProgress[];
  readingPlans: ReadingPlan[];
  lastActiveDate: string | null;
  
  setProfile: (profile: Partial<UserProfile>) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addDiamond: (amount?: number) => void;
  addStar: (amount?: number) => void;
  useLife: () => boolean;
  refillLives: () => void;
  addBooksRead: (amount?: number) => void;
  unlockTrophy: (trophyId: string) => void;
  setBookProgress: (book: BookProgress) => void;
  setReadingPlan: (plan: ReadingPlan) => void;
  setGoogleLinked: (linked: boolean) => void;
  setPremium: (isPremium: boolean, until?: string) => void;
  updateLastActiveDate: () => void;
  loadFromFirestore: (data: any) => void;
  toFirestore: () => any;
}

const RANKS = [
  { minLevel: 1, name: 'Iniciante' },
  { minLevel: 5, name: 'Leitor' },
  { minLevel: 10, name: 'Discípulo' },
  { minLevel: 20, name: 'Estudioso' },
  { minLevel: 30, name: 'Teólogo' },
  { minLevel: 40, name: 'Mestre' },
  { minLevel: 50, name: 'Sábio' },
  { minLevel: 70, name: 'Apóstolo' },
  { minLevel: 100, name: 'Légado' },
];

const getRank = (level: number): string => {
  const rank = [...RANKS].reverse().find(r => level >= r.minLevel);
  return rank?.name || 'Iniciante';
};

const getXPForLevel = (level: number): number => {
  return level * 1000 + Math.floor(level * level * 100);
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Leitor',
  email: '',
  avatar: '🙏',
  level: 1,
  rank: 'Iniciante',
  xp: 0,
  xpToNext: 1000,
  stars: 0,
  diamonds: 0,
  bolts: 0,
  lives: 5,
  maxLives: 5,
  streak: 0,
  booksRead: 0,
  trophies: 0,
  isPremium: false,
  googleLinked: false,
};

const INITIAL_TROPHIES: TrophyData[] = [
  { id: 'shield', icon: '🛡️', name: 'Escudo da Fé', desc: '7 dias consecutivos', xp: 500, tier: 'bronze', unlocked: false },
  { id: 'warrior', icon: '⚔️', name: 'Guerreiro da Fé', desc: '30 dias consecutivos', xp: 2000, tier: 'silver', unlocked: false },
  { id: 'paladin', icon: '🛡️', name: 'Paladino Eterno', desc: '365 dias consecutivos', xp: 50000, tier: 'diamond', unlocked: false, lockedHint: '365 dias de leitura' },
  { id: 'lamp', icon: '🕯️', name: 'Lâmpada dos Pés', desc: '1 plano de estudo', xp: 1000, tier: 'gold', unlocked: false },
  { id: 'sword', icon: '⚔️', name: 'Espada do Espírito', desc: '10 versículos memorizados', xp: 800, tier: 'silver', unlocked: false },
  { id: 'anchor', icon: '⚓', name: 'Âncora da Esperança', desc: 'Plano esperança/sofrimento', xp: 1500, tier: 'gold', unlocked: false },
  { id: 'harp', icon: '🎵', name: 'Harpa de Davi', desc: 'Ler todos os Salmos', xp: 3000, tier: 'gold', unlocked: false },
  { id: 'crown', icon: '👑', name: 'Coroa da Vitória', desc: 'Ler Apocalipse completo', xp: 5000, tier: 'diamond', unlocked: false, lockedHint: 'Concluir Apocalipse' },
  { id: 'bread', icon: '🍞', name: 'Pão da Vida', desc: '30 devocionais seguidos', xp: 2000, tier: 'silver', unlocked: false, lockedHint: '30 dias de devocional' },
  { id: 'key', icon: '🔑', name: 'Chave do Saber', desc: 'Plano escatologia', xp: 2500, tier: 'gold', unlocked: false, lockedHint: 'Concluir plano escatologia' },
  { id: 'shepherd', icon: '🐑', name: 'Bom Pastor', desc: 'Salmo 23 + plano liderança', xp: 1200, tier: 'silver', unlocked: false, lockedHint: 'Ler Salmo 23' },
  { id: 'fire', icon: '🔥', name: 'Fogo do Pentecostes', desc: 'Ler Atos completo', xp: 2800, tier: 'gold', unlocked: false, lockedHint: 'Concluir Atos' },
  { id: 'dove', icon: '🕊️', name: 'Pomba da Paz', desc: 'NT completo', xp: 15000, tier: 'diamond', unlocked: false, lockedHint: 'Ler todo Novo Testamento' },
];

const INITIAL_BOOKS: BookProgress[] = [
  { abbr: 'gn', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'ex', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'lv', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'nm', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'dt', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'sl', icon: '🎵', xp: 0, done: false, testament: 'AT' },
  { abbr: 'is', icon: '📖', xp: 0, done: false, testament: 'AT' },
  { abbr: 'mt', icon: '📖', xp: 0, done: false, testament: 'NT' },
  { abbr: 'mc', icon: '📖', xp: 0, done: false, testament: 'NT' },
  { abbr: 'lc', icon: '📖', xp: 0, done: false, testament: 'NT' },
  { abbr: 'jo', icon: '📖', xp: 0, done: false, testament: 'NT' },
  { abbr: 'at', icon: '📖', xp: 0, done: false, testament: 'NT' },
  { abbr: 'ap', icon: '📖', xp: 0, done: false, testament: 'NT' },
];

const getToday = () => new Date().toISOString().split('T')[0];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: INITIAL_PROFILE,
      trophies: INITIAL_TROPHIES,
      bookProgress: INITIAL_BOOKS,
      readingPlans: [],
      lastActiveDate: null,

      setProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),

      addXP: (amount) => set((state) => {
        let newXP = state.profile.xp + amount;
        let newLevel = state.profile.level;
        let newRank = state.profile.rank;
        
        while (newXP >= getXPForLevel(newLevel)) {
          newXP -= getXPForLevel(newLevel);
          newLevel++;
          newRank = getRank(newLevel);
        }

        return {
          profile: {
            ...state.profile,
            xp: newXP,
            xpToNext: getXPForLevel(newLevel),
            level: newLevel,
            rank: newRank,
          }
        };
      }),

      incrementStreak: () => set((state) => {
        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (state.lastActiveDate === yesterday || state.lastActiveDate === today) {
          if (state.lastActiveDate !== today) {
            return {
              profile: { ...state.profile, streak: state.profile.streak + 1 },
              lastActiveDate: today
            };
          }
          return state;
        }
        
        return {
          profile: { ...state.profile, streak: 1 },
          lastActiveDate: today
        };
      }),

      resetStreak: () => set((state) => ({
        profile: { ...state.profile, streak: 0 }
      })),

      addDiamond: (amount = 1) => set((state) => ({
        profile: { ...state.profile, diamonds: state.profile.diamonds + amount }
      })),

      addStar: (amount = 1) => set((state) => ({
        profile: { ...state.profile, stars: state.profile.stars + amount }
      })),

      useLife: () => {
        const state = get();
        if (state.profile.lives > 0) {
          set((state) => ({
            profile: { ...state.profile, lives: state.profile.lives - 1 }
          }));
          return true;
        }
        return false;
      },

      refillLives: () => set((state) => ({
        profile: { ...state.profile, lives: state.profile.maxLives }
      })),

      addBooksRead: (amount = 1) => set((state) => ({
        profile: { ...state.profile, booksRead: state.profile.booksRead + amount }
      })),

      unlockTrophy: (trophyId) => set((state) => {
        const trophies = state.trophies.map(t => 
          t.id === trophyId && !t.unlocked 
            ? { ...t, unlocked: true, unlockedAt: Date.now() }
            : t
        );
        const unlockedCount = trophies.filter(t => t.unlocked).length;
        return {
          trophies,
          profile: { ...state.profile, trophies: unlockedCount }
        };
      }),

      setBookProgress: (book) => set((state) => {
        const books = state.bookProgress.map(b => 
          b.abbr === book.abbr ? { ...b, ...book } : b
        );
        const doneCount = books.filter(b => b.done).length;
        return {
          bookProgress: books,
          profile: { ...state.profile, booksRead: doneCount }
        };
      }),

      setReadingPlan: (plan) => set((state) => {
        const plans = state.readingPlans.some(p => p.id === plan.id)
          ? state.readingPlans.map(p => p.id === plan.id ? plan : p)
          : [...state.readingPlans, plan];
        return { readingPlans: plans };
      }),

      setGoogleLinked: (linked) => set((state) => ({
        profile: { ...state.profile, googleLinked: linked }
      })),

      setPremium: (isPremium, until) => set((state) => ({
        profile: { ...state.profile, isPremium, premiumUntil: until }
      })),

      updateLastActiveDate: () => set(() => ({
        lastActiveDate: getToday()
      })),

      loadFromFirestore: (data) => {
        if (!data) return;
        set((state) => ({
          profile: data.profile ? { ...state.profile, ...data.profile } : state.profile,
          trophies: data.trophies || state.trophies,
          bookProgress: data.bookProgress || state.bookProgress,
          readingPlans: data.readingPlans || state.readingPlans,
          lastActiveDate: data.lastActiveDate || state.lastActiveDate,
        }));
      },

      toFirestore: () => {
        const state = get();
        return {
          profile: state.profile,
          trophies: state.trophies,
          bookProgress: state.bookProgress,
          readingPlans: state.readingPlans,
          lastActiveDate: state.lastActiveDate,
          updatedAt: Date.now(),
        };
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);