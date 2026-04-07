import { BIBLE_BOOKS } from '../data/bibleMetadata';
import { BookNumberConverter } from './BookNumberConverter';

/**
 * Parser de HTML de devocionais MyBible.
 * Suporta múltiplos formatos: Max Lucado, Hernandes Dias Lopes,
 * Alejandro Bullón, Spurgeon (Manhã & Noite), World Challenge.
 */

export interface ParsedDevotional {
  title?: string;
  date?: string;
  verseRef?: string;
  verseText?: string;
  body: string;
  morningText?: string;
  eveningText?: string;
}

export type DevotionalFormat = 'lucado' | 'hernandes' | 'bullon' | 'spurgeon' | 'worldchallenge' | 'generic';

/** Detecta o formato do HTML do devocional */
export function detectDevotionalFormat(html: string): DevotionalFormat {
  if (html.includes('class="capitulos"') || html.includes('class="cap1"')) return 'lucado';
  if (html.includes('class="hr-middle"') && html.includes('class="center"')) return 'hernandes';
  if (html.includes('class="titulo"') && html.includes('class="texto-capitular"')) return 'bullon';
  if (html.includes("class='manhã'") || html.includes("class='manh'") || html.includes('id=manh')) return 'spurgeon';
  if (html.includes('class="page-header"') || html.includes('wcAuthorInfo')) return 'worldchallenge';
  return 'generic';
}

/** Extrai texto limpo de HTML, removendo tags */
function extractText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrai conteúdo entre tags específicas */
function extractTagContent(html: string, tagPattern: RegExp): string | undefined {
  const match = html.match(tagPattern);
  if (!match) return undefined;
  return extractText(match[1]);
}

/** Limpa HTML removendo scripts e estilos inline, mantendo estrutura semântica */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(body|html|head)[^>]*>/gi, '')
    .replace(/<\/(body|html|head)>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/** Parse devocional formato Max Lucado */
function parseLucado(html: string): ParsedDevotional {
  const date = extractTagContent(html, /<h2[^>]*class="capitulos"[^>]*>([\s\S]*?)<\/h2>/i);
  const title = extractTagContent(html, /<p[^>]*class="cap1"[^>]*>([\s\S]*?)<\/p>/i);
  const verseText = extractTagContent(html, /<p[^>]*class="Versiculo"[^>]*>([\s\S]*?)<\/p>/i);
  const verseRef = extractTagContent(html, /<span[^>]*class="Versalete"[^>]*>([\s\S]*?)<\/span>/i);

  // Body: tudo depois do <hr class="marker"/>
  const markerIdx = html.indexOf('class="marker"');
  let body = '';
  if (markerIdx > -1) {
    const afterMarker = html.substring(markerIdx);
    const nextP = afterMarker.indexOf('<p');
    if (nextP > -1) {
      // Pular o versículo e pegar o resto
      const versiculoEnd = afterMarker.indexOf('</p>', nextP);
      if (versiculoEnd > -1) {
        const versRefEnd = afterMarker.indexOf('</p>', versiculoEnd + 4);
        if (versRefEnd > -1) {
          body = sanitizeHtml(afterMarker.substring(versRefEnd + 4));
        }
      }
    }
  }

  // Fallback: pegar todos os <p> depois do marker
  if (!body || body.length < 20) {
    const paragraphs = html.match(/<p[^>]*class="texto"[^>]*>[\s\S]*?<\/p>/gi);
    if (paragraphs) {
      body = sanitizeHtml(paragraphs.join('\n'));
    }
  }

  // Remover menu se presente
  body = body.replace(/<!--MENU-->[\s\S]*?<!--MENU-->/g, '').trim();

  return { title, date, verseRef, verseText, body: sanitizeHtml(body) || html };
}

/** Parse devocional formato Hernandes Dias Lopes (GCPA) */
function parseHernandes(html: string): ParsedDevotional {
  const verseRef = extractTagContent(html, /<i[^>]*class="versiculo"[^>]*>([\s\S]*?)<\/i>/i);
  const title = extractTagContent(html, /<h2[^>]*>([\s\S]*?)<\/h2>/i);

  // Body: remover a imagem base64 do header e pegar o resto
  let body = html.replace(/<div[^>]*class="hr-middle"[\s\S]*?<\/div>/i, '');
  body = body.replace(/<p[^>]*class="center"[^>]*>[\s\S]*?<\/p>/i, '');
  body = sanitizeHtml(body);

  return { title, verseRef, body };
}

/** Parse devocional formato Alejandro Bullón (JPAV) */
function parseBullon(html: string): ParsedDevotional {
  const date = extractTagContent(html, /<p[^>]*class="data"[^>]*>([\s\S]*?)<\/p>/i);
  const title = extractTagContent(html, /<p[^>]*class="titulo"[^>]*>([\s\S]*?)<\/p>/i);

  // Versículo e referência
  const versiculoMatch = html.match(/<p[^>]*class="versiculo"[^>]*>([\s\S]*?)<\/p>/i);
  let verseText: string | undefined;
  let verseRef: string | undefined;
  if (versiculoMatch) {
    const inner = versiculoMatch[1];
    verseText = extractTagContent(inner, /<i>([\s\S]*?)<\/i>/i);
    // Referência é o texto após </i> ou dentro de <br>
    const afterItalic = inner.replace(/<i>[\s\S]*?<\/i>/i, '').replace(/<br\s*\/?>/i, '').replace(/[()]/g, '').trim();
    if (afterItalic) verseRef = extractText(afterItalic);
  }

  // Body: texto-capitular + texto
  const paragraphs: string[] = [];
  const capMatch = html.match(/<p[^>]*class="texto-capitular"[^>]*>([\s\S]*?)<\/p>/i);
  if (capMatch) paragraphs.push(capMatch[0]);
  const textMatches = html.match(/<p[^>]*class="texto"[^>]*>[\s\S]*?<<\/p>/gi);
  if (textMatches) paragraphs.push(...textMatches);

  const body = paragraphs.length > 0
    ? sanitizeHtml(paragraphs.join('\n'))
    : sanitizeHtml(html);

  return { title, date, verseRef, verseText, body };
}

/** Parse devocional formato Spurgeon (Manhã & Noite) */
function parseSpurgeon(html: string): ParsedDevotional {
  // Separar manhã e noite pelo <h3> (🌙 emoji) ou <h2>Noite</h2>
  const nightMarker = html.search(/<h[23][^>]*>.*?(Noite|&#127769;)/i);
  let morningHtml = html;
  let eveningHtml = '';

  if (nightMarker > -1) {
    morningHtml = html.substring(0, nightMarker);
    eveningHtml = html.substring(nightMarker);
  }

  // Extrair versículo da manhã
  const morningVerse = extractTagContent(morningHtml, /<em>([\s\S]*?)<\/em>/i);
  const morningRef = extractTagContent(morningHtml, /<span[^>]*class="verso"[^>]*>([\s\S]*?)<\/span>/i);

  // Limpar manhã: remover headers de navegação
  let morningBody = morningHtml
    .replace(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi, '')
    .replace(/<hr[^>]*>/gi, '')
    .replace(/<em>[\s\S]*?<\/em>/i, '')
    .replace(/<span[^>]*class="verso"[^>]*>[\s\S]*?<\/span>/i, '');
  morningBody = sanitizeHtml(morningBody);

  // Extrair versículo da noite
  let eveningBody = '';
  let eveningVerse: string | undefined;
  let eveningRef: string | undefined;
  if (eveningHtml) {
    eveningVerse = extractTagContent(eveningHtml, /<em>([\s\S]*?)<\/em>/i);
    eveningRef = extractTagContent(eveningHtml, /<span[^>]*class="verso"[^>]*>([\s\S]*?)<\/span>/i);
    eveningBody = eveningHtml
      .replace(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi, '')
      .replace(/<hr[^>]*>/gi, '')
      .replace(/<em>[\s\S]*?<\/em>/i, '')
      .replace(/<span[^>]*class="verso"[^>]*>[\s\S]*?<\/span>/i, '');
    eveningBody = sanitizeHtml(eveningBody);
  }

  // Construir versículo completo
  const verseParts: string[] = [];
  if (morningVerse) verseParts.push(morningVerse);
  if (morningRef) verseParts.push(morningRef);
  const verseText = verseParts.join(' ') || undefined;

  // Converter referências bíblicas B:NNN N:N para formato legível
  const convertBibleRef = (ref: string): string => {
    return ref
      .replace(/<a[^>]*href='B:\d+ \d+:\d+'[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      .replace(/<a[^>]*href='B:\d+ \d+:\d+-\d+:\d+'[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  };

  return {
    verseText: verseText ? convertBibleRef(verseText) : undefined,
    morningText: morningBody,
    eveningText: eveningBody || undefined,
    body: morningBody, // fallback
  };
}

/** Parse devocional formato World Challenge */
function parseWorldChallenge(html: string): ParsedDevotional {
  const title = extractTagContent(html, /<h1[^>]*class="page-header"[^>]*>([\s\S]*?)<\/h1>/i);
  const author = extractTagContent(html, /<div[^>]*class="wcAuthorInfo"[^>]*>([\s\S]*?)<\/div>/i);

  // Body: tudo dentro de field-item
  let body = html;
  const fieldMatch = html.match(/<div[^>]*class="field-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
  if (fieldMatch) {
    body = fieldMatch[1];
  }

  // Extrair versículo do <em> inicial
  const verseText = extractTagContent(body, /<em>([\s\S]*?)<\/em>/i);

  // Limpar includes MyBible
  body = body.replace(/<!--\s*INCLUDE\([^)]+\)\s*-->/g, '');

  return { title, verseText, body: sanitizeHtml(body) };
}

/** Parse genérico: extrai título e corpo */
function parseGeneric(html: string): ParsedDevotional {
  const title = extractTagContent(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  const verseText = extractTagContent(html, /<em>([\s\S]*?)<\/em>/i);
  return { title, verseText, body: sanitizeHtml(html) };
}

/** Função principal: detecta formato e faz parse */
export function parseDevotional(html: string): ParsedDevotional {
  if (!html || html.trim().length === 0) {
    return { body: '' };
  }

  const format = detectDevotionalFormat(html);

  switch (format) {
    case 'lucado': return parseLucado(html);
    case 'hernandes': return parseHernandes(html);
    case 'bullon': return parseBullon(html);
    case 'spurgeon': return parseSpurgeon(html);
    case 'worldchallenge': return parseWorldChallenge(html);
    default: return parseGeneric(html);
  }
}

/** Extrai referências bíblicas do texto para links clicáveis */
export function extractBibleReferences(html: string): { ref: string; bookId?: string; chapter?: number; verse?: number }[] {
  const refs: { ref: string; bookId?: string; chapter?: number; verse?: number }[] = [];

  // Padrão MyBible: href='B:NNN N:N'
  const mybiblePattern = /href='B:(\d+) (\d+):(\d+)'/g;
  let match;
  while ((match = mybiblePattern.exec(html)) !== null) {
    refs.push({
      ref: match[0],
      bookId: myBibleBookIdToStandard(parseInt(match[1])),
      chapter: parseInt(match[2]),
      verse: parseInt(match[3]),
    });
  }

  // Padrão MyBible range: href='B:NNN N:N-N:N'
  const rangePattern = /href='B:(\d+) (\d+):(\d+)-(\d+):(\d+)'/g;
  while ((match = rangePattern.exec(html)) !== null) {
    refs.push({
      ref: match[0],
      bookId: myBibleBookIdToStandard(parseInt(match[1])),
      chapter: parseInt(match[2]),
      verse: parseInt(match[3]),
    });
  }

  return refs;
}

/** Converte número do livro MyBible para bookId padrão */
export function myBibleBookIdToStandard(myBibleId: number): string {
  const standardId = BookNumberConverter.fromMyBible(myBibleId);
  return BIBLE_BOOKS.find((book) => book.numericId === standardId)?.id || '';
}
