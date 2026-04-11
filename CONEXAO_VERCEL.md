# 🎯 CONECTAR BÍBLIA CODEX AO VERCEL - PASSO A PASSO

## ✅ O que já foi feito:

1. ✅ Configurado `vercel.json` com as configurações corretas
2. ✅ Migrado Firebase para variáveis de ambiente (seguro!)
3. ✅ Criado `tsconfig.json` na raiz (necessário para Vercel)
4. ✅ Build testado localmente com sucesso
5. ✅ Push feito para `https://github.com/welitonevoc/Biblia-Codex`

---

## 📋 PASSOS PARA CONECTAR AO VERCEL:

### 1️⃣ Acessar o Vercel e Importar o Repositório

**Link direto:** https://vercel.com/new

1. Clique em **"Import Git Repository"**
2. Conecte sua conta do GitHub (se ainda não estiver conectado)
3. Pesquise e selecione: **`welitonevoc/Biblia-Codex`**

---

### 2️⃣ Configurar o Projeto

Preencha as seguintes informações:

| Campo | Valor |
|-------|-------|
| **Project Name** | `biblia-codex` |
| **Framework Preset** | Vite |
| **Root Directory** | `Biblia-Codex` ⚠️ **IMPORTANTE!** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

**⚠️ ATENÇÃO:** O campo **Root Directory** DEVE ser configurado para `Biblia-Codex`, pois o código do app está dentro desta pasta, não na raiz do repositório.

---

### 3️⃣ Adicionar Variáveis de Ambiente

No mesmo painel, clique em **"Environment Variables"** e adicione:

```
Nome: VITE_FIREBASE_API_KEY
Valor: (sua API key do Firebase)
```

```
Nome: VITE_FIREBASE_AUTH_DOMAIN
Valor: seu-projeto.firebaseapp.com
```

```
Nome: VITE_FIREBASE_PROJECT_ID
Valor: seu-projeto
```

```
Nome: VITE_FIREBASE_STORAGE_BUCKET
Valor: seu-projeto.appspot.com
```

```
Nome: VITE_FIREBASE_MESSAGING_SENDER_ID
Valor: 123456789
```

```
Nome: VITE_FIREBASE_APP_ID
Valor: 1:123456789:web:abcdef
```

**Opcional (para IA):**
```
Nome: VITE_GEMINI_API_KEY
Valor: (sua key do Google AI Studio)
```

#### 📍 Onde obter as credenciais do Firebase:

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto (ou crie um novo)
3. Clique em ⚙️ **Settings** > **Project settings**
4. Role até **"Your apps"** > **Web app**
5. Se não tiver, clique em **"Add app"** > **Web (</>)**
6. Copie os valores do `firebaseConfig`

---

### 4️⃣ Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (~2-3 minutos)
3. 🎉 Pronto! Seu app estará em: `https://biblia-codex.vercel.app`

---

## 🔗 Link Direto para Import

Se já estiver logado no Vercel, use este link:

```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwelitonevoc%2FBiblia-Codex&project-name=biblia-codex&repository-name=Biblia-Codex&root-directory=Biblia-Codex
```

---

## ⚙️ Configurar Deploy Automático (CI/CD)

Após o primeiro deploy:

1. Vá em **Settings** > **Git**
2. Em **"Connected Git Repository"**, verifique se está correto
3. Em **"Production Branch"**, certifique-se que está `main`
4. Pronto! Cada push para `main` fará deploy automático

---

## 🔐 Autorizar Domínio no Firebase

Para o login com Google funcionar:

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Authentication** > **Settings**
4. Em **"Authorized domains"**, clique em **"Add domain"**
5. Adicione: `biblia-codex.vercel.app` (ou seu domínio customizado)

---

## ✅ Checklist Final

Antes de testar, verifique:

- [ ] Repositório importado no Vercel
- [ ] Root Directory configurado para `Biblia-Codex`
- [ ] Todas as 6 variáveis do Firebase adicionadas
- [ ] Domínio autorizado no Firebase Console
- [ ] Google Sign-in ativado no Firebase
- [ ] Primeiro deploy concluído com sucesso

---

## 🐛 Troubleshooting

### Build falha no Vercel

**Erro:** "Cannot find module" ou "File not found"
- ✅ Causa: Root Directory não configurado corretamente
- ✅ Solução: Settings > General > Root Directory = `Biblia-Codex`

**Erro:** "Firebase: Need to provide options"
- ✅ Causa: Variáveis de ambiente não configuradas
- ✅ Solução: Adicione as 6 variáveis `VITE_FIREBASE_*`

### App carrega mas login não funciona

**Erro:** "Unauthorized domain"
- ✅ Causa: Domínio não autorizado no Firebase
- ✅ Solução: Adicione `biblia-codex.vercel.app` em Authorized domains

### Erro de CORS

**Erro:** "CORS policy" ou "Access denied"
- ✅ Causa: Regras de segurança do Firestore muito restritivas
- ✅ Solução: Verifique `firebase/firestore.rules` e faça deploy das regras

---

## 📞 Precisa de ajuda?

- **Documentação Vercel (Vite):** https://vercel.com/docs/frameworks/vite
- **Documentação Firebase:** https://firebase.google.com/docs
- **Suporte Vercel:** https://vercel.com/support

---

**Feito com ❤️ para o projeto Bíblia Codex**
