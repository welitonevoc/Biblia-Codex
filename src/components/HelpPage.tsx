import React from 'react';
import { 
  HelpCircle, MessageSquare, BookOpen, ExternalLink, 
  Mail, Github, Twitter, Globe, Shield, FileText,
  ChevronRight, Search, Zap, Star
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HelpPage: React.FC = () => {
  const categories = [
    { 
      title: 'Primeiros Passos', 
      icon: Zap,
      items: ['Como ler a Bíblia', 'Personalizando o tema', 'Importando módulos']
    },
    { 
      title: 'Ferramentas de Estudo', 
      icon: BookOpen,
      items: ['Usando o Dicionário', 'Comentários de IA', 'Referências Cruzadas']
    },
    { 
      title: 'Conta & Sincronização', 
      icon: Shield,
      items: ['Criando um backup', 'Sincronizando dispositivos', 'Privacidade de dados']
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-bible-bg p-8 md:p-16 lg:p-24">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">Suporte & Ajuda</h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input 
              type="text"
              placeholder="Como podemos ajudar você hoje?"
              className="w-full bg-bible-accent/5 border border-bible-accent/10 rounded-2xl py-4 pl-12 pr-4 ui-text focus:outline-none focus:ring-2 focus:ring-bible-accent/20 transition-all"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-bible-accent/5 border border-bible-accent/10 space-y-6">
              <div className="p-3 bg-bible-accent/10 rounded-xl w-fit">
                <cat.icon className="w-6 h-6 text-bible-accent" />
              </div>
              <h3 className="ui-text font-bold text-lg">{cat.title}</h3>
              <ul className="space-y-3">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="ui-text text-sm opacity-60 group-hover:opacity-100 transition-opacity">{item}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="space-y-8">
          <h2 className="ui-text text-xs uppercase tracking-[0.2em] font-bold opacity-40">Canais de Contato</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-6 rounded-2xl border border-bible-accent/10 hover:bg-bible-accent/5 transition-all text-left group">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="ui-text font-bold text-sm">E-mail</p>
                  <p className="ui-text text-xs opacity-40">suporte@kerygma.app</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="flex items-center justify-between p-6 rounded-2xl border border-bible-accent/10 hover:bg-bible-accent/5 transition-all text-left group">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="ui-text font-bold text-sm">Comunidade</p>
                  <p className="ui-text text-xs opacity-40">Discord & Fórum</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </section>

        <footer className="pt-16 border-t border-bible-accent/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-4 opacity-40">
            <Star className="w-5 h-5 text-bible-accent" />
            <span className="ui-text text-xs font-bold uppercase tracking-widest">Obrigado por usar o Kerygma</span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="p-2 hover:bg-bible-accent/5 rounded-full transition-colors opacity-40 hover:opacity-100">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-bible-accent/5 rounded-full transition-colors opacity-40 hover:opacity-100">
              <Github className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-bible-accent/5 rounded-full transition-colors opacity-40 hover:opacity-100">
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
