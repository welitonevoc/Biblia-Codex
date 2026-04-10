# Inventário Completo Do App

## Objetivo geral

O projeto `biblia-codex` é um aplicativo bíblico híbrido:

- frontend em React 19 + TypeScript + Vite;
- empacotamento mobile via Capacitor 7;
- camada Android nativa própria em `android/`;
- persistência local via IndexedDB no web layer;
- persistência local Android via Room;
- autenticação e sincronização via Firebase;
- recursos de IA com Gemini no web e no Android.

O app mistura três mundos ao mesmo tempo:

- UI web rica para leitura bíblica e estudo;
- leitura/importação de módulos bíblicos locais no dispositivo;
- recursos nativos Android para plugin Capacitor, cache Room e integração com serviços.

## Estrutura raiz

Arquivos e pastas relevantes da raiz:

- `src/`
  Camada principal do app web.
- `android/`
  Projeto Android nativo gerado pelo Capacitor e customizado manualmente.
- `public/`
  Arquivos públicos servidos no build web.
- `dist/`
  Build web gerado pelo Vite.
- `node_modules/`
  Dependências do projeto.
- `package.json`
  Scripts e dependências do app.
- `vite.config.ts`
  Configuração do Vite.
- `capacitor.config.ts`
  Configuração do Capacitor.
- `server.ts`
  Servidor Express usado em desenvolvimento/produção web.
- `tsconfig.json`
  Configuração TypeScript.
- `firestore.rules`
  Regras do Firestore.
- `firebase-blueprint.json`
  Esquema descritivo das entidades usadas no Firestore.
- `firebase-applet-config.json`
  Configuração do Firebase usada pelo frontend.
- `metadata.json`
  Metadados descritivos do app.
- `GERAR-APK.md`
  Guia operacional de build do APK.
- `.env.example`
  Exemplo da variável `GEMINI_API_KEY`.
- `.env.local`
  Arquivo local de ambiente.

## Stack e dependências

O `package.json` mostra:

- runtime:
  `react`, `react-dom`, `vite`, `motion`, `lucide-react`, `firebase`, `sql.js`, `idb`, `@google/genai`, `@capacitor/core`, `@capacitor/android`, `@capacitor/filesystem`.
- desenvolvimento:
  `typescript`, `tsx`, `@capacitor/cli`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`.

Scripts principais:

- `npm run dev`
  Sobe o servidor `server.ts`.
- `npm run build`
  Gera build Vite em `dist/`.
- `npm run cap:sync`
  Build web + sincronização com Android.
- `npm run cap:open`
  Abre o projeto Android.
- `npm run cap:run`
  Build web + sync + execução no Android.

## Camada web: `src/`

### Arquivos base

- `src/main.tsx`
  Ponto de entrada React. Renderiza `App`.
- `src/App.tsx`
  Orquestrador principal da UI.
  Controla:
  `currentBook`, `currentChapter`, `targetVerse`, `activeTab`, estados dos painéis, onboarding e ferramentas.
- `src/AppContext.tsx`
  Contexto global da aplicação.
  Centraliza:
  tema, configurações, autenticação Firebase, sincronização, módulos instalados, versão bíblica atual, dicionários disponíveis e estado do drawer.
- `src/types.ts`
  Tipos centrais:
  `Book`, `Verse`, `Bookmark`, `Note`, `CrossReference`, `DictionaryEntry`, `StudyModule`, `BibleModule`, `ThemeConfig`, `AppSettings`.
- `src/index.css`
  CSS global com:
  fontes, variáveis de tema, scrollbar customizada, classes MySword/MyBible, classes de interlinear, destaques e temas claro/sépia/escuro/preto.
- `src/BibleService.ts`
  Serviço de leitura e estudo bíblico.
  Faz:
  leitura de versos em SQLite com `sql.js`, lookup de dicionário local, comentário por IA, referências cruzadas por IA e fallback para texto simulado.
- `src/StorageService.ts`
  IndexedDB via `idb`.
  Stores:
  `bookmarks`, `notes`, `modules`, `dictionary_history`, `dictionary_cache`.
- `src/firebase.ts`
  Inicializa Firebase App/Auth/Firestore.
  Implementa:
  login Google com `signInWithPopup` no web e `signInWithRedirect` no ambiente Capacitor nativo.

### Dados

- `src/data/bibleMetadata.ts`
  Catálogo fixo dos 66 livros bíblicos.
  Cada item traz:
  `id`, `name`, `chapters`, `testament`, `numericId`.

### Serviços

- `src/services/moduleService.ts`
  Gerencia módulos externos no filesystem do dispositivo via Capacitor Filesystem.
  Base física:
  `Documents/Codex/modules/installed/{mybible|mysword|sword|epub}`.
  Implementa:
  detecção de categoria por nome de arquivo, detecção de formato, listagem, leitura binária, exclusão e importação.
- `src/services/moduleScanner.ts`
  Varre as subpastas de módulos e retorna `BibleModule[]`.
- `src/services/mySwordParser.ts`
  Parser de tags MySword/MyBible.
  Converte:
  itálico, sublinhado, falas de Jesus, Strong, morfologia, notas de tradutor, referências cruzadas, paragrafação, recuos e modo interlinear.
- `src/services/dictionaryService.ts`
  Camada intermediária entre dicionário local e IA.
  Define o módulo virtual `ai_assistant`.
- `src/services/geminiService.ts`
  Faz chamada HTTP direta à API Gemini usando chave fornecida.
  O prompt é orientado para viés assembleiano clássico.
- `src/services/aiStudyService.ts`
  Serviço alternativo de IA com cache em Firestore por usuário autenticado.
  Implementa:
  explicação de termos e versos com cache remoto.
- `src/services/BookNumberConverter.ts`
  Converte número padrão do livro bíblico para a numeração usada pelo formato MyBible/PalmBible+.

### Componentes principais

- `src/components/TopBar.tsx`
  Barra superior com:
  menu, identidade visual, seletor de livro/capítulo, seletor de versão e botões de busca/configurações.
- `src/components/Navigation.tsx`
  Modal para navegar por livros e capítulos.
- `src/components/Reader.tsx`
  Núcleo do leitor bíblico.
  Responsável por:
  carregar versos,
  aplicar parser MySword,
  controlar seleção de versos,
  abrir ferramentas de estudo,
  salvar marcações/tags,
  interceptar links `b`, `s` e `r`,
  exibir destaques e barra flutuante de ações.
- `src/components/GlobalDrawer.tsx`
  Drawer lateral global com atalhos, identidade do app e acessos rápidos.
- `src/components/Sidebar.tsx`
  Barra lateral de navegação expandível/retrátil.
- `src/components/HamburgerMenu.tsx`
  Menu lateral alternativo para mobile.
- `src/components/Home.tsx`
  Tela inicial estilo dashboard.
  Contém:
  streak, freezes, planos de leitura, histórico recente e versículo do dia.
- `src/components/Settings.tsx`
  Painel lateral de ajustes rápidos.
- `src/components/SettingsPage.tsx`
  Página completa de configurações.
  Embute:
  `VersionSelector` e `ModuleManagement`.
- `src/components/VersionSelector.tsx`
  Seleção da versão bíblica ativa.
- `src/components/ModuleManagement.tsx`
  Tela de módulos externos.
  Faz:
  listagem, busca, agrupamento por categoria, importação e exclusão.
- `src/components/Notes.tsx`
  Editor/lista de notas locais.
- `src/components/TagsView.tsx`
  Agrupa favoritos por tag temática.
- `src/components/DictionaryView.tsx`
  Tela de dicionário.
  Suporta:
  pesquisa, histórico, cache local e alternância entre dicionário local e IA.
- `src/components/DictionaryBottomSheet.tsx`
  Bottom sheet premium para definição de termos clicados no leitor.
- `src/components/StudyPanel.tsx`
  Painel lateral de análise teológica por IA para seleção de versos.
- `src/components/StudyToolsPanel.tsx`
  Painel lateral para comentário, dicionário e referências cruzadas por verso.
- `src/components/HelpPage.tsx`
  Tela de suporte e ajuda.
- `src/components/Onboarding.tsx`
  Fluxo de onboarding em 6 etapas.
- `src/components/ErrorBoundary.tsx`
  Boundary para falhas de renderização.

## Fluxos principais do frontend

### Leitura bíblica

Fluxo:

- `App.tsx` mantém livro/capítulo ativos.
- `Reader.tsx` solicita versos a `BibleService.getVerses`.
- `BibleService.ts` tenta abrir módulo SQLite com `sql.js`.
- `moduleService.readModuleBinary` lê o arquivo no filesystem do dispositivo.
- `MySwordParser.parseBibleText` converte tags do conteúdo.
- o HTML é injetado via `dangerouslySetInnerHTML`.

### Módulos externos

Fluxo:

- importação parte de `ModuleManagement.tsx` ou `Settings.tsx`;
- `moduleService.importModule` grava arquivo em `Documents/Codex/modules/installed/...`;
- `AppContext.refreshModules` junta o que veio de `scanForBibleModules()` com `listInstalledModules()`;
- `TopBar` e `VersionSelector` usam a lista para trocar a versão atual.

### Dicionário

Fluxo:

- `DictionaryView` chama `searchDictionary` do contexto;
- contexto delega para `dictionaryService.getEntries`;
- se o módulo ativo for virtual, vai para IA;
- se for local, usa `BibleService.getDictionaryEntry`;
- resultados e histórico são persistidos em `StorageService`.

### IA

A IA aparece em vários pontos:

- `BibleService.getCommentary`
  comentário teológico por verso.
- `BibleService.getCrossReferences`
  referências cruzadas em JSON.
- `StudyPanel`
  análise de blocos de versos.
- `dictionaryService` + `geminiService`
  explicação de termos.
- `aiStudyService`
  outra camada com cache em Firestore.

## Persistência e sincronização

Persistência local web:

- IndexedDB para notas, favoritos, histórico e cache de dicionário.

Persistência local Android:

- Room para cache de respostas de IA em `android/app/src/main/java/com.codex.biblia/data`.

Persistência em nuvem:

- Firestore para perfil/configurações do usuário;
- subcoleção `aiCache` para cache remoto na estratégia do `aiStudyService`.

## Arquivos públicos e assets

### `public/`

- `public/sql-wasm.wasm`
  binário do `sql.js` usado para abrir bancos SQLite no app web.
- `public/Strong AMG Bíblia Palavra-Chave.dct.mybible`
  dicionário MyBible local.
- `public/Strong KJ Concordância.dct.mybible`
  dicionário MyBible local.

Esses dois dicionários têm tamanho alto e fazem parte da experiência offline/local.

### `dist/`

`dist/` é build gerado do frontend Vite.

Arquivos observados:

- `dist/index.html`
- `dist/assets/index-*.js`
- `dist/assets/index-*.css`

## Configuração de build web

- `vite.config.ts`
  usa plugin React e Tailwind.
  Define:
  `process.env.GEMINI_API_KEY`, alias `@`, `base: './'`, saída em `dist`.
- `index.html`
  shell HTML que carrega `/src/main.tsx`.
- `tsconfig.json`
  TS em modo bundler, `jsx: react-jsx`, `resolveJsonModule`, `noEmit`.
- `server.ts`
  sobe Express, serve `public/`, injeta cabeçalho COOP, expõe `/api/health` e `/api/xrefs/:bookId/:chapter/:verse`.

## Firebase e regras

- `firebase-applet-config.json`
  contém a configuração do app Firebase usada pelo frontend.
- `firestore.rules`
  restringe leitura/escrita do documento do usuário ao próprio dono.
- `firebase-blueprint.json`
  descreve os schemas `UserProfile` e `AiCache`.

## Capacitor

- `capacitor.config.ts`
  define:
  `appId = com.codex.biblia`,
  `appName = Bíblia Codex`,
  `webDir = dist`,
  `androidScheme = https`,
  `allowMixedContent = false`,
  `captureInput = true`,
  `webContentsDebuggingEnabled = true`.

Esse arquivo é a ponte entre build web e projeto Android.

## Pasta `android/` em detalhe

A pasta `android/` é um projeto Gradle completo, não apenas uma casca.

### Arquivos de nível superior

- `android/build.gradle`
  buildscript global.
  Define plugins:
  Android Gradle Plugin, Google Services, Crashlytics e Kotlin.
- `android/settings.gradle`
  inclui os módulos:
  `:app` e `:capacitor-cordova-android-plugins`.
  Também aplica `capacitor.settings.gradle`.
- `android/variables.gradle`
  centraliza versões:
  `minSdk 23`, `compileSdk 35`, `targetSdk 35`, Kotlin `2.0.0` e libs AndroidX.
- `android/gradle.properties`
  aumenta heap do Gradle/Kotlin, ativa paralelismo/cache e faz override do path check por causa do nome da pasta com acento.
- `android/local.properties`
  configuração local do SDK Android.
- `android/gradlew`, `android/gradlew.bat`
  wrappers do Gradle.
- `android/capacitor.settings.gradle`
  inclui o módulo `capacitor-android` vindo de `node_modules/@capacitor/android/capacitor`.
- `android/gradle/wrapper/gradle-wrapper.properties`
  versão do wrapper Gradle.
- `android/gradle/gradle-daemon-jvm.properties`
  config do daemon.

### Módulo principal: `android/app/`

#### Build

- `android/app/build.gradle`
  módulo Android principal.
  Características:
  namespace `com.codex.biblia`,
  Java 21,
  Kotlin kapt,
  Firebase BoM,
  Room,
  Koin,
  Gemini Android SDK,
  Coroutines,
  integração com Capacitor e Crashlytics condicional.
- `android/app/capacitor.build.gradle`
  arquivo gerado pelo Capacitor.
  Aplica configurações do plugin Cordova/Capacitor.
- `android/app/proguard-rules.pro`
  regras de ProGuard.
- `android/app/google-services.json`
  configuração Android do Firebase.

#### Manifesto e atividade

- `android/app/src/main/AndroidManifest.xml`
  declara:
  internet,
  permissões de leitura/escrita externas,
  `MyApplication`,
  `MainActivity`,
  `FileProvider`.
- `android/app/src/main/java/com.codex.biblia/MainActivity.java`
  estende `BridgeActivity`.
  Registra manualmente o plugin `BibleDictionaryPlugin`.
- `android/app/src/main/java/com.codex.biblia/MyApplication.kt`
  inicializa Koin em nível de aplicação.

#### Injeção de dependência

- `android/app/src/main/java/com.codex.biblia/di/AppModule.kt`
  define o módulo Koin.
  Cria:
  `AppDatabase`,
  `AIStudyCacheDao`,
  `GeminiAISearchService`,
  `DictionaryService`.
  Observação importante:
  o `GeminiAISearchService` está com `apiKey = "YOUR_API_KEY"` hardcoded como placeholder.

#### Banco local Android

- `android/app/src/main/java/com.codex.biblia/data/AppDatabase.kt`
  banco Room.
- `android/app/src/main/java/com.codex.biblia/data/AIStudyCache.kt`
  entidade `ai_study_cache`.
- `android/app/src/main/java/com.codex.biblia/data/AIStudyCacheDao.kt`
  DAO com:
  insert, getOldest, deleteById, getCount, getByQuery.
- `android/app/src/main/java/com.codex.biblia/data/DictionaryEntry.kt`
  model simples de entrada de dicionário.

#### Serviços Android

- `android/app/src/main/java/com.codex.biblia/service/GeminiAISearchService.kt`
  usa `GenerativeModel` do Gemini Android SDK.
  Modelo configurado:
  `gemini-1.5-flash`.
- `android/app/src/main/java/com.codex.biblia/service/DictionaryService.kt`
  orquestra busca:
  cache Room primeiro,
  depois IA,
  com poda do cache acima de 100 registros.
  Busca local SQL ainda não está implementada nessa camada.

#### Plugin Capacitor nativo

- `android/app/src/main/java/com.codex.biblia/plugin/BibleDictionaryPlugin.kt`
  plugin exposto para a camada JS com nome `BibleDictionary`.
  Método:
  `getDefinition(query, useAI)`.
  Usa `DictionaryService` via Koin e responde com `JSObject`.

#### Recursos Android

- `android/app/src/main/res/layout/activity_main.xml`
  layout simples com `CoordinatorLayout` e `WebView`.
- `android/app/src/main/res/values/strings.xml`
  nome do app, activity e package/custom scheme.
- `android/app/src/main/res/values/styles.xml`
  temas:
  `AppTheme`, `AppTheme.NoActionBar`, `AppTheme.NoActionBarLaunch`.
- `android/app/src/main/res/xml/config.xml`
  config Cordova mínima com `access origin="*"`.
- `android/app/src/main/res/xml/file_paths.xml`
  caminhos expostos pelo `FileProvider`.
- `android/app/src/main/res/drawable*`
  splash screens.
- `android/app/src/main/res/mipmap*`
  ícones do app em várias densidades.
- `android/app/src/main/res/drawable/ic_launcher_background.xml`
  fundo vetorial do ícone.
- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
  foreground vetorial.

#### Assets embarcados no APK

`android/app/src/main/assets/` contém o runtime web copiado para o Android:

- `capacitor.config.json`
  versão serializada da configuração do Capacitor.
- `capacitor.plugins.json`
  lista de plugins disponíveis.
- `public/index.html`
  shell web copiado do build.
- `public/cordova.js`
  bridge Cordova.
- `public/cordova_plugins.js`
  manifesto Cordova.
- `public/assets/index-DN43bphx.js`
  bundle JavaScript principal do frontend.
- `public/assets/index-BIAq81II.css`
  stylesheet principal do frontend.

Esses arquivos são o frontend React já compilado e embutido no APK.

#### Testes Android

- `android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java`
  teste unitário padrão.
- `android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java`
  teste instrumentado padrão.

### Módulo `capacitor-cordova-android-plugins`

- `android/capacitor-cordova-android-plugins/build.gradle`
  módulo library auxiliar dos plugins Cordova/Capacitor.
- `android/capacitor-cordova-android-plugins/cordova.variables.gradle`
  variáveis gradle dos plugins.
- `android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml`
  manifesto desse módulo.
- `android/capacitor-cordova-android-plugins/src/main/java/.gitkeep`
- `android/capacitor-cordova-android-plugins/src/main/res/.gitkeep`

### Pastas auxiliares e geradas

Existem também pastas de ferramenta/geradas:

- `android/.idea/`
  metadados do Android Studio.
- `android/.kotlin/`
  logs e estado do Kotlin.
- `android/build/`
  relatórios e artefatos do build.

## O que de fato entra no APK

No APK Android entram:

- o módulo nativo `android/app`;
- o código Java/Kotlin do plugin e dos serviços;
- o banco Room e sua infraestrutura;
- recursos Android (`res/`);
- o frontend React compilado em `android/app/src/main/assets/public/`;
- configuração Firebase Android;
- dependências nativas do Capacitor/Firebase/Koin/Room/Gemini.

## Arquivos gerados, binários e dependências

Itens existentes no projeto mas não ideais para leitura manual linha a linha:

- `node_modules/`
  dependências baixadas.
- `dist/`
  build web gerado.
- `android/build/`
  artefatos de build Gradle.
- `android/app/src/main/assets/public/assets/index-DN43bphx.js`
  bundle JS grande gerado.
- `android/app/src/main/assets/public/assets/index-BIAq81II.css`
  CSS gerado.
- `public/sql-wasm.wasm`
  binário WASM.
- arquivos `.png`, `.jar`, `.wasm`, `.mybible`
  assets/binários.

## Resumo executivo

Este app é composto por:

- uma interface React bastante grande para leitura, navegação, notas, tags, dicionário, onboarding e configurações;
- um sistema de importação e leitura de módulos bíblicos locais;
- integração forte com Gemini para comentário, referências cruzadas e definição teológica;
- autenticação/sincronização com Firebase;
- um projeto Android nativo com plugin Capacitor, DI via Koin e cache local via Room.

O ponto mais importante da pasta `android/` é que ela não só hospeda o WebView:

- ela registra plugin próprio;
- inicializa injeção de dependência;
- mantém banco local Room;
- possui serviço Gemini nativo;
- embute o build React dentro de `assets/public/`.
