/**
 * Serviço de Permissões para Android 13+ (API 33+)
 * Gerencia permissões de armazenamento de forma compatível
 *
 * Estratégia:
 * - Android 13+: Usar armazenamento interno do app (Directory.Data) por padrão
 * - Android 6-12: Usar armazenamento externo (Directory.Documents) com permissões legadas
 * - Fallback: Tentar ambos os diretórios durante importação
 */
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
  canAccessStorage: boolean;
  androidVersion?: number;
  apiLevel?: number;
  preferredDirectory?: 'internal' | 'external';
}

/**
 * Verifica se está rodando em Android
 */
const isAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

/**
 * Obtém a versão do Android de forma confiável
 */
const getAndroidVersion = async (): Promise<number> => {
  if (!isAndroid()) {
    return 0;
  }

  try {
    const uaMatch = (window.navigator as any).userAgent?.match(/Android (\d+)/);
    if (uaMatch && uaMatch[1]) {
      return parseInt(uaMatch[1], 10);
    }
    return 13; // Assume Android 13+ para segurança
  } catch (e) {
    console.warn('Não foi possível detectar versão do Android:', e);
    return 13;
  }
};

/**
 * Obtém o API Level do Android
 */
const getApiLevel = async (): Promise<number> => {
  if (!isAndroid()) {
    return 0;
  }

  try {
    const uaMatch = (window.navigator as any).userAgent?.match(/Android (\d+)/);
    if (uaMatch && uaMatch[1]) {
      const version = parseInt(uaMatch[1], 10);
      return 23 + (version - 6);
    }
    return 33;
  } catch (e) {
    return 33;
  }
};

/**
 * Verifica se o app tem permissão para acessar o armazenamento
 */
export const checkStoragePermission = async (): Promise<PermissionStatus> => {
  if (!isAndroid()) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion: 0,
      apiLevel: 0,
      preferredDirectory: 'internal',
    };
  }

  const androidVersion = await getAndroidVersion();
  const apiLevel = await getApiLevel();

  // Android 13+ usa armazenamento interno do app (Directory.Data) por padrão
  // Não requer permissões de mídia para arquivos de dados
  if (androidVersion >= 13 || apiLevel >= 33) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
      preferredDirectory: 'internal',
    };
  }

  try {
    // Para Android 12 e anteriores, tentamos listar um diretório para verificar
    try {
      await Filesystem.readdir({
        directory: Directory.Documents,
        path: 'Codex',
      });
      return {
        storage: 'granted',
        canAccessStorage: true,
        androidVersion,
        apiLevel,
        preferredDirectory: 'external',
      };
    } catch (e) {
      return {
        storage: 'prompt',
        canAccessStorage: false,
        androidVersion,
        apiLevel,
        preferredDirectory: 'external',
      };
    }
  } catch (error) {
    return {
      storage: 'unknown',
      canAccessStorage: false,
      androidVersion,
      apiLevel,
      preferredDirectory: 'external',
    };
  }
};

/**
 * Solicita permissão para acessar o armazenamento
 */
export const requestStoragePermission = async (): Promise<PermissionStatus> => {
  if (!isAndroid()) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion: 0,
      apiLevel: 0,
      preferredDirectory: 'internal',
    };
  }

  const androidVersion = await getAndroidVersion();
  const apiLevel = await getApiLevel();

  // Android 13+: Usar armazenamento interno, sem necessidade de permissões especiais
  if (androidVersion >= 13 || apiLevel >= 33) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
      preferredDirectory: 'internal',
    };
  }

  try {
    // Tenta criar o diretório base para disparar o pedido de permissão do sistema (Android < 13)
    await Filesystem.mkdir({
      directory: Directory.Documents,
      path: 'Codex',
      recursive: true,
    });
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
      preferredDirectory: 'external',
    };
  } catch (e: any) {
    if (e.message?.includes('exists') || e.message?.includes('EEXIST')) {
      return {
        storage: 'granted',
        canAccessStorage: true,
        androidVersion,
        apiLevel,
        preferredDirectory: 'external',
      };
    }
    return {
      storage: 'denied',
      canAccessStorage: false,
      androidVersion,
      apiLevel,
      preferredDirectory: 'external',
    };
  }
};

/**
 * Verifica e solicita permissão se necessário
 */
export const ensureStoragePermission = async (): Promise<boolean> => {
  const status = await checkStoragePermission();
  if (status.canAccessStorage) {
    return true;
  }
  const result = await requestStoragePermission();
  return result.canAccessStorage;
};

/**
 * Abre as configurações do app no Android
 */
export const openAppSettings = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      window.location.href = 'app-settings:';
    }
  } catch (error) {
    console.error('Erro ao abrir configurações do app:', error);
  }
};

export const getPermissionErrorMessage = (status: PermissionStatus): string => {
  if (!status.canAccessStorage) {
    return 'Permissão de armazenamento necessária para importar módulos. Verifique as configurações do app.';
  }
  return '';
};

export const getPermissionInfo = async (): Promise<{
  status: PermissionStatus;
  isAndroid: boolean;
  needsPermission: boolean;
  canRequest: boolean;
  message: string;
}> => {
  const status = await checkStoragePermission();
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const needsPermission = !status.canAccessStorage;
  const canRequest = status.storage === 'prompt' || status.storage === 'denied';
  const message = getPermissionErrorMessage(status);

  return {
    status,
    isAndroid,
    needsPermission,
    canRequest,
    message,
  };
};

export const testStorageAccess = async (): Promise<boolean> => {
  try {
    const testPath = 'Codex/.test_permission';
    const testContent = 'test';

    // Tentar em ambos os diretórios
    for (const directory of [Directory.Data, Directory.Documents] as const) {
      try {
        await Filesystem.writeFile({
          directory,
          path: testPath,
          data: testContent,
        });

        const result = await Filesystem.readFile({
          directory,
          path: testPath,
        });

        await Filesystem.deleteFile({
          directory,
          path: testPath,
        });

        if (typeof result.data === 'string' && result.data === testContent) {
          console.log(`Teste de acesso ao armazenamento bem-sucedido em ${directory}`);
          return true;
        }
      } catch (e) {
        console.warn(`Teste de acesso falhou em ${directory}:`, e);
        // Continuar para o próximo diretório
      }
    }

    return false;
  } catch (error) {
    console.error('Erro ao testar acesso ao armazenamento:', error);
    return false;
  }
};

/**
 * Obtém o diretório preferido baseado na versão do Android
 */
export const getPreferredDirectory = async (): Promise<Directory.Data | Directory.Documents> => {
  const androidVersion = await getAndroidVersion();
  
  // Android 13+: Usar armazenamento interno
  if (androidVersion >= 13) {
    return Directory.Data;
  }
  
  // Android 12 e anteriores: Usar armazenamento externo
  return Directory.Documents;
};
