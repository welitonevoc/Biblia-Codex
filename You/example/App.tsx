import { YouVersionPlatform } from "@youversion/platform-sdk-reactnative";
import { useEffect, useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

import { AppTab, BottomNavBar } from "./src/components/BottomNavBar";
import { LoadingScreen } from "./src/components/LoadingScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ReaderScreen } from "./src/screens/ReaderScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { VotdScreen } from "./src/screens/VotdScreen";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

function RootApp() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<AppTab>("reader");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const screen = useMemo(() => {
    if (activeTab === "votd") return <VotdScreen />;
    if (activeTab === "search") return <SearchScreen />;
    if (activeTab === "profile") return <ProfileScreen />;
    return <ReaderScreen />;
  }, [activeTab]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={[styles.app, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.content}>{screen}</View>
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />
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
