import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Target, Clock, Bell, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { PermissionScreen } from './PermissionScreen';

interface OnboardingProps {
  onComplete: () => void;
}

const GOALS = [
  { icon: Sparkles, label: "Fortalecer minha fé", sub: "Devocionais temáticos" },
  { icon: BookOpen, label: "Ler a Bíblia completa", sub: "Plano anual estruturado" },
  { icon: Target, label: "Começar do zero", sub: "Introdução às escrituras" },
  { icon: Clock, label: "Superar um momento difícil", sub: "Salmos, Provérbios, João" },
];

const TIMES = ["5 min", "10 min", "20 min", "Livre", "1 versículo", "30 min"];
const HOURS = ["06:00", "07:00", "08:00", "12:00", "19:00", "20:00", "21:00"];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(0);
  const [time, setTime] = useState(0);
  const [hour, setHour] = useState("20:00");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync scroll position when step changed via buttons
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetX = step * container.offsetWidth;
      if (Math.abs(container.scrollLeft - targetX) > 10) {
        container.scrollTo({ left: targetX, behavior: 'smooth' });
      }
    }
  }, [step]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const currentStep = Math.round(scrollLeft / offsetWidth);
      if (currentStep !== step) {
        setStep(currentStep);
      }
    }
  };

  const totalSteps = 7; // Agora tem 7 passos (0-6)

  const next = () => {
    if (step < totalSteps - 1) setStep(s => s + 1);
    else onComplete();
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handlePermissionComplete = async () => {
    // Salvar que app já foi iniciado
    try {
      localStorage.setItem('hasLaunched', 'true');
    } catch (err) {
      console.error('Erro ao salvar hasLaunched:', err);
    }
    onComplete();
  };

  const handlePermissionSkip = async () => {
    // Usuário escolheu "Depois", mas ainda completamos onboarding
    try {
      localStorage.setItem('hasLaunched', 'true');
    } catch (err) {
      console.error('Erro ao salvar hasLaunched:', err);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-bible-bg z-[500] flex flex-col overflow-auto premium-scroll">
      {/* Progress Bar */}
      <div className="flex gap-1 px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-bible-accent' : 'bg-bible-accent/10'
              }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory premium-scroll no-scrollbar"
        >
          {/* Passo 0: Boas-vindas */}
          <section className="flex-shrink-0 w-full snap-start flex flex-col items-center justify-center p-6 text-center space-y-8 select-none">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bible-accent rounded-[26px] sm:rounded-[32px] flex items-center justify-center text-bible-bg shadow-2xl shadow-bible-accent/20 transition-transform active:scale-95">
              <BookOpen className="w-12 h-12" />
            </div>
            <div className="space-y-4 max-w-xs mx-auto">
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Bíblia Codex</h1>
              <p className="ui-text opacity-60 leading-relaxed text-base sm:text-lg">
                A Bíblia no seu ritmo.<br />Um versículo por vez, um dia de cada vez.
              </p>
            </div>
            <div className="w-full max-w-xs pt-8 space-y-4">
              <button onClick={() => setStep(1)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                Começar minha jornada
              </button>
              <button onClick={() => setStep(1)} className="w-full border border-bible-accent/20 py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs opacity-60">
                Já tenho uma conta
              </button>
            </div>
          </section>

          {/* Passo 1: Objetivo */}
          <section className="flex-shrink-0 w-full snap-start p-6 space-y-8 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Qual é o seu objetivo?</h2>
              <p className="ui-text opacity-60">Vamos personalizar sua experiência</p>
            </div>
            <div className="grid gap-3">
              {GOALS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGoal(i)}
                  className={`flex items-center space-x-4 p-5 rounded-3xl border-2 transition-all text-left ${goal === i ? 'border-bible-accent bg-bible-accent/5' : 'border-bible-accent/10 bg-transparent'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${goal === i ? 'bg-bible-accent text-bible-bg' : 'bg-bible-accent/10 text-bible-accent'
                    }`}>
                    <g.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-base sm:text-lg">{g.label}</div>
                    <div className="ui-text text-xs opacity-40">{g.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-8 space-y-4">
              <button onClick={() => setStep(2)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                Continuar
              </button>
            </div>
          </section>

          {/* Passo 2: Tempo */}
          <section className="flex-shrink-0 w-full snap-start p-6 space-y-8 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Quanto tempo por dia?</h2>
              <p className="ui-text opacity-60">Você pode mudar isso quando quiser</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TIMES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTime(i)}
                  className={`p-6 rounded-3xl border-2 transition-all text-center space-y-2 ${time === i ? 'border-bible-accent bg-bible-accent/5' : 'border-bible-accent/10 bg-transparent'
                    }`}
                >
                  <div className="font-display font-bold text-lg">{t}</div>
                  {i === 0 && <div className="inline-block bg-bible-accent/10 text-bible-accent text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Popular</div>}
                </button>
              ))}
            </div>
            <div className="pt-8 space-y-4">
              <button onClick={() => setStep(3)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                Continuar
              </button>
            </div>
          </section>

          {/* Passo 3: Lembretes */}
          <section className="flex-shrink-0 w-full snap-start p-6 space-y-8 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Ativar lembretes?</h2>
              <p className="ui-text opacity-60">Usuários com notificação têm 3× mais consistência</p>
            </div>
            <div className="bg-bible-accent/5 border border-bible-accent/10 rounded-[28px] p-6 space-y-4">
              <Bell className="w-4 h-4 text-bible-accent/40" />
              <p className="font-display font-bold text-lg leading-tight italic">
                "João, seu versículo de hoje está esperando ✦"
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {HOURS.map(h => (
                <button
                  key={h}
                  onClick={() => setHour(h)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all font-bold ui-text text-xs ${hour === h ? 'border-bible-accent bg-bible-accent text-bible-bg' : 'border-bible-accent/10 bg-transparent opacity-40'
                    }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="pt-8 space-y-4">
              <button onClick={() => setStep(4)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                Ativar Notificações
              </button>
              <button onClick={() => setStep(4)} className="w-full ui-text text-xs font-bold uppercase tracking-widest opacity-40 text-center">
                Agora não
              </button>
            </div>
          </section>

          {/* Passo 4: Plano */}
          <section className="flex-shrink-0 w-full snap-start p-6 space-y-8 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Seu plano personalizado</h2>
              <p className="ui-text opacity-60">Baseado no seu objetivo</p>
            </div>
            <div className="bg-bible-accent/5 border border-bible-accent/10 rounded-[30px] p-8 space-y-6">
              <h3 className="font-display font-bold text-2xl">{GOALS[goal].label}</h3>
              <div className="space-y-2">
                <div className="h-2 w-full bg-bible-accent/10 rounded-full overflow-hidden">
                  <div className="h-full bg-bible-accent w-[5%]" />
                </div>
                <p className="ui-text text-[10px] font-bold uppercase tracking-widest opacity-40">Dia 1 de 30</p>
              </div>
            </div>
            <button onClick={() => setStep(5)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
              Iniciar este plano
            </button>
          </section>

          {/* Passo 5: Versículo */}
          <section className="flex-shrink-0 w-full snap-start p-6 space-y-8 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Versículo de hoje</h2>
              <div className="bg-bible-accent/10 text-bible-accent px-3 py-1 rounded-full font-bold text-[10px] uppercase">🔥 Dia 1</div>
            </div>
            <div className="bg-bible-accent text-bible-bg rounded-[30px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
              <p className="bible-text text-xl italic leading-relaxed">
                "Bem-aventurado o homem que não anda no conselho dos ímpios, mas medita na sua lei dia e noite."
              </p>
              <p className="ui-text text-xs font-bold opacity-60">Salmos 1:1–2</p>
            </div>
            <textarea
              className="w-full bg-bible-accent/5 border border-bible-accent/10 rounded-3xl p-6 ui-text text-sm min-h-[120px]"
              placeholder="O que este texto fala com você hoje?"
            />
            <button onClick={() => setStep(6)} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
              COMEÇAR MINHA JORNADA ✦
            </button>
          </section>

          {/* Passo 6: Permissões */}
          <section className="flex-shrink-0 w-full snap-start overflow-y-auto">
            <PermissionScreen
              onComplete={handlePermissionComplete}
              onSkip={handlePermissionSkip}
            />
          </section>
        </div>
      </div>
    </div>
  );
};
