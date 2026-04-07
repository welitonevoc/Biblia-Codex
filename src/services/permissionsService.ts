/**
 * Serviço de Permissões para Android 13+ (API 33+)
 * Gerencia permissões de armazenamento de forma compatível
 *
 * NOTA: Para Android 13+, o ideal é usar o File Picker nativo
 * pois as permissões de storage externo estão restritas
 */
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
  canAccessStorage: boolean;
  androidVersion?: number;
  apiLevel?: number;
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
    };
  }

  const androidVersion = await getAndroidVersion();
  const apiLevel = await getApiLevel();

  // No Android 13+, o acesso via seletor de arquivos (input type="file")
  // não exige permissão de armazenamento global READ_EXTERNAL_STORAGE.
  // O sistema concede acesso temporário ao arquivo selecionado.
  if (androidVersion >= 13 || apiLevel >= 33) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
    };
  }

  try {
    // Para Android 12 e anteriores, tentamos listar um diretório para verificar
    try {
      await Filesystem.readdir({
        directory: Directory.Documents,
        path: 'Kerygma',
      });
      return {
        storage: 'granted',
        canAccessStorage: true,
        androidVersion,
        apiLevel,
      };
    } catch (e) {
      return {
        storage: 'prompt',
        canAccessStorage: false,
        androidVersion,
        apiLevel,
      };
    }
  } catch (error) {
    return {
      storage: 'unknown',
      canAccessStorage: false,
      androidVersion,
      apiLevel,
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
    };
  }

  const androidVersion = await getAndroidVersion();
  const apiLevel = await getApiLevel();

  // No Android 13+, não solicitamos permissão de mídia para arquivos de dados
  if (androidVersion >= 13 || apiLevel >= 33) {
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
    };
  }

  try {
    // Tenta criar o diretório base para disparar o pedido de permissão do sistema (Android < 13)
    await Filesystem.mkdir({
      directory: Directory.Documents,
      path: 'Kerygma',
      recursive: true,
    });
    return {
      storage: 'granted',
      canAccessStorage: true,
      androidVersion,
      apiLevel,
    };
  } catch (e: any) {
    if (e.message?.includes('exists') || e.message?.includes('EEXIST')) {
      return {
        storage: 'granted',
        canAccessStorage: true,
        androidVersion,
        apiLevel,
      };
    }
    return {
      storage: 'denied',
      canAccessStorage: false,
      androidVersion,
      apiLevel,
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
    return 'Permissão de armazenamento necessária para importar módulos.';
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
    const testPath = 'Kerygma/.test_permission';
    const testContent = 'test';

    await Filesystem.writeFile({
      directory: Directory.Documents,
      path: testPath,
      data: testContent,
    });

    const result = await Filesystem.readFile({
      directory: Directory.Documents,
      path: testPath,
    });

    await Filesystem.deleteFile({
      directory: Directory.Documents,
      path: testPath,
    });

    return typeof result.data === 'string' && result.data === testContent;
  } catch (error) {
    return false;
  }
};
