/**
 * Converter para numeração de livros MyBible (PalmBible+)
 * Baseado no domínio oficial do Bible App.
 */
export const BookNumberConverter = {
  /**
   * Converte ID padrão (1-66) para ID MyBible (10-730)
   */
  toMyBible: (bookId: number): number => {
    if (bookId < 1 || bookId > 66) return 10;
    
    // Antigo Testamento
    if (bookId <= 16) return bookId * 10;
    if (bookId === 17) return 190; // Ester
    if (bookId === 18) return 220; // Jó
    if (bookId === 19) return 230; // Salmos
    if (bookId === 20) return 240; // Provérbios
    if (bookId === 21) return 250; // Eclesiastes
    if (bookId === 22) return 260; // Cânticos
    if (bookId === 23) return 290; // Isaías
    if (bookId === 24) return 300; // Jeremias
    if (bookId === 25) return 310; // Lamentações
    if (bookId === 26) return 330; // Ezequiel
    if (bookId === 27) return 340; // Daniel
    if (bookId === 28) return 350; // Oseias
    if (bookId === 29) return 360; // Joel
    if (bookId === 30) return 370; // Amós
    if (bookId === 31) return 380; // Obadias
    if (bookId === 32) return 390; // Jonas
    if (bookId === 33) return 400; // Miqueias
    if (bookId === 34) return 410; // Naum
    if (bookId === 35) return 420; // Habacuque
    if (bookId === 36) return 430; // Sofonias
    if (bookId === 37) return 440; // Ageu
    if (bookId === 38) return 450; // Zacarias
    if (bookId === 39) return 460; // Malaquias
    
    // Novo Testamento
    // 40 (Mateus) -> 470, 41 (Marcos) -> 480, ...
    return 470 + (bookId - 40) * 10;
  },

  /**
   * Converte ID MyBible (10-730) para ID padrÃ£o (1-66)
   */
  fromMyBible: (myBibleId: number): number | null => {
    const map: Record<number, number> = {
      10: 1, 20: 2, 30: 3, 40: 4, 50: 5, 60: 6, 70: 7, 80: 8, 90: 9, 100: 10,
      110: 11, 120: 12, 130: 13, 140: 14, 150: 15, 160: 16, 190: 17, 220: 18,
      230: 19, 240: 20, 250: 21, 260: 22, 290: 23, 300: 24, 310: 25, 330: 26,
      340: 27, 350: 28, 360: 29, 370: 30, 380: 31, 390: 32, 400: 33, 410: 34,
      420: 35, 430: 36, 440: 37, 450: 38, 460: 39, 470: 40, 480: 41, 490: 42,
      500: 43, 510: 44, 520: 45, 530: 46, 540: 47, 550: 48, 560: 49, 570: 50,
      580: 51, 590: 52, 600: 53, 610: 54, 620: 55, 630: 56, 640: 57, 650: 58,
      660: 59, 670: 60, 680: 61, 690: 62, 700: 63, 710: 64, 720: 65, 730: 66,
    };

    return map[myBibleId] ?? null;
  }
};
