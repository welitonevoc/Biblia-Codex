import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/tokens";

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({
  label = "Preparing your reading journey...",
}: LoadingScreenProps) {
  const { colors, typography, fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontFamily: fonts.ui,
            fontSize: typography.bodySmall.fontSize,
            lineHeight: typography.bodySmall.lineHeight,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
