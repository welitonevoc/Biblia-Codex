/**
 * AIExplorationPanel.tsx - Painel principal de exploração com IA
 * Oferece acesso a todos os recursos de IA
 */

import React, { useState, useCallback } from 'react';
import { useAI, useAIAgents } from '../index';
import type { AgentType, TheologicalProfile } from '../index';

interface AIExplorationPanelProps {
  verseRef?: string;
  verseText?: string;
  onClose?: () => void;
}

type ActiveTab = 'explain' | 'agents' | 'study' | 'plan' | 'search';

export function AIExplorationPanel({ verseRef, verseText, onClose }: AIExplorationPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explain');
  const [theologicalProfile, setTheologicalProfile] = useState<TheologicalProfile>('assembleiano');
  
  const ai = useAI();
  const agents = useAIAgents();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          🤖 Assistente IA
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Perfil Teológico */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Perfil Teológico
        </label>
        <select
          value={theologicalProfile}
          onChange={(e) => setTheologicalProfile(e.target.value as TheologicalProfile)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="assembleiano">Assembleiano Clássico</option>
          <option value="reformado">Reformado</option>
          <option value="catolico">Católico Romano</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['explain', 'agents', 'study', 'plan', 'search'] as ActiveTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 p-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab === 'explain' && 'Explicar'}
            {tab === 'agents' && 'Agentes'}
            {tab === 'study' && 'Estudo'}
            {tab === 'plan' && 'Plano'}
            {tab === 'search' && 'Busca'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'explain' && (
          <ExplainTab verseRef={verseRef} verseText={verseText} profile={theologicalProfile} />
        )}
        {activeTab === 'agents' && (
          <AgentsTab profile={theologicalProfile} />
        )}
        {activeTab === 'study' && (
          <StudyTab profile={theologicalProfile} />
        )}
        {activeTab === 'plan' && (
          <PlanTab profile={theologicalProfile} />
        )}
        {activeTab === 'search' && (
          <SearchTab profile={theologicalProfile} />
        )}
      </div>

      {/* Status */}
      {ai.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{ai.error}</p>
        </div>
      )}
    </div>
  );
}

// ==================== TABS ====================

function ExplainTab({ verseRef, verseText, profile }: { verseRef?: string; verseText?: string; profile: TheologicalProfile }) {
  const [term, setTerm] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const ai = useAI();

  const handleExplain = useCallback(async () => {
    if (!term.trim()) return;
    const response = await ai.explainTerm(term, profile);
    if (response.success) {
      setExplanation(response.content || null);
    }
  }, [term, profile, ai]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Explicação de Termos</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Digite um termo bíblico..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            onClick={handleExplain}
            disabled={ai.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {ai.isLoading ? 'Explicando...' : 'Explicar'}
          </button>
        </div>
      </div>

      {verseRef && verseText && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">{verseRef}</p>
          <p className="mt-2 text-gray-900 dark:text-white">{verseText}</p>
        </div>
      )}

      {explanation && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: explanation }} />
        </div>
      )}
    </div>
  );
}

function AgentsTab({ profile }: { profile: TheologicalProfile }) {
  const [query, setQuery] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['theologian', 'historian']);
  const [response, setResponse] = useState<any>(null);
  const agents = useAIAgents();

  const handleQuery = useCallback(async () => {
    if (!query.trim()) return;
    const result = await agents.queryMultipleAgents(query, selectedAgents as any[], {});
    setResponse(result);
  }, [query, selectedAgents, agents]);

  const agentOptions = [
    { id: 'theologian', label: 'Teólogo' },
    { id: 'historian', label: 'Historiador' },
    { id: 'devotional', label: 'Devocional' },
    { id: 'apologist', label: 'Apologista' },
    { id: 'preacher', label: 'Pregador' },
    { id: 'counselor', label: 'Conselheiro' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Agentes IA Especializados</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Selecione os Agentes:</label>
        <div className="flex flex-wrap gap-2">
          {agentOptions.map(agent => (
            <label key={agent.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAgents([...selectedAgents, agent.id]);
                  } else {
                    setSelectedAgents(selectedAgents.filter(a => a !== agent.id));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{agent.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Faça uma pergunta aos agentes..."
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
        />
        <button
          onClick={handleQuery}
          disabled={agents.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {agents.isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>

      {response && (
        <div className="space-y-4">
          {response.responses?.map((r: any) => (
            <div key={r.agentType} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {agentOptions.find(a => a.id === r.agentType)?.label || r.agentType}
              </h4>
              <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: r.content }} />
            </div>
          ))}
          
          {response.synthesis && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">Síntese Unificada</h4>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: response.synthesis }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StudyTab({ profile }: { profile: TheologicalProfile }) {
  const [topic, setTopic] = useState('');
  const [studyResult, setStudyResult] = useState<any>(null);
  const agents = useAIAgents();

  const handleStudy = useCallback(async () => {
    if (!topic.trim()) return;
    const result = await agents.deepBibleStudy(topic);
    setStudyResult(result);
  }, [topic, agents]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Estudo Bíblico Profundo</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Gere um estudo completo com múltiplos agentes IA
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Graça, Salvação, Batismo no Espírito Santo..."
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          onKeyPress={(e) => e.key === 'Enter' && handleStudy()}
        />
        <button
          onClick={handleStudy}
          disabled={agents.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {agents.isLoading ? 'Gerando...' : 'Gerar Estudo'}
        </button>
      </div>

      {studyResult && (
        <div className="space-y-4">
          {studyResult.responses?.map((r: any) => (
            <div key={r.agentType} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {r.agentType}
              </h4>
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: r.content }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanTab({ profile }: { profile: TheologicalProfile }) {
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<number>(7);
  const [plan, setPlan] = useState<any>(null);
  const ai = useAI();

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;
    const response = await ai.generateReadingPlan(description, days);
    if (response.success && response.plan) {
      setPlan(response.plan);
    }
  }, [description, days, ai]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Gerador de Planos de Leitura</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Descrição do Plano:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Um plano de leitura focado em esperança durante tempos difíceis..."
          rows={3}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Duração (dias):</label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 7)}
          min={1}
          max={90}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={ai.isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {ai.isLoading ? 'Gerando...' : 'Gerar Plano'}
      </button>

      {plan && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-lg mb-2">{plan.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
          
          <div className="space-y-2">
            {plan.readings?.map((reading: any, idx: number) => (
              <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                    Dia {reading.day}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {reading.type === 'scripture' ? 'Bíblia' : 'Devocional'}
                  </span>
                </div>
                <p className="text-sm font-medium">{reading.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{reading.passages?.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchTab({ profile }: { profile: TheologicalProfile }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Busca Semântica (RAG)</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Busque versículos por significado, não apenas por palavras
      </p>
      <div className="p-8 text-center text-gray-500">
        Funcionalidade em desenvolvimento...
        <br />
        <span className="text-xs">Utiliza RAG (Retrieval-Augmented Generation)</span>
      </div>
    </div>
  );
}
