import { BibleService } from './BibleService';
import { BIBLE_BOOKS } from './data/bibleMetadata';

(window as any).runBibleServiceTests = async () => {
  console.log('🚀 Iniciando testes do BibleService...');
  
  // 1. Teste de Busca
  try {
    const version = { id: 'dummy', name: 'Almeida', path: 'arc.sqlite3', abbreviation: 'ARC' };
    console.log('🔍 Testando busca por "Jesus"...');
    const results = await BibleService.search('Jesus', version as any);
    console.log(`✅ Busca concluída. Resultados encontrados: ${results.length}`);
    if (results.length > 0) {
      console.log('Primeiro resultado:', results[0]);
    } else {
      console.warn('⚠️ Nenhum resultado encontrado. Verifique se o arquivo arc.sqlite3 existe na pasta public.');
    }
  } catch (err) {
    console.error('❌ Erro no teste de busca:', err);
  }

  // 2. Teste de Versículos
  try {
    console.log('📖 Testando carregamento de João 3...');
    const verses = await BibleService.getVerses('JHN', 3, { path: 'arc.sqlite3' } as any);
    console.log(`✅ João 3 carregado. Versículos: ${verses.length}`);
  } catch (err) {
    console.error('❌ Erro no teste de versículos:', err);
  }
};
