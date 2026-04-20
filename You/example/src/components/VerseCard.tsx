import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface VerseCardProps {
  verseNumber: number;
  verseText: string;
  reference?: string;
}

export function VerseCard({ verseNumber, verseText, reference }: VerseCardProps) {
  const { colors, typography, fonts, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border,
          shadowColor: isDark ? "#000000" : colors.accent,
        },
      ]}
    >
      <Text
        style={[
          styles.number,
          {
            color: colors.accent,
            fontFamily: fonts.ui,
            fontSize: typography.verseNumber.fontSize,
            lineHeight: typography.verseNumber.lineHeight,
            fontWeight: typography.verseNumber.fontWeight,
          },
        ]}
      >
        {verseNumber}
      </Text>
      <Text
        style={[
          styles.text,
          {
            color: colors.textPrimary,
            fontFamily: fonts.scripture,
            fontSize: typography.bodyLarge.fontSize,
            lineHeight: typography.bodyLarge.lineHeight,
          },
        ]}
      >
        {verseText}
      </Text>
      {reference ? (
        <Text
          style={[
            styles.reference,
            {
              color: colors.textSecondary,
              fontFamily: fonts.ui,
            },
          ]}
        >
          {reference}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  number: {
    marginBottom: spacing.sm,
  },
  text: {
    letterSpacing: 0.2,
  },
  reference: {
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
