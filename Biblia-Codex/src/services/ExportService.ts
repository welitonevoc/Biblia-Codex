import { Document, Paragraph, TextRun, HeadingLevel, Packer, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export type ExportFormat = 'pdf' | 'docx' | 'doc' | 'html';

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const getFileName = (title: string) =>
  (title || 'nota').trim().replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_') || 'nota';

function exportAsHtml(title: string, content: string): void {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 760px; margin: 40px auto; padding: 0 24px; line-height: 1.8; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    blockquote { border-left: 3px solid #888; padding-left: 1rem; color: #555; font-style: italic; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px 12px; }
  </style>
</head>
<body><h1>${title}</h1>${content}</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${getFileName(title)}.html`);
}

function exportAsPdf(title: string, content: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { margin: 2cm; }
    * { box-sizing: border-box; }
    body { font-family: 'Georgia', serif; font-size: 12pt; line-height: 1.8; color: #1a1a1a; }
    h1 { font-size: 22pt; margin: 0 0 18pt; border-bottom: 1px solid #ddd; padding-bottom: 8pt; }
    h2 { font-size: 16pt; margin: 16pt 0 8pt; }
    h3 { font-size: 13pt; margin: 12pt 0 6pt; }
    blockquote { border-left: 3px solid #888; padding-left: 12pt; color: #555; font-style: italic; margin: 10pt 0; }
    code { background: #f4f4f4; padding: 1pt 4pt; border-radius: 3pt; font-family: 'Courier New', monospace; font-size: 10pt; }
    pre { background: #f4f4f4; padding: 10pt; border-radius: 4pt; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    th, td { border: 1px solid #ccc; padding: 6pt 10pt; font-size: 10pt; }
    th { background: #f4f4f4; font-weight: bold; }
    ul, ol { padding-left: 20pt; margin: 6pt 0; }
    li { margin: 2pt 0; }
    img { max-width: 100%; }
    a { color: #2563eb; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
</body>
</html>`);
  printWindow.document.close();
}

async function exportAsDocx(title: string, content: string): Promise<void> {
  const parseHtmlToParagraphs = (html: string): Paragraph[] => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const paragraphs: Paragraph[] = [];

    const processNode = (node: Element | ChildNode) => {
      const el = node as Element;
      const tag = el.tagName?.toLowerCase();
      const text = el.textContent || '';

      if (tag === 'h1') {
        paragraphs.push(new Paragraph({ text, heading: HeadingLevel.HEADING_1 }));
      } else if (tag === 'h2') {
        paragraphs.push(new Paragraph({ text, heading: HeadingLevel.HEADING_2 }));
      } else if (tag === 'h3') {
        paragraphs.push(new Paragraph({ text, heading: HeadingLevel.HEADING_3 }));
      } else if (tag === 'blockquote') {
        paragraphs.push(
          new Paragraph({
            text,
            indent: { left: 720 },
            border: { left: { style: BorderStyle.SINGLE, size: 6, color: '888888' } },
          })
        );
      } else if (tag === 'ul' || tag === 'ol') {
        el.querySelectorAll('li').forEach((li, i) => {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(li.textContent || '')],
              bullet: tag === 'ul' ? { level: 0 } : undefined,
              numbering: tag === 'ol' ? { reference: 'default-numbering', level: 0 } : undefined,
            })
          );
        });
      } else if (tag === 'hr') {
        paragraphs.push(new Paragraph({ text: '', border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' } } }));
      } else if (tag === 'p' || tag === 'div' || !tag) {
        const runs: TextRun[] = [];
        el.childNodes?.forEach((child) => {
          const c = child as Element;
          const ct = c.tagName?.toLowerCase();
          const childContent = c.textContent || '';
          if (!childContent) return;
          runs.push(
            new TextRun({
              text: childContent,
              bold: ct === 'strong' || ct === 'b',
              italics: ct === 'em' || ct === 'i',
              underline: ct === 'u' ? {} : undefined,
              strike: ct === 's' || ct === 'strike',
            })
          );
        });
        if (runs.length > 0) {
          paragraphs.push(new Paragraph({ children: runs }));
        } else if (text.trim()) {
          paragraphs.push(new Paragraph({ text }));
        } else {
          paragraphs.push(new Paragraph({ text: '' }));
        }
      }
    };

    div.childNodes.forEach(processNode);
    return paragraphs.length > 0
      ? paragraphs
      : [new Paragraph({ text: stripHtml(html) })];
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({ text: '' }),
          ...parseHtmlToParagraphs(content),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${getFileName(title)}.docx`);
}

function exportAsDoc(title: string, content: string): void {
  const escRtf = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');

  const htmlToRtf = (html: string): string => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, t) => `\\pard\\sb240\\sa60\\b\\fs36 ${escRtf(t)}\\b0\\fs24\\par\n`)
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, t) => `\\pard\\sb200\\sa40\\b\\fs28 ${escRtf(t)}\\b0\\fs24\\par\n`)
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, t) => `\\pard\\sb160\\sa40\\b\\fs26 ${escRtf(t)}\\b0\\fs24\\par\n`)
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, t) => `\\b ${escRtf(t)}\\b0 `)
      .replace(/<b[^>]*>(.*?)<\/b>/gi, (_, t) => `\\b ${escRtf(t)}\\b0 `)
      .replace(/<em[^>]*>(.*?)<\/em>/gi, (_, t) => `\\i ${escRtf(t)}\\i0 `)
      .replace(/<i[^>]*>(.*?)<\/i>/gi, (_, t) => `\\i ${escRtf(t)}\\i0 `)
      .replace(/<u[^>]*>(.*?)<\/u>/gi, (_, t) => `\\ul ${escRtf(t)}\\ulnone `)
      .replace(/<s[^>]*>(.*?)<\/s>/gi, (_, t) => `\\strike ${escRtf(t)}\\strike0 `)
      .replace(/<code[^>]*>(.*?)<\/code>/gi, (_, t) => `\\f1 ${escRtf(t)}\\f0 `)
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, t) => `\\pard\\li720\\sb80\\sa80 ${escRtf(stripHtml(t))}\\par\n`)
      .replace(/<li[^>]*>(.*?)<\/li>/gi, (_, t) => `\\pard\\fi-360\\li720\\bullet\\tab ${escRtf(stripHtml(t))}\\par\n`)
      .replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, '')
      .replace(/<hr[^>]*>/gi, '\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gis, (_, t) => `\\pard\\sb60\\sa60 ${escRtf(stripHtml(t))}\\par\n`)
      .replace(/<br[^>]*>/gi, '\\line\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Georgia;}{\\f1 Courier New;}}
{\\colortbl ;\\red26\\green26\\blue26;}
\\cf1\\f0\\fs24\\sl360\\slmult1
\\pard\\sb240\\sa120\\b\\fs40 ${escRtf(title)}\\b0\\fs24\\par
\\pard\\sb60\\sa60 \\par
${htmlToRtf(content)}
}`;

  const blob = new Blob([rtfContent], { type: 'application/msword' });
  saveAs(blob, `${getFileName(title)}.doc`);
}

export async function exportNote(title: string, content: string, format: ExportFormat): Promise<void> {
  switch (format) {
    case 'pdf':
      exportAsPdf(title, content);
      break;
    case 'docx':
      await exportAsDocx(title, content);
      break;
    case 'doc':
      exportAsDoc(title, content);
      break;
    case 'html':
      exportAsHtml(title, content);
      break;
  }
}
