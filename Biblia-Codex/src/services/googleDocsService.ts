import { Note } from '../types';

type GoogleDocsRequest = {
  insertText?: {
    text: string;
    location: { index: number };
  };
  updateTextStyle?: {
    range: { startIndex: number; endIndex: number };
    textStyle: Record<string, unknown>;
    fields: string;
  };
  updateParagraphStyle?: {
    range: { startIndex: number; endIndex: number };
    paragraphStyle: Record<string, unknown>;
    fields: string;
  };
};

interface TextStyleRange {
  startIndex: number;
  endIndex: number;
  textStyle: Record<string, unknown>;
  fields: string;
}

interface ParagraphRange {
  startIndex: number;
  endIndex: number;
  paragraphStyle: Record<string, unknown>;
  fields: string;
}

interface InlineContext {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  linkUrl?: string;
}

const HEX_TO_RGB = (hex: string) => {
  const normalized = hex.replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized.padEnd(6, '0');

  const value = Number.parseInt(safe.slice(0, 6), 16);
  return {
    red: ((value >> 16) & 255) / 255,
    green: ((value >> 8) & 255) / 255,
    blue: (value & 255) / 255,
  };
};

const htmlToGoogleDocsText = (html: string, title: string) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = document.body.firstElementChild as HTMLElement | null;

  let text = '';
  const textStyles: TextStyleRange[] = [];
  const paragraphStyles: ParagraphRange[] = [];

  const pushText = (value: string, context: InlineContext = {}) => {
    if (!value) return;

    const startIndex = text.length + 1;
    text += value;
    const endIndex = text.length + 1;

    const fields: string[] = [];
    const textStyle: Record<string, unknown> = {};

    if (context.bold) {
      textStyle.bold = true;
      fields.push('bold');
    }

    if (context.italic) {
      textStyle.italic = true;
      fields.push('italic');
    }

    if (context.underline) {
      textStyle.underline = true;
      fields.push('underline');
    }

    if (context.code) {
      textStyle.weightedFontFamily = { fontFamily: 'Courier New' };
      fields.push('weightedFontFamily');
      textStyle.backgroundColor = {
        color: { rgbColor: HEX_TO_RGB('#EEE8FF') },
      };
      fields.push('backgroundColor');
    }

    if (context.backgroundColor) {
      textStyle.backgroundColor = {
        color: { rgbColor: HEX_TO_RGB(context.backgroundColor) },
      };
      fields.push('backgroundColor');
    }

    if (context.foregroundColor) {
      textStyle.foregroundColor = {
        color: { rgbColor: HEX_TO_RGB(context.foregroundColor) },
      };
      fields.push('foregroundColor');
    }

    if (context.linkUrl) {
      textStyle.link = { url: context.linkUrl };
      fields.push('link');
    }

    if (fields.length > 0) {
      textStyles.push({
        startIndex,
        endIndex,
        textStyle,
        fields: fields.join(','),
      });
    }
  };

  const ensureParagraphSpacing = () => {
    if (!text.endsWith('\n') && text.length > 0) {
      text += '\n';
    }
  };

  const pushParagraph = (
    render: () => void,
    paragraphStyle?: ParagraphRange['paragraphStyle'],
    fields?: string
  ) => {
    const startIndex = text.length + 1;
    render();
    if (!text.endsWith('\n')) {
      text += '\n';
    }
    const endIndex = text.length + 1;

    if (paragraphStyle && endIndex > startIndex) {
      paragraphStyles.push({
        startIndex,
        endIndex,
        paragraphStyle,
        fields: fields || Object.keys(paragraphStyle).join(','),
      });
    }
  };

  const getNodeColor = (value: string | null) => {
    if (!value) return undefined;
    const rgb = value.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgb) {
      const hex = [rgb[1], rgb[2], rgb[3]]
        .map((channel) => Number(channel).toString(16).padStart(2, '0'))
        .join('');
      return `#${hex}`;
    }

    if (value.startsWith('#')) {
      return value;
    }

    return undefined;
  };

  const renderInline = (node: Node, context: InlineContext = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent ?? '', context);
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    if (node.tagName === 'BR') {
      pushText('\n');
      return;
    }

    if (node.tagName === 'INPUT' && (node as HTMLInputElement).type === 'checkbox') {
      const checked = (node as HTMLInputElement).checked;
      pushText(checked ? '☑ ' : '☐ ', context);
      return;
    }

    const nextContext: InlineContext = { ...context };
    const tag = node.tagName.toLowerCase();

    if (tag === 'strong' || tag === 'b') nextContext.bold = true;
    if (tag === 'em' || tag === 'i') nextContext.italic = true;
    if (tag === 'u') nextContext.underline = true;
    if (tag === 'code') nextContext.code = true;
    if (tag === 'mark') nextContext.backgroundColor = '#FFF2A8';
    if (tag === 'a') nextContext.linkUrl = node.getAttribute('href') || undefined;

    const inlineColor = getNodeColor(node.style.color);
    const inlineBackground = getNodeColor(node.style.backgroundColor);
    if (inlineColor) nextContext.foregroundColor = inlineColor;
    if (inlineBackground) nextContext.backgroundColor = inlineBackground;

    Array.from(node.childNodes).forEach((child) => renderInline(child, nextContext));
  };

  const renderList = (element: HTMLElement, ordered = false) => {
    Array.from(element.children).forEach((child, index) => {
      if (!(child instanceof HTMLElement) || child.tagName.toLowerCase() !== 'li') return;

      pushParagraph(() => {
        pushText(ordered ? `${index + 1}. ` : '• ');
        Array.from(child.childNodes).forEach((node) => renderInline(node));
      });
    });
  };

  const renderBlock = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.textContent?.trim();
      if (!value) return;
      pushParagraph(() => pushText(value));
      return;
    }

    if (!(node instanceof HTMLElement)) return;

    const tag = node.tagName.toLowerCase();

    if (tag === 'ul') {
      renderList(node, false);
      return;
    }

    if (tag === 'ol') {
      renderList(node, true);
      return;
    }

    if (tag === 'hr') {
      pushParagraph(() => pushText('──────────'));
      return;
    }

    if (tag === 'div' && node.classList.contains('note-callout')) {
      pushParagraph(
        () => Array.from(node.childNodes).forEach((child) => renderInline(child)),
        {
          indentStart: { magnitude: 18, unit: 'PT' },
          borderLeft: {
            width: { magnitude: 2, unit: 'PT' },
            padding: { magnitude: 8, unit: 'PT' },
            color: { color: { rgbColor: HEX_TO_RGB('#7C5FC8') } },
            dashStyle: 'SOLID',
          },
        },
        'indentStart,borderLeft'
      );
      return;
    }

    const paragraphStyleMap: Record<string, ParagraphRange['paragraphStyle'] | undefined> = {
      h1: { namedStyleType: 'HEADING_1' },
      h2: { namedStyleType: 'HEADING_2' },
      h3: { namedStyleType: 'HEADING_3' },
      blockquote: {
        indentStart: { magnitude: 24, unit: 'PT' },
        spaceAbove: { magnitude: 8, unit: 'PT' },
        spaceBelow: { magnitude: 8, unit: 'PT' },
      },
      pre: {
        indentStart: { magnitude: 18, unit: 'PT' },
        spaceAbove: { magnitude: 6, unit: 'PT' },
        spaceBelow: { magnitude: 6, unit: 'PT' },
      },
    };

    const fieldsMap: Record<string, string> = {
      h1: 'namedStyleType',
      h2: 'namedStyleType',
      h3: 'namedStyleType',
      blockquote: 'indentStart,spaceAbove,spaceBelow',
      pre: 'indentStart,spaceAbove,spaceBelow',
    };

    pushParagraph(
      () => Array.from(node.childNodes).forEach((child) => renderInline(child)),
      paragraphStyleMap[tag],
      fieldsMap[tag]
    );
  };

  if (title.trim()) {
    pushParagraph(() => pushText(title.trim(), { bold: true }), { namedStyleType: 'TITLE' }, 'namedStyleType');
    text += '\n';
  }

  Array.from(root?.childNodes ?? []).forEach((node) => renderBlock(node));
  ensureParagraphSpacing();

  return {
    text,
    textStyles,
    paragraphStyles,
  };
};

const buildGoogleDocsRequests = (note: Note): GoogleDocsRequest[] => {
  const { text, textStyles, paragraphStyles } = htmlToGoogleDocsText(note.content, note.title);

  const requests: GoogleDocsRequest[] = [
    {
      insertText: {
        text,
        location: { index: 1 },
      },
    },
  ];

  textStyles.forEach((style) => {
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: style.startIndex,
          endIndex: style.endIndex,
        },
        textStyle: style.textStyle,
        fields: style.fields,
      },
    });
  });

  paragraphStyles.forEach((style) => {
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: style.startIndex,
          endIndex: style.endIndex,
        },
        paragraphStyle: style.paragraphStyle,
        fields: style.fields,
      },
    });
  });

  return requests;
};

const googleFetch = async <T>(accessToken: string, url: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao comunicar com Google Docs.');
  }

  return response.json() as Promise<T>;
};

export const exportNoteToGoogleDocs = async (note: Note, accessToken: string) => {
  const createdDocument = await googleFetch<{ documentId: string }>(
    accessToken,
    'https://docs.googleapis.com/v1/documents',
    {
      method: 'POST',
      body: JSON.stringify({
        title: note.title.trim() || 'Sem título',
      }),
    }
  );

  const requests = buildGoogleDocsRequests(note);

  await googleFetch(
    accessToken,
    `https://docs.googleapis.com/v1/documents/${createdDocument.documentId}:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({ requests }),
    }
  );

  return {
    documentId: createdDocument.documentId,
    url: `https://docs.google.com/document/d/${createdDocument.documentId}/edit`,
  };
};
