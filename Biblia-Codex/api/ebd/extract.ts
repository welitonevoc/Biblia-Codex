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
            <p class="sinopse-text">SINOPSE ${['I', 'II', 'III'][i]}</p>
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
  // Sidebar completo com 50 páginas
  const sidebarNav = `
    <aside id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-white border-r shadow-2xl transform -translate-x-full transition-transform duration-300 z-[10000] flex flex-col">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50">
            <span class="font-bold text-blue-900">MARCADORES</span>
            <button onclick="toggleSidebar()" class="text-red-600 font-bold">X</button>
        </div>
        <div id="bookmarks-list" class="p-4 flex flex-wrap gap-2 border-b bg-blue-50 min-h-[60px]">
            <span class="text-xs text-gray-400 italic">Nenhum marcador...</span>
        </div>
        <nav class="flex-grow overflow-y-auto">
            <button onclick="showPage(0)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">Capa</button>
            <button onclick="showPage(1)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">PALAVRA DA EDITORA</button>
            <button onclick="showPage(2)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50 font-bold text-blue-700">ÍNDICE (Sumário)</button>
            ${data.lessons.map((l, i) => `<button onclick="showPage(${i + 3})" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">Lição ${String(l.number).padStart(2, '0')}</button>`).join('')}
            <button onclick="showPage(16)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">CAPA LIVRO</button>
            <button onclick="showPage(17)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">SOBRE O AUTOR</button>
            <button onclick="showPage(18)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">APRESENTAÇÃO</button>
            <button onclick="showPage(19)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">ÍNDICE LIVRO (Sumário)</button>
            ${Array.from({ length: 13 }, (_, i) => `<button onclick="showPage(${i + 20})" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">CAPÍTULO ${i + 1}</button>`).join('')}
            <button onclick="showPage(33)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">CAPA DEVOCIONAL</button>
            <button onclick="showPage(34)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">APRESENTAÇÃO DEVOCIONAL</button>
            <button onclick="showPage(35)" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">ÍNDICE DEVOCIONAL</button>
            ${Array.from({ length: 13 }, (_, i) => `<button onclick="showPage(${i + 36})" class="w-full text-left px-6 py-3 border-b hover:bg-gray-50">Semana ${i + 1} / Lição ${i + 1}</button>`).join('')}
        </nav>
    </aside>`;

  let pagesHTML = `
    <div id="page-0" class="magazine-page"><img src="https://i.ibb.co/Gf6fWG0q/Capa.jpg" class="w-full"></div>
    <div id="page-1" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-blue-800 mb-6">Palavra da Editora</h2><p>Prezado(a) professor(a),</p><p>Este trimestre é um convite à adoração e ao aprendizado sobre Deus Pai, Filho e Espírito Santo.</p><p class="font-bold text-center text-blue-600 mt-4">Bom trimestre!</p></div></div>
    <div id="page-2" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-red-700">SUMÁRIO</h2><h3 class="text-xl font-bold text-center mt-2">${data.title}</h3><p class="text-center text-gray-600">${data.commentator}</p><div class="mt-6 space-y-2">${data.lessons.map(l => `<div class="flex items-center gap-3 p-3"><span class="font-bold text-blue-600 w-16 text-center bg-blue-50 py-1 rounded">${l.number}</span><span class="flex-1">${l.title}</span></div>`).join('')}</div></div></div>`;

  data.lessons.forEach((lesson, idx) => {
    pagesHTML += `<div id="page-${idx + 3}" class="magazine-page">${generateLessonHTML(lesson, lesson.number)}</div>`;
  });

  // Páginas 16-32: Livro de Apoio
  for (let i = 0; i < 13; i++) {
    const pageNum = i + 20;
    const lesson = data.lessons[i];
    pagesHTML += `<div id="page-${pageNum}" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-purple-800">CAPÍTULO ${i + 1}</h2><p class="text-center text-gray-600 mb-6">${lesson?.title || `Lição ${i + 1}`}</p><div class="space-y-4"><p>Conteúdo detalhado do capítulo ${i + 1} do livro de apoio. Este material complementar aprofunda os temas abordados na lição.</p>${lesson ? `<div class="bg-purple-50 p-4 rounded border border-purple-200 mt-4"><h4 class="font-bold text-purple-800 mb-2">Relacionado à Lição ${i + 1}</h4><p>${lesson.sinopse}</p></div>` : ''}</div></div></div>`;
  }

  // Páginas 33-35: Capa Devocional, Apresentação, Índice
  pagesHTML += `
    <div id="page-33" class="magazine-page"><div class="p-8 text-center"><h2 class="text-3xl font-bold text-teal-800">🙏 DEVOCIONAL</h2><p class="mt-4 text-gray-600">Devocionais Semanais</p></div></div>
    <div id="page-34" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-teal-800">APRESENTAÇÃO DEVOCIONAL</h2><p class="mt-4">Devocionais para cada semana do trimestre.</p></div></div>
    <div id="page-35" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-teal-800">ÍNDICE DEVOCIONAL</h2><div class="mt-6 space-y-2">${Array.from({ length: 13 }, (_, i) => `<div class="flex items-center gap-3 p-3"><span class="font-bold text-teal-600 w-20">Semana ${i + 1}</span><span class="flex-1">${data.lessons[i]?.title || `Lição ${i + 1}`}</span></div>`).join('')}</div></div></div>`;

  // Páginas 36-48: Devocionais Semanais
  for (let i = 0; i < 13; i++) {
    const pageNum = i + 36;
    const lesson = data.lessons[i];
    pagesHTML += `<div id="page-${pageNum}" class="magazine-page"><div class="p-8 max-w-4xl mx-auto"><h2 class="text-2xl font-bold text-center text-teal-800">🙏 Devocional - Semana ${i + 1}</h2><h3 class="text-xl font-bold text-center mb-4 text-gray-700">${lesson?.title || `Lição ${i + 1}`}</h3><div class="space-y-4"><div class="bg-teal-50 p-4 rounded"><p><strong>📖 Leitura do dia:</strong> Salmo ${i + 1}.1-10</p></div><div class="bg-blue-50 p-4 rounded"><p><strong>💭 Meditação:</strong> Reflexão sobre a importância da Trindade na vida cristã.</p></div><div class="bg-purple-50 p-4 rounded"><p><strong>🙏 Oração:</strong> Pai, que possamos viver em comunhão contigo e com teu Filho, pelo Espírito Santo.</p></div></div></div></div>`;
  }

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Revista Digital - ${data.title}</title><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet"><style>:root{--primary-color:#B22222;--secondary-color:#01579B;--reader-font-size:100%}body{font-family:'Inter',sans-serif;background:#fff;color:#333;margin:0;transition:background 0.3s}#content-area{font-size:var(--reader-font-size)}.magazine-page{width:100%;min-height:85vh}.hidden-left{transform:translateX(-100%);opacity:0;position:absolute;pointer-events:none}.hidden-right{transform:translateX(100%);opacity:0;position:absolute;pointer-events:none}.hidden-center{transform:translateX(0);opacity:1}.modal-biblico{display:none;position:fixed;z-index:9999;left:50%;top:50%;transform:translate(-50%,-50%);width:98%;max-width:550px;height:75vh;background:#39006a;border-radius:20px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);flex-direction:column;overflow:hidden;border:2px solid var(--secondary-color);animation:popupShow 0.3s ease-out}.modal-header-offline{background-color:var(--secondary-color)!important;color:white;padding:15px 20px;display:flex;justify-content:space-between;align-items:center}.modal-body-offline{padding:20px 15px;color:#39006a;line-height:1.7;font-size:1.25rem;background-color:#F0F8FF;flex:1 1 auto;overflow-y:auto}.modal-footer-offline{padding:15px;background-color:#E1F5FE;border-top:1px solid #B3E5FC;display:flex;justify-content:center}.btn-fechar{background-color:var(--secondary-color);color:white!important;width:200px;padding:12px 0;border-radius:12px;font-weight:800;text-transform:uppercase;border:none;cursor:pointer}.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9998;backdrop-filter:blur(2px)}@keyframes popupShow{from{opacity:0;transform:translate(-50%,-48%) scale(0.96)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}.bible{color:#39006a!important;font-weight:bold!important;text-decoration:none;cursor:pointer}.bible:hover{text-decoration:underline}</style></head><body>${sidebarNav}<div id="overlay-biblico" class="modal-overlay" onclick="fecharModal()"></div><div id="modalVersiculo" class="modal-biblico"><div class="modal-header-offline"><h4 id="modalTitulo" style="margin:0;">REFERÊNCIA</h4><span onclick="fecharModal()" style="cursor:pointer;font-size:30px;">&times;</span></div><div class="modal-body-offline"><p id="modalTexto"></p></div><div class="modal-footer-offline"><button class="btn-fechar" onclick="fecharModal()">FECHAR</button></div></div><header class="sticky top-0 z-50 w-full bg-white border-b p-3 flex justify-between items-center px-4"><button onclick="toggleSidebar()" class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold">MENU</button><button onclick="toggleBookmark()" class="p-2"><svg id="bookmark-icon" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 transition-colors duration-300" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="fill:none;color:#9CA3AF;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button><div class="flex gap-2"><button onclick="changeFontSize(-10)" class="bg-gray-100 px-2 py-1 rounded font-bold">A-</button><button onclick="changeFontSize(10)" class="bg-gray-100 px-2 py-1 rounded font-bold">A+</button></div></header><div id="content-area"><div class="page-container">${pagesHTML}</div></div><footer class="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-between items-center px-6 shadow-md z-40"><button onclick="prevPage()" class="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50">← Anterior</button><span id="page-indicator" class="text-xs font-bold text-gray-400">Pág. 1 de 49</span><button onclick="nextPage()" class="bg-gray-100 px-4 py-2 rounded-full font-bold disabled:opacity-50">Próxima →</button></footer><script>let currentPage=0;const totalPages=49;let bookmarks=JSON.parse(localStorage.getItem('revista_bookmarks'))||[];function showPage(n){if(n<0||n>=totalPages)return;document.querySelectorAll('.magazine-page').forEach((p,i)=>{p.classList.remove('hidden-left','hidden-right','hidden-center');if(i===n)p.classList.add('hidden-center');else if(i<n)p.classList.add('hidden-left');else p.classList.add('hidden-right')});currentPage=n;updateIndicator()}function nextPage(){if(currentPage<totalPages-1)showPage(currentPage+1)}function prevPage(){if(currentPage>0)showPage(currentPage-1)}function updateIndicator(){const el=document.getElementById('page-indicator');if(el)el.textContent='Pág. '+(currentPage+1)+' de '+totalPages}function toggleSidebar(){const s=document.getElementById('sidebar');s.classList.toggle('-translate-x-full')}function toggleBookmark(){const idx=bookmarks.indexOf(currentPage);if(idx===-1)bookmarks.push(currentPage);else bookmarks.splice(idx,1);localStorage.setItem('revista_bookmarks',JSON.stringify(bookmarks));const icon=document.getElementById('bookmark-icon');if(icon){icon.style.fill=bookmarks.includes(currentPage)?'#01579B':'none'}}function changeFontSize(d){const r=document.documentElement;const s=parseFloat(getComputedStyle(r).getPropertyValue('--reader-font-size'))||100;r.style.setProperty('--reader-font-size',(Math.min(Math.max(s+d,80),150))+'%')}function fecharModal(){document.getElementById('modalVersiculo').style.display='none';document.getElementById('overlay-biblico').style.display='none'}document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')nextPage();if(e.key==='ArrowLeft')prevPage()});showPage(0);<\/script></body></html>`;
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
