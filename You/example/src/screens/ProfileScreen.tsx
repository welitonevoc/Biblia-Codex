import {
  SignInWithYouVersionButton,
  YouVersionAPI,
  YouVersionPlatform,
  YouVersionUserInfo,
} from "@youversion/platform-sdk-reactnative";
import { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TopBar } from "../components/TopBar";
import { allThemes } from "../theme/themes";
import { useTheme } from "../theme/ThemeContext";
import { borderRadius, spacing } from "../theme/tokens";

interface ProfileScreenProps {
  onOpenSettings?: () => void;
}

export function ProfileScreen({ onOpenSettings }: ProfileScreenProps) {
  const { colors, typography, fonts, theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<YouVersionUserInfo>();
  const [loading, setLoading] = useState<boolean>(
    () => !!YouVersionPlatform.getAccessToken(),
  );

  useLayoutEffect(() => {
    const accessToken = YouVersionPlatform.getAccessToken();
    if (!accessToken) return;

    async function fetchUserInfo() {
      try {
        const userInfo = await YouVersionAPI.Users.userInfo();
        setCurrentUser(userInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  async function handleSignIn() {
    try {
      const signInResult = await YouVersionAPI.Users.signIn([
        "email",
        "profile",
        "openid",
      ]);
      console.log("Sign-in result:", JSON.stringify(signInResult, null, 2));
    } catch (error) {
      Alert.alert("Error signing in");
      console.error("Error signing in:", error);
      return;
    }

    try {
      const userInfo = await YouVersionAPI.Users.userInfo();
      setCurrentUser(userInfo);
    } catch (error) {
      Alert.alert("Error getting user info after sign-in");
      console.error("Error getting user info:", error);
    }
  }

  function handleSignOut() {
    setCurrentUser(undefined);
    YouVersionAPI.Users.signOut();
  }

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bgPrimary }]}>
      <TopBar
        title="Profile"
        subtitle="Account and appearance"
        rightActionLabel="Settings"
        onRightActionPress={onOpenSettings}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.panel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          {currentUser ? (
            <>
              <Image source={{ uri: currentUser.profilePicture }} style={styles.avatar} />
              <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.heading }]}>
                {currentUser.name || "No name"}
              </Text>
              <Text style={[styles.email, { color: colors.textSecondary, fontFamily: fonts.ui }]}>
                {currentUser.email || "No email"}
              </Text>
              <Pressable
                onPress={handleSignOut}
                style={[styles.button, { backgroundColor: colors.accentBg, borderColor: colors.accent }]}
              >
                <Text style={{ color: colors.accent, fontFamily: fonts.ui, fontWeight: "700" }}>
                  Sign out
                </Text>
              </Pressable>
            </>
          ) : (
            <SignInWithYouVersionButton onPress={handleSignIn} />
          )}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: fonts.heading,
                fontSize: typography.h4.fontSize,
                lineHeight: typography.h4.lineHeight,
              },
            ]}
          >
            Themes
          </Text>
          <View style={styles.themeGrid}>
            {allThemes.slice(0, 8).map((option) => {
              const selected = theme.id === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setTheme(option)}
                  style={[
                    styles.themePill,
                    {
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accentBg : colors.bgPrimary,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? colors.accent : colors.textSecondary, fontFamily: fonts.ui }}>
                    {option.name}
                  </Text>
                </Pressable>
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
    gap: spacing.lg,
  },
  panel: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: spacing.md,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },
  email: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    width: "100%",
  },
  themePill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
