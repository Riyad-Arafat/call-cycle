import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme } from "react-native-paper/src/core/theming";
import { ThemeBase } from "react-native-paper/src/types";
import useCachedResources from "@hooks/useCachedResources";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as nativeBar } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import GlobalProvider from "@context/Global";
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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
export default function Layout() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) return null;
  return (
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
  );
}
