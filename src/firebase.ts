import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';

// ── Inicialização ──────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const GOOGLE_ACCESS_TOKEN_KEY = 'codex-google-access-token';

googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'consent select_account',
});

const persistGoogleAccessToken = (accessToken?: string | null) => {
  if (!accessToken) return;
  localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, accessToken);
};

export const getStoredGoogleAccessToken = (): string | null => {
  return localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
};

export const clearStoredGoogleAccessToken = (): void => {
  localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
};

// ── Login com Google ───────────────────────────────────────────────────────────
//
// ✅ CAPACITOR — usamos signInWithRedirect em vez de signInWithPopup.
//
// O WebView do Android bloqueia popups de OAuth, então signInWithPopup falha
// silenciosamente em APKs. Com signInWithRedirect:
//   1. O usuário é redirecionado para a tela de login do Google.
//   2. Ao voltar, chame handleRedirectResult() uma vez na inicialização do app.
//
export const loginWithGoogle = async (): Promise<void> => {
  try {
    // ✅ CAPACITOR — usamos signInWithRedirect apenas em ambiente nativo.
    // No navegador (localhost), usamos signInWithPopup para melhor UX.
    const isNative = (window as any).Capacitor?.isNative;

    if (isNative) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      persistGoogleAccessToken(credential?.accessToken);
    }
  } catch (error) {
    console.error('Erro ao iniciar login com Google:', error);
    throw error;
  }
};

// Chame esta função UMA VEZ no componente raiz (App.tsx) dentro de um useEffect.
// Ela captura o usuário que retornou do fluxo de redirect.
//
// Exemplo de uso no App.tsx:
//   useEffect(() => {
//     handleRedirectResult().then(user => {
//       if (user) console.log('Logado via redirect:', user.email);
//     });
//   }, []);
//
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    const credential = result ? GoogleAuthProvider.credentialFromResult(result) : null;
    persistGoogleAccessToken(credential?.accessToken);
    return result?.user ?? null;
  } catch (error) {
    console.error('Erro ao capturar resultado do redirect:', error);
    return null;
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    clearStoredGoogleAccessToken();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// ── Re-exports para compatibilidade com o restante do código ──────────────────
export { onAuthStateChanged };
export type { User };
