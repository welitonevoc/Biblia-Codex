import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Book, History, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { DictionaryEntry } from '../types';
import { createAiModule, AI_MODULE_ID } from '../services/dictionaryService';
import { MySwordParser } from '../services/mySwordParser';
import { storage } from '../StorageService';
import { motion, AnimatePresence } from 'motion/react';

export const DictionaryView: React.FC = () => {
  const { searchDictionary, selectedDictionaryModule, setSelectedDictionaryModule, user, login } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ term: string, timestamp: number }[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await storage.getDictionaryHistory();
      setHistory(savedHistory);
    };
    loadHistory();
  }, []);

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        // Handle MySword links
        if (href.startsWith('d')) {
          // Dictionary link: dWord or d-Dictionary Word
          const word = href.startsWith('d-') ? href.split(' ').slice(1).join(' ') : href.substring(1);
          setSearchTerm(word);
          // We can't easily trigger handleSearch here because it's an async function
          // but we can set the term and the user can click search, or we can refactor
        } else if (href.startsWith('b')) {
          // Bible link
          console.log(`Bible link: ${href}`);
        } else if (href.startsWith('s')) {
          // Strong's link
          const strong = href.substring(1);
          setSearchTerm(strong);
        }
      }
    }
  };

  const handleSearch = async (e?: React.FormEvent, termToSearch?: string) => {
    e?.preventDefault();
    const term = termToSearch || searchTerm;
    if (!term.trim()) return;

    if (selectedDictionaryModule?.id === AI_MODULE_ID && !user) {
      // Prompt for login if AI is selected but user is not logged in
      return;
    }

    setIsLoading(true);
    try {
      // Check cache first for offline use
      const cached = await storage.getDictionaryCache(term);
      if (cached) {
        setResults([{
          id: `cached-${term}`,
          term: cached.term,
          definition: cached.definition,
          moduleName: cached.moduleName,
          source: cached.moduleName.includes('IA') ? 'ai' : 'local',
          isAiGenerated: cached.moduleName.includes('IA')
        }]);
      } else {
        const entries = await searchDictionary(term);
        setResults(entries);
        
        // Save to cache if we got results
        if (entries.length > 0) {
          await storage.saveDictionaryCache(term, entries[0].definition, entries[0].moduleName);
        }
      }

      // Save to history
      await storage.saveDictionaryHistory(term);
      const updatedHistory = await storage.getDictionaryHistory();
      setHistory(updatedHistory);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAiModule = () => {
    if (selectedDictionaryModule?.id === AI_MODULE_ID) {
      // Switch to a mock local module
      setSelectedDictionaryModule({
        id: 'local-strong',
        name: 'Léxico Strong (Offline)',
        type: 'dictionary',
        abbreviation: 'STR',
        isVirtual: false,
        path: 'local-strong'
      });
    } else {
      setSelectedDictionaryModule(createAiModule('dictionary'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-bible-bg">
      {/* Header */}
      <div className="p-6 border-b border-bible-accent/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-bible-accent">Dicionário</h2>
          <button 
            onClick={toggleAiModule}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border ${
              selectedDictionaryModule?.id === AI_MODULE_ID 
                ? 'bg-bible-accent text-bible-bg border-bible-accent' 
                : 'bg-transparent text-bible-accent border-bible-accent/30 hover:border-bible-accent'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${selectedDictionaryModule?.id === AI_MODULE_ID ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {selectedDictionaryModule?.id === AI_MODULE_ID ? 'IA Ativada' : 'Ativar IA'}
            </span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar termo ou Strong (ex: G26)..."
            className="w-full bg-bible-accent/5 border border-bible-accent/20 rounded-2xl py-4 pl-12 pr-4 ui-text focus:outline-none focus:border-bible-accent transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bible-accent/40" />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-bible-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {selectedDictionaryModule?.id === AI_MODULE_ID && !user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-6 text-center max-w-xs mx-auto"
            >
              <div className="p-4 bg-bible-accent/10 rounded-full">
                <Sparkles className="w-10 h-10 text-bible-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-display font-bold text-bible-accent">Assistente de Estudo IA</h3>
                <p className="ui-text text-sm opacity-60">
                  Para usar a inteligência artificial nas suas pesquisas teológicas, você precisa estar conectado.
                </p>
              </div>
              <button 
                onClick={login}
                className="w-full bg-bible-accent text-bible-bg py-3 rounded-xl font-bold ui-text text-sm hover:bg-bible-accent/90 transition-colors"
              >
                Conectar com Google
              </button>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {results.map((entry) => (
                <div key={entry.id} className="bg-bible-accent/5 rounded-3xl p-6 border border-bible-accent/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-bible-accent/60">{entry.moduleName}</span>
                    {entry.isAiGenerated && (
                      <span className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        <span>IA Generativa</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-4 text-bible-accent">{entry.term}</h3>
                  <div 
                    onClick={handleLinkClick}
                    className="ui-text leading-relaxed whitespace-pre-wrap opacity-80"
                    dangerouslySetInnerHTML={{ __html: MySwordParser.parseContent(entry.definition) }}
                  />
                </div>
              ))}
            </motion.div>
          ) : !isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
              <Book className="w-16 h-16" />
              <p className="ui-text text-center max-w-[200px]">Pesquise um termo para ver a definição teológica.</p>
            </div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && !results.length && !isLoading && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4 text-bible-accent/40">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Buscas Recentes</span>
              </div>
              <button 
                onClick={async () => {
                  // We need to add a clear history method to storage or just do it here
                  // For now, let's just clear the state and we can add storage method later
                  setHistory([]);
                }}
                className="text-[10px] uppercase tracking-widest hover:text-bible-accent transition-colors"
              >
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h.term}
                  onClick={() => { setSearchTerm(h.term); handleSearch(undefined, h.term); }}
                  className="px-4 py-2 rounded-full bg-bible-accent/5 border border-bible-accent/10 text-xs hover:bg-bible-accent/10 transition-colors"
                >
                  {h.term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
