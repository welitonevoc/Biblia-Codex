---
name: capacitor-android-sync
description: Atualiza o app Android Capacitor com as mudanças web e valida o build nativo
triggers: web.change, capacitor.sync, android.preview
---

# Workflow: Capacitor Android Sync

## Quando usar

- Após qualquer mudança em `src/`, `public/`, `index.css` ou componentes da UI web
- Antes de entregar uma versão Android atualizada para teste
- Sempre que o `dist/` tiver mudado e o app nativo ainda estiver desatualizado

## Fluxo recomendado

### 1. Validar TypeScript/Web

```bash
npm run lint
```

### 2. Gerar novo build web

```bash
npm run build
```

### 3. Sincronizar com o projeto Android

```bash
npx cap sync android
```

Isso atualiza:

- `android/app/src/main/assets/public`
- `android/app/src/main/assets/capacitor.config.json`
- plugins do Capacitor no projeto Android

### 4. Validar build nativo

```bash
cd android
./gradlew assembleDebug --stacktrace
```

## Checklist

- [ ] `npm run lint` passou
- [ ] `npm run build` gerou `dist/` novo
- [ ] `npx cap sync android` concluiu sem erro
- [ ] `android/app/src/main/assets/public` recebeu os assets novos
- [ ] `./gradlew assembleDebug --stacktrace` passou
- [ ] APK debug gerado com sucesso

## Saída esperada

APK debug em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
