import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface StudyPanelProps {
  visible: boolean;
  verseReference: string;
  verseText: string;
  onClose: () => void;
}

const PROMPTS = [
  "O que esse texto revela sobre o caráter de Deus?",
  "Qual atitude prática posso viver hoje a partir deste versículo?",
  "Existe uma promessa para confiar ou uma decisão para obedecer?",
];

export function StudyPanel({ visible, verseReference, verseText, onClose }: StudyPanelProps) {
  const { colors, fonts, typography } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.bgSecondary, borderTopColor: colors.border }]}>
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
          Study Panel
        </Text>
        <Text style={[styles.reference, { color: colors.accent, fontFamily: fonts.ui }]}>{verseReference}</Text>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text
            style={[
              styles.verse,
              {
                color: colors.textPrimary,
                fontFamily: fonts.scripture,
                fontSize: typography.body.fontSize,
                lineHeight: typography.body.lineHeight,
              },
            ]}
          >
            {verseText}
          </Text>

          {PROMPTS.map((prompt) => (
            <View
              key={prompt}
              style={[styles.promptCard, { backgroundColor: colors.bgPrimary, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.ui }}>{prompt}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    minHeight: 360,
    maxHeight: "70%",
    borderTopWidth: 1,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontWeight: "600",
  },
  reference: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  scroll: {
    flexGrow: 0,
  },
  verse: {
    marginBottom: spacing.md,
  },
  promptCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
});
