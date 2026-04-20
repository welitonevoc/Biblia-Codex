import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { VerseCard } from "../components/VerseCard";
import { getVerseOfTheDay, searchVerses } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/tokens";

interface BookmarksScreenProps {
  onBack: () => void;
}

export function BookmarksScreen({ onBack }: BookmarksScreenProps) {
  const { colors, fonts } = useTheme();
  const bookmarks = [getVerseOfTheDay(), ...searchVerses("light").slice(0, 2)];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Bookmarks" subtitle="Versículos salvos" leftActionLabel="Back" onLeftActionPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.caption, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
          Seus destaques favoritos para revisão rápida.
        </Text>
        {bookmarks.map((item) => (
          <VerseCard
            key={`${item.bookId}-${item.chapter}-${item.number}`}
            verseNumber={item.number}
            verseText={item.text}
            reference={`${item.bookName} ${item.chapter}:${item.number}`}
          />
        ))}
      </ScrollView>
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
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
});
