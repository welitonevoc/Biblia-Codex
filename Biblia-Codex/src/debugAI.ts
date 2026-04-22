import { testAIConfiguration } from './services/geminiService';

export const debugAIConfig = async () => {
  console.log('=== Teste de Configuração IA ===');
  const result = await testAIConfiguration();
  console.log('Resultado:', result);
  return result;
};

// Para uso no browser console
if (typeof window !== 'undefined') {
  window.debugAIConfig = debugAIConfig;
}