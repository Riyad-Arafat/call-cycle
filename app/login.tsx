import React, { useState } from "react";
import { View } from "react-native";
import {
  Button,
  TextInput,
  Title,
  ActivityIndicator,
} from "react-native-paper";
import { login, saveUser } from "@apis/index";
import useGlobal from "@hooks/useGlobal";
import { router } from "expo-router";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useGlobal();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log(`Phone Number ${phoneNumber}, Password: ${password}`);
      const user = await login(phoneNumber, password);

      if (user) {
        await saveUser(user);
        setUser(user as any);
        router.navigate("/contactas");
      }
      // Handle login logic here
      // If login is successful, set isLoggedIn to true
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          color: "#6200ee",
        }}
      >
        Login
      </Title>
      <TextInput
        label="Phone Number"
        mode="outlined"
        keyboardType="phone-pad"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        style={{ marginBottom: 10, backgroundColor: "white" }}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={{ marginBottom: 20, backgroundColor: "white" }}
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={{ padding: 10, borderRadius: 25 }}
      >
        {isLoading ? (
          <ActivityIndicator animating={true} color={"white"} />
        ) : (
          "Login"
        )}
      </Button>
    </View>
  );
};

export default Login;
