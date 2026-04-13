import { extractQuarterFromSumario } from './scripts/ebd-extractor';
import * as fs from 'fs';

async function testAndSave() {
  console.log('🧪 Testando extrator EBD e salvando resultado...\n');
  
  const testUrl = 'https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm';
  
  try {
    const data = await extractQuarterFromSumario(testUrl);
    
    console.log('\n✅ EXTRAÇÃO CONCLUÍDA!\n');
    console.log('📖 Título:', data.title);
    console.log('👤 Comentarista:', data.commentator);
    console.log('📅 Ano:', data.year, '| Trimestre:', data.quarter);
    console.log('📚 Lições extraídas:', data.lessons.length);
    
    console.log('\n📋 RESUMO DAS LIÇÕES:');
    data.lessons.forEach(lesson => {
      console.log(`\n   Lição ${lesson.number}: ${lesson.title}`);
      console.log(`   - Texto Áureo: ${lesson.textAureo.substring(0, 80)}...`);
      console.log(`   - Tópicos: ${lesson.topicos.length}`);
    });
    
    // Salva em JSON para inspeção
    const outputFile = 'ebd-extracted-sample.json';
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 Dados salvos em: ${outputFile}`);
    console.log('✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

test();
