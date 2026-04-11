# 🚀 Guia de Deploy - Bíblia Codex no Vercel

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub: `https://github.com/welitonevoc/Biblia-Codex`
3. Projeto Firebase configurado (se for usar autenticação/sync)

---

## Opção 1: Deploy Automático (Recomendado)

### Passo 1: Conectar Repositório ao Vercel

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione o repositório: `welitonevoc/Biblia-Codex`
4. **Importante:** Configure o **Root Directory** para `Biblia-Codex` (a pasta do app)

### Passo 2: Configurar Variáveis de Ambiente

No painel do Vercel, adicione estas variáveis de ambiente:

```bash
# Firebase (obrigatório para auth e sync)
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Opcional: ID do banco de dados Firestore (se não for o padrão)
# VITE_FIREBASE_DATABASE_ID=(default)

# Google Gemini AI (opcional - para recursos de IA)
VITE_GEMINI_API_KEY=sua_gemini_api_key_aqui
```

**Onde obter:**
- Firebase: https://console.firebase.google.com/project/seu-projeto/settings/general
- Gemini AI: https://aistudio.google.com/apikey

### Passo 3: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. Seu app estará disponível em: `https://biblia-codex.vercel.app`

---

## Opção 2: Deploy via CLI do Vercel

### Instalação

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy (primeira vez)

```bash
cd Biblia-Codex
vercel
```

Siga as instruções:
- **Set up and deploy?** Yes
- **Which scope?** Selecione seu projeto
- **Link to existing project?** No
- **What's your project's name?** Biblia-Codex
- **In which directory is your code located?** ./

### Configurar variáveis de ambiente

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_GEMINI_API_KEY  # opcional
```

### Deploy de produção

```bash
vercel --prod
```

---

## Configuração do vercel.json

O arquivo `vercel.json` já está configurado com:

- ✅ **buildCommand:** `npm run build`
- ✅ **outputDirectory:** `dist`
- ✅ **rewrites:** Todas as rotas redirecionam para `index.html` (SPA)
- ✅ **Cache-Control:** Assets com cache de 1 ano (immutable)

---

## Configuração do Firebase no Vercel

### 1. Obter credenciais do Firebase

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Project Settings** ⚙️ > **General** > **Your apps**
4. Se não tiver um app web, clique em **Add app** > **Web**
5. Copie as configurações:
   ```
   apiKey: "AIzaSy..."
   authDomain: "seu-projeto.firebaseapp.com"
   projectId: "seu-projeto"
   storageBucket: "seu-projeto.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abcdef"
   ```

### 2. Configurar no Vercel

Cole cada valor nas variáveis de ambiente correspondentes no painel do Vercel:
- Settings > Environment Variables

### 3. Configurar regras de segurança do Firestore

As regras já estão em `firebase/firestore.rules` e permitem:
- Leitura/escrita apenas para usuários autenticados
- Cada usuário só acessa seus próprios dados

---

## Troubleshooting

### Build falha com "Cannot find module"

**Solução:** Verifique se está na pasta correta:
```bash
cd Biblia-Codex  # não na raiz do repo
```

### Erro: "Firebase: Need to provide options"

**Solução:** Variáveis de ambiente não estão configuradas. Adicione no painel do Vercel.

### App carrega mas não faz login

**Solução:** 
1. Verifique se `VITE_FIREBASE_API_KEY` está correta
2. No Firebase Console, ative o **Google** em **Authentication** > **Sign-in method**
3. Adicione o domínio do Vercel em **Authorized domains**

### Erro de CORS no Firebase

**Solução:** Adicione seu domínio do Vercel em:
- Firebase Console > Authentication > Settings > **Authorized domains**
- Adicione: `biblia-codex.vercel.app`

---

## CI/CD - Deploy Automático a cada Push

O Vercel faz deploy automático a cada push na branch `main`.

Para configurar:

1. No Vercel, vá em **Settings** > **Git**
2. Conecte ao repositório GitHub
3. Configure a branch de produção: `main`
4. Pronto! Cada push para `main` gera um novo deploy

---

## Domínio Customizado (Opcional)

1. No Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio: `biblia.seudominio.com`
3. Configure o DNS conforme instruído pelo Vercel

---

## Checklist Pré-Deploy

Antes de deploy em produção, verifique:

- [ ] Variáveis de ambiente do Firebase configuradas
- [ ] `firebase-applet-config.json` **NÃO** está no repositório (está no .gitignore)
- [ ] Testou build local: `npm run build`
- [ ] Testou preview: `npm run preview`
- [ ] Regras de segurança do Firestore estão corretas
- [ ] Dominio autorizado no Firebase Console
- [ ] Google Sign-in ativado no Firebase

---

## Links Úteis

- **Painel do Vercel:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com
- **Gemini AI Studio:** https://aistudio.google.com
- **Documentação Vercel (Vite):** https://vercel.com/docs/frameworks/vite
- **Documentação Firebase:** https://firebase.google.com/docs

---

**Última atualização:** 11 de abril de 2026
