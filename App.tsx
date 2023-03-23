import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DefaultTheme,
  Provider as PaperProvider,
  ThemeBase,
} from "react-native-paper";
import useCachedResources from "./src/hooks/useCachedResources";
import Navigation from "./src/navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as nativeBar } from "react-native";
import GlobalProvider from "./src/context/Global";

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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
export default function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider
        focusable
        style={{
          marginTop: nativeBar.currentHeight,
        }}
      >
        <GlobalProvider>
          <PaperProvider theme={theme}>
            <Navigation />
          </PaperProvider>
          <StatusBar backgroundColor="black" />
        </GlobalProvider>
      </SafeAreaProvider>
    );
  }
}
