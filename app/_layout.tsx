import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme } from "react-native-paper/src/core/theming";
import { ThemeBase } from "react-native-paper/src/types";
import useCachedResources from "@hooks/useCachedResources";
import { StatusBar as nativeBar } from "react-native";
import {
  Provider as PaperProvider,
  MD2Colors as Colors,
} from "react-native-paper";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Stack } from "expo-router";
import { SessionProvider } from "@context/Session";
import ArTranslation from "@i18n/ar/translation";
import EnTranslation from "@i18n/en/translation";
import "intl-pluralrules";

export const theme: ThemeBase & {
  [key: string]: any;
  colors: {
    [key: string]: any;
  };
} = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.lightBlue900,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      ar: {
        translation: ArTranslation,
      },
      en: {
        translation: EnTranslation,
      },
    },
    lng: "ar", // if you're using a language detector, do not define the lng option
  });

export default function Layout() {
  const { isLoadingComplete } = useCachedResources();

  return (
    <SafeAreaProvider
      focusable
      style={{
        marginTop: nativeBar.currentHeight,
      }}
    >
      {
        // eslint-disable-next-line react-native/no-inline-styles
        !isLoadingComplete ? (
          <></>
        ) : (
          <PaperProvider theme={theme}>
            <SessionProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar backgroundColor="black" />
            </SessionProvider>
          </PaperProvider>
        )
      }
    </SafeAreaProvider>
  );
}
