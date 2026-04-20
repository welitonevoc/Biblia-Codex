import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { BibleBook } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface ChapterNavigatorProps {
  visible: boolean;
  books: BibleBook[];
  selectedBookId: string;
  selectedChapter: number;
  onClose: () => void;
  onSelectBook: (bookId: string) => void;
  onSelectChapter: (chapter: number) => void;
}

export function ChapterNavigator({
  visible,
  books,
  selectedBookId,
  selectedChapter,
  onClose,
  onSelectBook,
  onSelectChapter,
}: ChapterNavigatorProps) {
  const { colors, fonts } = useTheme();

  const activeBook = books.find((book) => book.id === selectedBookId) ?? books[0];
  const chapters = Array.from({ length: activeBook.chapters }, (_, i) => i + 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      />
      <View style={[styles.sheet, { backgroundColor: colors.bgSecondary }]}>
        <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: fonts.heading }]}>
          Navigate
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
          {books.map((book) => {
            const selected = book.id === selectedBookId;
            return (
              <Pressable
                key={book.id}
                onPress={() => onSelectBook(book.id)}
                style={[
                  styles.bookPill,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.accentBg : colors.bgPrimary,
                  },
                ]}
              >
                <Text style={{ color: selected ? colors.accent : colors.textSecondary, fontFamily: fonts.ui, fontWeight: "600" }}>
                  {book.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.chapterGrid}>
          {chapters.map((chapter) => {
            const selected = chapter === selectedChapter;
            return (
              <Pressable
                key={chapter}
                onPress={() => onSelectChapter(chapter)}
                style={[
                  styles.chapterCell,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.accentBg : colors.bgPrimary,
                  },
                ]}
              >
                <Text style={{ color: selected ? colors.accent : colors.textPrimary, fontFamily: fonts.ui, fontWeight: "700" }}>
                  {chapter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 360,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  bookRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
  bookPill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chapterCell: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
