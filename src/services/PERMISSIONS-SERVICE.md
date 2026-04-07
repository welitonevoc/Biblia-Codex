# 📜 permissionsService.ts - Documentação Completa

## 🎯 Visão Geral

Serviço completo para gerenciamento de permissões de armazenamento no Android, compatível com Android 6 a 14 (API 23-34).

---

## 📦 Funções Exportadas

### 1. `checkStoragePermission()`

Verifica o status atual das permissões de armazenamento.

**Retorno:** `Promise<PermissionStatus>`

```typescript
interface PermissionStatus {
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
  canAccessStorage: boolean;
  androidVersion?: number;
  apiLevel?: number;
}
```

**Exemplo de uso:**
```typescript
const status = await checkStoragePermission();
console.log(`Permissão: ${status.storage}`);
console.log(`Android ${status.androidVersion} (API ${status.apiLevel})`);
console.log(`Pode acessar: ${status.canAccessStorage}`);
```

**Comportamento por versão:**
- **Android 13+ (API 33+):** Verifica acesso ao diretório `Documents/Kerygma`
- **Android 6-12 (API 23-32):** Verifica permissão legacy
- **Android < 6:** Retorna `granted` automaticamente
- **Web/Outros:** Retorna `granted` automaticamente

---

### 2. `requestStoragePermission()`

Solicita permissão de armazenamento ao sistema.

**Retorno:** `Promise<PermissionStatus>`

**Exemplo de uso:**
```typescript
const result = await requestStoragePermission();
if (result.canAccessStorage) {
  console.log('Permissão concedida!');
} else {
  console.log('Permissão negada:', result.storage);
}
```

**Comportamento:**
- Tenta criar diretório `Documents/Kerygma`
- Se existir, retorna `granted`
- Se falhar por permissão, retorna `denied`
- Detecta automaticamente erros de permissão vs outros erros

---

### 3. `ensureStoragePermission()`

Verifica e solicita permissão se necessário (função principal).

**Retorno:** `Promise<boolean>`

**Exemplo de uso:**
```typescript
const hasPermission = await ensureStoragePermission();
if (hasPermission) {
  // Pode importar módulos
  await importModule(fileData, fileName);
} else {
  // Mostra erro ao usuário
  showError('Permissão negada');
}
```

**Fluxo:**
1. Verifica permissão atual
2. Se já tem, retorna `true`
3. Se não tem, solicita
4. Retorna resultado da solicitação

---

### 4. `openAppSettings()`

Abre as configurações do app no Android.

**Retorno:** `Promise<void>`

**Exemplo de uso:**
```typescript
try {
  await openAppSettings();
} catch (error) {
  console.error('Não foi possível abrir configurações');
}
```

**Notas:**
- Usa URI scheme `app-settings:` (Android)
- Funciona na maioria dos dispositivos Android
- Em alguns dispositivos, pode requerer plugin adicional

---

### 5. `getPermissionErrorMessage()`

Obtém mensagem de erro amigável baseada no status.

**Parâmetros:**
- `status: PermissionStatus`

**Retorno:** `string`

**Exemplo de uso:**
```typescript
const status = await checkStoragePermission();
if (!status.canAccessStorage) {
  const message = getPermissionErrorMessage(status);
  alert(message);
}
```

**Mensagens:**
- **Android 13+:** "Permissão de armazenamento negada. No Android 13+, é necessário conceder acesso aos arquivos de mídia."
- **Android 6-12:** "Permissão de armazenamento negada. Por favor, conceda nas configurações do app."
- **Unknown:** "Não foi possível verificar a permissão de armazenamento."

---

### 6. `getPermissionInfo()`

Obtém informações detalhadas sobre o status da permissão.

**Retorno:** `Promise<Object>`

```typescript
{
  status: PermissionStatus;
  isAndroid: boolean;
  needsPermission: boolean;
  canRequest: boolean;
  message: string;
}
```

**Exemplo de uso:**
```typescript
const info = await getPermissionInfo();
console.log('É Android:', info.isAndroid);
console.log('Precisa de permissão:', info.needsPermission);
console.log('Pode solicitar:', info.canRequest);
console.log('Mensagem:', info.message);
```

---

### 7. `testStorageAccess()`

Testa se consegue escrever e ler um arquivo de teste.

**Retorno:** `Promise<boolean>`

**Exemplo de uso:**
```typescript
const works = await testStorageAccess();
if (works) {
  console.log('Storage funcionando corretamente!');
} else {
  console.log('Problema com acesso ao storage');
}
```

**O que faz:**
1. Escreve arquivo `Kerygma/.test_permission`
2. Lê o arquivo
3. Verifica conteúdo
4. Deleta arquivo de teste
5. Retorna `true` se tudo funcionou

---

## 🔧 Funções Internas (Não Exportadas)

### `isAndroid()`

Verifica se está rodando em Android nativo.

**Retorno:** `boolean`

### `getAndroidVersion()`

Obtém a versão major do Android.

**Retorno:** `Promise<number>`

### `getApiLevel()`

Obtém o API Level do Android.

**Retorno:** `Promise<number>`

---

## 📱 Guia de Uso por Cenário

### Cenário 1: Importar Módulo

```typescript
import { ensureStoragePermission } from './services/permissionsService';

const handleImport = async (file: File) => {
  // Verifica e solicita permissão
  const hasPermission = await ensureStoragePermission();
  
  if (!hasPermission) {
    alert('Permissão necessária para importar módulos');
    return;
  }
  
  // Importa módulo
  await importModule(file);
};
```

---

### Cenário 2: Verificar Permissão ao Iniciar

```typescript
import { getPermissionInfo } from './services/permissionsService';

useEffect(() => {
  const checkPermissions = async () => {
    const info = await getPermissionInfo();
    
    if (info.needsPermission && info.isAndroid) {
      setShowPermissionDialog(true);
    }
  };
  
  checkPermissions();
}, []);
```

---

### Cenário 3: Botão "Abrir Configurações"

```typescript
import { openAppSettings } from './services/permissionsService';

const handleOpenSettings = async () => {
  try {
    await openAppSettings();
  } catch (error) {
    alert('Não foi possível abrir as configurações. Abra manualmente.');
  }
};

// No JSX:
<button onClick={handleOpenSettings}>
  Abrir Configurações
</button>
```

---

### Cenário 4: Debug/Diagnóstico

```typescript
import { 
  checkStoragePermission, 
  testStorageAccess,
  getPermissionErrorMessage 
} from './services/permissionsService';

const debugPermissions = async () => {
  console.log('=== DEBUG DE PERMISSÕES ===');
  
  const status = await checkStoragePermission();
  console.log('Status:', status);
  
  const works = await testStorageAccess();
  console.log('Teste de acesso:', works ? 'OK' : 'FALHOU');
  
  if (!status.canAccessStorage) {
    console.log('Erro:', getPermissionErrorMessage(status));
  }
  
  console.log('===========================');
};
```

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────┐
│  Usuário clica em "Importar Módulo"                     │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │ ensureStoragePermission()     │
        └───────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │ checkStoragePermission()      │
        └───────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │ canAccessStorage = true?      │
        └───────────────────────────────┘
           ↓                    ↓
         SIM                   NÃO
           ↓                    ↓
    ┌─────────────┐      ┌─────────────────────┐
    │ Retorna     │      │ requestStorage      │
    │ true        │      │ Permission()        │
    └─────────────┘      └─────────────────────┘
                                ↓
                      ┌─────────────────────┐
                      │ Tenta criar         │
                      │ Documents/Kerygma   │
                      └─────────────────────┘
                                ↓
                      ┌─────────────────────┐
                      │ Conseguiu?          │
                      └─────────────────────┘
                         ↓            ↓
                       SIM          NÃO
                         ↓            ↓
                  ┌──────────┐  ┌──────────┐
                  │ Retorna  │  │ Retorna  │
                  │ true     │  │ false    │
                  └──────────┘  └──────────┘
```

---

## 🔍 Tabela de Compatibilidade

| Android | Versão | API | Permissões Necessárias | Comportamento |
|---------|--------|-----|------------------------|---------------|
| Android 14 | 14 | 34 | READ_MEDIA_* | Scoped Storage |
| Android 13 | 13 | 33 | READ_MEDIA_* | Scoped Storage |
| Android 12 | 12 | 32 | READ/WRITE_EXTERNAL | Legacy |
| Android 11 | 11 | 30 | READ/WRITE_EXTERNAL | Legacy |
| Android 10 | 10 | 29 | READ/WRITE_EXTERNAL | Legacy |
| Android 9 | 9 | 28 | READ/WRITE_EXTERNAL | Legacy |
| Android 8 | 8 | 26-27 | READ/WRITE_EXTERNAL | Legacy |
| Android 7 | 7 | 24-25 | READ/WRITE_EXTERNAL | Legacy |
| Android 6 | 6 | 23 | READ/WRITE_EXTERNAL | Legacy |

---

## ⚠️ Tratamento de Erros

### Erros Comuns

```typescript
try {
  await ensureStoragePermission();
} catch (error) {
  // Erro 1: Permissão negada permanentemente
  if (error.message?.includes('denied')) {
    alert('Permissão negada. Abra nas configurações.');
  }
  
  // Erro 2: Storage cheio
  if (error.message?.includes('ENOSPC')) {
    alert('Armazenamento cheio. Libere espaço.');
  }
  
  // Erro 3: Diretório não existe
  if (error.message?.includes('ENOENT')) {
    alert('Diretório não encontrado.');
  }
  
  // Erro genérico
  console.error('Erro desconhecido:', error);
}
```

---

## 📚 Exemplo Completo no Componente

```typescript
import React, { useState, useEffect } from 'react';
import {
  ensureStoragePermission,
  openAppSettings,
  getPermissionErrorMessage,
  getPermissionInfo
} from './services/permissionsService';

export const ModuleImporter: React.FC = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const info = await getPermissionInfo();
    setPermissionGranted(info.status.canAccessStorage);
    
    if (!info.status.canAccessStorage && info.message) {
      setError(info.message);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await ensureStoragePermission();
    setPermissionGranted(granted);
    
    if (!granted) {
      setError('Permissão negada. Tente abrir as configurações.');
    } else {
      setError(null);
    }
  };

  const handleOpenSettings = async () => {
    await openAppSettings();
  };

  return (
    <div>
      {!permissionGranted ? (
        <div>
          <p>{error}</p>
          <button onClick={handleRequestPermission}>
            Conceder Permissão
          </button>
          <button onClick={handleOpenSettings}>
            Abrir Configurações
          </button>
        </div>
      ) : (
        <button onClick={handleImport}>
          Importar Módulo
        </button>
      )}
    </div>
  );
};
```

---

## 🎯 Melhores Práticas

1. **Sempre verifique antes de importar**
   ```typescript
   const hasPermission = await ensureStoragePermission();
   if (!hasPermission) return;
   ```

2. **Forneça feedback claro ao usuário**
   ```typescript
   const message = getPermissionErrorMessage(status);
   alert(message);
   ```

3. **Ofereça botão para configurações**
   ```typescript
   <button onClick={openAppSettings}>Configurações</button>
   ```

4. **Teste após conceder permissão**
   ```typescript
   const works = await testStorageAccess();
   if (!works) {
     // Algo ainda está errado
   }
   ```

5. **Log para debug**
   ```typescript
   const info = await getPermissionInfo();
   console.log('Permission info:', info);
   ```

---

## 📝 Histórico de Versões

- **1.0.0** - Versão inicial
  - `checkStoragePermission()`
  - `requestStoragePermission()`
  - `ensureStoragePermission()`
  - `openAppSettings()`
  - `getPermissionErrorMessage()`
  - `getPermissionInfo()`
  - `testStorageAccess()`

---

**Data:** 2026-03-25  
**Versão:** 1.0.0  
**Status:** ✅ Completo e testado
