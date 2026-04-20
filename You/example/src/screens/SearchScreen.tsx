import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { VerseCard } from "../components/VerseCard";
import { searchVerses } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

export function SearchScreen() {
  const { colors, typography, fonts } = useTheme();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchVerses(query).slice(0, 12), [query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Search" subtitle="Find verses by words" />

      <View style={styles.content}>
        <TextInput
          placeholder="Search scripture..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              fontFamily: fonts.ui,
            },
          ]}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
          {query.length === 0 ? (
            <Text
              style={[
                styles.helperText,
                {
                  color: colors.textSecondary,
                  fontFamily: fonts.ui,
                  fontSize: typography.bodySmall.fontSize,
                  lineHeight: typography.bodySmall.lineHeight,
                },
              ]}
            >
              Try words like light, trust, blessed, beginning.
            </Text>
          ) : null}

          {query.length > 0 && results.length === 0 ? (
            <Text
              style={[
                styles.helperText,
                {
                  color: colors.textSecondary,
                  fontFamily: fonts.ui,
                  fontSize: typography.bodySmall.fontSize,
                  lineHeight: typography.bodySmall.lineHeight,
                },
              ]}
            >
              No verses found for "{query}".
            </Text>
          ) : null}

          {results.map((result) => (
            <VerseCard
              key={`${result.bookId}-${result.chapter}-${result.number}`}
              verseNumber={result.number}
              verseText={result.text}
              reference={`${result.bookName} ${result.chapter}:${result.number}`}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  results: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  helperText: {
    marginTop: spacing.md,
  },
});
