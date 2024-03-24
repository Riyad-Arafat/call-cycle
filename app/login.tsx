import React, { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Title, TextInput } from "react-native-paper";
import { login, saveUser } from "@apis/index";
import { Stack, router } from "expo-router";
import Button from "react-native-paper/src/components/Button/Button";
import {
  PhoneNumberInput,
  getCountryByCode,
} from "react-native-paper-phone-number-input";

import parsePhoneNumber, { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "@hooks/useTranslation";

const Login = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<string>("EG"); // Default country code
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleLogin = useCallback(async () => {
    const { dialCode } = getCountryByCode(countryCode); // Get country details
    const phoneWithCode = `${dialCode}${phoneNumber}`;

    try {
      setIsLoading(true);
      const parsedPhoneNumber = parsePhoneNumber(phoneWithCode);
      if (!isValidPhoneNumber(phoneNumber, parsedPhoneNumber.country)) {
        throw new Error("ًWrongPhoneNumber");
      }

      const user = await login(phoneWithCode, password);

      if (user) {
        await saveUser(user);
        router.navigate("/app");
      } else {
        throw new Error("LoginFailed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        t("ERROR"),
        t(getErrorMessages(error?.message)) || t("unKnownError")
      );
    } finally {
      console.log("Done");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, phoneNumber, password]);

  useEffect(() => {
    if (phoneNumber && password) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [phoneNumber, password]);

  return (
    <>
      <Stack.Screen options={{ header: () => null }} />
      <View
        style={{
          padding: 16,
          backgroundColor: "#f5f5f5",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Title
          style={{
            marginBottom: 20,
            textAlign: "center",
            fontSize: 24,
          }}
        >
          {t("LOGIN")}
        </Title>

        <PhoneNumberInput
          label={t("PHONE_NUMBER")}
          code={countryCode}
          setCode={setCountryCode}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
        />

        <TextInput
          label={t("PASSWORD")}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={{ marginVertical: 20 }}
        />

        <View
          style={{
            marginBottom: 20,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button
            mode="contained"
            onPress={handleLogin}
            style={{ padding: 10, borderRadius: 25 }}
            disabled={isDisabled}
            loading={isLoading}
          >
            {t("LOGIN")}
          </Button>

          <Button onPress={() => router.navigate("/signup")} mode="text">
            {t("NO_ACCOUNT")}
          </Button>
        </View>
      </View>
    </>
  );
};

export default Login;

const getErrorMessages = (error: string) => {
  if (error.includes("phone_number") || error.includes("ًWrongPhoneNumber")) {
    return "ًWrongPhoneNumber";
  }
  if (error.includes("password") || error.includes("ًWrongPassword")) {
    return "ًWrongPassword";
  }
  if (error.includes("LoginFailed")) {
    return "LoginFailed";
  }

  return error || "unKnownError";
};
