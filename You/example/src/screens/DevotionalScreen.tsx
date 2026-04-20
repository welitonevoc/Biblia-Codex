import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { VerseCard } from "../components/VerseCard";
import { getVerseOfTheDay } from "../data/bible";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface DevotionalScreenProps {
  onBack: () => void;
}

export function DevotionalScreen({ onBack }: DevotionalScreenProps) {
  const { colors, fonts, typography } = useTheme();
  const verse = getVerseOfTheDay();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Devotional" subtitle="Momento de reflexão" leftActionLabel="Back" onLeftActionPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <VerseCard
          verseNumber={verse.number}
          verseText={verse.text}
          reference={`${verse.bookName} ${verse.chapter}:${verse.number}`}
        />

        <View style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: fonts.heading,
                fontSize: typography.h4.fontSize,
                lineHeight: typography.h4.lineHeight,
              },
            ]}
          >
            Prática do Dia
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
            1. Leia o texto em voz baixa.
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
            2. Ore por alguém específico.
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
            3. Escreva uma aplicação simples para hoje.
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
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  title: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});
