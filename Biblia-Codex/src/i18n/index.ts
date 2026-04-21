import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/common.json';
import reader from './locales/reader.json';

export const resources = {
  pt: {
    translation: {
      ...common,
      ...reader,
    },
  },
  en: {
    translation: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      forward: 'Forward',
      close: 'Close',
      search: 'Search',
      searchPlaceholder: 'Type to search...',
      noResults: 'No results found',
      offline: 'You are offline',
      online: 'Connection restored',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      version: 'Version',
      language: 'Language',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      confirm: 'Confirm',
      warning: 'Warning',
      info: 'Information',
      success: 'Success',
      chapter: 'Chapter',
      verse: 'Verse',
      verses: 'Verses',
      books: 'Books',
      oldTestament: 'Old Testament',
      newTestament: 'New Testament',
      previousChapter: 'Previous chapter',
      nextChapter: 'Next chapter',
      selectBook: 'Select book',
      selectChapter: 'Select chapter',
      fontSize: 'Font size',
      fontFamily: 'Font family',
      lineHeight: 'Line height',
      showVerseNumbers: 'Show verse numbers',
      showRedLetters: 'Show words of Jesus in red',
      paragraphMode: 'Paragraph mode',
      bookmarks: 'Bookmarks',
      notes: 'Notes',
      addBookmark: 'Add bookmark',
      addNote: 'Add note',
      noBookmarks: 'No bookmarks',
      noNotes: 'No notes',
    },
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

export const changeLanguage = (lng: 'pt' | 'en') => {
  i18n.changeLanguage(lng);
};