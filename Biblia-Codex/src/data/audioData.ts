/**
 * Dados de exemplo para áudios bíblicos
 * 
 * Este arquivo contém exemplos de como estruturar dados de áudio.
 * Em produção, esses dados devem vir de uma API ou banco de dados.
 */

import { AudioTrack } from '../services/audioService';

/**
 * Exemplo de faixas de áudio para Gênesis
 * Você pode adicionar seus próprios URLs de áudio aqui
 */
export const GENESIS_AUDIO_TRACKS: AudioTrack[] = [
  // Capítulo 1
  {
    id: 'gen-1-1',
    bookId: 'GEN',
    chapter: 1,
    verse: 1,
    url: 'https://example.com/audio/pt-br/genesis/01/001.mp3',
    duration: 45,
    language: 'pt-BR'
  },
  {
    id: 'gen-1-2',
    bookId: 'GEN',
    chapter: 1,
    verse: 2,
    url: 'https://example.com/audio/pt-br/genesis/01/002.mp3',
    duration: 38,
    language: 'pt-BR'
  },
  // Adicione mais versículos conforme necessário
];

/**
 * Exemplo de faixas de áudio para João 3:16
 */
export const JOHN_3_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'joh-3-16',
    bookId: 'JOH',
    chapter: 3,
    verse: 16,
    url: 'https://example.com/audio/pt-br/john/03/016.mp3',
    duration: 52,
    language: 'pt-BR'
  },
];

/**
 * Exemplo de faixas de áudio para Salmo 23
 */
export const PSALM_23_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'psa-23-1',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    url: 'https://example.com/audio/pt-br/psalm/23/001.mp3',
    duration: 60,
    language: 'pt-BR'
  },
  {
    id: 'psa-23-2',
    bookId: 'PSA',
    chapter: 23,
    verse: 2,
    url: 'https://example.com/audio/pt-br/psalm/23/002.mp3',
    duration: 55,
    language: 'pt-BR'
  },
  {
    id: 'psa-23-3',
    bookId: 'PSA',
    chapter: 23,
    verse: 3,
    url: 'https://example.com/audio/pt-br/psalm/23/003.mp3',
    duration: 58,
    language: 'pt-BR'
  },
];

/**
 * Mapa de todos os áudios disponíveis por livro e capítulo
 * Estrutura: { bookId: { chapter: [AudioTrack[]] } }
 */
export const AUDIO_LIBRARY: Record<string, Record<number, AudioTrack[]>> = {
  'GEN': {
    1: GENESIS_AUDIO_TRACKS,
  },
  'JOH': {
    3: JOHN_3_AUDIO_TRACKS,
  },
  'PSA': {
    23: PSALM_23_AUDIO_TRACKS,
  },
};

/**
 * Função para obter áudios de um livro e capítulo específico
 * @param bookId ID do livro (ex: 'GEN', 'JOH')
 * @param chapter Número do capítulo
 * @returns Array de AudioTrack ou array vazio se não houver áudios
 */
export function getAudioTracksForChapter(bookId: string, chapter: number): AudioTrack[] {
  return AUDIO_LIBRARY[bookId]?.[chapter] ?? [];
}

/**
 * Função para obter um áudio específico
 * @param trackId ID da faixa de áudio
 * @returns AudioTrack ou undefined se não encontrado
 */
export function getAudioTrackById(trackId: string): AudioTrack | undefined {
  for (const bookTracks of Object.values(AUDIO_LIBRARY)) {
    for (const chapterTracks of Object.values(bookTracks)) {
      const track = chapterTracks.find(t => t.id === trackId);
      if (track) return track;
    }
  }
  return undefined;
}

/**
 * Função para verificar se há áudio disponível para um livro e capítulo
 * @param bookId ID do livro
 * @param chapter Número do capítulo
 * @returns true se há áudio disponível
 */
export function hasAudioForChapter(bookId: string, chapter: number): boolean {
  return getAudioTracksForChapter(bookId, chapter).length > 0;
}

/**
 * Instruções para adicionar seus próprios áudios:
 * 
 * 1. Hospede seus arquivos de áudio em um servidor (AWS S3, Google Cloud Storage, etc.)
 * 
 * 2. Crie um objeto AudioTrack para cada versículo:
 *    {
 *      id: 'unique-id',
 *      bookId: 'BOOK_ID',
 *      chapter: 1,
 *      verse: 1,
 *      url: 'https://seu-servidor.com/audio/arquivo.mp3',
 *      duration: 45,
 *      language: 'pt-BR'
 *    }
 * 
 * 3. Adicione ao array apropriado (ex: GENESIS_AUDIO_TRACKS)
 * 
 * 4. Atualize o AUDIO_LIBRARY com os novos dados
 * 
 * 5. Ou, melhor ainda, carregue os dados de uma API:
 *    - Crie um endpoint que retorna áudios para um livro/capítulo
 *    - Modifique o App.tsx para chamar essa API
 *    - Passe os dados para ReaderWithAudio
 */
