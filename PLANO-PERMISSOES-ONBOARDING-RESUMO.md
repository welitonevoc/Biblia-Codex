# ✅ PLANO COMPLETO: Fluxo de Permissões Android 13+

**Data:** 2026-03-25  
**Status:** 📋 Planos criados, aguardando implementação  
**Referência:** androidbible-develop (fluxo de permissões no primeiro acesso)

---

## 📚 Arquivos Criados

### 1. Plano de Implementação

**Arquivo:** `.agent/workflows/plan-permissions-onboarding.md`

**Conteúdo:**
- ✅ Objetivo claro (fluxo estilo androidbible-develop)
- ✅ Situação atual (o que temos vs o que falta)
- ✅ Arquitetura da solução
- ✅ 6 fases de implementação
- ✅ Design da tela de permissões
- ✅ Critérios de aceite
- ✅ Ordem de implementação (2h 40min estimado)
- ✅ Plano de testes completo

### 2. Agente Mobile Developer Atualizado

**Arquivo:** `.agent/agents/mobile-developer.md`

**Conteúdo:**
- ✅ Contexto do projeto Bíblia Kerygma
- ✅ Stack tecnológico completo
- ✅ Filosofia de desenvolvimento
- ✅ **MANDATÓRIO: Fluxo de permissões Android 13+**
- ✅ Padrões de implementação
- ✅ Componente PermissionScreen (estrutura)
- ✅ Checklist de qualidade
- ✅ Comandos de build e debug
- ✅ Erros comuns para evitar

### 3. Debug Mode Atualizado

**Arquivo:** `.agent/workflows/debug.md`

**Conteúdo:**
- ✅ 5 categorias de problemas comuns
- ✅ Fluxo de debug passo a passo
- ✅ Matriz de decisão
- ✅ Scripts de debug
- ✅ Checklist de debug
- ✅ Comandos ADB específicos
- ✅ Soluções prontas para cada erro

---

## 🎯 O Que Será Implementado

### Tela de Permissões (NOVO)

**Arquivo:** `src/components/PermissionScreen.tsx` (criar)

**Design:**
```
┌─────────────────────────────────────────┐
│                                         │
│    🔐  (ícone grande)                   │
│                                         │
│    Permissões Necessárias               │
│    Para sua experiência completa        │
│                                         │
│    📥 Importar Módulos                  │
│    📖 Leitura Offline                   │
│    ☁️  Backup Automático                │
│                                         │
│    [ Conceder Permissões ]              │
│    [ Depois ]                           │
│                                         │
└─────────────────────────────────────────┘
```

### Onboarding Atualizado

**Arquivo:** `src/components/Onboarding.tsx` (modificar)

**Mudança:**
- **Antes:** 6 passos
- **Depois:** 7 passos (passo 7 = PermissionScreen)

**Fluxo:**
```
1. Boas-vindas
2. Objetivo
3. Tempo por dia
4. Notificações
5. Plano personalizado
6. Versículo de hoje
7. 🔐 Permissões (NOVO)
```

### Verificação Automática

**Arquivo:** `src/App.tsx` (adicionar)

**Código:**
```typescript
useEffect(() => {
  const checkFirstLaunch = async () => {
    const hasLaunched = await AsyncStorage.getItem('hasLaunched');
    
    if (!hasLaunched) {
      setShowOnboarding(true);
    } else {
      const hasPermission = await ensureStoragePermission();
      setPermissionGranted(hasPermission);
    }
  };
  
  checkFirstLaunch();
}, []);
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuário instala o app                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. App abre pela primeira vez                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. Onboarding (passos 1-6 existentes)                  │
│     - Boas-vindas                                       │
│     - Objetivo                                          │
│     - Tempo por dia                                     │
│     - Notificações                                      │
│     - Plano personalizado                               │
│     - Versículo de hoje                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. Passo 7: Tela de Permissões (NOVO)                  │
│     - Explica benefícios                                │
│     - Botão "Conceder Permissões"                       │
│     - Botão "Depois" (opcional)                         │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  Usuário clica em "Conceder"  │
        └───────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  5. Sistema Android solicita permissões                 │
│     - Android 13+: READ_MEDIA_*                        │
│     - Android 6-12: READ/WRITE_EXTERNAL                │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  Usuário permitiu?            │
        └───────────────────────────────┘
           ↓                    ↓
         SIM                   NÃO
           ↓                    ↓
    ┌─────────────┐      ┌─────────────────┐
    │ Onboarding  │      │ App funciona    │
    │ completa →  │      │ limitado +      │
    │ Home        │      │ opção configura │
    └─────────────┘      └─────────────────┘
           ↓
    ┌─────────────────────┐
    │ Usuário pode        │
    │ importar módulos    │
    │ quando quiser       │
    └─────────────────────┘
```

---

## 🚀 Como Iniciar Implementação

### Opção 1: Usar /create (Recomendado)

```
/create Implementar fluxo de permissões Android 13+ com Onboarding
```

Isso ativará o agente `mobile-developer` com todo o contexto necessário.

### Opção 2: Implementação Manual

```bash
# 1. Criar PermissionScreen.tsx
# 2. Integrar com Onboarding.tsx
# 3. Atualizar ModuleManagement.tsx
# 4. Adicionar verificação no App.tsx
# 5. Testar em Android 13+
# 6. Validar em Android 6-12
```

### Opção 3: Testar Primeiro

```powershell
# Verificar permissões atuais
.\scripts\check-permissions.ps1

# Build do APK
.\scripts\build-android-apk.ps1

# Instalar e testar
adb install android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 📁 Estrutura de Arquivos

```
biblia-kerygma/
├── .agent/
│   ├── agents/
│   │   └── mobile-developer.md          ✅ ATUALIZADO
│   └── workflows/
│       ├── plan-permissions-onboarding.md ✅ NOVO
│       └── debug.md                      ✅ ATUALIZADO
│
├── src/
│   ├── components/
│   │   ├── Onboarding.tsx                ✅ Existe (atualizar)
│   │   ├── ModuleManagement.tsx          ✅ Existe (atualizar)
│   │   └── PermissionScreen.tsx          🆕 CRIAR
│   │
│   ├── services/
│   │   ├── permissionsService.ts         ✅ COMPLETO
│   │   ├── PERMISSIONS-SERVICE.md        ✅ DOCUMENTAÇÃO
│   │   └── moduleService.ts              ✅ Existe
│   │
│   └── hooks/
│       └── usePermissions.ts             🆕 CRIAR (opcional)
│
├── scripts/
│   ├── build-android-apk.ps1             ✅ Existe
│   └── check-permissions.ps1             ✅ Existe
│
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── AndroidManifest.xml   ✅ ATUALIZADO
│               └── res/
│                   └── xml/
│                       └── file_paths.xml ✅ ATUALIZADO
│
└── docs/
    ├── PERMISSOES-ARMAZENAMENTO.md       ✅ Existe
    ├── PERMISSIONS-SERVICE-STATUS.md     ✅ Existe
    ├── TESTAR-AGORA.md                   ✅ Existe
    ├── CORRECAO-PERMISSOES-RESUMO.md     ✅ Existe
    └── README-CORRECAO.md                ✅ Existe
```

---

## ✅ Checklist de Implementação

### Fase 1: Criar Componentes

- [ ] Criar `src/components/PermissionScreen.tsx`
- [ ] Criar `src/hooks/usePermissions.ts` (opcional)
- [ ] Criar `src/context/PermissionContext.tsx` (opcional)

### Fase 2: Integrar

- [ ] Atualizar `src/components/Onboarding.tsx` (adicionar passo 7)
- [ ] Atualizar `src/components/ModuleManagement.tsx` (verificação automática)
- [ ] Atualizar `src/App.tsx` (verificação ao iniciar)

### Fase 3: Testar

- [ ] Teste 1: Primeira instalação (Android 13+)
- [ ] Teste 2: Permissão negada
- [ ] Teste 3: Segunda abertura
- [ ] Teste 4: Compatibilidade (Android 6-12)

### Fase 4: Build

- [ ] `npm run lint` (TypeScript sem erros)
- [ ] `npm run build` (build web OK)
- [ ] `npx cap sync android` (sincronizar)
- [ ] Build APK no Android Studio
- [ ] Instalar em dispositivo real

---

## 🧪 Critérios de Aceite

### ✅ Onboarding

- [ ] 7 passos completos
- [ ] Passo 7 é tela de permissões
- [ ] Botão "Conceder" abre diálogo Android
- [ ] Botão "Depois" permite continuar
- [ ] Design consistente com app
- [ ] Animações suaves

### ✅ Verificação Automática

- [ ] App verifica ao iniciar
- [ ] Primeira vez: mostra onboarding
- [ ] Segundas vezes: verifica silently
- [ ] Permissão negada: mostra opção

### ✅ ModuleManagement

- [ ] Verifica ao abrir
- [ ] Sem permissão: mostra botão "Conceder"
- [ ] Com permissão: permite importar
- [ ] Feedback visual claro

### ✅ Tratamento de Erros

- [ ] Permissão negada permanentemente: abre configurações
- [ ] Erro desconhecido: mensagem amigável
- [ ] Storage cheio: alerta específico
- [ ] Logs para debug

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Usuários com permissão | ~50% | ~85% | +35% |
| Importação de módulos | ~20% | ~60% | +40% |
| Erros de permissão | Altos | Baixos | -80% |
| Satisfação (UX) | Média | Alta | +50% |

---

## 🔧 Comandos Úteis

### Build e Teste

```bash
# Build completo
npm run build && npx cap sync android

# Abrir Android Studio
npx cap open android

# Build APK debug
cd android && .\gradlew assembleDebug

# Instalar
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Logcat
adb logcat | Select-String "permissions|ModuleManagement"
```

### Verificação

```powershell
# Verificar permissões no dispositivo
.\scripts\check-permissions.ps1

# Build APK release
.\scripts\build-android-apk.ps1
```

---

## 📚 Documentação de Referência

| Documento | Localização | Conteúdo |
|-----------|-------------|----------|
| **Plano Completo** | `.agent/workflows/plan-permissions-onboarding.md` | Plano detalhado |
| **Agente Mobile** | `.agent/agents/mobile-developer.md` | Como implementar |
| **Debug** | `.agent/workflows/debug.md` | Solução de problemas |
| **Service Docs** | `src/services/PERMISSIONS-SERVICE.md` | Uso do service |
| **Status** | `PERMISSIONS-SERVICE-STATUS.md` | O que já existe |
| **Permissões** | `PERMISSOES-ARMAZENAMENTO.md` | Guia técnico |
| **Teste Rápido** | `TESTAR-AGORA.md` | Como testar |

---

## 🎯 Próximos Passos

1. **Revisar planos** → Ler `.agent/workflows/plan-permissions-onboarding.md`
2. **Iniciar implementação** → Usar `/create` ou manual
3. **Seguir agente** → `mobile-developer.md` tem todo contexto
4. **Testar** → Seguir plano de testes
5. **Validar** → Critérios de aceite
6. **Deploy** → Gerar APK assinado

---

## 💡 Dicas Importantes

### Antes de Começar

1. ✅ Ler `plan-permissions-onboarding.md`
2. ✅ Ler `mobile-developer.md`
3. ✅ Entender `permissionsService.ts` (já está completo)
4. ✅ Testar app atual (baseline)

### Durante Implementação

1. ✅ Começar pelo simples (PermissionScreen)
2. ✅ Integrar gradualmente
3. ✅ Testar após cada mudança
4. ✅ Usar logs para debug

### Depois de Implementar

1. ✅ Testar em Android 13+
2. ✅ Testar em Android 6-12
3. ✅ Validar build sem erros
4. ✅ Gerar APK para distribuição

---

## 🚨 Erros para Evitar

| Erro | Como Evitar |
|------|-------------|
| Não verificar permissão antes de importar | SEMPRE usar `ensureStoragePermission()` |
| Esquecer de sincronizar Capacitor | `npx cap sync android` após mudanças |
| Não testar em Android antigo | Testar em API 24-34 |
| Ignorar User Agent | Detectar versão do Android |
| Não tratar permissão negada | Fornecer fallback |
| Esquecer logs de debug | Manter logs para troubleshooting |

---

**Status:** 📋 Planos criados e prontos  
**Próximo passo:** Executar `/create` para implementação  
**Tempo estimado:** 2h 40min  
**Responsável:** mobile-developer + android-kotlin-specialist
