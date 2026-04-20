import { ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { allThemes } from "../theme/themes";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { colors, fonts, typography, theme, setTheme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Settings" subtitle="Aparência e leitura" leftActionLabel="Back" onLeftActionPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              fontSize: typography.h4.fontSize,
              lineHeight: typography.h4.lineHeight,
              fontWeight: "600",
              marginBottom: spacing.sm,
            }}
          >
            Tema
          </Text>

          <View style={styles.grid}>
            {allThemes.map((option) => {
              const selected = option.id === theme.id;
              return (
                <Text
                  key={option.id}
                  onPress={() => setTheme(option)}
                  style={[
                    styles.pill,
                    {
                      color: selected ? colors.accent : colors.textSecondary,
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accentBg : colors.bgPrimary,
                      fontFamily: fonts.ui,
                    },
                  ]}
                >
                  {option.name}
                </Text>
              );
            })}
          </View>
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
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: "hidden",
  },
});
