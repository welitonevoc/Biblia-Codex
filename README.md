# Bíblia Codex

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## A Palavra de Deus ao Seu Alcance, Onde Quer que Você Esteja.

Bíblia Codex é a nova geração de aplicativos bíblicos — uma plataforma de estudo profundamente rica que combina leitura, ferramentas de estudo, dicionários teológicos e inteligência artificial em uma experiência móvel e web integrada. Desenvolvido para preachers, estudantes, teólogos e qualquer pessoa que leva a sério o estudo da Palavra de Deus.

---

## ✨ O Que Torna a Bíblia Codex Única

### 🔹 Leitura Imersiva e Personalizável
- **Múltiplas versões bíblicas**: ARA, ARC, ACF (pré-carregadas)
- **Modos de tema**: Claro, Sépia, Escuro, OLED Preto
- **Tipografia Avançada**: Ajuste de fonte, tamanho, linha, espaçamento, letras
- **Palavras de Jesus em vermelho**: Destaque automático
- **Números de versículos**: Mostrar/ocultar
- **Modo parágrafo**: Alternar entre organização por versículos ou parágrafos

### 🔹 Navegação Inteligente
- **Busca global**: Encontre qualquer livro, capítulo ou versículo
- **Menu hamburguer em cascata**: Versão, Livros, Fonte com um clique
- **Seleção múltipla de versículos**: Selecione e estude vários versículos juntos
- **Navegação por referência**:簿 GoTo rápido para Gênesis 1:1
- **Capítulo inteiro**: Vá rápido para qualquer posição

### 🔹 Ferramentas de Estudo Profundo
Clique em qualquer versículo para acessar:

| Ferramenta | Descrição |
|---|---|
| **Comentários** | Comentários bíblicos de preachers reconhecidos |
| **Dicionário** | Dicionário Teológico (Strong AMG, KJ Concordance) |
| **Enciclopédia** | Enciclopédia Merrill (C. Tenney) — 6.852 verbetes |
| **Referências Cruzadas** | Conexões entre outros versículos |
| **Pessoas** | Dicionário biográfico bíblico |
| **Lugares** | Atlas e dicionário geográfico |
| **Notas de Rodapé** | Notas e explicações |
| **Vine Pro** | Multiléxico Vine Pro BR — 14.919 verbetes hebraico/grego |

### 🔹 Dicionários e Recursos Inclusos

#### Biblicas (MyBible/MySword)
- **ARA** — Almeida Revista e Atualizada com Strong
- **ARC** — Almeida Revista e Corrigida 2009
- **ACF** — Almeida Corrigida Fiel

#### Dicionários Teológicos
- **Strong AMG** — strong com_definições em português
- **Strong KJ** — Concordância de King James

#### Enciclopédia
- **Enciclopédia Merrill** (C. Tenney) — 6.852 verbetes completos
- **Multiléxico Vine Pro BR** — 14.919 verbetes hebraico, aramaico e grego

### 🔹 Recursos de Estudo
- **Marcadores**: +corES +tags +notas
- **Notas**: Anotações pessoais com export
- **Histórico**: recently_read_verses
- **Planos de Leitura**: Plans_diários/semanais/mensais
- **Devocionais**: Daily_devotionals

### 🔹 Assistente de IA
- **Múltiplos providers**: Google Gemini, OpenRouter, Groq
- **Perfil teológico**: Assembleiano Clássico (CGADB)
- **Contexto intelligent**: Busca em Merrill/Vine Pro automaticamente
- **Definições de termos**: Explicação teológica profunda
- **Cache offline**: Funciona sem internet

### 🔹 Audio & Leitura
- **TTS (Text-to-Speech)**: Vozes naturais em português
- **Velocidade ajustável**: 0.5x até 2x
- **Leitura por capítulo**: automation entire chapters
- **Vozes Google**: alta qualidade natural

### 🔹 Sincronização
- **Firebase**: Login com Google
- **Backup completo**: Marcadores, notas, configurações
- **Multi-device**: Continue em qualquer dispositivo

### 🔹 Plataforma
- **Web**: Roda no browser (Vercel)
- **Android**: App nativo via Capacitor
- **PWA**: Instalável como app

---

## 🚀 Tecnologias

| Categoria | stack |
|---|---|
| **Frontend** | React 19, Vite 8, TypeScript, TailwindCSS 4 |
| **Mobile** | Capacitor 6 (Android) |
| **Database** | SQLite (sql.js), IndexedDB |
| **IA** | Google GenAI, OpenRouter, Groq |
| **Auth** | Firebase Auth |
| **Animations** | Framer Motion |
| **i18n** | react-i18next |

---

## 📦 Como Usar

### Development
```bash
npm install
npm run dev
```

### Build para Web
```bash
npm run build
```

### Build para Android
```bash
npm run cap:sync
npm run cap:run
```

---

## 📂 Estrutura do Projeto

```
Biblia-Codex/
├── public/                 # Arquivos estáticos
│   ├── *.mybible          # Módulos bíblicos
│   ├── *.db               # Bancos SQLite
│   └── *.gz               # Enciclopédias comprimidas
├── src/
│   ├── features/          # Componentes por feature
│   │   ├── bible/        # Leitor bíblico
│   │   ├── study/       # Ferramentas de estudo
│   │   ├── bookmarks/   # Marcadores
│   │   └── ...
│   ├── services/         # Lógica de negócio
│   ├── hooks/           # React hooks
│   └── i18n/           # Traduções
└── docs/                # Documentação
```

---

## 🤝 Como Contribuir

1. **Fork** o repositório
2. **Crie** uma branch (`git checkout -b feature/nova`)
3. **Commit** suas mudanças
4. **Push** para o repositório
5. **Abra** um Pull Request

Todas as contribuições são bem-vindas!

---

## 📄 Licença

MIT License — sinta-se livre para usar e contribuir.

---

## 👨‍💻 Autor

**Dc. José Menezes**
- Psicólogo, Teólogo e Desenvolvedor
- [GitHub](https://github.com/welitonevoc)

> *"Tudo para a glória de Deus e o edificação do Seu povo."*