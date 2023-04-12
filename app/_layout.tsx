import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme } from "react-native-paper/src/core/theming";
import { ThemeBase } from "react-native-paper/src/types";
import useCachedResources from "@hooks/useCachedResources";
import * as SplashScreen from "expo-splash-screen";
import { View, StatusBar as nativeBar } from "react-native";
const GlobalProvider = React.lazy(() => import("@context/Global"));
const PaperProvider = React.lazy(
  () => import("react-native-paper/src/core/Provider")
);

export const theme: ThemeBase & {
  [key: string]: any;
  colors: {
    [key: string]: any;
  };
} = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#ff0000",
  },
};

import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native-paper";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
export default function Layout() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) return null;
  return (
    <React.Suspense
      fallback={
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#ff0000" />
        </View>
      }
    >
      <SafeAreaProvider
        focusable
        style={{
          marginTop: nativeBar.currentHeight,
        }}
      >
        <GlobalProvider>
          <PaperProvider theme={theme}>
            <Stack />
          </PaperProvider>
          <StatusBar backgroundColor="black" />
        </GlobalProvider>
      </SafeAreaProvider>
    </React.Suspense>
  );
}
