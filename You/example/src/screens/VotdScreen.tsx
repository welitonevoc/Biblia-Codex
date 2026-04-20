import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { VerseCard } from "../components/VerseCard";
import { getVerseOfTheDay } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

export function VotdScreen() {
  const { colors, typography, fonts } = useTheme();
  const verse = useMemo(() => getVerseOfTheDay(), []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Verse of the Day" subtitle="Daily devotion" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <VerseCard
          verseNumber={verse.number}
          verseText={verse.text}
          reference={`${verse.bookName} ${verse.chapter}:${verse.number}`}
        />

        <View style={[styles.panel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text
            style={[
              styles.panelTitle,
              {
                color: colors.textPrimary,
                fontFamily: fonts.heading,
                fontSize: typography.h4.fontSize,
                lineHeight: typography.h4.lineHeight,
              },
            ]}
          >
            Reflection
          </Text>
          <Text
            style={[
              styles.panelBody,
              {
                color: colors.textSecondary,
                fontFamily: fonts.ui,
                fontSize: typography.body.fontSize,
                lineHeight: typography.body.lineHeight,
              },
            ]}
          >
            Read this verse slowly three times and ask: What is God inviting me to trust today?
          </Text>
        </View>
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
    gap: spacing.lg,
  },
  panel: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  panelTitle: {
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  panelBody: {
    letterSpacing: 0.1,
  },
});
