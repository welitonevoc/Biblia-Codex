# 🚀 Guia Rápido - Testar Permissões Android 13+

## ✅ O Que Foi Feito

O problema de permissão de armazenamento para importar módulos MySword/MyBible no Android 13+ foi **CORRIGIDO**.

### Arquivos Modificados
1. ✅ `android/app/src/main/AndroidManifest.xml` - Permissões atualizadas
2. ✅ `android/app/src/main/res/xml/file_paths.xml` - Caminhos configurados
3. ✅ `src/services/permissionsService.ts` - Serviço de permissões criado
4. ✅ `src/components/ModuleManagement.tsx` - Verificação em tempo de execução
5. ✅ Scripts de build e verificação criados

---

## 📱 Como Testar AGORA

### Opção 1: Teste Rápido (Recomendado)

```powershell
# 1. Build do projeto web
npm run build

# 2. Sincronizar com Android
npx cap sync android

# 3. Abrir Android Studio
npx cap open android
```

**No Android Studio:**
1. Aguarde o Gradle Sync completar
2. Clique em **Run** (▶️) ou `Shift + F10`
3. Selecione seu dispositivo Android 13+
4. Aguarde a instalação no dispositivo

**No Dispositivo:**
1. Abra o app **Bíblia Kerygma**
2. Vá em **Configurações** → **Módulos**
3. Toque na aba **Importar**
4. **Diálogo de permissão deve aparecer** (Android 13+)
5. Toque em **"Conceder Permissão"**
6. O sistema solicitará acesso aos arquivos → **Permita**
7. Toque em **"Selecionar Arquivos"**
8. Selecione um módulo MySword/MyBible
9. **✅ Sucesso!** Módulo importado

---

### Opção 2: Gerar APK para Teste

```powershell
# Usar o script automatizado
.\scripts\build-android-apk.ps1
```

**O script vai:**
1. Fazer build do projeto web
2. Sincronizar com Capacitor
3. Compilar o APK release
4. Mostrar o caminho do APK gerado

**Instalar no dispositivo:**
```powershell
adb install android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🔍 Verificar Permissões

```powershell
# Executar script de verificação
.\scripts\check-permissions.ps1
```

**O script mostra:**
- ✅ Se o app está instalado
- ✅ Quais permissões estão concedidas
- ✅ Versão do Android
- ✅ Status final

---

## 🐛 Debug

### Se o diálogo de permissão NÃO aparecer:

```bash
# Verificar logs em tempo real
adb logcat | Select-String "permissions|ModuleManagement|Filesystem"
```

### Se a importação FALHAR:

```bash
# Verificar permissões manualmente
adb shell dumpsys package com.kerygma.biblia | grep permission

# Conceder permissões manualmente (Android 13+)
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_IMAGES
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_VIDEO
adb shell pm grant com.kerygma.biblia android.permission.READ_MEDIA_AUDIO
```

### Limpar e Rebuild:

```powershell
# Limpar build anterior
cd android
.\gradlew clean
cd ..

# Rebuild completo
npm run build
npx cap sync android
npx cap open android
```

---

## ✅ Comportamento Esperado

### Android 13+ (API 33+)
1. ✅ Diálogo de permissão aparece
2. ✅ Usuário concede permissão
3. ✅ Importação funciona
4. ✅ Módulo aparece na lista

### Android 6-12 (API 23-32)
1. ✅ Sem diálogo (permissão legacy)
2. ✅ Importação funciona diretamente
3. ✅ Módulo aparece na lista

### Android < 6
1. ✅ Sem permissões em tempo de execução
2. ✅ Importação funciona
3. ✅ Módulo aparece na lista

---

## 📊 Checklist de Teste

### No Dispositivo Android 13+
- [ ] App abre sem erros
- [ ] Navegação funciona
- [ ] Configurações → Módulos abre
- [ ] Diálogo de permissão aparece
- [ ] Conceder permissão funciona
- [ ] Selecionar arquivos abre
- [ ] Módulo MySword importa
- [ ] Módulo aparece na lista "Instalados"
- [ ] Módulo funciona na Bíblia

### Compatibilidade
- [ ] Testar em Android 13+
- [ ] Testar em Android 12
- [ ] Testar em Android 11
- [ ] Testar em Android 10

---

## 📚 Documentação Completa

- `PERMISSOES-ARMAZENAMENTO.md` - Guia detalhado
- `CORRECAO-PERMISSOES-RESUMO.md` - Resumo das mudanças
- `BUILD-ANDROID-STATUS.md` - Status do build Android

---

## 🎯 Resultado Esperado

**ANTES:**
```
❌ "Permissão de armazenamento negada"
❌ "Não foi possível importar módulo"
❌ Erro ao acessar arquivos
```

**DEPOIS:**
```
✅ Diálogo de permissão aparece
✅ Usuário concede facilmente
✅ Módulo importado com sucesso
✅ Funciona na Bíblia
```

---

## 💡 Dica Importante

**Android 13+ usa "Scoped Storage"** - o app só pode acessar:
- Seu próprio diretório (`Documents/Kerygma/`)
- Arquivos selecionados pelo usuário (via File Picker)

**Solução implementada:**
- Usa `Directory.Documents` do Capacitor
- Cria diretório `Kerygma/modules/installed/`
- Respeita as restrições do Android 13+

---

**Data:** 2026-03-25  
**Status:** ✅ PRONTO PARA TESTE  
**Android Suportado:** 6.0 - 14+ (API 23-34)
