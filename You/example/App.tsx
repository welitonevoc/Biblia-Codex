import { YouVersionPlatform } from "@youversion/platform-sdk-reactnative";
import { useEffect, useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

import { AppTab, BottomNavBar } from "./src/components/BottomNavBar";
import { LoadingScreen } from "./src/components/LoadingScreen";
import { BookmarksScreen } from "./src/screens/BookmarksScreen";
import { DevotionalScreen } from "./src/screens/DevotionalScreen";
import { HomeScreen, type AdvancedRoute } from "./src/screens/HomeScreen";
import { NotesScreen } from "./src/screens/NotesScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ReadingPlansScreen } from "./src/screens/ReadingPlansScreen";
import { ReaderScreen } from "./src/screens/ReaderScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { VotdScreen } from "./src/screens/VotdScreen";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

type AppRoute = AppTab | AdvancedRoute;

function RootApp() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("home");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const screen = useMemo(() => {
    if (currentRoute === "notes") {
      return <NotesScreen onBack={() => setCurrentRoute("home")} />;
    }
    if (currentRoute === "bookmarks") {
      return <BookmarksScreen onBack={() => setCurrentRoute("home")} />;
    }
    if (currentRoute === "devotional") {
      return <DevotionalScreen onBack={() => setCurrentRoute("home")} />;
    }
    if (currentRoute === "reading-plans") {
      return <ReadingPlansScreen onBack={() => setCurrentRoute("home")} />;
    }
    if (currentRoute === "settings") {
      return <SettingsScreen onBack={() => setCurrentRoute("home")} />;
    }
    if (currentRoute === "reader") return <ReaderScreen />;
    if (currentRoute === "votd") return <VotdScreen />;
    if (currentRoute === "search") return <SearchScreen />;
    if (currentRoute === "profile") return <ProfileScreen onOpenSettings={() => setCurrentRoute("settings")} />;
    return <HomeScreen onNavigate={(route) => setCurrentRoute(route)} />;
  }, [currentRoute]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.app, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.content}>{screen}</View>
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setCurrentRoute(tab);
        }}
      />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // Set app key at https://platform.youversion.com/
    YouVersionPlatform.configure("");
  }, []);

  return (
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
