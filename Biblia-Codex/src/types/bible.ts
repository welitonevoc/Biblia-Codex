import type { Book } from './book';
import type { Verse } from './verse';

export interface Bible {
  books: Book[];
  verses: Verse[];
}

export type { Book } from './book';
export type { Verse } from './verse';
