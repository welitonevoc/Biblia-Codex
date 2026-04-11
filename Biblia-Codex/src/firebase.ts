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

// ── Configuração do Firebase via variáveis de ambiente ─────────────────────────
// Para desenvolvimento local, crie um arquivo .env.local com:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// etc.
//
// Para produção no Vercel, configure as variáveis de ambiente no painel do Vercel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Verificar se as variáveis de ambiente estão configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '⚠️ Configuração do Firebase ausente. ' +
    'Crie um arquivo .env.local com as variáveis VITE_FIREBASE_* ou ' +
    'configure no painel do Vercel para produção.'
  );
}

// ── Inicialização ──────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);

// Usar o ID do banco de dados do ambiente ou padrão
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'consent select_account',
});

let currentAccessToken: string | null = null;

const persistGoogleAccessToken = (accessToken?: string | null) => {
  currentAccessToken = accessToken || null;
};

export const getStoredGoogleAccessToken = (): string | null => {
  return currentAccessToken;
};

export const clearStoredGoogleAccessToken = (): void => {
  currentAccessToken = null;
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
export { onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, serverTimestamp };
export type { User };
