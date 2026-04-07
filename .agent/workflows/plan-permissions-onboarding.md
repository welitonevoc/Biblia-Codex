# 📋 PLANO: Fluxo de Permissões Android 13+ com Onboarding

**Data:** 2026-03-25  
**Prioridade:** 🔴 ALTA  
**Status:** Aguardando implementação  
**Responsável:** mobile-developer + android-kotlin-specialist

---

## 🎯 Objetivo

Implementar fluxo de permissões no **primeiro acesso** igual ao aplicativo `androidbible-develop`:

1. **Primeira instalação** → Tela de autorização de permissões
2. **Usuário concede tudo** → App libera funcionalidades
3. **Depois** → Usuário importa módulos que desejar

---

## 📊 Situação Atual

### ✅ O Que Já Temos

| Componente | Status | Arquivo |
|-----------|--------|---------|
| AndroidManifest.xml | ✅ Permissões Android 13+ | `android/app/src/main/AndroidManifest.xml` |
| permissionsService.ts | ✅ Serviço completo | `src/services/permissionsService.ts` |
| ModuleManagement.tsx | ✅ Verificação em tempo de execução | `src/components/ModuleManagement.tsx` |
| Onboarding.tsx | ✅ Onboarding existente (6 passos) | `src/components/Onboarding.tsx` |

### ❌ O Que Falta

| Item | Descrição | Prioridade |
|------|-----------|------------|
| **Tela de Permissões** | Dialog/Screen pedindo permissões no primeiro acesso | 🔴 ALTA |
| **Integração Onboarding** | Adicionar passo de permissões no fluxo | 🔴 ALTA |
| **Verificação Automática** | Checar permissões ao iniciar o app | 🔴 ALTA |
| **Fallback** | Lidar com permissão negada permanentemente | 🟡 MÉDIA |
| **UI Premium** | Design consistente com app | 🟡 MÉDIA |

---

## 🏗️ Arquitetura da Solução

### Fluxo Ideal (androidbible-develop)

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
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. NOVO PASSO: Tela de Permissões                      │
│     - Explica por que precisa                           │
│     - Botão "Conceder Permissões"                       │
│     - Botão "Depois" (opcional)                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  5. Sistema Android solicita permissões                 │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  Usuário permitiu?            │
        └───────────────────────────────┘
           ↓                    ↓
         SIM                   NÃO
           ↓                    ↓
    ┌─────────────┐      ┌─────────────────┐
    │ Tela Home   │      │ Mostra fallback │
    │ + Módulos   │      │ ou limita funcs │
    └─────────────┘      └─────────────────┘
```

### Componentes Necessários

```
src/
├── components/
│   ├── Onboarding.tsx              ✅ Existe
│   ├── PermissionScreen.tsx        🆕 NOVO
│   ├── ModuleManagement.tsx        ✅ Existe (atualizar)
│   └── Settings.tsx                ✅ Existe
│
├── services/
│   ├── permissionsService.ts       ✅ Existe (completo)
│   └── moduleService.ts            ✅ Existe
│
├── hooks/
│   └── usePermissions.ts           🆕 NOVO (opcional)
│
└── context/
    └── PermissionContext.tsx       🆕 NOVO (opcional)
```

---

## 📝 Tarefas de Implementação

### Fase 1: Criar Tela de Permissões

**Arquivo:** `src/components/PermissionScreen.tsx`

**Requisitos:**
- Design premium consistente com app
- Explica por que precisa de permissões
- Lista benefícios de conceder
- Botão primário: "Conceder Permissões"
- Botão secundário: "Depois" (permite usar app limitado)
- Animações suaves (Motion)

**Conteúdo da Tela:**
```typescript
const benefits = [
  {
    icon: Download,
    title: "Importar Módulos",
    desc: "Baixe comentários, dicionários e mapas"
  },
  {
    icon: BookOpen,
    title: "Acesso Offline",
    desc: "Leia sem internet quando quiser"
  },
  {
    icon: Cloud,
    title: "Backup na Nuvem",
    desc: "Salve seu progresso automaticamente"
  }
];
```

---

### Fase 2: Integrar com Onboarding

**Arquivo:** `src/components/Onboarding.tsx`

**Mudanças:**
1. Adicionar **novo passo** (step 7) após "Versículo de hoje"
2. Chamar `PermissionScreen` como último passo
3. Só completar onboarding após decisão do usuário

**Novo Fluxo:**
```typescript
const totalSteps = 7; // Era 6, agora 7

// Step 6: Versículo de hoje (existente)
// Step 7: Permissões (NOVO)
{step === 6 && <PermissionScreen onComplete={handlePermissionComplete} />}
```

---

### Fase 3: Verificação Automática ao Iniciar

**Arquivo:** `src/App.tsx` ou `src/main.tsx`

**Código:**
```typescript
useEffect(() => {
  const checkFirstLaunch = async () => {
    const hasLaunched = await AsyncStorage.getItem('hasLaunched');
    
    if (!hasLaunched) {
      // Primeira vez: mostra onboarding + permissões
      setShowOnboarding(true);
    } else {
      // Já usou antes: verifica permissões
      const hasPermission = await ensureStoragePermission();
      setPermissionGranted(hasPermission);
    }
  };
  
  checkFirstLaunch();
}, []);
```

---

### Fase 4: Hook de Permissões (Opcional)

**Arquivo:** `src/hooks/usePermissions.ts`

```typescript
export const usePermissions = () => {
  const [status, setStatus] = useState<PermissionStatus>();
  const [loading, setLoading] = useState(true);

  const check = async () => {
    const s = await checkStoragePermission();
    setStatus(s);
    setLoading(false);
  };

  const request = async () => {
    const result = await requestStoragePermission();
    setStatus(result);
    return result.canAccessStorage;
  };

  useEffect(() => { check(); }, []);

  return { status, loading, check, request };
};
```

---

### Fase 5: Atualizar ModuleManagement

**Arquivo:** `src/components/ModuleManagement.tsx`

**Mudanças:**
1. Verificar permissão ao carregar componente
2. Se não tem permissão, mostrar botão "Conceder Permissão"
3. Melhorar feedback visual de erro

**Código:**
```typescript
useEffect(() => {
  const verifyPermission = async () => {
    const info = await getPermissionInfo();
    setPermissionGranted(info.status.canAccessStorage);
    setPermissionMessage(info.message);
  };
  
  verifyPermission();
}, []);
```

---

### Fase 6: Contexto Global (Opcional)

**Arquivo:** `src/context/PermissionContext.tsx`

```typescript
interface PermissionContextType {
  granted: boolean;
  loading: boolean;
  check: () => Promise<void>;
  request: () => Promise<boolean>;
  openSettings: () => void;
}

export const PermissionProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  // Implementação completa
};
```

**Uso no App.tsx:**
```typescript
<PermissionProvider>
  <App />
</PermissionProvider>
```

---

## 🎨 Design da Tela de Permissões

### Layout Sugerido

```
┌─────────────────────────────────────────┐
│                                         │
│    🔐  (ícone grande)                   │
│                                         │
│    Permissões Necessárias               │
│    Para sua experiência completa        │
│                                         │
│    ───────────────────────────────      │
│                                         │
│    📥  Importar Módulos                 │
│       Comentários, dicionários, mapas   │
│                                         │
│    📖  Leitura Offline                  │
│       Acesse sem internet               │
│                                         │
│    ☁️  Backup Automático                │
│       Salve na nuvem                    │
│                                         │
│    ───────────────────────────────      │
│                                         │
│    [ Conceder Permissões ]  (botão)     │
│    [ Depois ]               (link)      │
│                                         │
└─────────────────────────────────────────┘
```

### Estilo Visual

```typescript
// Cores
bg-bible-bg (fundo)
text-bible-text (texto principal)
text-bible-text/60 (texto secundário)
bg-bible-accent (botão primário)
text-bible-accent (links)

// Tipografia
font-display (títulos)
bible-text (corpo)
ui-text (UI)

// Efeitos
shadow-2xl
rounded-[40px]
backdrop-blur
```

---

## 🧪 Critérios de Aceite

### ✅ Onboarding com Permissões

- [ ] Onboarding mostra 7 passos (era 6)
- [ ] Passo 7 é tela de permissões
- [ ] Botão "Conceder" abre diálogo do Android
- [ ] Botão "Depois" permite continuar sem permissão
- [ ] Design consistente com resto do app
- [ ] Animações suaves entre passos

### ✅ Verificação Automática

- [ ] App verifica permissões ao iniciar
- [ ] Primeira vez: mostra onboarding completo
- [ ] Segundas vezes: verifica silently
- [ ] Permissão negada: mostra opção de abrir configurações

### ✅ ModuleManagement

- [ ] Verifica permissão ao abrir
- [ ] Sem permissão: mostra botão "Conceder Permissão"
- [ ] Com permissão: permite importar normalmente
- [ ] Feedback visual claro (erro/sucesso)

### ✅ Tratamento de Erros

- [ ] Permissão negada permanentemente: abre configurações
- [ ] Erro desconhecido: mensagem amigável
- [ ] Storage cheio: alerta específico
- [ ] Logs para debug

---

## 📚 Arquivos a Criar/Modificar

### Criar (Novos)

| Arquivo | Descrição | Prioridade |
|---------|-----------|------------|
| `src/components/PermissionScreen.tsx` | Tela de permissões | 🔴 ALTA |
| `src/hooks/usePermissions.ts` | Hook reutilizável | 🟡 MÉDIA |
| `src/context/PermissionContext.tsx` | Contexto global | 🟢 BAIXA |

### Modificar (Existentes)

| Arquivo | Mudança | Prioridade |
|---------|---------|------------|
| `src/components/Onboarding.tsx` | Adicionar passo 7 | 🔴 ALTA |
| `src/components/ModuleManagement.tsx` | Verificação automática | 🔴 ALTA |
| `src/App.tsx` | Verificação ao iniciar | 🔴 ALTA |
| `src/services/permissionsService.ts` | Já está completo | ✅ OK |

---

## 🚀 Ordem de Implementação

```
1. Criar PermissionScreen.tsx          (30 min)
2. Integrar com Onboarding.tsx         (20 min)
3. Atualizar ModuleManagement.tsx      (20 min)
4. Adicionar verificação no App.tsx    (15 min)
5. Criar hook usePermissions.ts        (15 min) - opcional
6. Testar em emulador Android 13+      (30 min)
7. Testar em Android 6-12              (15 min)
8. Ajustes finais                      (15 min)

Tempo estimado: 2h 40min
```

---

## 🧪 Plano de Testes

### Teste 1: Primeira Instalação (Android 13+)

```
1. Instalar app pela primeira vez
2. Abrir app
3. Completar onboarding (passos 1-6)
4. Passo 7: Tela de permissões aparece
5. Clicar "Conceder Permissões"
6. Sistema Android solicita permissão
7. Permitir
8. Onboarding completa
9. App mostra home
10. Ir em Configurações → Módulos
11. Importar módulo MySword
12. ✅ Módulo importado com sucesso
```

### Teste 2: Permissão Negada

```
1. Instalar app
2. Completar onboarding
3. Passo 7: Tela de permissões
4. Clicar "Depois"
5. Onboarding completa
6. Ir em Configurações → Módulos
7. Tentar importar módulo
8. App mostra mensagem "Permissão necessária"
9. Clicar "Conceder Permissão"
10. Abre configurações do Android
11. Conceder permissão manualmente
12. Voltar ao app
13. ✅ Importar módulo funciona
```

### Teste 3: Segunda Abertura (Android 13+)

```
1. App já foi aberto antes
2. Permissão já foi concedida
3. Abrir app novamente
4. ✅ Não mostra onboarding
5. ✅ Permissão verificada silently
6. ✅ Módulos acessíveis
```

### Teste 4: Compatibilidade (Android 6-12)

```
1. Instalar em Android 11
2. Completar onboarding
3. Passo 7: Tela de permissões (adaptada)
4. Conceder permissão
5. ✅ Importar módulo funciona
6. ✅ Sem erros de API incompatível
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Usuários com permissão | ~50% | ~85% | +35% |
| Importação de módulos | ~20% | ~60% | +40% |
| Erros de permissão | Altos | Baixos | -80% |
| Satisfação (UX) | Média | Alta | +50% |

---

## 🔧 Comandos de Build

```bash
# Build web
npm run build

# Sincronizar Android
npx cap sync android

# Abrir Android Studio
npx cap open android

# Build APK de teste
cd android
.\gradlew assembleDebug

# Instalar no dispositivo
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Logcat em tempo real
adb logcat | Select-String "permissions|ModuleManagement|Onboarding"
```

---

## 🎯 Entregáveis

### Código

- [ ] `src/components/PermissionScreen.tsx`
- [ ] `src/hooks/usePermissions.ts` (opcional)
- [ ] `src/context/PermissionContext.tsx` (opcional)
- [ ] `src/components/Onboarding.tsx` (atualizado)
- [ ] `src/components/ModuleManagement.tsx` (atualizado)
- [ ] `src/App.tsx` (atualizado)

### Testes

- [ ] Testado em Android 13+
- [ ] Testado em Android 6-12
- [ ] Testado em Web (fallback)
- [ ] Build sem erros

### Documentação

- [ ] README atualizado
- [ ] Comentários no código
- [ ] Guia de permissões

---

## 📞 Suporte

**Dúvidas técnicas:**
- AndroidManifest.xml: Ver `PERMISSOES-ARMAZENAMENTO.md`
- permissionsService.ts: Ver `PERMISSIONS-SERVICE.md`
- Onboarding: Ver código existente em `Onboarding.tsx`

**Referências:**
- androidbible-develop: Fluxo similar (fora do workspace)
- YouVersion: Onboarding de permissões
- Dwell: UX de primeiro acesso

---

**Status:** 📋 Aguardando implementação  
**Próximo passo:** Executar `/create` para iniciar implementação  
**Responsável:** mobile-developer + android-kotlin-specialist
