---
name: codex-web-architecture
description: Architecture, State Management, and Build patterns for the Biblia Codex React+Capacitor App. Use this when developing new UI components, configuring the build process, managing global state, or writing storage logic. Triggers on Codex, Tailwind 4, Capacitor build, IDB, React 19.
---

# Biblia Codex - Web/Mobile Architecture 

This skill defines the structural patterns, technology stack, and best practices exclusively for the **Biblia Codex** application (React + Capacitor hybrid).

## 🛠 Tech Stack

1. **Frontend Core:** React 19 (hooks and Context API), TypeScript.
2. **Build Tool:** Vite + `tsx` (for dev server/API).
3. **Styling:** Tailwind CSS 4, `framer-motion` (animations), `lucide-react` (icons), `clsx` + `tailwind-merge` for class utility.
4. **Offline Database & Storage:** `sql.js` (for SQLite modules) and `idb` (for IndexedDB native app caching).
5. **Mobile Wrapping:** Capacitor 6 (Core, Android, Filesystem plugins).

## 🏗 Architectural Rules

### 1. State Management (No Redux)
- **Do NOT** introduce external complex state managers like Redux or Zustand unless explicitly requested.
- **DO** use React Context (`AppContext.tsx`) combined with Hooks (`useContext`, `useReducer`, `useState`) for global states.

### 2. Styling Patterns (Tailwind 4 + UI Libraries)
- Utilize the `clsx` and `tailwind-merge` utility for dynamic class names: `className={twMerge(clsx("base", dynamicCondition && "active"))}`
- Component designs must follow the Codex application's unified premium aesthetic (clean contrasts, dark mode support in Tailwind).
- For animations, strictly rely on `framer-motion` properties (`initial`, `animate`, `exit`).

### 3. File Execution & Scripts
- Always prefer Vite native plugins for React (`@vitejs/plugin-react`).
- Android builds rely on: `npm run cap:sync` and `npx cap run android`. When adding a new Capacitor plugin, do not forget to document the required Android XML changes (Manifest permissions).

### 4. Background Processing (SQLite & IDB)
- **Blobs & WASM:** Ensure `sql.js` initializes with the correct WASM path (usually handled in the public directory).
- Heavy database processes like searching through the entire Bible must not block the main JS thread. While `idb` operations are natively asynchronous, `sql.js` queries on large module datasets may require splitting work or utilizing WebWorkers/`requestAnimationFrame` if performance becomes a bottleneck.

## 🤝 Agent Interaction
- **mobile-developer / frontend-specialist:** Rely on this skill file instead of traditional Android Kotlin documents when modifying the core app UX/UI.
