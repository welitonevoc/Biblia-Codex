import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import {
  Sparkles, Key, Brain, BookOpen, MessageSquare, Lightbulb,
  Check, AlertCircle, ExternalLink, Loader2, Eye, Mic,
  Zap, Settings2, ChevronLeft, Sliders, Trash2, History,
  Info, ChevronDown, Copy, RotateCcw, Pencil
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { TheologicalProfileEditor } from './TheologicalProfileEditor';

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
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', description: 'MiniMax, Nemotron, Gemma, Qwen - gratuitito com CORS', popular: true },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', description: 'Velocidade instantanea - Llama e Mixtral', popular: false },
  { id: 'google', name: 'Google AI Studio (Gemini)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', description: 'Generoso - até 1M tokens gratuitamente', popular: true },
  { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://api-inference.huggingface.co', description: 'Milhares de modelos open source', popular: false },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', description: 'GPT-4o mini gratis - 3M tokens/mês', popular: true },
  { id: 'anthropic', name: 'Anthropic Claude', baseUrl: 'https://api.anthropic.com/v1', description: 'Claude 3.5 Haiku gratis - 1M tokens/mês', popular: true },
  { id: 'opencode', name: 'OpenCode.ai', baseUrl: 'https://opencode.ai/api/v1', description: 'MiniMax M2.5 gratis - recomendado', popular: true },
];

const OPENCODE_MODELS = [
  { id: 'minimax-m2.5-free', name: 'MiniMax M2.5', provider: 'opencode', context: '197K', badge: 'Recomendado', speed: 'Rapido' },
];

const PROVIDER_LOGOS: Record<string, { bg: string; text: string }> = {
  openrouter: { bg: '#f97316', text: 'OR' },
  groq: { bg: '#8b5cf6', text: 'G' },
  google: { bg: '#4285f4', text: 'G' },
  huggingface: { bg: '#ffc107', text: 'HF' },
  opencode: { bg: '#10b981', text: 'OC' },
  openai: { bg: '#10a37f', text: 'OAI' },
  anthropic: { bg: '#d97757', text: 'AN' },
};

const FREE_MODELS = [
  { id: 'minimax/minimax-m2.5:free', name: 'MiniMax M2.5', provider: 'openrouter', context: '197K', badge: 'Free', speed: 'Muito Rápido' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rápido' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B', provider: 'openrouter', context: '256K', badge: 'Free', speed: 'Rápido' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rápido' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rápido' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rápido' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', provider: 'openrouter', context: '262K', badge: 'Free', speed: 'Rápido' },
  { id: 'openrouter/free', name: 'OpenRouter Auto', provider: 'openrouter', context: '200K', badge: 'Free', speed: 'Variável' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', context: '1M', badge: 'Recomendado', speed: 'Rápido' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'google', context: '1M', badge: 'Novo', speed: 'Muito Rápido' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google', context: '1M', badge: 'Econômico', speed: 'Muito Rápido' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', context: '1M', badge: null, speed: 'Avançado' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', context: '128K', badge: 'Free', speed: 'Instantâneo' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', context: '128K', badge: 'Free', speed: 'Instantâneo' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', context: '32K', badge: 'Free', speed: 'Instantâneo' },
  { id: 'qwen-qwen2-72b-instruct', name: 'Qwen2 72B', provider: 'groq', context: '32K', badge: 'Free', speed: 'Instantâneo' },
  { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', provider: 'huggingface', context: '64K', badge: 'Free', speed: 'Rápido', tier: 'inference' },
  { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', provider: 'huggingface', context: '128K', badge: 'Free', speed: 'Rápido', tier: 'inference' },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', provider: 'huggingface', context: '32K', badge: 'Free', speed: 'Rápido', tier: 'inference' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', provider: 'huggingface', context: '32K', badge: 'Free', speed: 'Rápido', tier: 'inference' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', context: '128K', badge: 'Grátis', speed: 'Rápido' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', context: '128K', badge: 'Pro', speed: 'Rápido' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', context: '128K', badge: 'Pro', speed: 'Médio' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', context: '200K', badge: 'Grátis', speed: 'Rápido' },
  { id: 'claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', context: '200K', badge: 'Pro', speed: 'Médio' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', context: '200K', badge: 'Pro', speed: 'Lento' },
];

export const AISettingsPage: React.FC = () => {
  const { settings, updateSettings, setActiveTab } = useAppContext();

  const [apiProvider, setApiProvider] = useState(() => {
    return localStorage.getItem('ai-api-provider') || 'openrouter';
  });

  const [openCodeKey, setOpenCodeKey] = useState(() => localStorage.getItem('opencode-api-key') || '');
  const [openRouterKey, setOpenRouterKey] = useState(() => localStorage.getItem('openrouter-api-key') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini-api-key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq-api-key') || '');
  const [huggingfaceKey, setHuggingfaceKey] = useState(() => localStorage.getItem('huggingface-api-key') || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('openai-api-key') || '');
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem('anthropic-api-key') || '');

  const [openCodeKeyInput, setOpenCodeKeyInput] = useState(openCodeKey);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(openRouterKey);
  const [groqKeyInput, setGroqKeyInput] = useState(groqKey);
  const [huggingfaceKeyInput, setHuggingfaceKeyInput] = useState(huggingfaceKey);
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiKey);
  const [openaiKeyInput, setOpenaiKeyInput] = useState(openaiKey);
  const [anthropicKeyInput, setAnthropicKeyInput] = useState(anthropicKey);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; context_length?: number; free?: boolean }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [googleDynamicModels, setGoogleDynamicModels] = useState<{ id: string; name: string; provider: string; context: string; badge: string | null; speed: string }[]>([]);

  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem('ai-temperature') || '0.7'));
  const [maxTokens, setMaxTokens] = useState(() => parseInt(localStorage.getItem('ai-max-tokens') || '2048', 10));
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('ai-system-prompt') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);

  const currentApiKey = apiProvider === 'opencode' ? openCodeKey 
    : apiProvider === 'openrouter' ? openRouterKey 
    : apiProvider === 'groq' ? groqKey 
    : apiProvider === 'huggingface' ? huggingfaceKey 
    : apiProvider === 'google' ? geminiKey
    : apiProvider === 'openai' ? openaiKey
    : apiProvider === 'anthropic' ? anthropicKey
    : geminiKey;

  const handleSaveApiKey = useCallback(() => {
    // Mapeamento de provider para nome correto da chave no localStorage
    const providerKeyMap: Record<string, { storageKey: string; inputKey: string; setter: (v: string) => void }> = {
      opencode: { storageKey: 'opencode-api-key', inputKey: openCodeKeyInput, setter: setOpenCodeKey },
      openrouter: { storageKey: 'openrouter-api-key', inputKey: openRouterKeyInput, setter: setOpenRouterKey },
      groq: { storageKey: 'groq-api-key', inputKey: groqKeyInput, setter: setGroqKey },
      huggingface: { storageKey: 'huggingface-api-key', inputKey: huggingfaceKeyInput, setter: setHuggingfaceKey },
      google: { storageKey: 'gemini-api-key', inputKey: geminiKeyInput, setter: setGeminiKey },
      openai: { storageKey: 'openai-api-key', inputKey: openaiKeyInput, setter: setOpenaiKey },
      anthropic: { storageKey: 'anthropic-api-key', inputKey: anthropicKeyInput, setter: setAnthropicKey },
    };

    const providerInfo = providerKeyMap[apiProvider];
    if (providerInfo && providerInfo.inputKey.trim()) {
      // Remover todos os espaços e quebras de linha da chave
      const cleanKey = providerInfo.inputKey.replace(/\s+/g, '');
      localStorage.setItem(providerInfo.storageKey, cleanKey);
      providerInfo.setter(cleanKey);
      console.log('[AISettingsPage] Chave salva para', apiProvider, '- Tamanho:', cleanKey.length);
    } else {
      // Limpar chave se vazia
      localStorage.removeItem(providerInfo.storageKey);
      providerInfo.setter('');
      console.log('[AISettingsPage] Chave removida para', apiProvider);
    }

    localStorage.setItem('ai-api-provider', apiProvider);
    if (selectedModel) localStorage.setItem('ai-model', selectedModel);
    localStorage.setItem('ai-temperature', temperature.toString());
    localStorage.setItem('ai-max-tokens', maxTokens.toString());
    if (systemPrompt) localStorage.setItem('ai-system-prompt', systemPrompt);

    setTestResult({ success: true, message: 'Configurações salvas com sucesso!' });
  }, [apiProvider, openCodeKeyInput, openRouterKeyInput, geminiKeyInput, groqKeyInput, huggingfaceKeyInput, openaiKeyInput, anthropicKeyInput, selectedModel, temperature, maxTokens, systemPrompt]);

  const handleTestConnection = useCallback(async () => {
    const key = apiProvider === 'opencode' ? openCodeKeyInput 
      : apiProvider === 'openrouter' ? openRouterKeyInput 
      : apiProvider === 'groq' ? groqKeyInput 
      : apiProvider === 'huggingface' ? huggingfaceKeyInput 
      : apiProvider === 'google' ? geminiKeyInput
      : apiProvider === 'openai' ? openaiKeyInput
      : apiProvider === 'anthropic' ? anthropicKeyInput
      : geminiKeyInput;

    if (!key) {
      setTestResult({ success: false, message: 'Insira uma chave de API primeiro.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      let response;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://biblia-codex.vercel.app',
        'X-Title': 'Biblia Codex'
      };

      if (apiProvider === 'openrouter') {
        headers['Authorization'] = `Bearer ${key}`;
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 10 })
        });
      } else if (apiProvider === 'opencode') {
        headers['Authorization'] = `Bearer ${key}`;
        response = await fetch('https://opencode.ai/api/v1/models', { headers });
      } else if (apiProvider === 'groq') {
        headers['Authorization'] = `Bearer ${key}`;
        response = await fetch('https://api.groq.com/openai/v1/models', { headers });
      } else if (apiProvider === 'google') {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      } else if (apiProvider === 'openai') {
        headers['Authorization'] = `Bearer ${key}`;
        response = await fetch('https://api.openai.com/v1/models', { headers });
      } else if (apiProvider === 'anthropic') {
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        response = await fetch('https://api.anthropic.com/v1/models', { headers });
      } else {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      }

      if (response.ok) {
        setTestResult({ success: true, message: 'Conexão estabelecida com sucesso!' });
      } else {
        const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
        setTestResult({ success: false, message: error.error?.message || 'Erro ao conectar com a API.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Erro de conexão. Verifique sua internet.' });
    } finally {
      setIsTesting(false);
    }
  }, [apiProvider, openCodeKey, openRouterKey, geminiKey, groqKey, huggingfaceKey, openaiKey, anthropicKey]);

  const loadAvailableModels = useCallback(async () => {
    const key = currentApiKey;
    if (!key) {
      setModelsError('Insira uma chave primeiro');
      return;
    }

    setIsLoadingModels(true);
    setModelsError(null);
    setAvailableModels([]);

    try {
      let modelsUrl = '';
      let data: { data?: Array<{ id: string; name?: string; context_length?: number; pricing?: { prompt?: string }; title?: string; inputTokenLimit?: number }>; models?: Array<{ name: string; title?: string; inputTokenLimit?: number }> };

      if (apiProvider === 'openrouter') {
        modelsUrl = `https://openrouter.ai/api/v1/models`;
      } else if (apiProvider === 'groq') {
        modelsUrl = `https://api.groq.com/openai/v1/models`;
      } else if (apiProvider === 'google') {
        modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      }

      const response = await fetch(modelsUrl, {
        headers: apiProvider === 'openrouter' 
          ? { 'Authorization': `Bearer ${key}`, 'HTTP-Referer': 'https://biblia-codex.vercel.app' }
          : apiProvider === 'groq'
          ? { 'Authorization': `Bearer ${key}` }
          : {}
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar modelos');
      }

      data = await response.json();

      let models: { id: string; name: string; context_length?: number; free?: boolean }[] = [];

      if (apiProvider === 'openrouter') {
        models = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          context_length: m.context_length,
          free: m.pricing?.prompt === '0'
        })).slice(0, 50);
      } else if (apiProvider === 'groq') {
        models = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          context_length: m.context_window_tokens,
          free: true
        }));
      } else if (apiProvider === 'google') {
        models = (data?.models || []).map((m: { name: string; title?: string; inputTokenLimit?: number }) => ({
          id: m.name.replace('models/', ''),
          name: m.title || m.name,
          context_length: m.inputTokenLimit
        }));
        setGoogleDynamicModels(
          (data?.models || []).map((m: { name: string; title?: string; inputTokenLimit?: number }) => {
            const id = m.name.replace('models/', '');
            const name = m.title || id;
            const context = m.inputTokenLimit ? `${Math.round(m.inputTokenLimit / 1000)}K` : '1M';
            const isFlash = id.toLowerCase().includes('flash');
            const isPro = id.toLowerCase().includes('pro') || id.toLowerCase().includes('ultra');
            const badge = isFlash ? (id.includes('2.0') ? 'Recomendado' : 'Novo') : isPro ? 'Avançado' : null;
            return { id, name, provider: 'google', context, badge, speed: isFlash ? 'Rápido' : 'Médio' };
          })
        );
      }

      setAvailableModels(models);
      if (models.length > 0) {
        setSelectedModel(models[0].id);
      }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar modelos';
        setModelsError(errorMessage);
        if (apiProvider === 'google') {
          setGoogleDynamicModels([]);
        }
      }
  }, [currentApiKey, apiProvider]);

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
        <button onClick={() => setActiveTab('settings')} className="flex items-center gap-2 text-bible-accent mb-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar para Configurações</span>
        </button>
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
                  <div className="text-xs text-bible-text-muted mt-0.5">{provider.description}</div>
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
                  <p>4. Cole aqui e clique em "Carregar Modelos"</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadAvailableModels}
                disabled={!openRouterKeyInput.trim() || isLoadingModels}
                className={cn("w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                  !openRouterKeyInput.trim() 
                    ? "bg-bible-surface border border-bible-border text-bible-text-muted cursor-not-allowed"
                    : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)]"
                )}
              >
                {isLoadingModels ? 'Carregando modelos...' : 'Carregar Modelos Disponíveis'}
              </motion.button>

              {modelsError && (
                <div className="p-3 rounded-xl bg-red-100 text-red-700 text-xs">
                  {modelsError}
                </div>
              )}

              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-bible-text">Selecione o Modelo:</div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text focus:outline-none focus:ring-2 focus:ring-bible-accent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.free ? '(Gratuito)' : ''} {model.context_length ? `(${model.context_length?.toLocaleString()} tokens)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadAvailableModels}
                disabled={!geminiKeyInput.trim() || isLoadingModels}
                className={cn("w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                  !geminiKeyInput.trim() 
                    ? "bg-bible-surface border border-bible-border text-bible-text-muted cursor-not-allowed"
                    : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)]"
                )}
              >
                {isLoadingModels ? 'Carregando modelos...' : 'Carregar Modelos Disponíveis'}
              </motion.button>

              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-bible-text">Selecione o Modelo:</div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text focus:outline-none focus:ring-2 focus:ring-bible-accent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.context_length ? `(${model.context_length?.toLocaleString()} tokens)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {apiProvider === 'opencode' && (
            <div className="space-y-3">
              <input
                type="password"
                value={openCodeKeyInput}
                onChange={(e) => setOpenCodeKeyInput(e.target.value)}
                placeholder="Cole sua chave de API OpenCode.ai aqui..."
                className={cn("w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent")}
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://opencode.ai/workspace" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">OpenCode.ai</a></p>
            </div>
          )}

          {apiProvider === 'groq' && (
            <div className="space-y-3">
              <input
                type="password"
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                placeholder="Cole sua chave de API Groq aqui..."
                className={cn("w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent")}
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">Groq Console</a></p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadAvailableModels}
                disabled={!groqKeyInput.trim() || isLoadingModels}
                className={cn("w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all",
                  !groqKeyInput.trim() 
                    ? "bg-bible-surface border border-bible-border text-bible-text-muted cursor-not-allowed"
                    : "bg-[var(--accent-bible)] text-white hover:bg-[var(--accent-bible-strong)]"
                )}
              >
                {isLoadingModels ? 'Carregando modelos...' : 'Carregar Modelos Disponíveis'}
              </motion.button>

              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-bible-text">Selecione o Modelo:</div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text focus:outline-none focus:ring-2 focus:ring-bible-accent"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.free ? '(Gratuito)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {apiProvider === 'huggingface' && (
            <div className="space-y-3">
              <input
                type="password"
                value={huggingfaceKeyInput}
                onChange={(e) => setHuggingfaceKeyInput(e.target.value)}
                placeholder="Cole sua chave de API Hugging Face aqui..."
                aria-label="Chave API Hugging Face"
                className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent focus:ring-offset-2"
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">Hugging Face</a></p>
            </div>
          )}

          {apiProvider === 'openai' && (
            <div className="space-y-3">
              <input
                type="password"
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                placeholder="sk-..."
                aria-label="Chave API OpenAI"
                className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent focus:ring-offset-2"
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">OpenAI Platform</a> (3M tokens/mês grátis)</p>
            </div>
          )}

          {apiProvider === 'anthropic' && (
            <div className="space-y-3">
              <input
                type="password"
                value={anthropicKeyInput}
                onChange={(e) => setAnthropicKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                aria-label="Chave API Anthropic"
                className="w-full px-4 py-3 min-h-[44px] rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent focus:ring-offset-2"
              />
              <p className="text-xs text-bible-text-muted">Obtenha uma chave gratuita em <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-bible-accent hover:underline">Anthropic Console</a> (1M tokens/mês grátis)</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveApiKey}
              aria-label="Salvar configurações de API"
              className={cn("px-4 py-3 min-h-[44px] rounded-xl font-bold text-sm bg-bible-accent text-white hover:bg-bible-accent-strong transition-colors", 
                (apiProvider === 'opencode' && !openCodeKeyInput.trim()) ||
                (apiProvider === 'openrouter' && !openRouterKeyInput.trim()) ||
                (apiProvider === 'groq' && !groqKeyInput.trim()) ||
                (apiProvider === 'huggingface' && !huggingfaceKeyInput.trim()) ||
                (apiProvider === 'google' && !geminiKeyInput.trim()) ||
                (apiProvider === 'openai' && !openaiKeyInput.trim()) ||
                (apiProvider === 'anthropic' && !anthropicKeyInput.trim())
                ? "opacity-50 cursor-not-allowed" : ""
              )}
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
            <div className="space-y-3">
              {(googleDynamicModels.length > 0 ? googleDynamicModels : FREE_MODELS.filter(m => m.provider === 'google')).length === 0 && (
                <p className="text-xs text-bible-text-muted">Clique em "Carregar Modelos Disponíveis" para buscar modelos da API.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(googleDynamicModels.length > 0 ? googleDynamicModels : FREE_MODELS.filter(m => m.provider === 'google')).map((model) => (
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
              {googleDynamicModels.length > 0 && (
                <p className="text-xs text-bible-text-muted">{googleDynamicModels.length} modelos carregados da API</p>
              )}
            </div>
          )}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="premium-card p-5">
          <SectionHeader icon={BookOpen} title="Perfil Teologico" description="Defina a perspectiva teologica para respostas da IA" />
          <TheologicalProfileEditor
            currentProfileId={settings.ai.theologicalProfile || 'assembleiano'}
            onSelect={(id) => updateSettings({ ai: { ...settings.ai, theologicalProfile: id } })}
          />
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

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="premium-card p-5">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between"
            aria-expanded={showAdvanced}
          >
            <SectionHeader icon={Sliders} title="Configurações Avançadas" description="Personalize o comportamento do modelo" />
            <ChevronDown className={cn("w-5 h-5 text-bible-text-muted transition-transform", showAdvanced && "rotate-180")} />
          </button>

          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="temperature" className="text-sm font-semibold text-bible-text">Temperatura</label>
                  <span className="text-xs text-bible-text-muted bg-bible-surface px-2 py-1 rounded">{temperature}</span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-bible-border rounded-lg appearance-none cursor-pointer accent-bible-accent"
                  aria-label="Temperatura da resposta"
                />
                <div className="flex justify-between text-xs text-bible-text-muted mt-1">
                  <span>Preciso (0)</span>
                  <span>Criativo (1)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="maxTokens" className="text-sm font-semibold text-bible-text">Máximo de Tokens</label>
                  <span className="text-xs text-bible-text-muted bg-bible-surface px-2 py-1 rounded">{maxTokens}</span>
                </div>
                <input
                  id="maxTokens"
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-bible-border rounded-lg appearance-none cursor-pointer accent-bible-accent"
                  aria-label="Máximo de tokens"
                />
                <div className="flex justify-between text-xs text-bible-text-muted mt-1">
                  <span>256</span>
                  <span>8192</span>
                </div>
              </div>

              <div>
                <label htmlFor="systemPrompt" className="text-sm font-semibold text-bible-text block mb-2">
                  Prompt do Sistema
                  <span className="text-xs font-normal text-bible-text-muted ml-2">(opcional)</span>
                </label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Você é um assistente de estudo bíblico..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text placeholder:text-bible-text-muted focus:outline-none focus:ring-2 focus:ring-bible-accent resize-none"
                  aria-label="Prompt do sistema"
                />
                <p className="text-xs text-bible-text-muted mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Defines como o assistente deve se comportar
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTemperature(0.7); setMaxTokens(2048); setSystemPrompt(''); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bible-surface border border-bible-border text-sm text-bible-text hover:bg-bible-surface-strong"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Padrões
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.section>

        {isLoadingModels && (
          <div className="premium-card p-5 space-y-3">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-bible-border rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-bible-border rounded w-3/4" />
                <div className="h-3 bg-bible-border rounded w-1/2" />
              </div>
            </div>
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-bible-border rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-bible-border rounded w-2/3" />
                <div className="h-3 bg-bible-border rounded w-1/3" />
              </div>
            </div>
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-bible-border rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-bible-border rounded w-4/5" />
                <div className="h-3 bg-bible-border rounded w-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};