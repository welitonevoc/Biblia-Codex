import { describe, it, expect } from 'vitest';
import { BookNumberConverter } from './BookNumberConverter';

describe('BookNumberConverter', () => {
  describe('toMyBible', () => {
    it('should convert Genesis (1) to MyBible ID 10', () => {
      expect(BookNumberConverter.toMyBible(1)).toBe(10);
    });

    it('should convert Exodus (2) to MyBible ID 20', () => {
      expect(BookNumberConverter.toMyBible(2)).toBe(20);
    });

    it('should convert Psalms (19) to MyBible ID 230', () => {
      expect(BookNumberConverter.toMyBible(19)).toBe(230);
    });

    it('should convert Matthew (40) to MyBible ID 470', () => {
      expect(BookNumberConverter.toMyBible(40)).toBe(470);
    });

    it('should convert Romans (45) to MyBible ID 520', () => {
      expect(BookNumberConverter.toMyBible(45)).toBe(520);
    });

    it('should convert Revelation (66) to MyBible ID 730', () => {
      expect(BookNumberConverter.toMyBible(66)).toBe(730);
    });

    it('should return 10 for invalid bookId < 1', () => {
      expect(BookNumberConverter.toMyBible(0)).toBe(10);
      expect(BookNumberConverter.toMyBible(-1)).toBe(10);
    });

    it('should return 10 for invalid bookId > 66', () => {
      expect(BookNumberConverter.toMyBible(67)).toBe(10);
      expect(BookNumberConverter.toMyBible(100)).toBe(10);
    });
  });

  describe('fromMyBible', () => {
    it('should convert MyBible ID 10 to Genesis (1)', () => {
      expect(BookNumberConverter.fromMyBible(10)).toBe(1);
    });

    it('should convert MyBible ID 230 to Psalms (19)', () => {
      expect(BookNumberConverter.fromMyBible(230)).toBe(19);
    });

    it('should convert MyBible ID 470 to Matthew (40)', () => {
      expect(BookNumberConverter.fromMyBible(470)).toBe(40);
    });

    it('should convert MyBible ID 730 to Revelation (66)', () => {
      expect(BookNumberConverter.fromMyBible(730)).toBe(66);
    });

    it('should return null for invalid MyBible ID', () => {
      expect(BookNumberConverter.fromMyBible(5)).toBeNull();
      expect(BookNumberConverter.fromMyBible(15)).toBeNull();
      expect(BookNumberConverter.fromMyBible(999)).toBeNull();
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain consistency for all valid book IDs', () => {
      for (let bookId = 1; bookId <= 66; bookId++) {
        const myBibleId = BookNumberConverter.toMyBible(bookId);
        const convertedBack = BookNumberConverter.fromMyBible(myBibleId);
        expect(convertedBack).toBe(bookId);
      }
    });
  });
});