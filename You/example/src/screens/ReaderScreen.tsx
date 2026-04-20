import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ChapterNavigator } from "../components/ChapterNavigator";
import { StudyPanel } from "../components/StudyPanel";
import { TopBar } from "../components/TopBar";
import { VerseCard } from "../components/VerseCard";
import { getBooks, getChapterVerses } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/tokens";

export function ReaderScreen() {
  const { colors } = useTheme();
  const books = useMemo(() => getBooks(), []);
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0].id);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showStudyPanel, setShowStudyPanel] = useState(false);

  const book = books.find((candidate) => candidate.id === selectedBookId) ?? books[0];
  const verses = getChapterVerses(selectedBookId, selectedChapter);
  const focusVerse = verses[0];
  const reference = `${book.name} ${selectedChapter}:${focusVerse?.number ?? 1}`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar
        title={`${book.name} ${selectedChapter}`}
        subtitle="Biblia Codex Reader"
        leftActionLabel="Study"
        onLeftActionPress={() => setShowStudyPanel(true)}
        rightActionLabel="Chapters"
        onRightActionPress={() => setShowNavigator(true)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {verses.map((verse) => (
          <VerseCard
            key={verse.number}
            verseNumber={verse.number}
            verseText={verse.text}
            reference={`${book.name} ${selectedChapter}:${verse.number}`}
          />
        ))}
      </ScrollView>

      <ChapterNavigator
        visible={showNavigator}
        books={books}
        selectedBookId={selectedBookId}
        selectedChapter={selectedChapter}
        onClose={() => setShowNavigator(false)}
        onSelectBook={(bookId) => {
          setSelectedBookId(bookId);
          setSelectedChapter(1);
        }}
        onSelectChapter={(chapter) => {
          setSelectedChapter(chapter);
          setShowNavigator(false);
        }}
      />

      {focusVerse ? (
        <StudyPanel
          visible={showStudyPanel}
          verseReference={reference}
          verseText={focusVerse.text}
          onClose={() => setShowStudyPanel(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
});
