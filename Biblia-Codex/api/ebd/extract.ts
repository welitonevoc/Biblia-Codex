import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
    let year = 2026;
    let quarter = 1;
    const yearMatch = sumarioUrl.match(/(\d{4})/);
    if (yearMatch) year = parseInt(yearMatch[1]);
    if (sumarioUrl.includes('2º') || sumarioUrl.includes('-02-')) quarter = 2;
    else if (sumarioUrl.includes('3º') || sumarioUrl.includes('-03-')) quarter = 3;
    else if (sumarioUrl.includes('4º') || sumarioUrl.includes('-04-')) quarter = 4;

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

    const lessonLinks = generateLessonLinks(year, quarter);
    const lessons: Lesson[] = [];
    const batchSize = 2;

    for (let i = 0; i < lessonLinks.length; i += batchSize) {
      const batch = lessonLinks.slice(i, i + batchSize);
      const batchLessons = await Promise.all(batch.map((url, idx) => extractLesson(url, i + idx + 1)));
      lessons.push(...batchLessons);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      data: { year, quarter, title, commentator, lessons }
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
