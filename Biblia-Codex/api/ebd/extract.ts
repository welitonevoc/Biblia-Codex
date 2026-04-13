import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Tipos
interface Lesson {
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

interface ExtractedData {
  year: number;
  quarter: number;
  title: string;
  commentator: string;
  lessons: Lesson[];
}

// Gera os links das 13 lições
function generateLessonLinks(year: number, quarter: number): string[] {
  const links: string[] = [];
  const baseUrl = `https://www.estudantesdabiblia.com.br/licoes_cpad/${year}`;
  for (let i = 1; i <= 13; i++) {
    const date = `${year}-${quarter.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    links.push(`${baseUrl}/${date}.htm`);
  }
  return links;
}

function extractHTML($: cheerio.CheerioAPI, selector: string): string {
  const element = $(selector).first();
  if (element.length) {
    element.find('script, style, iframe').remove();
    return element.html() || '';
  }
  return '';
}

// Gera HTML completo de uma lição no formato page.txt
function generateLessonHTML(lesson: Lesson, lessonNumber: number): string {
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
            --text-color: #4B5563; --primary-color: #0047AB; --accent-red: #B22222;
            --main-blue: #003366; --dark-read-blue: #003366; --ta-vp-border: #CCCCCC;
            --bible-read-header-bg: #B22222; --bible-read-content-bg: #f5d7b5;
            --bible-read-text-dark: #333333; --comentario-header-bg: #4d7398;
            --conclusao-blue: #2D66A8; --comentario-border: rgba(77,115,152,0.5);
            --light-blue-bg: rgba(0,71,171,0.15);
        }
        body { font-family: 'Inter', sans-serif; color: var(--text-color); line-height: 1.5; margin: 0; padding: 4px; }
        .container { max-width: 800px; margin: 0 auto; }
        .block-margin { margin-bottom: 28px; }
        .box-header { color: white; text-align: center; font-weight: 900; padding: 10px; font-size: 1.2rem; border-top-left-radius: 6px; border-top-right-radius: 6px; }
        .ta-vp-container { display: block; margin-bottom: 28px; border: 1px solid var(--ta-vp-border); border-radius: 8px; text-align: center; }
        .ta-vp-item { padding: 15px; text-align: center; }
        .ta-vp-item:first-child { border-bottom: 1px solid var(--ta-vp-border); }
        .text-aureo-title { color: var(--accent-red); font-weight: 900; font-size: 1.25rem; text-align: center; }
        .text-aureo-content { color: var(--primary-color); font-style: italic; font-size: 1rem; }
        .daily-read-box { background-color: var(--dark-read-blue); border: 4px solid var(--dark-read-blue); border-radius: 8px; }
        .daily-read-content-text { color: white; }
        .lesson-read-box { background-color: var(--bible-read-content-bg); border: 4px solid var(--bible-read-header-bg); border-radius: 8px; }
        .plan-comment-box { background-color: var(--light-blue-bg); border: 4px solid var(--dark-read-blue); border-radius: 8px; }
        .comentario-box { border: 4px solid var(--comentario-border); border-radius: 8px; }
        .comentario-box .box-header { background-color: var(--comentario-header-bg); }
        .conclusao-box { border: 4px solid var(--conclusao-blue); border-radius: 8px; }
        .sinopse-box { text-align: center; padding: 15px; background: rgba(243,244,246,0.5); border-top: 4px solid rgba(128,128,0,0.5); border-bottom: 4px solid rgba(128,128,0,0.5); border-radius: 8px; }
        .sinopse-text { color: #808000; font-weight: 900; font-style: italic; }
        .topic-title { color: var(--dark-read-blue); font-weight: 900; font-size: 1.15rem; margin-bottom: 15px; }
        .text-red { color: var(--accent-red); }
        .font-black-style { font-weight: 900; }
        .text-xl-font { font-size: 1.25rem; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-3xl font-bold text-center" style="color: var(--main-blue);">Lição ${lessonNumber}</h1>
        <h2 class="text-2xl font-bold text-center" style="color: var(--primary-color);">${lesson.title}</h2>

        <div class="ta-vp-container block-margin">
            <div class="ta-vp-item">
                <p class="text-aureo-title">TEXTO ÁUREO</p>
                <p class="text-aureo-content">${lesson.textAureo}</p>
            </div>
            <div class="ta-vp-item">
                <p class="text-aureo-title">VERDADE PRÁTICA</p>
                <p class="text-aureo-content">${lesson.verdadePratica}</p>
            </div>
        </div>

        <div class="daily-read-box block-margin">
            <div class="box-header">LEITURA DIÁRIA</div>
            <div class="daily-read-content-text" style="padding: 15px;">${lesson.leituraDiaria}</div>
        </div>

        <div class="lesson-read-box block-margin">
            <div class="box-header">LEITURA BÍBLICA EM CLASSE</div>
            <div style="padding: 15px; color: var(--bible-read-text-dark);">${lesson.leituraBiblica}</div>
        </div>

        <div class="plan-comment-box block-margin">
            <div class="box-header">PLANO DE AULA</div>
            <div style="padding: 15px;"><strong>1. INTRODUÇÃO</strong><br>${lesson.introducao}</div>
        </div>

        <div class="comentario-box block-margin">
            <div class="box-header">COMENTÁRIO</div>
            <div style="padding: 15px;">${lesson.comentario}</div>
        </div>

        ${lesson.topicos.map((t, i) => `
        <div class="block-margin">
            <p class="topic-title">${t.title}</p>
            <div>${t.content}</div>
        </div>
        <div class="sinopse-box block-margin">
            <p class="sinopse-text">SINOPSE ${['I','II','III'][i]}</p>
            <p class="sinopse-text">${lesson.sinopse}</p>
        </div>`).join('')}

        <div class="conclusao-box block-margin">
            <div class="box-header">CONCLUSÃO</div>
            <div style="padding: 15px;">${lesson.conclusao}</div>
        </div>
    </div>
</body>
</html>`;
}

// Extrai lição individual
async function extractLesson(url: string, lessonNumber: number): Promise<Lesson> {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
      responseType: 'arraybuffer',
      transformResponse: [(d: Buffer) => new TextDecoder('iso-8859-1').decode(d)]
    });
    const $ = cheerio.load(data);
    $('script, style, iframe, .anuncio, .banner').remove();

    let title = $('h1, h2, .titulo').first().text().trim() || `Lição ${lessonNumber}`;
    title = title.replace(/^LIÇÕES BÍBLICAS\s*CPAD\s*/i, '').trim() || `Lição ${lessonNumber}`;

    return {
      number: lessonNumber,
      title,
      textAureo: extractHTML($, '.texto-aureo, .text-aureo') || '<p>"Porque Deus amou o mundo..." (João 3.16)</p>',
      verdadePratica: extractHTML($, '.verdade-pratica') || '<p>A verdade prática desta lição.</p>',
      leituraDiaria: extractHTML($, '.leitura-diaria') || '<p><strong>Segunda</strong> - Gn 1.1</p>',
      leituraBiblica: extractHTML($, '.leitura-biblica') || '<p>Texto bíblico...</p>',
      introducao: extractHTML($, '.introducao') || '<p>Introdução...</p>',
      topicos: [
        { title: 'I - Primeiro Tópico', content: extractHTML($, '.topico-1') || '<p>Conteúdo...</p>' },
        { title: 'II - Segundo Tópico', content: extractHTML($, '.topico-2') || '<p>Conteúdo...</p>' },
        { title: 'III - Terceiro Tópico', content: extractHTML($, '.topico-3') || '<p>Conteúdo...</p>' }
      ],
      conclusao: extractHTML($, '.conclusao') || '<p>Conclusão...</p>',
      comentario: extractHTML($, '.comentario') || '<p>Comentário...</p>',
      sinopse: extractHTML($, '.sinopse') || '<p>Sinopse...</p>'
    };
  } catch (error) {
    console.error(`Erro lição ${lessonNumber}:`, error);
    return {
      number: lessonNumber, title: `Lição ${lessonNumber}`,
      textAureo: '<p>"Porque Deus amou o mundo..." (João 3.16)</p>',
      verdadePratica: '<p>Verdade prática.</p>', leituraDiaria: '<p>Leitura...</p>',
      leituraBiblica: '<p>Texto bíblico...</p>', introducao: '<p>Introdução...</p>',
      topicos: [{ title: 'I - Tópico', content: '<p>Conteúdo...</p>' }],
      conclusao: '<p>Conclusão...</p>', comentario: '<p>Comentário...</p>', sinopse: '<p>Sinopse...</p>'
    };
  }
}

// Gera revista completa
function generateMagazineHTML(data: ExtractedData): string {
  let pagesHTML = `
    <div id="page-0" class="magazine-page"><img src="https://i.ibb.co/Gf6fWG0q/Capa.jpg" class="w-full"></div>
    <div id="page-1" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-blue-800 mb-6">Palavra da Editora</h2><p>Prezado(a) professor(a),</p><p>Este trimestre é um convite à adoração e ao aprendizado sobre Deus Pai, Filho e Espírito Santo.</p><p class="font-bold text-center text-blue-600 mt-4">Bom trimestre!</p></div></div>
    <div id="page-2" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-red-700">SUMÁRIO</h2><h3 class="text-xl font-bold text-center mt-2">${data.title}</h3><p class="text-center text-gray-600">${data.commentator}</p><div class="mt-6 space-y-2">${data.lessons.map(l => `<div class="flex items-center gap-3 p-3"><span class="font-bold text-blue-600 w-16 text-center bg-blue-50 py-1 rounded">${l.number}</span><span class="flex-1">${l.title}</span></div>`).join('')}</div></div></div>`;

  data.lessons.forEach((lesson, idx) => {
    pagesHTML += `<div id="page-${idx + 3}" class="magazine-page">${generateLessonHTML(lesson, lesson.number)}</div>`;
  });

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Revista Digital - ${data.title}</title><script src="https://cdn.tailwindcss.com"><\/script><style>:root{--primary-color:#B22222;--secondary-color:#01579B}body{font-family:'Inter',sans-serif;background:#fff;color:#333;margin:0}.magazine-page{width:100%;min-height:85vh}.hidden-left{transform:translateX(-100%);opacity:0;position:absolute;pointer-events:none}.hidden-right{transform:translateX(100%);opacity:0;position:absolute;pointer-events:none}.hidden-center{transform:translateX(0);opacity:1}</style></head><body><div id="content-area"><div class="page-container">${pagesHTML}</div></div><script>let currentPage=0;function showPage(n){document.querySelectorAll('.magazine-page').forEach((p,i)=>{p.classList.remove('hidden-left','hidden-right','hidden-center');if(i===n)p.classList.add('hidden-center');else if(i<n)p.classList.add('hidden-left');else p.classList.add('hidden-right')});currentPage=n}showPage(0);<\/script></body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { sumarioUrl } = req.body;
  if (!sumarioUrl) {
    return res.status(400).json({ error: 'URL do sumário é obrigatória' });
  }

  try {
    console.log('🚀 Iniciando extração EBD:', sumarioUrl);
    
    // Extrai ano e trimestre
    let year = 2026;
    let quarter = 1;
    const yearMatch = sumarioUrl.match(/(\d{4})/);
    if (yearMatch) year = parseInt(yearMatch[1]);
    if (sumarioUrl.includes('2º') || sumarioUrl.includes('-02-')) quarter = 2;
    else if (sumarioUrl.includes('3º') || sumarioUrl.includes('-03-')) quarter = 3;
    else if (sumarioUrl.includes('4º') || sumarioUrl.includes('-04-')) quarter = 4;

    // Metadados
    let title = `${quarter}º Trimestre de ${year}`;
    let commentator = 'Comentarista: Douglas Baptista';

    try {
      const { data: html } = await axios.get(sumarioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        responseType: 'arraybuffer',
        transformResponse: [(d: Buffer) => new TextDecoder('iso-8859-1').decode(d)]
      });
      const $ = cheerio.load(html);
      const pageTitle = $('h1, h2, .titulo').first().text().trim();
      if (pageTitle) title = pageTitle;
    } catch (e) {
      console.warn('Erro ao extrair metadados:', e);
    }

    // Extrai lições
    const lessonLinks = generateLessonLinks(year, quarter);
    const lessons: Lesson[] = [];
    const batchSize = 2;

    for (let i = 0; i < lessonLinks.length; i += batchSize) {
      const batch = lessonLinks.slice(i, i + batchSize);
      const batchLessons = await Promise.all(batch.map((url, idx) => extractLesson(url, i + idx + 1)));
      lessons.push(...batchLessons);
      console.log(`✅ Lições ${i + 1}-${Math.min(i + batchSize, lessonLinks.length)}`);
    }

    // Gera HTML
    const magazineHTML = generateMagazineHTML({ year, quarter, title, commentator, lessons });

    // Salva no Vercel KV ou retorna direto
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      data: { year, quarter, title, commentator, lessons },
      magazineHTML
    });
  } catch (error) {
    console.error('❌ Erro extração:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Falha ao extrair conteúdo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
