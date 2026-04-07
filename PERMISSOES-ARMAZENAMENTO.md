# 🔐 Permissões de Armazenamento - Android 13+

## 📋 Problema

Ao instalar o APK da Bíblia Kerygma em dispositivos com **Android 13 ou superior**, os usuários não conseguiam importar módulos MySword/MyBible devido à falta de permissão de armazenamento.

### Causa Raiz

O **Android 13 (API 33+)** introduziu mudanças significativas nas permissões de armazenamento:

| Versão Android | Permissões | Comportamento |
|---------------|-----------|---------------|
| **Android 6-12** (API 23-32) | `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | Acesso amplo ao storage |
| **Android 13+** (API 33+) | `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO` | Scoped Storage - acesso restrito |

### Erro Antigo

```xml
<!-- ❌ NÃO FUNCIONA no Android 13+ -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## ✅ Solução Implementada

### 1. AndroidManifest.xml Atualizado

**Arquivo:** `android/app/src/main/AndroidManifest.xml`

```xml
<!-- Android 13+ (API 33+) - Media permissions -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

<!-- Android 6-12 (API 23-32) - Legacy storage (deprecated in API 33+) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />
```

### 2. Serviço de Permissões

**Arquivo:** `src/services/permissionsService.ts`

```typescript
// Verifica e solicita permissão de armazenamento
export const ensureStoragePermission = async (): Promise<boolean> => {
  const status = await checkStoragePermission();
  
  if (status.canAccessStorage) {
    return true;
  }

  const result = await requestStoragePermission();
  return result.canAccessStorage;
};
```

### 3. Componente ModuleManagement Atualizado

**Arquivo:** `src/components/ModuleManagement.tsx`

```typescript
const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Verifica/solicita permissão antes de importar
  if (Platform.is('android')) {
    const hasPermission = await ensureStoragePermission();
    if (!hasPermission) {
      setError('Permissão de armazenamento negada.');
      return;
    }
  }

  // ... importa o módulo
};
```

### 4. File Provider Configuration

**Arquivo:** `android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Documents directory for module files -->
    <external-files-path name="documents" path="Documents" />
    
    <!-- Kerygma modules directory -->
    <external-files-path name="kerygma_modules" path="Kerygma/modules" />
</paths>
```

---

## 🛠️ Como Testar

### Pré-requisitos
- Dispositivo Android 13+ ou emulador
- APK compilado com as novas configurações

### Passos

1. **Instale o APK**
   ```bash
   npm run cap:sync
   npm run cap:open
   # No Android Studio: Run > Run 'app'
   ```

2. **Abra o app** e vá para **Configurações > Módulos**

3. **Toque em "Importar"**

4. **Se for Android 13+:**
   - Diálogo de permissão aparecerá
   - Toque em "Conceder Permissão"
   - O sistema solicitará acesso aos arquivos
   - Permita o acesso

5. **Selecione um módulo** (.mybible, .mybl, .sqlite3, etc.)

6. **Verifique se:**
   - ✅ O módulo foi importado
   - ✅ Aparece na lista "Instalados"
   - ✅ Funciona na Bíblia

---

## 📱 Fluxo de Permissão

```
┌─────────────────────────────────────────────────────────┐
│  Usuário toca em "Importar Módulo"                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ensureStoragePermission() é chamado                    │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────┐
        │  Android 13+?                 │
        └───────────────────────────────┘
           ↓                    ↓
         SIM                   NÃO
           ↓                    ↓
    ┌─────────────┐      ┌─────────────┐
    │ Request     │      │ Request     │
    │ Media       │      │ Storage     │
    │ Permissions │      │ (Legacy)    │
    └─────────────┘      └─────────────┘
           ↓                    ↓
           └────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Permissão Concedida?  │
        └───────────────────────┘
           ↓                    ↓
         SIM                   NÃO
           ↓                    ↓
    ┌─────────────┐      ┌─────────────┐
    │ Importa     │      │ Mostra      │
    │ Módulo      │      │ Erro        │
    └─────────────┘      └─────────────┘
```

---

## 🔍 Debug

### Verificar Permissões via ADB

```bash
# Verificar permissões do app
adb shell dumpsys package com.kerygma.biblia | grep permission

# Conceder permissão manualmente (Android 13+)
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_IMAGES
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_VIDEO
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_AUDIO

# Conceder permissão manualmente (Android 6-12)
adb shell pm grant com.kerygma.biblia android.permission.READ_EXTERNAL_STORAGE
adb shell pm grant com.kerygma.biblia android.permission.WRITE_EXTERNAL_STORAGE

# Verificar status das permissões
adb shell appops get com.kerygma.biblia READ_EXTERNAL_STORAGE
adb shell appops get com.kerygma.biblia WRITE_EXTERNAL_STORAGE
```

### Logs do App

No **Logcat** (Android Studio), filtre por:

```
tag:permissionsService
tag:ModuleManagement
tag:Filesystem
```

### Verificar Versão do Android

```typescript
const androidVersion = parseInt(
  (window.navigator as any).userAgent?.match(/Android (\d+)/)?.[1] || '0',
  10
);
console.log('Android version:', androidVersion);
```

---

## 🚨 Problemas Comuns

### 1. "Permissão negada" mesmo após conceder

**Solução:**
- Verifique se o `AndroidManifest.xml` está correto
- Limpe e reconstrua o projeto:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npm run cap:sync
  ```

### 2. "Arquivo não encontrado" após importação

**Solução:**
- Verifique `file_paths.xml`
- Certifique-se de que o diretório `Documents/Kerygma/modules` existe
- Use o **Device File Explorer** no Android Studio

### 3. Funciona no Android 12, mas não no 13+

**Solução:**
- Verifique se `maxSdkVersion="32"` está nas permissões legacy
- Certifique-se de que `READ_MEDIA_*` estão declaradas
- Teste o fluxo de permissão em tempo de execução

---

## 📚 Referências

- [Android 13 Storage Changes](https://developer.android.com/about/versions/13/changes/storage-permission-changes)
- [Scoped Storage](https://developer.android.com/training/data-storage)
- [Capacitor Filesystem](https://capacitorjs.com/docs/apis/filesystem)
- [Requesting Permissions](https://developer.android.com/guide/topics/permissions/requesting)

---

## ✅ Checklist de Verificação

- [ ] `AndroidManifest.xml` atualizado
- [ ] `file_paths.xml` configurado
- [ ] `permissionsService.ts` implementado
- [ ] `ModuleManagement.tsx` usa verificação de permissão
- [ ] Diálogo de permissão aparece no Android 13+
- [ ] Importação funciona após conceder permissão
- [ ] Módulos aparecem na lista após importação
- [ ] APK compilado e assinado
- [ ] Testado em Android 13+
- [ ] Testado em Android 6-12 (compatibilidade)

---

## 🔄 Build e Deploy

```bash
# 1. Sincronizar Capacitor
npm run build
npx cap sync android

# 2. Abrir Android Studio
npx cap open android

# 3. No Android Studio:
#    - Build > Clean Project
#    - Build > Rebuild Project
#    - Run > Run 'app'

# 4. Gerar APK de release
cd android
./gradlew assembleRelease

# APK gerado em: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

**Última atualização:** 2026-03-25
**Versão:** 1.0.0
**Responsável:** Agente Autônomo
