import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Book, Calendar, Heart, Volume2 } from 'lucide-react';

const BibleReadingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedReadings, setCompletedReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentReading, setCurrentReading] = useState(null);

  const plans = [
    {
      id: 'encontrando-deus',
      title: 'Encontrando Deus no Deserto',
      subtitle: 'BibleProject',
      description: 'Uma jornada de 7 dias explorando as experiências no deserto',
      days: 7,
      color: '#D4876F',
      image: '🏜️',
      readings: [
        { day: 1, title: 'Devotional', type: 'devotional', passages: ['Gênesis 1:1-2'] },
        { day: 1, title: 'Gênesis 1:1-2', type: 'scripture', passages: ['Gênesis 1:1-2'] },
        { day: 2, title: 'Gênesis 2:4-15', type: 'scripture', passages: ['Gênesis 2:4-15'] },
        { day: 3, title: 'Gênesis 3:22-24', type: 'scripture', passages: ['Gênesis 3:22-24'] },
        { day: 4, title: 'Êxodo 3:1-15', type: 'scripture', passages: ['Êxodo 3:1-15'] },
        { day: 5, title: 'Números 20:1-13', type: 'scripture', passages: ['Números 20:1-13'] },
        { day: 6, title: 'Isaías 40:1-11', type: 'scripture', passages: ['Isaías 40:1-11'] },
        { day: 7, title: 'Mateus 4:1-11', type: 'scripture', passages: ['Mateus 4:1-11'] }
      ]
    },
    {
      id: 'salmos-oracao',
      title: 'Salmos de Oração',
      subtitle: 'Orações Diárias',
      description: 'Descubra a beleza da oração através dos Salmos',
      days: 10,
      color: '#7B8FA1',
      image: '🙏',
      readings: [
        { day: 1, title: 'Salmo 1', type: 'scripture', passages: ['Salmo 1'] },
        { day: 2, title: 'Salmo 23', type: 'scripture', passages: ['Salmo 23'] },
        { day: 3, title: 'Salmo 27', type: 'scripture', passages: ['Salmo 27'] },
        { day: 4, title: 'Salmo 51', type: 'scripture', passages: ['Salmo 51'] },
        { day: 5, title: 'Salmo 63', type: 'scripture', passages: ['Salmo 63'] },
        { day: 6, title: 'Salmo 91', type: 'scripture', passages: ['Salmo 91'] },
        { day: 7, title: 'Salmo 103', type: 'scripture', passages: ['Salmo 103'] },
        { day: 8, title: 'Salmo 121', type: 'scripture', passages: ['Salmo 121'] },
        { day: 9, title: 'Salmo 139', type: 'scripture', passages: ['Salmo 139'] },
        { day: 10, title: 'Salmo 150', type: 'scripture', passages: ['Salmo 150'] }
      ]
    },
    {
      id: 'vida-jesus',
      title: 'A Vida de Jesus',
      subtitle: 'Evangelhos',
      description: 'Conheça Jesus através dos quatro evangelhos',
      days: 14,
      color: '#A17B7B',
      image: '✝️',
      readings: [
        { day: 1, title: 'O Nascimento de Jesus', type: 'scripture', passages: ['Lucas 2:1-20'] },
        { day: 2, title: 'Jesus no Templo', type: 'scripture', passages: ['Lucas 2:41-52'] },
        { day: 3, title: 'O Batismo', type: 'scripture', passages: ['Mateus 3:13-17'] },
        { day: 4, title: 'As Tentações', type: 'scripture', passages: ['Mateus 4:1-11'] },
        { day: 5, title: 'Chamando Discípulos', type: 'scripture', passages: ['Lucas 5:1-11'] },
        { day: 6, title: 'Sermão do Monte', type: 'scripture', passages: ['Mateus 5:1-20'] },
        { day: 7, title: 'O Bom Samaritano', type: 'scripture', passages: ['Lucas 10:25-37'] },
        { day: 8, title: 'O Filho Pródigo', type: 'scripture', passages: ['Lucas 15:11-32'] },
        { day: 9, title: 'Alimentando 5000', type: 'scripture', passages: ['João 6:1-15'] },
        { day: 10, title: 'Lázaro Ressuscitado', type: 'scripture', passages: ['João 11:1-44'] },
        { day: 11, title: 'A Última Ceia', type: 'scripture', passages: ['João 13:1-17'] },
        { day: 12, title: 'A Crucificação', type: 'scripture', passages: ['João 19:16-30'] },
        { day: 13, title: 'A Ressurreição', type: 'scripture', passages: ['João 20:1-18'] },
        { day: 14, title: 'A Grande Comissão', type: 'scripture', passages: ['Mateus 28:16-20'] }
      ]
    }
  ];

  // Bible content examples
  const bibleContent = {
    'Gênesis 1:1-2': {
      book: 'Gênesis',
      chapter: 1,
      verses: '1-2',
      translation: 'NTLH',
      content: [
        { verse: 1, text: 'No começo Deus criou os céus e a terra.' },
        { verse: 2, text: 'A terra era um vazio, sem nenhum ser vivente, e estava coberta por um mar profundo. A escuridão cobria o mar, e o Espírito de Deus se movia por cima da água.' }
      ]
    },
    'Devotional': {
      title: 'Encontrando Deus no Vazio',
      content: `O deserto é um lugar de encontro com Deus. Nas Escrituras, vemos repetidamente que Deus leva seu povo ao deserto - não para abandoná-los, mas para encontrá-los de maneira mais profunda.

Hoje começamos nossa jornada explorando o próprio início da criação. Antes de haver luz, ordem ou vida, havia um vazio - tohu wabohu em hebraico, que podemos traduzir como "sem forma e vazio". E foi precisamente neste vazio que o Espírito de Deus se movia.

O deserto de nossas vidas - aqueles momentos de vazio, confusão ou solidão - pode parecer um lugar de ausência. Mas as Escrituras nos lembram que é justamente ali que o Espírito de Deus está mais ativo, se movendo sobre as águas do caos, preparando para trazer nova vida e ordem.

Reflexão: Onde você está experimentando "deserto" em sua vida agora? Como você pode abrir espaço para perceber o movimento do Espírito de Deus, mesmo no vazio?`
    },
    'Salmo 23': {
      book: 'Salmos',
      chapter: 23,
      verses: '1-6',
      translation: 'NTLH',
      content: [
        { verse: 1, text: 'O Senhor é o meu pastor; nada me faltará.' },
        { verse: 2, text: 'Ele me faz descansar em pastos verdejantes. Leva-me para junto das águas de descanso;' },
        { verse: 3, text: 'refrigera-me a alma. Guia-me pelos caminhos da justiça por amor do seu nome.' },
        { verse: 4, text: 'Mesmo quando eu andar por um vale escuro como a morte, não temerei perigo algum, pois tu, Senhor Deus, estás comigo. Tu me proteges e me guias.' },
        { verse: 5, text: 'Preparas um banquete para mim, onde os meus inimigos me possam ver. Tu me recebes como convidado de honra e enches o meu copo até a borda.' },
        { verse: 6, text: 'Eu sei que a tua bondade e o teu amor me acompanharão todos os dias da minha vida; e na tua casa, ó Senhor, morarei para sempre.' }
      ]
    },
    'Lucas 2:1-20': {
      book: 'Lucas',
      chapter: 2,
      verses: '1-20',
      translation: 'NTLH',
      content: [
        { verse: 1, text: 'Por aquele tempo o Imperador Augusto mandou fazer um recenseamento em todo o Império Romano.' },
        { verse: 2, text: 'Esse primeiro recenseamento foi feito quando Quirino era o governador da província da Síria.' },
        { verse: 3, text: 'Todos iam registrar-se, cada um na sua própria cidade.' },
        { verse: 4, text: 'Assim José saiu da cidade de Nazaré, na região da Galileia, e foi para a Judeia, para a cidade de Davi, chamada Belém, pois José era descendente de Davi.' },
        { verse: 5, text: 'José foi a fim de se registrar com Maria, sua noiva, que estava grávida.' },
        { verse: 6, text: 'E, quando estavam em Belém, chegou o tempo de Maria dar à luz.' },
        { verse: 7, text: 'E ela deu à luz o seu primeiro filho, um menino. Enfaixou o menino e o deitou numa manjedoura, pois não havia lugar para eles na pensão.' },
        { verse: 8, text: 'Naquela região havia pastores que estavam passando a noite nos campos, tomando conta das suas ovelhas.' },
        { verse: 9, text: 'Então um anjo do Senhor apareceu, e a glória do Senhor brilhou por cima dos pastores. Eles ficaram com muito medo,' },
        { verse: 10, text: 'mas o anjo disse: — Não tenham medo! Estou aqui a fim de trazer uma boa notícia para vocês, e ela será motivo de grande alegria também para todo o povo!' }
      ]
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const result = await window.storage.get('bible-reading-progress');
      if (result && result.value) {
        const data = JSON.parse(result.value);
        setCompletedReadings(data.completed || {});
        setSelectedPlan(data.selectedPlan || null);
        setCurrentDay(data.currentDay || 1);
      }
    } catch (error) {
      console.log('No saved progress found');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (completed, plan, day) => {
    try {
      await window.storage.set('bible-reading-progress', JSON.stringify({
        completed,
        selectedPlan: plan,
        currentDay: day
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleReading = (planId, day, readingIndex) => {
    const key = `${planId}-${day}-${readingIndex}`;
    const newCompleted = { ...completedReadings };
    
    if (newCompleted[key]) {
      delete newCompleted[key];
    } else {
      newCompleted[key] = true;
    }
    
    setCompletedReadings(newCompleted);
    saveProgress(newCompleted, selectedPlan, currentDay);
  };

  const isReadingCompleted = (planId, day, readingIndex) => {
    return completedReadings[`${planId}-${day}-${readingIndex}`] || false;
  };

  const getDayProgress = (planId, day) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 0;
    
    const dayReadings = plan.readings.filter(r => r.day === day);
    const completed = dayReadings.filter((_, idx) => 
      isReadingCompleted(planId, day, idx)
    ).length;
    
    return dayReadings.length > 0 ? (completed / dayReadings.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
        <div className="text-stone-600 font-serif text-xl">Carregando...</div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <Book className="text-amber-700" size={40} />
            </div>
            <h1 className="text-6xl font-serif text-stone-800 mb-3 tracking-tight">
              Planos de Leitura
            </h1>
            <p className="text-stone-600 text-lg font-light max-w-2xl mx-auto">
              Escolha um plano e comece sua jornada espiritual hoje
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-stone-200 hover:border-stone-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  setCurrentDay(1);
                  saveProgress(completedReadings, plan.id, 1);
                }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {plan.image}
                </div>
                
                <div className="mb-4">
                  <div 
                    className="text-xs uppercase tracking-widest font-semibold mb-2"
                    style={{ color: plan.color }}
                  >
                    {plan.subtitle}
                  </div>
                  <h3 className="text-2xl font-serif text-stone-800 mb-2 leading-tight">
                    {plan.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-stone-500 text-sm mb-6">
                  <Calendar size={16} />
                  <span>{plan.days} dias</span>
                </div>

                <div 
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium group-hover:gap-3 transition-all"
                  style={{ backgroundColor: plan.color }}
                >
                  Começar Plano
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          
          .animate-slide-up {
            animation: slideUp 0.8s ease-out;
          }
        `}</style>
      </div>
    );
  }

  const plan = plans.find(p => p.id === selectedPlan);
  const currentDayReadings = plan.readings.filter(r => r.day === currentDay);

  // Reading view
  if (currentReading) {
    const reading = currentReading.reading;
    const content = bibleContent[reading.title] || bibleContent[reading.passages[0]];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
        <div className="max-w-3xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentReading(null)}
              className="text-stone-600 hover:text-stone-800 flex items-center gap-2 transition-colors"
            >
              <ChevronRight size={20} className="rotate-180" />
              Voltar
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  alert('Recurso de áudio será implementado em breve!');
                }}
                className="w-10 h-10 rounded-full bg-white border-2 border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors flex items-center justify-center"
                title="Ouvir áudio"
              >
                <Volume2 size={18} />
              </button>
              
              <button
                onClick={() => {
                  const version = content?.translation || 'NTLH';
                  alert(`Tradução: ${version} - Nova Tradução na Linguagem de Hoje`);
                }}
                className="px-4 py-2 rounded-full bg-white border-2 border-stone-200 text-stone-700 font-medium hover:border-stone-300 transition-colors"
              >
                {content?.translation || 'NTLH'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-stone-200 mb-8">
            {content?.book && (
              <div className="mb-8">
                <h1 className="text-5xl font-serif text-stone-800 mb-2 tracking-tight">
                  {content.book} {content.chapter}
                </h1>
                {content.verses && (
                  <p className="text-stone-500 text-lg">
                    Versículos {content.verses}
                  </p>
                )}
              </div>
            )}

            {content?.title && (
              <div className="mb-8">
                <h1 className="text-4xl font-serif text-stone-800 mb-4 tracking-tight">
                  {content.title}
                </h1>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              {content?.content && Array.isArray(content.content) ? (
                <div className="space-y-6">
                  {content.content.map((item, index) => (
                    <div key={index} className="flex gap-4 group">
                      <span className="text-stone-400 font-semibold flex-shrink-0 w-8 text-right">
                        {item.verse}
                      </span>
                      <p className="text-stone-700 leading-relaxed text-lg flex-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-stone-700 leading-relaxed text-lg whitespace-pre-line">
                  {content?.content || 'Conteúdo não disponível.'}
                </div>
              )}
            </div>

            {content?.book && (
              <div className="mt-12 pt-8 border-t border-stone-200">
                <p className="text-sm text-stone-500 leading-relaxed">
                  Nova Tradução na Linguagem de Hoje © Copyright © 2000 Sociedade Bíblica do Brasil. 
                  Todos os direitos reservados. A Sociedade Bíblica do Brasil trabalha para que a Bíblia 
                  esteja, efetivamente, ao alcance de todos e seja lida por todos.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                toggleReading(plan.id, currentDay, currentReading.index);
                setCurrentReading(null);
              }}
              className="flex-1 py-4 px-6 rounded-full font-semibold text-white text-lg
                         shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                         flex items-center justify-center gap-2"
              style={{ backgroundColor: plan.color }}
            >
              <Check size={20} />
              Marcar como Lida
            </button>

            <button
              onClick={() => setCurrentReading(null)}
              className="px-8 py-4 rounded-full font-semibold text-stone-700 text-lg
                         bg-white border-2 border-stone-200 hover:border-stone-300 
                         transition-all duration-300"
            >
              Continuar Depois
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <button
          onClick={() => setSelectedPlan(null)}
          className="mb-8 text-stone-600 hover:text-stone-800 flex items-center gap-2 transition-colors"
        >
          <ChevronRight size={20} className="rotate-180" />
          Voltar aos Planos
        </button>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 mb-8 border border-stone-200">
          <div className="flex items-start gap-6 mb-8">
            <div 
              className="text-5xl p-4 rounded-2xl"
              style={{ backgroundColor: `${plan.color}20` }}
            >
              {plan.image}
            </div>
            
            <div className="flex-1">
              <div 
                className="text-xs uppercase tracking-widest font-semibold mb-2"
                style={{ color: plan.color }}
              >
                {plan.subtitle}
              </div>
              <h1 className="text-4xl font-serif text-stone-800 mb-2 leading-tight">
                {plan.title}
              </h1>
              <p className="text-stone-600">
                Dia {currentDay} de {plan.days}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {[...Array(plan.days)].map((_, index) => {
              const day = index + 1;
              const progress = getDayProgress(plan.id, day);
              const isActive = day === currentDay;
              
              return (
                <div key={day} className="flex flex-col items-center gap-2 min-w-[60px]">
                  <button
                    onClick={() => setCurrentDay(day)}
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg
                      transition-all duration-300 relative overflow-hidden
                      ${isActive 
                        ? 'shadow-lg scale-110' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }
                    `}
                    style={isActive ? { 
                      backgroundColor: plan.color,
                      color: 'white'
                    } : {}}
                  >
                    {day}
                    {progress > 0 && progress < 100 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-white/30"
                        style={{ height: `${progress}%` }}
                      />
                    )}
                    {progress === 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500">
                        <Check size={24} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <div className="text-xs text-stone-500 text-center whitespace-nowrap">
                    {day === currentDay ? 'Hoje' : `Dia ${day}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-stone-200">
          <h2 className="text-2xl font-serif text-stone-800 mb-6">
            Leituras do Dia
          </h2>

          <div className="space-y-3">
            {currentDayReadings.map((reading, index) => {
              const isCompleted = isReadingCompleted(plan.id, currentDay, index);
              
              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300
                    cursor-pointer group hover:shadow-md
                    ${isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                    }
                  `}
                  onClick={() => setCurrentReading({ reading, index })}
                >
                  <div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500' 
                        : 'bg-white border-2 border-stone-300 group-hover:border-stone-400'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReading(plan.id, currentDay, index);
                    }}
                  >
                    {isCompleted ? (
                      <Check size={20} color="white" strokeWidth={3} />
                    ) : (
                      <span className="text-stone-400 font-semibold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-stone-800">
                      {reading.title}
                    </h3>
                    {reading.type === 'devotional' && (
                      <span className="text-xs text-stone-500 uppercase tracking-wide">
                        Devocional
                      </span>
                    )}
                  </div>

                  <ChevronRight 
                    size={20} 
                    className="text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all"
                  />
                </div>
              );
            })}
          </div>

          {currentDayReadings.length > 0 && (
            <button
              className="w-full mt-8 py-4 px-6 rounded-full font-semibold text-white text-lg
                       shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                       flex items-center justify-center gap-2"
              style={{ backgroundColor: plan.color }}
              onClick={() => {
                const allCompleted = currentDayReadings.every((_, idx) => 
                  isReadingCompleted(plan.id, currentDay, idx)
                );
                
                if (allCompleted) {
                  if (currentDay < plan.days) {
                    setCurrentDay(currentDay + 1);
                    saveProgress(completedReadings, selectedPlan, currentDay + 1);
                  }
                } else {
                  // Find first uncompleted reading and open it
                  const firstUncompleted = currentDayReadings.findIndex((_, idx) => 
                    !isReadingCompleted(plan.id, currentDay, idx)
                  );
                  if (firstUncompleted !== -1) {
                    setCurrentReading({ 
                      reading: currentDayReadings[firstUncompleted], 
                      index: firstUncompleted 
                    });
                  }
                }
              }}
            >
              {currentDayReadings.every((_, idx) => 
                isReadingCompleted(plan.id, currentDay, idx)
              ) ? (
                currentDay < plan.days ? (
                  <>Próximo Dia <ChevronRight size={20} /></>
                ) : (
                  <>Plano Completo <Heart size={20} /></>
                )
              ) : (
                'Começar Leitura'
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, sans-serif;
        }
        
        h1, h2, h3, .font-serif {
          font-family: 'Crimson Pro', Georgia, serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BibleReadingPlan;
