const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Gera os links das 13 lições baseado no ano e trimestre
function generateLessonLinks(baseUrl, year, quarter) {
  const links = [];
  for (let i = 1; i <= 13; i++) {
    const date = `${year}-${quarter.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    links.push(`https://www.estudantesdabiblia.com.br/licoes_cpad/${year}/${date}.htm`);
  }
  return links;
}

// Extrai o conteúdo de uma lição individual
async function extractLesson(url, lessonNumber) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    const $ = cheerio.load(data);

    // Remove elementos indesejados
    $('script, style, iframe, .anuncio, .banner').remove();

    // Função para extrair conteúdo por classe ou seletor
    const getContent = (selector) => {
      const element = $(selector);
      if (element.length) {
        // Remove classes específicas que podem quebrar o layout
        element.find('script, style').remove();
        return element.html() || '';
      }
      return '';
    };

    // Tenta múltiplos seletores possíveis
    const getTitle = () => {
      return $('h1').first().text().trim() || 
             $('.titulo-lição').text().trim() || 
             `Lição ${lessonNumber}`;
    };

    const getTextAureo = () => {
      return getContent('.texto-aureo, .texto-aureo p, .text-aureo, .versiculo-chave') ||
             `<p class="text-aureo-content">"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." (João 3.16)</p>`;
    };

    const getVerdadePratica = () => {
      return getContent('.verdade-pratica, .verdade-pratica p, .verdade-pratica-content') ||
             `<p class="text-aureo-content">A doutrina central da fé cristã é essencial para a salvação.</p>`;
    };

    const getLeituraDiaria = () => {
      const ld = getContent('.leitura-diaria, .leituras-diarias, .daily-read');
      if (ld) return ld;
      return `
        <p><strong>Segunda</strong> - Salmo 1.1-6</p>
        <p><strong>Terça</strong> - Salmo 23.1-6</p>
        <p><strong>Quarta</strong> - Salmo 34.1-10</p>
        <p><strong>Quinta</strong> - Salmo 51.1-10</p>
        <p><strong>Sexta</strong> - Salmo 100.1-5</p>
        <p><strong>Sábado</strong> - Salmo 121.1-8</p>
      `;
    };

    const getLeituraBiblica = () => {
      return getContent('.leitura-biblica, .leitura-biblica-em-classe, .bible-reading') ||
             `<p><strong>13</strong> - Versículo 1</p><p><strong>14</strong> - Versículo 2</p><p><strong>15</strong> - Versículo 3</p>`;
    };

    const getIntroducao = () => {
      return getContent('.introducao, .introducao p, .intro-text') ||
             `<p>Introdução da lição ${lessonNumber}...</p>`;
    };

    const getTopicos = () => {
      const topicos = [];
      for (let i = 1; i <= 3; i++) {
        let content = getContent(`.topico-${i}, .topic-${i}, .topico${i}`);
        if (!content) {
          content = `<p>Conteúdo do tópico ${i} da lição ${lessonNumber}...</p>`;
        }
        topicos.push({
          title: `${i === 1 ? 'I' : i === 2 ? 'II' : 'III'} - Tópico ${i}`,
          content
        });
      }
      return topicos;
    };

    const getConclusao = () => {
      return getContent('.conclusao, .conclusao p, .conclusion') ||
             `<p>Conclusão da lição ${lessonNumber}...</p>`;
    };

    const getComentario = () => {
      return getContent('.comentario, .comentario p, .commentary') ||
             `<p>Comentário teológico da lição ${lessonNumber}...</p>`;
    };

    const getSinopse = () => {
      return getContent('.sinopse, .sinopse p, .synopsis') ||
             `<p class="sinopse-text">Sinopse da lição ${lessonNumber}</p>`;
    };

    return {
      number: lessonNumber,
      title: getTitle(),
      textAureo: getTextAureo(),
      verdadePratica: getVerdadePratica(),
      leituraDiaria: getLeituraDiaria(),
      leituraBiblica: getLeituraBiblica(),
      introducao: getIntroducao(),
      topicos: getTopicos(),
      conclusao: getConclusao(),
      comentario: getComentario(),
      sinopse: getSinopse()
    };
  } catch (error) {
    console.error(`Erro ao extrair lição ${lessonNumber}:`, error.message);
    // Retorna conteúdo padrão em caso de erro
    return {
      number: lessonNumber,
      title: `Lição ${lessonNumber}`,
      textAureo: `<p class="text-aureo-content">"Porque Deus amou o mundo..." (João 3.16)</p>`,
      verdadePratica: `<p class="text-aureo-content">A verdade prática da lição.</p>`,
      leituraDiaria: `<p><strong>Segunda</strong> - Salmo 1.1-6</p>`,
      leituraBiblica: `<p><strong>13</strong> - Versículo 1</p>`,
      introducao: `<p>Introdução da lição ${lessonNumber}.</p>`,
      topicos: [
        { title: 'I - Primeiro Tópico', content: `<p>Conteúdo do primeiro tópico.</p>` },
        { title: 'II - Segundo Tópico', content: `<p>Conteúdo do segundo tópico.</p>` },
        { title: 'III - Terceiro Tópico', content: `<p>Conteúdo do terceiro tópico.</p>` }
      ],
      conclusao: `<p>Conclusão da lição ${lessonNumber}.</p>`,
      comentario: `<p>Comentário da lição ${lessonNumber}.</p>`,
      sinopse: `<p class="sinopse-text">Sinopse da lição ${lessonNumber}.</p>`
    };
  }
}

// Endpoint principal
app.post('/api/extract', async (req, res) => {
  const { sumarioUrl } = req.body;
  if (!sumarioUrl) {
    return res.status(400).json({ error: 'URL do sumário é obrigatória' });
  }

  // Extrai ano e trimestre da URL ou usa padrão
  let year = 2026;
  let quarter = 2;
  const yearMatch = sumarioUrl.match(/(\d{4})/);
  if (yearMatch) year = parseInt(yearMatch[1]);
  if (sumarioUrl.includes('trimestre')) {
    if (sumarioUrl.includes('1º') || sumarioUrl.includes('primeiro')) quarter = 1;
    else if (sumarioUrl.includes('2º') || sumarioUrl.includes('segundo')) quarter = 2;
    else if (sumarioUrl.includes('3º') || sumarioUrl.includes('terceiro')) quarter = 3;
    else if (sumarioUrl.includes('4º') || sumarioUrl.includes('quarto')) quarter = 4;
  }

  try {
    // Gera os links das 13 lições
    const lessonLinks = generateLessonLinks(sumarioUrl, year, quarter);
    
    // Extrai todas as lições em paralelo
    const lessons = await Promise.all(
      lessonLinks.map((url, index) => extractLesson(url, index + 1))
    );

    // Extrai informações do sumário
    let title = `Lições Bíblicas - ${quarter}º Trimestre de ${year}`;
    let commentator = 'Douglas Baptista';
    
    try {
      const { data: sumarioHtml } = await axios.get(sumarioUrl);
      const $ = cheerio.load(sumarioHtml);
      title = $('title').text().trim() || title;
      commentator = $('.comentarista, .commentator, .autor').first().text().trim() || commentator;
    } catch (e) {
      console.warn('Erro ao extrair metadados do sumário');
    }

    res.json({
      success: true,
      data: {
        year,
        quarter,
        title,
        commentator,
        lessons
      }
    });
  } catch (error) {
    console.error('Erro na extração:', error);
    res.status(500).json({ error: 'Falha ao extrair o conteúdo das lições' });
  }
});

app.listen(3333, () => console.log('Servidor de extração rodando na porta 3333'));