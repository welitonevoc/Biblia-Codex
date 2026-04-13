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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { sumarioUrl } = req.body;
  if (!sumarioUrl) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).json({ error: 'URL do sumário é obrigatória' });
  }

  try {
    let year = 2026, quarter = 1;
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
    } catch (e) { console.warn('Erro metadados:', e); }

    const lessons: Lesson[] = [];
    const baseUrl = `https://www.estudantesdabiblia.com.br/licoes_cpad/${year}`;

    for (let i = 1; i <= 13; i++) {
      const date = `${year}-${quarter.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const url = `${baseUrl}/${date}.htm`;
      try {
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
          responseType: 'arraybuffer',
          transformResponse: [(d: Buffer) => new TextDecoder('iso-8859-1').decode(d)]
        });
        const $ = cheerio.load(data);
        $('script, style, iframe, .anuncio, .banner').remove();
        let lTitle = $('h1, h2, .titulo').first().text().trim() || `Lição ${i}`;
        lTitle = lTitle.replace(/^LIÇÕES BÍBLICAS\s*CPAD\s*/i, '').trim() || `Lição ${i}`;

        lessons.push({
          number: i, title: lTitle,
          textAureo: $('.texto-aureo, .text-aureo').first().html() || '<p>"Porque Deus amou o mundo..." (João 3.16)</p>',
          verdadePratica: $('.verdade-pratica').first().html() || '<p>Verdade prática.</p>',
          leituraDiaria: $('.leitura-diaria').first().html() || '<p><strong>Segunda</strong> - Gn 1.1</p>',
          leituraBiblica: $('.leitura-biblica').first().html() || '<p>Texto bíblico...</p>',
          introducao: $('.introducao').first().html() || '<p>Introdução...</p>',
          topicos: [
            { title: 'I - Tópico 1', content: $('.topico-1').first().html() || '<p>Conteúdo...</p>' },
            { title: 'II - Tópico 2', content: $('.topico-2').first().html() || '<p>Conteúdo...</p>' },
            { title: 'III - Tópico 3', content: $('.topico-3').first().html() || '<p>Conteúdo...</p>' }
          ],
          conclusao: $('.conclusao').first().html() || '<p>Conclusão...</p>',
          comentario: $('.comentario').first().html() || '<p>Comentário...</p>',
          sinopse: $('.sinopse').first().html() || '<p>Sinopse...</p>'
        });
      } catch (err) {
        lessons.push({
          number: i, title: `Lição ${i}`,
          textAureo: '<p>"Porque Deus amou o mundo..." (João 3.16)</p>',
          verdadePratica: '<p>Verdade prática.</p>', leituraDiaria: '<p>Leitura...</p>',
          leituraBiblica: '<p>Texto bíblico...</p>', introducao: '<p>Introdução...</p>',
          topicos: [{ title: 'I - Tópico', content: '<p>Conteúdo...</p>' }],
          conclusao: '<p>Conclusão...</p>', comentario: '<p>Comentário...</p>', sinopse: '<p>Sinopse...</p>'
        });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true, data: { year, quarter, title, commentator, lessons } });
  } catch (error) {
    console.error('Erro extração:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Falha ao extrair', details: error instanceof Error ? error.message : 'Erro' });
  }
}
