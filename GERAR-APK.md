# 📱 Guia Completo — Gerar APK da Bíblia Kerygma

## Pré-requisitos

Instale antes de começar:
- [Node.js 18+](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) (com SDK Android 33+)
- [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
- Variável `ANDROID_HOME` configurada no sistema

---

## Passo 1 — Instalar dependências

```bash
npm install
```

---

## Passo 2 — Criar o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY=sua_chave_aqui
```

---

## Passo 3 — Inicializar o Capacitor (só na primeira vez)

```bash
npx cap init "Bíblia Kerygma" "com.kerygma.biblia" --web-dir dist
npx cap add android
```

> ⚠️ Se o comando `cap init` perguntar se quer sobrescrever o `capacitor.config.ts`, responda **não** — o arquivo já está configurado.

---

## Passo 4 — Build e sincronização

```bash
# Compila o React e copia para a pasta android/
npm run cap:sync
```

Ou manualmente:
```bash
npm run build
npx cap sync android
```

---

## Passo 5 — Configurar Firebase para Android

No [Console do Firebase](https://console.firebase.google.com):

1. Vá em **Configurações do projeto → Seus apps → Adicionar app → Android**
2. Package name: `com.kerygma.biblia`
3. Baixe o `google-services.json`
4. Coloque em `android/app/google-services.json`
5. Em **Authentication → Sign-in method → Google**, certifique-se que está habilitado
6. Em **Authentication → Settings → Domínios autorizados**, adicione qualquer domínio necessário

---

## Passo 6 — Gerar o APK no Android Studio

```bash
npm run cap:open
```

No Android Studio:
1. Aguarde o Gradle sincronizar (pode levar alguns minutos)
2. Menu **Build → Generate Signed Bundle / APK**
3. Escolha **APK**
4. Crie ou selecione seu keystore
5. Selecione a variante **release** ou **debug**
6. Clique em **Finish**

O APK estará em: `android/app/build/outputs/apk/`

---

## Passo 7 (opcional) — Testar direto no dispositivo

Com o dispositivo Android conectado via USB e depuração USB ativada:

```bash
npm run cap:run
```

---

## Dicas importantes

| Situação | O que fazer |
|---|---|
| Mudou código React | `npm run cap:sync` novamente |
| Tela branca no APK | Verifique se `vite.config.ts` tem `base: './'` |
| Login Google não funciona | Adicione o SHA-1 do keystore no Firebase |
| Erro de CORS com Gemini | Normal — Gemini aceita chamadas diretas do cliente |
| App lento no primeiro carregamento | Normal — WebView carregando o bundle JS |

---

## Estrutura dos arquivos modificados

```
biblia-kerygma/
├── capacitor.config.ts     ← NOVO — configuração do Capacitor
├── vite.config.ts          ← ALTERADO — adicionado base: './'
├── package.json            ← ALTERADO — adicionadas deps do Capacitor
├── src/
│   ├── firebase.ts         ← ALTERADO — signInWithRedirect em vez de Popup
│   ├── BibleService.ts     ← ALTERADO — xrefs direto no Gemini (sem Express)
│   └── AppContext.tsx      ← ALTERADO — handleRedirectResult adicionado
└── GERAR-APK.md            ← NOVO — este guia
```
