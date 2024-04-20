import React, { useEffect } from "react";
import { StyleSheet, ImageBackground } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { useTranslation } from "@hooks/useTranslation";
import { router } from "expo-router";
import i18n from "i18next"; // Make sure to import i18n

import CallManager, { ReplaceDialer } from "react-native-call-manager";
import { getCallPermission } from "@utils/index";
import OngoingCallScreen from "@screens/OngoingCallScreen";

const WelcomeScreen: React.FC = () => {
  const { t } = useTranslation();

  const changeLanguage = () => {
    const currentLanguage = i18n.language;
    const lng = currentLanguage === "en" ? "ar" : "en";
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    getCallPermission();
    let tReplaceDialer = new ReplaceDialer();

    tReplaceDialer.isDefaultDialer((data) => {
      if (data) console.log("Is ALREADY default dialer.");
      else {
        console.log("Is NOT default dialer, try to set.");
        tReplaceDialer.setDefaultDialer((data) => {
          if (data) {
            console.log("Default dialer sucessfully set.");
          } else {
            console.log("Default dialer NOT set");
          }
        });
      }
    });
  }, []);

  return (
    <ImageBackground
      // source={require("./path-to-your-background-image.png")} // Update with the actual path
      style={styles.container}
      resizeMode="cover" // Cover the entire screen
    >
      <Text style={styles.title}>{t("WELCOME")}</Text>
      <Button
        mode="contained"
        onPress={() => router.navigate("/app")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {t("GET_STARTED")}
      </Button>
      <Button
        mode="text"
        onPress={() => changeLanguage()}
        style={styles.buttonToggle}
      >
        {t("CHANGE_LANGUAGE_TO", {
          target: i18n.language === "en" ? "Arabic" : "الإنجليزية",
        })}
      </Button>
    </ImageBackground>
  );
};
export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Add some padding if needed
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: "#333", // Ensure the text color contrasts well with the background
  },
  button: {
    backgroundColor: "#007bff", // Ensure the button color contrasts well with the background
    paddingHorizontal: 30,
    paddingVertical: 10,
    width: "100%",
  },
  buttonLabel: {
    color: "#fff",
  },

  buttonToggle: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
    width: "100%",
  },
});
