export interface Book {
  id: string;
  name: string;
  abbr: string;
  chapters: number;
  testament: 'old' | 'new';
}

export type BookId = string;
