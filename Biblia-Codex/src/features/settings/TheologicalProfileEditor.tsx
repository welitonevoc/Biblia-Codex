import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Check, Plus, Pencil, Trash2, X, AlertCircle,
  ChevronLeft, Save, RotateCcw
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TheologicalProfileDef {
  id: string;
  name: string;
  description: string;
  authors: string[];
  systemPrompt: string;
  isBuiltIn: boolean;
}

const PROFILES_KEY = 'codex-theological-profiles';

const DEFAULT_PROFILES: TheologicalProfileDef[] = [
  {
    id: 'assembleiano',
    name: 'Assembleiano Clássico',
    description: 'Pentecostalismo Histórico CPAD',
    authors: ['Antonio Gilberto', 'Eurico Bergstén', 'Elienai Cabral', 'Severino Pedro da Silva', 'Claudionor de Andrade'],
    systemPrompt: `DIRETRIZES DE PERFIL: Assembleiano Clássico (Pentecostalismo Histórico/CPAD).

AUTORES DE REFERÊNCIA (USE COMO BASE):
- Clássicos: Antonio Gilberto, Eurico Bergstén, Severino Pedro da Silva, Claudionor de Andrade, Lawrence Olson, Emílio Conde, Orlando Boyer.
- Atuais: Elienai Cabral, Esequias Soares, Elinaldo Renovato, José Gonçalves, Douglas Baptista, Silas Daniel, Esdras Bentho.
- Liderança/Educação: José Wellington Bezerra da Costa, Ciro Zibordi, Marcos Tuler, Paulo Romeiro.

DIRETRIZES DE RESPOSTA:
1. Baseie-se no pentecostalismo clássico das Assembleias de Deus (Declaração de Fé da CGADB).
2. Use preferencialmente a Bíblia Almeida Corrigida Fiel (ARC).
3. Cite ou faça alusão ao pensamento dos autores acima para validar os argumentos teológicos.
4. Mantenha um tom pastoral, tecnicamente profundo e focado na edificação.
5. Defenda as doutrinas distintivas: Batismo no Espírito Santo como evidência inicial (falar em línguas), dons espirituais para a atualidade e a iminente volta de Cristo (Pré-milenarismo Dispensacionalista).
6. Responda em Português do Brasil de forma organizada e usando Markdown.`,
    isBuiltIn: true,
  },
  {
    id: 'biblico-geral',
    name: 'Bíblico Geral',
    description: 'Perspectiva ecumênica equilibrada',
    authors: ['Variadas traduções e comentários'],
    systemPrompt: `DIRETRIZES DE PERFIL: Bíblico Geral (Perspectiva Ecumênica).

AUTORES DE REFERÊNCIA:
- Comentários: Matthew Henry, William Barclay, Warren Wiersbe, Gordon Fee.
- Teólogos: C.S. Lewis, N.T. Wright, Craig Keener, F.F. Bruce.
- Diversidade confessional: representantes reformados, católicos, luteranos, metodistas e batistas.

DIRETRIZES DE RESPOSTA:
1. Busque um equilíbrio entre as principais tradições cristãs.
2. Incorpore perspectivas de várias traduções: NVI, NVT, ARA, ARC, BJ (Bíblia de Jerusalém).
3. Apresente diferentes interpretações quando houver divergência, sem favorecer uma tradição.
4. Mantenha um tom acadêmico acessível, respeitoso e inclusivo.
5. Evite linguagem sectária; promova unidade nos pontos centrais, liberdade nos secundários.
6. Responda em Português do Brasil usando Markdown.`,
    isBuiltIn: true,
  },
  {
    id: 'academico',
    name: 'Acadêmico',
    description: 'Análise crítica e histórica',
    authors: ['Dicionários e enciclopédias bíblicas'],
    systemPrompt: `DIRETRIZES DE PERFIL: Acadêmico (Análise Crítica e Histórica).

AUTORES DE REFERÊNCIA:
- Crítica textual: Bruce Metzger, Kurt Aland, Nestle-Aland.
- Arqueologia: William F. Albright, Roland de Vaux, Yigael Yadin.
- Exegese: Gordon Fee, Douglas Stuart, John Bright, Walter Brueggemann.
- Dicionários: Anchor Bible Dictionary, Dicionário Internacional de Teologia, ISBE.

DIRETRIZES DE RESPOSTA:
1. Priorize o método histórico-crítico e a análise exegética rigorosa.
2. Considere o contexto histórico, cultural, linguístico e literário dos textos.
3. Incorpore descobertas arqueológicas, análise de manuscritos e fontes extrabíblicas.
4. Apresente o estado atual da pesquisa acadêmica sobre o tema.
5. Mantenha tom acadêmico, objetivo e fundamentado em evidências.
6. Use o texto bíblico em hebraico/aramaico (AT) e grego (NT) quando relevante.
7. Distinga entre o que é consenso acadêmico e o que é hipótese/debate.
8. Responda em Português do Brasil usando Markdown.`,
    isBuiltIn: true,
  },
];

let savedDefaultProfiles = false;

function ensureDefaultProfilesSaved() {
  if (savedDefaultProfiles) return;
  try {
    const existing = localStorage.getItem(PROFILES_KEY);
    if (!existing) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
    }
    savedDefaultProfiles = true;
  } catch {}
}

export function loadProfiles(): TheologicalProfileDef[] {
  ensureDefaultProfilesSaved();
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [...DEFAULT_PROFILES];
    const parsed: TheologicalProfileDef[] = JSON.parse(raw);
    const merged = [...DEFAULT_PROFILES];
    for (const p of parsed) {
      const existing = merged.findIndex(d => d.id === p.id);
      if (existing >= 0) {
        if (!p.isBuiltIn) {
          merged[existing] = { ...p, isBuiltIn: true };
        } else {
          merged[existing] = p;
        }
      } else {
        merged.push({ ...p, isBuiltIn: p.isBuiltIn ?? false });
      }
    }
    return merged;
  } catch {
    return [...DEFAULT_PROFILES];
  }
}

export function saveProfiles(profiles: TheologicalProfileDef[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {}
}

export function getProfile(id: string): TheologicalProfileDef | undefined {
  return loadProfiles().find(p => p.id === id);
}

function generateId(): string {
  return 'profile_' + Math.random().toString(36).substring(2, 10);
}

interface TheologicalProfileEditorProps {
  currentProfileId: string;
  onSelect: (id: string) => void;
}

export const TheologicalProfileEditor: React.FC<TheologicalProfileEditorProps> = ({
  currentProfileId,
  onSelect,
}) => {
  const [profiles, setProfiles] = useState<TheologicalProfileDef[]>([]);
  const [editingProfile, setEditingProfile] = useState<TheologicalProfileDef | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  const refresh = useCallback(() => {
    setProfiles(loadProfiles());
  }, []);

  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  const openEditor = useCallback((profile: TheologicalProfileDef) => {
    setEditingProfile({ ...profile });
    setIsCreating(false);
    setShowEditor(true);
  }, []);

  const openNewProfile = useCallback(() => {
    setEditingProfile({
      id: generateId(),
      name: '',
      description: '',
      authors: [],
      systemPrompt: `DIRETRIZES DE PERFIL: [Nome do Perfil]

AUTORES DE REFERÊNCIA:
- [Autor 1], [Autor 2], [Autor 3]

DIRETRIZES DE RESPOSTA:
1. [Diretriz 1]
2. [Diretriz 2]
3. [Diretriz 3]
4. Responda em Português do Brasil usando Markdown.`,
      isBuiltIn: false,
    });
    setIsCreating(true);
    setShowEditor(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingProfile) return;
    const list = [...profiles];
    if (isCreating) {
      list.push(editingProfile);
    } else {
      const idx = list.findIndex(p => p.id === editingProfile.id);
      if (idx >= 0) list[idx] = editingProfile;
    }
    saveProfiles(list);
    setProfiles(list);
    setShowEditor(false);
    setEditingProfile(null);
  }, [editingProfile, isCreating, profiles]);

  const handleDelete = useCallback((id: string) => {
    const list = profiles.filter(p => p.id !== id);
    saveProfiles(list);
    setProfiles(list);
    setDeleteConfirm(null);
    if (currentProfileId === id) {
      onSelect('assembleiano');
    }
  }, [profiles, currentProfileId, onSelect]);

  const handleReset = useCallback(() => {
    localStorage.removeItem(PROFILES_KEY);
    savedDefaultProfiles = false;
    refresh();
  }, [refresh]);

  const activeProfile = profiles.find(p => p.id === currentProfileId);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={openNewProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-bible-accent bg-bible-accent/10 rounded-xl hover:bg-bible-accent/20 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Perfil
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-bible-text-muted bg-bible-text/5 rounded-xl hover:bg-bible-text/10 transition-colors cursor-pointer"
          title="Restaurar perfis padrão"
        >
          <RotateCcw className="w-3 h-3" />
          Restaurar
        </button>
      </div>

      <div className="space-y-2">
        {profiles.map((profile) => {
          const isActive = currentProfileId === profile.id;
          const showDeleteConfirm = deleteConfirm === profile.id;
          return (
            <motion.div
              key={profile.id}
              layout
              className={cn(
                "group relative w-full rounded-xl border-2 text-left transition-all overflow-hidden",
                isActive
                  ? "border-bible-accent bg-bible-accent/5"
                  : "border-bible-border/40 bg-bible-surface hover:border-bible-accent/40"
              )}
            >
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => handleSelect(profile.id)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-bible-text truncate">{profile.name}</span>
                      {profile.isBuiltIn && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-bible-text/5 text-bible-text-muted shrink-0">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-bible-text-muted mt-0.5 line-clamp-1">{profile.description}</div>
                    <div className="text-[10px] text-bible-accent/70 mt-1 line-clamp-1">{profile.authors.join(', ')}</div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-bible-accent flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <button
                      onClick={() => openEditor(profile)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bible-accent/10 transition-all cursor-pointer"
                      title="Editar perfil"
                    >
                      <Pencil className="w-3.5 h-3.5 text-bible-text-muted" />
                    </button>
                    {!profile.isBuiltIn && (
                      <button
                        onClick={() => setDeleteConfirm(showDeleteConfirm ? null : profile.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Excluir perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-2 border-t border-red-500/20 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-[11px] text-red-400 flex-1">Excluir este perfil?</span>
                        <button
                          onClick={() => handleDelete(profile.id)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-bible-text/10 text-bible-text rounded-lg hover:bg-bible-text/20 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {profiles.length === 0 && (
          <div className="text-center py-8 text-bible-text-muted">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Nenhum perfil teológico encontrado.</p>
            <button onClick={handleReset} className="mt-2 text-xs text-bible-accent underline cursor-pointer">
              Restaurar padrões
            </button>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && editingProfile && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditor(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--bg-bible)] border border-[var(--border-bible)] rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-bible-border/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <BookOpen className="w-4 h-4 text-bible-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-bible-text">
                      {isCreating ? 'Criar Perfil Teológico' : 'Editar Perfil Teológico'}
                    </h2>
                    <p className="text-[10px] text-bible-text-muted">
                      {isCreating ? 'Defina um novo perfil teológico' : `Editando: ${editingProfile.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditor(false)}
                  className="w-8 h-8 rounded-full hover:bg-bible-text/10 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-bible-text" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1.5 block">
                    Nome do Perfil
                  </label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    placeholder="Ex: Luterano Confessional"
                    className="w-full px-3 py-2 bg-bible-surface border border-bible-border rounded-xl text-sm text-bible-text outline-none focus:ring-2 focus:ring-bible-accent/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1.5 block">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingProfile.description}
                    onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                    placeholder="Ex: Perspectiva luterana clássica"
                    className="w-full px-3 py-2 bg-bible-surface border border-bible-border rounded-xl text-sm text-bible-text outline-none focus:ring-2 focus:ring-bible-accent/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1.5 block">
                    Autores de Referência
                  </label>
                  <input
                    type="text"
                    value={editingProfile.authors.join(', ')}
                    onChange={(e) => setEditingProfile({
                      ...editingProfile,
                      authors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Separados por vírgula: Martinho Lutero, Filipe Melâncton, ..."
                    className="w-full px-3 py-2 bg-bible-surface border border-bible-border rounded-xl text-sm text-bible-text outline-none focus:ring-2 focus:ring-bible-accent/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-bible-text-muted mb-1.5 block">
                    Prompt / Instrução do Sistema
                  </label>
                  <textarea
                    value={editingProfile.systemPrompt}
                    onChange={(e) => setEditingProfile({ ...editingProfile, systemPrompt: e.target.value })}
                    rows={14}
                    className="w-full px-3 py-2 bg-bible-surface border border-bible-border rounded-xl text-sm text-bible-text outline-none focus:ring-2 focus:ring-bible-accent/40 transition-all font-mono resize-y leading-relaxed"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-bible-border/10 shrink-0 bg-bible-surface/50">
                <div className="text-[10px] text-bible-text-muted">
                  {isCreating
                    ? 'O novo perfil será salvo como perfil personalizado.'
                    : 'Altere os campos e salve as alterações.'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 text-xs font-bold text-bible-text bg-bible-text/5 rounded-xl hover:bg-bible-text/10 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editingProfile.name.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-bible-accent rounded-xl hover:bg-bible-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
