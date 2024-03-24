import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";
import Button from "react-native-paper/src/components/Button/Button";
import {
  PhoneNumberInput,
  getCountryByCode,
} from "react-native-paper-phone-number-input";
import { register, saveUser } from "@apis/index";
import { useTranslation } from "@hooks/useTranslation";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

const SignupScreen = () => {
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [countryCode, setCountryCode] = useState<string>("EG"); // Default country code
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleSignup = useCallback(async () => {
    const [firstName, ...restName] = fullName.split(" ");
    const lastName = restName.join(" ");

    const { dialCode } = getCountryByCode(countryCode); // Get country details
    const phoneWithCode = `${dialCode}${phoneNumber}`;

    const parsedPhoneNumber = parsePhoneNumber(phoneWithCode);

    if (fullName.replace(/\s/g, "").length < 3) {
      Alert.alert(t("ERROR"), t("ًWrongNameRoles"));
      return;
    }

    if (!isValidPhoneNumber(phoneNumber, parsedPhoneNumber.country)) {
      Alert.alert(t("ERROR"), t("ًWrongPhoneNumber"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("ERROR"), t("ًWrongPasswordRoles"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("ERROR"), t("ًWrongPasswordConfirmation"));
      return;
    }

    if (!phoneNumber) {
      Alert.alert(t("ERROR"), t("ًWrongPhoneNumberRoles"));
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await register({
        firstName,
        lastName,
        phoneNumber: phoneWithCode,
        password,
      });
      if (user) {
        await saveUser(user);
        setTimeout(() => {
          router.navigate("/app");
        }, 3000);
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        t(getErrorMessages(error?.message)) || t("unKnownError")
      );
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, password, confirmPassword, countryCode, phoneNumber]);

  useEffect(() => {
    if (fullName && password && confirmPassword && phoneNumber) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [fullName, password, confirmPassword, phoneNumber]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t("BACK_TO_LOGIN"),
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>{t("SIGNUP TO THE APP")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("NAME")}
            value={fullName}
            onChangeText={setFullName}
          />

          <PhoneNumberInput
            style={styles.input}
            code={countryCode}
            setCode={setCountryCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            label={t("PHONE_NUMBER")}
          />
          <TextInput
            style={styles.input}
            placeholder={t("PASSWORD")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder={t("CONFIRM_PASSWORD")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button
            mode="contained"
            style={styles.button}
            onPress={handleSignup}
            loading={isSubmitting}
            disabled={isSubmitting || isDisabled}
          >
            {t("SIGNUP")}
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: "30%",
    padding: 16,
    backgroundColor: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },

  button: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});

export default SignupScreen;

const getErrorMessages = (error: string) => {
  if (error.includes("duplicate") && error.includes("phone_number")) {
    return "Phone_number_already_exists";
  }
  return error || "An error occurred";
};
