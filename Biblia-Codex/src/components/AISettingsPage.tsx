import React, { useState, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import {
  Sparkles, Key, Brain, BookOpen, MessageSquare, Lightbulb,
  Check, AlertCircle, ExternalLink, Loader2, Eye, Mic,
  Zap, Settings2
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

function cn(...inputs: (string | boolean | undefined)[]) {
  return clsx(inputs);
}

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; description?: string }> = ({ icon: Icon, title, description }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2.5 mb-1">
      <div className="p-1.5 rounded-lg bg-amber-100">
        <Icon className="w-4 h-4 text-bible-accent" />
      </div>
      <h2 className="text-sm font-bold text-bible-text">{title}</h2>
    </div>
    {description && <p className="text-xs text-bible-text-muted ml-9">{description}</p>}
  </div>
);

const API_PROVIDERS = [
  { id: 'opencode', name: 'OpenCode.ai', baseUrl: 'https://opencode.ai/api/v1', description: 'Nossa IA - MiniMax M2.5 gratuito' },
  { id: 'google', name: 'Google AI Studio (Gemini)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', description: 'Generoso - até 1M tokens gratuitamente' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', description: 'Velocidade instantanea - Llama e Mixtral' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', description: 'Agregador com varios modelos gratuitos' },
  { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://api-inference.huggingface.co', description: 'Milhares de modelos open source' },
];

const OPENCODE_MODELS = [
  { id: 'minimax-m2.5-free', name: 'MiniMax M2.5', provider: 'opencode', context: '197K', badge: 'Recomendado', speed: 'Rapido' },
];

const FREE_MODELS = [
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'openrouter', context: '197K', badge: 'Free', speed: 'Muito Rapido' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rapido' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B', provider: 'openrouter', context: '256K', badge: 'Free', speed: 'Rapido' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rapido' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rapido' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rapido' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rapido' },
  { id: 'openrouter/free', name: 'OpenRouter Auto', provider: 'openrouter', context: '200K', badge: 'Free', speed: 'Variavel' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', context: '1M', badge: 'Recomendado', speed: 'Rapido' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'google', context: '1M', badge: 'Novo', speed: 'Muito Rapido' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google', context: '1M', badge: 'Economico', speed: 'Muito Rapido' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', context: '1M', badge: null, speed: 'Avancado' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', context: '128K', badge: 'Free', speed: 'Instantaneo' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', context: '128K', badge: 'Free', speed: 'Instantaneo' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', context: '32K', badge: 'Free', speed: 'Instantaneo' },
  { id: 'qwen-qwen2-72b-instruct', name: 'Qwen2 72B', provider: 'groq', context: '32K', badge: 'Free', speed: 'Instantaneo' },
  { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', provider: 'huggingface', context: '64K', badge: 'Free', speed: 'Rapido', tier: 'inference' },
  { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', provider: 'huggingface', context: '128K', badge: 'Free', speed: 'Rapido', tier: 'inference' },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', provider: 'huggingface', context: '32K', badge: 'Free', speed: 'Rapido', tier: 'inference' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', provider: 'huggingface', context: '32K', badge: 'Free', speed: 'Rapido', tier: 'inference' },
];

export const AISettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAppContext();

  const [apiProvider, setApiProvider] = useState(() => {
    return localStorage.getItem('ai-api-provider') || 'google';
  });

  const [openCodeKey, setOpenCodeKey] = useState(() => {
    return localStorage.getItem('opencode-api-key') || '';
  });
  const [openRouterKey, setOpenRouterKey] = useState(() => {
    return localStorage.getItem('openrouter-api-key') || '';
  });
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const [openCodeKeyInput, setOpenCodeKeyInput] = useState(openCodeKey);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(openRouterKey);
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentApiKey = apiProvider === 'opencode' ? openCodeKey : apiProvider === 'openrouter' ? openRouterKey : geminiKey;

  const handleSaveApiKey = useCallback(() => {
    if (apiProvider === 'opencode' && openCodeKeyInput.trim()) {
      localStorage.setItem('opencode-api-key', openCodeKeyInput.trim());
      setOpenCodeKey(openCodeKeyInput.trim());
    } else if (apiProvider === 'openrouter' && openRouterKeyInput.trim()) {
      localStorage.setItem('openrouter-api-key', openRouterKeyInput.trim());
      setOpenRouterKey(openRouterKeyInput.trim());
    } else if (geminiKeyInput.trim()) {
      localStorage.setItem('gemini-api-key', geminiKeyInput.trim());
      setGeminiKey(geminiKeyInput.trim());
    }
    localStorage.setItem('ai-api-provider', apiProvider);
    setTestResult({ success: true, message: 'Chave salva com sucesso!' });
  }, [apiProvider, openCodeKeyInput, openRouterKeyInput, geminiKeyInput]);

  const handleTestConnection = useCallback(async () => {
    const key = apiProvider === 'opencode' ? openCodeKey : apiProvider === 'openrouter' ? openRouterKey : geminiKey;
    if (!key) {
      setTestResult({ success: false, message: 'Insira uma chave de API primeiro.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      let response;
      if (apiProvider === 'opencode') {
        response = await fetch(
          `https://opencode.ai/api/v1/models`,
          { headers: { 'Authorization': `Bearer ${key}` } }
        );
      } else if (apiProvider === 'openrouter') {
        response = await fetch(
          `https://openrouter.ai/api/v1/models`,
          { headers: { 'Authorization': `Bearer ${key}` } }
        );
      } else {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
      }

      if (response.ok) {
        setTestResult({ success: true, message: 'Conexao estabelecida com sucesso!' });
      } else {
        const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
        setTestResult({ success: false, message: error.error?.message || 'Erro ao conectar com a API.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Erro de conexao. Verifique sua internet.' });
    } finally {
      setIsTesting(false);
    }
  }, [apiProvider, openCodeKey, openRouterKey, geminiKey]);

  const aiFeatures = [
    { id: 'autoSuggest', label: 'Sugestoes Automaticas', description: 'Exibe sugestoes contextuais durante a leitura', icon: Lightbulb, enabled: settings.ai.autoSuggest },
    { id: 'verseExplanation', label: 'Explicacao de Versiculos', description: 'Permite selecionar versiculos para explicacao detalhada', icon: BookOpen, enabled: settings.ai.verseExplanation ?? true },
    { id: 'termDefinition', label: 'Definicao de Termos', description: 'Explica palavras e termos biblicos', icon: Brain, enabled: settings.ai.termDefinition ?? true },
    { id: 'crossReferences', label: 'Referencias Cruzadas', description: 'Sugere referencias relacionadas automaticamente', icon: MessageSquare, enabled: settings.ai.crossReferences ?? true },
    { id: 'strongAnalysis', label: 'Analise Strong', description: 'Mostra analises de palavras originais (hebraico/grego)', icon: Mic, enabled: settings.ai.strongAnalysis ?? false },
    { id: 'commentary', label: 'Comentarios Teologicos', description: 'Exibe comentarios de estudiosos', icon: Eye, enabled: settings.ai.commentary ?? true }
  ];

  const toggleFeature = (featureId: string) => {
    const currentValue = settings.ai[featureId as keyof typeof settings.ai] ?? false;
    updateSettings({
      ai: { ...settings.ai, [featureId]: !currentValue }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-bible-accent" />
                <span className="premium-kicker">Inteligencia Artificial</span>
              </div>
              <h1 className="premium-title mt-2 mb-1">Assistente IA</h1>
              <p className="premium-subtitle text-sm">Configure e personalize seu assistente de estudo biblico com IA</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100">
              <Brain className="w-6 h-6 text-bible-accent" />
            </div>
          </div>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-5">
          <SectionHeader icon={Key} title="Provedor de API" description="Escolha o provedor e insira sua chave gratuita" />
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {API_PROVIDERS.map((provider) => (
                <motion.button
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setApiProvider(provider.id)}
                  className={cn("p-3 rounded-xl border-2 text-left transition-all", apiProvider === provider.id ? "border-bible-accent bg-amber-100" : "border-bible-border bg-bible-surface hover:border-bible-accent")}
                >
                  <div className="font-semibold text-sm text-bible-text">{provider.name}</div>
                  <div className="text-xs text-bible-text-muted mt-0.5">{provider.id === 'google' ? 'Gratuito com $300/ano' : 'Modelos gratuitos via OpenRouter'}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {apiProvider === 'openrouter' && (
            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  value={openRouterKeyInput}
                  onChange={(e) => setOpenRouterKeyInput(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className={cn("w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent")}
                />
                <div className="text-xs text-bible-text-muted mt-2 space-y-1">
                  <p>1. Crie uma conta gratuita em <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">OpenRouter.ai</a></p>
                  <p>2. Vá para "Keys" no menu lateral e clique "Create Key"</p>
                  <p>3. Copie a chave gerada (começa com "sk-or-v1-...")</p>
                  <p>4. Cole aqui para acessar modelos gratuitos ilimitados</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 border border-bible-accent">
                <div className="text-xs font-semibold text-bible-text mb-1">Modelos Gratuitos Disponiveis:</div>
                <ul className="text-xs text-bible-text-muted space-y-0.5">
                  <li>- MiniMax M2.5 (197K contexto)</li>
                  <li>- NVIDIA Nemotron 3 Super (262K contexto)</li>
                  <li>- NVIDIA Nemotron 3 Nano 30B (256K contexto)</li>
                  <li>- Google Gemma 4 31B/26B (262K contexto)</li>
                  <li>- Qwen3 Next 80B e Qwen3 Coder (262K contexto)</li>
                </ul>
              </div>
            </div>
          )}

          {apiProvider === 'google' && (
            <div className="space-y-3">
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="Cole sua chave de API aqui..."
                className={cn("w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent")}
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">Google AI Studio</a></p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveApiKey}
              className={cn("px-4 py-3 rounded-xl font-bold text-sm bg-bible-accent text-white hover:bg-bible-accent-strong transition-colors", (apiProvider === 'openrouter' ? !openRouterKeyInput.trim() : !geminiKeyInput.trim()) && "opacity-50 cursor-not-allowed")}
            >Salvar</motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTestConnection}
              disabled={!currentApiKey || isTesting}
              className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm font-semibold text-bible-text hover:bg-bible-surface-strong", !currentApiKey && "opacity-50 cursor-not-allowed")}
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Testar Conexao
            </motion.button>
          </div>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-center gap-2 p-3 rounded-xl text-sm font-medium mt-3", testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}
            >
              {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult.message}
            </motion.div>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card p-5">
          <SectionHeader icon={Sparkles} title="Funcoes de IA" description="Ative ou desative os recursos de inteligencia artificial" />
          <div className="space-y-2">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleFeature(feature.id)}
                  className="flex w-full items-center justify-between rounded-xl p-4 transition-all bg-bible-surface hover:bg-bible-surface-strong"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100"><Icon className="w-4 h-4 text-bible-accent" /></div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-semibold text-bible-text">{feature.label}</span>
                      <p className="text-xs text-bible-text-muted mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                  <div className={cn('w-12 h-7 rounded-full p-1 transition-all shadow-inner', feature.enabled ? 'bg-gradient-to-r from-bible-accent to-bible-accent-strong' : 'bg-bible-border')}>
                    <motion.div animate={{ x: feature.enabled ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card p-5">
          <SectionHeader icon={Settings2} title="Modelo de IA" description={`Baseado em: ${apiProvider === 'openrouter' ? 'OpenRouter (gratuito)' : 'Google Gemini'}`} />
          {apiProvider === 'openrouter' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FREE_MODELS.filter(m => m.provider === 'openrouter').map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateSettings({ ai: { ...settings.ai, model: model.id } })}
                  className={cn("relative p-3 rounded-xl border-2 text-left transition-all", settings.ai.model === model.id ? "border-bible-accent bg-amber-100" : "border-bible-border bg-bible-surface hover:border-bible-accent")}
                >
                  {model.badge && <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">{model.badge}</span>}
                  <div className="font-semibold text-sm text-bible-text">{model.name}</div>
                  <div className="text-xs text-bible-text-muted">{model.context} - {model.speed}</div>
                  {settings.ai.model === model.id && <Check className="w-4 h-4 text-bible-accent absolute top-1 left-1" />}
                </motion.button>
              ))}
            </div>
          )}
          {apiProvider === 'google' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FREE_MODELS.filter(m => m.provider === 'google').map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateSettings({ ai: { ...settings.ai, model: model.id } })}
                  className={cn("relative p-4 rounded-xl border-2 text-left transition-all", settings.ai.model === model.id ? "border-bible-accent bg-amber-100" : "border-bible-border bg-bible-surface hover:border-bible-accent")}
                >
                  {model.badge && <span className={cn("absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold", model.badge === 'Recomendado' ? "bg-green-100 text-green-800" : "bg-amber-100 text-bible-accent")}>{model.badge}</span>}
                  <div className="font-semibold text-bible-text">{model.name}</div>
                  <div className="text-xs text-bible-text-muted mt-1">{model.context} - {model.speed}</div>
                  {settings.ai.model === model.id && <Check className="w-4 h-4 text-bible-accent absolute top-2 left-2" />}
                </motion.button>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="premium-card p-5">
          <SectionHeader icon={BookOpen} title="Perfil Teologico" description="Defina a perspectiva teologica para respostas" />
          <div className="space-y-2">
            {[{ id: 'assembleiano', name: 'Assembleiano Classico', description: 'Pentecostalismo Historico CPAD', authors: 'Antonio Gilberto, Eurico Bergstén, Elienai Cabral' }, { id: 'generico', name: 'Biblico Geral', description: 'Perspectiva ecumenica equilibrada', authors: 'Variadas traduccoes e commentarios' }, { id: 'academico', name: 'Academico', description: 'Analise critica e historica', authors: 'Dicionarios e enciclopedias biblicas' }].map((profile) => (
              <motion.button
                key={profile.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => updateSettings({ ai: { ...settings.ai, theologicalProfile: profile.id } })}
                className={cn("w-full p-4 rounded-xl border-2 text-left transition-all", (settings.ai.theologicalProfile || 'assembleiano') === profile.id ? "border-bible-accent bg-amber-100" : "border-bible-border bg-bible-surface hover:border-bible-accent")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-bible-text">{profile.name}</div>
                    <div className="text-xs text-bible-text-muted mt-1">{profile.description}</div>
                    <div className="text-xs text-bible-accent mt-2">{profile.authors}</div>
                  </div>
                  {(settings.ai.theologicalProfile || 'assembleiano') === profile.id && <Check className="w-5 h-5 text-bible-accent shrink-0" />}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="premium-card p-5">
          <SectionHeader icon={MessageSquare} title="Idioma das Respostas" description="Configure o idioma para o assistente IA" />
          <div className="grid grid-cols-2 gap-3">
            {[{ id: 'pt-BR', name: 'Portugues (Brasil)', flag: 'BR' }, { id: 'en', name: 'English', flag: 'US' }].map((lang) => (
              <motion.button
                key={lang.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ ai: { ...settings.ai, language: lang.id } })}
                className={cn("p-4 rounded-xl border-2 text-sm font-bold transition-all", settings.ai.language === lang.id ? "bg-gradient-to-br from-bible-accent to-bible-accent-strong text-white border-bible-accent" : "bg-bible-surface text-bible-text border-bible-border hover:border-bible-accent")}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div>{lang.name}</div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};