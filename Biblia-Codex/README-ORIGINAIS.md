# 📚 Arquivos Originais do GitHub - Bíblia Codex

Esta pasta contém **todos os arquivos originais** baixados do repositório [Biblia-Codex no GitHub](https://github.com/welitonevoc/Biblia-Codex).

## 🗂️ Estrutura

### `src/` - Código Fonte React (App Principal)
Código completo do aplicativo React da Bíblia:
- **`App.tsx`** - Componente principal
- **`AppContext.tsx`** - Contexto global
- **`BibleService.ts`** - Serviço bíblico principal
- **`StorageService.ts`** - Serviço de armazenamento
- **`components/`** - 34 componentes React (Reader, AudioPlayer, Navigation, etc.)
- **`services/`** - 15 serviços (audioService, geminiService, etc.)
- **`hooks/`** - Hooks customizados
- **`data/`** - Metadata bíblica
- **`theme/`** - Configuração de temas
- **`types.ts`** - Tipos TypeScript
- **`firebase.ts`** - Configuração Firebase
- **`index.css`** - Estilos globais
- **`main.tsx`** - Ponto de entrada

### `public/` - Dados e Recursos Bíblicos
Arquivos estáticos e dados bíblicos:
- **`*.bbl.mybible`** - Módulos de texto bíblico (ARA, ARC, etc.)
- **`*.dct.mybible`** - Módulos de dicionário (Strong)
- **`*.mybible`** - Dados de mapas, pessoas, etc.
- **`sql-wasm.wasm`** - SQL.js WebAssembly
- **`cross-references.zip`** - Referências cruzadas
- **`bloco-de-notas.html`** - Bloco de notas
- **`verbum-tags.html`** - Tags Verbum

### `scripts/` - Scripts e Utilitários
Scripts para verificação, configuração e exemplos de API:

**Verificação de Dados:**
- **`check_abbrev.cjs`** - Verificar abreviações
- **`check_db.cjs`** - Verificar banco de dados
- **`check_mapgeo.cjs`** - Verificar dados geográficos de mapas
- **`check_places.cjs`** / **`check_places2.cjs`** - Verificar dados de lugares

**Configuração Ollama (IA Local):**
- **`configurar-ollama.ps1`** - Script de configuração do Ollama
- **`ollama_api_curl.bat`** - Exemplo de chamada API com cURL
- **`ollama_api_example.js`** - Exemplo em JavaScript
- **`ollama_api_example.py`** - Exemplo em Python
- **`trocar_modelo.ps1`** - Trocar modelo do Ollama

**Servidor e Ambiente:**
- **`server.ts`** - Servidor TypeScript
- **`test-env.ts`** - Teste de ambiente
- **`start-local.ps1`** - Iniciar servidor local
- **`remover-vars-ambiente.ps1`** - Remover variáveis de ambiente

### `docs/` - Documentação Completa
Documentação técnica e guias:

**READMEs Principais:**
- **`README.md`** - Documentação principal do projeto
- **`README-CORRECAO.md`** - Documentação de correções

**Configuração de IA (Ollama):**
- **`CONFIGURACAO-OLLAMA.md`** - Guia de configuração do Ollama
- **`API_OLLAMA_REFERENCIA.md`** - Referência da API Ollama
- **`ALTERNATIVAS_CLAUDE.md`** - Alternativas ao Claude

**Áudio:**
- **`AUDIO-EXAMPLE.md`** - Exemplo de uso de áudio
- **`AUDIO-FEATURE.md`** - Funcionalidade de áudio

**Android/Build:**
- **`GERAR-APK.md`** - Guia para gerar APK
- **`BUILD-ANDROID-STATUS.md`** - Status do build Android
- **`VERIFICAR-ANDROID.md`** - Verificação do Android

**Permissões:**
- **`PERMISSOES-ARMAZENAMENTO.md`** - Permissões de armazenamento
- **`PERMISSIONS-SERVICE-STATUS.md`** - Status do serviço de permissões
- **`PLANO-PERMISSOES-ONBOARDING-RESUMO.md`** - Resumo do plano de permissões
- **`CORRECAO-PERMISSOES-RESUMO.md`** - Resumo de correções de permissões

**Status e Testes:**
- **`IMPLEMENTACAO-CONCLUIDA.md`** - Implementações concluídas
- **`TESTAR-AGORA.md`** - Instruções de teste
- **`TESTE-IMPORTACAO-MODULOS.md`** - Teste de importação de módulos
- **`CORRECAO-VARIAVEIS-AMBIENTE.md`** - Correção de variáveis de ambiente
- **`status.txt`** / **`status2.txt`** - Arquivos de status
- **`ollamaps.txt`** - Informações sobre Ollama e mapas

### `firebase/` - Configuração Firebase
Configurações e regras do Firebase/Firestore:
- **`firebase-applet-config.json`** - Configuração do applet Firebase
- **`firebase-blueprint.json`** - Blueprint/estrutura do Firebase
- **`firestore.rules`** - Regras de segurança do Firestore

### `package.json` - Dependências do Projeto
Arquivo original de dependências e scripts npm do repositório GitHub.

---

## ⚠️ Importante

Estes arquivos são **referências originais** do repositório GitHub. Use-os para:
- ✅ Comparar com sua versão local
- ✅ Recuperar configurações que possam estar faltando
- ✅ Consultar documentação técnica
- ✅ Ver exemplos de uso da API Ollama

**NÃO edite estes arquivos diretamente.** Se precisar fazer alterações, copie os arquivos para a raiz do projeto ou para as pastas apropriadas do seu app.

---

## 📊 Estatísticas

- **Total de arquivos:** 100+ (incluindo src/ e public/)
- **Código fonte:** 50+ arquivos em src/
- **Dados bíblicos:** 15+ arquivos em public/
- **Configurações:** 7 arquivos em config/
- **Scripts:** 14 arquivos em scripts/
- **Documentação:** 21 arquivos em docs/
- **Firebase:** 3 arquivos em firebase/
- **Dependências:** 1 arquivo (package.json)
