---
name: kerygma-capacitor-permissions
description: Android 13+ storage/media permissions guidelines for the web/capacitor Biblia Kerygma app. Using the custom usePermissions hook and PermissionScreen components in onboarding loops.
---

# Biblia Kerygma - Android Capacitor Permissions

This skill guides the implementation of permission requests natively on Android when operating through the Capacitor wrapper, specifically targeting the storage constraints introduced with Android 13+.

## 🛠 Permission Flow Architecture

1. **Permission Hook (`src/hooks/usePermissions.ts`)**
   - The primary entry point for managing Android external reading permissions (`@capacitor/android`, `@capacitor/filesystem`).
   - You MUST utilize `const { granted, check, request, ensure } = usePermissions();` in any view needing OS access (ex. importing database blobs, `.pdf`/`.docx` generator services).

2. **Onboarding Integration (`src/components/Onboarding.tsx`)**
   - Keep permissions as the Final onboarding step (Step 7: `PermissionScreen.tsx`).
   - The app actively monitors whether `hasLaunched` exists locally in JSON logic, rendering onboarding if false. Wait until Step 7 to gracefully prompt the user for directory access so that feature benefits are highlighted first.

3. **Global Permission Checks (`src/App.tsx`)**
   - Utilize Capacitor's `Capacitor.getPlatform()` checking explicitly for Android `isAndroid === true`. Ensure web instances do not aggressively demand native OS permissions since they utilize the browser's implicit sandboxed directories.
   - For modules (`src/components/ModuleManagement.tsx`), intercept initialization. Do not show raw OS dialogs. ALWAYS trigger the premium `PermissionScreen` component or the defined dialog with three native buttons (`Depois`, `Abrir Configurações`, `Conceder Permissão`).

## 🤝 Fallback Flow
- Always implement the fallback function `openAppSettings()`. If permission states return `denied`, Android 13+ prevents standard loop requests. The App Settings menu must intercept the manual override.
