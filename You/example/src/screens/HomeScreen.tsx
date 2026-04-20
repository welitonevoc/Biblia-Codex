import { StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

export function HomeScreen() {
  const { colors, typography, fonts } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Home" subtitle="Biblia Codex" />
      <View style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              fontSize: typography.h3.fontSize,
              lineHeight: typography.h3.lineHeight,
            },
          ]}
        >
          Welcome
        </Text>
        <Text
          style={[
            styles.body,
            {
              color: colors.textSecondary,
              fontFamily: fonts.ui,
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
            },
          ]}
        >
          This screen is reserved for the premium home timeline in Phase C.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  title: {
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  body: {
    letterSpacing: 0.1,
  },
});
