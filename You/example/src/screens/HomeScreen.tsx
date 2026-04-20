import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

export type AdvancedRoute =
  | "notes"
  | "bookmarks"
  | "devotional"
  | "reading-plans"
  | "settings";

interface HomeScreenProps {
  onNavigate: (route: AdvancedRoute) => void;
}

const ITEMS: Array<{ route: AdvancedRoute; title: string; subtitle: string }> = [
  { route: "notes", title: "Study Notes", subtitle: "Anotações pessoais e insights" },
  { route: "bookmarks", title: "Bookmarks", subtitle: "Versículos salvos para revisão" },
  { route: "devotional", title: "Devotional", subtitle: "Reflexão guiada diária" },
  { route: "reading-plans", title: "Reading Plans", subtitle: "Planos com progresso" },
  { route: "settings", title: "Settings", subtitle: "Tema e preferências de leitura" },
];

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors, typography, fonts } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Home" subtitle="Biblia Codex" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            Jornada de Estudo
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
            Acesse as funcionalidades avançadas da Fase C.
          </Text>
        </View>

        {ITEMS.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => onNavigate(item.route)}
            style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: fonts.heading }]}>
              {item.title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
              {item.subtitle}
            </Text>
          </Pressable>
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
    padding: spacing.lg,
    gap: spacing.md,
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
    letterSpacing: 0.1,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "600",
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
  },
});
