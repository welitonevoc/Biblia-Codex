import { extractQuarterFromSumario } from './scripts/ebd-extractor';

async function test() {
  console.log('🧪 Testando extrator EBD...\n');
  
  // URL de exemplo para teste
  const testUrl = 'https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm';
  
  try {
    const data = await extractQuarterFromSumario(testUrl);
    
    console.log('\n✅ EXTRAÇÃO CONCLUÍDA!\n');
    console.log('📖 Título:', data.title);
    console.log('👤 Comentarista:', data.commentator);
    console.log('📅 Ano:', data.year);
    console.log('📊 Trimestre:', data.quarter);
    console.log('📚 Lições extraídas:', data.lessons.length);
    
    console.log('\n📋 LISTA DE LIÇÕES:');
    data.lessons.forEach(lesson => {
      console.log(`   Lição ${lesson.number}: ${lesson.title}`);
    });
    
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

test();
