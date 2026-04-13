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

// Gera o HTML completo de uma lição no formato page.txt
export function generateLessonHTML(lesson: Lesson, lessonNumber: number): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lição ${lessonNumber}: ${lesson.title}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
        :root {
            --text-color: #4B5563;
            --primary-color: #0047AB;
            --accent-red: #B22222;
            --main-blue: #003366;
            --gray-bible: #696969;
            --keyword-bg: #000041;
            --ampliacao-orange: #FF4500;
            --sinopse-green: #808000;
            --revisao-purple: #6F2DA8;
            --conclusao-blue: #2D66A8;
            --light-blue-bg: rgba(0, 71, 171, 0.15);
            --black-text: #000000;
            --dark-read-blue: #003366;
            --ta-vp-border: #CCCCCC;
            --bible-read-header-bg: #B22222;
            --bible-read-content-bg: #f5d7b5;
            --bible-read-text-dark: #333333;
            --comentario-header-bg: #4d7398;
            --conclusao-header-bg: #2D66A8;
            --comentario-border: rgba(77, 115, 152, 0.5);
        }
        body { font-family: 'Inter', sans-serif; color: var(--text-color); line-height: 1.5; margin: 0; padding: 4px; font-size: 1rem; }
        .container { max-width: 800px; margin: 0 auto; background: transparent; }
        .block-margin { margin-bottom: 28px; }
        .inner-block-spacing > * { margin-bottom: 0.75rem; }
        .inner-block-spacing > *:last-child { margin-bottom: 0; }
        .box-header { color: white; text-align: center; font-weight: 900; padding: 10px; font-size: 1.2rem; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .ta-vp-container { display: block; margin-bottom: 28px; border: 1px solid var(--ta-vp-border); border-radius: 8px; text-align: center; }
        .ta-vp-item { padding: 15px; text-align: center; }
        .ta-vp-item:first-child { border-bottom: 1px solid var(--ta-vp-border); }
        .text-aureo-title { color: var(--accent-red); font-weight: 900; font-size: 1.25rem; text-align: center; }
        .text-aureo-content { color: var(--primary-color); font-style: italic; font-size: 1rem; padding: 0; margin: 0 auto; line-height: 1.3; text-align: center; }
        .daily-read-box { background-color: var(--dark-read-blue); border: 4px solid var(--dark-read-blue); border-radius: 8px; }
        .daily-read-content-text { color: white; font-weight: 500; }
        .daily-read-content-text strong { color: white; font-weight: 900; }
        .lesson-read-box { background-color: var(--bible-read-content-bg); border: 4px solid var(--bible-read-header-bg); border-radius: 8px; }
        .lesson-read-box .box-header { background-color: var(--bible-read-header-bg); }
        .bible-read-content-text { color: var(--bible-read-text-dark); font-weight: 500; }
        .plan-comment-box, .auxilio-box { background-color: var(--light-blue-bg); border: 4px solid var(--dark-read-blue); border-radius: 8px; }
        .plan-comment-box .box-header, .auxilio-box .box-header { background-color: var(--dark-read-blue); }
        .auxilio-content-text { color: var(--black-text); }
        .comentario-box { border: 4px solid var(--comentario-border); border-radius: 8px; }
        .comentario-box .box-header { background-color: var(--comentario-header-bg); }
        .comentario-content-text { color: var(--text-color); }
        .conclusao-box { border: 4px solid var(--conclusao-blue); border-radius: 8px; }
        .conclusao-box .box-header { background-color: var(--conclusao-header-bg); }
        .conclusao-content-text { color: var(--conclusao-blue); }
        .ampliacao-box { border: 4px solid var(--ampliacao-orange); border-radius: 8px; }
        .ampliacao-box .box-header { background-color: var(--ampliacao-orange); }
        .ampliacao-content-text { color: var(--text-color); }
        .sinopse-box { text-align: center; padding: 15px; background-color: rgba(243, 244, 246, 0.5); border-top: 4px solid rgba(128, 128, 0, 0.5); border-bottom: 4px solid rgba(128, 128, 0, 0.5); border-radius: 8px; margin-bottom: 28px; }
        .sinopse-text { text-align: center; color: var(--sinopse-green); font-weight: 900; font-style: italic; font-size: 1rem; margin-bottom: 5px; }
        .topic-title { color: var(--dark-read-blue); font-weight: 900; font-size: 1.15rem; margin-bottom: 15px; }
        .text-red { color: var(--accent-red); }
        .font-black-style { font-weight: 900; }
        .text-xl-font { font-size: 1.25rem; }
        .text-center { text-align: center; }
        .bible { color: var(--primary-color); font-weight: bold; text-decoration: underline; cursor: pointer; }
        .revisao-box { background-color: var(--bible-read-content-bg); border: 4px solid var(--bible-read-header-bg); border-radius: 8px; }
        .revisao-box .box-header { background-color: var(--bible-read-header-bg); }
        .revisao-resposta { color: var(--accent-red); font-style: italic; font-weight: 600; }
        .quote-box { background-color: #681111; color: white; text-align: center; padding: 10px; font-style: italic; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="block-margin">
            <h1 class="text-3xl font-bold text-center" style="color: var(--main-blue);">Lição ${lessonNumber}</h1>
            <h2 class="text-2xl font-bold text-center" style="color: var(--primary-color);">${lesson.title}</h2>
        </div>

        <!-- TEXTO ÁUREO E VERDADE PRÁTICA -->
        <div class="ta-vp-container block-margin">
            <div class="ta-vp-item">
                <p class="text-aureo-title">TEXTO ÁUREO</p>
                <p class="text-aureo-content">${lesson.textAureo}</p>
            </div>
            <div class="ta-vp-item">
                <p class="text-aureo-title" style="margin-top: 0;">VERDADE PRÁTICA</p>
                <p class="text-aureo-content">${lesson.verdadePratica}</p>
            </div>
        </div>

        <!-- LEITURA DIÁRIA -->
        <div class="daily-read-box block-margin">
            <div class="box-header" style="background-color: var(--dark-read-blue);">LEITURA DIÁRIA</div>
            <div class="inner-block-spacing daily-read-content-text" style="padding: 15px;">
                ${lesson.leituraDiaria}
            </div>
        </div>

        <!-- LEITURA BÍBLICA EM CLASSE -->
        <div class="lesson-read-box block-margin">
            <div class="box-header">LEITURA BÍBLICA EM CLASSE</div>
            <div class="inner-block-spacing bible-read-content-text" style="padding: 15px; color: var(--bible-read-text-dark);">
                ${lesson.leituraBiblica}
            </div>
        </div>

        <!-- PLANO DE AULA / INTRODUÇÃO -->
        <div class="plan-comment-box block-margin">
            <div class="box-header">PLANO DE AULA</div>
            <div class="inner-block-spacing" style="padding: 15px; color: var(--black-text);">
                <p><strong class="text-xl-font">1. INTRODUÇÃO</strong><br>${lesson.introducao}</p>
            </div>
        </div>

        <!-- COMENTÁRIO -->
        <div class="comentario-box block-margin">
            <div class="box-header" style="background-color: var(--comentario-header-bg);">COMENTÁRIO</div>
            <div class="inner-block-spacing comentario-content-text" style="padding: 15px; color: var(--text-color);">
                <p class="text-navy-blue-color font-black-style text-xl-font" style="margin-bottom: 10px;">INTRODUÇÃO</p>
                ${lesson.comentario}
            </div>
        </div>

        <!-- TÓPICOS -->
        ${lesson.topicos.map((topico, i) => `
        <div class="inner-block-spacing block-margin">
            <p class="topic-title" style="margin-bottom: 15px;">${topico.title}</p>
            <div style="color: var(--text-color);">
                ${topico.content}
            </div>
        </div>

        <div class="sinopse-box block-margin">
            <p class="sinopse-text" style="margin-bottom: 5px;">SINOPSE ${['I', 'II', 'III'][i]}</p>
            <p class="sinopse-text">${lesson.sinopse}</p>
        </div>
        `).join('')}

        <!-- CONCLUSÃO -->
        <div class="conclusao-box block-margin">
            <div class="box-header" style="background-color: var(--conclusao-header-bg);">CONCLUSÃO</div>
            <div class="inner-block-spacing conclusao-content-text" style="padding: 15px;">
                <p>${lesson.conclusao}</p>
            </div>
        </div>

    </div>
</body>
</html>`;
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
      `<p class="text-center font-black-style text-xl-font">Referência Bíblica</p>
                          <p>1.1 - No princípio criou Deus os céus e a terra...</p>`;

    // Extrai Introdução
    const introducao = extractHTML($, '.introducao, .intro, .introduction, .plano-de-aula') ||
      `<p>Nesta lição, estudaremos os fundamentos bíblicos para nossa fé.</p>`;

    // Extrai Tópicos (procura por múltiplos seletores)
    const topicos: Array<{ title: string; content: string }> = [];

    // Tenta encontrar tópicos por classe
    for (let i = 1; i <= 5; i++) {
      const selectors = [`.topico-${i}`, `.topico${i}`, `.topic-${i}`, `.topic${i}`, `.t${i}`];
      let content = '';
      let titleTopico = '';

      for (const selector of selectors) {
        const element = $(selector).first();
        if (element.length) {
          const heading = element.find('h3, h4, h5, .titulo-topico').first();
          if (heading.length) {
            titleTopico = heading.text().trim();
            heading.remove();
          }
          content = element.html() || '';
          break;
        }
      }

      if (content) {
        topicos.push({
          title: titleTopico || `${['I', 'II', 'III', 'IV', 'V'][i - 1]} - Tópico ${i}`,
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
      leituraBiblica: `<p class="text-center font-black-style text-xl-font">Referência Bíblica</p><p>1.1 - No princípio criou Deus os céus e a terra...</p>`,
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

// Gera o HTML completo da revista no formato page.txt
export function generateMagazineHTML(data: ExtractedData): string {
  // CSS e estrutura base do page.txt
  const baseCSS = `
    <style>
        :root {
            --primary-color: #B22222;
            --secondary-color: #01579B;
            --reader-font-size: 100%;
        }
        body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #333; margin: 0; transition: background 0.3s; }
        #content-area { font-size: var(--reader-font-size); }
        .page-container { position: relative; width: 100%; overflow: hidden; }
        .magazine-page { transition: transform 0.4s ease-out, opacity 0.4s ease-out; width: 100%; min-height: 85vh; }
        .hidden-left { transform: translateX(-100%); opacity: 0; position: absolute; pointer-events: none; }
        .hidden-right { transform: translateX(100%); opacity: 0; position: absolute; pointer-events: none; }
        .hidden-center { transform: translateX(0); opacity: 1; }
        
        /* POPUP AZUL */
        .modal-biblico {
            display: none; position: fixed; z-index: 9999;
            left: 50%; top: 50%; transform: translate(-50%, -50%);
            width: 98%; max-width: 550px; height: 75vh;
            background: #39006a; border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            flex-direction: column; overflow: hidden; border: 2px solid var(--secondary-color);
            animation: popupShow 0.3s ease-out;
        }
        .modal-header-offline { background-color: var(--secondary-color) !important; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .modal-body-offline { padding: 20px 15px; color: #39006a; line-height: 1.7; font-size: 1.25rem; background-color: #F0F8FF; flex: 1 1 auto; overflow-y: auto; }
        .modal-footer-offline { padding: 15px; background-color: #E1F5FE; border-top: 1px solid #B3E5FC; display: flex; justify-content: center; }
        .btn-fechar { background-color: var(--secondary-color); color: white !important; width: 200px; padding: 12px 0; border-radius: 12px; font-weight: 800; text-transform: uppercase; border: none; cursor: pointer; }
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9998; backdrop-filter: blur(2px); }
        @keyframes popupShow { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        
        /* Estilos de lição */
        .main-summary-item { border: 2px solid #e28743; border-radius: 8px; background-color: #F5F5DC; margin-bottom: 15px; overflow: hidden; }
        .text-box-header { background-color: #C2B280; color: #764016; text-align: center; padding: 5px; font-weight: bold; }
        .text-box-content { padding: 15px; color: #6e4300; font-style: italic; text-align: center; }
        .bible-link { color: var(--secondary-color); font-weight: bold; text-decoration: underline; cursor: pointer; }
        .bible, .ref { color: #39006a !important; font-weight: bold !important; text-decoration: none; }
        .bible:hover { text-decoration: underline; }
    </style>
  `;

  // Gera páginas das lições
  let pagesHTML = '';

  // Página 0 - Capa
  pagesHTML += `
    <div id="page-0" class="magazine-page">
        <img src="https://i.ibb.co/Gf6fWG0q/Capa.jpg" class="w-full rounded-lg shadow-lg">
    </div>
  `;

  // Página 1 - Palavra da Editora
  pagesHTML += `
    <div id="page-1" class="magazine-page hidden-center">
        <div class="p-8 max-w-4xl mx-auto">
            <h2 class="text-2xl font-bold text-center text-blue-800 mb-6">Palavra da Editora</h2>
            <p class="mb-4">Prezado(a) professor(a),</p>
            <p class="mb-4">Este trimestre é um convite à adoração e ao aprendizado mais profundo sobre a natureza de Deus, que se revela como Pai, Filho e Espírito Santo.</p>
            <p class="font-bold text-center text-blue-600">Bom trimestre!</p>
        </div>
    </div>
  `;

  // Página 2 - Sumário
  pagesHTML += `
    <div id="page-2" class="magazine-page hidden-right">
        <div class="p-8 max-w-4xl mx-auto">
            <h2 class="text-2xl font-bold text-center text-red-700">SUMÁRIO</h2>
            <h3 class="text-xl font-bold text-center mt-2">${data.title}</h3>
            <p class="text-center text-gray-600">${data.commentator}</p>
            <div class="mt-6 space-y-2">
                ${data.lessons.map(lesson => `
                    <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded">
                        <span class="font-bold text-blue-600 w-16 text-center bg-blue-50 py-1 rounded">${lesson.number}</span>
                        <span class="flex-1">${lesson.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
  `;

  // Páginas 3-15 - Lições
  data.lessons.forEach((lesson, idx) => {
    const lessonHTML = generateLessonHTML(lesson, lesson.number);
    pagesHTML += `
        <div id="page-${idx + 3}" class="magazine-page hidden-center">
            ${lessonHTML}
        </div>
    `;
  });

  // Monta o HTML completo
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revista Digital - ${data.title}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    ${baseCSS}
</head>
<body>
    <div id="overlay-biblico" class="modal-overlay" onclick="fecharModal()"></div>
    <div id="modalVersiculo" class="modal-biblico">
        <div class="modal-header-offline">
            <h4 id="modalTitulo" style="margin:0;">REFERÊNCIA</h4>
            <span onclick="fecharModal()" style="cursor:pointer; font-size:30px;">&times;</span>
        </div>
        <div class="modal-body-offline"><p id="modalTexto"></p></div>
        <div class="modal-footer-offline"><button class="btn-fechar" onclick="fecharModal()">FECHAR</button></div>
    </div>

    <div id="content-area">
        <div class="page-container">
            ${pagesHTML}
        </div>
    </div>

    <script>
        let currentPage = 0;
        function showPage(pageNum) {
            const pages = document.querySelectorAll('.magazine-page');
            pages.forEach((page, idx) => {
                if (idx === pageNum) {
                    page.classList.remove('hidden-left', 'hidden-right');
                    page.classList.add('hidden-center');
                } else if (idx < pageNum) {
                    page.classList.remove('hidden-center', 'hidden-right');
                    page.classList.add('hidden-left');
                } else {
                    page.classList.remove('hidden-center', 'hidden-left');
                    page.classList.add('hidden-right');
                }
            });
            currentPage = pageNum;
        }
        function fecharModal() {
            document.getElementById('modalVersiculo').style.display = 'none';
            document.getElementById('overlay-biblico').style.display = 'none';
        }
        function toggleBookmark() { alert('Marcador salvo!'); }
        function changeFontSize(delta) {
            const root = document.documentElement;
            const currentSize = parseFloat(getComputedStyle(root).getPropertyValue('--reader-font-size')) || 100;
            root.style.setProperty('--reader-font-size', (currentSize + delta) + '%');
        }
        showPage(0);
    <\/script>
</body>
</html>`;
}
