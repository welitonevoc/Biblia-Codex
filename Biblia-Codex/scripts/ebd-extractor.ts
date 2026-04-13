import axios from 'axios';
import * as cheerio from 'cheerio';

// Tipos
export interface Lesson {
  number: number;
  title: string;
  textAureo: string;
  verdadePratica: string;
  leituraDiaria: string;
  leituraBiblica: string;
  introducao: string;
  topicos: Array<{ title: string; content: string }>;
  conclusao: string;
  comentario: string;
  sinopse: string;
}

export interface ExtractedData {
  year: number;
  quarter: number;
  title: string;
  commentator: string;
  lessons: Lesson[];
}

// Gera os links das 13 lições baseado no ano e trimestre
export function generateLessonLinks(year: number, quarter: number): string[] {
  const links: string[] = [];
  const baseUrl = `https://www.estudantesdabiblia.com.br/licoes_cpad/${year}`;

  for (let i = 1; i <= 13; i++) {
    const date = `${year}-${quarter.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    links.push(`${baseUrl}/${date}.htm`);
  }

  return links;
}

// Extrai texto de um elemento com fallback
function extractText($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector).first();
  if (element.length) {
    return element.text().trim();
  }
  return '';
}

// Extrai HTML de um elemento com fallback
function extractHTML($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector).first();
  if (element.length) {
    element.find('script, style, iframe').remove();
    return element.html() || '';
  }
  return '';
}

// Extrai o conteúdo de uma lição individual
export async function extractLesson(url: string, lessonNumber: number): Promise<Lesson> {
  try {
    console.log(`📖 Extraindo lição ${lessonNumber}: ${url}`);

    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000,
      responseType: 'arraybuffer',
      transformResponse: [(data) => {
        // Converte buffer para string com encoding correto
        return new TextDecoder('iso-8859-1').decode(data);
      }]
    });

    const $ = cheerio.load(data);

    // Remove elementos indesejados
    $('script, style, iframe, .anuncio, .banner, .ads, .publicidade').remove();

    // Extrai título - tenta múltiplos seletores
    let title = '';
    const titleSelectors = ['h1', 'h2.titulo', '.titulo-licao h1', '.titulo-licao h2', 'h2', '.title'];
    for (const selector of titleSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 5) {
        title = text;
        break;
      }
    }
    title = title || `Lição ${lessonNumber}`;

    // Remove prefixos indesejados do título
    title = title.replace(/^LIÇÕES BÍBLICAS\s*CPAD\s*/i, '').trim();
    if (!title || title.length < 5) {
      title = `Lição ${lessonNumber}`;
    }

    // Extrai Texto Áureo
    const textAureo = extractHTML($, '.texto-aureo, .text-aureo, .versiculo-chave, .golden-text') ||
      `<p>"Porque Deus amou o mundo de tal maneira..." (João 3.16)</p>`;

    // Extrai Verdade Prática
    const verdadePratica = extractHTML($, '.verdade-pratica, .truth-practical, .vp') ||
      `<p>A verdade prática desta lição.</p>`;

    // Extrai Leitura Diária
    const leituraDiaria = extractHTML($, '.leitura-diaria, .daily-reading, .ld') ||
      `<p><strong>Segunda</strong> - Gn 1.1-5<br>
                          <strong>Terça</strong> - Gn 1.6-13<br>
                          <strong>Quarta</strong> - Gn 1.14-19<br>
                          <strong>Quinta</strong> - Gn 1.20-23<br>
                          <strong>Sexta</strong> - Gn 1.26-31<br>
                          <strong>Sábado</strong> - Gn 2.1-3</p>`;

    // Extrai Leitura Bíblica
    const leituraBiblica = extractHTML($, '.leitura-biblica, .bible-reading, .lb, .leitura-biblica-em-classe') ||
      `<p>1.1 - No princípio criou Deus os céus e a terra...</p>`;

    // Extrai Introdução
    const introducao = extractHTML($, '.introducao, .intro, .introduction') ||
      `<p>Nesta lição, estudaremos os fundamentos bíblicos para nossa fé.</p>`;

    // Extrai Tópicos (procura por múltiplos seletores)
    const topicos: Array<{ title: string; content: string }> = [];

    // Tenta encontrar tópicos por classe
    for (let i = 1; i <= 5; i++) {
      const selectors = [`.topico-${i}`, `.topico${i}`, `.topic-${i}`, `.topic${i}`, `.t${i}`];
      let content = '';
      let title = '';

      for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length) {
          const heading = element.find('h3, h4, h5, .titulo-topico').first();
          if (heading.length) {
            title = heading.text().trim();
            heading.remove();
          }
          content = element.html() || '';
          break;
        }
      }

      if (content) {
        topicos.push({
          title: title || `${['I', 'II', 'III', 'IV', 'V'][i - 1]} - Tópico ${i}`,
          content
        });
      }
    }

    // Se não encontrou tópicos, tenta extrair parágrafos gerais como tópicos
    if (topicos.length === 0) {
      const paragraphs = $('.conteudo p, .content p, article p').toArray();
      if (paragraphs.length >= 3) {
        for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
          topicos.push({
            title: `${['I', 'II', 'III'][i]} - Tópico ${i + 1}`,
            content: $(paragraphs[i]).prop('outerHTML')
          });
        }
      }
    }

    // Garante pelo menos 3 tópicos padrão
    if (topicos.length === 0) {
      for (let i = 1; i <= 3; i++) {
        topicos.push({
          title: `${['I', 'II', 'III'][i - 1]} - Tópico ${i}`,
          content: `<p>Conteúdo do tópico ${i} da lição ${lessonNumber}.</p>`
        });
      }
    }

    // Extrai Comentário
    const comentario = extractHTML($, '.comentario, .commentary, .comment, .comentario-geral') ||
      `<p>Comentário teológico detalhado da lição ${lessonNumber}.</p>`;

    // Extrai Sinopse
    const sinopse = extractHTML($, '.sinopse, .synopsis, .sinopse-text') ||
      `<p>Sinopse da lição ${lessonNumber}.</p>`;

    // Extrai Conclusão
    const conclusao = extractHTML($, '.conclusao, .conclusion, .conclusion-text') ||
      `<p>Conclusão da lição ${lessonNumber}.</p>`;

    return {
      number: lessonNumber,
      title,
      textAureo,
      verdadePratica,
      leituraDiaria,
      leituraBiblica,
      introducao,
      topicos,
      conclusao,
      comentario,
      sinopse
    };
  } catch (error) {
    console.error(`❌ Erro ao extrair lição ${lessonNumber}:`, error instanceof Error ? error.message : 'Erro desconhecido');

    // Retorna conteúdo padrão em caso de erro
    return {
      number: lessonNumber,
      title: `Lição ${lessonNumber}`,
      textAureo: `<p>"Porque Deus amou o mundo de tal maneira..." (João 3.16)</p>`,
      verdadePratica: `<p>A verdade prática desta lição.</p>`,
      leituraDiaria: `<p><strong>Segunda</strong> - Gn 1.1-5</p>`,
      leituraBiblica: `<p>1.1 - No princípio criou Deus os céus e a terra...</p>`,
      introducao: `<p>Introdução da lição ${lessonNumber}.</p>`,
      topicos: [
        { title: 'I - Primeiro Tópico', content: `<p>Conteúdo do primeiro tópico.</p>` },
        { title: 'II - Segundo Tópico', content: `<p>Conteúdo do segundo tópico.</p>` },
        { title: 'III - Terceiro Tópico', content: `<p>Conteúdo do terceiro tópico.</p>` }
      ],
      conclusao: `<p>Conclusão da lição ${lessonNumber}.</p>`,
      comentario: `<p>Comentário da lição ${lessonNumber}.</p>`,
      sinopse: `<p>Sinopse da lição ${lessonNumber}.</p>`
    };
  }
}

// Função principal de extração
export async function extractQuarterFromSumario(sumarioUrl: string): Promise<ExtractedData> {
  console.log('🔍 Iniciando extração do sumário:', sumarioUrl);

  // Extrai ano e trimestre da URL
  let year = 2026;
  let quarter = 1;

  const yearMatch = sumarioUrl.match(/(\d{4})/);
  if (yearMatch) year = parseInt(yearMatch[1]);

  if (sumarioUrl.includes('trimestre') || sumarioUrl.includes('quarter')) {
    if (sumarioUrl.includes('1º') || sumarioUrl.includes('primeiro') || sumarioUrl.includes('-01-')) quarter = 1;
    else if (sumarioUrl.includes('2º') || sumarioUrl.includes('segundo') || sumarioUrl.includes('-02-')) quarter = 2;
    else if (sumarioUrl.includes('3º') || sumarioUrl.includes('terceiro') || sumarioUrl.includes('-03-')) quarter = 3;
    else if (sumarioUrl.includes('4º') || sumarioUrl.includes('quarto') || sumarioUrl.includes('-04-')) quarter = 4;
  }

  // Extrai metadados do sumário
  let title = `Lições Bíblicas - ${quarter}º Trimestre de ${year}`;
  let commentator = 'Comentarista: Douglas Baptista';

  try {
    console.log('📄 Buscando página do sumário...');
    const { data: sumarioHtml } = await axios.get(sumarioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000,
      responseType: 'arraybuffer',
      transformResponse: [(data) => {
        return new TextDecoder('iso-8859-1').decode(data);
      }]
    });

    const $ = cheerio.load(sumarioHtml);

    // Tenta extrair título
    const pageTitle = $('h1, h2, .titulo, .title').first().text().trim();
    if (pageTitle) title = pageTitle;

    // Tenta extrair comentarista
    const commentatorText = $('.comentarista, .commentator, .autor, .author').first().text().trim();
    if (commentatorText) commentator = commentatorText;

    console.log('✅ Metadados extraídos:', { title, commentator });
  } catch (error) {
    console.warn('⚠️ Erro ao extrair metadados do sumário, usando padrões:', error instanceof Error ? error.message : 'Erro desconhecido');
  }

  // Gera links das lições
  const lessonLinks = generateLessonLinks(year, quarter);
  console.log(`📚 Gerados ${lessonLinks.length} links de lições`);

  // Extrai todas as lições em paralelo com limite de concorrência
  const lessons: Lesson[] = [];
  const batchSize = 3; // Processa 3 lições por vez para não sobrecarregar

  for (let i = 0; i < lessonLinks.length; i += batchSize) {
    const batch = lessonLinks.slice(i, i + batchSize);
    const batchLessons = await Promise.all(
      batch.map((url, index) => extractLesson(url, i + index + 1))
    );
    lessons.push(...batchLessons);
    console.log(`✅ Processadas lições ${i + 1} a ${Math.min(i + batchSize, lessonLinks.length)}`);
  }

  return {
    year,
    quarter,
    title,
    commentator,
    lessons
  };
}
