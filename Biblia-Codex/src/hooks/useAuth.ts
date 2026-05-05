import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  auth, 
  loginWithGoogle as firebaseLoginWithGoogle, 
  logout as firebaseLogout,
  handleRedirectResult,
  googleProvider,
  User,
  onAuthStateChanged
} from '../firebase';

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

export interface UseAuthReturn {
  user: User | null;
  state: AuthState;
  error: AuthError | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  retryLogin: () => Promise<void>;
  clearError: () => void;
}

const getErrorFromCode = (error: any): AuthError => {
  const errorMap: Record<string, { message: string; details?: string }> = {
    'auth/popup-closed-by-user': {
      message: 'Login cancelado',
      details: 'Você fechou a janela de login antes de completar a autenticação.'
    },
    'auth/popup-blocked': {
      message: 'Popup bloqueado',
      details: 'Seu navegador bloqueou a janela de login. Permita popups para este site.'
    },
    'auth/cancelled-popup-request': {
      message: 'Múltiplas solicitações',
      details: 'Uma solicitação de login já está em andamento.'
    },
    'auth/operation-not-allowed': {
      message: 'Operação não permitida',
      details: 'O método de login está desabilitado. Entre em contato com o suporte.'
    },
    'auth/unauthorized-domain': {
      message: 'Domínio não autorizado',
      details: 'Este domínio não está configurado para autenticação no Firebase.'
    },
    'auth/network-request-failed': {
      message: 'Erro de conexão',
      details: 'Falha na conexão com a internet. Verifique sua conexão e tente novamente.'
    },
    'auth/timeout': {
      message: 'Tempo esgotado',
      details: 'A solicitação de login expirou. Tente novamente.'
    },
    'auth/user-disabled': {
      message: 'Conta desabilitada',
      details: 'Sua conta foi desabilitada. Entre em contato com o suporte.'
    },
    'auth/user-not-found': {
      message: 'Usuário não encontrado',
      details: 'Nenhuma conta encontrada com este email.'
    },
    'auth/wrong-password': {
      message: 'Senha incorreta',
      details: 'A senha inserida está incorreta.'
    },
    'auth/email-already-in-use': {
      message: 'Email em uso',
      details: 'Este email já está cadastrado.'
    },
    'auth/requires-recent-login': {
      message: 'Reautenticação necessária',
      details: 'Por segurança, faça login novamente para continuar.'
    },
  };

  const code = error?.code || 'unknown';
  return errorMap[code] || { 
    message: 'Erro de autenticação', 
    details: error?.message || 'Ocorreu um erro inesperado durante o login.' 
  };
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AuthState>('idle');
  const [error, setError] = useState<AuthError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const isFirebaseConfigured = useMemo(() => {
    return !!(auth && import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setState('idle');
      return;
    }

    setState('loading');

    const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setState('authenticated');
        setError(null);
      } else {
        setUser(null);
        setState('unauthenticated');
      }
    });

    // Check for redirect result on mount
    handleRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
          setState('authenticated');
        } else {
          // No redirect, check if we already have a user
          onAuthStateChanged(auth!, (currentUser) => {
            if (currentUser) {
              setUser(currentUser);
              setState('authenticated');
            } else {
              setState('unauthenticated');
            }
          });
        }
      })
      .catch((err) => {
        console.error('Error handling redirect result:', err);
        setState('unauthenticated');
      });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  const login = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setError({
        code: 'firebase-not-configured',
        message: 'Firebase não configurado',
        details: 'Configure as variáveis de ambiente VITE_FIREBASE_* para ativar o login.'
      });
      setState('error');
      return;
    }

    setState('loading');
    setError(null);

    try {
      await firebaseLoginWithGoogle();
      // State will be updated by onAuthStateChanged listener
    } catch (err: any) {
      const authError = getErrorFromCode(err);
      setError(authError);
      setState('error');
      throw err;
    }
  }, [isFirebaseConfigured]);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setState('unauthenticated');
      return;
    }

    setState('loading');
    setError(null);

    try {
      await firebaseLogout();
      setUser(null);
      setState('unauthenticated');
    } catch (err: any) {
      const authError = getErrorFromCode(err);
      setError(authError);
      setState('error');
      throw err;
    }
  }, [isFirebaseConfigured]);

  const retryLogin = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    await login();
    setIsRetrying(false);
  }, [login]);

  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error') {
      setState(user ? 'authenticated' : 'unauthenticated');
    }
  }, [state, user]);

  return {
    user,
    state,
    error,
    isAuthenticated: state === 'authenticated',
    isLoading: state === 'loading' || isRetrying,
    login,
    logout,
    retryLogin,
    clearError
  };
}

// Hook para verificar se o Firebase está configurado
export function useFirebaseStatus() {
  const isConfigured = useMemo(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = !import.meta.env.VITE_FIREBASE_PROJECT_ID;
    return !!(apiKey && !projectId);
  }, []);

  const isPartialConfigured = useMemo(() => {
    return !!(import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_PROJECT_ID);
  }, []);

  return {
    isConfigured,
    isPartialConfigured,
    hasAuth: isConfigured,
  };
}

// Hook para proteção de rotas autenticadas
export function useAuthGuard(required: boolean = true) {
  const { isAuthenticated, isLoading } = useAuth();
  
  const shouldShowContent = useMemo(() => {
    if (isLoading) return false;
    if (required) return isAuthenticated;
    return true; // For optional auth, always show content
  }, [isLoading, isAuthenticated, required]);

  return {
    isLoading,
    isAuthenticated,
    shouldShowContent,
    hasAccess: required ? isAuthenticated : true
  };
}