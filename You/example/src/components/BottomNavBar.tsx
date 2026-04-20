import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

export type AppTab = "home" | "reader" | "votd" | "search" | "profile";

interface TabItem {
  id: AppTab;
  label: string;
}

const TAB_ITEMS: TabItem[] = [
  { id: "home", label: "Home" },
  { id: "reader", label: "Reader" },
  { id: "votd", label: "Verse" },
  { id: "search", label: "Search" },
  { id: "profile", label: "Profile" },
];

interface BottomNavBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export function BottomNavBar({ activeTab, onSelectTab }: BottomNavBarProps) {
  const { colors, fonts } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: colors.border,
          backgroundColor: colors.bgSecondary,
        },
      ]}
    >
      {TAB_ITEMS.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectTab(tab.id)}
            style={[
              styles.item,
              selected && {
                backgroundColor: colors.accentBg,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text
              style={{
                color: selected ? colors.accent : colors.textSecondary,
                fontFamily: fonts.ui,
                fontSize: 13,
                fontWeight: selected ? "700" : "500",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  item: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});
