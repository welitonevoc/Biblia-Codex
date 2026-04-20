import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface ReadingPlansScreenProps {
  onBack: () => void;
}

interface Plan {
  id: string;
  name: string;
  days: string;
  progress: number;
}

const PLANS: Plan[] = [
  { id: "gospel", name: "Evangelho de João", days: "21 dias", progress: 0.48 },
  { id: "wisdom", name: "Sabedoria em Provérbios", days: "30 dias", progress: 0.2 },
  { id: "psalms", name: "Salmos para Oração", days: "14 dias", progress: 0.74 },
];

export function ReadingPlansScreen({ onBack }: ReadingPlansScreenProps) {
  const { colors, fonts, typography } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Reading Plans" subtitle="Planos de leitura" leftActionLabel="Back" onLeftActionPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {PLANS.map((plan) => (
          <View key={plan.id} style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: fonts.heading,
                fontSize: typography.h4.fontSize,
                lineHeight: typography.h4.lineHeight,
                fontWeight: "600",
              }}
            >
              {plan.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.ui, marginTop: spacing.xs }}>
              {plan.days}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.bgPrimary, borderColor: colors.border }]}>
              <View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.round(plan.progress * 100)}%` }]} />
            </View>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.ui, marginTop: spacing.xs }}>
              {Math.round(plan.progress * 100)}% concluído
            </Text>
          </View>
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
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  track: {
    marginTop: spacing.md,
    height: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
});
