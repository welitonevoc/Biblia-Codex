# AGENTS.md

## O que é este projeto?

Este é um aplicativo de Bíblia digital para Android (e também roda na web). Foi construído com React 19, Vite, Tailwind v4, TypeScript e Capacitor.

## Estrutura de pastas

- **Pasta raiz**: `C:\Projetos\Biblia-Codex\` - É apenas um "diretório pai" que redireciona para a pasta do app
- **App principal**: Tudo está em `Biblia-Codex/`
- **Código fonte**: `Biblia-Codex/src/` - Onde está o código React
- **Ponto de entrada**: `src/main.tsx` - Arquivo inicial do app

## Comandos para rodar

Todos os comandos devem ser executados na pasta raiz:

```bash
# Desenvolvimento - inicia o app em modo de desenvolvimento
npm run dev

# Build - compila o app para produção
npm run build

# Verificar erros de tipo (lint)
npm run lint

# Ejecutar testes
npm run test

# Android - Sincronizar com Android
npm run cap:sync

# Android - Abrir Android Studio
npm run cap:open

# Android - Compilar e rodar no celular
npm run cap:run

# Verificar cobertura de testes
npm run test:coverage
```

## Coisas importantes que você precisa saber

### Tailwind v4 (CSS)
O projeto usa Tailwind CSS versão 4, que é diferente da versão 3. A configuração usa uma diretiva especial chamada `@theme` e o processamento de CSS usa "postcss" em vez de "Lightning CSS". **Não use minificação de CSS com Lightning CSS** - vai dar erro.

### Android (Capacitor)
O app usa Capacitor para rodar no Android. A configuração do Vite precisa ter `base: './'` (caminho relativo) para funcionar no WebView do Android.

### Firebase
O Firebase está excluído da otimização de dependências do Vite (`exclude: ['firebase']`) para evitar problemas com SSR (renderização no servidor).

### Testes
- Arquivo de configuração dos testes: `src/test/setup.ts`
- Testes devem estar em: `src/**/*.test.ts` ou `*.spec.ts`
- Ambiente de teste: jsdom (simula o navegador)

### Deploy na Vercel
O app está configurado para fazer deploy na Vercel. O arquivo `vercel.json` na raiz configura isso. A pasta de saída é `Biblia-Codex/dist`.

**Dica**: Se você fizer mudanças e o site não atualizar, faça um commit vazio para forçar um novo deploy:
```bash
git commit --allow-empty -m "chore: force new deployment"
git push origin main
```

## Arquivos importantes

- `Biblia-Codex/package.json` - Dependências do projeto
- `Biblia-Codex/vite.config.ts` - Configuração do Vite
- `Biblia-Codex/tsconfig.json` - Configuração do TypeScript
- `Biblia-Codex/vitest.config.ts` - Configuração dos testes
- `vercel.json` - Configuração de deploy na Vercel