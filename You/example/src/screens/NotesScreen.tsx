import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { TopBar } from "../components/TopBar";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface NotesScreenProps {
  onBack: () => void;
}

export function NotesScreen({ onBack }: NotesScreenProps) {
  const { colors, fonts, typography } = useTheme();
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([
    "Orar antes de começar a leitura de João 1.",
    "Revisar Salmo 1 e memorizar o versículo 2.",
  ]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar title="Study Notes" subtitle="Anotações pessoais" leftActionLabel="Back" onLeftActionPress={onBack} />
      <View style={styles.content}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escreva uma anotação..."
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
              color: colors.textPrimary,
              fontFamily: fonts.ui,
            },
          ]}
        />
        <Pressable
          onPress={() => {
            if (!draft.trim()) return;
            setNotes((current) => [draft.trim(), ...current]);
            setDraft("");
          }}
          style={[styles.button, { backgroundColor: colors.accentBg, borderColor: colors.accent }]}
        >
          <Text style={{ color: colors.accent, fontFamily: fonts.ui, fontWeight: "700" }}>Salvar nota</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {notes.map((note) => (
            <View key={note} style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: fonts.ui,
                  fontSize: typography.body.fontSize,
                  lineHeight: typography.body.lineHeight,
                }}
              >
                {note}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  button: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: "flex-start",
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
