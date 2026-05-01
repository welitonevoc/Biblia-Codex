/**
 * Remove tags técnicas do MySword/Strong e marcações HTML/XML
 * @param text O texto original com tags
 * @returns Texto limpo e legível
 */
export const stripTags = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<TS\d*>.*?<Ts>/gi, '') // Remove títulos internos do MySword
    .replace(/<[^>]+>/g, '')         // Remove todas as outras tags HTML/XML
    .replace(/\{.*?\}/g, '')         // Remove conteúdo entre chaves {}
    .replace(/\s+/g, ' ')            // Normaliza espaços múltiplos
    .trim();
};
