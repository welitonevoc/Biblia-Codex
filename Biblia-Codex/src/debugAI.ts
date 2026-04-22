import { testAIConfiguration, diagnoseAIConfiguration } from './services/geminiService';

export const debugAIConfig = async () => {
  console.log('=== DIAGNÓSTICO COMPLETO DA CONFIGURAÇÃO IA ===');

  // Diagnóstico básico
  const diag = diagnoseAIConfiguration();
  console.log('Diagnóstico básico:', diag);

  // Teste de configuração
  console.log('=== TESTANDO CONEXÃO ===');
  const result = await testAIConfiguration();
  console.log('Resultado do teste:', result);

  console.log('=== FIM DO DIAGNÓSTICO ===');
  return { diagnosis: diag, testResult: result };
};

// Para uso no browser console
if (typeof window !== 'undefined') {
  window.debugAIConfig = debugAIConfig;
  window.diagnoseAI = diagnoseAIConfiguration;
  window.testAI = testAIConfiguration;
}