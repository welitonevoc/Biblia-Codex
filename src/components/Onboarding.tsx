import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-bible-bg z-[500] flex flex-col overflow-hidden">
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

      <div className="flex-1 flex flex-col px-4 sm:px-6 pb-8 sm:pb-12 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bible-accent rounded-[26px] sm:rounded-[32px] flex items-center justify-center text-bible-bg shadow-2xl shadow-bible-accent/20">
                  <BookOpen className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">Bíblia Codex</h1>
                  <p className="ui-text opacity-60 leading-relaxed text-base sm:text-lg">
                    A Bíblia no seu ritmo.<br />Um versículo por vez, um dia de cada vez.
                  </p>
                </div>
                <div className="w-full pt-8 space-y-4">
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Começar minha jornada
                  </button>
                  <button onClick={next} className="w-full border border-bible-accent/20 py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs opacity-60">
                    Já tenho uma conta
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
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
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Continuar
                  </button>
                  <button onClick={back} className="w-full flex items-center justify-center space-x-2 ui-text text-xs font-bold uppercase tracking-widest opacity-40">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
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
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Continuar
                  </button>
                  <button onClick={back} className="w-full flex items-center justify-center space-x-2 ui-text text-xs font-bold uppercase tracking-widest opacity-40">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold">Ativar lembretes?</h2>
                  <p className="ui-text opacity-60">Usuários com notificação têm 3× mais consistência</p>
                </div>

                <div className="bg-bible-accent/5 border border-bible-accent/10 rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 space-y-4">
                  <div className="flex items-center space-x-3 opacity-40">
                    <Bell className="w-4 h-4" />
                    <span className="ui-text text-[10px] font-bold uppercase tracking-widest">Notificação</span>
                  </div>
                  <p className="font-display font-bold text-lg leading-tight">
                    "João, seu versículo de hoje está esperando ✦"
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="ui-text text-xs font-bold uppercase tracking-widest opacity-40">Melhor horário para lembrar:</p>
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
                </div>

                <div className="pt-8 space-y-4">
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Ativar Notificações
                  </button>
                  <button onClick={next} className="w-full ui-text text-xs font-bold uppercase tracking-widest opacity-40 text-center">
                    Agora não
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold">Seu plano personalizado</h2>
                  <p className="ui-text opacity-60">Baseado no seu objetivo</p>
                </div>

                <div className="bg-bible-accent/5 border border-bible-accent/10 rounded-[30px] sm:rounded-[40px] p-5 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl">{GOALS[goal].label}</h3>
                    <p className="ui-text text-sm opacity-60">{GOALS[goal].sub} · 30 dias</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-bible-accent/10 rounded-full overflow-hidden">
                      <div className="h-full bg-bible-accent w-[5%]" />
                    </div>
                    <p className="ui-text text-[10px] font-bold uppercase tracking-widest opacity-40">Dia 1 de 30</p>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Iniciar este plano
                  </button>
                  <button onClick={back} className="w-full flex items-center justify-center space-x-2 ui-text text-xs font-bold uppercase tracking-widest opacity-40">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold">Versículo de hoje</h2>
                    <p className="ui-text opacity-60">Seu streak começou agora</p>
                  </div>
                  <div className="bg-bible-accent text-bible-bg px-4 py-2 rounded-2xl font-bold ui-text text-[10px] uppercase tracking-widest shadow-lg shadow-bible-accent/20">
                    🔥 Dia 1
                  </div>
                </div>

                <div className="bg-bible-accent text-bible-bg rounded-[30px] sm:rounded-[40px] p-5 sm:p-10 space-y-6 shadow-2xl shadow-bible-accent/20 relative overflow-hidden">
                  <Sparkles className="absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
                  <p className="bible-text text-lg sm:text-2xl italic leading-relaxed">
                    "Bem-aventurado o homem que não anda no conselho dos ímpios, mas medita na sua lei dia e noite."
                  </p>
                  <p className="ui-text text-xs font-bold uppercase tracking-widest opacity-60">Salmos 1:1–2</p>
                </div>

                <div className="space-y-4">
                  <p className="ui-text text-xs font-bold uppercase tracking-widest opacity-40">O que este texto fala com você hoje?</p>
                  <textarea
                    className="w-full bg-bible-accent/5 border border-bible-accent/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 ui-text text-sm min-h-[110px] sm:min-h-[120px] focus:outline-none focus:border-bible-accent transition-colors"
                    placeholder="Anote sua reflexão..."
                  />
                </div>

                <div className="pt-8 space-y-4">
                  <button onClick={next} className="w-full bg-bible-accent text-bible-bg py-5 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs shadow-xl shadow-bible-accent/20">
                    Começar minha jornada ✦
                  </button>
                  <button onClick={back} className="w-full flex items-center justify-center space-x-2 ui-text text-xs font-bold uppercase tracking-widest opacity-40">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <PermissionScreen
                onComplete={handlePermissionComplete}
                onSkip={handlePermissionSkip}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
