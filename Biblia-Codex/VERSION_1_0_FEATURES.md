# Biblia Codex - Versão 1.0.0

## Descrição Completa das Funcionalidades

---

## 📖 LEITURA DA BÍBLIA

### Texto Bíblico
- **66 livros completos** (39 Antigo Testamento + 27 Novo Testamento)
- **Múltiplas traduções** em Português:
  - ACF 2007 SBB (Almeida Corrigida Fiel)
  - ARA_s (Almeida Revista e Atualizada com Strong's)
- **Navegação versículo por versículo** com exibição clara
- **Modo parágrafo** para leitura contínua
- **Números dos versículos** com toggle para mostrar/ocultar
- **Palavras de Jesus em vermelho** (red letter edition)
- **Títulos e cabeçalhos de capítulos**
- **Notas de rodapé** categorizadas (textual, histórica, geográfica, teológica, cronológica, aplicação)
- **Strong's Hebraico e Grego** inline com toggle
- **Tags morfológicas** para estudo gramatical
- **Modo interlinear** para estudo do idioma original
- **Transliteração** de palavras hebraicas/gregas
- **Notas do tradutor**

### Modos de Leitura
- **Modo Texto**: Leitura bíblica padrão
- **Modo Áudio**: Leitura por TTS (Text-to-Speech)
- **Modo Ambos**: Texto + áudio sincronizado com destaque do versículo atual

### Áudio e Text-to-Speech (TTS)
- **Leitura de capítulos completos** via Web Speech API
- **Avanço automático versículo por versículo** com destaque visual
- **Auto-scroll** para seguir o versículo sendo lido
- **Velocidade configurável** (0.5x a 2.0x)
- **Seleção de voz** (prioriza vozes PT-BR: Antonio, Francisca)
- **Controle de volume, tom e pitch**
- **Controles de Pause/Resume/Stop**
- **Pular para versículo específico** durante reprodução

---

## 🧭 NAVEGAÇÃO

### Floating Dock (Barra Flutuante)
- **8 itens principais**: Home, Bíblia, Busca, Notas, Enciclopédia, Dicionário, Comentário, Configurações
- **Layout adaptativo**: Mobile (4 itens), Tablet (6), Desktop (8)
- **Indicadores de scroll** (setas esquerda/direita)
- **Animações suaves** com Framer Motion

### Menu Bíblico
- **Seletor de versão**: Alternar entre traduções instaladas
- **Seletor de testamento**: Antigo / Novo Testamento
- **Seleção de livro**: Lista rolável dos 66 livros
- **Grade de capítulos**: Visualização em grid por livro
- **Pré-visualização de versículos**
- **Controles de tipografia inline** (tamanho, espaçamento, fonte)
- **Busca de livros** dentro do menu

### Book Jump Menu
- **Salto rápido** para qualquer livro/capítulo
- **Contexto inteligente** (mostra/esconde baseado no scroll)

### Menu Hamburger e Sidebar
- **Menu completo** para mobile
- **Sidebar desktop** com contexto de estudo
- **Múltiplos contextos**: geral, bíblia, busca, estudo

---

## 🎓 FERRAMENTAS DE ESTUDO

### Painel de Estudo com IA
- **Análise de versículos selecionados** com profundidade teológica
- **Estrutura de análise**: Exegese & Contexto, Conceitos Chave, Núcleo Doutrinário, Aplicação Prática, Referências Cruzadas
- **Perguntas personalizadas** sobre versículos
- **Renderização em Markdown** das respostas da IA
- **Copiar análise** para área de transferência

### Ferramentas por Versículo
- **Comentário**: Bottom sheet com comentários do versículo
- **Dicionário**: Definições de palavras/termos
- **Referências Cruzadas**: Versículos relacionados
- **Strong's**: Análise de palavras hebraicas/gregas
- **Notas de Rodapé**: Notas categorizadas
- **Lugares e Pessoas**: Busca geográfica e biográfica

### Sistema de Referências Cruzadas
- **Milhares de conexões** entre versículos
- **Busca direta e reversa**
- **Ranking por relevância**

### Dicionários Integrados
- **Enciclopédia Merrill** (C. Tenney)
- **Dicionário Vine** (Hebraico & Grego)
- **Quem é Quem na Bíblia** (biografias)
- **Dicionário local** com cache offline
- **Histórico de consultas**
- **Definições via IA** (fallback quando local indisponível)

### Enciclopédia
- **Múltiplas fontes**: Merrill, Vine Hebraico, Vine Grego, Quem é Quem
- **Filtro por categoria**
- **Busca full-text** (insensível a acentos)
- **Dados comprimidos** para carregamento rápido

---

## 🤖 INTELIGÊNCIA ARTIFICIAL

### Provedores Suportados
- **Google Gemini**: Gemini 2.0 Flash, Gemini 3 Flash, Gemini Pro
- **OpenRouter**: MiniMax, Nemotron, Gemma, Qwen (tier gratuito)
- **Groq**: Llama 3.3 70B, Llama 3.1 70B, Mixtral 8x7B, Qwen2 72B
- **Hugging Face**: DeepSeek R1, Llama 3.1 70B, Mistral 7B, Qwen2.5 72B

### Funções da IA
- **Explicação de termos bíblicos** com profundidade teológica
- **Comentário e exegese** de versículos
- **Definições de dicionário** (fallback)
- **Planos de leitura personalizados** via IA
- **Perfil teológico**: Perspectiva Assembleia de Deus (Assembleiano Clássico/CPAD)
- **Autores de referência**: Antonio Gilberto, Eurico Bergsten, Severino Pedro da Silva
- **Respostas em Português (Brasil)** por padrão

### Configuração da IA
- **Gerenciamento de API keys** por provedor (localStorage)
- **Auto-detecção** de chaves disponíveis
- **Auto-switch** em caso de erro de quota
- **Seleção de modelo** por provedor
- **Teste de configuração** da IA
- **Cache de respostas** no Firestore (por usuário)

---

## 🔖 MARCADORES E NOTAS

### Marcadores
- **Criar marcadores** para qualquer versículo
- **Rótulos personalizados** (nomes customizados)
- **Cores personalizadas** para organização visual
- **Tags** para categorização
- **Lista de marcadores** com navegação ao versículo
- **Editar e excluir** marcadores

### Notas
- **Editor de texto rico** para criação de notas
- **Títulos e conteúdo HTML**
- **Fixar notas** para acesso rápido
- **Tags** para categorização
- **Notas vinculadas** a referências bíblicas (livro, capítulo, versículo)
- **Tema por nota** (claro/escuro)
- **Configurações de fonte por nota**
- **Lista de notas** com busca

### Sistema de Tags
- **45+ tags pré-instaladas** (Graça, Fé, Oração, Justiça, Paz, etc.)
- **Criação de tags customizadas** com cores automáticas
- **Paleta de cores** com 8 cores base + geração HSL
- **Atribuição a marcadores e notas**
- **Visualização por tag**

---

## 📤 EXPORTAÇÃO E COMPARTILHAMENTO

### Cards de Versículo
- **Cards visuais** para redes sociais
- **6 temas**: Vibrant Sunset, WhatsApp Night, Obsidian Gold, Ethereal Blue, Minimal Noir, Divine Light
- **Fontes e layouts customizáveis**
- **Exportar como imagem** (html2canvas)
- **Copiar para área de transferência**
- **Compartilhar via Web Share API**
- **Múltiplas proporções**: telefone, quadrado, monitor

### Exportação de Notas
- **PDF** (via diálogo de impressão)
- **DOCX** (via biblioteca docx)
- **DOC** (formato RTF)
- **HTML** (arquivo standalone)
- **Google Docs** (via Google Docs API com formatação completa)

---

## 📅 PLANOS DE LEITURA

### Planos Pré-construídos
- **Bíblia em 365 dias**
- **Planos canônicos**: Livro por livro
- **Planos cronológicos**: Ordem histórica
- **Planos temáticos**: Por assunto
- **Planos devocionais**: Com conteúdo devocional diário

### Planos Gerados por IA
- **Planos personalizados** via IA
- **Descrição do usuário** para geração customizada
- **Duração configurável** (número de dias)
- **Mix de escritura + devocional**

### Acompanhamento de Progresso
- **Rastreamento de progresso** por plano
- **Dia atual** e **streak** (dias consecutivos)
- **Maior streak** registrado
- **Sistema de XP e níveis** (gamificação)
- **Livros completados**
- **Data de início e última leitura**

---

## 🙏 DEVOCIONAIS

### Biblioteca Devocional
- **Bom Dia** (Max Lucado - Volume 01) - 365 dias
- **GCPA** (Gratidão Cada Dia) - 365/366 dias
- **JPAV** (João Paulo Avante) - 365/366 dias
- **Words of Christ** (Palavras de Cristo) - Inglês
- **Spurgeon** (Charles Spurgeon Daily) - 365/366 dias

### Leitor Devocional
- **Navegação por dia** (seleciona dia atual automaticamente)
- **Seletor de módulo** devocional
- **Navegação dia anterior/próximo**
- **Links para referências bíblicas** no conteúdo
- **Renderização HTML** com sanitização
- **Módulos em SQLite** (carregados de ZIPs)

---

## 🏫 EBD (ESCOLA BÍBLICA DOMINICAL)

### Revista EBD
- **Carregamento trimestral** do servidor
- **Lista de lições** com tópicos, texto áureo, verdade prática
- **Leituras diárias** por lição
- **Leitura bíblica** por lição
- **Comentários** por lição
- **Introdução e conclusão** de cada lição
- **Renderização HTML** via iframe
- **Servidor Vercel** para revistas

---

## 🗺️ MAPAS BÍBLICOS

### Mapa Interativo
- **SVG interativo** da Terra Santa
- **Camadas históricas**: Êxodo, Reino, Ministério de Jesus, Viagens de Paulo
- **Lugares bíblicos** com coordenadas e descrições
- **Tipos de lugar**: cidade, região, montanha, rio, mar, deserto, templo
- **Detalhes do lugar**: referências bíblicas, era, significado, nome moderno
- **Jornadas bíblicas** com rotas
- **Integração com timeline** de eventos
- **Zoom in/out**
- **Toggle de camadas**
- **Busca de lugares**
- **Lugares favoritos** (estrela/coração)
- **Compartilhar lugares**
- **Navegar para passagem bíblica** do lugar

### Banco de Dados de Lugares
- **Carregado de mapgeodata.mybible**
- **Coordenadas** de todas as localizações bíblicas
- **Equivalências de nomes modernos**

---

## 📦 GERENCIAMENTO DE MÓDULOS

### Tipos de Módulos
- **Bíblias** (.bbl.mybible, .sqlite3)
- **Comentários** (.cmt)
- **Dicionários** (.dct.mybible)
- **Referências cruzadas** (.xref)
- **Livros** (.bok)
- **Mapas** (mapgeodata)
- **Pessoas** (peopledata)
- **Devocionais** (.devotions.zip)

### Formatos Suportados
- **MyBible** (SQLite-based)
- **MySword**
- **Sword** (.conf/.dat)
- **EPUB**

### Operações com Módulos
- **Escaneamento** de módulos instalados
- **Listagem** com detecção de categoria
- **Importação** de arquivo (com validação SQLite)
- **Exclusão** de módulos
- **Leitura binária** via Capacitor Filesystem
- **Diretórios de instalação**: Codex/modules/installed/{mybible,mysword,sword,epub}

---

## ⚙️ CONFIGURAÇÕES E PERSONALIZAÇÃO

### Aparência (9 Temas)
- **Branco Puro** (Pure Light)
- **Preto Puro / OLED** (Pure Dark)
- **Paper Sepia**
- **Royal Majesty**
- **Midnight Navy**
- **Ethereal Light**
- **Obsidian Gold**
- **Emerald Sanctum**
- **Crimson Vignette**

### Tipografia
- **Fonte**: Sans Serif, Serif, Monospace, Untitled Serif
- **Tamanho da fonte** ajustável
- **Altura da linha** ajustável
- **Espaçamento entre letras** ajustável
- **Margem horizontal** ajustável
- **Cor de destaque** customizável
- **Contraste** ajustável

### Estilos de UI (14 estilos)
Sharp, Soft, Pill, Minimal, Geometric, Premium, Circle, Soft-Square, Glass, Neon, Brutal, Elegant, Cyber, Vintage

### Estilos de Navegação (9 estilos)
Bottom, Floating, Asymmetric, Sidebar, Top, Hybrid, Compact, Dock, Minimal

### Animações
- **Estilo**: Suave, Elástica, Fade, Slide, Scale, Glow, Neon, Fluid
- **Intensidade**: Leve, Moderada, Intensa
- **Velocidade**: Lento, Normal, Rápido
- **Transições de página**: Fade, Slide, Flip, Cube, Cover, Zoom, None
- **Efeitos de iluminação**: Brilho, Glow, Shadow, Particles, Aurora, None
- **Toggles**: Glow, Particles, Navegação animada

### Configurações de Texto
- Modo parágrafo, números de versículos, palavras de Jesus em vermelho
- Títulos de capítulos, manchetes, notas de rodapé

### Ferramentas de Estudo
- Tags Strong's, links Strong's, tags morfológicas
- Modo interlinear, idiomas originais, notas do tradutor, transliteração
- Seleção de módulo de dicionário e comentário

### Recursos Visuais
- Destaques, marcadores, referências cruzadas
- Merge de referências adjacentes, gradiente de destaque

### Configurações TTS
- Habilitar/desabilitar, seleção de voz, velocidade, pitch, volume, idioma

---

## 👤 PERFIL E CONTA

### Autenticação Google
- **Google Sign-In** via Firebase Auth
- **Perfil do usuário**: Nome, email, foto
- **Handling de redirect** para fluxo OAuth
- **Gerenciamento de estado** de autenticação

### Página de Perfil
- **Avatar** do usuário
- **Nome de exibição**
- **Estatísticas**: Streak de leitura, progresso do plano, nível/XP

---

## ☁️ SYNC E FIREBASE

### Firestore Sync
- **Sincronização de configurações** (debounced, 2s delay)
- **Sync de tema** para nuvem
- **Sync em tempo real** via onSnapshot
- **Bidirecional**: Nuvem -> Local e Local -> Nuvem

### Data Sync Service
- **Sync de marcadores** (upload/download com merge)
- **Sync de notas** (upload/download com merge)
- **Resolução de conflitos** por timestamp (mais recente vence)
- **Escritas em batch** para eficiência
- **Push individual** para atualizações em tempo real
- **Status de sync** (idle, syncing, error)
- **Último timestamp** de sync

### Cache de Respostas IA
- **Cache por usuário** no Firestore
- **Busca no cache** antes de requisições IA
- **Save no cache** após respostas bem-sucedidas

---

## 🌐 INTERNACIONALIZAÇÃO

### Idiomas Suportados
- **Português (Brasil)** - Idioma principal (pt-BR)
- **Inglês** - Idioma secundário (en)
- **Fallback**: Português

### Arquivos de Localização
- **common.json**: Strings gerais da UI
- **reader.json**: Strings específicas do leitor
- **Traduções inline** em i18n/index.ts
- **Troca de idioma** em runtime

---

## 📱 PWA (PROGRESSIVE WEB APP)

### Recursos PWA
- **Web App Manifest** com nome, ícones, cor do tema
- **Service Worker** (sw.js):
  - Estratégia cache-first
  - Fallback offline
  - Suporte a push notifications
  - Handling de clique em notificações
- **Instalável** na home screen
- **Modo standalone**
- **Meta tag de cor do tema**
- **Mobile web app capable**
- **Suporte Apple mobile web**

### Capacidades Offline
- **Texto bíblico offline** (módulos SQLite bundled)
- **Cache de dicionário offline** (IndexedDB)
- **Conteúdo devocional offline** (ZIPs bundled)
- **Referências cruzadas offline** (arquivo bundled)
- **Enciclopédia offline** (dados comprimidos bundled)
- **Notas offline** (IndexedDB)
- **Marcadores offline** (IndexedDB)

---

## 📱 ANDROID NATIVO (Capacitor)

### Configuração Capacitor
- **App ID**: com.codex.biblia
- **HTTPS scheme** para Android WebView
- **Mixed content**: Disabled
- **Input capture**: Enabled
- **Keyboard handling**: Resize body, resize on fullscreen

### Plugins Nativos
- **@capacitor/filesystem**: Gerenciamento de arquivos de módulos
  - Suporte a Directory.Documents e Directory.Data
  - Leitura/escrita/exclusão de arquivos
  - Criação de diretórios
  - Acesso binário a módulos SQLite

### Permissões Android
- **Permissão de armazenamento** com compatibilidade Android 13+
- **Detecção de API level** (Android 6-12 vs Android 13+)
- **Preferência de diretório**: Interno (Data) para Android 13+, Externo (Documents) para versões anteriores

---

## 🏠 HOME PAGE

### Dashboard
- **Saudação personalizada** com nome do usuário
- **Streak de leitura** (ícone de chama)
- **Dia atual do plano** (ícone de calendário)
- **Versículo do Dia** com navegação à passagem
- **Progresso semanal** (visão de 7 dias)

### Ações Rápidas
- **Ler a Bíblia** - Navegar ao leitor
- **Devocional** - Abrir seção devocional
- **Planos de Leitura** - Abrir planos
- **Estudo com IA** - Abrir assistente IA

### Acesso Rápido a Ferramentas
- **Notas**, **Marcadores**, **Tags**, **Buscar**

### Seção Explorer
- **EBD** (Escola Bíblica Dominical)
- **Mapas Bíblicos**
- **Dicionários** (Hebraico & Grego)
- **Configurações**

### Continue Lendo
- **Últimos versículos lidos** com navegação rápida
- **Card "Continuar"** com botão de retomar

---

## 🔍 BUSCA

### Busca Bíblica
- **Busca full-text** no texto bíblico
- **Resultados** com contexto do versículo
- **Navegar ao resultado** diretamente

### Busca na Enciclopédia
- **Busca normalizada** (insensível a acentos)
- **Busca cross-source** (Merrill, Vine, Quem é Quem)

### Busca no Dicionário
- **Consulta de termos** em dicionários locais
- **Consulta via IA** quando local indisponível

### Busca em Notas e Notas de Rodapé
- **Buscar notas** por conteúdo
- **Buscar notas de rodapé** por conteúdo

---

## 🏗️ ARQUITETURA TÉCNICA

### Framework e Bibliotecas
- **React 19** com StrictMode
- **Vite 8** como build tool
- **TypeScript 6.0**
- **Tailwind CSS v4** com PostCSS transformer
- **Framer Motion (motion)** para animações
- **Zustand 5** para state management (4 stores)
- **i18next + react-i18next** para internacionalização
- **Lucide React** para ícones
- **sql.js** para SQLite no browser
- **IndexedDB** (idb) para armazenamento local
- **DOMPurify** para sanitização HTML
- **html2canvas** para export de imagem
- **docx** para export Word
- **file-saver** para downloads
- **React Markdown** para respostas IA
- **clsx + tailwind-merge** para classes condicionais

### State Management (Zustand)
- **readerStore**: Livro, capítulo, versículo, fonte, scroll
- **settingsStore**: Tema, contraste, gestos, idioma, display
- **notesStore**: Marcadores, notas, loading state
- **libraryStore**: Módulos instalados, módulo selecionado, localização

### Otimizações de Performance
- **React.memo** em componentes pesados
- **Lazy loading** com Suspense para todas as páginas
- **LRU cache** para queries bíblicas (100 entradas, 5 min TTL)
- **Cache de SQLite** para módulos abertos
- **Cache de referências cruzadas**
- **Cache de dicionário** (IndexedDB)
- **Cache de respostas IA** (Firestore)
- **Cloud sync debounced** (2s delay)
- **Seletores Zustand** para prevenir re-renders desnecessários
- **useMemo** para valores computados

---

## ♿ ACESSIBILIDADE

- **Skip to content** links
- **Labels ARIA** em elementos interativos
- **Focus-visible** ring styles
- **Navegação por teclado**
- **Screen reader** friendly (aria-live regions)
- **Modo alto contraste**
- **HTML semântico**

---

## 🎨 BIBLIOTECA DE COMPONENTES UI

### Componentes UI
- **Button** (com variantes)
- **Card**, **Input**, **Badge**, **Separator**
- **Dialog**, **Sheet** (slide-over panel)
- **Skeleton** (loading placeholder)
- **Spinner**, **Toast** (notificações)
- **Toggle Group**

### Componentes Comuns
- **ErrorBoundary** (React error boundary)
- **GlobalDrawer** (navigation drawer)
- **IconWrapper**
- **RichTextEditor** (para notas)
- **VerseCardGenerator** (criador de cards)

### Design System
- **CSS custom properties** para theming
- **Card styles premium** com hover effects
- **Glass morphism** effects
- **Gradient backgrounds**
- **Shadow system**
- **Premium kicker** badges

---

## 📊 RESUMO

| Categoria | Funcionalidades |
|-----------|----------------|
| Leitura Bíblica | 15+ features |
| Navegação | 10+ features |
| Ferramentas de Estudo | 15+ features |
| Inteligência Artificial | 10+ features |
| Marcadores e Notas | 12+ features |
| Exportação | 8+ features |
| Planos de Leitura | 10+ features |
| Devocionais | 8+ features |
| EBD | 7+ features |
| Mapas Bíblicos | 12+ features |
| Gerenciamento de Módulos | 10+ features |
| Configurações | 40+ opções |
| Perfil e Conta | 5+ features |
| Sync e Firebase | 8+ features |
| Internacionalização | 2 idiomas |
| PWA | 8+ features |
| Android Nativo | 8+ features |
| Home Page | 10+ features |
| Busca | 5+ tipos |
| Acessibilidade | 7+ features |

**Total de categorias**: 24
**Total de funcionalidades**: 200+

---

*Tecnologias: React 19, Vite 8, TypeScript 6, Tailwind CSS v4, Capacitor, Firebase, Zustand, i18next, sql.js*
