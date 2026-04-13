import { extractQuarterFromSumario, generateMagazineHTML } from './scripts/ebd-extractor';
import * as fs from 'fs';

async function testAndGenerate() {
  console.log('🧪 Testando extrator EBD e gerando HTML no formato page.txt...\n');
  
  const testUrl = 'https://www.estudantesdabiblia.com.br/cpad_sumario_2026.htm';
  
  try {
    const data = await extractQuarterFromSumario(testUrl);
    
    console.log('\n✅ EXTRAÇÃO CONCLUÍDA!\n');
    console.log('📖 Título:', data.title);
    console.log('👤 Comentarista:', data.commentator);
    console.log('📅 Ano:', data.year, '| Trimestre:', data.quarter);
    console.log('📚 Lições extraídas:', data.lessons.length);
    
    // Gera o HTML completo no formato page.txt
    console.log('\n🎨 Gerando HTML no formato page.txt...');
    const magazineHTML = generateMagazineHTML(data);
    
    // Salva o arquivo
    const outputFile = 'public/EBD/test-generated.html';
    fs.writeFileSync(outputFile, magazineHTML, 'utf-8');
    
    console.log(`💾 HTML salvo em: ${outputFile}`);
    console.log(`📊 Tamanho do arquivo: ${(magazineHTML.length / 1024).toFixed(2)} KB`);
    console.log('\n✅ Teste concluído! Abra o arquivo no navegador para verificar o formato visual.');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testAndGenerate();
