import { useState, useEffect, useCallback } from 'react';
import {
  checkStoragePermission,
  requestStoragePermission,
  ensureStoragePermission,
  getPermissionInfo,
  getPermissionErrorMessage,
  testStorageAccess,
  type PermissionStatus
} from '../services/permissionsService';
import { Capacitor } from '@capacitor/core';

interface UsePermissionsResult {
  /** Status atual da permissão */
  status: PermissionStatus | null;
  /** Se está carregando */
  loading: boolean;
  /** Se tem permissão concedida */
  granted: boolean;
  /** Se é Android nativo */
  isAndroid: boolean;
  /** Mensagem de erro (se houver) */
  error: string | null;
  /** Verifica permissões */
  check: () => Promise<void>;
  /** Solicita permissão */
  request: () => Promise<boolean>;
  /** Verifica e solicita se necessário */
  ensure: () => Promise<boolean>;
  /** Testa acesso ao storage */
  testAccess: () => Promise<boolean>;
  /** Limpa erro */
  clearError: () => void;
}

/**
 * Hook React para gerenciamento de permissões de armazenamento
 * 
 * @example
 * ```typescript
 * const { granted, loading, check, request } = usePermissions();
 * 
 * useEffect(() => {
 *   if (granted) {
 *     // Pode importar módulos
 *   }
 * }, [granted]);
 * ```
 */
export const usePermissions = (): UsePermissionsResult => {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  /**
   * Verifica o status atual das permissões
   */
  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkStoragePermission();
      setStatus(result);
      
      if (!result.canAccessStorage && result.storage === 'denied') {
        setError(getPermissionErrorMessage(result));
      }
    } catch (err: any) {
      console.error('Erro ao verificar permissão:', err);
      setError('Não foi possível verificar as permissões');
      setStatus({
        storage: 'unknown',
        canAccessStorage: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Solicita permissão ao usuário
   * @returns true se concedida, false se negada
   */
  const request = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestStoragePermission();
      setStatus(result);
      
      if (!result.canAccessStorage) {
        setError(getPermissionErrorMessage(result));
      }
      
      return result.canAccessStorage;
    } catch (err: any) {
      console.error('Erro ao solicitar permissão:', err);
      setError('Não foi possível solicitar permissão');
      setStatus({
        storage: 'denied',
        canAccessStorage: false,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica e solicita permissão se necessário
   * @returns true se tem permissão, false caso contrário
   */
  const ensure = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const granted = await ensureStoragePermission();
      
      if (!granted) {
        setError('Permissão de armazenamento necessária');
      }
      
      // Atualiza status após ensure
      const status = await checkStoragePermission();
      setStatus(status);
      
      return granted;
    } catch (err: any) {
      console.error('Erro ao garantir permissão:', err);
      setError('Erro ao garantir permissão');
      setStatus({
        storage: 'unknown',
        canAccessStorage: false,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Testa se o acesso ao storage está funcionando
   */
  const testAccess = useCallback(async (): Promise<boolean> => {
    const works = await testStorageAccess();
    if (!works) {
      setError('Teste de acesso ao storage falhou');
    }
    return works;
  }, []);

  /**
   * Limpa o erro atual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Verifica permissões ao montar o componente
   */
  useEffect(() => {
    check();
  }, [check]);

  const granted = status?.canAccessStorage ?? false;

  return {
    status,
    loading,
    granted,
    isAndroid,
    error,
    check,
    request,
    ensure,
    testAccess,
    clearError,
  };
};
