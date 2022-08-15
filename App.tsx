import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import useCachedResources from "./src/hooks/useCachedResources";
import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar as nativeBar } from "react-native";
import GlobalProvider from "./src/context/Global";

export const theme: ReactNativePaper.Theme & {
  [key: string]: any;
  colors: {
    [key: string]: string;
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
  const colorScheme = useColorScheme();

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
            <Navigation colorScheme={colorScheme} />
          </PaperProvider>
          <StatusBar backgroundColor="black" />
        </GlobalProvider>
      </SafeAreaProvider>
    );
  }
}
