import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { spacing } from "../theme/tokens";

interface TopBarProps {
  title: string;
  subtitle?: string;
  leftActionLabel?: string;
  rightActionLabel?: string;
  onLeftActionPress?: () => void;
  onRightActionPress?: () => void;
}

export function TopBar({
  title,
  subtitle,
  leftActionLabel,
  rightActionLabel,
  onLeftActionPress,
  onRightActionPress,
}: TopBarProps) {
  const { colors, typography, fonts } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.bgSecondary,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={onLeftActionPress}
        style={styles.action}
        disabled={!onLeftActionPress}
      >
        {leftActionLabel ? (
          <Text
            style={[
              styles.actionText,
              {
                color: colors.accent,
                fontFamily: fonts.ui,
              },
            ]}
          >
            {leftActionLabel}
          </Text>
        ) : null}
      </Pressable>

      <View style={styles.titleBlock}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontFamily: fonts.heading,
              fontSize: typography.h4.fontSize,
              lineHeight: typography.h4.lineHeight,
              fontWeight: typography.h4.fontWeight,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: fonts.ui,
                fontSize: typography.tiny.fontSize,
                lineHeight: typography.tiny.lineHeight,
              },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onRightActionPress}
        style={styles.action}
        disabled={!onRightActionPress}
      >
        {rightActionLabel ? (
          <Text
            style={[
              styles.actionText,
              {
                color: colors.accent,
                fontFamily: fonts.ui,
              },
            ]}
          >
            {rightActionLabel}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 72,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  action: {
    width: 72,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    marginTop: 2,
    textAlign: "center",
  },
});
